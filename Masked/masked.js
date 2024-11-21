console.log(`masked.js loaded`);

var storage_data = {};

async function init() {
    return browser.storage.local.get().then((resp) => {
        storage_data = resp.masked_data;
        console.log("in content script, got data from storage:");
        console.log(storage_data);
    });
}

do_masks();

async function do_masks() {
    await init();
    let found = [];
    let secrets = storage_data.lists.secrets;
    let regexes = storage_data.lists.regexes;

    if (storage_data.options.enable_secrets === true) {
        let sec_elements = storage_data.lists.secrets_elements;
        let selector = '';
        let page_elements = null;
    
        sec_elements.forEach((e) => {
            selector += `${e},`;
        }); 
        selector = selector.replace(/,$/, "");
    
        page_elements = document.querySelectorAll(selector);

        if (storage_data.options.regex_in_secrets) {
            console.log("regex in secrets enabled, combining secrets and regexes");
            secrets = [...secrets, ...regexes];
        }

        secrets.forEach((s) => {
            page_elements.forEach((e) => {
                let element_id = e.id;
                let element_text = e.textContent;

                console.log(`Searching ${element_id} for secret ${s}`);

                console.log(`TExt content of element ${element_id}: ${element_text}`);

                if (storage_data.options.mask_emails === false && s.match(/email/i)) {
                    console.log(`Skipping secret '${s} due to masking email option disabled`);
                    return;
                }
                
                if (element_id && element_id.includes(s)) {
                    console.log(`Found secrets in element ${element_id}`);
                    found.push(element);
                }
            });
                

            /*           
        
        
        
                function(hit) {
                    found.push(hit);
                    console.log(`Found secrets ${hit}`);
                }
            );*/
        });
    }

    if (storage_data.options.enable_regex) {
        if (storage_data.options.secrets_in_regex) {
            secrets.forEach((s) => {
                let temp_sec = `/${s}/g`;
                regexes.push(temp_sec);
                console.log("Adding secrets to regex search");
            });
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
                        console.log(`Found secrets ${i}`);
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

    regexes.forEach((r) => {
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