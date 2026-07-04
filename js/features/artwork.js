/* ============================================================
   ARTWORK RESOLVER — the game's illustration pipeline.

   Identify → look up the canonical library (data/library.js).
     • Found  → return that species' permanent illustration.
     • Missing→ generate ONE illustration in the house style,
                deterministically seeded by taxonKey (so every
                player gets the identical art), and store the
                spec permanently. The library grows, forever
                consistent — never regenerated per user.

   All artwork is vector (stickers.js): instant, offline,
   pixel-crisp at any size, zero per-user compute.
   ============================================================ */
import * as db from '../core/db.js';
import { stickerSVG, hasRig } from '../ui/stickers.js';
import { categoryOf } from '../ui/illustrations.js';
import { lookup as libLookup, libraryCount } from '../data/library.js';

// category (from taxonomy) → sticker rig. Most map 1:1.
const CAT_TO_RIG = {
  songbird: 'songbird', raptor: 'raptor', owl: 'owl', duck: 'duck', heron: 'heron', hummingbird: 'hummingbird',
  fox: 'fox', deer: 'deer', rodent: 'rodentSm', bigcat: 'bigcat', bear: 'bear', rabbit: 'rabbit', bat: 'bat', seal: 'seal', whale: 'whale',
  lizard: 'lizard', snake: 'snake', turtle: 'turtle', croc: 'croc', frog: 'frog', salamander: 'salamander',
  butterfly: 'butterfly', beetle: 'beetle', bee: 'bee', dragonfly: 'dragonfly',
  fish: 'fish', shark: 'shark', ray: 'ray', seahorse: 'seahorse', octopus: 'octopus', crab: 'crab',
  jelly: 'jelly', seastar: 'seastar', urchin: 'urchin', nudibranch: 'nudibranch', shell: 'shell', coral: 'coral',
  tree: 'tree', fern: 'fern', flower: 'flower', mushroom: 'mushroom'
};

// In-style palette banks for deterministically generated species. Every palette
// stays inside the house style; the seed only chooses among tasteful naturals.
const BANKS = {
  mammal: [
    { base: '#b9805a', dark: '#8a5a3c', light: '#e8d4bc' },
    { base: '#9aa0a4', dark: '#5d6468', light: '#e4e4e0', earIn: '#c4b4a4' },
    { base: '#7a5238', dark: '#5d3d28', light: '#c9a97e' },
    { base: '#c4a582', dark: '#8a7458', light: '#eee2cc' },
    { base: '#5d5048', dark: '#3a322c', light: '#a89484' }
  ],
  bird: [
    { base: '#5a8fca', dark: '#3a6a9c', light: '#eef2f4', wingC: '#3a6a9c' },
    { base: '#c8402f', dark: '#9a2c20', light: '#e88a78', wingC: '#a83224' },
    { base: '#e8c33a', dark: '#b89420', light: '#f2e6b0', wingC: '#8a6a20' },
    { base: '#a8845c', dark: '#7d5e40', light: '#e8dcc4', wingC: '#7d5e40' },
    { base: '#5a9a72', dark: '#3d7052', light: '#e0e8d8', wingC: '#3d7052' }
  ],
  fish: [
    { base: '#7a9cc0', dark: '#54749a', light: '#dce4e8' },
    { base: '#e8862c', dark: '#c05a1e', light: '#f2d48a', finC: '#e8a04a' },
    { base: '#5aa090', dark: '#3d7068', light: '#c8e0d8' },
    { base: '#c85a72', dark: '#9a3c52', light: '#e8a8b4' }
  ],
  herp: [
    { base: '#7aa858', dark: '#54804a', light: '#dce4bc' },
    { base: '#94a858', dark: '#6a8040', light: '#dce4bc' },
    { base: '#8a9460', dark: '#5d6844', light: '#d0d8b0' },
    { base: '#b48a4a', dark: '#8a6430', light: '#e0cc9c' }
  ],
  bug: [
    { base: '#d99a4a', dark: '#a06a2e', light: '#f2e0bc' },
    { base: '#c05a48', dark: '#33241c', light: '#e89a88' },
    { base: '#5a9aa0', dark: '#3d7078', light: '#c4e0e0' },
    { base: '#7a8a54', dark: '#586840', light: '#c8d0a0' }
  ],
  marineInvert: [
    { base: '#c98a74', dark: '#a06450', light: '#ecd4c4' },
    { base: '#b4a4d4', dark: '#8a7ab4', light: '#e4dcf2' },
    { base: '#d87848', dark: '#b45a30', light: '#f2c49c' },
    { base: '#cf6e94', dark: '#a84e74', light: '#f2d4e0' }
  ],
  plant: [
    { base: '#6b9a52', dark: '#4c7a3e', light: '#8ab46a' },
    { base: '#d88aa8', dark: '#b46a88', light: '#f2d9e4' },
    { base: '#c96a4e', dark: '#a84e38', light: '#f2e4d0' }
  ]
};
const RIG_FAMILY = (rig) => {
  if (['songbird', 'raptor', 'owl', 'duck', 'heron', 'hummingbird'].includes(rig)) return 'bird';
  if (['fish', 'shark', 'ray', 'whale', 'seal', 'seahorse'].includes(rig)) return rig === 'fish' ? 'fish' : 'mammal';
  if (['lizard', 'snake', 'turtle', 'croc', 'frog', 'salamander'].includes(rig)) return 'herp';
  if (['butterfly', 'bee', 'beetle', 'dragonfly'].includes(rig)) return 'bug';
  if (['octopus', 'jelly', 'crab', 'seastar', 'urchin', 'nudibranch', 'shell', 'coral'].includes(rig)) return 'marineInvert';
  if (['tree', 'fern', 'flower', 'mushroom'].includes(rig)) return 'plant';
  return 'mammal';
};
// deterministic 32-bit hash from a string/number
function seedOf(v) { const s = String(v); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* Resolve a record to its canonical illustration spec: { rig, opts, canonical, source }.
   Pure + deterministic — identical for every player, every device. */
export function resolveSpec(record) {
  const hit = libLookup(record);
  if (hit && hit.canonical) return { rig: hit.entry.rig, opts: hit.entry.art || {}, canonical: true, source: 'library', entry: hit.entry, key: hit.key };
  if (hit && hit.genusMatch) return { rig: hit.entry.rig, opts: hit.entry.art || {}, canonical: true, source: 'library-genus', entry: hit.entry, key: hit.key };
  // Not in library → deterministic in-style generation.
  const cat = categoryOf(record);
  let rig = CAT_TO_RIG[cat] || 'fox';
  if (!hasRig(rig)) rig = 'fox';
  const bank = BANKS[RIG_FAMILY(rig)];
  const seed = seedOf(record?.scientificName || record?.taxonKey || cat);
  const opts = { ...bank[seed % bank.length] };
  return { rig, opts, canonical: false, source: 'generated', key: (record?.scientificName || '').toLowerCase() };
}

/* Return the finished SVG markup for a record's canonical artwork. */
export function stickerFor(record) {
  const spec = resolveSpec(record);
  return stickerSVG(spec.rig, spec.opts) || '';
}
export function specFor(record) { return resolveSpec(record); }

/* Persist a generated spec so the library visibly "grows" and stays identical.
   (Generation is already deterministic; this records what's been unlocked.) */
export async function commitGenerated(record) {
  const spec = resolveSpec(record);
  if (spec.canonical) return spec;
  const kk = 'lib:' + (record?.scientificName || record?.taxonKey || '').toLowerCase();
  const existing = await db.kvGet(kk, null);
  if (!existing) await db.kvSet(kk, { rig: spec.rig, opts: spec.opts, at: Date.now(), name: record?.commonName || record?.canonicalName });
  return spec;
}
export async function generatedCount() { const all = await db.all('kv'); return all.filter((r) => String(r.name || '').startsWith('lib:')).length; }
export function totalLibrary() { return libraryCount(); }

/* ---- legacy compatibility shims (used by habitats / cards) ----
   Old code fetched a cached raster image URL. There are no rasters now —
   art is vector and instant — so these resolve to null and callers use the
   sticker directly. Kept so nothing throws mid-migration. */
export async function getArt() { return null; }
export async function ensureArt() { return null; }
export async function artMapFor() { return {}; }
