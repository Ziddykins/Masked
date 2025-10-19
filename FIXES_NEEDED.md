# Masked Extension: Codebase Issues & Fix Checklist

This checklist summarizes issues, bugs, and technical debt discovered in the main scripts (`Masked/masked.js`, `Masked/background.js`, `Masked/functions.js`, popup code) during test and code review. Use this as a prioritized TODO for future refactor and bugfix sprints.

## Masked/masked.js
- [ ] **Multiple matches in one text node:** Only one holder is created per text node, even if multiple matches exist. Consider splitting text nodes or creating multiple holders for better UX.
- [ ] **Regex flags:** Regexes are always constructed with 'igm' flags, even if the user intends a different set (e.g., only 'i'). Consider parsing flags from user input or supporting explicit flag configuration.
- [ ] **Secrets/regex cross-over:** The logic for `secrets_in_regex` and `regex_in_secrets` is not symmetric and can be confusing. Review and clarify the intended behavior.
- [ ] **Depth limiting:** The traversal logic for `max_depth` is functional but can be brittle if the DOM is mutated during traversal. Consider using an explicit stack or iterative approach for robustness.
- [ ] **Masking inputs:** The masking logic for input elements does not handle all input types (e.g., textarea, select, contenteditable). Consider expanding support or documenting limitations.
- [ ] **Holder element accessibility:** The injected holder (anchor) is not accessible (no ARIA, no keyboard support). Consider improving accessibility.
- [ ] **Clipboard interaction:** No error handling for `navigator.clipboard.writeText` failures. Add user feedback for copy failures.
- [ ] **Exclusion logic:** Exclude list is only checked in background, not in content script. Consider enforcing exclusion in both places.
- [ ] **Auto-run on script load:** `do_masks()` runs immediately on script load, which can cause issues in test/integration environments. Consider making this opt-in or event-driven.

## Masked/background.js
- [ ] **Resource loading:** No error recovery if resource fetch fails on install. Consider fallback or user notification.
- [ ] **Context menu duplication:** Context menu IDs are not unique (e.g., 'ctx_exclude_sub' used twice). Fix to avoid menu conflicts.
- [ ] **Messaging contract:** Message handlers are not fully validated (e.g., missing/invalid fields). Add schema checks for incoming messages.
- [ ] **Storage writes:** No debounce or batching for storage writes; rapid changes may cause race conditions.
- [ ] **Tab messaging:** Assumes `sender.tab.id` is always present; may break in some browser contexts.

## Masked/functions.js & popup
- [ ] **DOM assumptions:** `populate_popup()` assumes all DOM elements exist; fails silently if missing. Add error handling or checks.
- [ ] **Toggle mapping:** The mapping from kebab-case to snake_case is manual and brittle. Consider automating or centralizing this logic.
- [ ] **Badge updates:** Badge counts are not always updated if lists are changed programmatically. Add hooks or observers.
- [ ] **Popup state:** No feedback to user if storage fails to load or save. Add error UI.
- [ ] **UI accessibility:** Popup UI lacks ARIA roles and keyboard navigation.

## General
- [ ] **Testing:** No end-to-end tests for real browser environments (only JSDOM/unit). Consider adding Selenium/Puppeteer tests.
- [ ] **Type safety:** No TypeScript or JSDoc types; consider adding for maintainability.
- [ ] **CI:** Ensure all tests run in CI and add coverage reporting.
- [ ] **Documentation:** Expand `.github/copilot-instructions.md` with more message/contract examples and update as code evolves.

---

Add to this list as new issues are discovered. Prioritize fixes based on user impact and maintainability.# Fixes Needed in Masked Extension

This checklist documents bugs, issues, and improvements discovered during code review and test development.

## Critical Bugs (Fix Immediately)

### `Masked/masked.js`

- [x] **Line ~50: Undefined variable `field` in email check**
  ```javascript
  if (storage_data.options.mask_emails == false && field.match(/email/i)) {
      return;
  }
  ```
  - `field` is undefined; should be `e.id` or `e.name`
  - This causes a ReferenceError when mask_emails option is checked
  - **Fix**: Change to `if (storage_data.options.mask_emails == false && (e.id.match(/email/i) || e.name.match(/email/i))) {`

- [ ] **Line ~41: Hardcoded selector in querySelectorAll**
  ```javascript
  search_elements = document.querySelectorAll('*[name*="log"],*[id*="log"]');
  ```
  - Selector is hardcoded to "log" instead of using the actual secret pattern
  - Should be dynamic based on secrets list
  - **Fix**: Build selector from `secrets_t` array dynamically

- [ ] **Line ~35: `out` variable constructed but never used**
  ```javascript
  let out = '';
  storage_data.lists.secrets.forEach((s) => {
      out +='*[name*="' + s + '"],*[id*="' + s + '"]';
  });
  popup_log(out, 'info');
  ```
  - Selector string is built and logged but never actually used
  - **Fix**: Use `out` in `querySelectorAll()` or remove the unused code

- [ ] **Line ~68-80: Duplicate/dead code in found.forEach handler**
  - Multiple switch branches that set `holder.value` on non-existent property
  - Default case logs element but doesn't mask it properly
  - **Fix**: Clean up logic, ensure all element types are masked consistently

- [ ] **Line ~141: RegExp construction doesn't handle regex strings with flags**
  ```javascript
  let rgx = new RegExp(regex.trim(), 'igm');
  ```
  - If user stores regex like `/pattern/i`, this creates `new RegExp("/pattern/i", "igm")` which is wrong
  - Should detect and strip leading/trailing slashes and parse flags if present
  - **Fix**: Add regex string parser: `parseRegexString(str)` that returns pattern + flags

- [ ] **Missing null checks before DOM operations**
  - `textNode.parentNode` may be null (lines ~150-153)
  - Commented code suggests this was a known issue
  - **Fix**: Add null/undefined guards before DOM mutations

### `Masked/functions.js`

- [ ] **Line ~54-64: Badge count logic uses DOM `.length` instead of array length**
  ```javascript
  secrets_badge.innerText = secrets_list.length;
  ```
  - `secrets_list` is a DOM element (select), not the array
  - `.length` gives number of options in the select, not storage array length
  - **Fix**: Use `storage_data.lists.secrets.length` instead

- [ ] **Line ~72-86: Duplicate badge ID checks**
  ```javascript
  if (!document.getElementById('secrets-badge')) { ... }
  else {
      document.getElementById('secrets-badge').innerText = secrets_list.length;
  }
  ```
  - Badge creation logic repeats checks and has confusing if/else nesting
  - **Fix**: Simplify to create-or-update pattern

- [ ] **Line ~39: status_message references undefined `$("#status")[0].attributes[1]`**
  - Hardcoded attribute index is fragile and may throw
  - **Fix**: Use `.classList` or `.className` properly

### `Masked/background.js`

- [ ] **Line ~96-110: Context menu handler references undefined variables**
  ```javascript
  let [sub, apex, tld] = info.linkUrl.match(rgx);
  ```
  - `match()` returns array with full match at [0], not destructured parts
  - Variables `sub`, `apex`, `tld` won't have expected values
  - **Fix**: Adjust regex and destructuring to match URL parsing logic

- [ ] **Line ~86-95: Context menu exclusion logic never updates storage**
  - `storage_data.lists.exclude.push(...)` modifies memory but doesn't call `browser.storage.local.set()`
  - Changes are lost on reload
  - **Fix**: Call `browser.storage.local.set({masked_data: storage_data})` after push

- [ ] **Line ~154: pop_window handler references undefined `ele_window`**
  ```javascript
  let ele_window = document.getElementById("found-items");
  ```
  - Background scripts have no DOM; `document` is not available
  - This code will fail silently
  - **Fix**: Remove or move to popup/content script context

## Manifest Issues

- [ ] **manifest.json: Using MV2 `background.scripts` field in MV3 manifest**
  ```json
  "background": {
      "scripts": ["Masked/background.js"]
  }
  ```
  - Manifest V3 requires `"service_worker"` key instead of `"scripts"`
  - Browser may warn or fail to load background properly
  - **Fix**: Change to `"service_worker": "Masked/background.js"` and ensure background script is MV3-compatible (no DOM, persistent listeners)

- [ ] **manifest.json: Malformed `gecko_android` block**
  ```json
  gecko_android: {
      id: masked_adr@memelife.ca,
  ```
  - Missing quotes around keys and values
  - **Fix**: Change to proper JSON: `"gecko_android": { "id": "masked_adr@memelife.ca" }`

## Missing Features / Incomplete Implementations

- [ ] **Exclude list not enforced in `masked.js`**
  - `storage_data.lists.exclude` is defined and populated but never checked
  - Pages/URLs in exclude list are still masked
  - **Fix**: Add check in `do_masks()` or `init()` to skip execution if current URL matches exclude patterns

- [ ] **`secrets_elements` and `regex_elements` lists not used**
  - Storage has these lists but masked.js doesn't query or mask based on them
  - **Fix**: Add element-based masking logic using these CSS selectors

- [ ] **No mutation observer for dynamic content**
  - Masking only runs once at page load (document_end)
  - SPAs and dynamic content won't be masked after load
  - **Fix**: Add MutationObserver to re-run masking on DOM changes

- [ ] **No error handling in fetch/storage operations**
  - `background.js` resource loading has no `.catch()` on individual fetches
  - Storage read/write failures are logged but don't recover
  - **Fix**: Add proper error boundaries and fallback to defaults

## Code Quality Issues

- [ ] **`masked.js`: Global `storage_data` pollution**
  - Script uses global var without isolation
  - Can conflict with page scripts
  - **Fix**: Wrap in IIFE or use proper module pattern

- [ ] **Inconsistent promise handling**
  - Some functions use `.then()`, others use `async/await`, some mix both
  - **Fix**: Standardize on async/await throughout

- [ ] **Console.log statements left in production code**
  - Many `console.log()` calls throughout all files
  - **Fix**: Remove or wrap in debug flag checks

- [ ] **No input validation**
  - Regex strings aren't validated before `new RegExp()`
  - Invalid regex can crash the masking scan
  - **Fix**: Add try/catch around RegExp construction

- [ ] **Magic numbers and hardcoded values**
  - `max_depth` default is 5 (hardcoded in multiple places)
  - Emoji icons hardcoded in `getHolderElement()` (🧐/🥸)
  - **Fix**: Define constants at top of files

## Performance Issues

- [ ] **`maskRegexMatches()` scans entire DOM on every regex**
  - Nested loops: for each regex, traverse all text nodes
  - O(n*m) complexity where n=nodes, m=regexes
  - **Fix**: Collect text nodes once, then test all regexes per node

- [ ] **Depth counter uses closure variable instead of parameter**
  - `depth` variable is closed over in `getTextNodes()` recursion
  - Not functionally pure; harder to test
  - **Fix**: Pass depth as function parameter

- [ ] **Badge updates on every masked element**
  - `update_badge` message sent for each masking operation
  - Can cause message spam
  - **Fix**: Batch badge updates or debounce

## Testing Gaps

- [ ] **No tests for `Masked/popup/js/popup.js`**
  - File exists but wasn't accessible during test creation
  - Needs unit tests for UI event handlers
  - **Fix**: Add popup.js-specific test file

- [ ] **No integration tests for content↔background messaging**
  - Message flow not validated end-to-end
  - **Fix**: Add tests that simulate full message cycle

- [ ] **No tests for context menu handlers**
  - Exclusion via context menu is untested
  - **Fix**: Add tests for `browser.contextMenus.onClicked` handlers

## Documentation Needs

- [ ] **No inline JSDoc comments**
  - Function parameters and return types undocumented
  - **Fix**: Add JSDoc comments for all public functions

- [ ] **README missing setup/development instructions**
  - No guide for contributors
  - **Fix**: Expand README with local dev setup, testing commands

- [ ] **No CHANGELOG**
  - Version history not tracked
  - **Fix**: Add CHANGELOG.md

## Priority Order for Fixes

### Phase 1: Critical Bugs (breaks functionality)
1. Fix undefined `field` variable in masked.js (ReferenceError)
2. Fix hardcoded "log" selector in masked.js
3. Fix badge count logic in functions.js
4. Fix manifest.json MV3 background script format
5. Fix manifest.json gecko_android JSON syntax

### Phase 2: Missing Features (incomplete behavior)
1. Implement exclude list checking
2. Implement secrets_elements and regex_elements masking
3. Add error handling to storage/fetch operations

### Phase 3: Code Quality (maintainability)
1. Remove/guard console.log statements
2. Standardize promise handling (async/await)
3. Add input validation for regex strings
4. Add JSDoc comments

### Phase 4: Performance (optimization)
1. Optimize maskRegexMatches to scan DOM once
2. Batch badge updates
3. Add mutation observer for dynamic content

### Phase 5: Testing & Docs (coverage)
1. Add missing test coverage for popup.js
2. Add integration tests for messaging
3. Expand README and add CHANGELOG

---

## How to Use This Checklist

1. Check off items as you fix them: `- [x]`
2. Add notes/commit hashes next to items as you complete them
3. Link to issues/PRs: `- [x] Fixed in #123`
4. Update priority if blockers discovered

## Testing After Fixes

After each phase:
```powershell
npm test
```

Manual testing checklist:
- [ ] Load extension in browser (about:debugging)
- [ ] Visit test page with API keys, passwords
- [ ] Verify masking occurs correctly
- [ ] Check background console for errors
- [ ] Test popup opens and lists populate
- [ ] Test context menu exclusion
- [ ] Verify badge updates

---

Last updated: 2025-10-12 (generated during test development)
