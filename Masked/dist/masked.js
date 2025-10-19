(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // Masked/logger.js
  var require_logger = __commonJS({
    "Masked/logger.js"(exports, module) {
      function popup_log2(message, type = "info") {
        const out_message = `[${Date().toLocaleString().split(" GMT")[0]}](${type}) -> ${message}
`;
        const logEl = document.getElementById("logs");
        if (logEl) {
          logEl.textContent += `${out_message}`;
        }
      }
      module.exports = { popup_log: popup_log2 };
    }
  });

  // Masked/functions.js
  var require_functions = __commonJS({
    "Masked/functions.js"(exports, module) {
      var { popup_log: popup_log2 } = require_logger();
      popup_log2(Date.now() + " " + document.currentScript.src, "info");
      function status_message(message, type = "default") {
        let text_color = "text-black";
        if (type == "success") {
          text_color = "text-success";
        } else {
          text_color = "error";
        }
        $("#status").html(message);
        $("#status").fadeIn(2e3);
        $("#status").fadeOut(1e3);
        $("#status")[0].attributes[1].nodeValue.replace(/text-(black|success|danger)/, "text-black");
      }
      HTMLElement.prototype.sort_options = function() {
        Array.prototype.slice.call(this.options).sort(function(a, b) {
          return a.text > b.text ? 1 : a.text < b.text ? -1 : 0;
        }).forEach(function(option, index) {
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
        let secrets_badge = document.createElement("span");
        let regex_badge = document.createElement("span");
        let secrets_ele_badge = document.createElement("span");
        let regex_ele_badge = document.createElement("span");
        let spacer = document.createElement("span");
        spacer.innerText = " / ";
        if (!document.getElementById("secrets-badge")) {
          secrets_badge.className = "badge text-bg-warning rounded-pill float-end";
          secrets_badge.innerText = secrets_list.length;
          secrets_badge.id = "secrets-badge";
          secrets_badge.name = "secrets-badge";
        } else {
          document.getElementById("secrets-badge").innerText = secrets_list.length;
          document.getElementById("regex-badge").innerText = regexes_list.length;
        }
        if (!document.getElementById("secrets-badge")) {
          regex_badge.className = "badge text-bg-warning rounded-pill float-end";
          regex_badge.innerText = regexes_list.length;
          regex_badge.id = "regex-badge";
          regex_badge.name = "regex-badge";
        } else {
          document.getElementById("secrets-badge").innerText = secrets_list.length;
          document.getElementById("regex-badge").innerText = regexes_list.length;
        }
        if (!document.getElementById("secrets-ele-badge") && !document.getElementById("regex-ele-badge")) {
          secrets_ele_badge.className = "badge text-bg-danger rounded-pill float-end";
          secrets_ele_badge.innerText = secrets_ele_list.length;
          secrets_ele_badge.id = "secrets-ele-badge";
          secrets_ele_badge.name = "secrets-ele-badge";
          regex_ele_badge.className = "badge text-bg-success rounded-pill float-end";
          regex_ele_badge.innerText = regex_ele_list.length;
          regex_ele_badge.id = "regex-ele-badge";
          regex_ele_badge.name = "regex-ele-badge";
        } else {
          document.getElementById("secrets-ele-badge").innerText = secrets_list.length;
          document.getElementById("regex-ele-badge").innerText = regexes_list.length;
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
            "secrets-in-regex",
            "regex-in-secrets",
            "mask-emails",
            "dark-mode",
            "enable-regex",
            "enable-secrets",
            "exceed-max-depth"
          ];
          for (const key in toggle_switches) {
            let selector = "option-toggle-" + toggle_switches[key];
            let toggle_switch = document.getElementById(selector);
            let stored_val = storage_data.options[toggle_switches[key].replaceAll("-", "_")];
            toggle_switch.checked = stored_val;
            popup_log2(`settings toggle_switches[${key}] = ${toggle_switches[key].replaceAll("-", "_")}`, "info");
          }
          if (document.getElementById("option-toggle-exceed-max-depth").checked === true) {
            max_depth.max = max_depth.value;
          } else {
            max_depth.max = 35;
          }
          for (let i = 0; i < storage_data.lists.secrets.length; i++) {
            let list_option = document.createElement("option");
            list_option.id = `lst_sec_${i}`;
            list_option.name = `lst_sec_${i}`;
            list_option.text = storage_data.lists.secrets[i];
            secrets_list.appendChild(list_option);
          }
          ;
          for (let i = 0; i < storage_data.lists.regexes.length; i++) {
            let list_option = document.createElement("option");
            list_option.id = `lst_rgx_${i}`;
            list_option.name = `lst_rgx_${i}`;
            list_option.text = storage_data.lists.regexes[i];
            regex_list.appendChild(list_option);
          }
          ;
          for (let i = 0; i < storage_data.lists.secrets_elements.length; i++) {
            let list_option = document.createElement("option");
            list_option.id = `lst_sec_ele_${i}`;
            list_option.name = `lst_sec_ele_${i}`;
            list_option.text = storage_data.lists.secrets_elements[i];
            secrets_ele_list.appendChild(list_option);
          }
          for (let i = 0; i < storage_data.lists.regex_elements.length; i++) {
            let list_option = document.createElement("option");
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
      async function set_masked_obj2(data) {
        let current = await get_masked_obj2();
        let storage_data2 = { ...current, ...data };
        await update_masked_obj(storage_data2);
      }
      async function update_masked_obj(data) {
        browser.storage.local.set({ masked_data: data }).then((response) => {
          status_message(response);
        }).catch((error) => {
          return error;
        });
        popup_log2("Saved storage!!!", "info");
        ;
        return true;
      }
      async function get_masked_obj2() {
        let temp = await browser.storage.local.get();
        let storage_data2 = temp.masked_data || null;
        if (!storage_data2) {
          popup_log2(`We didn't get an object from get_masked_obj`, "info");
          storage_data2 = {
            lists: {
              regexes: [],
              secrets: [],
              regex_elements: [],
              secrets_elements: [],
              exclude: []
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
              max_depth: 5
            },
            location: {
              script: "functions.js",
              last: "none"
            },
            version: 2.1,
            creds: null
          };
        }
        return storage_data2;
      }
      module.exports = {
        set_masked_obj: set_masked_obj2,
        get_masked_obj: get_masked_obj2,
        update_masked_obj,
        populate_popup,
        status_message,
        add_menu_badges
      };
    }
  });

  // Masked/masked.js
  popup_log(`masked.js loaded`, "info");
  var { get_masked_obj, set_masked_obj } = require_functions();
  async function init() {
    return browser.storage.local.get().then((resp) => {
      storage_data = get_masked_object();
      popup_log(`Masked storage loaded`, "info");
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
        popup_log(`regex in secrets enabled, combining secrets and regexes`, "info");
        secrets = [...secrets_t, ...regexes_t];
      }
      let out = "";
      storage_data.lists.secrets.forEach((s) => {
        out += '*[name*="' + s + '"],*[id*="' + s + '"]';
      });
      popup_log(out, "info");
      search_regexes = secrets_t.map((secret) => {
        if (secret.startsWith("/") && secret.endsWith("/")) {
          return new RegExp(secret.substring(1, secret.length - 1));
        } else {
          return new RegExp(secret);
        }
      });
      search_regexes.forEach((re) => {
        let check_emails = storage_data.options.mask_emails;
        search_elements = document.querySelectorAll('*[name*="log"],*[id*="log"]');
        search_elements.forEach((e) => {
          if (re.test(e.id) || re.test(e.name)) {
            if (check_emails == false && (e.id.match(/email/i) || e.name.match(/email/i))) {
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
      if (!document.getElementById(f.id + "-masked")) {
        let holder;
        switch (f.tagName.toLowerCase()) {
          case "input":
            if (f.type != "password" && f.type != "hidden") {
              f.type = "password";
              holder = getHolderElement(f.value, f.type);
            }
            break;
          case "div":
          case "span":
            holder = getHolderElement(f.textContent, f);
            f.textContent = "*".repeat(f.textContent.length);
            break;
          default:
            popup_log(f, "info");
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
          popup_log(`depth: ${depth}`, "info");
          depth++;
          node.childNodes.forEach(getTextNodes);
          depth--;
        } else {
          popup_log(`Maximum node-depth of ${maxDepth} reached, skipping`, "info");
          return;
        }
      }
    }
    getTextNodes(document.body);
    popup_log(`${textNodes.length} nodes found`, "info");
    textNodes.forEach((textNode) => {
      regexes.forEach((regex) => {
        let rgx = new RegExp(regex.trim(), "igm");
        if (rgx.test(textNode.nodeValue)) {
          let originalText = textNode.nodeValue;
          let maskedText = originalText.replace(rgx, (match) => "*".repeat(match.length));
          let holderElement = getHolderElement(originalText, textNode, 1);
          textNode.nodeValue = maskedText;
          textNode.before(holderElement);
        }
      });
    });
  }
  function getHolderElement(originalText, attachedElement, type) {
    let holder = document.createElement("a");
    holder.innerHTML = type ? "\u{1F9D0}" : "\u{1F978}";
    holder.style.position = "absolute";
    holder.style.zIndex = "300";
    holder.style.left = "100%";
    holder.style.marginLeft = "5px";
    holder.style.cursor = "copy";
    holder.setAttribute("data-original", originalText);
    holder.addEventListener("click", (attachedElement2) => {
      navigator.clipboard.writeText(attachedElement2.target.getAttribute("data-original"));
    });
    return holder;
  }
})();
//# sourceMappingURL=masked.js.map
