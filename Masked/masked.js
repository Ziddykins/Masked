console.log(`masked.js loaded`);

var storage_data = {};

async function init() {
    return browser.storage.local.get().then((resp) => {
        storage_data = resp.masked_data;
        console.log("in content script, got data from storage:");
        console.log(storage_data);
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

    if (storage_data.options.enable_secrets === true) {
        if (storage_data.options.regex_in_secrets) {
            console.log("regex in secrets enabled, combining secrets and regexes");
            secrets = [...secrets_t, ...regexes_t];
        }

        search_regexes = secrets_t.map(secret => {
            if (secret.startsWith("/") && secret.endsWith("/")) {
                return new RegExp(secret.substring(1, secret.length - 1));
            } else {
                return new RegExp(secret);
            }
        });

        document.querySelectorAll("*").forEach((e) => { if (e.id || e.name) { search_elements.push(e); } });
        console.log(`Found ${search_elements.length} elements, and ${search_regexes.length} secrets to parse`);

        search_elements.forEach((e) => {
            search_regexes.forEach((re) => {
                let field = e.id || e.name;
                if (re.test(e.id) || re.test(e.name)) {
                    found.push(e);
                }
            });
        });
    }

    if (storage_data.options.enable_regex) {
        await maskRegexMatches(); // Call the new function
    }

    found.forEach((f) => {
        // Check if the emoji already exists
        if (!document.getElementById(f.id + '-masked')) {
            let holder = document.createElement("a");
            holder.id = f.id + '-masked';
            holder.innerHTML = '🧐';
            holder.style.position = 'absolute'; // Use absolute positioning
            holder.style.zIndex = '300';
            holder.style.left = "100%"; // Position it to the right of the element
            holder.marginLeft = "5px";

            switch (f.tagName.toLowerCase()) {
                case 'input':
                    if (f.type != 'password' && f.type != 'hidden') {
                        holder.setAttribute('data-original', f.value); // Store original value
                        f.type = 'password';

                        holder.addEventListener("click", (e) => {
                            navigator.clipboard.writeText(e.target.getAttribute('data-original'));
                        });
                    }
                    break;
                case 'div':
                case 'span':
                    holder.setAttribute('data-original', f.textContent); // Store original text
                    f.textContent = "*".repeat(f.textContent.length);
                    break;
                default:
                    holder.value = f.value;
                    break;
            }
            f.style.position = 'relative'; // Ensure the parent element is positioned
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
    let regexes = storage_data.lists.regexes;
    let textNodes = [];

    // Function to traverse the DOM and collect text nodes
    function getTextNodes(node) {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== "") {
            textNodes.push(node);
        } else {
            node.childNodes.forEach(getTextNodes);
        }
    }

    // Start collecting text nodes from the body
    getTextNodes(document.body);

    textNodes.forEach((textNode) => {
        regexes.forEach((regex) => {
            let rgx = new RegExp(regex.trim(), 'igm');
            console.log(rgx);
            if (rgx.test(textNode.nodeValue)) {
                let originalText = textNode.nodeValue;
                let maskedText = originalText.replace(rgx, (match) => "*".repeat(match.length));

                // Create a span to hold the masked text
                let span = document.createElement("span");
                span.textContent = maskedText;

                // Create the emoji holder
                let holder = document.createElement("a");
                holder.innerHTML = '🧐';
                holder.style.position = 'absolute'; // Use absolute positioning
                holder.style.zIndex = '300';
                holder.style.left = "100%"; // Position it to the right of the element
                holder.style.marginLeft = '5px'; // Add some space

                holder.setAttribute('data-original', originalText); // Store original text
                holder.addEventListener("click", (e) => {
                    navigator.clipboard.writeText(e.target.getAttribute('data-original'));
                });

                // Replace the original text node with the masked span
                textNode.parentNode.replaceChild(span, textNode);
                span.parentNode.insertBefore(holder, span.nextSibling);
            }
        });
    });
}
