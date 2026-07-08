/* ============================================================
   EXPEDITIONS — weekly themed field campaigns.
   A rotating, season-flavored event (Reef Week, Great Bird Count,
   Night Safari…) with three real objectives that advance as you
   discover matching wildlife. Bigger, slower-burn goals than the
   daily challenges, with stacked rewards and a weekly reset — the
   retention layer that pairs with the Living World engine.
   Deterministic per ISO week, shared by every player.
   ============================================================ */
import * as db from '../core/db.js';
import * as store from '../core/store.js';
import { lookup as libLookup } from '../data/library.js';

const NOCTURNAL = new Set(['owl', 'bat', 'frog', 'salamander']);
const RAPTOR = new Set(['owl', 'raptor']);
const WATERBIRD = new Set(['duck', 'heron', 'swan', 'flamingo', 'penguin']);
const BIGCAT_BEAR = new Set(['bigcat', 'bear']);
const MARINE_MAMMAL = new Set(['whale', 'dolphin', 'seal', 'manatee', 'walrus']);
const POLLINATOR = new Set(['bee', 'dragonfly']);
const LEP = new Set(['butterfly']);
const REEF_INVERT = new Set(['coral', 'nudibranch', 'crab', 'octopus', 'seastar', 'urchin', 'shell', 'seahorse', 'lobster', 'shrimp']);
const SHARK_RAY = new Set(['shark', 'ray']);

// Classify a discovered record into traits objectives can test.
function classify(record) {
  const cls = record.class || record.cls || '';
  const hit = libLookup({ scientificName: record.scientificName, canonicalName: record.canonicalName || record.scientificName });
  const e = hit && hit.canonical ? hit.entry : null;
  const rig = e ? e.rig : null;
  const habitat = e ? e.habitat : null;
  const status = (record.iucnCategory || (e && e.status) || '').toUpperCase();
  return {
    cls, rig, habitat, marine: record.realm === 'marine',
    threatened: ['VU', 'EN', 'CR'].includes(status),
    isBird: cls === 'Aves', isInsect: cls === 'Insecta', isMammal: cls === 'Mammalia',
    isAmphibian: cls === 'Amphibia', isReptile: ['Reptilia', 'Squamata', 'Testudines'].includes(cls)
  };
}

// Six expeditions, cycling weekly — order matches data/players.js weeklyEvent().
export const EXPEDITIONS = [
  { id: 'reef', icon: '🌊', title: 'Reef Week', blurb: 'The reef is bursting with life — chart its inhabitants.',
    obj: [
      { id: 'marine4', label: 'Record 4 marine species', n: 4, m: (i) => i.marine },
      { id: 'sharkray', label: 'Record a shark or ray', n: 1, m: (i) => SHARK_RAY.has(i.rig) },
      { id: 'invert2', label: 'Record 2 reef invertebrates', n: 2, m: (i) => REEF_INVERT.has(i.rig) }
    ], reward: { coins: 220, gems: 3, plankton: 45 } },
  { id: 'birds', icon: '🪶', title: 'Great Bird Count', blurb: 'A global census of the skies — every bird counts.',
    obj: [
      { id: 'bird5', label: 'Record 5 birds', n: 5, m: (i) => i.isBird },
      { id: 'raptor', label: 'Record a bird of prey', n: 1, m: (i) => RAPTOR.has(i.rig) },
      { id: 'water', label: 'Record a waterbird', n: 1, m: (i) => WATERBIRD.has(i.rig) }
    ], reward: { coins: 220, gems: 3, seeds: 45 } },
  { id: 'pollinators', icon: '🦋', title: 'Pollinator Days', blurb: 'Follow the pollinators through the summer bloom.',
    obj: [
      { id: 'insect4', label: 'Record 4 insects', n: 4, m: (i) => i.isInsect },
      { id: 'lep2', label: 'Record 2 butterflies or moths', n: 2, m: (i) => LEP.has(i.rig) },
      { id: 'beedf', label: 'Record a bee or dragonfly', n: 1, m: (i) => POLLINATOR.has(i.rig) }
    ], reward: { coins: 220, gems: 3, nectar: 45 } },
  { id: 'night', icon: '🌙', title: 'Night Safari', blurb: 'The night shift emerges — seek the creatures of the dark.',
    obj: [
      { id: 'noct3', label: 'Record 3 nocturnal animals', n: 3, m: (i) => NOCTURNAL.has(i.rig) },
      { id: 'amph2', label: 'Record 2 amphibians', n: 2, m: (i) => i.isAmphibian },
      { id: 'mammal', label: 'Record a mammal', n: 1, m: (i) => i.isMammal }
    ], reward: { coins: 220, gems: 3, seeds: 45 } },
  { id: 'mammals', icon: '🐾', title: 'Big Mammal Week', blurb: 'From foxes to whales — track the great beasts.',
    obj: [
      { id: 'mammal5', label: 'Record 5 mammals', n: 5, m: (i) => i.isMammal },
      { id: 'apex', label: 'Record a big cat or bear', n: 1, m: (i) => BIGCAT_BEAR.has(i.rig) },
      { id: 'marmam', label: 'Record a marine mammal', n: 1, m: (i) => MARINE_MAMMAL.has(i.rig) }
    ], reward: { coins: 220, gems: 3, seeds: 45 } },
  { id: 'guardians', icon: '🛡️', title: 'Guardians Week', blurb: 'Document the vulnerable — knowledge protects them.',
    obj: [
      { id: 'threat3', label: 'Record 3 threatened species', n: 3, m: (i) => i.threatened },
      { id: 'any5', label: 'Record 5 species', n: 5, m: () => true },
      { id: 'herp', label: 'Record a reptile or amphibian', n: 1, m: (i) => i.isReptile || i.isAmphibian }
    ], reward: { coins: 260, gems: 4, leaves: 8, conservation: 60 } }
];

function weekId(d = new Date()) { const jan1 = new Date(d.getFullYear(), 0, 1); const w = Math.floor(((d - jan1) / 864e5 + jan1.getDay()) / 7); return d.getFullYear() + '-W' + w; }
function weekIndex(d = new Date()) { const jan1 = new Date(d.getFullYear(), 0, 1); return Math.floor(((d - jan1) / 864e5 + jan1.getDay()) / 7) % EXPEDITIONS.length; }
export function currentDef(d = new Date()) { return EXPEDITIONS[weekIndex(d)]; }
export function msToWeekEnd(d = new Date()) { const day = (d.getDay() + 6) % 7; const end = new Date(d); end.setDate(d.getDate() + (7 - day)); end.setHours(0, 0, 0, 0); return end - d; }
export function timerLabel() { const ms = msToWeekEnd(); const days = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5); return days > 0 ? `${days}d ${h}h left` : `${h}h left`; }

let state = null;
function fresh() { const def = currentDef(); const obj = {}; def.obj.forEach((o) => (obj[o.id] = { keys: [], claimed: false })); return { week: weekId(), exp: def.id, obj, bonusClaimed: false }; }
async function load() { if (!state) state = await db.kvGet('expedition', null); if (!state || state.week !== weekId()) { state = fresh(); await db.kvSet('expedition', state); } return state; }
async function save() { await db.kvSet('expedition', state); }

export async function get() {
  await load();
  const def = currentDef();
  const objectives = def.obj.map((o) => { const st = state.obj[o.id] || { keys: [], claimed: false }; const progress = Math.min(o.n, st.keys.length); return { ...o, progress, done: progress >= o.n, claimed: st.claimed }; });
  const allDone = objectives.every((o) => o.done);
  return { def, objectives, allDone, bonusClaimed: state.bonusClaimed };
}
export async function claim(objId) {
  await load(); const def = currentDef(); const o = def.obj.find((x) => x.id === objId); const st = state.obj[objId];
  if (!o || !st || st.claimed || st.keys.length < o.n) return null;
  st.claimed = true; await save();
  const per = Math.round(def.reward.coins / def.obj.length);
  await store.grant({ coins: per, xp: 40 });
  return { coins: per };
}
export async function claimBonus() {
  const g = await get();
  if (!g.allDone || state.bonusClaimed) return null;
  state.bonusClaimed = true; await save();
  const r = g.def.reward;
  await store.grant({ coins: 0, gems: r.gems || 0, leaves: r.leaves || 0, conservation: r.conservation || 0, xp: 120 });
  await store.grantResources({ seeds: r.seeds || 0, nectar: r.nectar || 0, plankton: r.plankton || 0 });
  return r;
}

export function init() {
  store.on('discovery', async (e) => {
    const rec = e.detail && e.detail.record; if (!rec) return;
    await load(); const def = currentDef(); const info = classify(rec); let changed = false;
    for (const o of def.obj) {
      const st = state.obj[o.id]; if (!st || st.keys.length >= o.n) continue;
      if (o.m(info) && !st.keys.includes(rec.taxonKey)) { st.keys.push(rec.taxonKey); changed = true; }
    }
    if (changed) await save();
  });
}
