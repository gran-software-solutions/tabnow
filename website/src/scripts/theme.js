// Theme: follows the system until the visitor picks one, then remembered. Alt+T toggles on any
// page. The saved choice is applied before first paint by the inline script in Base.astro.
const html = document.documentElement;
const sw = document.querySelector('[data-theme-toggle]');
let stored = null;
try { stored = localStorage.getItem('tabnow-theme'); } catch (e) {}

function label(theme) {
  if (sw) sw.setAttribute('aria-label', theme === 'dark' ? sw.dataset.toLight : sw.dataset.toDark);
}
function setTheme(theme, save) {
  html.classList.add('fade');
  html.dataset.theme = theme;
  label(theme);
  if (save) { stored = theme; try { localStorage.setItem('tabnow-theme', theme); } catch (e) {} }
  clearTimeout(setTheme.timer);
  setTheme.timer = setTimeout(() => html.classList.remove('fade'), 650);
}
const toggle = () => setTheme(html.dataset.theme === 'dark' ? 'light' : 'dark', true);

label(html.dataset.theme);
if (sw) sw.addEventListener('click', toggle);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!stored) setTheme(e.matches ? 'dark' : 'light', false);
});
addEventListener('keydown', (e) => {
  if (e.altKey && e.key.toLowerCase() === 't') { e.preventDefault(); toggle(); }
});
