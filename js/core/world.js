/* ============================================================
   THE LIVING WORLD — WildDex's time engine.
   Real-world season + time-of-day make the world change: which
   wildlife is "active now" rotates each day, habitats take on a
   seasonal cast, and the field notes read to the moment. One
   engine, feeding Home, Habitats, and the daily loop.
   Deterministic per day (seeded) so every player shares the same
   living world on a given date — no server needed.
   ============================================================ */
import { SPECIES } from '../data/library.js';

export const SEASONS = {
  spring: { name: 'Spring', icon: '🌱', veil: 'spring' },
  summer: { name: 'Summer', icon: '☀️', veil: 'summer' },
  autumn: { name: 'Autumn', icon: '🍂', veil: 'autumn' },
  winter: { name: 'Winter', icon: '❄️', veil: 'winter' }
};
export const PHASES = {
  dawn: { name: 'Dawn', icon: '🌅', tint: 'dawn' },
  day: { name: 'Midday', icon: '🌤️', tint: 'day' },
  dusk: { name: 'Dusk', icon: '🌇', tint: 'dusk' },
  night: { name: 'Night', icon: '🌙', tint: 'night' }
};

// Northern-hemisphere meteorological seasons (default). Southern flips.
export function season(d = new Date(), southern = false) {
  const m = d.getMonth(); // 0..11
  let s = m <= 1 || m === 11 ? 'winter' : m <= 4 ? 'spring' : m <= 7 ? 'summer' : 'autumn';
  if (southern) s = { winter: 'summer', spring: 'autumn', summer: 'winter', autumn: 'spring' }[s];
  return { id: s, ...SEASONS[s] };
}
export function phase(d = new Date()) {
  const h = d.getHours();
  const id = h < 6 ? 'night' : h < 9 ? 'dawn' : h < 17 ? 'day' : h < 20 ? 'dusk' : 'night';
  return { id, ...PHASES[id] };
}

// Evocative field note for the current moment.
const LINES = {
  spring: { dawn: 'A cool spring dawn — the first songbirds are stirring and the wetlands wake.', day: 'Spring sunshine draws out pollinators; frogs call from the shallows.', dusk: 'A soft spring dusk settles; swallows sweep low over the meadow.', night: 'A mild spring night — amphibians chorus and moths take wing.' },
  summer: { dawn: 'A bright summer dawn; the reef shimmers and reptiles bask early.', day: 'High summer heat — butterflies drift and the shallows teem with life.', dusk: 'A warm summer dusk; dragonflies hang over still water.', night: 'A humid summer night — bats hunt and the tide pools glow.' },
  autumn: { dawn: 'A crisp autumn dawn — mist over the forest, deer on the move.', day: 'Golden autumn light; mushrooms push up and the herds gather.', dusk: 'An amber autumn dusk; migrating flocks ride the wind south.', night: 'A cold autumn night — owls call across the bare canopy.' },
  winter: { dawn: 'A pale winter dawn; frost on the reeds, waterfowl rafting up.', day: 'Thin winter sun — hardy mammals forage and the coast turns wild.', dusk: 'A blue winter dusk; the mountains hush and predators prowl.', night: 'A long winter night — the deep sea stirs and owls hunt the snow.' }
};
export function fieldNote(d = new Date(), southern = false) { return LINES[season(d, southern).id][phase(d).id]; }

// ---- "active now" species selection ----
const NIGHT_RIGS = new Set(['owl', 'bat', 'frog', 'salamander']);
const CREPUSCULAR_RIGS = new Set(['deer', 'moose', 'fox', 'rabbit', 'boar', 'raccoon', 'bigcat', 'hedgehog']);
const BIRD_RIGS = new Set(['songbird', 'raptor', 'heron', 'duck', 'hummingbird', 'swan', 'flamingo', 'parrot', 'penguin']);
const DIURNAL_RIGS = new Set(['butterfly', 'bee', 'dragonfly', 'beetle', 'lizard', 'snake', 'fish', 'shark', 'ray', 'octopus', 'crab', 'coral', 'nudibranch', 'turtle', 'seahorse', 'seastar', 'urchin', 'giraffe', 'zebra', 'elephant', 'primate']);
const SEASON_RIGS = {
  spring: new Set(['songbird', 'duck', 'heron', 'swan', 'frog', 'salamander', 'butterfly', 'bee', 'hummingbird', 'flamingo']),
  summer: new Set(['butterfly', 'bee', 'dragonfly', 'beetle', 'lizard', 'snake', 'fish', 'shark', 'ray', 'crab', 'coral', 'nudibranch', 'seastar', 'octopus', 'turtle', 'seahorse']),
  autumn: new Set(['deer', 'moose', 'fox', 'bear', 'squirrel', 'raptor', 'owl', 'boar', 'bison', 'raccoon', 'beaver']),
  winter: new Set(['owl', 'bear', 'rabbit', 'penguin', 'seal', 'walrus', 'whale', 'duck', 'swan', 'dolphin', 'fox'])
};

function rng(seedStr) { let h = 1779033703; for (let i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
const RARITY_W = { Common: 1.0, Uncommon: 0.85, Notable: 0.6, Rare: 0.4, Legendary: 0.2 };

function phaseScore(rig, phId) {
  if (phId === 'night') return NIGHT_RIGS.has(rig) ? 3 : CREPUSCULAR_RIGS.has(rig) ? 1.5 : DIURNAL_RIGS.has(rig) ? 0.2 : 1;
  if (phId === 'dawn' || phId === 'dusk') return BIRD_RIGS.has(rig) ? 2.5 : CREPUSCULAR_RIGS.has(rig) ? 2.2 : NIGHT_RIGS.has(rig) ? 1 : 1.2;
  return DIURNAL_RIGS.has(rig) ? 2.4 : BIRD_RIGS.has(rig) ? 1.6 : NIGHT_RIGS.has(rig) ? 0.3 : 1; // day
}
const daySeed = (d = new Date()) => d.toISOString().slice(0, 10);

/* Deterministic per-day list of species that are "active now". */
export function activeSpecies(n = 6, d = new Date(), southern = false) {
  const se = season(d, southern).id, ph = phase(d).id;
  const r = rng('wilddex-active-' + daySeed(d) + '-' + se + '-' + ph);
  const scored = [];
  for (const key in SPECIES) {
    const e = SPECIES[key];
    let s = phaseScore(e.rig, ph);
    if (SEASON_RIGS[se].has(e.rig)) s += 1.6;
    s *= (RARITY_W[e.rarity] || 0.7);
    s *= 0.6 + r() * 0.9; // seeded jitter so the set rotates day to day
    scored.push({ key, entry: e, s });
  }
  scored.sort((a, b) => b.s - a.s);
  // de-dupe by rig so the rail is visually varied
  const out = [], seen = new Set();
  for (const it of scored) { if (seen.has(it.entry.rig) && out.length < n * 2) continue; seen.add(it.entry.rig); out.push(it); if (out.length >= n) break; }
  return out;
}

export const seasonVeil = (d = new Date(), southern = false) => season(d, southern).veil;
