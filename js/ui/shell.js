import { el } from './components.js';
const viewEl = () => document.getElementById('view');
const tabbar = () => document.getElementById('tabbar');
const ROUTES = [
  { re: /^#?\/?$/, load: () => import('./views.js').then((m) => m.home) },
  { re: /^#\/home$/, load: () => import('./views.js').then((m) => m.home) },
  { re: /^#\/collection$/, load: () => import('./views.js').then((m) => m.collection) },
  { re: /^#\/explore$/, load: () => import('./views.js').then((m) => m.explore) },
  { re: /^#\/taxon\/([^/]+)$/, load: () => import('./views.js').then((m) => m.taxonGroup) },
  { re: /^#\/region\/([^/]+)$/, load: () => import('./views.js').then((m) => m.region) },
  { re: /^#\/set\/([^/]+)$/, load: () => import('./views.js').then((m) => m.setView) },
  { re: /^#\/rare$/, load: () => import('./views.js').then((m) => m.rare) },
  { re: /^#\/habitats$/, load: () => import('./habitats.js').then((m) => m.view) },
  { re: /^#\/profile$/, load: () => import('./views.js').then((m) => m.profile) },
  { re: /^#\/auth$/, load: () => import('./views.js').then((m) => m.auth) },
  { re: /^#\/species\/([^/]+)$/, load: () => import('./species.js').then((m) => m.view) },
  { re: /^#\/capture(?:\?.*)?$/, load: () => import('./capture.js').then((m) => m.view) },
  { re: /^#\/play$/, load: () => import('./social.js').then((m) => m.view) },
  { re: /^#\/player\/([^/]+)$/, load: () => import('./social.js').then((m) => m.playerView) }
];
const TABS = [ { id: 'home', hash: '#/home', label: 'Home', icon: 'home' }, { id: 'habitats', hash: '#/habitats', label: 'Habitats', icon: 'leaf' }, { id: 'capture', hash: '#/capture', icon: 'capture', fab: true }, { id: 'collection', hash: '#/collection', label: 'Collect', icon: 'grid' }, { id: 'play', hash: '#/play', label: 'Play', icon: 'users' } ];
const ICONS = { users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c0-3.1 2.4-5.2 5.5-5.2s5.5 2.1 5.5 5.2"/><circle cx="16.6" cy="9.5" r="2.5"/><path d="M15.5 13.9c2.8.2 5 2.1 5 4.8"/>', home: '<path d="M4 11l8-7 8 7M6 9.5V20h12V9.5"/>', grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>', compass: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>', user: '<circle cx="12" cy="8" r="3.6"/><path d="M5.5 19.5c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/>', leaf: '<path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M7 17c3-4 6-6 10-7"/>', capture: '<rect x="2.5" y="6.5" width="19" height="13.5" rx="3"/><circle cx="12" cy="13.2" r="3.6"/><path d="M8 6.5l1.4-2.2h5.2L16 6.5"/>' };
export function buildNav() { const bar = tabbar(); bar.hidden = false; bar.innerHTML = ''; for (const t of TABS) { if (t.fab) bar.append(el('button', { class: 'fab', 'aria-label': 'Identify', onclick: () => { try { navigator.vibrate && navigator.vibrate(10); } catch (_) {} location.hash = t.hash; } }, svg(ICONS.capture, '#08120b'))); else bar.append(el('button', { class: 'tab', dataset: { tab: t.id }, onclick: () => { try { navigator.vibrate && navigator.vibrate(5); } catch (_) {} location.hash = t.hash; } }, svg(ICONS[t.icon]), el('span', {}, t.label))); } }
function svg(paths, stroke = 'currentColor') { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.innerHTML = paths.replace(/<(path|rect|circle)/g, `<$1 stroke="${stroke}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"`); return s; }
function setActiveTab(id) { document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', t.dataset.tab === id)); }
let _token = 0;
export async function render() {
  const hash = location.hash || '#/home'; const route = ROUTES.find((r) => r.re.test(hash)); const v = viewEl(); const myToken = ++_token; v.classList.add('leaving');
  if (!route) { v.innerHTML = '<div class="pad"><h2>Not found</h2></div>'; v.classList.remove('leaving'); return; }
  const params = (hash.match(route.re) || []).slice(1).map(decodeURIComponent);
  try { const fn = await route.load(); if (myToken !== _token) return; const node = await fn(...params); if (myToken !== _token) return; v.innerHTML = ''; v.append(node); v.scrollTop = 0; }
  catch (e) { v.innerHTML = `<div class="pad"><div class="back-head"><button class="back-btn" onclick="history.length>1?history.back():(location.hash='#/home')">&lsaquo;</button><h1 class="h-title">Something went wrong</h1></div><p class="muted" style="margin-top:14px">${e.message}</p><button class="btn" onclick="location.reload()">Reload</button></div>`; }
  v.classList.remove('leaving');
  const tabId = hash.split('/')[1] || 'home'; setActiveTab(['home', 'habitats', 'collection', 'play'].includes(tabId) ? tabId : (tabId === 'explore' ? 'home' : ''));
  updateEcoBadge();
}
async function updateEcoBadge() {
  try {
    const store = await import('../core/store.js');
    const col = await store.getCollection();
    const p = store.pendingResources(col);
    const tab = document.querySelector('.tab[data-tab="habitats"]'); if (!tab) return;
    let b = tab.querySelector('.tab-badge');
    if ((p.seeds + p.nectar + p.plankton) > 0) { if (!b) tab.append(el('span', { class: 'tab-badge', 'aria-label': 'Resources ready to harvest' })); }
    else if (b) b.remove();
  } catch (_) {}
}
export function start() { buildNav(); window.addEventListener('hashchange', render); render(); }
