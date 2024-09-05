    'use strict';
        console.log("loaded masked.js");
        let found = [];
        let storage_data = {
            "regexes": [],
            "secrets": [],
            "options": {
                "enable_regexes": true,
                "enable_secrets": true,
                "id_in_regex": false,
                "mask_emails": false,
                "mask_style": 0
            }
        };

        async function init() {
            try {
                let data = await browser.storage.local.get();
                storage_data.regexes = data.regexes;
                storage_data.secrets = data.secrets;
                storage_data.options = data.options;
            } catch (error) {
                console.error(error);
            }
        
            if (!storage_data.regexes) {
                try {
                    let response = await browser.runtime.sendMessage({
                        "masked_cmd": "get_lists",
                        "sender": "masked.js"
                    });

                    storage_data.regexes = response.regexes;
                    storage_data.secrets = response.secrets;
                    storage_data.options = response.options;
                } catch (error) {
                    console.error(error);
                }
            }
        
            document.head.append('a.masked { position: relative; top: 50%; z-index: 2; div,input.maskedparent { position: relative;  z-index: 1; }');
            do_masks(storage_data);
        }

        init();
    
        function do_masks(sturrige) {
            if (storage_data.options.enable_secrets === true) {
                sturrige.secrets.forEach(function(secret) {
                    if (storage_data.options.mask_emails === false && secret.match(/email/)) {
                        return;
                    }

                    let selector = '[id*="' + secret + '"]';
                    document.querySelectorAll(selector).forEach(
                        function(hit) {
                            found.push(hit);
                        }
                    );
                });
            }

            if (storage_data.options.enable_regexes === true) {
                if (storage_data.options.id_in_regex === true) {
                    storage_data.secrets.forEach((s) => {
                        let temp_sec = `/${s}/g`;
                        storage_data.regexes.push(temp_sec);
                    });
                }

                sturrige.regexes.forEach((regex) => {
                    document.querySelectorAll("input,div").forEach(function(i) {
                        var input_val = i.value;
                        var input_len = i.length;
                        var input_type = i.type;

                        if (input_len > 3 && input_type != "password" && input_type != "hidden") {
                            if (input_val.match(regex)) {
                                matched_regs++;
                                found.push(i);
                            }
                        }
                    });
                });
            }

            found.forEach((f) => {
                if (f.type != 'password' && f.type != 'hidden') {
                    let holder = document.createElement('a');

                    new ResizeObserver(() => {
                        holder.style.top = '50%';    
                    }).observe(document.body);

                    holder.id = f.id + '-masked';
                    holder.innerHTML = '🧐';
                    holder.style.top = '51%';
                    holder.style.position = 'relative';
                    holder.style.zIndex = '99';
                    holder.style.left = "90%";

                    if (f.type == 'input') {
                        if (f.length) {
                            holder.setAttribute('value', f.value);
                        }
                    } else {
                        holder.setAttribute('textContent', f.value);
                    }

                    f.before(holder);
                    f.type = 'password';

                    $("a[id$=-masked").on("click", () => {
                        navigator.clipboard.writeText($("#email-masked").next().val());
                    });
                }
            });
        }