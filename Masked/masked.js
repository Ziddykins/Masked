console.log(`masked.js loaded`);

var storage_data = {};

async function init() {
    return browser.storage.local.get().then((resp) => {
        storage_data = resp.masked_data;
        console.log("Masked storage loaded");
    }).catch((err) => {
        console.error("Error getting storage data: ", err);
    });
}

do_masks();

async function do_masks() {
    await init();
    let secrets_t = storage_data.lists.secrets;
    let regexes_t = storage_data.lists.regexes;
    let search_elements = [];
    let search_regexes = [];
    let found = [];
    let secrets = [];

    if (storage_data.options.enable_secrets === true) {
        if (storage_data.options.regex_in_secrets) {
            console.log("regex in secrets enabled, combining secrets and regexes");
            secrets = [...secrets_t, ...regexes_t];
        }

        let out = '';
        storage_data.lists.secrets.forEach((s) => {
            out +='*[name*="' + s + '"],*[id*="' + s + '"]';
        });
        console.log(out);
        

        search_regexes = secrets_t.map(secret => {
            if (secret.startsWith("/") && secret.endsWith("/")) {
                return new RegExp(secret.substring(1, secret.length - 1));
            } else {
                return new RegExp(secret);
            }
        });

        search_regexes.forEach((re) => {
            search_elements = document.querySelectorAll('*[name*="log"],*[id*="log"]');

            search_elements.forEach((e) => {
                if (re.test(e.id) || re.test(e.name)) {
                    if (storage_data.options.mask_emails == false && field.match(/email/i)) {
                        return;
                    }
                    found.push(e);
                }
            });
        });
    }

    if (storage_data.options.enable_regex) {
        await maskRegexMatches();
    }
    
    await browser.runtime.sendMessage({
        "masked_cmd": "pop_window",
        "sender": "masked.js",
        "value": JSON.stringify(found)
    });

    found.forEach((f) => {
        if (!document.getElementById(f.id + '-masked')) {
            let holder;

            switch (f.tagName.toLowerCase()) {
                case 'input':
                    if (f.type != 'password' && f.type != 'hidden') {
                        f.type = 'password';
                        holder = getHolderElement(f.value, f.type);
                    }
                    break;
                case 'div':
                case 'span':
                    holder = getHolderElement(f.textContent, f);
                    f.textContent = "*".repeat(f.textContent.length);
                    break;
                default:
                    console.log(f);
                    holder.value = f.value;
                    f.value = "*".repeat(f.value.length);
                    break;
            }
            f.before(holder);
        }
    });

    await browser.runtime.sendMessage({
        "masked_cmd": "update_badge",
        "sender": "masked.js",
        "value": found.length
    });
}
async function maskRegexMatches() {
    let [depth, maxDepth] = [1, storage_data.options.max_depth];
    let regexes = storage_data.lists.regexes;
    let secrets = storage_data.lists.secrets;
    let textNodes = [];
    
    if (storage_data.options.secrets_in_regex) {
        regexes = [...secrets, ...regexes];
    }
   
    function getTextNodes(node) {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== "") {
            textNodes.push(node);
        } else {
            if (depth <= maxDepth) {
                console.log(`depth: ${depth}`);
                depth++;
                node.childNodes.forEach(getTextNodes);
                depth--;
            } else {
                console.log(`Maximum node-depth of ${maxDepth} reached, skipping`);
                return;
            }
        }
    }
   
    getTextNodes(document.body);
    console.log(`${textNodes.length} nodes found`);
    
    textNodes.forEach((textNode) => {
        regexes.forEach((regex) => {
            let rgx = new RegExp(regex.trim(), 'igm');

            if (rgx.test(textNode.nodeValue)) {
                let originalText = textNode.nodeValue;
                let maskedText = originalText.replace(rgx, (match) => "*".repeat(match.length));
                let holderElement = getHolderElement(originalText, textNode, 1);
                //let cloneElement = document.createElement(textNode.type);

                //cloneElement.textContent = maskedText;

                //if (typeof textNode.parentNode !== 'undefined' && textNode.parentNode !== null) {
                    //textNode.parentNode.replaceChild(span, textNode);
                    //span.parentNode.insertBefore(holderElement, span.nextSibling);
                    textNode.nodeValue = maskedText;
                    textNode.before(holderElement);
                //} else {
                    //textNode.replaceWith(span);
           //     }
            }
        });
    });
}

function getHolderElement(originalText, attachedElement, type) {
    let holder = document.createElement("a");
    
    holder.innerHTML = type?'🧐':'🥸';
    holder.style.position = 'absolute';
    holder.style.zIndex = '300';
    holder.style.left = "100%";
    holder.style.marginLeft = '5px';
    holder.style.cursor = 'copy';

    holder.setAttribute('data-original', originalText);
    holder.addEventListener("click", (attachedElement) => {
        navigator.clipboard.writeText(attachedElement.target.getAttribute('data-original'));
    });

    return holder;
}

function maskElement(element) {
    let holder;
    switch (element.tagName.toLowerCase()) {
        case 'input':
            if (element.type != 'password' && element.type != 'hidden') {
                element.type = 'password';
                holder = getHolderElement(element.value, element);
            }
            break;
        case 'div':
        case 'span':
            holder = getHolderElement(element.textContent, element);
            element.textContent = "*".repeat(element.textContent.length);
            break;
        default:
            console.log(element);
            holder.value = element.value;
            element.value = "*".repeat(element.value.length);
            break;
    }
    element.before(holder);
}