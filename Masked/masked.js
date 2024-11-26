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
            if (secret.startsWith("/")) {
                const escapedSecret = secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                return new RegExp(escapedSecret, 'gi');
            } else {
                let escapedSecret = secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                return new RegExp(escapedSecret, 'gi');
            }
        });

        document.querySelectorAll("*").forEach((e) => { if (e.id || e.name) { search_elements.push(e); }});
        console.log(`Found ${search_elements.length} elements, and ${search_regexes.length} secrets to parse`);

        search_elements.forEach((e) => {
            search_regexes.forEach((re) => {
                let field = e.id || e.name;
                console.log(`Testing ${field} for ${re.toString()}`);
                if (re.test(e.id) || re.test(e.name)) {
                    console.log(`Found secret '${re}' in element ${e.id || e.name}`);
                    found.push(e);
                }
            });
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
                var input_val = i.value || i.textContent  || i.innerText;
                var input_type = i.type;

                if (input_val.length && input_type != "password" && input_type != "hidden") {
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
            case 'span':
                holder.setAttribute('value', f.textContent);
                f.textContent = "*".repeat(f.textContent.length);
                break;
            default:
                holder.value = f.value;
                break;
        }
        f.before(holder);
    });
    
    let update_icon = await browser.runtime.sendMessage({
        "masked_cmd": "update_badge",
        "sender": "masked.js",
        "value": found.length
    });
}