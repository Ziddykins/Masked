const { set_masked_obj } = require('../../functions.js'); // Source, not dist
const { populate_popup } = require('../../functions.js');
const { init_data, popup_log } = require('./popup.js'); // Note: init_data, not init

let storage_data = {}; // Declare storage_data
let focused_option = null;
let focused_list = null; // Declare focused_list
let selected_list = null; // Declare selected_list

document.addEventListener("DOMContentLoaded", async () => {
    // Initialize and get storage_data
    await init_data();
    storage_data = await require('../../functions.js').get_masked_obj();
    
    populate_popup();
    popup_log(`Masked Initialized`, 'info');

    const container = document.querySelector('#settings-content');
    const dark_mode = storage_data.options.dark_mode;

    const Default = {
        scrollbarTheme: "os-theme-dark",
        scrollbarClickScroll: true,
        scrollbarAutoHide: true,
        scrollbarVisibility: "auto"
    };

    if (dark_mode) {
        document.body.setAttribute('data-bs-theme', 'dark');
        Default.scrollbarTheme = 'os-theme-light';
    } else {
        document.body.setAttribute('data-bs-theme', 'light');
        Default.scrollbarTheme = 'os-theme-dark';
    }

    if (container && typeof OverlayScrollbarsGlobal?.OverlayScrollbars !== "undefined") {
        OverlayScrollbarsGlobal.OverlayScrollbars(container, {
            scrollbars: {
                theme: Default.scrollbarTheme,
                autohide: Default.scrollbarAutoHide,
                visibility: Default.scrollbarVisibility
            },
            overflow: {
                x: 'hidden'
            }
        }, {
            updated(osInstance, osUpdatedArgs) {
                //popup_log(osInstance, 'info');
                //popup_log(osUpdatedArgs, 'info');
            }
        });
    }

    document.getElementById('suggestion-clear').addEventListener('click', () => {
        document.getElementById("suggestion-input").value = "";
        document.getElementById("suggestion-example").value = "";
        document.getElementById("suggestion-type-dropdown").selectedIndex = 0;
    });

    document.querySelectorAll('#option-toggle-dark-mode, #masked-logo').forEach(
        (ele) => {
            ele.addEventListener('click', () => {
                popup_log(`Toggled dark mode`, 'info');
                storage_data.options.dark_mode = !storage_data.options.dark_mode;

                document.body.setAttribute('data-bs-theme', storage_data.options.dark_mode ? 'dark' : 'light');
                Default.scrollbarTheme = storage_data.options.dark_mode ? 'os-theme-light' : 'os-theme-dark';
                
                if (container) {
                    OverlayScrollbarsGlobal.OverlayScrollbars(container, {
                        scrollbars: {
                            theme: Default.scrollbarTheme
                        }
                    });
                }
                
                set_masked_obj(storage_data).catch((error) => {
                    console.error(error);
                });
            });
        });

    document.querySelectorAll('input[id^="option-"]').forEach((opt) => {
        opt.addEventListener("click", () => {
            let clicked_option = opt.id.replace('option-', '').replace('toggle-', '');

            if (opt.type === 'checkbox') {
                storage_data.options[clicked_option] = opt.checked;
            } else {
                storage_data.options[clicked_option] = opt.value;
            }

            popup_log(`storage_data.options[${clicked_option}] = ${storage_data.options[clicked_option]}`, 'info');

            browser.runtime.sendMessage({
                "masked_cmd": "set_lists",
                "sender": "popup.js",
                "data": storage_data,
                'info': opt.id + ' ' + clicked_option
            }).then((resp) => {
                popup_log(`sent lists to be saved`, 'info');
                popup_log(`got back ${resp}`, 'info');
            }).catch((error) => {
                console.error(error);
            });
        });
    });

    document.querySelectorAll("button[id^='secrets'], button[id^='regex']").forEach(
        function (e) {
            e.addEventListener("click",
                async function (b) {
                    let selector = null;
                    let target_list = null;
                    let target_id = null;
                    let list_sel = null;
                    let storage_key = null;

                    if (b.target.id.match(/^secrets/)) {
                        target_list = document.getElementById('secrets-list');
                        selector = "option[id^='lst_sec']";
                        target_id = 'lst_sec_';
                        list_sel = "add-secrets";
                        storage_key = 'secrets';
                    } else if (b.target.id.match(/^regex/)) {
                        target_list = document.getElementById('regex-list');
                        selector = "option[id^='lst_rgx']";
                        target_id = 'lst_rgx_';
                        list_sel = "add-regex";
                        storage_key = 'regexes';
                    }

                    if (b.target.id.match(/remove$/)) {
                        let count = 0;

                        document.querySelectorAll(selector).forEach(
                            function (s) {
                                if (s.selected) {
                                    s.remove();
                                    count++;
                                }
                            }
                        );

                        popup_log(`${count} items removed`, 'info');
                        
                        // Update storage_data.lists from DOM
                        storage_data.lists[storage_key] = Array.from(target_list.options).map(opt => opt.text);
                    } else if (b.target.id.match(/append$/)) {
                        let lst_count = target_list.length;
                        let list_option = document.createElement('option');

                        list_option.id = `${target_id}${lst_count}`;
                        list_option.name = list_option.id;
                        list_option.text = document.getElementById(list_sel).value;

                        document.getElementById(list_sel).value = "";
                        target_list.appendChild(list_option);

                        popup_log(`item added`, 'info');
                        
                        // Update storage_data.lists from DOM
                        storage_data.lists[storage_key] = Array.from(target_list.options).map(opt => opt.text);
                    } else if (b.target.id.match(/clear$/)) {
                        target_list.innerHTML = ''; // More efficient than jQuery
                        popup_log(`List cleared`, 'info');
                        
                        storage_data.lists[storage_key] = [];
                    }

                    set_masked_obj(storage_data).catch((error) => {
                        console.error(error);
                    });
                }
            );
        }
    );

    document.querySelectorAll('option[id^="lst_sec_ele"], option[id^="lst_rgx_ele"]').forEach(
        (sel_ele) => {
            sel_ele.addEventListener("click", (e) => {
                popup_log(`Selected ${e.target.id}`, 'info');
                focused_option = e.target;
            });
        }
    );

    document.getElementById('add-secrets-element').addEventListener("focus", () => {
        focused_list = document.getElementById("secrets-element-list");
        popup_log("secrets-element", 'info');
    });

    document.getElementById('add-regex-element').addEventListener("focus", () => {
        focused_list = document.getElementById("regex-element-list");
        popup_log("regex-element", 'info');
    });

    document.querySelectorAll('button[id^="ele-"]').forEach((e) => {
        e.addEventListener("click", (b) => {
            if (!focused_list) {
                popup_log('No list focused', 'error');
                return;
            }

            if (b.target.id == 'ele-append') {
                let list_option = document.createElement('option');
                let lst_count = focused_list.length;
                let selector = null;
                let target_id = null;
                let input_sel = null;
                let storage_key = null;

                if (focused_list.id.match(/secrets/)) {
                    selector = "option[id^='lst_sec_ele']";
                    target_id = 'lst_sec_ele_';
                    input_sel = document.getElementById("add-secrets-element");
                    storage_key = 'secrets_elements';
                } else if (focused_list.id.match(/regex/)) {
                    selector = "option[id^='lst_rgx_ele']";
                    target_id = 'lst_rgx_ele_';
                    input_sel = document.getElementById("add-regex-element");
                    storage_key = 'regex_elements';
                }

                list_option.id = `${target_id}${lst_count}`;
                list_option.name = list_option.id;
                list_option.text = input_sel.value;

                input_sel.value = "";
                focused_list.appendChild(list_option);

                popup_log(`element added`, 'info');
                
                // Update storage_data
                storage_data.lists[storage_key] = Array.from(focused_list.options).map(opt => opt.text);
                
                set_masked_obj(storage_data).catch((error) => {
                    console.error(error);
                });
            } else if (b.target.id == 'ele-clear') {
                focused_list.innerHTML = '';
                let storage_key = focused_list.id.match(/secrets/) ? 'secrets_elements' : 'regex_elements';
                storage_data.lists[storage_key] = [];
                popup_log(`elements cleared`, 'info');
                
                set_masked_obj(storage_data).catch((error) => {
                    console.error(error);
                });
            } else if (b.target.id == 'ele-remove') {
                let count = 0;
                let storage_key = focused_list.id.match(/secrets/) ? 'secrets_elements' : 'regex_elements';
                
                focused_list.querySelectorAll('option').forEach((opt) => {
                    if (opt.selected) {
                        opt.remove();
                        count++;
                    }
                });
                
                popup_log(`${count} elements removed`, 'info');
                
                storage_data.lists[storage_key] = Array.from(focused_list.options).map(opt => opt.text);
                
                set_masked_obj(storage_data).catch((error) => {
                    console.error(error);
                });
            }
        });
    });

    document.getElementById('option-max-depth').oninput = () => {
        const depthValue = document.getElementById('option-max-depth').value;
        document.getElementById('option-depth-label').innerText = ` (${depthValue})`;
        storage_data.options.max_depth = parseInt(depthValue, 10);
        
        set_masked_obj(storage_data).catch((error) => {
            console.error(error);
        });
    };

    document.getElementById('option-toggle-exceed-max-depth').addEventListener('click', () => {
        let override_enabled = document.getElementById('option-toggle-exceed-max-depth').checked;
        storage_data.options.exceed_max_depth = override_enabled;

        if (override_enabled) {
            document.getElementById('option-max-depth').setAttribute('max', '1000');
            storage_data.options.max_depth = 1000;
            document.getElementById('option-depth-label').innerText = ' (1000)';
        } else {
            document.getElementById('option-max-depth').setAttribute('max', '35');
            document.getElementById('option-max-depth').value = '35';
            document.getElementById('option-depth-label').innerText = ' (35)';
            storage_data.options.max_depth = 35;
        }

        set_masked_obj(storage_data).catch((error) => {
            console.error(error);
        });
    });

    if (storage_data.options.exceed_max_depth === true) {
        document.getElementById('option-max-depth').setAttribute('max', '1000');
    }
});
