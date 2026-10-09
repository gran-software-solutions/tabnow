// Subsequence fuzzy match with bonuses for word starts and runs; substring beats scattered.
export function match(q, text) {
  const t = text.toLowerCase(), at = t.indexOf(q);
  if (at >= 0) {
    const start = at === 0 || /\W/.test(t[at - 1]);
    return { score: 100 + q.length * 10 + (start ? 40 : 0) - at * 0.1, hits: [...Array(q.length)].map((_, k) => at + k) };
  }
  let score = 0, last = -2, k = 0; const hits = [];
  for (let j = 0; j < t.length && k < q.length; j++) {
    if (t[j] !== q[k]) continue;
    score += j === last + 1 ? 5 : (j === 0 || /\W/.test(t[j - 1]) ? 3 : 1);
    hits.push(j); last = j; k++;
  }
  // Letters spread over a long stretch ("Harness En·g·ineering … ·o·") are noise, not a match.
  return k === q.length && hits[k - 1] - hits[0] < q.length * 3 ? { score, hits } : null;
}

// items: [{title, disp, ...}] already in MRU order. Returns [{tab, score, th, uh}].
export function search(items, q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return items.map(tab => ({ tab, th: [], uh: [] }));
  const out = [];
  for (const tab of items) {
    let score = 0; const th = [], uh = [];
    for (const w of words) {
      // Weights: domain 1.5 > title 1.2 > rest of URL 1. The domain is the start of disp, so its hits index disp.
      const d = match(w, tab.disp.split("/")[0]), a = match(w, tab.title), b = match(w, tab.disp);
      const best = Math.max((d?.score ?? -1) * 1.5, (a?.score ?? -1) * 1.2, b?.score ?? -1);
      if (best < 0) { score = -1; break; }
      score += best;
      if (d && best === d.score * 1.5) uh.push(...d.hits);
      else if (a && best === a.score * 1.2) th.push(...a.hits);
      else uh.push(...b.hits);
    }
    if (score >= 0) out.push({ tab, score, th, uh });
  }
  return out.sort((x, y) => y.score - x.score); // stable: ties keep MRU order
}

// Tabs first, then bookmarks, then history; each keeps its score order and is cut to caps[kind].
export function group(results, caps) {
  return ["tab", "bookmark", "history"].flatMap(k => results.filter(r => (r.tab.kind ?? "tab") === k).slice(0, caps[k] ?? Infinity));
}

export function hl(text, hits, from = 0) {
  const set = new Set(hits), frag = document.createDocumentFragment();
  let buf = "", on = false;
  const flush = () => { if (!buf) return; frag.append(on ? Object.assign(document.createElement("mark"), { textContent: buf }) : buf); buf = ""; };
  [...text].forEach((ch, i) => { const h = set.has(i + from); if (h !== on) { flush(); on = h; } buf += ch; });
  flush(); return frag;
}

// Slash scopes. "/b " locks a scope; a bare "/" (plus letters) lists the scopes whose code or name starts with them.
export const SCOPES = [{ code: "t", kind: "tab" }, { code: "b", kind: "bookmark" }, { code: "h", kind: "history" }];
export function parseScope(v) {
  const m = /^\/([a-z]) /i.exec(v), hit = m && SCOPES.find(s => s.code === m[1].toLowerCase());
  if (hit) return { kind: hit.kind, rest: v.slice(3) };
  const f = /^\/([a-z]*)$/i.exec(v)?.[1].toLowerCase();
  return f === undefined ? {} : { menu: SCOPES.filter(s => s.code.startsWith(f) || s.kind.startsWith(f)) };
}
