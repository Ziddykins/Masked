// This is the one that can't access browser.storage
console.log(Date.now() + " " + document.currentScript.src);

var storage_data = {};
var focused_option = null;


function send_suggestion() {
    let suggestion = {
        idx:     document.getElementById("suggestion-type-dropdown").selectedIndex,
        example: document.getElementById("suggestion-example").value,
        input:   document.getElementById("suggestion-input").value
    };

    suggestion.type = document.getElementById("suggestion-type-dropdown").options[suggestion.idx].innerText;

    $.ajax({
        type: "POST",
        url: "https://masked.memelife.ca/suggestion",
        data: JSON.stringify(suggestion),
        contentType: "application/json",
        dataType: "json",

        success: function (response) {
            status_message(response.resp, "success");
        },
        error: function (xhr, status, error) {
            console.error(xhr, status, error);
            status_message(`Error: [${xhr.status}] ${xhr.statusText} - ${error}`, "error");
        }
    });
}

function init() {
    return browser.storage.local.get().then((resp) => {    
        storage_data = resp.masked_data;

        console.log(
            '%c%c﴾%c░%c▒%c Masked%cInitialized %c▒%c░%c﴿',
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
    }).catch((error) => {
        console.error(error);
    });
}

document.getElementById('suggestion-submit').addEventListener('click', send_suggestion);

document.addEventListener("DOMContentLoaded", async () => {
    await init();
    populate_popup();
    console.log("Masked Initialized");
    

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
                //console.log(osInstance);
                //console.log(osUpdatedArgs);
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
            console.log("Toggled dark mode");
            storage_data.options.dark_mode = !storage_data.options.dark_mode;

            document.body.setAttribute('data-bs-theme', !storage_data.options.dark_mode ? 'light' : 'dark');
            Default.scrollbarTheme = dark_mode ? 'os-theme-light' : 'os-theme-dark';
            OverlayScrollbarsGlobal.OverlayScrollbars(container, {
                scrollbars: {
                    theme: Default.scrollbarTheme
                }
            });
        });
    });

    document.querySelectorAll('input[id^="option-"]').forEach((opt) => {
        opt.addEventListener("click", () => {
            let clicked_option = opt.id.replace("option-toggle-", "").replaceAll('-', '_');
            storage_data.options[clicked_option] = opt.checked;
            console.log(`storage_data.options[${clicked_option}] = ${opt.checked};`);

            browser.runtime.sendMessage({
                "masked_cmd": "set_lists",
                "sender": "popup.js",
                "data": storage_data,
                'info': opt.id + ' ' + clicked_option
            }).then((resp) => {
                console.log("sent lists to be saved");
                console.log(`got back ${resp}`);
            }).catch((error) => {
                console.error(error);
            });
        });
    });

    document.querySelectorAll("button[id^='secrets'], button[id^='regex']").forEach(
        function(e) {
            e.addEventListener("click",
                async function(b) {
                    let selector     = null;
                    let target_list  = null;
                    let target_id    = null;
                    let list_sel     = null;

                    if (b.target.id.match(/^secrets/)) {
                        target_list = document.getElementById('secrets-list');
                        selector = "option[id^='lst_sec']";
                        target_id = 'lst_sec_';
                        list_sel = "add-secrets";
                    } else if (b.target.id.match(/^regex/)) {
                        target_list = document.getElementById('regex-list');
                        selector = "option[id^='lst_rgx']";
                        target_id = 'lst_rgx_';
                        list_sel = "add-regex";
                    } 
                    
                    if (b.target.id.match(/remove$/)) {
                        let count = 0

                        document.querySelectorAll(selector).forEach(
                            function(s) {
                                if (s.selected) { 
                                    s.remove();
                                    count++;
                                }
                            }
                        );
                
                        status_message(`${count} items removed`);
                    } else if (b.target.id.match(/append$/)) {
                        let lst_count = target_list.length;
                        let list_option = document.createElement('option');

                        list_option.id = `${target_id}${lst_count++}`;
                        list_option.name = list_option.id;
                        list_option.text = document.getElementById(list_sel).value;
                        
                        document.getElementById(list_sel).value = "";
                        target_list.appendChild(list_option);

                        status_message(`secrets added`);
                    } else if (b.target.id.match(/clear$/)) {
                        $(target_list).empty();
                        status_message(`Secrets cleared`);
                    }

                    set_masked_obj().catch((error) => {
                        console.error(error);
                    });
                }
            );
        }
    );

    document.querySelectorAll('option[id^="lst_sec_ele"], option[id^="lst_rgx_ele"]').forEach(
        (sel_ele) => {
            console.log("we made it woo");
            sel_ele.addEventListener("click", (e) => {
                console.log(`Selected ${e.id}`);
                focused_option = e;
            });
        }
    );



    document.getElementById('add-regex-element').addEventListener("focus", () => {
        selected_list = document.getElementById("regex-element-list");
        status_message("reg");
    });

    document.querySelectorAll('button[id^="ele-"]').forEach((e) => {
        e.addEventListener("click", (b) => {
            if (b.target.id == 'ele-append') {
                let list_option = document.createElement('option');
                let lst_count = focused_list.length;
                let selector  = null;
                let target_id = null;
                let input_sel  = null;

                if (focused_list.id.match(/secrets/)) {
                    selector  = "option[id^='lst_sec_ele']";
                    target_id = 'lst_sec_ele';
                    input_sel  = document.getElementById("add-secrets-element");
                } else if (b.target.id.match(/regex/)) {
                    selector = "option[id^='lst_rgx_ele']";
                    target_id = 'lst_rgx_ele';
                    input_sel  = document.getElementById("add-regex-element");
                }

                list_option.id = `${target_id}${lst_count++}`;
                list_option.name = list_option.id;
                list_option.text = input_sel.value;
                
                input_sel.value = "";
                focused_list.appendChild(list_option);

                status_message(`secrets added`);
            } else if (b.target.id == 'ele-clear') {

            } else if (b.target.id == 'ele-remove') {

            }
        });
    });

    document.getElementById('option-max-depth').oninput = () => {
        document.getElementById('option-depth-label').innerText = ` (${document.getElementById('option-max-depth').value})`;
    };

    document.getElementById('option-toggle-exceed-max-depth').addEventListener('click', () => {
        let override_enabled = document.getElementById('option-toggle-exceed-max-depth').checked;
        
        if (override_enabled) {
            document.getElementById('option-max-depth').setAttribute('max', '1000');
        } else {
            document.getElementById('option-max-depth').setAttribute('max', '35');
            document.getElementById('option-depth-label').innerText = ' (35)';
        }
    });
        
//    document.getElementById('option-max-depth').addEventListener('mousemove', 
//        async function() {
//            let cur_value_label = document.getElementById('option-depth-label');
//            function sleep(ms) {
//                console.log("boing");
//                cur_value_label.innerText = document.getElementById('option-max-depth').value
//                return new Promise(resolve => setTimeout(resolve, ms));
//            }
//            
//            async function debounce_label() {
//
//                for (let i = 0; i < 5; i++) {
//                    await sleep(i * 100);   
//                }
//            }
//            
//            let override_enabled = document.getElementById('option-toggle-exceed-max-depth').checked;
//            if (override_enabled) {
//                debounce_label();
//            }
//        }
//    );
});