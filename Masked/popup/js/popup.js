// This is the one that can't access browser.storage
const { get_masked_obj, status_message } = require('../../functions')
const { popup_log } = require('../../logger.js'); // Import from logger

popup_log(Date.now() + " " + document.currentScript.src, 'info');

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

        success: (response) => {
            popup_log(response.resp, 'success');
        },
        error: function (xhr, status, error) {
            console.error(xhr, status, error);
            popup_log(`Error: [${xhr.status}] ${xhr.statusText} - ${error}`, 'error');
        }
    });
}

async function init_data() {
    let storage_data = await get_masked_obj()
    this.creds = await c();

        console.log(
            '%c%c﴾%c░%c▒%c Masked%cinit_dataialized %c▒%c░%c﴿',
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

}

document.getElementById('suggestion-submit').addEventListener('click', send_suggestion);

async function c(d) {
    return a(d).then((data) => {
        storage_data.creds = btoa(data);
    });
}

function a(b) {
    return crypto.subtle.digest("SHA-512", new TextEncoder("utf-8").encode(b))
        .then(buf => {
            return Array.prototype.map.call(new Uint8Array(buf), x => (('00'+x.toString(16)).slice(-2))).join('');
        });
}

module.exports = {
    init_data: init_data,
    focused_option: () => focused_option,
}