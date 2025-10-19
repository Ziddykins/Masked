const { popup_log } = require('./popup/js/popup');

console.log(Date.now() + " " + document.currentScript.src);

function status_message(message, type = "default") {
    let text_color = 'text-black';

    if (type == "success") {
        text_color = "text-success";
    } else {
        text_color = "error";
    }

    $('#status').html(message);
    $("#status").fadeIn(2000);
    $("#status").fadeOut(1000);
    $("#status")[0]
        .attributes[1]
        .nodeValue.replace(/text-(black|success|danger)/, 'text-black');
}

HTMLElement.prototype.sort_options = function () {
    Array.prototype.slice.call(this.options).sort(function (a, b) {
        return a.text > b.text ? 1 : a.text < b.text ? -1 : 0;
    }).forEach(function (option, index) {
        this.appendChild(option);
    }, this);
};

function add_menu_badges() {
    let secrets_menu_item = document.getElementById("list-secrets-list");
    let regex_menu_item = document.getElementById("list-regex-list");
    let elements_menu_item = document.getElementById("list-elements-list");

    let secrets_list = document.getElementById("secrets-list");
    let regexes_list = document.getElementById("regex-list");
    let secrets_ele_list = document.getElementById("secrets-element-list");
    let regex_ele_list = document.getElementById("regex-element-list");

    let secrets_badge = document.createElement('span');
    let regex_badge = document.createElement('span');
    let secrets_ele_badge = document.createElement('span');
    let regex_ele_badge = document.createElement('span');

    let spacer = document.createElement('span');
    spacer.innerText = ' / ';

    if (!document.getElementById('secrets-badge')) {
        secrets_badge.className = "badge text-bg-warning rounded-pill float-end";
        secrets_badge.innerText = secrets_list.length;
        secrets_badge.id = 'secrets-badge';
        secrets_badge.name = 'secrets-badge';
    } else {
        document.getElementById('secrets-badge').innerText = secrets_list.length;
        document.getElementById('regex-badge').innerText = regexes_list.length;
    }

    if (!document.getElementById('secrets-badge')) {
        regex_badge.className = "badge text-bg-warning rounded-pill float-end";
        regex_badge.innerText = regexes_list.length;
        regex_badge.id = 'regex-badge';
        regex_badge.name = 'regex-badge';
    } else {
        document.getElementById('secrets-badge').innerText = secrets_list.length;
        document.getElementById('regex-badge').innerText = regexes_list.length;
    }

    if (!document.getElementById('secrets-ele-badge') && !document.getElementById('regex-ele-badge')) {
        secrets_ele_badge.className = "badge text-bg-danger rounded-pill float-end";
        secrets_ele_badge.innerText = secrets_ele_list.length;
        secrets_ele_badge.id = 'secrets-ele-badge';
        secrets_ele_badge.name = 'secrets-ele-badge';

        regex_ele_badge.className = "badge text-bg-success rounded-pill float-end";
        regex_ele_badge.innerText = regex_ele_list.length;
        regex_ele_badge.id = 'regex-ele-badge';
        regex_ele_badge.name = 'regex-ele-badge';
    } else {
        document.getElementById('secrets-ele-badge').innerText = secrets_list.length;
        document.getElementById('regex-ele-badge').innerText = regexes_list.length;
    }

    secrets_menu_item.appendChild(secrets_badge);
    regex_menu_item.appendChild(regex_badge);
    elements_menu_item.appendChild(secrets_ele_badge);
    elements_menu_item.appendChild(regex_ele_badge);
}

function populate_popup() {
    browser.storage.local.get().then((response) => {
        storage_data = response.masked_data;

        let secrets_list = document.getElementById("secrets-list");
        let regex_list = document.getElementById("regex-list");
        let secrets_ele_list = document.getElementById("secrets-element-list");
        let regex_ele_list = document.getElementById("regex-element-list");

        let max_depth = document.getElementById("option-max-depth");
        let depth_label = document.getElementById("option-depth-label");

        max_depth.value = storage_data.options.max_depth;
        depth_label.innerText = ` (${storage_data.options.max_depth})`;

        let toggle_switches = [
            'secrets-in-regex',
            'regex-in-secrets',
            'mask-emails',
            'dark-mode',
            'enable-regex',
            'enable-secrets',
            'exceed-max-depth'
        ];

        for (const key in toggle_switches) {
            let selector = 'option-toggle-' + toggle_switches[key];
            let toggle_switch = document.getElementById(selector);
            let stored_val = storage_data.options[toggle_switches[key].replaceAll("-", "_")];
            toggle_switch.checked = stored_val;

            console.log(`settings toggle_switches[${key}] = ${toggle_switches[key].replaceAll("-", "_")}`);
        }

        if (document.getElementById('option-toggle-exceed-max-depth').checked === true) {
            max_depth.max = max_depth.value;
        } else {
            max_depth.max = 35;
        }

        for (let i = 0; i < storage_data.lists.secrets.length; i++) {
            let list_option = document.createElement('option');
            list_option.id = `lst_sec_${i}`;
            list_option.name = `lst_sec_${i}`;
            list_option.text = storage_data.lists.secrets[i];
            secrets_list.appendChild(list_option);
        };

        for (let i = 0; i < storage_data.lists.regexes.length; i++) {
            let list_option = document.createElement('option');
            list_option.id = `lst_rgx_${i}`;
            list_option.name = `lst_rgx_${i}`;
            list_option.text = storage_data.lists.regexes[i];
            regex_list.appendChild(list_option);
        };

        for (let i = 0; i < storage_data.lists.secrets_elements.length; i++) {
            let list_option = document.createElement('option');
            list_option.id = `lst_sec_ele_${i}`;
            list_option.name = `lst_sec_ele_${i}`;
            list_option.text = storage_data.lists.secrets_elements[i];
            secrets_ele_list.appendChild(list_option);
        }

        for (let i = 0; i < storage_data.lists.regex_elements.length; i++) {
            let list_option = document.createElement('option');
            list_option.id = `lst_rgx_ele_${i}`;
            list_option.name = `lst_rgx_ele_${i}`;
            list_option.text = storage_data.lists.regex_elements[i];
            regex_ele_list.appendChild(list_option);
        }

        add_menu_badges();
    }).catch((error) => {
        console.error(error);
    });
}

async function set_masked_obj(data) {
    let current = await get_masked_obj();
    let storage_data = { ...current, ...data };
    await update_masked_obj(storage_data);
}

async function update_masked_obj(data) {
    browser.storage.local.set({ masked_data: data })
        .then((response) => {
            status_message(response);
        }).catch((error) => {
            return error;
        });

    status_message("Saved storage!!!");

    return true;
}

async function get_masked_obj() {
    let temp = await browser.storage.local.get();
    let storage_data = temp.masked_data || null;

    if (!storage_data) {
        console.log("We didn't get an object from get_masked_obj");
        storage_data = {
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
                script: "functions.js",
                last: "none",
            },

            version: 2.1,
            creds: null
        };
    }

    return storage_data;
}



module.exports = {
    set_masked_obj: set_masked_obj,
    get_masked_obj: get_masked_obj,
    populate_popup: populate_popup,
    status_message: status_message,
}