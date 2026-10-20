// Mock pages for the playground's fake browser: real-looking text and structure per site type, filled
// with the active tab's title and URL. Plain HTML/CSS, no images, no requests. Styles: .pq-* in Playground.astro.
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rows = (list, f) => list.map(f).join('');
const chip = (letter, bg, fg, cls = '') => `<span class="pq-chip ${cls}" style="background:${bg};color:${fg}">${esc(letter)}</span>`;
const ava = (n) => `<span class="pq-av a${n % 6}">${'AMJLKS'[n % 6]}</span>`;

// "title · more · more" -> "title"
const head = (title) => title.replace(/ · Pull Request.*| · Issue.*| · Run .*| - Stack Overflow$| - Google (Docs|Sheets)$| - YouTube$| – Figma$| - Gmail$| : r\/.*$| \| Notion$| - Jira$| - Linear$/, '');

function siteBar(t, o) {
  const { host, bg, fg, letter } = o;
  return `<div class="pq-top">${chip(letter, bg, fg)}<b>${esc(host)}</b><span class="pq-grow"></span><span class="pq-sm">Docs</span><span class="pq-sm">Pricing</span><span class="pq-sm">Sign in</span></div>`;
}

/* ---------- GitHub ---------- */
function ghHeader(o, active) {
  const parts = o.path.split('/').filter(Boolean);
  const [owner, repo] = parts.length > 1 && !['pulls', 'notifications', 'issues'].includes(parts[0]) ? parts : ['gran-software-solutions', 'tabnow'];
  const tab = (n, label, c) => `<span class="${active === n ? 'on' : ''}">${label}${c ? `<em>${c}</em>` : ''}</span>`;
  return `<div class="pq-ghh"><div class="r1">${chip('G', '#24292f', '#fff', 'rd')}<span class="repo">${esc(owner)} / <b>${esc(repo)}</b></span><span class="grow"></span><span class="find">Type / to search</span><span class="pq-av a1">A</span></div>
    <div class="r2">${tab('code', 'Code')}${tab('issues', 'Issues', '12')}${tab('pr', 'Pull requests', '3')}${tab('actions', 'Actions')}${tab('proj', 'Projects')}${tab('sec', 'Security')}${tab('ins', 'Insights')}</div></div>`;
}

function ghPull(t, o) {
  const num = (o.path.match(/\/(?:pull|issues)\/(\d+)/) || [, '38'])[1];
  const issue = /\/issues\//.test(o.path);
  const title = head(t.title).replace(/ · gran-software-solutions.*/, '');
  const diff = [
    ['h', '@@ -41,7 +41,18 @@ export function parseScope(q) {'],
    ['', '41', '  const m = /^\\/(t|b|h)\\s+/.exec(q);'],
    ['x', '42', "-  if (!m) return { scope: 'tabs', text: q };"],
    ['a', '42', "+  if (!m) return { scope: 'tabs', text: q.trim() };"],
    ['a', '43', "+  const scope = { t: 'tabs', b: 'bookmarks', h: 'history' }[m[1]];"],
    ['a', '44', '+  return { scope, text: q.slice(m[0].length) };'],
    ['', '45', '}'],
    ['x', '46', "-const SOURCES = ['tabs'];"],
    ['a', '46', "+const SOURCES = ['tabs', 'bookmarks', 'history'];"],
    ['', '47', ''],
    ['', '48', 'export function search(items, query, scope) {'],
    ['a', '49', '+  const pool = items.filter((i) => i.source === scope);'],
    ['', '50', '  return rank(pool, query).slice(0, 50);'],
  ];
  return `${ghHeader(o, issue ? 'issues' : 'pr')}<div class="pq-ghb">
    <h1>${esc(title)} <s>#${num}</s></h1>
    <div class="meta"><span class="badge">Open</span><span><b>alex-gran</b> ${issue ? 'opened this issue 3 days ago · 4 comments' : 'wants to merge 4 commits into <code>main</code> from <code>scope-prefixes</code>'}</span></div>
    <div class="tabs"><span class="on">Conversation<em>6</em></span>${issue ? '' : '<span>Commits<em>4</em></span><span>Checks<em>3</em></span><span>Files changed<em>3</em></span>'}</div>
    <div class="cols"><div>
      <div class="cmt">${ava(0)}<div><div class="ch"><b>alex-gran</b> commented 2 hours ago</div><p>${issue ? 'The window badge sits on top of the favicon when the dark theme is on, so the first letter of the title is cut off. It looks fine in the light theme.' : 'Typing <code>/b</code> or <code>/h</code> at the start of a search now looks only at bookmarks or history. Tabs stay the default, so nothing changes unless you ask for it.'}</p><p>${issue ? 'Steps: open two windows, switch the theme to dark, press Alt+E.' : 'I also added tests for the empty query and for a prefix with no space after it.'}</p></div></div>
      <div class="cmt">${ava(1)}<div><div class="ch"><b>mara-keller</b> commented 1 hour ago</div><p>${issue ? 'Reproduced on 1.4.2. The badge needs a 2px margin in dark mode.' : 'Nice. Can we show the active scope as a small chip in the search field? Otherwise people will not know why the list shrank.'}</p></div></div>
      ${issue ? '' : `<div class="diff"><div class="fh"><b>extension/fuzzy.js</b><span><i class="p">+14</i> <i class="m">-3</i></span></div>${rows(diff, ([k, n, c]) => k === 'h' ? `<div class="r h">${esc(n)}</div>` : `<div class="r ${k}"><u>${n}</u><code>${esc(c)}</code></div>`)}</div>`}
    </div><div class="side">
      <div><b>Reviewers</b><p>${ava(1)} mara-keller <i class="ok">Approved</i></p><p>${ava(2)} jonas-w</p></div>
      <div><b>Assignees</b><p>${ava(0)} alex-gran</p></div>
      <div><b>Labels</b><p><i class="lb" style="--c:#2da44e">enhancement</i> <i class="lb" style="--c:#0969da">search</i></p></div>
      <div><b>Projects</b><p>TabNow 1.5</p></div>
    </div></div></div>`;
}

function ghList(t, o) {
  const items = [
    ['feat: scope prefixes for bookmarks and history', '#38 opened 2 hours ago by alex-gran', 'enhancement', '6'],
    ['fix: keep the previous tab preselected after closing a tab', '#41 opened yesterday by mara-keller', 'bug', '2'],
    ['Debounce the pin sync on slow connections', '#57 opened 2 days ago by jonas-w', 'sync', '4'],
    ['Add month-close checklist to the timesheet view', '#812 opened 3 days ago by alex-gran', 'timesheet', '9'],
    ['Window badge overlaps favicon in dark mode', '#29 opened 4 days ago by mara-keller', 'bug', '3'],
    ['Update dependencies and regenerate the lockfile', '#36 opened last week by dependabot', 'dependencies', '1'],
    ['Docs: explain how the licence key is checked offline', '#33 opened last week by jonas-w', 'docs', '0'],
    ['Move the settings page to its own tab', '#31 opened 2 weeks ago by alex-gran', 'enhancement', '5'],
    ['Search ignores accents in German titles', '#27 opened 2 weeks ago by mara-keller', 'bug', '7'],
  ];
  return `${ghHeader(o, 'pr')}<div class="pq-ghb"><div class="pq-list"><div class="lh"><b>12 Open</b> <span>8 Closed</span><span class="grow"></span><span>Author</span><span>Label</span><span>Sort</span></div>
    ${rows(items, ([ti, sub, lab, c], i) => `<div class="li"><span class="dot"></span><div><b>${esc(ti)}</b> <i class="lb" style="--c:${['#2da44e', '#d1242f', '#0969da', '#8250df'][i % 4]}">${lab}</i><p>${esc(sub)}</p></div><span class="grow"></span><span class="cm">${c}</span></div>`)}</div></div>`;
}

/* ---------- Gmail ---------- */
const MAIL = [
  ['GitHub', '[gran-software-solutions/tabnow] feat: scope prefixes for bookmarks and history (PR #38)', 'alex-gran requested your review on this pull request.', '09:41', 1],
  ['Linear', 'GRAN-82 moved to In review', 'Release checklist for the Web Store listing was updated by Mara Keller.', '09:12', 1],
  ['Mara Keller', 'Re: Store screenshots', 'Looks great. Can we try the dark one with the blur at 24 as well?', '08:57', 1],
  ['Stripe', 'Your payout of 1,284.00 EUR is on its way', 'The payout for the period ending 18 October will arrive on 21 October.', '08:30', 0],
  ['Google Calendar', 'Invitation: Weekly sync @ Tue 20 Oct 10:30', 'Alex, Mara and 3 others. Join with Google Meet.', '08:04', 0],
  ['Jonas Weber', 'Invoice 2026-114', 'Hi Alex, please find the invoice for October attached. Payment terms are 14 days.', 'Mon', 0],
  ['Chrome Web Store', 'Your item "TabNow" is ready to publish', 'The review is complete. You can publish from the developer dashboard.', 'Mon', 0],
  ['Deutsche Bahn', 'Your trip Berlin Hbf - Hamburg Hbf on 23 October', 'Your booking confirmation and ticket are attached.', 'Sun', 0],
  ['Notion', 'Roadmap 2026 was edited by 2 people', 'Mara Keller changed 4 blocks, Jonas Weber added a comment.', 'Sat', 0],
  ['Vercel', 'Deployment ready: tabnow-site (main)', 'Production deployment is live. 38 pages, build took 41s.', 'Fri', 0],
  ['Datadog', '[Triggered] API latency p95 above 800 ms', 'The monitor has been triggered on host eu-central-1a for more than 5 minutes.', 'Fri', 0],
  ['Sophie Brandt', 'Quick question about the pricing page', 'Hi, is the Pro licence per person or per device? We are a team of six.', 'Thu', 0],
  ['Amazon.de', 'Your order has been shipped', 'Your package with 1 item will arrive on Friday, 23 October.', 'Thu', 0],
  ['Figma', 'Mara Keller commented in TabNow landing', '"Can we make the headline a bit smaller on the hero?"', 'Wed', 0],
];
function mail(t) {
  return `<div class="pq-gm"><div class="top"><span class="hb"><i></i><i></i><i></i></span><b class="logo">Gmail</b><div class="search">Search mail</div><span class="pq-av a1">A</span></div>
    <div class="body"><div class="nav"><div class="cmp">Compose</div><div class="on"><span>Inbox</span><b>14</b></div><div>Starred</div><div>Snoozed</div><div>Sent</div><div>Drafts<b>2</b></div><div>Purchases</div><div>More</div></div>
    <div class="main"><div class="tools"><i class="cb"></i><span class="on">Primary</span><span>Promotions</span><span>Social</span><time>1-50 of 312</time></div>
    ${rows(MAIL, ([f, s, sn, tm, u]) => `<div class="m${u ? ' u' : ''}"><i class="cb"></i><i class="st"></i><b class="fr">${esc(f)}</b><span class="sb"><b>${esc(s)}</b><em> - ${esc(sn)}</em></span><time>${tm}</time></div>`)}</div></div></div>`;
}

/* ---------- Google Docs / Sheets ---------- */
const DOCS = [
  ['Q4', ['Goals for the quarter', 'We ship the TabNow listing, move the invoice tracker to the new template and close the open items from the September review. Everything else waits until the store review is done.', 'Owners and dates', 'Alex owns the listing and the landing page, due Friday 23 October. Mara owns the screenshots and the short video. Jonas checks the privacy answers before we submit.', 'Open questions', 'Which price do we start with, and do we offer a trial? Decision on Tuesday in the weekly sync.']],
  ['Other', ['Summary', 'This document collects the decisions from the last three meetings so the whole team works from the same page.', 'Next steps', 'Review the draft, add comments where something is missing and mark the open items before Thursday.']],
];
function gdoc(t) {
  const title = head(t.title);
  const parts = (title.startsWith('Q4') ? DOCS[0] : DOCS[1])[1];
  return `<div class="pq-gd"><div class="hd">${chip('D', '#1a73e8', '#fff', 'sq')}<div><b>${esc(title)}</b><div class="mn"><span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Tools</span><span>Extensions</span><span>Help</span></div></div><span class="grow"></span><span class="share">Share</span><span class="pq-av a1">A</span></div>
    <div class="tb"><i style="width:70px"></i><i style="width:46px"></i><b>B</b><em>I</em><u>U</u><i style="width:90px"></i></div>
    <div class="canvas"><div class="paper"><h1>${esc(title)}</h1>${rows([0, 2, 4], (i) => `<h2>${parts[i]}</h2><p>${parts[i + 1]}</p>`)}<ul><li>Review the draft with Mara</li><li>Send the privacy answers to Jonas</li><li>Publish the page on Friday</li></ul></div></div></div>`;
}
function sheet(t) {
  const data = [['INV-2026-101', 'Brandt GmbH', '02.09.2026', '3,200.00', 'Paid'], ['INV-2026-102', 'Weber Consulting', '09.09.2026', '1,450.00', 'Paid'], ['INV-2026-103', 'Nordlicht AG', '15.09.2026', '5,980.00', 'Paid'], ['INV-2026-104', 'Keller & Partner', '22.09.2026', '2,100.00', 'Paid'], ['INV-2026-105', 'Brandt GmbH', '30.09.2026', '3,200.00', 'Paid'], ['INV-2026-106', 'Studio Sieben', '05.10.2026', '890.00', 'Open'], ['INV-2026-107', 'Weber Consulting', '12.10.2026', '1,450.00', 'Open'], ['INV-2026-108', 'Nordlicht AG', '16.10.2026', '5,980.00', 'Open'], ['INV-2026-109', 'Keller & Partner', '19.10.2026', '2,100.00', 'Draft'], ['INV-2026-110', 'Studio Sieben', '20.10.2026', '1,780.00', 'Draft']];
  return `<div class="pq-sh"><div class="hd">${chip('S', '#188038', '#fff', 'sq')}<div><b>${esc(head(t.title))}</b><div class="mn"><span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Data</span><span>Tools</span></div></div><span class="grow"></span><span class="share">Share</span></div>
    <div class="fx"><span>D6</span><i>fx</i><span>890</span></div>
    <div class="grid"><div class="c h"></div>${'ABCDEF'.split('').map((c) => `<div class="c h">${c}</div>`).join('')}
    ${[['Invoice', 'Client', 'Date', 'Amount (EUR)', 'Status', 'Note'], ...data].map((r, i) => `<div class="c h">${i + 1}</div>${r.map((v, j) => `<div class="c${i === 0 ? ' hd2' : ''}${j === 3 ? ' n' : ''}${v === 'Paid' ? ' ok' : v === 'Open' ? ' wn' : ''}">${esc(v)}</div>`).join('')}${i === 0 ? '' : '<div class="c"></div>'}`).join('')}
    ${rows([12, 13, 14, 15], (n) => `<div class="c h">${n}</div>${'      '.split('').map(() => '<div class="c"></div>').join('')}`)}</div></div>`;
}

/* ---------- Figma ---------- */
function figma(t) {
  const layers = ['Page 1', '▾ Hero / Desktop', '   Headline', '   Subline', '   Install button', '   Search panel', '▾ Pricing', '   Card / Free', '   Card / Pro', '▾ Footer', '   Links', '   Imprint'];
  return `<div class="pq-fg"><div class="tl"><span class="mk">▣</span><b>${esc(head(t.title))}</b><span class="grow"></span><span class="pq-av a2">M</span><span class="pq-av a1">A</span><span class="share">Share</span></div>
    <div class="cols"><div class="layers"><div class="tabs"><b>Layers</b><span>Assets</span></div>${rows(layers, (l, i) => `<div class="${i === 5 ? 'sel' : ''}">${esc(l)}</div>`)}</div>
    <div class="cv"><div class="fr" style="left:40px;top:46px;width:420px;height:300px"><label>Hero / Desktop</label><h3>Every tab, one keystroke away.</h3><p>Search your open tabs, bookmarks and history.</p><i class="btn">Add to Chrome</i><i class="pn"></i></div>
    <div class="fr" style="left:500px;top:46px;width:300px;height:420px"><label>Pricing</label><div class="cd"><b>Free</b><span>0 EUR</span></div><div class="cd pro"><b>Pro</b><span>19 EUR</span></div></div>
    <div class="fr" style="left:40px;top:380px;width:420px;height:110px"><label>Footer</label><p>Privacy · Imprint · Contact</p></div></div>
    <div class="props"><b>Design</b><div class="f"><span>X</span><i>1240</i><span>Y</span><i>312</i></div><div class="f"><span>W</span><i>340</i><span>H</span><i>278</i></div><b>Layer</b><div class="f"><span>Opacity</span><i>86%</i></div><b>Fill</b><div class="f"><u></u><i>FFFFFF</i><i>86%</i></div><b>Effects</b><div class="f"><span>Background blur</span><i>24</i></div></div></div></div>`;
}

/* ---------- Linear / Jira board ---------- */
function board(t, o) {
  const jira = o.key === 'ji';
  const cols = [
    ['Backlog', [['82', 'Release checklist for the Web Store listing', 'task'], ['85', 'Spike: search inside open PDFs', 'idea'], ['88', 'Translate the landing page to German', 'content']]],
    ['In progress', [['79', 'Scope prefixes for bookmarks and history', 'feature'], ['80', 'Window badge overlaps favicon in dark mode', 'bug']]],
    ['In review', [['76', 'Keep the previous tab preselected after closing a tab', 'bug'], ['77', 'Privacy answers for the store form', 'task']]],
    ['Done', [['70', 'Offline licence check', 'feature'], ['72', 'Landing page: day and night section', 'content'], ['73', 'Fix wrong count after closing a window', 'bug']]],
  ];
  const id = (n) => (jira ? 'CC-' + (1000 + +n) : 'GRAN-' + n);
  return `<div class="pq-bd"><div class="hd"><b>${esc(head(t.title))}</b><span class="grow"></span><span class="sm">Filter</span><span class="sm">Group</span><span class="pq-av a1">A</span><span class="pq-av a2">M</span></div>
    <div class="cols">${rows(cols, ([name, cards]) => `<div class="col"><div class="ch"><b>${name}</b><em>${cards.length}</em></div>${rows(cards, ([n, ti, lab]) => `<div class="kc"><span class="id">${id(n)}</span><p>${esc(ti)}</p><div class="ft"><i class="lb ${lab}">${lab}</i>${ava(+n)}</div></div>`)}</div>`)}</div></div>`;
}

/* ---------- YouTube ---------- */
function video(t, o) {
  const rel = [['The browser tab problem, explained', 'Dev Notes', '412K views · 3 weeks ago', '12:08'], ['Chrome DevTools tricks you are not using', 'Frontend Weekly', '1.2M views · 1 year ago', '18:44'], ['Why your extension is slow', 'Dev Notes', '88K views · 2 months ago', '9:31'], ['Build a command palette from scratch', 'Code Atlas', '230K views · 6 months ago', '24:10'], ['Keyboard-first workflows', 'Maker Hours', '56K views · 4 days ago', '7:52'], ['What is a service worker?', 'Frontend Weekly', '640K views · 2 years ago', '14:20']];
  return `<div class="pq-yt"><div class="main"><div class="player"><span class="play"></span><div class="ctl"><i class="bar"><u></u></i><span>6:42 / 20:03</span></div></div>
    <h1>${esc(head(t.title))}</h1><div class="ch">${chip('D', '#e62117', '#fff', 'rd big')}<div><b>Dev Notes</b><span>184K subscribers</span></div><span class="sub">Subscribe</span><span class="grow"></span><span class="pill">Like 12K</span><span class="pill">Share</span></div>
    <div class="desc"><b>94,213 views  3 weeks ago</b><p>A calm walkthrough of how a Chrome extension is put together: the manifest, the service worker, content scripts and what each one is allowed to touch. Chapters below.</p></div></div>
    <div class="rel">${rows(rel, ([ti, ch, v, d], i) => `<div><span class="th t${i % 3}"><em>${d}</em></span><p><b>${esc(ti)}</b><span>${ch}</span><span>${v}</span></p></div>`)}</div></div>`;
}

/* ---------- Stack Overflow / Reddit ---------- */
function qa(t, o) {
  const reddit = o.key === 'rd';
  const title = head(t.title);
  if (reddit) {
    return `<div class="pq-rd"><div class="hd">${chip('R', '#ff4500', '#fff', 'rd big')}<b>r/chrome_extensions</b><span class="grow"></span><span class="sm">Log in</span></div><div class="post"><div class="v"><i>▲</i><b>412</b><i>▼</i></div><div><span class="sub">Posted by u/tabhoarder · 5 hours ago</span><h1>${esc(title)}</h1><p>I currently have around 140 tabs open across three windows and I can no longer find anything. Tab groups help a bit but I still end up scrolling the strip. What do you use?</p>
    <div class="cm"><b>u/quietcoder</b> <span>3 hours ago</span><p>A keyboard search over open tabs changed everything for me. I press one shortcut, type three letters and I am there.</p></div>
    <div class="cm"><b>u/lena_dev</b> <span>2 hours ago</span><p>I close everything at the end of the day and keep a reading list for anything I still need.</p></div></div></div></div>`;
  }
  return `<div class="pq-so"><div class="hd">${chip('S', '#f48024', '#fff', 'sq')}<b>Stack Overflow</b><span class="find">Search…</span><span class="grow"></span><span class="sm">Log in</span><span class="btn">Sign up</span></div>
    <div class="cols"><div><h1>${esc(title)}</h1><div class="meta"><span>Asked <b>14 years ago</b></span><span>Modified <b>1 month ago</b></span><span>Viewed <b>9.8M times</b></span></div>
    <div class="q"><div class="v"><i>▲</i><b>7612</b><i>▼</i></div><div><p>I have an array of numbers and I want to remove one specific item from it. Is there a method like <code>array.remove(value)</code> in JavaScript? I would like to use plain JavaScript, no frameworks.</p>
    <pre><code>const numbers = [2, 5, 9];\nconst index = numbers.indexOf(5);\nif (index &gt; -1) {\n  numbers.splice(index, 1);\n}\n// numbers is now [2, 9]</code></pre><p>Is this the best way?</p></div></div>
    <div class="ans"><h3>38 Answers</h3><div class="q ok"><div class="v"><i>▲</i><b>12840</b><i>▼</i><em>✓</em></div><div><p>Find the <code>index</code> of the array element you want to remove using <code>indexOf</code>, and then remove that index with <code>splice</code>. The second parameter of <code>splice</code> is the number of elements to remove.</p></div></div></div></div>
    <div class="side"><div><b>The Overflow Blog</b><p>How to write code that other people can read</p><p>Podcast: what makes a good code review</p></div><div><b>Related</b><p>How to remove an element by value?</p><p>How do I empty an array in JavaScript?</p></div></div></div></div>`;
}

/* ---------- Slack / Claude ---------- */
function chat(t, o) {
  const ai = o.key === 'cl';
  if (ai) {
    return `<div class="pq-ai"><div class="rail"><b>Chats</b><p class="on">${esc(head(t.title).replace(/ - Claude$/, ''))}</p><p>Invoice template for October</p><p>Regex for German phone numbers</p><p>Weekly sync agenda</p></div>
      <div class="conv"><div class="u">How should a tab search rank results when the query matches both a title and a URL?</div><div class="a"><p>Weight the title higher than the URL, and give a bonus for matches at the start of a word. A match that is spread over many letters should score lower than a short, tight one.</p><p>Then break ties by recency, so the tab you used a minute ago wins over one you opened last week.</p></div><div class="in">Reply…</div></div></div>`;
  }
  const ch = (t.title.match(/#\s*([\w-]+)/) || [, 'design-reviews'])[1];
  const msgs = [['Mara Keller', '9:02 AM', 'Morning! The new store screenshots are in the folder. Let me know which crop you prefer.'], ['Alex', '9:05 AM', 'Thanks. I like the dark one with the blur at 24. Can you export it at 1280 x 800?'], ['Jonas Weber', '9:11 AM', 'Heads up, the privacy answers for the store form are ready. Please have a look before we submit.'], ['Mara Keller', '9:20 AM', 'Done, exported. Also moved the headline up by 8px, it felt cramped.'], ['Alex', '9:24 AM', 'Perfect. I will publish the listing after the weekly sync.']];
  return `<div class="pq-sl"><div class="rail"><b>GRAN</b><p class="h">Channels</p><p># general</p><p class="on"># ${esc(ch)}</p><p># releases</p><p># random</p><p class="h">Direct messages</p><p>Mara Keller</p><p>Jonas Weber</p></div>
    <div class="main"><div class="hd"># <b>${esc(ch)}</b><span>Screens and copy that need a second pair of eyes</span></div><div class="msgs">${rows(msgs, ([n, tm, tx], i) => `<div class="msg">${ava(i + 1)}<div><b>${n}</b> <time>${tm}</time><p>${esc(tx)}</p></div></div>`)}</div><div class="in">Message #${esc(ch)}</div></div></div>`;
}

/* ---------- article (docs, wikis, notes, anything else) ---------- */
const BODY = [
  'Everything starts with a clear goal. Before anything is built, the team writes down what the page should do for the person reading it, and what that person should be able to do afterwards.',
  'The next step is to look at what already exists. Most of the time the answer is a small change to something that works, not a new system. That keeps the result easy to maintain and easy to explain.',
  'Finally, check the result with someone who has not seen it before. If they can find what they need within a few seconds, the page does its job. If not, shorten it and try again.',
];
function article(t, o) {
  const title = head(t.title);
  return `${siteBar(t, o)}<div class="pq-art"><div class="side"><b>Contents</b><p class="on">Overview</p><p>Getting started</p><p>Concepts</p><p>Reference</p><p>Examples</p><p>FAQ</p></div>
    <div class="txt"><span class="crumb">${esc(o.host)} › Docs › Guide</span><h1>${esc(title)}</h1><p class="lede">A short guide with everything you need to get going, from the first steps to the details you will look up later.</p>
    <h2>Overview</h2><p>${BODY[0]}</p><p>${BODY[1]}</p><pre><code>const result = await run({ query: "tabs", limit: 10 });\nconsole.log(result.items.length);</code></pre><h2>Getting started</h2><p>${BODY[2]}</p></div></div>`;
}

export function mockPage(kind, t, o) {
  const path = o.path;
  const fns = { mail, sheet, figma, board, video, chat, qa, plain: article };
  if (o.key === 'gh') return /\/(pull|issues)\/\d+/.test(path) ? ghPull(t, o) : ghList(t, o);
  if (o.key === 'gd') return gdoc(t);
  return (fns[kind] || article)(t, o);
}
