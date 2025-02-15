// ==UserScript==
// @name         CodePen Tabs
// @description  Adds multi-tab support to the CodePen editor for organizing code
// @author       Matthew Graham (https://matthewgraham.me/)
// @version      0.0.1
// @downloadURL  https://raw.githubusercontent.com/ScarpMetal/codepen-tabs/refs/heads/main/index.js
// @namespace    https://matthewgraham.me/
// @match        https://codepen.io/*/pen/*
// @match        https://codepen.io/pen/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=codepen.io
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/umbrellajs
// @run-at       document-idle
// ==/UserScript==

/* global u */
/* global CP */
/* global CodeMirror */

const css = `
  .ct-tabs {
    display: flex;
    padding-top: 4px;
    overflow: auto;
  }

  .ct-tab {
    margin-right: 2px;
    cursor: pointer;
    opacity: .6;
  }

  .ct-tab:hover {
    opacity: 1;
  }

  .ct-tab-selected {
    opacity: 1;
    border-top-color: yellow !important;
  }

  .ct-hidden {
    display: none;
  }

  .ct-invisible {
    visibility: hidden;
  }
`;
const logPrefix = "CodePen Tabs";
const editor = CP.editors.js.editor;
const tabTextRegex = new RegExp(/^\/\*\s+{\s*(.*\S.*)\s*}\s+\*\//);
let selectedTab;

// Unchanging Elements
const tabBar = u("<div>").addClass("ct-tabs powers").text("wow");
const reloadButton = u("<button>")
  .addClass("button mini-button")
  .text("Refresh CodePen Tabs")
  .on("click", refreshUI);

function createUI() {
  // Add tab bar
  u("#box-js > div.powers").after(tabBar);

  // Add reload button
  u("#box-js > div.powers > div.editor-actions-right").prepend(reloadButton);
}

let collapsedMarks = [];
function refreshUI() {
  log("refreshUI");

  // Extract line data from editor
  const lines = [];
  editor.eachLine((line) => {
    lines.push({
      _data: line,
      text: line.text,
      lineNo: line.lineNo(),
      tabName: getTabName(line.text),
    });
  });

  // Get tab names
  const tabNames = lines.map(({ tabName }) => tabName).filter(Boolean);

  // Clear out existing tab elements
  tabBar.empty();

  // Hide tab bar if there are no tabs
  if (tabNames.length === 0) {
    tabBar.addClass("ct-hidden");
  } else {
    tabBar.removeClass("ct-hidden");
  }

  // Make sure selected tab exists
  const hasSelectedTab = tabNames.includes(selectedTab);
  selectedTab = hasSelectedTab ? selectedTab : undefined;

  // Place tab elements
  tabNames.forEach((name) => {
    const selected = selectedTab === name;
    const tab = u("<div>")
      .addClass(cx("box-title", "ct-tab", selected && "ct-tab-selected"))
      .text(name)
      .on("click", () => {
        selectedTab = selected ? undefined : name;
        refreshUI();
      });
    tabBar.append(tab);
  });

  // Clear old collapsed marks
  const marks = editor.getAllMarks();
  marks.forEach((mark) => mark.clear());
  log(`Cleared ${marks.length} mark${marks.length === 1 ? "" : "s"}`);

  // If there is no selected tab, skip this next part
  if (selectedTab) {
    // Find ranges for new collapsed marks
    const ranges = [];
    let start = null;
    let end = null;
    const tryAddRange = () => {
      if (start !== null && end !== null) {
        ranges.push({ start, end });
      }
    };
    lines.forEach(({ lineNo, tabName }) => {
      if (tabName) {
        if (tabName === selectedTab) {
          tryAddRange();
          start = null;
          end = null;
        } else if (start === null) {
          start = lineNo;
        }
      }

      if (start !== null) {
        end = lineNo;
      }
    });
    tryAddRange();

    // Create new collapsed marks
    ranges.forEach((range) => {
      editor.markText(
        CodeMirror.Pos(range.start, 0),
        CodeMirror.Pos(range.end),
        { inclusiveLeft: true, inclusiveRight: true, collapsed: true }
      );
    });
    log(`Created ${ranges.length} mark${marks.length === 1 ? "" : "s"}`);
  }

  editor.refresh();

  // Scroll to top after hiding ranges
  if (selectedTab) {
    const selectedTabLine = lines.find(
      ({ tabName, lineNo }) => tabName === selectedTab
    );
    if (selectedTabLine === undefined) {
      editor.scrollTo(0, 0);
    } else {
      const selectedTabStartLine = selectedTabLine.lineNo;
      const charCoords = editor.charCoords(
        CodeMirror.Pos(selectedTabStartLine, 0),
        "local"
      );
      editor.scrollTo(0, charCoords.top);
    }
  } else {
    editor.scrollTo(0, 0);
  }
}

// Create Mark
// CP.editors.js.editor.markText(CodeMirror.Pos(0), CodeMirror.Pos(7), { collapsed: true })

// Get all Marks
// CP.editors.js.editor.doc.getAllMarks()

// Destroy Mark
// const mark = CP.editors.js.editor.doc.getAllMarks()[]
// mark.clear()

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

function log(...args) {
  console.log(`[${logPrefix}]`, ...args);
}

function getTabName(text) {
  const tabMatches = text.match(tabTextRegex);
  if (tabMatches && tabMatches[1]) {
    return tabMatches[1].trim();
  }
  return null;
}

(function () {
  "use strict";

  log("Loaded CodePen Tabs Tampermonkey script!");

  createUI();
  refreshUI();

  GM_addStyle(css);
})();
