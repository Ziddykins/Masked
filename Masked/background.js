console.log("loaded background.js");

let storage_data = {
    lists: {
        regexes: [],
        secrets: [],
    },
    options: {
        enable_regexes: true,
        enable_secrets: true,
        id_in_regex: false,
        mask_emails: false,
        mask_style: 0
    }
};

function handle_ctx_menus() {
    browser.contextMenus.create({
        id: "ctx_masked",
        title: "\x1F[ Masked 🥸]",
        contexts: ["action"]
    });

    browser.contextMenus.create({
            id: "ctx_regex_matching",
            title: "Enable Regex Matching",
            contexts: ["action"]
            //onclick: enable_regexes()
    });

    browser.contextMenus.create({
            id: "ctx_secret_matching",
            title: "Enable Secret Matching",
            contexts: ["action"]
            //onclick: enable_secrets()
    });
}

function handle_install() {
    console.log("Extension installed");

    const all_promises = [
        fetch(browser.runtime.getURL('Masked/resources/regexes.txt'))
            .then(response => response.text())
            .then(data => {
                storage_data.lists.regexes = data.split('\n');
            }
        ).catch((error) =>
            console.error(error)
        ),

        fetch(browser.runtime.getURL('Masked/resources/secrets.txt'))
            .then(response => response.text())
            .then(data => {
                storage_data.lists.secrets = data.split('\n');
                console.log("background.js: loaded secrets");
            }
        ).catch((error) => {
            console.error(error)
        })
    ];

    Promise.all(all_promises).then(() => {
        console.log("background.js: all fetches complete, adding initial storage data");
        browser.storage.local.set({masked_data: storage_data});
    }).catch((error) => {
        console.error(error);
    });

    handle_ctx_menus();
}

browser.runtime.onInstalled.addListener(handle_install);

browser.runtime.onMessage.addListener(function(message, sender, senderResponse) {
    browser.storage.local.get()
        .then((response) => {
            storage_data = response.storage_data;
            console.log(`background.js: in regexes, got back data: ${response}`);
        }).catch((error) => {
            console.error(`background.js: ${error}`);
        }
    );

    if (message.masked_cmd == "get_lists") {
        console.log(message);
        console.log(sender);

        if (message.sender == "masked.js" && sender.tab.active == true) {
            let tab_id = sender.tab.id;
            const reply_msg = browser.tabs.sendMessage(tab_id, storage_data);

            reply_msg.then((response) => {
                console.log(`background.js: got response from tab ${tab_id}: ${response}`);
            }).catch((error) => {
                console.error(`background.js: ${error}`);
            });
            return true;
        }
    
        senderResponse(storage_data);
        return true;
    }

    if (message.masked_cmd == "update_badge") {
        browser.action.setBadgeBackgroundColor(255, 0, 0);
        browser.action.setBadgeText(message.count);
    }
});