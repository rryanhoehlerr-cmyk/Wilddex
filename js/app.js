import * as auth from './core/auth.js';
import * as store from './core/store.js';
import * as shell from './ui/shell.js';
import * as db from './core/db.js';
import * as quests from './features/quests.js';
import * as expeditions from './features/expeditions.js';
import { CONFIG } from './config.js';
async function boot() {
  registerSW();
  await auth.init();
  try { const seen = await db.kvGet('appVersion', null); if (CONFIG.app.resetOnVersionChange && seen !== CONFIG.app.version) { await db.resetUserData(); await db.kvSet('appVersion', CONFIG.app.version); } } catch (_) {}
  await store.load();
  quests.init();
  expeditions.init();
  document.getElementById('tabbar').hidden = false;
  const b = document.getElementById('banner'); if (b) b.hidden = true;
  const user = auth.current();
  if (!user && !location.hash) location.hash = '#/auth'; else if (!location.hash) location.hash = '#/home';
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { const t = e.target; if (t && t.matches && t.matches('[role="button"]:not(button):not(a)')) { e.preventDefault(); t.click(); } } });
  const showOnboarding = () => { if (auth.current()) import('./ui/onboarding.js').then((o) => o.maybeShow()).catch(() => {}); };
  shell.start(); auth.onChange(() => { shell.render(); showOnboarding(); });
  showOnboarding();
  navigator.serviceWorker?.addEventListener?.('message', (e) => { if (e.data?.type === 'SYNC_NOW') store.syncNow(); });
}
function registerSW() {
  if (!('serviceWorker' in navigator)) return; let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloaded) return; reloaded = true; location.reload(); });
  window.addEventListener('load', async () => { try { const reg = await navigator.serviceWorker.register('service-worker.js', { scope: './', updateViaCache: 'none' }); reg.update(); } catch (e) {} });
}
boot();
