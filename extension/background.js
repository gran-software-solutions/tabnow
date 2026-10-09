import { loadBlur, loadTheme } from "./keys.js";

// Page-side overlay: self-contained, injected into the active tab. Calling it again toggles it off.
function overlay(src, blur, theme) {
  const old = document.getElementById("tabnow-host");
  if (old) return old.close?.();
  const host = document.createElement("div");
  host.id = "tabnow-host";
  host.style.cssText = "all:initial;position:fixed;inset:0;z-index:2147483647";
  const root = host.attachShadow({ mode: "closed" });
  const dark = theme === "dark" || (theme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
  const f = document.createElement("iframe");
  f.src = src + "&t=" + (dark ? "dark" : "light");
  // Dim + frost are sibling layers. A backdrop-filter on the host would hide the page from the frost,
  // and browsers ignore backdrop-filter on the iframe itself.
  const scrim = document.createElement("div");
  scrim.style.cssText = "position:absolute;inset:0";
  const box = "position:absolute;left:50%;top:12vh;transform:translateX(-50%);width:min(640px,94vw);height:min(480px,80vh);border-radius:16px;";
  const frost = document.createElement("div");
  frost.style.cssText = box + "box-shadow:0 30px 80px rgb(0 0 0/.25)";
  f.style.cssText = box + "border:0";
  const paint = dark => {
    scrim.style.background = dark ? "rgb(0 0 0/.32)" : "rgb(20 24 32/.12)";
    scrim.style.backdropFilter = "blur(" + Math.round(blur / 8) + "px)";
    frost.style.backdropFilter = "blur(" + blur + "px) saturate(1.3) brightness(" + (dark ? ".7" : "1.15") + ")";
    f.style.colorScheme = dark ? "dark" : "light"; // same scheme as the page inside, or the iframe turns opaque
  };
  paint(dark);
  root.append(scrim, frost, f);
  const origin = new URL(src).origin;
  const close = () => {
    host.remove();
    removeEventListener("message", onMsg);
    removeEventListener("keydown", onKey, true);
    removeEventListener("focusin", trap, true);
  };
  const onMsg = e => {
    if (e.origin !== origin) return;
    if (e.data === "tabnow:close") close();
    else if (e.data?.tabnow === "theme") paint(e.data.dark);
  };
  const onKey = e => { if (e.key === "Escape") close(); };
  // Modal focus trap: if the page grabs focus back (Gmail, X do), return it to the overlay.
  const trap = e => { if (e.target !== host) focus(); };
  const focus = () => { f.focus(); f.contentWindow?.postMessage("tabnow:focus", origin); };
  host.close = close;
  scrim.addEventListener("click", close);
  addEventListener("message", onMsg);
  addEventListener("keydown", onKey, true);
  addEventListener("focusin", trap, true);
  f.onload = focus;
  document.activeElement?.blur?.(); // so the page's own field lets go before the overlay appears
  document.documentElement.append(host);
}

async function open(tab) {
  if (!tab?.id) [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const src = chrome.runtime.getURL(`search.html?w=${tab.windowId}`);
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: overlay, args: [src, ...(await Promise.all([loadBlur(), loadTheme()]))] });
  } catch { // restricted page (chrome://, Web Store, new tab): fall back to a popup window
    const prefix = chrome.runtime.getURL("search.html");
    const [mine] = await chrome.tabs.query({ url: prefix + "*" });
    if (mine) return chrome.windows.remove(mine.windowId); // toggle
    const w = await chrome.windows.get(tab.windowId);
    chrome.windows.create({
      url: src + "&popup", type: "popup", width: 640, height: 480,
      left: Math.round(w.left + (w.width - 640) / 2), top: Math.round(w.top + (w.height - 480) / 3),
    });
  }
}

// Jump to the most recently used tab other than the current one, in any window. Pressing it again flips back.
async function previousTab() {
  const [, prev] = (await chrome.tabs.query({ windowType: "normal" })).sort((a, b) => b.lastAccessed - a.lastAccessed);
  if (!prev) return;
  chrome.tabs.update(prev.id, { active: true });
  chrome.windows.update(prev.windowId, { focused: true });
}

chrome.action.onClicked.addListener(open);
chrome.commands.onCommand.addListener(cmd => cmd === "previous-tab" && previousTab());
