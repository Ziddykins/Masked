'use strict';
console.log("loaded masked.js");

async function init() {
    let storage_data = {
        regexes: [],
        secrets: [],
        options: {
            enable_regexes: true,
            enable_secrets: true,
            secrets_in_regex: false,
            mask_emails: false,
            mask_style: 0
        }
    };

    try {
        let data = await browser.storage.local.get();
        storage_data = data.masked_data;
    } catch (error) {
        console.error(error);
    }

    if (!storage_data.lists.regexes.length) {
        try {
            let response = await browser.runtime.sendMessage({
                "masked_cmd": "get_lists",
                "sender": "masked.js"
            });

            storage_data = response.masked_data;
        } catch (error) {
            console.error(error);
        }
    }

    document.head.append('a.masked { position: relative; top: 50%; z-index: 2; div,input.maskedparent { position: relative;  z-index: 1; }');
    do_masks(storage_data);
}

(() => {
    if (window.hasRun) {
        console.log("popup.js already ran, bailing");
        return;
    }

    window.hasRun = true;
    init();
})();


async function do_masks(storage_data) {
    let found = [];
    let secrets = storage_data.lists.secrets;
    let regexes = storage_data.lists.regexes;
    
    if (storage_data.options.enable_secrets === true) {
        secrets.forEach(function(secret) {
            if (storage_data.options.mask_emails === false && secret.match(/email/)) {
                return;
            }

            let selector = '[id*="' + secret + '"]';

            document.querySelectorAll(selector).forEach(
                function(hit) {
                    found.push(hit);
                    console.log(`Found secret ${hit}`);
                }
            );
        });
    }

    if (storage_data.options.enable_regexes) {
        if (storage_data.options.secrets_in_regex) {
            storage_data.lists.secrets.forEach((s) => {
                let temp_sec = `/${s}/g`;
                storage_data.lists.regexes.push(temp_sec);
                console.log("Adding secrets to regex search");
            });
        }

        if (storage_data.options.regex_in_secrets) {

        }

        storage_data.lists.regexes.forEach((regex) => {
            document.querySelectorAll("input, div, span").forEach(function(i) {
                var input_val = i.value;
                var input_len = i.length;
                var input_type = i.type;

                if (input_len > 3 && input_type != "password" && input_type != "hidden") {
                    let rgx = new RegExp(regex, "igm");

                    if (input_val.match(rgx)) {
                        matched_regs++;
                        found.push(i);
                        console.log(`Found secret ${i}`);
                    }
                }
            });
        });
    }

    found.forEach((f) => {
        let holder = document.createElement("a");
        
        holder.id = f.id + '-masked';
        holder.innerHTML = '🧐';
        holder.style.top = '51%';
        holder.style.position = 'relative';
        holder.style.zIndex = '300';
        holder.style.left = "90%";

        switch (f.tagName.toLowerCase()) {
            case 'input':
                if (f.type != 'password' && f.type != 'hidden') {
                    holder.textContent = f.value;
                    f.type = 'password';

                    holder.addEventListener("click", (e) => {
                        console.log(e);
                        navigator.clipboard.writeText(e.target.nextElementSibling.value);
                    });
                }
                break;
            case 'div':
                holder.setAttribute('value', f.textContent);
                f.textContent = "*".repeat(f.textContent.length);
                break;
            default:
                holder.value = f.value;
                break;
        }
        f.before(holder);
    });

    regex.forEach((r) => {
        let found = [];
        
        if (document.body.innerText.matchAll(r)) {
            
        }
    });
    

    let update_icon = await browser.runtime.sendMessage({
        "masked_cmd": "update_badge",
        "sender": "masked.js",
        "value": found.length
    });
}