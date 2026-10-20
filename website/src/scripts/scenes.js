// Realistic pages for the "Day and night" canvases. Plain HTML/CSS, no images, no requests.
// Light canvas: a Gmail-style inbox. Dark canvas: a GitHub-style pull request. Styles: .wp in global.css.
const chrome = (url, inner) => `<div class="wp"><div class="wp-bar"><i></i><i></i><i></i><span class="wp-url">${url}</span></div><div class="wp-view">${inner}</div></div>`;

const MAIL = [
  ['GitHub', '[gran-software-solutions/tabnow] feat: scope prefixes for bookmarks and history (PR #38)', 'alex-gran requested your review on this pull request. Adds /b and /h so a search can look only at bookmarks or history.', '09:41', 1],
  ['Linear', 'GRAN-82 moved to In review', 'Release checklist for the Web Store listing was updated by Mara Keller.', '09:12', 1],
  ['Mara Keller', 'Re: Store screenshots', 'Looks great. Can we try the dark one with the blur at 24 as well? I attached the new crop for the second slide.', '08:57', 1],
  ['Stripe', 'Your payout of 1,284.00 EUR is on its way', 'The payout for the period ending 18 October will arrive in your bank account on 21 October.', '08:30', 0],
  ['Google Calendar', 'Invitation: Weekly sync @ Tue 20 Oct 10:30', 'Alex, Mara and 3 others. Join with Google Meet. Agenda: store review, pricing page, Q4 roadmap.', '08:04', 0],
  ['Jonas Weber', 'Invoice 2026-114', 'Hi Alex, please find the invoice for October attached. Payment terms are 14 days. Thanks and best regards.', 'Mon', 0],
  ['Chrome Web Store', 'Your item "TabNow" is ready to publish', 'The review is complete. You can publish the item from the developer dashboard whenever you are ready.', 'Mon', 0],
  ['Deutsche Bahn', 'Your trip Berlin Hbf - Hamburg Hbf on 23 October', 'Your booking confirmation and ticket are attached. Departure 07:58, platform 12, seat reservation 36.', 'Sun', 0],
  ['Notion', 'Roadmap 2026 was edited by 2 people', 'Mara Keller changed 4 blocks, Jonas Weber added a comment on "Q4 launch plan".', 'Sat', 0],
  ['Vercel', 'Deployment ready: tabnow-site (main)', 'Production deployment is live. 38 pages, build took 41s. Visit tabnow-site.vercel.app.', 'Fri', 0],
  ['Datadog', '[Triggered] API latency p95 above 800 ms', 'The monitor has been triggered on host eu-central-1a for more than 5 minutes.', 'Fri', 0],
];
const mailRow = ([from, subj, snip, time, unread]) =>
  `<div class="m${unread ? ' u' : ''}"><i class="cb"></i><i class="st"></i><b class="fr">${from}</b><span class="sb"><b>${subj}</b><em> - ${snip}</em></span><time>${time}</time></div>`;

export const gmailScene = () => chrome('mail.google.com/mail/u/0/#inbox', `
  <div class="gm">
    <div class="gm-top"><span class="gm-menu"><i></i><i></i><i></i></span><b class="gm-logo">Gmail</b>
      <div class="gm-search"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>Search mail</div><span class="gm-av">A</span></div>
    <div class="gm-body">
      <div class="gm-nav"><div class="cmp">Compose</div>
        <div class="on"><span>Inbox</span><b>14</b></div><div>Starred</div><div>Snoozed</div><div>Sent</div><div>Drafts<b>2</b></div><div>More</div></div>
      <div class="gm-main"><div class="gm-tools"><i class="cb"></i><span class="on">Primary</span><span>Promotions</span><span>Social</span><time>1-50 of 312</time></div>${MAIL.map(mailRow).join('')}</div>
    </div>
  </div>`);

export const prScene = () => chrome('github.com/gran-software-solutions/tabnow/pull/38', `
  <div class="gh">
    <div class="gh-head"><span class="gh-chip">G</span><span class="gh-repo">gran-software-solutions <u>/</u> <b>tabnow</b></span><span class="gh-find">Type / to search</span></div>
    <div class="gh-nav"><span>Code</span><span>Issues <em>12</em></span><span class="on">Pull requests <em>3</em></span><span>Actions</span><span>Projects</span><span>Security</span></div>
    <div class="gh-body">
      <h1>feat: scope prefixes for bookmarks and history <s>#38</s></h1>
      <div class="gh-meta"><span class="open">Open</span><span><b>alex-gran</b> wants to merge 4 commits into <code>main</code> from <code>scope-prefixes</code></span></div>
      <div class="gh-tabs"><span class="on">Conversation <em>6</em></span><span>Commits <em>4</em></span><span>Checks <em>3</em></span><span>Files changed <em>3</em></span></div>
      <div class="gh-cmt"><span class="av">A</span><div><div class="ch"><b>alex-gran</b> commented 2 hours ago</div>
        <p>Typing <code>/b</code> or <code>/h</code> at the start of a search now looks only at bookmarks or history. Tabs stay the default, so nothing changes unless you ask for it.</p></div></div>
      <div class="gh-diff"><div class="fh"><b>extension/fuzzy.js</b><span><i class="p">+14</i> <i class="m">-3</i></span></div>
<div class="r h"><u>@@ -41,7 +41,18 @@</u><code> export function parseScope(q) {</code></div>
<div class="r"><u>41</u><code>  const m = /^\/(t|b|h)\s+/.exec(q);</code></div>
<div class="r x"><u>42</u><code>-  if (!m) return { scope: 'tabs', text: q };</code></div>
<div class="r a"><u>42</u><code>+  if (!m) return { scope: 'tabs', text: q.trim() };</code></div>
<div class="r a"><u>43</u><code>+  const scope = { t: 'tabs', b: 'bookmarks', h: 'history' }[m[1]];</code></div>
<div class="r a"><u>44</u><code>+  return { scope, text: q.slice(m[0].length) };</code></div>
<div class="r"><u>45</u><code>}</code></div>
<div class="r x"><u>46</u><code>-const SOURCES = ['tabs'];</code></div>
<div class="r a"><u>46</u><code>+const SOURCES = ['tabs', 'bookmarks', 'history'];</code></div></div>
    </div>
  </div>`);
