function popup_log(message, type='info')  {
    const out_message = `[${Date().toLocaleString().split(" GMT")[0]}](${type}) -> ${message}\n`;
    const logEl = document.getElementById("logs");

    if (logEl) {
        logEl.textContent += `${out_message}`;
    }
}

module.exports = { popup_log }