/* ============================================================
   TRAITS — approximate real-world size + activity per species,
   powering the Field Guide's size-comparison and field-stat
   chips. Sizes are typical adult body length (or height for tall
   land animals) in centimetres. Rig defaults cover everything;
   iconic species get precise overrides so the "wow" scale reads.
   ============================================================ */
import { lookup as libLookup } from './library.js';

// Typical size (cm) by rig — a sensible default for any species on that body.
const RIG_SIZE = {
  whale: 1400, shark: 350, ray: 200, dolphin: 250, seal: 180, walrus: 300, manatee: 350,
  elephant: 600, giraffe: 500, rhino: 380, hippo: 400, bison: 300, moose: 280, deer: 170,
  horse: 240, cow: 250, camel: 300, llama: 170, sheep: 130, goat: 130, bear: 200, bigcat: 190,
  boar: 150, kangaroo: 160, primate: 120, fox: 90, raccoon: 65, beaver: 90, rabbit: 40,
  squirrel: 25, rodentSm: 12, hedgehog: 25, bat: 12,
  penguin: 90, flamingo: 130, swan: 140, heron: 100, raptor: 65, owl: 45, duck: 55,
  songbird: 18, hummingbird: 9, parrot: 40,
  croc: 400, turtle: 90, snake: 150, lizard: 30, frog: 8, salamander: 20,
  fish: 30, seahorse: 18, eel: 100, pufferfish: 30,
  octopus: 70, jelly: 30, crab: 15, lobster: 45, shrimp: 10, seastar: 22, urchin: 10,
  nudibranch: 6, shell: 6, coral: 40, butterfly: 10, bee: 2, beetle: 3, dragonfly: 8,
  tree: null, fern: null, flower: null, mushroom: null
};
// Precise overrides for iconic species (by normalized scientific name).
const SIZE_OVERRIDE = {
  'balaenoptera musculus': 2500, 'physeter macrocephalus': 1600, 'megaptera novaeangliae': 1400,
  'orcinus orca': 800, 'rhincodon typus': 1000, 'carcharodon carcharias': 460, 'manta birostris': 500,
  'loxodonta africana': 600, 'giraffa camelopardalis': 550, 'panthera tigris': 300, 'panthera leo': 250,
  'ursus maritimus': 250, 'aptenodytes forsteri': 120, 'struthio camelus': 250, 'python regius': 150,
  'crocodylus porosus': 500, 'chelonia mydas': 120, 'dermochelys coriacea': 200, 'danaus plexippus': 10,
  'morpho menelaus': 15, 'attacus atlas': 24, 'apis mellifera': 1.4, 'octopus vulgaris': 80,
  'homarus americanus': 60, 'aurelia aurita': 30, 'cyanea capillata': 200, 'hippocampus kuda': 20,
  'glaucus atlanticus': 4, 'jorunna parva': 2.5, 'colossendeis': 40
};

export function sizeOf(record) {
  const sci = (record && (record.scientificName || record.canonicalName) || '').trim().toLowerCase();
  if (sci && SIZE_OVERRIDE[sci] != null) return SIZE_OVERRIDE[sci];
  const hit = libLookup({ scientificName: sci });
  const rig = hit && hit.entry ? hit.entry.rig : null;
  if (rig && RIG_SIZE[rig] != null) return RIG_SIZE[rig];
  return null;
}
// Human friendly size string.
export function sizeLabel(cm) {
  if (cm == null) return null;
  if (cm >= 100) return `${(cm / 100).toFixed(cm % 100 === 0 ? 0 : 1)} m`;
  if (cm >= 1) return `${Math.round(cm)} cm`;
  return `${cm} cm`;
}

// Diel activity from the body plan — for the "active" field-stat chip.
const NOCTURNAL = new Set(['owl', 'bat']);
const CREPUSCULAR = new Set(['deer', 'moose', 'fox', 'rabbit', 'boar', 'raccoon', 'bigcat', 'hedgehog', 'frog', 'salamander']);
export function activityOf(record) {
  const hit = libLookup({ scientificName: (record && (record.scientificName || record.canonicalName) || '') });
  const rig = hit && hit.entry ? hit.entry.rig : null;
  if (rig && NOCTURNAL.has(rig)) return { id: 'nocturnal', label: 'Nocturnal', icon: '🌙' };
  if (rig && CREPUSCULAR.has(rig)) return { id: 'crepuscular', label: 'Dawn & dusk', icon: '🌆' };
  return { id: 'diurnal', label: 'Daytime', icon: '☀️' };
}
