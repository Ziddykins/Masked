console.log(Date.now() + " " + document.currentScript.src);

function status_message(message) {
    $('#status').html(message);
    $("#status").fadeIn(2000);
    $("#status").fadeOut(2000);
}

HTMLElement.prototype.sort_options = function() {
    Array.prototype.slice.call(this.options).sort(function(a, b) {
        return a.text > b.text ? 1 : a.text < b.text ? -1 : 0;
    }).forEach(function(option, index) {
        this.appendChild(option);
    }, this);
};

function add_menu_badges() {
    let secrets_menu_item    = document.getElementById("list-secrets-list");
    let regex_menu_item     = document.getElementById("list-regex-list");
    let elements_menu_item  = document.getElementById("list-elements-list");

    let secrets_list     = document.getElementById("secrets-list");
    let regexes_list     = document.getElementById("regex-list");
    let secrets_ele_list  = document.getElementById("secrets-element-list");
    let regex_ele_list   = document.getElementById("regex-element-list");    

    let secrets_badge    = document.createElement('span');
    let regex_badge      = document.createElement('span');
    let secrets_ele_badge = document.createElement('span');
    let regex_ele_badge  = document.createElement('span');

    let spacer  = document.createElement('span');
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
        
        let secrets_list     = document.getElementById("secrets-list");
        let regex_list       = document.getElementById("regex-list");
        let secrets_ele_list = document.getElementById("secrets-element-list");
        let regex_ele_list   = document.getElementById("regex-element-list");

        document.getElementById("option-toggle-secrets-in-regex").checked  = storage_data.options.secrets_in_regex;
        document.getElementById("option-toggle-regex-in-secrets").checked  = storage_data.options.regex_in_secrets;
        document.getElementById("option-toggle-mask-emails").checked       = storage_data.options.mask_emails;
        document.getElementById("option-toggle-dark-mode").checked         = storage_data.options.dark_mode;
        document.getElementById("option-toggle-enable-regex").checked      = storage_data.options.enable_regex;
        document.getElementById("option-toggle-enable-secrets").checked    = storage_data.options.enable_secrets;

        for (let i=0; i<storage_data.lists.secrets.length; i++) {
            let list_option = document.createElement('option');
            list_option.id = `lst_sec_${i}`;
            list_option.name = `lst_sec_${i}`;
            list_option.text = storage_data.lists.secrets[i];
            secrets_list.appendChild(list_option);
        };

        for (let i=0; i<storage_data.lists.regexes.length; i++) {
            let list_option = document.createElement('option');
            list_option.id = `lst_rgx_${i}`;
            list_option.name = `lst_rgx_${i}`;
            list_option.text = storage_data.lists.regexes[i];
            regex_list.appendChild(list_option);
        };

        for (let i=0; i<storage_data.lists.secrets_elements.length; i++) {
            let list_option = document.createElement('option');
            list_option.id = `lst_sec_ele_${i}`;
            list_option.name = `lst_sec_ele_${i}`;
            list_option.text = storage_data.lists.secrets_elements[i];
            secrets_ele_list.appendChild(list_option);
        }

        for (let i=0; i<storage_data.lists.regex_elements.length; i++) {
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

async function set_masked_obj() {
    browser.storage.local.set({masked_data: storage_data})
        .then((response) => {
            status_message(response);
        }).catch((error) => {
            return error;
        });
    
    status_message("Saved storage!!!");

    return true;
}