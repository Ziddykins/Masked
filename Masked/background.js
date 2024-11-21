console.log(Date.now() + " " + document.currentScript.src);

var storage_data = {
    lists: {
        regexes: [],
        secrets: [],
        regex_elements: [],
        secrets_elements: []
    },
    options: {
        dark_mode: "light",
        enable_regex: true,
        enable_secrets: true,
        secrets_in_regex: false,
        regex_in_secrets: false,
        mask_emails: false,
        mask_style: 0
    },
    location: {
        script: "background.js",
        last: "none"
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
    });

    browser.contextMenus.create({
            id: "ctx_secrets_matching",
            title: "Enable secrets Matching",
            contexts: ["action"]
    });
}

function handle_install() {
    console.log(
        '%c%c﴾%c░%c▒%c Masked%cInstalled %c▒%c░%c﴿',
            'text-shadow: 1px 1px 2px red, 0 0 1em blue, 0 0 0.2em blue;',
            'color:#fff; font-weight:999',
            'color:#383838; background-color:#383838; font-weight:999;',
            'color:#121212; background-color:#121212; font-weight:999;',
            'text-shadow: 1px 1px 2px white, 0 0 1em aliceblue; color:#000; background-color:#0d6efd; font-weight:999;',
            'text-shadow: 1px 1px 1px aliceblue, 0 0 1.1em white; color:#0d6efd; background-color:#000; font-weight:100;',
            'color:#121212; background-color:#121212; font-weight:999;',
            'color:#383838; background-color:#383838; font-weight:999;',
            'color:#fff; font-weight:999'
    );

    const all_promises = [
        fetch(browser.runtime.getURL('Masked/resources/regexes.txt'))
            .then(response => response.text())
            .then(data => {
                storage_data.lists.regexes = data.split('\n');
                storage_data.lists.regexes.sort();
                console.log("Installed" + storage_data);
            }
        ).catch((error) =>
            console.error(error)
        ),

        fetch(browser.runtime.getURL('Masked/resources/secrets.txt'))
            .then(response => response.text())
            .then(data => {
                storage_data.lists.secrets = data.split('\n');
                storage_data.lists.secrets.sort();
                console.log("background.js: loaded secrets");
            }
        ).catch((error) => {
            console.error(error)
        }),

        fetch(browser.runtime.getURL('Masked/resources/regex_elements.txt'))
            .then(response => response.text())
            .then(data => {
                storage_data.lists.regex_elements = data.split('\n');
                storage_data.lists.regex_elements.sort();
                console.log("background.js: loaded regex elements");
            }
        ).catch((error) => {
            console.error(error)
        }),
		
		fetch(browser.runtime.getURL('Masked/resources/secrets_elements.txt'))
            .then(response => response.text())
            .then(data => {
                storage_data.lists.secrets_elements = data.split('\n');
                storage_data.lists.secrets_elements.sort();
                console.log("background.js: loaded secrets elements");
            }
        ).catch((error) => {
            console.error(error)
        })
    ];

    Promise.all(all_promises).then(() => {
        console.log("background.js: all fetches complete, adding initial storage data");
        browser.storage.local
            .set({masked_data: storage_data})
            .catch((error) => { console.error(error); });
    }).catch((error) => {
        console.error(error);
    });

    handle_ctx_menus();
}

browser.runtime.onInstalled.addListener(handle_install);

browser.runtime.onMessage.addListener(function(message, sender, senderResponse) {
    console.log("msg, sender=>");
    console.log(message);
    console.log(sender);
    console.log("===");

    if (message.masked_cmd == 'get_lists') {
        if (message.sender == 'masked.js') {
            let tab_id = sender.tab.id;
            const reply_msg = browser.tabs.sendMessage(tab_id, storage_data);

            reply_msg.then((response) => {
                console.log(`background.js: got response from tab ${tab_id}: ${response}`);
            }).catch((error) => {
                console.error(`background.js: ${error}`);
            });
        }
    
        senderResponse(storage_data);
        return true;
    }

    if (message.masked_cmd == "update_badge" && message.sender == 'masked.js') {
        let str = `${message.value}`;

        if (message.value > 0) {
            browser.action.setBadgeBackgroundColor({ color: "yellow"});
            browser.action.setBadgeText({text: str});
        }
        senderResponse(true);
        return true;
    }

    if (message.masked_cmd == "set_lists" && message.sender == "popup.js") {
        browser.storage.local.set({masked_data: message.data});
        console.log("Message from popup.js, saving storage");
        console.log(`data:`);
        console.log(message.data);
        senderResponse(true);
        return true;
    }
});