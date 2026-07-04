/* Wilddex explorers — a simulated community. Deterministic per day (seeded by
   date) so leaderboards feel alive without a server. When Supabase keys are
   added, this module is the seam to swap for real player data. */

function rng(seedStr) { let h = 1779033703; for (let i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
const dayKey = () => new Date().toISOString().slice(0, 10);

const BASE = [
  { id: 'mara', name: 'MaraWilds', color: '#e6b95c', level: 41, species: 312, conservation: 9140, photoIds: 268, streak: 44, motto: 'Chasing every heron on Earth.', friend: true, biome: 'wetland', creatures: [{ cat: 'heron', name: 'Grey Heron' }, { cat: 'duck', name: 'Mandarin Duck' }, { cat: 'frog', name: 'Tree Frog' }, { cat: 'dragonfly', name: 'Emperor Dragonfly' }, { cat: 'turtle', name: 'Pond Slider' }, { cat: 'songbird', name: 'Reed Warbler' }] },
  { id: 'kenji', name: 'KenjiReef', color: '#5bc9e8', level: 38, species: 287, conservation: 8320, photoIds: 301, streak: 31, motto: 'The reef is my backyard.', friend: true, biome: 'reef', creatures: [{ cat: 'fish', name: 'Clown Anemonefish' }, { cat: 'fish', name: 'Regal Tang' }, { cat: 'octopus', name: 'Day Octopus' }, { cat: 'nudibranch', name: 'Spanish Dancer' }, { cat: 'seastar', name: 'Blue Sea Star' }, { cat: 'coral', name: 'Staghorn Coral' }, { cat: 'shark', name: 'Blacktip Reef Shark' }] },
  { id: 'aria', name: 'AriaFalcon', color: '#a596f0', level: 35, species: 244, conservation: 6890, photoIds: 190, streak: 27, motto: 'Eyes on the skies.', friend: true, biome: 'forest', creatures: [{ cat: 'raptor', name: 'Peregrine Falcon' }, { cat: 'owl', name: 'Barn Owl' }, { cat: 'songbird', name: 'Goldfinch' }, { cat: 'hummingbird', name: 'Ruby-throat' }, { cat: 'fox', name: 'Red Fox' }] },
  { id: 'tomas', name: 'TomasTrails', color: '#7ed957', level: 33, species: 231, conservation: 7450, photoIds: 154, streak: 19, motto: 'One trail at a time.', friend: false, biome: 'forest', creatures: [{ cat: 'deer', name: 'Roe Deer' }, { cat: 'bear', name: 'Brown Bear' }, { cat: 'rabbit', name: 'Mountain Hare' }, { cat: 'owl', name: 'Tawny Owl' }, { cat: 'mushroom', name: 'Fly Agaric' }] },
  { id: 'ines', name: 'InesOcean', color: '#59a8e8', level: 31, species: 208, conservation: 8810, photoIds: 176, streak: 38, motto: 'Protect what you love.', friend: false, biome: 'ocean', creatures: [{ cat: 'whale', name: 'Humpback Whale' }, { cat: 'shark', name: 'Blue Shark' }, { cat: 'seal', name: 'Harbour Seal' }, { cat: 'jelly', name: 'Moon Jelly' }, { cat: 'ray', name: 'Manta Ray' }] },
  { id: 'dev', name: 'DevInTheField', color: '#e0813f', level: 29, species: 187, conservation: 4120, photoIds: 201, streak: 12, motto: 'Macro lens, tiny worlds.', friend: false, biome: 'meadow', creatures: [{ cat: 'butterfly', name: 'Swallowtail' }, { cat: 'bee', name: 'Carpenter Bee' }, { cat: 'dragonfly', name: 'Darter' }, { cat: 'songbird', name: 'Skylark' }, { cat: 'flower', name: 'Cornflower' }] },
  { id: 'lena', name: 'LenaNorth', color: '#9fe4f5', level: 27, species: 176, conservation: 5240, photoIds: 142, streak: 22, motto: 'Boreal forests forever.', friend: true, biome: 'forest', creatures: [{ cat: 'owl', name: 'Great Grey Owl' }, { cat: 'fox', name: 'Arctic Fox' }, { cat: 'deer', name: 'Reindeer' }, { cat: 'songbird', name: 'Siberian Jay' }] },
  { id: 'santi', name: 'SantiSelva', color: '#67e08a', level: 26, species: 214, conservation: 6110, photoIds: 129, streak: 16, motto: 'Amazonia, siempre.', friend: false, biome: 'forest', creatures: [{ cat: 'bigcat', name: 'Jaguar' }, { cat: 'frog', name: 'Poison Dart Frog' }, { cat: 'songbird', name: 'Scarlet Macaw' }, { cat: 'butterfly', name: 'Blue Morpho' }, { cat: 'snake', name: 'Emerald Boa' }] },
  { id: 'noor', name: 'NoorDunes', color: '#e6d75c', level: 24, species: 143, conservation: 3980, photoIds: 118, streak: 9, motto: 'Desert life is tough life.', friend: false, biome: 'desert', creatures: [{ cat: 'lizard', name: 'Spiny-tailed Lizard' }, { cat: 'raptor', name: 'Desert Falcon' }, { cat: 'rodent', name: 'Jerboa' }, { cat: 'beetle', name: 'Scarab' }] },
  { id: 'finn', name: 'FinnTidepool', color: '#43c2a8', level: 22, species: 131, conservation: 3410, photoIds: 156, streak: 25, motto: 'Low tide, high spirits.', friend: true, biome: 'coastal', creatures: [{ cat: 'crab', name: 'Hermit Crab' }, { cat: 'seastar', name: 'Ochre Star' }, { cat: 'urchin', name: 'Purple Urchin' }, { cat: 'nudibranch', name: 'Sea Lemon' }, { cat: 'shell', name: 'Whelk' }] },
  { id: 'yuki', name: 'YukiAlpine', color: '#c9d4dc', level: 21, species: 118, conservation: 2870, photoIds: 97, streak: 14, motto: 'Above the treeline.', friend: false, biome: 'mountain', creatures: [{ cat: 'raptor', name: 'Golden Eagle' }, { cat: 'rabbit', name: 'Pika' }, { cat: 'butterfly', name: 'Apollo' }, { cat: 'flower', name: 'Edelweiss' }] },
  { id: 'zola', name: 'ZolaSavanna', color: '#c98d5a', level: 19, species: 126, conservation: 4650, photoIds: 88, streak: 7, motto: 'Big five, bigger heart.', friend: false, biome: 'savanna', creatures: [{ cat: 'bigcat', name: 'Lion' }, { cat: 'deer', name: 'Impala' }, { cat: 'raptor', name: 'Secretary Bird' }, { cat: 'croc', name: 'Nile Crocodile' }] },
  { id: 'pia', name: 'PiaPollinator', color: '#f0a5c0', level: 17, species: 94, conservation: 2310, photoIds: 76, streak: 18, motto: 'Save the bees. All of them.', friend: false, biome: 'meadow', creatures: [{ cat: 'bee', name: 'Bumblebee' }, { cat: 'butterfly', name: 'Monarch' }, { cat: 'hummingbird', name: 'Bee Hummingbird' }, { cat: 'flower', name: 'Wild Aster' }] },
  { id: 'omar', name: 'OmarNightjar', color: '#8e7bb0', level: 15, species: 82, conservation: 1940, photoIds: 64, streak: 5, motto: 'The night shift naturalist.', friend: false, biome: 'forest', creatures: [{ cat: 'owl', name: 'Eagle Owl' }, { cat: 'bat', name: 'Pipistrelle' }, { cat: 'fox', name: 'Grey Fox' }, { cat: 'salamander', name: 'Fire Salamander' }] },
  { id: 'ruth', name: 'RuthRockpool', color: '#6f9f9a', level: 12, species: 61, conservation: 1520, photoIds: 51, streak: 11, motto: 'Every stone hides a story.', friend: false, biome: 'coastal', creatures: [{ cat: 'crab', name: 'Shore Crab' }, { cat: 'fish', name: 'Goby' }, { cat: 'shell', name: 'Limpet' }, { cat: 'coral', name: 'Beadlet Anemone' }] },
  { id: 'ben', name: 'BackyardBen', color: '#a9c79f', level: 9, species: 43, conservation: 890, photoIds: 39, streak: 3, motto: 'It all starts at the feeder.', friend: true, biome: 'forest', creatures: [{ cat: 'songbird', name: 'Blue Jay' }, { cat: 'rodent', name: 'Chipmunk' }, { cat: 'rabbit', name: 'Cottontail' }, { cat: 'butterfly', name: 'Painted Lady' }] }
];

export function players() {
  const r = rng('wilddex-players-' + dayKey());
  return BASE.map((p) => {
    const daily = Math.round(r() * 240 + p.level * 4);
    return { ...p, daily, online: r() < (p.friend ? 0.55 : 0.35), habitatScore: p.creatures.length * 40 + p.level * 12 };
  });
}
export function playerById(id) { return players().find((p) => p.id === id) || null; }
export function friends() { return players().filter((p) => p.friend); }

const WEEK_EVENTS = [
  { icon: '🌊', title: 'Reef Week', sub: 'Marine discoveries earn double coins all week. Dive in.' },
  { icon: '🪶', title: 'Great Bird Count', sub: 'Every bird you record this week supports migration research.' },
  { icon: '🦋', title: 'Pollinator Days', sub: 'Insects and wildflowers take the spotlight — record them for bonus leaves.' },
  { icon: '🌙', title: 'Night Safari', sub: 'Owls, bats and the night shift. Evening discoveries shine on the boards.' },
  { icon: '🐾', title: 'Big Mammal Week', sub: 'From foxes to whales — mammal finds count double for conservation.' },
  { icon: '🛡️', title: 'Guardians Week', sub: 'Threatened species finds earn triple leaves. Protect what remains.' }
];
export function weeklyEvent() {
  const now = new Date(); const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.floor(((now - jan1) / 864e5 + jan1.getDay()) / 7);
  return WEEK_EVENTS[week % WEEK_EVENTS.length];
}
