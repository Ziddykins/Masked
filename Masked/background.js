const { parse, getDomain, getSubdomain } = require('tldts');
const { get_masked_obj, set_masked_obj } = require('./functions.js')
const { popup_log } = require('./popup/js/popup.js');

var storage_data;

(async () => {
    storage_data = await get_masked_obj();
})();

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

    popup_log(`sub: ${sub}, apex: ${apex}, tld: ${tld}, hostname: ${hostname}`, 'info');
    
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
        id: "ctx_exclude_exact",
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

    popup_log(JSON.stringify(storage_data), 'info');
    const all_promises = [];

    for (const url of resources) {
        let list = [];
        let fetch_prom = fetch(browser.runtime.getURL(url))
            .then((response) => response.text())
            .then((data) => {
                list = data.split("\n");
                list.sort();
                popup_log("Installed" + storage_data, 'info');
                storage_data.lists[url.split("/").pop().split(".")[0]] = list;
            })
            .catch((error) => {
                console.error(error);
            })
        all_promises.push(fetch_prom);
    };

    Promise.all(all_promises)
        .then(() => {
            popup_log(`background.js: all fetches complete, adding initial storage data`, 'info');
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
        browser.tabs.update(tab.id,T { url: info.linkUrl });
    }
});*/

browser.contextMenus.onClicked.addListener(async (info, tab) => {
    let curUrl = parse(info.linkUrl)
    popup_log(`CURURL:`, 'info');
    popup_log(curUrl, 'info');

    switch(info.menuItemId) {
        case "ctx_exclude_domain":
            popup_log(`Excluding domain " + curUrl.domain + "/*`, 'info');
            storage_data.lists.exclude.push(curUrl.domain + "/*");
            break;
        case "ctx_exclude_sub":
            popup_log(`Excluding sub-domain`, 'info');
            storage_data.lists.exclude.push(curUrl.hostname + "/*");
            break;
        case "ctx_":
            popup_log(`Excluding link`, 'info');
            storage_data.lists.exclude.push(info.linkUrl)
            break;
        default:
            popup_log(`nope`, 'info');
    }

    await set_masked_obj();

    popup_log('info: ', 'info');
    popup_log(info, 'info');
    popup_log('Tab', 'info');
    popup_log(tab, 'info');

});

browser.runtime.onMessage.addListener((message, sender, senderResponse) => {
    if (message.masked_cmd == "get_lists") {
        if (message.sender == "masked.js") {
            const tab_id = sender.tab.id;
            const reply_msg = browser.tabs.sendMessage(tab_id, storage_data);

            reply_msg.then((response) => {
                popup_log(`background.js: got response from tab ${tab_id}: ${response}`, 'info');
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
        popup_log(message.data, 'info');
        browser.storage.local.set({ masked_data: message.data });
        popup_log(`Message from popup.js, saving storage`, 'info');
        popup_log(`data:`, 'info');
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
