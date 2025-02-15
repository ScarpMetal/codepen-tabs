# CodePen Tabs
Adds multi-tab support to the CodePen editor for organizing code.

## How to install
1. Install the [TamperMonkey](https://www.tampermonkey.net/#download) browser extension
2. TODO

## How to setup dev environment
1. Clone the repo `TODO`
2. Click the TamperMonkey extension icon, then navigate to `Dashboard > Utilities > Import from file` and upload `index.js`

## How to use
* Add a tab comment in the format: `/* {Tab Name} */`
* Click "Reload CodePen Tabs" (top right corner of editor) to update the tabs
* Any code above the first tab comment shows on all tabs
* You can select and deselect a tab to toggle showing all the code

Example:
```javascript
const MY_CONSTANT = "I show on every tab"

/* {Tab 1} */
function func1() {}

/* {Tab 2} */
function func2() {}

/* {Tab 3} */
function func3() {}
```
