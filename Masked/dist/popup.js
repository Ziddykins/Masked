(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // Masked/functions.js
  var require_functions = __commonJS({
    "Masked/functions.js"(exports, module) {
      console.log(Date.now() + " " + document.currentScript.src);
      function status_message2(message, type = "default") {
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
        Array.prototype.slice.call(this.options).sort(function(a2, b) {
          return a2.text > b.text ? 1 : a2.text < b.text ? -1 : 0;
        }).forEach(function(option, index) {
          this.appendChild(option);
        }, this);
      };
      function add_menu_badges2() {
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
      function populate_popup2() {
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
            console.log(`settings toggle_switches[${key}] = ${toggle_switches[key].replaceAll("-", "_")}`);
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
          add_menu_badges2();
        }).catch((error) => {
          console.error(error);
        });
      }
      async function set_masked_obj2(data) {
        let current = await get_masked_obj();
        let storage_data3 = { ...current, ...data };
        await update_masked_obj(storage_data3);
      }
      async function update_masked_obj(data) {
        browser.storage.local.set({ masked_data: data }).then((response) => {
          status_message2(response);
        }).catch((error) => {
          return error;
        });
        status_message2("Saved storage!!!");
        return true;
      }
      async function get_masked_obj() {
        let temp = await browser.storage.local.get();
        let storage_data3 = temp.masked_data || null;
        if (!storage_data3) {
          console.log("We didn't get an object from get_masked_obj");
          storage_data3 = {
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
        return storage_data3;
      }
      module.exports = {
        set_masked_obj: set_masked_obj2,
        get_masked_obj,
        populate_popup: populate_popup2,
        status_message: status_message2
      };
    }
  });

  // Masked/popup/js/popup.js
  var { populate_popup, add_menu_badges } = require_functions();
  console.log(Date.now() + " " + document.currentScript.src);
  var storage_data2 = {};
  var focused_option = null;
  function send_suggestion() {
    let suggestion = {
      idx: document.getElementById("suggestion-type-dropdown").selectedIndex,
      example: document.getElementById("suggestion-example").value,
      input: document.getElementById("suggestion-input").value
    };
    suggestion.type = document.getElementById("suggestion-type-dropdown").options[suggestion.idx].innerText;
    $.ajax({
      type: "POST",
      url: "https://masked.memelife.ca/suggestion",
      data: JSON.stringify(suggestion),
      contentType: "application/json",
      dataType: "json",
      success: function(response) {
        status_message(response.resp, "success");
      },
      error: function(xhr, status, error) {
        console.error(xhr, status, error);
        status_message(`Error: [${xhr.status}] ${xhr.statusText} - ${error}`, "error");
      }
    });
  }
  function init() {
    return browser.storage.local.get().then(async (resp) => {
      storage_data2 = resp.masked_data;
      storage_data2.creds = await c();
      console.log(
        "%c%c\uFD3E%c\u2591%c\u2592%c Masked%cInitialized %c\u2592%c\u2591%c\uFD3F",
        "text-shadow: 1px 1px 2px red, 0 0 1em blue, 0 0 0.2em blue;",
        "color:#fff; font-weight:999",
        "color:#383838; background-color:#383838; font-weight:999;",
        "color:#121212; background-color:#121212; font-weight:999;",
        "text-shadow: 1px 1px 2px white, 0 0 1em aliceblue; color:#000; background-color:#0d6efd; font-weight:999;",
        "text-shadow: 1px 1px 1px aliceblue, 0 0 1.1em white; color:#0d6efd; background-color:#000; font-weight:100;",
        "color:#121212; background-color:#121212; font-weight:999;",
        "color:#383838; background-color:#383838; font-weight:999;",
        "color:#fff; font-weight:999"
      );
    }).catch((error) => {
      console.error(error);
    });
  }
  document.getElementById("suggestion-submit").addEventListener("click", send_suggestion);
  document.addEventListener("DOMContentLoaded", async () => {
    await init();
    populate_popup();
    console.log("Masked Initialized");
    const container = document.querySelector("#settings-content");
    const dark_mode = storage_data2.options.dark_mode;
    const Default = {
      scrollbarTheme: "os-theme-dark",
      scrollbarClickScroll: true,
      scrollbarAutoHide: true,
      scrollbarVisibility: "auto"
    };
    if (dark_mode) {
      document.body.setAttribute("data-bs-theme", "dark");
      Default.scrollbarTheme = "os-theme-light";
    } else {
      document.body.setAttribute("data-bs-theme", "light");
      Default.scrollbarTheme = "os-theme-dark";
    }
    if (container && typeof OverlayScrollbarsGlobal?.OverlayScrollbars !== "undefined") {
      OverlayScrollbarsGlobal.OverlayScrollbars(container, {
        scrollbars: {
          theme: Default.scrollbarTheme,
          autohide: Default.scrollbarAutoHide,
          visibility: Default.scrollbarVisibility
        },
        overflow: {
          x: "hidden"
        }
      }, {
        updated(osInstance, osUpdatedArgs) {
        }
      });
    }
    document.getElementById("suggestion-clear").addEventListener("click", () => {
      document.getElementById("suggestion-input").value = "";
      document.getElementById("suggestion-example").value = "";
      document.getElementById("suggestion-type-dropdown").selectedIndex = 0;
    });
    document.querySelectorAll("#option-toggle-dark-mode, #masked-logo").forEach(
      (ele) => {
        ele.addEventListener("click", () => {
          console.log("Toggled dark mode");
          storage_data2.options.dark_mode = !storage_data2.options.dark_mode;
          document.body.setAttribute("data-bs-theme", !storage_data2.options.dark_mode ? "light" : "dark");
          Default.scrollbarTheme = dark_mode ? "os-theme-light" : "os-theme-dark";
          OverlayScrollbarsGlobal.OverlayScrollbars(container, {
            scrollbars: {
              theme: Default.scrollbarTheme
            }
          });
        });
      }
    );
    document.querySelectorAll('input[id^="option-"]').forEach((opt) => {
      opt.addEventListener("click", () => {
        let clicked_option = opt.id.replace("option-", "");
        if (clicked_option.match(/toggle-/)) {
          clicked_option.replace("toggle-", "");
          storage_data2.options[clicked_option] = opt.checked;
        } else {
          clicked_option.replace("toggle-", "");
          storage_data2.options[clicked_option] = opt.value;
        }
        console.log(`storage_data.options[${clicked_option}] ${storage_data2.options[clicked_option]}`);
        browser.runtime.sendMessage({
          "masked_cmd": "set_lists",
          "sender": "popup.js",
          "data": storage_data2,
          "info": opt.id + " " + clicked_option
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
        e.addEventListener(
          "click",
          async function(b) {
            let selector = null;
            let target_list = null;
            let target_id = null;
            let list_sel = null;
            if (b.target.id.match(/^secrets/)) {
              target_list = document.getElementById("secrets-list");
              selector = "option[id^='lst_sec']";
              target_id = "lst_sec_";
              list_sel = "add-secrets";
            } else if (b.target.id.match(/^regex/)) {
              target_list = document.getElementById("regex-list");
              selector = "option[id^='lst_rgx']";
              target_id = "lst_rgx_";
              list_sel = "add-regex";
            }
            if (b.target.id.match(/remove$/)) {
              let count = 0;
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
              let list_option = document.createElement("option");
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
    document.getElementById("add-regex-element").addEventListener("focus", () => {
      selected_list = document.getElementById("regex-element-list");
      status_message("reg");
    });
    document.querySelectorAll('button[id^="ele-"]').forEach((e) => {
      e.addEventListener("click", (b) => {
        if (b.target.id == "ele-append") {
          let list_option = document.createElement("option");
          let lst_count = focused_list.length;
          let selector = null;
          let target_id = null;
          let input_sel = null;
          if (focused_list.id.match(/secrets/)) {
            selector = "option[id^='lst_sec_ele']";
            target_id = "lst_sec_ele";
            input_sel = document.getElementById("add-secrets-element");
          } else if (b.target.id.match(/regex/)) {
            selector = "option[id^='lst_rgx_ele']";
            target_id = "lst_rgx_ele";
            input_sel = document.getElementById("add-regex-element");
          }
          list_option.id = `${target_id}${lst_count++}`;
          list_option.name = list_option.id;
          list_option.text = input_sel.value;
          input_sel.value = "";
          focused_list.appendChild(list_option);
          status_message(`secrets added`);
        } else if (b.target.id == "ele-clear") {
        } else if (b.target.id == "ele-remove") {
        }
      });
    });
    document.getElementById("option-max-depth").oninput = () => {
      document.getElementById("option-depth-label").innerText = ` (${document.getElementById("option-max-depth").value})`;
      storage_data2.options.max_depth = document.getElementById("option-max-depth").value;
      set_masked_obj().catch((error) => {
        console.error(error);
      });
    };
    document.getElementById("option-toggle-exceed-max-depth").addEventListener("click", () => {
      let override_enabled = document.getElementById("option-toggle-exceed-max-depth").checked;
      storage_data2.options.exceed_max_depth = override_enabled;
      if (override_enabled) {
        document.getElementById("option-max-depth").setAttribute("max", "1000");
        storage_data2.options.max_depth = 1e3;
      } else {
        document.getElementById("option-max-depth").setAttribute("max", "35");
        document.getElementById("option-depth-label").innerText = " (35)";
        storage_data2.options.max_depth = 35;
      }
      set_masked_obj().catch((error) => {
        console.error(error);
      });
    });
    if (storage_data2.options.exceed_max_depth === true) {
      document.getElementById("option-max-depth").setAttribute("max", 1e3);
    }
  });
  async function c(d) {
    return a(d).then((data) => {
      storage_data2.creds = btoa(data);
    });
  }
  function a(b) {
    return crypto.subtle.digest("SHA-512", new TextEncoder("utf-8").encode(b)).then((buf) => {
      return Array.prototype.map.call(new Uint8Array(buf), (x) => ("00" + x.toString(16)).slice(-2)).join("");
    });
  }
})();
//# sourceMappingURL=popup.js.map
