/* Wilddex daily challenges — three fresh quests each day, seeded by the date so
   everyone in the world gets the same board. Progress advances from real app
   events (discoveries, habitat visits, social visits); rewards pay out in
   coins, XP and leaves via the store. */
import * as db from '../core/db.js';
import * as store from '../core/store.js';

const POOL = [
  { id: 'any1', kind: 'discover', n: 1, icon: '🔍', title: 'Identify 1 animal today', reward: { coins: 40, xp: 30 } },
  { id: 'any3', kind: 'discover', n: 3, icon: '🧭', title: 'Identify 3 animals today', reward: { coins: 90, xp: 70 } },
  { id: 'first1', kind: 'discover_first', n: 1, icon: '✨', title: 'Add a new species to your journal', reward: { coins: 70, xp: 60 } },
  { id: 'bird1', kind: 'discover_bird', n: 1, icon: '🪶', title: 'Record a bird', reward: { coins: 60, xp: 45 } },
  { id: 'marine1', kind: 'discover_marine', n: 1, icon: '🌊', title: 'Record a marine species', reward: { coins: 60, xp: 45 } },
  { id: 'insect1', kind: 'discover_insect', n: 1, icon: '🦋', title: 'Record an insect', reward: { coins: 60, xp: 45 } },
  { id: 'photo1', kind: 'photo_id', n: 1, icon: '📷', title: 'Identify an animal from a photo', reward: { coins: 55, xp: 40 } },
  { id: 'threat1', kind: 'discover_threatened', n: 1, icon: '🛡️', title: 'Record a threatened species', reward: { coins: 80, xp: 60, leaves: 2 } },
  { id: 'habitat1', kind: 'visit_habitat', n: 1, icon: '🌿', title: 'Check in on your habitats', reward: { coins: 30, xp: 20 } },
  { id: 'visit1', kind: 'visit_player', n: 1, icon: '🏕️', title: "Visit another explorer's habitat", reward: { coins: 45, xp: 30 } },
  { id: 'visit2', kind: 'visit_player', n: 2, icon: '🗺️', title: 'Visit 2 explorers today', reward: { coins: 70, xp: 45 } }
];
const ALWAYS = 'any1';
const dayKey = () => new Date().toISOString().slice(0, 10);
function rng(seedStr) { let h = 1779033703; for (let i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }

let state = null;
function fresh() {
  const r = rng('wilddex-' + dayKey());
  const rest = POOL.filter((q) => q.id !== ALWAYS);
  const picked = [POOL.find((q) => q.id === ALWAYS)];
  while (picked.length < 3 && rest.length) { const i = Math.floor(r() * rest.length); const q = rest.splice(i, 1)[0]; if (!picked.some((p) => p.kind === q.kind)) picked.push(q); }
  return { date: dayKey(), items: picked.map((q) => ({ id: q.id, progress: 0, done: false, claimed: false })) };
}
export async function getToday() {
  if (!state) state = await db.kvGet('quests', null);
  if (!state || state.date !== dayKey()) { state = fresh(); await db.kvSet('quests', state); }
  return state.items.map((it) => ({ ...POOL.find((q) => q.id === it.id), ...it }));
}
async function save() { await db.kvSet('quests', state); }
export async function bump(kind, amount = 1) {
  await getToday(); let changed = false;
  for (const it of state.items) {
    const def = POOL.find((q) => q.id === it.id);
    if (def.kind !== kind || it.done) continue;
    it.progress = Math.min(def.n, it.progress + amount);
    if (it.progress >= def.n) it.done = true;
    changed = true;
  }
  if (changed) await save();
  return changed;
}
export async function claim(id) {
  await getToday();
  const it = state.items.find((x) => x.id === id);
  const def = POOL.find((q) => q.id === id);
  if (!it || !def || !it.done || it.claimed) return null;
  it.claimed = true; await save();
  await store.grant({ coins: def.reward.coins || 0, xp: def.reward.xp || 0, leaves: def.reward.leaves || 0 });
  return def.reward;
}
export function msToMidnight() { const d = new Date(); const m = new Date(d); m.setHours(24, 0, 0, 0); return m - d; }
export function timerLabel() { const ms = msToMidnight(); const h = Math.floor(ms / 36e5), m = Math.floor((ms % 36e5) / 6e4); return `resets in ${h}h ${m}m`; }

const INSECT_CLASSES = new Set(['Insecta', 'Arachnida']);
export function init() {
  store.on('discovery', async (e) => {
    const { record, first, threatened } = e.detail || {};
    await bump('discover');
    if (first) await bump('discover_first');
    if (record?.class === 'Aves') await bump('discover_bird');
    if (record?.realm === 'marine') await bump('discover_marine');
    if (INSECT_CLASSES.has(record?.class)) await bump('discover_insect');
    if (threatened) await bump('discover_threatened');
    // 'photo_id', 'visit_habitat' and 'visit_player' are bumped directly by their views.
  });
}
