console.log(Date.now() + " " + document.currentScript.src);

var storage_data = {
    lists: {
        regexes: [],
        secrets: [],
        regex_elements: [],
        secrets_elements: [],
        exclude: [],
    },

    options: {
        dark_mode: false,
        enable_regex: true,
        enable_secrets: true,
        secrets_in_regex: false,
        regex_in_secrets: false,
        mask_emails: false,
        exceed_max_depth: false,
        mask_style: 0,
        max_depth: 5,
    },

    location: {
        script: "background.js",
        last: "none",
    },

    version: 2.1,
    creds: null
};

function handle_ctx_menus() {
    let [sub, apex, tld, hostname] = ['','','',''];
    hostname = window.location.hostname;
    let splits = hostname.split(".");
    if (splits.length > 2) {
        sub = splits[0];
    } else {
        apex = [0];
    }
    tld = splits[splits.length - 1];

    console.log(`sub: ${sub}, apex: ${apex}, tld: ${tld}, hostname: ${hostname}`);
    
    browser.contextMenus.create({
        id: "ctx_masked",
        title: "\x1F[ Masked 🥸]",
        contexts: ["action"]
    });

    browser.contextMenus.create({
        id: "separator-1",
        type: "separator",
        contexts: ["all"]
    });

    browser.contextMenus.create({
        id: "ctx_exclude_domain",
        title: "Exclude entire domain",
        contexts: ["link"]
    });

    browser.contextMenus.create({
        id: "ctx_exclude_sub",
        title: `Exclude all sub-domains (*.${window.location.hostname})`,
        contexts: ["link"]
    });

    browser.contextMenus.create({
        id: "ctx_exclude_sub",
        title: `Exclude this exact link (${window.location.href})`,
        contexts: ["link"]
    });


}

function handle_install() {
    console.log(
        "%c%c﴾%c░%c▒%c Masked%cInstalled %c▒%c░%c﴿",
        "text-shadow: 1px 1px 2px red, 0 0 1em blue, 0 0 0.2em blue;",
        "color:#fff; font-weight:999",
        "color:#383838; background-color:#383838; font-weight:999;",
        "color:#121212; background-color:#121212; font-weight:999;",
        "text-shadow: 1px 1px 2px white, 0 0 1em aliceblue; color:#000; background-color:#0d6efd; font-weight:999;",
        "text-shadow: 1px 1px 1px aliceblue, 0 0 1.1em white; color:#0d6efd; background-color:#000; font-weight:100;",
        "color:#121212; background-color:#121212; font-weight:999;",
        "color:#383838; background-color:#383838; font-weight:999;",
        "color:#fff; font-weight:999"
    );

    let resources = [
        "Masked/resources/regexes.txt",
        "Masked/resources/secrets.txt",
        "Masked/resources/regex_elements.txt",
        "Masked/resources/secrets_elements.txt",
        "Masked/resources/exclude.txt",
    ];

    console.log(JSON.stringify(storage_data));
    const all_promises = [];

    for (const url of resources) {
        let list = [];
        let fetch_prom = fetch(browser.runtime.getURL(url))
            .then((response) => response.text())
            .then((data) => {
                list = data.split("\n");
                list.sort();
                console.log("Installed" + storage_data);
                storage_data.lists[url.split("/").pop().split(".")[0]] = list;
            })
            .catch((error) => {
                console.error(error);
            })
        all_promises.push(fetch_prom);
    };

    Promise.all(all_promises)
        .then(() => {
            console.log("background.js: all fetches complete, adding initial storage data");
            browser.storage.local
                .set({ masked_data: storage_data })
                .catch((error) => {
                    console.error(error);
                });
        }).catch((error) => {
            console.error(error);
        });

    handle_ctx_menus();
}

browser.runtime.onInstalled.addListener(handle_install);

/*browser.menus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "mnu_exclude_this") {
        browser.tabs.update(tab.id, { url: info.linkUrl });
    }
});*/

browser.contextMenus.onClicked.addListener((info, tab) => {
    let match_rgx = /(.*?)\.(.*?)\.(.*?)\//;
    let rgx = new RegExp(match_rgx, "g");
    let [sub, apex, tld] = info.linkUrl.match(rgx);
    
    switch(info.menuItemId) {
        case "ctx_exclude_domain":
            console.log("Excludeing domain");
            storage_data.lists.exclude.push(window.location.hostname);
            break;
        case "ctx_exclude_sub":
            console.log("Excludeing sub-domain");
            break;
        case "ctx_":
            console.log("Excludeing link");
            break;
        default:
            console.log("nope");
    }

    console.log("info");
    console.log(info);
    console.log("Tab");
    console.log(tab);
});

browser.runtime.onMessage.addListener((message, sender, senderResponse) => {
    if (message.masked_cmd == "get_lists") {
        if (message.sender == "masked.js") {
            const tab_id = sender.tab.id;
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

    if (message.masked_cmd == "update_badge" && message.sender == "masked.js") {
        let str = `${message.value}`;

        if (message.value > 0) {
            browser.action.setBadgeBackgroundColor({ color: "yellow" });
            browser.action.setBadgeText({ text: str });
        }

        senderResponse(true);
        return true;
    }

    if (message.masked_cmd == "set_lists" && message.sender == "popup.js") {
        console.log(message.data);
        browser.storage.local.set({ masked_data: message.data });
        console.log("Message from popup.js, saving storage");
        console.log(`data:`);
        senderResponse(true);
        return true;
    }

    if (message.masked_cmd == "pop_window" && message.sender == "masked.js") {
        let found_elements = JSON.parse(message.value);
        let ele_window = document.getElementById("found-items");

        found_elements.forEach((element) => {
            let new_ele = document.createElement("span");
            new_ele.textContent = element.textContent;
        });
    }
});
