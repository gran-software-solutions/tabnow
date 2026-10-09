// Page-side overlay: self-contained, injected into the active tab. Calling it again toggles it off.
function overlay(src) {
  const old = document.getElementById("tabnow-host");
  if (old) return old.close?.();
  const host = document.createElement("div");
  host.id = "tabnow-host";
  host.style.cssText = "all:initial;position:fixed;inset:0;z-index:2147483647;background:rgb(0 0 0/.25)";
  const root = host.attachShadow({ mode: "closed" });
  const f = document.createElement("iframe");
  f.src = src;
  f.style.cssText = "position:absolute;left:50%;top:12vh;transform:translateX(-50%);width:min(640px,94vw);height:min(480px,80vh);border:0;border-radius:14px;box-shadow:0 24px 60px rgb(0 0 0/.35);color-scheme:normal";
  root.append(f);
  const origin = new URL(src).origin;
  const close = () => {
    host.remove();
    removeEventListener("message", onMsg);
    removeEventListener("keydown", onKey, true);
    removeEventListener("focusin", trap, true);
  };
  const onMsg = e => { if (e.origin === origin && e.data === "tabnow:close") close(); };
  const onKey = e => { if (e.key === "Escape") close(); };
  // Modal focus trap: if the page grabs focus back (Gmail, X do), return it to the overlay.
  const trap = e => { if (e.target !== host) focus(); };
  const focus = () => { f.focus(); f.contentWindow?.postMessage("tabnow:focus", origin); };
  host.close = close;
  host.addEventListener("click", e => { if (e.target === host) close(); });
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
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: overlay, args: [src] });
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
