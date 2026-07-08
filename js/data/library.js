/* ============================================================
   WILDDEX CANONICAL ILLUSTRATION LIBRARY
   The permanent art assets of the game. Each species resolves
   to exactly ONE illustration spec — so every player who
   discovers a Blue Jay unlocks the identical Blue Jay.
   Keyed by scientific name (normalized). Species not yet in
   the library are generated deterministically in the same
   style and added permanently (see features/artwork.js).

   Fields per entry:
     name        common name (shown in UI)
     rig         sticker rig (art/anatomy)
     art         palette/feature overrides for the rig
     cls         animal class
     habitat     canonical biome
     regions     where it's found
     rarity      Common | Uncommon | Notable | Rare | Legendary
     anim        habitat animation profile
     sound       call hint (used by the sounds feature)
     status      IUCN-style conservation status
     blurb       short handcrafted description
   ============================================================ */

export const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');

// Palette shorthands so entries stay readable & consistent.
const pal = {
  robin: { headC: '#5a6a74', base: '#6a7a86', light: '#e8ded0', wingC: '#4a5a64', cheek: '#d98a4a' },
  jay: { base: '#5a8fca', dark: '#3a6a9c', light: '#eef2f4', wingC: '#3a6a9c', crest: true, crestC: '#5a8fca', wingbar: true, capC: '#4a7ab0' },
  cardinal: { base: '#c8402f', dark: '#9a2c20', light: '#e88a78', wingC: '#a83224', crest: true, crestC: '#c8402f', beakC: '#e8a94f' },
  goldfinch: { base: '#e8c33a', dark: '#b89420', light: '#f2e6b0', wingC: '#33241c', capC: '#33241c' },
  sparrow: { base: '#a8845c', dark: '#7d5e40', light: '#e8dcc4', wingC: '#7d5e40', capC: '#8a6a44' }
};

// species → entry
export const SPECIES = {
  // ---------------- MAMMALS ----------------
  'vulpes vulpes': { name: 'Red Fox', rig: 'fox', cls: 'Mammalia', habitat: 'forest', regions: ['Global'], rarity: 'Uncommon', anim: 'walk', sound: 'fox', status: 'LC', blurb: 'A clever, adaptable hunter found on nearly every continent, known for its russet coat and white-tipped tail.' },
  'canis lupus': { name: 'Gray Wolf', rig: 'fox', art: { base: '#9aa0a4', dark: '#5d6468', light: '#e4e4e0', shade: '#7b8286', earIn: '#c4b4a4', chest: true, build: 'wolf', ears: 'pointed', tail: 'bushy' }, cls: 'Mammalia', habitat: 'forest', regions: ['North America', 'Eurasia'], rarity: 'Rare', anim: 'walk', sound: 'wolf', status: 'LC', blurb: 'The largest wild canine, a keystone predator that hunts in tightly bonded family packs.' },
  'panthera leo': { name: 'Lion', rig: 'bigcat', art: { base: '#d8a860', dark: '#a87c3c', light: '#f2e2bc', pattern: 'plain', mane: true, maneC: '#8a5c30', build: 'heavy' }, cls: 'Mammalia', habitat: 'savanna', regions: ['Africa'], rarity: 'Rare', anim: 'walk', sound: 'lion', status: 'VU', blurb: 'The social big cat of the savanna, living in prides where lionesses do most of the hunting.' },
  'panthera tigris': { name: 'Tiger', rig: 'bigcat', art: { base: '#e08a3a', dark: '#33241c', light: '#f2ead8', pattern: 'stripes', build: 'heavy' }, cls: 'Mammalia', habitat: 'forest', regions: ['Asia'], rarity: 'Legendary', anim: 'walk', sound: 'tiger', status: 'EN', blurb: 'The largest cat on Earth, a solitary striped ambush hunter of Asian forests and grasslands.' },
  'ursus arctos': { name: 'Brown Bear', rig: 'bear', cls: 'Mammalia', habitat: 'forest', regions: ['North America', 'Eurasia'], rarity: 'Notable', anim: 'walk', sound: 'bear', status: 'LC', blurb: 'A powerful omnivore with a distinctive shoulder hump, at home from coastal salmon runs to alpine meadows.' },
  'ursus maritimus': { name: 'Polar Bear', rig: 'bear', art: { base: '#e8e8e4', light: '#f4f4f0', shade: '#c4c9cc' }, cls: 'Mammalia', habitat: 'coastal', regions: ['Arctic'], rarity: 'Rare', anim: 'walk', sound: 'bear', status: 'VU', blurb: 'The great white bear of the sea ice, the largest land carnivore and a tireless hunter of seals.' },
  'odocoileus virginianus': { name: 'White-tailed Deer', rig: 'deer', art: { antler: 'whitetail', build: 'slender', base: '#b9805a', light: '#efe2d0' }, cls: 'Mammalia', habitat: 'forest', regions: ['Americas'], rarity: 'Common', anim: 'walk', sound: 'deer', status: 'LC', blurb: 'A graceful browser that flashes its white tail as an alarm signal when it bounds away.' },
  'alces alces': { name: 'Moose', rig: 'moose', cls: 'Mammalia', habitat: 'forest', regions: ['North America', 'Northern Eurasia'], rarity: 'Notable', anim: 'walk', sound: 'moose', status: 'LC', blurb: 'The largest deer of all, with broad palmate antlers and a taste for aquatic plants.' },
  'vulpes lagopus': { name: 'Arctic Fox', rig: 'fox', art: { base: '#e8eaee', light: '#f6f6f4', dark: '#b4bcc0', shade: '#c9ced2', earIn: '#d4c8bc', build: 'fox', ears: 'round', tail: 'brush', socks: false }, cls: 'Mammalia', habitat: 'coastal', regions: ['Arctic'], rarity: 'Rare', anim: 'walk', sound: 'fox', status: 'LC', blurb: 'A tiny tundra fox whose thick coat turns snow-white in winter for perfect camouflage.' },
  'sciurus carolinensis': { name: 'Gray Squirrel', rig: 'squirrel', art: { base: '#9aa0a2', dark: '#6a7072', light: '#e8e6e0' }, cls: 'Mammalia', habitat: 'forest', regions: ['North America', 'Europe'], rarity: 'Common', anim: 'walk', sound: 'squirrel', status: 'LC', blurb: 'An acrobatic tree-dweller that caches thousands of nuts each autumn and forgets just enough to plant forests.' },
  'castor canadensis': { name: 'American Beaver', rig: 'beaver', cls: 'Mammalia', habitat: 'river', regions: ['North America'], rarity: 'Uncommon', anim: 'walk', sound: 'beaver', status: 'LC', blurb: "Nature's engineer, felling trees and damming streams to build lodges and ponds." },
  'oryctolagus cuniculus': { name: 'European Rabbit', rig: 'rabbit', cls: 'Mammalia', habitat: 'meadow', regions: ['Europe', 'Australia'], rarity: 'Common', anim: 'walk', sound: 'rabbit', status: 'EN', blurb: 'The ancestor of all domestic rabbits, a fast-breeding grazer that lives in warrens.' },
  'procyon lotor': { name: 'Raccoon', rig: 'raccoon', cls: 'Mammalia', habitat: 'forest', regions: ['North America'], rarity: 'Common', anim: 'walk', sound: 'raccoon', status: 'LC', blurb: 'A masked, dexterous night forager famous for its clever paws and habit of "washing" food.' },
  'equus caballus': { name: 'Horse', rig: 'horse', cls: 'Mammalia', habitat: 'meadow', regions: ['Global'], rarity: 'Common', anim: 'walk', sound: 'horse', status: 'LC', blurb: 'A domesticated grazer bred over millennia for speed, strength, and companionship.' },
  'bos taurus': { name: 'Cattle', rig: 'cow', cls: 'Mammalia', habitat: 'meadow', regions: ['Global'], rarity: 'Common', anim: 'walk', sound: 'cow', status: 'LC', blurb: 'The domestic cow, a ruminant kept worldwide for milk, meat, and labor.' },
  'capra hircus': { name: 'Goat', rig: 'goat', cls: 'Mammalia', habitat: 'mountain', regions: ['Global'], rarity: 'Common', anim: 'walk', sound: 'goat', status: 'LC', blurb: 'A sure-footed browser, one of the first animals domesticated by humans.' },
  'ovis aries': { name: 'Sheep', rig: 'sheep', cls: 'Mammalia', habitat: 'meadow', regions: ['Global'], rarity: 'Common', anim: 'walk', sound: 'sheep', status: 'LC', blurb: 'A woolly, flock-living grazer bred for fleece, milk, and meat.' },
  'camelus dromedarius': { name: 'Dromedary Camel', rig: 'camel', cls: 'Mammalia', habitat: 'desert', regions: ['Africa', 'Middle East'], rarity: 'Notable', anim: 'walk', sound: 'camel', status: 'LC', blurb: 'The one-humped desert traveler, able to go weeks without water by storing fat in its hump.' },
  'lama glama': { name: 'Llama', rig: 'llama', cls: 'Mammalia', habitat: 'mountain', regions: ['South America'], rarity: 'Uncommon', anim: 'walk', sound: 'llama', status: 'LC', blurb: 'A domesticated Andean camelid, prized as a pack animal and for its soft wool.' },
  'mus musculus': { name: 'House Mouse', rig: 'rodentSm', cls: 'Mammalia', habitat: 'meadow', regions: ['Global'], rarity: 'Common', anim: 'walk', sound: 'mouse', status: 'LC', blurb: 'A small, quick-breeding rodent that has followed humans across the entire planet.' },
  'erinaceus europaeus': { name: 'European Hedgehog', rig: 'rodentSm', art: { base: '#8a7a60', dark: '#5d5040', light: '#e0d4bc', spiky: true }, cls: 'Mammalia', habitat: 'meadow', regions: ['Europe'], rarity: 'Uncommon', anim: 'walk', sound: 'hedgehog', status: 'LC', blurb: 'A spiny nocturnal insectivore that rolls into a prickly ball when threatened.' },
  'ailuropoda melanoleuca': { name: 'Giant Panda', rig: 'bear', art: { base: '#f0f0ec', light: '#f8f8f4', shade: '#d0d0cc', panda: true }, cls: 'Mammalia', habitat: 'forest', regions: ['China'], rarity: 'Legendary', anim: 'walk', sound: 'panda', status: 'VU', blurb: 'The beloved bamboo bear of misty Chinese mountains, a global symbol of conservation.' },

  // ---------------- MARINE MAMMALS ----------------
  'enhydra lutris': { name: 'Sea Otter', rig: 'seal', art: { base: '#7a5c44', dark: '#54402e', light: '#c9b090', otter: true }, cls: 'Mammalia', habitat: 'coastal', regions: ['North Pacific'], rarity: 'Notable', anim: 'swim', sound: 'otter', status: 'EN', blurb: 'A charismatic kelp-forest mammal that cracks shellfish on stone tools and floats holding paws.' },
  'megaptera novaeangliae': { name: 'Humpback Whale', rig: 'whale', art: { form: 'humpback' }, cls: 'Mammalia', habitat: 'ocean', regions: ['Global oceans'], rarity: 'Rare', anim: 'swim', sound: 'whale', status: 'LC', blurb: 'A giant of the sea famous for breaching acrobatics and long, haunting songs.' },
  'orcinus orca': { name: 'Orca', rig: 'whale', art: { base: '#2a2f34', dark: '#16191c', light: '#f2f4f4', form: 'orca', pattern: 'orca', dorsal: 'tall' }, cls: 'Mammalia', habitat: 'ocean', regions: ['Global oceans'], rarity: 'Rare', anim: 'swim', sound: 'orca', status: 'DD', blurb: 'The ocean’s apex predator, a highly intelligent dolphin that hunts in coordinated pods.' },
  'phoca vitulina': { name: 'Harbor Seal', rig: 'seal', cls: 'Mammalia', habitat: 'coastal', regions: ['Northern coasts'], rarity: 'Uncommon', anim: 'swim', sound: 'seal', status: 'LC', blurb: 'A spotted, big-eyed coastal seal often seen hauled out on rocks and sandbars.' },
  'odobenus rosmarus': { name: 'Walrus', rig: 'walrus', cls: 'Mammalia', habitat: 'coastal', regions: ['Arctic'], rarity: 'Rare', anim: 'swim', sound: 'walrus', status: 'DD', blurb: 'A massive tusked pinniped that uses its whiskers to root clams from the seafloor.' },

  // ---------------- BIRDS ----------------
  'cyanocitta cristata': { name: 'Blue Jay', rig: 'songbird', art: pal.jay, cls: 'Aves', habitat: 'forest', regions: ['North America'], rarity: 'Common', anim: 'fly', sound: 'jay', status: 'LC', blurb: 'A bold, crested blue songbird known for mimicry and a raucous, unmistakable call.' },
  'cardinalis cardinalis': { name: 'Northern Cardinal', rig: 'songbird', art: pal.cardinal, cls: 'Aves', habitat: 'forest', regions: ['North America'], rarity: 'Common', anim: 'fly', sound: 'cardinal', status: 'LC', blurb: 'A brilliant red crested songbird that sings year-round and mates for life.' },
  'spinus tristis': { name: 'American Goldfinch', rig: 'songbird', art: pal.goldfinch, cls: 'Aves', habitat: 'meadow', regions: ['North America'], rarity: 'Common', anim: 'fly', sound: 'goldfinch', status: 'LC', blurb: 'A cheerful yellow finch of summer fields that feeds almost entirely on seeds.' },
  'passer domesticus': { name: 'House Sparrow', rig: 'songbird', art: pal.sparrow, cls: 'Aves', habitat: 'meadow', regions: ['Global'], rarity: 'Common', anim: 'fly', sound: 'sparrow', status: 'LC', blurb: 'A chatty, dust-bathing little bird that has spread with humans across the world.' },
  'turdus migratorius': { name: 'American Robin', rig: 'songbird', art: pal.robin, cls: 'Aves', habitat: 'meadow', regions: ['North America'], rarity: 'Common', anim: 'fly', sound: 'robin', status: 'LC', blurb: 'An orange-breasted thrush, a familiar herald of spring hunting worms on lawns.' },
  'haliaeetus leucocephalus': { name: 'Bald Eagle', rig: 'raptor', art: { kind: 'eagle', base: '#4a3626', dark: '#2f2016', light: '#f2ead8', headC: '#f6f2e8', tailC: '#f2ead8', beakC: '#e8c33a', pattern: 'plain' }, cls: 'Aves', habitat: 'coastal', regions: ['North America'], rarity: 'Rare', anim: 'fly', sound: 'eagle', status: 'LC', blurb: 'The white-headed national bird of the United States, a powerful fish-hunting sea eagle.' },
  'aquila chrysaetos': { name: 'Golden Eagle', rig: 'raptor', art: { kind: 'eagle', base: '#6b4a30', dark: '#452e1c', light: '#c9a868', headC: '#a8823c', beakC: '#3a352e', pattern: 'streaked' }, cls: 'Aves', habitat: 'mountain', regions: ['Northern Hemisphere'], rarity: 'Rare', anim: 'fly', sound: 'eagle', status: 'LC', blurb: 'A majestic mountain raptor with a golden nape, capable of taking prey as large as young deer.' },
  'bubo bubo': { name: 'Eurasian Eagle-Owl', rig: 'owl', art: { kind: 'eared', facePattern: 'disc', pattern: 'streaked', base: '#8a6a44', dark: '#5d422c', light: '#e0c9a0', eyeC: '#e0862c' }, cls: 'Aves', habitat: 'forest', regions: ['Eurasia'], rarity: 'Notable', anim: 'fly', sound: 'owl', status: 'LC', blurb: 'One of the largest owls, with fiery orange eyes and prominent ear tufts.' },
  'tyto alba': { name: 'Barn Owl', rig: 'owl', art: { kind: 'round', facePattern: 'heart', pattern: 'spots', base: '#c9a86a', dark: '#9a7c48', light: '#f4efe4', faceC: '#f6f2ea' }, cls: 'Aves', habitat: 'meadow', regions: ['Global'], rarity: 'Uncommon', anim: 'fly', sound: 'owl', status: 'LC', blurb: 'A pale, heart-faced owl that hunts in silence and screeches rather than hoots.' },
  'anas platyrhynchos': { name: 'Mallard', rig: 'duck', art: { headC: '#3a7a54', base: '#b9a074', speculum: '#4a6ab0' }, cls: 'Aves', habitat: 'wetland', regions: ['Northern Hemisphere'], rarity: 'Common', anim: 'swim', sound: 'duck', status: 'LC', blurb: 'The familiar green-headed dabbling duck, ancestor of most domestic ducks.' },
  'ardea herodias': { name: 'Great Blue Heron', rig: 'heron', art: { base: '#8a9cb0', dark: '#5d7288', light: '#e0e6ea' }, cls: 'Aves', habitat: 'wetland', regions: ['North America'], rarity: 'Uncommon', anim: 'fly', sound: 'heron', status: 'LC', blurb: 'A tall, patient wader that stalks fish in the shallows on stilt-like legs.' },
  'archilochus colubris': { name: 'Ruby-throated Hummingbird', rig: 'hummingbird', cls: 'Aves', habitat: 'meadow', regions: ['North America'], rarity: 'Uncommon', anim: 'flutter', sound: 'hummingbird', status: 'LC', blurb: 'A tiny jewel that beats its wings 50 times a second and can hover and fly backward.' },
  'spheniscus demersus': { name: 'African Penguin', rig: 'duck', art: { base: '#2a2f34', headC: '#2a2f34', light: '#f2f4f4', beakC: '#33241c', penguin: true }, cls: 'Aves', habitat: 'coastal', regions: ['Southern Africa'], rarity: 'Notable', anim: 'swim', sound: 'penguin', status: 'EN', blurb: 'A braying, tuxedoed seabird of southern African coasts that "flies" underwater.' },

  // ---------------- FISH & SHARKS & RAYS ----------------
  'amphiprion ocellaris': { name: 'Clownfish', rig: 'fish', art: { base: '#e88a2c', dark: '#33241c', light: '#f4f4f0', stripes: true, finC: '#33241c' }, cls: 'Actinopterygii', habitat: 'reef', regions: ['Indo-Pacific'], rarity: 'Uncommon', anim: 'swim', sound: null, status: 'LC', blurb: 'The orange-and-white reef fish that shelters unharmed among stinging sea anemones.' },
  'paracanthurus hepatus': { name: 'Blue Tang', rig: 'fish', art: { bodyShape: 'disc', finStyle: 'tall', pattern: 'plain', base: '#2a72c8', dark: '#173a6a', light: '#3a86dc', finC: '#e8c33a' }, cls: 'Actinopterygii', habitat: 'reef', regions: ['Indo-Pacific'], rarity: 'Uncommon', anim: 'swim', sound: null, status: 'LC', blurb: 'A vivid royal-blue reef fish with a lemon-yellow tail and a scalpel-sharp spine.' },
  'carcharodon carcharias': { name: 'Great White Shark', rig: 'shark', art: { base: '#8a97a2', light: '#eef0f0', dark: '#5d6a74', body: 'stocky', snout: 'blunt', dorsal: 'tall', tail: 'crescent', pattern: 'countershade' }, cls: 'Chondrichthyes', habitat: 'ocean', regions: ['Global oceans'], rarity: 'Legendary', anim: 'swim', sound: null, status: 'VU', blurb: 'The ocean’s most famous predator, a powerful hunter with serrated teeth and keen senses.' },
  'ginglymostoma cirratum': { name: 'Nurse Shark', rig: 'shark', art: { base: '#a89070', light: '#e0d4bc', dark: '#7d6850', body: 'flat', snout: 'rounded', dorsal: 'low', tail: 'low', pattern: 'plain', barbels: true }, cls: 'Chondrichthyes', habitat: 'reef', regions: ['Atlantic', 'Pacific'], rarity: 'Notable', anim: 'swim', sound: null, status: 'VU', blurb: 'A docile, bottom-dwelling shark that rests in groups by day and forages at night.' },
  'manta birostris': { name: 'Giant Manta Ray', rig: 'ray', art: { form: 'manta', tail: 'short', pattern: 'countershade', base: '#33383e', dark: '#16191c', light: '#f2f4f4' }, cls: 'Chondrichthyes', habitat: 'ocean', regions: ['Tropical oceans'], rarity: 'Rare', anim: 'swim', sound: null, status: 'EN', blurb: 'A gentle plankton-feeding giant with a wingspan up to seven meters, gliding like an underwater bird.' },
  'hippocampus kuda': { name: 'Common Seahorse', rig: 'seahorse', cls: 'Actinopterygii', habitat: 'reef', regions: ['Indo-Pacific'], rarity: 'Notable', anim: 'sway', sound: null, status: 'VU', blurb: 'An armored little fish that swims upright; the male carries the eggs in a belly pouch.' },
  'carassius auratus': { name: 'Goldfish', rig: 'fish', art: { bodyShape: 'round', finStyle: 'fan', pattern: 'plain', base: '#e8862c', dark: '#c05a1e', light: '#f2d48a', finC: '#e8a04a' }, cls: 'Actinopterygii', habitat: 'river', regions: ['Global (introduced)'], rarity: 'Common', anim: 'swim', sound: null, status: 'LC', blurb: 'A domesticated carp bred for its bright color, one of the most common aquarium fish.' },
  'salmo salar': { name: 'Atlantic Salmon', rig: 'fish', art: { base: '#9aa8b0', dark: '#6a7a84', light: '#e0c4b0', finC: '#7d8a92' }, cls: 'Actinopterygii', habitat: 'river', regions: ['North Atlantic'], rarity: 'Uncommon', anim: 'swim', sound: null, status: 'LC', blurb: 'A powerful migratory fish that battles upstream to spawn in the rivers where it hatched.' },

  // ---------------- REPTILES ----------------
  'chelonia mydas': { name: 'Green Sea Turtle', rig: 'turtle', art: { form: 'sea', shellShape: 'flat', base: '#6a8a5c', shellC: '#5d7a48', shellD: '#42582f', light: '#c9d4a8' }, cls: 'Reptilia', habitat: 'reef', regions: ['Tropical oceans'], rarity: 'Notable', anim: 'swim', sound: null, status: 'EN', blurb: 'A gentle, long-lived sea turtle that grazes seagrass meadows and nests on tropical beaches.' },
  'terrapene carolina': { name: 'Box Turtle', rig: 'turtle', art: { form: 'pond', shellShape: 'domed', base: '#8a7048', shellC: '#7d5c34', shellD: '#5d4224', light: '#d8c49c' }, cls: 'Reptilia', habitat: 'forest', regions: ['North America'], rarity: 'Uncommon', anim: 'walk', sound: null, status: 'VU', blurb: 'A land turtle with a hinged shell it can close completely, sealing itself safely inside.' },
  'iguana iguana': { name: 'Green Iguana', rig: 'lizard', art: { base: '#6aa858', dark: '#4a7a3c', light: '#c8e0a8', crest: true }, cls: 'Reptilia', habitat: 'forest', regions: ['Central & South America'], rarity: 'Uncommon', anim: 'walk', sound: null, status: 'LC', blurb: 'A large tree-dwelling lizard with a spiny crest and a surprising ability to swim.' },
  'crocodylus niloticus': { name: 'Nile Crocodile', rig: 'croc', art: { base: '#6a7452', dark: '#4a5238', light: '#b4bc94' }, cls: 'Reptilia', habitat: 'river', regions: ['Africa'], rarity: 'Rare', anim: 'swim', sound: null, status: 'LC', blurb: 'A formidable ambush predator and one of the largest crocodiles, little changed in 200 million years.' },
  'naja naja': { name: 'Indian Cobra', rig: 'snake', art: { base: '#a8895c', dark: '#7d6440', light: '#e0d0b0', bands: true }, cls: 'Reptilia', habitat: 'meadow', regions: ['South Asia'], rarity: 'Notable', anim: 'crawl', sound: null, status: 'LC', blurb: 'A venomous serpent that spreads a hooded neck and sways when threatened.' },

  // ---------------- AMPHIBIANS ----------------
  'lithobates catesbeianus': { name: 'American Bullfrog', rig: 'frog', art: { form: 'bull', pattern: 'marbled', base: '#6a8a4a', dark: '#4a6634', light: '#d0dca8', cheeks: false }, cls: 'Amphibia', habitat: 'wetland', regions: ['North America'], rarity: 'Common', anim: 'walk', sound: 'frog', status: 'LC', blurb: 'A big, deep-voiced frog whose resonant "jug-o-rum" carries across ponds on summer nights.' },
  'dendrobates tinctorius': { name: 'Dyeing Poison Frog', rig: 'frog', art: { form: 'dart', pattern: 'bold', base: '#e0c84a', dark: '#2a4ac8', light: '#8ab0f0', cheeks: false }, cls: 'Amphibia', habitat: 'forest', regions: ['South America'], rarity: 'Rare', anim: 'walk', sound: 'frog', status: 'LC', blurb: 'A tiny, dazzling rainforest frog whose bright colors warn of its potent skin toxins.' },
  'ambystoma mexicanum': { name: 'Axolotl', rig: 'salamander', art: { base: '#e8c4c8', dark: '#c99aa0', light: '#f4e0e2', spots: false, gills: true }, cls: 'Amphibia', habitat: 'river', regions: ['Mexico'], rarity: 'Rare', anim: 'crawl', sound: null, status: 'CR', blurb: 'A perpetually juvenile salamander with feathery gills that can regenerate entire limbs.' },
  'salamandra salamandra': { name: 'Fire Salamander', rig: 'salamander', cls: 'Amphibia', habitat: 'forest', regions: ['Europe'], rarity: 'Uncommon', anim: 'crawl', sound: null, status: 'LC', blurb: 'A glossy black amphibian splashed with warning yellow, active on damp forest nights.' },

  // ---------------- INSECTS & INVERTS ----------------
  'danaus plexippus': { name: 'Monarch Butterfly', rig: 'butterfly', art: { wingShape: 'rounded', pattern: 'monarch', antennae: 'clubbed', base: '#e8862c', dark: '#33241c', light: '#f4e0b0' }, cls: 'Insecta', habitat: 'meadow', regions: ['Americas'], rarity: 'Notable', anim: 'flutter', sound: null, status: 'LC', blurb: 'A famous orange migrant that travels thousands of miles to overwinter in Mexican forests.' },
  'morpho menelaus': { name: 'Blue Morpho', rig: 'butterfly', art: { wingShape: 'rounded', pattern: 'morpho', antennae: 'clubbed', base: '#2a72d8', dark: '#141c33', light: '#8ac0f8' }, cls: 'Insecta', habitat: 'forest', regions: ['South America'], rarity: 'Rare', anim: 'flutter', sound: null, status: 'LC', blurb: 'A shimmering iridescent-blue butterfly whose color comes from light-bending wing scales.' },
  'apis mellifera': { name: 'Honey Bee', rig: 'bee', cls: 'Insecta', habitat: 'meadow', regions: ['Global'], rarity: 'Common', anim: 'flutter', sound: 'bee', status: 'LC', blurb: 'A vital pollinator that lives in complex colonies and communicates through waggle dances.' },
  'coccinella septempunctata': { name: 'Seven-spot Ladybug', rig: 'beetle', art: { base: '#d83a2c', dark: '#33241c', light: '#e88a78', spots: true }, cls: 'Insecta', habitat: 'meadow', regions: ['Eurasia', 'North America'], rarity: 'Common', anim: 'crawl', sound: null, status: 'LC', blurb: 'A beloved red-and-black beetle that devours aphids by the hundreds.' },
  'anax junius': { name: 'Green Darner', rig: 'dragonfly', art: { base: '#4a9a6a', dark: '#2f7050', light: '#c4e0c8' }, cls: 'Insecta', habitat: 'wetland', regions: ['North America'], rarity: 'Uncommon', anim: 'flutter', sound: null, status: 'LC', blurb: 'A large migratory dragonfly and one of the fastest, most agile insect fliers.' },

  // ---------------- CEPHALOPODS & OTHER MARINE INVERTS ----------------
  'octopus vulgaris': { name: 'Common Octopus', rig: 'octopus', cls: 'Cephalopoda', habitat: 'reef', regions: ['Global oceans'], rarity: 'Notable', anim: 'crawl', sound: null, status: 'LC', blurb: 'A remarkably intelligent, shape-shifting mollusc that solves puzzles and changes color in an instant.' },
  'aurelia aurita': { name: 'Moon Jellyfish', rig: 'jelly', art: { base: '#bcc4e0', dark: '#8a94c4', light: '#e8ecf4' }, cls: 'Scyphozoa', habitat: 'ocean', regions: ['Global oceans'], rarity: 'Common', anim: 'pulse', sound: null, status: 'LC', blurb: 'A translucent, gently pulsing jelly recognized by the four horseshoe rings in its bell.' },
  'carcinus maenas': { name: 'Shore Crab', rig: 'crab', art: { bodyShape: 'round', clawSize: 'even', base: '#7a8a54', dark: '#586840', light: '#c8d0a0' }, cls: 'Malacostraca', habitat: 'coastal', regions: ['Atlantic'], rarity: 'Common', anim: 'crawl', sound: null, status: 'LC', blurb: 'A scrappy, adaptable crab of rock pools and harbors, a formidable global invader.' },
  'pagurus bernhardus': { name: 'Hermit Crab', rig: 'crab', art: { bodyShape: 'boxy', clawSize: 'even', base: '#c86a44', dark: '#9a4c2c', light: '#e8b090', shellC: '#caa06a', shellD: '#9a7648' }, cls: 'Malacostraca', habitat: 'coastal', regions: ['Atlantic'], rarity: 'Uncommon', anim: 'crawl', sound: null, status: 'LC', blurb: 'A soft-bodied crab that shelters in an abandoned snail shell, upgrading as it grows.' },
  'pisaster ochraceus': { name: 'Ochre Sea Star', rig: 'seastar', art: { base: '#d87848', dark: '#b45a30', light: '#f2c49c' }, cls: 'Asteroidea', habitat: 'coastal', regions: ['North Pacific'], rarity: 'Uncommon', anim: 'sway', sound: null, status: 'LC', blurb: 'A five-armed keystone predator of tide pools that pries open mussels with tireless patience.' },
  'strongylocentrotus purpuratus': { name: 'Purple Sea Urchin', rig: 'urchin', cls: 'Echinoidea', habitat: 'coastal', regions: ['North Pacific'], rarity: 'Common', anim: 'sway', sound: null, status: 'LC', blurb: 'A spiny grazer that carves hollows into rock and mows down kelp forests when unchecked.' },
  'hypselodoris apolegma': { name: 'Nudibranch', rig: 'nudibranch', cls: 'Gastropoda', habitat: 'reef', regions: ['Indo-Pacific'], rarity: 'Rare', anim: 'crawl', sound: null, status: 'LC', blurb: 'A jewel-like sea slug in vivid magenta, one of thousands of dazzling shell-less snails.' },
  'acropora cervicornis': { name: 'Staghorn Coral', rig: 'coral', art: { base: '#c89a5c', dark: '#a87c3c', light: '#e8d0a0' }, cls: 'Anthozoa', habitat: 'reef', regions: ['Caribbean'], rarity: 'Notable', anim: 'sway', sound: null, status: 'CR', blurb: 'A fast-growing branching coral that builds reef thickets vital to countless marine species.' },
  'helix pomatia': { name: 'Roman Snail', rig: 'shell', cls: 'Gastropoda', habitat: 'meadow', regions: ['Europe'], rarity: 'Common', anim: 'crawl', sound: null, status: 'LC', blurb: 'A large land snail with a beautifully coiled shell, active after rain.' }
};

/* ---- compact bulk catalog ----
   Terse tuple rows expanded into full entries. Descriptions auto-derive from
   class + habitat + rarity when not curated, keeping the file lean while the
   canonical catalog grows large. Anything not listed still resolves to
   consistent in-style art via the deterministic generator (features/artwork.js). */
const CLS = { Ma: 'Mammalia', Av: 'Aves', Fi: 'Actinopterygii', Sh: 'Chondrichthyes', Re: 'Reptilia', Am: 'Amphibia', In: 'Insecta', Ce: 'Cephalopoda', Ga: 'Gastropoda', Bi: 'Bivalvia', Cr: 'Malacostraca', As: 'Asteroidea', Ec: 'Echinoidea', An: 'Anthozoa', Sc: 'Scyphozoa', Hy: 'Hydrozoa' };
const RAR = { C: 'Common', U: 'Uncommon', N: 'Notable', R: 'Rare', L: 'Legendary' };
const ANI = { w: 'walk', f: 'fly', fl: 'flutter', sw: 'swim', cr: 'crawl', pu: 'pulse', sy: 'sway' };
const CLASS_WORD = { Mammalia: 'mammal', Aves: 'bird', Actinopterygii: 'fish', Chondrichthyes: 'cartilaginous fish', Reptilia: 'reptile', Amphibia: 'amphibian', Insecta: 'insect', Cephalopoda: 'cephalopod', Gastropoda: 'sea slug', Bivalvia: 'mollusc', Malacostraca: 'crustacean', Asteroidea: 'sea star', Echinoidea: 'urchin', Anthozoa: 'anemone or coral', Scyphozoa: 'jellyfish', Hydrozoa: 'jellyfish' };
const HAB_WORD = { forest: 'forests', river: 'rivers and streams', meadow: 'open grassland', wetland: 'wetlands', savanna: 'the savanna', desert: 'arid deserts', mountain: 'the highlands', coastal: 'the coast', reef: 'coral reefs', ocean: 'the open ocean', deepsea: 'the deep sea' };
function expand(rows) {
  const o = {};
  for (const r of rows) {
    const [sci, name, rig, cls, habitat, regions, rar, an, status, art] = r;
    o[norm(sci)] = { name, rig, cls: CLS[cls] || cls, habitat, regions: Array.isArray(regions) ? regions : [regions], rarity: RAR[rar] || rar, anim: ANI[an] || an, status, ...(art ? { art } : {}) };
  }
  return o;
}
// nudibranch art shorthand: n(form, base, extras)
const nd = (form, base, x = {}) => ({ form, base, ...x });
const EXTRA = [
// ===== MAMMALS =====
['Loxodonta africana','African Elephant','elephant','Ma','savanna','Africa','R','w','EN'],
['Elephas maximus','Asian Elephant','elephant','Ma','forest','Asia','R','w','EN',{base:'#8f8a86'}],
['Giraffa camelopardalis','Giraffe','giraffe','Ma','savanna','Africa','N','w','VU'],
['Equus quagga','Plains Zebra','zebra','Ma','savanna','Africa','N','w','NT'],
['Ceratotherium simum','White Rhinoceros','rhino','Ma','savanna','Africa','R','w','NT'],
['Diceros bicornis','Black Rhinoceros','rhino','Ma','savanna','Africa','R','w','CR',{base:'#8a8078'}],
['Hippopotamus amphibius','Hippopotamus','hippo','Ma','river','Africa','N','w','VU'],
['Macropus rufus','Red Kangaroo','kangaroo','Ma','desert','Australia','N','w','LC'],
['Macropus giganteus','Eastern Grey Kangaroo','kangaroo','Ma','meadow','Australia','U','w','LC',{base:'#9a8a72'}],
['Gorilla gorilla','Western Gorilla','primate','Ma','forest','Africa','R','w','CR',{base:'#3a342f',dark:'#22201c',light:'#6a625a'}],
['Pan troglodytes','Chimpanzee','primate','Ma','forest','Africa','R','w','EN'],
['Macaca mulatta','Rhesus Macaque','primate','Ma','forest','Asia','U','w','LC',{base:'#9a8468'}],
['Pongo pygmaeus','Bornean Orangutan','primate','Ma','forest','Asia','R','w','CR',{base:'#b4632e',dark:'#8a4620',light:'#e0a05a'}],
['Lemur catta','Ring-tailed Lemur','primate','Ma','forest','Madagascar','N','w','EN',{base:'#9a9490',dark:'#3a3632',light:'#f2f2ee'}],
['Bradypus variegatus','Brown-throated Sloth','primate','Ma','forest','S. America','N','w','LC',{base:'#9a8a6a'}],
['Sus scrofa','Wild Boar','boar','Ma','forest','Eurasia','U','w','LC'],
['Bison bison','American Bison','bison','Ma','meadow','N. America','N','w','NT'],
['Bos gaurus','Gaur','bison','Ma','forest','Asia','R','w','VU',{base:'#3a2f28'}],
['Rangifer tarandus','Reindeer','deer','Ma','mountain','Arctic','U','w','VU',{antler:'caribou',build:'stocky',base:'#9a8a74',light:'#e8e0d0',maneC:'#e0d6c4'}],
['Cervus canadensis','Elk','deer','Ma','forest','N. America','N','w','LC',{antler:'elk',build:'tall',base:'#c39a64',dark:'#7a5636',headC:'#6b4a30',light:'#e8d4bc'}],
['Odocoileus hemionus','Mule Deer','deer','Ma','mountain','N. America','U','w','LC',{antler:'mule',build:'slender',base:'#a89478',light:'#ece2d2'}],
['Capreolus capreolus','Roe Deer','deer','Ma','forest','Europe','C','w','LC',{antler:'none',build:'slender',base:'#b9895c'}],
['Panthera pardus','Leopard','bigcat','Ma','forest','Africa','R','w','VU',{base:'#e0b048',dark:'#5d4020',pattern:'spots',build:'sleek'}],
['Panthera onca','Jaguar','bigcat','Ma','forest','S. America','R','w','NT',{base:'#d9a33e',dark:'#54390e',pattern:'spots',build:'heavy'}],
['Acinonyx jubatus','Cheetah','bigcat','Ma','savanna','Africa','R','w','VU',{base:'#e8c878',dark:'#4a3a20',pattern:'cheetah',tearMarks:true,build:'sleek'}],
['Puma concolor','Cougar','bigcat','Ma','mountain','Americas','N','w','LC',{base:'#c99a5c',pattern:'plain',build:'sleek'}],
['Lynx lynx','Eurasian Lynx','bigcat','Ma','forest','Eurasia','N','w','LC',{base:'#c9a060',dark:'#6b4c2c',pattern:'lynx-spots',ears:'tufted',build:'stocky'}],
['Panthera uncia','Snow Leopard','bigcat','Ma','mountain','C. Asia','R','w','VU',{base:'#d8d2c4',dark:'#4a4038',light:'#f2efe6',shade:'#b8b2a4',pattern:'spots',build:'sleek'}],
['Felis catus','Domestic Cat','bigcat','Ma','meadow','Global','C','w','LC',{base:'#9a9490',dark:'#5d5854',light:'#e8e6e0',shade:'#7c7772',pattern:'plain',build:'sleek'}],
['Canis familiaris','Dog','fox','Ma','meadow','Global','C','w','LC',{base:'#b89060',shade:'#9a744a',build:'fox',ears:'pointed',tail:'bushy',socks:false}],
['Canis latrans','Coyote','fox','Ma','desert','N. America','U','w','LC',{base:'#a89070',dark:'#6b5940',light:'#e8dcc4',shade:'#8a7458',build:'wolf',ears:'pointed',tail:'slim',socks:false}],
['Vulpes zerda','Fennec Fox','fox','Ma','desert','Africa','N','w','LC',{base:'#e8d8b0',light:'#f4ecd8',dark:'#b09468',shade:'#cbb88c',build:'fox',ears:'huge',socks:false,earIn:'#e0b8a0'}],
['Lycaon pictus','African Wild Dog','fox','Ma','savanna','Africa','R','w','EN',{base:'#b07840',dark:'#3d2f22',light:'#ecdcb4',shade:'#8f5f30',build:'wilddog',ears:'round',tail:'slim',socks:false,chest:false}],
['Meles meles','European Badger','raccoon','Ma','forest','Europe','U','w','LC',{base:'#9a948e'}],
['Mephitis mephitis','Striped Skunk','raccoon','Ma','forest','N. America','U','w','LC',{base:'#2a2622',light:'#f2f2ee'}],
['Ailurus fulgens','Red Panda','raccoon','Ma','forest','Asia','R','w','EN',{base:'#b4632e',light:'#f2ead8'}],
['Lutra lutra','Eurasian Otter','seal','Ma','river','Eurasia','N','sw','NT',{base:'#7a5c44',light:'#c9b090'}],
['Ursus americanus','American Black Bear','bear','Ma','forest','N. America','N','w','LC',{base:'#3a322c'}],
['Suricata suricatta','Meerkat','rodentSm','Ma','desert','Africa','U','w','LC',{base:'#b8a486'}],
['Marmota monax','Groundhog','rodentSm','Ma','meadow','N. America','C','w','LC'],
['Tamias striatus','Eastern Chipmunk','squirrel','Ma','forest','N. America','C','w','LC',{base:'#b07840'}],
['Erethizon dorsatum','Porcupine','hedgehog','Ma','forest','N. America','U','w','LC',{base:'#4a3a2c',spikeC:'#3a2c20'}],
['Dasypus novemcinctus','Nine-banded Armadillo','hedgehog','Ma','forest','Americas','U','w','LC',{base:'#b0a48c',spikeC:'#8a7c60'}],
['Ornithorhynchus anatinus','Platypus','seal','Ma','river','Australia','R','sw','NT',{base:'#5a4632',light:'#8a6e50'}],
['Trichechus manatus','West Indian Manatee','manatee','Ma','river','Atlantic','R','sw','VU'],
['Delphinus delphis','Common Dolphin','dolphin','Ma','ocean','Global','U','sw','LC'],
['Tursiops truncatus','Bottlenose Dolphin','dolphin','Ma','ocean','Global','U','sw','LC',{base:'#8a9aa4'}],
['Physeter macrocephalus','Sperm Whale','whale','Ma','ocean','Global','R','sw','VU',{form:'sperm',base:'#5a5650',light:'#c9c4bc',dark:'#3d3a34'}],
['Balaenoptera musculus','Blue Whale','whale','Ma','ocean','Global','L','sw','EN',{form:'blue',base:'#6a86a4',light:'#d8e2e8',dark:'#4a6a88'}],
['Delphinapterus leucas','Beluga','whale','Ma','coastal','Arctic','R','sw','LC',{form:'beluga',base:'#e9eceb',light:'#f8faf9',dark:'#b8c2c4',spout:false}],
['Monodon monoceros','Narwhal','whale','Ma','coastal','Arctic','R','sw','LC',{form:'narwhal',base:'#9aa6ac',light:'#dfe6e6',dark:'#5d6a70',spout:false}],
['Zalophus californianus','California Sea Lion','seal','Ma','coastal','Pacific','U','sw','LC',{base:'#6b4a32'}],
['Mirounga angustirostris','Northern Elephant Seal','seal','Ma','coastal','Pacific','N','sw','LC',{base:'#7a6a5a'}],
// ===== BIRDS =====
['Turdus merula','Common Blackbird','songbird','Av','meadow','Europe','C','f','LC',{base:'#2a2622',beakC:'#e8a94f'}],
['Erithacus rubecula','European Robin','songbird','Av','forest','Europe','C','f','LC',{base:'#8a7a5c',cheek:'#e0632c',capC:'#e0632c'}],
['Cyanistes caeruleus','Blue Tit','songbird','Av','forest','Europe','C','f','LC',{base:'#f0d24a',capC:'#4a7ab0',wingC:'#4a7ab0'}],
['Parus major','Great Tit','songbird','Av','forest','Eurasia','C','f','LC',{base:'#f0d24a',capC:'#2a2622'}],
['Sturnus vulgaris','European Starling','songbird','Av','meadow','Global','C','f','LC',{base:'#3a3a44'}],
['Corvus corax','Common Raven','songbird','Av','mountain','N. Hemisphere','U','f','LC',{base:'#2a2830',beakC:'#2a2830'}],
['Corvus brachyrhynchos','American Crow','songbird','Av','meadow','N. America','C','f','LC',{base:'#2a2830',beakC:'#2a2830'}],
['Pica pica','Eurasian Magpie','songbird','Av','meadow','Eurasia','C','f','LC',{base:'#2a2830',light:'#f2f2ee'}],
['Poecile atricapillus','Black-capped Chickadee','songbird','Av','forest','N. America','C','f','LC',{base:'#c9c0b0',capC:'#2a2622'}],
['Sialia sialis','Eastern Bluebird','songbird','Av','meadow','N. America','U','f','LC',{base:'#4a7ab0',cheek:'#c96a3c'}],
['Agelaius phoeniceus','Red-winged Blackbird','songbird','Av','wetland','N. America','C','f','LC',{base:'#2a2622',wingbar:true,wingC:'#c8402f'}],
['Hirundo rustica','Barn Swallow','songbird','Av','meadow','Global','C','f','LC',{base:'#3a4a6a',cheek:'#c96a3c'}],
['Alcedo atthis','Common Kingfisher','songbird','Av','river','Eurasia','U','f','LC',{stocky:true,beakLong:true,base:'#2a8ac8',dark:'#1f5a8a',light:'#e0862c',wingC:'#1f6a9a',capC:'#2a7ab0',cheek:'#e0862c',beakC:'#2a2622'}],
['Megaceryle alcyon','Belted Kingfisher','songbird','Av','river','N. America','U','f','LC',{stocky:true,beakLong:true,crest:true,crestC:'#5a7488',base:'#5a7488',dark:'#3f5464',light:'#f2f2ee',wingC:'#3f5464',beakC:'#2a2622'}],
['Dryocopus pileatus','Pileated Woodpecker','songbird','Av','forest','N. America','U','f','LC',{cling:true,beakLong:true,crest:true,crestC:'#c8402f',base:'#2a2622',dark:'#141210',light:'#f2f2ee',capC:'#c8402f',beakC:'#3a352e'}],
['Picus viridis','European Green Woodpecker','songbird','Av','forest','Europe','U','f','LC',{cling:true,beakLong:true,base:'#7ab84a',dark:'#4f7a2c',light:'#e8e8cc',wingC:'#5a8a34',capC:'#c8402f',cheek:'#c8402f',beakC:'#3a352e'}],
['Falco peregrinus','Peregrine Falcon','raptor','Av','coastal','Global','N','f','LC',{kind:'falcon',pattern:'barred',base:'#5a6470',dark:'#3a4048',light:'#e8e6df',headC:'#3a4048',beakC:'#e6c24a'}],
['Buteo jamaicensis','Red-tailed Hawk','raptor','Av','meadow','N. America','U','f','LC',{kind:'hawk',pattern:'barred',base:'#8a6a4a',dark:'#5d4230',light:'#efe6d6',headC:'#7a5a3e',tailC:'#b4562e',beakC:'#3a352e'}],
['Pandion haliaetus','Osprey','raptor','Av','coastal','Global','N','f','LC',{kind:'osprey',pattern:'streaked',base:'#5a4a38',dark:'#3d3025',light:'#f4efe6',headC:'#f4efe6',underC:'#f4efe6',beakC:'#3a352e'}],
['Cathartes aura','Turkey Vulture','raptor','Av','meadow','Americas','U','f','LC',{kind:'vulture',pattern:'plain',base:'#3a2c22',dark:'#221913',light:'#5a463a',headC:'#c85a44',beakC:'#e8e0d0'}],
['Bubo virginianus','Great Horned Owl','owl','Av','forest','Americas','N','f','LC',{kind:'eared',facePattern:'disc',pattern:'barred',base:'#8a6e4a',dark:'#5a4430',light:'#d8c4a0',faceC:'#c8a878',eyeC:'#e8b23a'}],
['Bubo scandiacus','Snowy Owl','owl','Av','coastal','Arctic','R','f','VU',{kind:'snowy',facePattern:'plain',pattern:'spots',base:'#f2f2ee',dark:'#b4b0a6',light:'#f8f8f4',faceC:'#f8f8f4',eyeC:'#e8b23a'}],
['Strix nebulosa','Great Grey Owl','owl','Av','forest','N. Hemisphere','N','f','LC',{kind:'round',facePattern:'disc',pattern:'barred',base:'#9a948a',dark:'#6a655c',light:'#d0ccc2',faceC:'#c4c0b6',eyeC:'#e8c33a'}],
['Megascops asio','Eastern Screech Owl','owl','Av','forest','N. America','U','f','LC',{kind:'eared',facePattern:'disc',pattern:'streaked',base:'#9a7c5a',dark:'#6a5238',light:'#d8c4a4',eyeC:'#e8c33a'}],
['Athene noctua','Little Owl','owl','Av','meadow','Eurasia','U','f','LC',{kind:'round',facePattern:'plain',pattern:'spots',base:'#a8895c',dark:'#75593a',light:'#e0d0b0',faceC:'#e8dcc4',eyeC:'#e8c33a'}],
['Cygnus olor','Mute Swan','swan','Av','wetland','Eurasia','N','sw','LC'],
['Branta canadensis','Canada Goose','swan','Av','wetland','N. America','C','sw','LC',{base:'#8a7a5c',beakC:'#2a2622'}],
['Aix sponsa','Wood Duck','duck','Av','wetland','N. America','N','sw','LC',{headC:'#3a6a54'}],
['Phoenicopterus roseus','Greater Flamingo','flamingo','Av','wetland','Africa','N','w','LC'],
['Phoenicopterus ruber','American Flamingo','flamingo','Av','coastal','Americas','N','w','LC',{base:'#e86a86'}],
['Ardea alba','Great Egret','heron','Av','wetland','Global','U','f','LC',{base:'#f2f2ee',light:'#f8f8f4'}],
['Grus grus','Common Crane','heron','Av','wetland','Eurasia','N','f','LC',{base:'#9aa4ac'}],
['Pelecanus occidentalis','Brown Pelican','heron','Av','coastal','Americas','U','f','LC',{base:'#8a7a64'}],
['Larus argentatus','Herring Gull','duck','Av','coastal','N. Hemisphere','C','f','LC',{base:'#dfe0e0',headC:'#f2f2ee',beakC:'#e8c33a',speculum:'#9aa4ac'}],
['Spheniscus humboldti','Humboldt Penguin','penguin','Av','coastal','S. America','N','sw','VU'],
['Aptenodytes forsteri','Emperor Penguin','penguin','Av','coastal','Antarctica','R','sw','NT',{base:'#3a4048'}],
['Pygoscelis papua','Gentoo Penguin','penguin','Av','coastal','Antarctica','N','sw','LC',{base:'#2a2e36'}],
['Ara macao','Scarlet Macaw','parrot','Av','forest','S. America','R','f','LC',{base:'#d83a2c',tailC:'#2a6ab0',cheek:'#f2ead8'}],
['Ara ararauna','Blue-and-yellow Macaw','parrot','Av','forest','S. America','R','f','LC',{base:'#2a6ab0',tailC:'#f0d24a'}],
['Melopsittacus undulatus','Budgerigar','parrot','Av','meadow','Australia','C','f','LC',{base:'#7ac84a',tailC:'#4a7ab0'}],
['Psittacus erithacus','African Grey Parrot','parrot','Av','forest','Africa','N','f','EN',{base:'#9a948e',tailC:'#c8402f'}],
['Ramphastos toco','Toco Toucan','parrot','Av','forest','S. America','N','f','LC',{base:'#2a2622',beakC:'#e8862c',cheek:'#f2ead8'}],
['Pavo cristatus','Indian Peafowl','parrot','Av','forest','Asia','N','w','LC',{base:'#2a6a8a',tailC:'#2a8a6a'}],
['Selasphorus rufus','Rufous Hummingbird','hummingbird','Av','meadow','N. America','U','fl','LC',{base:'#c96a3c',throatC:'#e0632c'}],
['Trochilus polytmus','Red-billed Streamertail','hummingbird','Av','forest','Caribbean','N','fl','LC',{base:'#2a8a6a'}],
// ===== FISH, SHARKS, RAYS =====
['Cyprinus carpio','Common Carp','fish','Fi','river','Eurasia','C','sw','VU',{bodyShape:'round',pattern:'plain',base:'#b09454',dark:'#8a6e3a',light:'#d8c48a',finC:'#9a7c44'}],
['Perca fluviatilis','European Perch','fish','Fi','river','Eurasia','C','sw','LC',{bodyShape:'oval',pattern:'bands',finStyle:'spiky',base:'#7a8a4a',dark:'#4a5a2c',light:'#d0d49a',finC:'#c86a3a',patC:'#3a4a24'}],
['Micropterus salmoides','Largemouth Bass','fish','Fi','river','N. America','U','sw','LC',{bodyShape:'oval',pattern:'stripes-h',base:'#7a8a54',dark:'#3f4e2c',light:'#d6dcae',finC:'#5a6a3e',patC:'#33422a'}],
['Oncorhynchus mykiss','Rainbow Trout','fish','Fi','river','N. America','U','sw','LC',{bodyShape:'oval',pattern:'spots',base:'#9aa8b0',dark:'#5a6a72',light:'#e0c4b0',finC:'#c86a72',patC:'#3a4248'}],
['Esox lucius','Northern Pike','fish','Fi','river','N. Hemisphere','N','sw','LC',{bodyShape:'elongate',pattern:'spots',snout:'pointed',base:'#6a7a4a',dark:'#44522f',light:'#c8cf9a',finC:'#8a6a3a',patC:'#d8dcac'}],
['Betta splendens','Siamese Fighting Fish','fish','Fi','river','Asia','U','sw','VU',{bodyShape:'oval',finStyle:'fan',pattern:'plain',base:'#c83a4a',dark:'#8a2438',light:'#e8687a',finC:'#a02a6a'}],
['Pterophyllum scalare','Freshwater Angelfish','fish','Fi','river','S. America','U','sw','LC',{bodyShape:'disc',pattern:'stripes-v',finStyle:'tall',base:'#e0e0dc',dark:'#a8a49a',light:'#f2f2ee',finC:'#c8c4ba',patC:'#3a352e'}],
['Zebrasoma flavescens','Yellow Tang','fish','Fi','reef','Pacific','U','sw','LC',{bodyShape:'disc',pattern:'plain',base:'#f0c832',dark:'#c89a1c',light:'#f6e07a',finC:'#e0b41c'}],
['Chaetodon lunula','Raccoon Butterflyfish','fish','Fi','reef','Indo-Pacific','U','sw','LC',{bodyShape:'disc',pattern:'bands',base:'#f0c84a',dark:'#c89a2c',light:'#f6e08a',finC:'#e0b02c',patC:'#2a2622'}],
['Pomacanthus imperator','Emperor Angelfish','fish','Fi','reef','Indo-Pacific','N','sw','LC',{bodyShape:'disc',pattern:'stripes-h',base:'#2a5a8a',dark:'#173a5e',light:'#3a7ab0',finC:'#f0d24a',patC:'#f0d24a'}],
['Thalassoma bifasciatum','Bluehead Wrasse','fish','Fi','reef','Atlantic','U','sw','LC',{bodyShape:'torpedo',pattern:'twotone',base:'#2a8a7a',dark:'#1f4a7a',light:'#5ab8a4',finC:'#1f5a6a'}],
['Amphiprion percula','Orange Clownfish','fish','Fi','reef','Pacific','U','sw','LC',{bodyShape:'oval',pattern:'stripes-v',base:'#e8862c',dark:'#2a2622',light:'#f4f4f0',finC:'#2a2622',patC:'#f6f6f2'}],
['Chromis viridis','Blue-green Damselfish','fish','Fi','reef','Indo-Pacific','C','sw','LC',{bodyShape:'oval',pattern:'plain',base:'#3aa89a',dark:'#1f7a72',light:'#7ad8c8',finC:'#2a8a7a'}],
['Thunnus thynnus','Atlantic Bluefin Tuna','fish','Fi','ocean','Global','N','sw','EN',{bodyShape:'torpedo',pattern:'twotone',base:'#3a5a7a',dark:'#1f3a54',light:'#c9d0d4',finC:'#d8b43a'}],
['Xiphias gladius','Swordfish','fish','Fi','ocean','Global','N','sw','NT',{bodyShape:'torpedo',snout:'pointed',bill:'long',pattern:'twotone',base:'#4a5a6a',dark:'#2f3d4a',light:'#c4ccd2',finC:'#3a4650'}],
['Sphyraena barracuda','Great Barracuda','fish','Fi','ocean','Global','N','sw','LC',{bodyShape:'torpedo',snout:'pointed',pattern:'spots',base:'#9aa4ac',dark:'#5d6870',light:'#e0e4e6',finC:'#6a747c',patC:'#3a4048'}],
['Phycodurus eques','Leafy Seadragon','seahorse','Fi','reef','Australia','R','sy','LC',{base:'#7aa84a'}],
['Diodon holocanthus','Porcupinefish','pufferfish','Fi','reef','Global','U','sw','LC',{base:'#c9b088'}],
['Takifugu rubripes','Japanese Pufferfish','pufferfish','Fi','ocean','Asia','N','sw','LC',{base:'#8a9a7a'}],
['Muraena helena','Mediterranean Moray','eel','Fi','reef','Atlantic','N','sw','LC',{base:'#6a7a4a'}],
['Gymnothorax funebris','Green Moray','eel','Fi','reef','Atlantic','N','sw','LC',{base:'#5a7a3a'}],
['Anguilla anguilla','European Eel','eel','Fi','river','Europe','N','sw','CR'],
['Rhincodon typus','Whale Shark','shark','Sh','ocean','Global','L','sw','EN',{base:'#4a6a7a',light:'#dfe6e8',dark:'#33505e',body:'giant',snout:'wide',dorsal:'low',tail:'low',pattern:'spots',gills:5}],
['Sphyrna mokarran','Great Hammerhead','shark','Sh','ocean','Global','R','sw','CR',{base:'#8a9aa4',light:'#e0e6e8',dark:'#5a6670',body:'slender',snout:'hammer',dorsal:'tall',tail:'crescent',pattern:'countershade'}],
['Galeocerdo cuvier','Tiger Shark','shark','Sh','ocean','Global','R','sw','NT',{base:'#7a8a94',light:'#e4e8ea',dark:'#3f4a52',body:'stocky',snout:'blunt',dorsal:'curved',tail:'crescent',pattern:'stripes-faint'}],
['Carcharhinus leucas','Bull Shark','shark','Sh','coastal','Global','R','sw','VU',{base:'#93999a',light:'#e6e8e6',dark:'#63696a',body:'stocky',snout:'blunt',dorsal:'curved',tail:'crescent',pattern:'countershade'}],
['Carcharhinus melanopterus','Blacktip Reef Shark','shark','Sh','reef','Indo-Pacific','N','sw','VU',{base:'#a8917a',light:'#ece2d4',dark:'#7d6850',body:'slender',snout:'rounded',dorsal:'hooked',tail:'crescent',pattern:'blacktip'}],
['Negaprion brevirostris','Lemon Shark','shark','Sh','coastal','Atlantic','N','sw','VU',{base:'#c9b878',light:'#efe6c8',dark:'#a89050',body:'stocky',snout:'rounded',dorsal:'curved',tail:'crescent',pattern:'countershade'}],
['Prionace glauca','Blue Shark','shark','Sh','ocean','Global','N','sw','NT',{base:'#3a6a9c',light:'#dce6ee',dark:'#274a70',body:'slender',snout:'pointed',dorsal:'curved',tail:'crescent',pattern:'countershade'}],
['Alopias vulpinus','Common Thresher Shark','shark','Sh','ocean','Global','N','sw','VU',{base:'#5a6a80',light:'#dde2ea',dark:'#3a4658',body:'slender',snout:'pointed',dorsal:'curved',tail:'long-upper',pattern:'countershade'}],
['Isurus oxyrinchus','Shortfin Mako','shark','Sh','ocean','Global','N','sw','EN',{base:'#3f6ea8',light:'#e0e8f0',dark:'#2a4a74',body:'slender',snout:'pointed',dorsal:'tall',tail:'crescent',pattern:'countershade'}],
['Chiloscyllium punctatum','Bamboo Shark','shark','Sh','reef','Indo-Pacific','U','sw','NT',{base:'#a8946e',light:'#e4d8c0',dark:'#7d6850',body:'flat',snout:'rounded',dorsal:'low',tail:'low',pattern:'stripes-faint',barbels:true}],
['Triaenodon obesus','Whitetip Reef Shark','shark','Sh','reef','Indo-Pacific','N','sw','VU',{base:'#9aa4ac',light:'#eceeee',dark:'#6a747c',body:'slender',snout:'rounded',dorsal:'curved',tail:'crescent',pattern:'countershade'}],
['Hypanus americanus','Southern Stingray','ray','Sh','coastal','Atlantic','U','sw','NT',{form:'stingray',tail:'whip-barb',pattern:'countershade',base:'#8a7c64',dark:'#5d5240',light:'#c4b898'}],
['Aetobatus narinari','Spotted Eagle Ray','ray','Sh','ocean','Global','N','sw','EN',{form:'eagle',tail:'whip-barb',pattern:'spots',base:'#3a4650',dark:'#20282e',light:'#f2f2ee'}],
['Torpedo torpedo','Common Torpedo Ray','ray','Sh','coastal','Atlantic','U','sw','DD',{form:'torpedo',tail:'stubby',pattern:'rings',base:'#9a8a6a',dark:'#6a5c42',light:'#c8ba98'}],
['Mobula mobular','Giant Devil Ray','ray','Sh','ocean','Global','N','sw','EN',{form:'devil',tail:'short',pattern:'countershade',base:'#3a424e',dark:'#1e242c',light:'#e6eaee'}],
// ===== REPTILES & AMPHIBIANS =====
['Python regius','Ball Python','snake','Re','savanna','Africa','U','cr','LC',{base:'#8a7a4a',bands:true}],
['Boa constrictor','Boa Constrictor','snake','Re','forest','S. America','N','cr','LC',{base:'#a8946e',bands:true}],
['Crotalus atrox','Western Diamondback','snake','Re','desert','N. America','N','cr','LC',{base:'#b0a078',bands:true}],
['Thamnophis sirtalis','Common Garter Snake','snake','Re','meadow','N. America','C','cr','LC',{base:'#3a5a3a',bands:true}],
['Chelonoidis niger','Galápagos Tortoise','turtle','Re','desert','Galápagos','R','w','VU',{form:'tortoise',shellShape:'domed',base:'#6a6258',shellC:'#5a5248',shellD:'#3a352e',light:'#a89e90'}],
['Caretta caretta','Loggerhead Sea Turtle','turtle','Re','ocean','Global','N','sw','VU',{form:'sea',shellShape:'flat',base:'#8a6a44',shellC:'#8a5e34',shellD:'#5d3e20',light:'#d8bc90'}],
['Dermochelys coriacea','Leatherback Sea Turtle','turtle','Re','ocean','Global','N','sw','VU',{form:'sea',shellShape:'leathery',scutes:false,base:'#33383e',shellC:'#3a4048',shellD:'#20242a',light:'#7a8490'}],
['Chrysemys picta','Painted Turtle','turtle','Re','wetland','N. America','C','sw','LC',{form:'pond',shellShape:'flat',base:'#3a5030',shellC:'#2f3f26',shellD:'#1c2716',light:'#d8c44a'}],
['Chelydra serpentina','Common Snapping Turtle','turtle','Re','wetland','N. America','N','w','LC',{form:'snapping',shellShape:'ridged',base:'#4a4238',shellC:'#5a4c3a',shellD:'#332b22',light:'#8a7c68'}],
['Trachemys scripta','Red-eared Slider','turtle','Re','wetland','Americas','C','sw','LC',{form:'pond',shellShape:'domed',base:'#4a6a3a',shellC:'#3a5a2a',shellD:'#284018',light:'#c8d488'}],
['Alligator mississippiensis','American Alligator','croc','Re','wetland','N. America','N','sw','LC',{base:'#3a3a34'}],
['Crocodylus porosus','Saltwater Crocodile','croc','Re','coastal','Australia','R','sw','LC',{base:'#5a5a44'}],
['Varanus komodoensis','Komodo Dragon','lizard','Re','savanna','Indonesia','R','w','EN',{base:'#6a5c4a'}],
['Chamaeleo calyptratus','Veiled Chameleon','lizard','Re','forest','Africa','N','w','LC',{base:'#4a8a4a',crest:true}],
['Pogona vitticeps','Bearded Dragon','lizard','Re','desert','Australia','U','w','LC',{base:'#c9a060'}],
['Gekko gecko','Tokay Gecko','lizard','Re','forest','Asia','U','w','LC',{base:'#6a8aa4'}],
['Anolis carolinensis','Green Anole','lizard','Re','forest','N. America','C','w','LC',{base:'#5aa84a'}],
['Bufo bufo','Common Toad','frog','Am','forest','Eurasia','C','w','LC',{form:'toad',pattern:'plain',base:'#8a7458',dark:'#5d4a38',light:'#cab799',cheeks:false}],
['Rana temporaria','Common Frog','frog','Am','wetland','Europe','C','w','LC',{form:'true',base:'#8a7a4a',dark:'#5d4f30'}],
['Hyla cinerea','Green Tree Frog','frog','Am','wetland','N. America','C','w','LC',{form:'tree',pattern:'plain',base:'#6ac84a',dark:'#3f8a34',light:'#eef2cc',cheeks:false}],
['Agalychnis callidryas','Red-eyed Tree Frog','frog','Am','forest','C. America','N','w','LC',{form:'tree',pattern:'plain',base:'#5ac84a',dark:'#3a8a3a',light:'#eef2cc',eyeC:'#d83a2c',cheeks:false}],
['Lithobates pipiens','Northern Leopard Frog','frog','Am','wetland','N. America','C','w','LC',{form:'true',pattern:'spots',base:'#6a9a4a',dark:'#33502a',light:'#dCe8b8',cheeks:false}],
['Phyllobates terribilis','Golden Poison Frog','frog','Am','forest','S. America','R','w','EN',{form:'dart',pattern:'plain',base:'#e8d24a',dark:'#b89420',light:'#f4e69a',cheeks:false}],
['Andrias japonicus','Japanese Giant Salamander','salamander','Am','river','Asia','R','cr','VU',{base:'#5a4a3a'}],
['Notophthalmus viridescens','Eastern Newt','salamander','Am','wetland','N. America','C','cr','LC',{base:'#c96a3c',spots:true}],
['Triturus cristatus','Great Crested Newt','salamander','Am','wetland','Europe','U','cr','LC',{base:'#3a3a30',spots:true}],
// ===== INSECTS & LAND SNAILS =====
['Papilio machaon','Old World Swallowtail','butterfly','In','meadow','Eurasia','U','fl','LC',{wingShape:'swallowtail',pattern:'bands',antennae:'clubbed',base:'#f0d24a',dark:'#2a2622',light:'#f6e488'}],
['Papilio glaucus','Tiger Swallowtail','butterfly','In','forest','N. America','U','fl','LC',{wingShape:'swallowtail',pattern:'bands',antennae:'clubbed',base:'#f0c832',dark:'#2a2622',light:'#f6dc7a'}],
['Vanessa atalanta','Red Admiral','butterfly','In','meadow','Global','C','fl','LC',{wingShape:'rounded',pattern:'bands',antennae:'clubbed',base:'#2a2622',dark:'#141210',light:'#c8402f'}],
['Vanessa cardui','Painted Lady','butterfly','In','meadow','Global','C','fl','LC',{wingShape:'rounded',pattern:'marbled',antennae:'clubbed',base:'#d8862c',dark:'#33241c',light:'#f4e0b0'}],
['Pieris rapae','Cabbage White','butterfly','In','meadow','Global','C','fl','LC',{wingShape:'rounded',pattern:'plain-white',antennae:'clubbed',base:'#f2f2ee',dark:'#33322e',light:'#f8f8f4'}],
['Aglais io','European Peacock','butterfly','In','meadow','Eurasia','C','fl','LC',{wingShape:'rounded',pattern:'eyespots',antennae:'clubbed',base:'#a8342c',dark:'#2a2622',light:'#e8b84f'}],
['Attacus atlas','Atlas Moth','butterfly','In','forest','Asia','N','fl','LC',{wingShape:'moth',pattern:'marbled',antennae:'feathered',base:'#a8632e',dark:'#5a2f18',light:'#e0b47a'}],
['Bombus terrestris','Buff-tailed Bumblebee','bee','In','meadow','Europe','C','fl','LC',{base:'#e0b04f'}],
['Vespa crabro','European Hornet','bee','In','forest','Eurasia','U','fl','LC',{base:'#e0a83c'}],
['Xylocopa violacea','Violet Carpenter Bee','bee','In','meadow','Eurasia','C','fl','LC',{base:'#3a3630'}],
['Lucanus cervus','Stag Beetle','beetle','In','forest','Europe','N','cr','NT',{base:'#5a3a2a'}],
['Dynastes hercules','Hercules Beetle','beetle','In','forest','S. America','R','cr','LC',{base:'#6a5a3a'}],
['Chrysina resplendens','Golden Jewel Scarab','beetle','In','forest','Americas','N','cr','LC',{base:'#c9a850'}],
['Cicindela campestris','Green Tiger Beetle','beetle','In','meadow','Europe','U','cr','LC',{base:'#3a8a6a'}],
['Photinus pyralis','Common Firefly','beetle','In','wetland','N. America','C','fl','LC',{base:'#4a4a3a'}],
['Gryllus campestris','Field Cricket','beetle','In','meadow','Europe','C','cr','LC',{base:'#3a3028'}],
['Libellula depressa','Broad-bodied Chaser','dragonfly','In','wetland','Europe','C','fl','LC',{base:'#5a8ac0'}],
['Sympetrum striolatum','Common Darter','dragonfly','In','wetland','Eurasia','C','fl','LC',{base:'#d8632c'}],
['Calopteryx splendens','Banded Demoiselle','dragonfly','In','wetland','Eurasia','C','fl','LC',{base:'#2a8a9a'}],
['Cornu aspersum','Garden Snail','shell','Ga','meadow','Global','C','cr','LC'],
['Achatina fulica','Giant African Snail','shell','Ga','forest','Africa','U','cr','LC',{base:'#8a6a44'}],
// ===== MARINE INVERTEBRATES =====
['Sepia officinalis','Common Cuttlefish','octopus','Ce','reef','Atlantic','N','cr','LC',{base:'#a8946e'}],
['Doryteuthis pealeii','Longfin Squid','octopus','Ce','ocean','Atlantic','U','sw','LC',{base:'#c99a8a'}],
['Hapalochlaena lunulata','Blue-ringed Octopus','octopus','Ce','reef','Indo-Pacific','R','cr','LC',{base:'#c9a878'}],
['Nautilus pompilius','Chambered Nautilus','shell','Ce','ocean','Indo-Pacific','R','sw','LC',{base:'#e0d0b0'}],
['Homarus americanus','American Lobster','lobster','Cr','ocean','Atlantic','N','cr','LC'],
['Panulirus argus','Caribbean Spiny Lobster','lobster','Cr','reef','Atlantic','U','cr','LC',{base:'#8a5a3a'}],
['Callinectes sapidus','Blue Crab','crab','Cr','coastal','Atlantic','C','cr','LC',{bodyShape:'wide',clawSize:'even',base:'#4a6ab0',dark:'#2f4a86',light:'#a8c0e8'}],
['Ocypode quadrata','Atlantic Ghost Crab','crab','Cr','coastal','Atlantic','C','cr','LC',{bodyShape:'round',clawSize:'even',base:'#e0d0a8',dark:'#b8a67e',light:'#f4ecda'}],
['Birgus latro','Coconut Crab','crab','Cr','coastal','Indo-Pacific','N','cr','DD',{bodyShape:'wide',clawSize:'even',base:'#6a3a8a',dark:'#4a2664',light:'#a878c0'}],
['Uca pugnax','Atlantic Fiddler Crab','crab','Cr','coastal','Atlantic','C','cr','LC',{bodyShape:'round',clawSize:'big-right',base:'#5a4a38',dark:'#3a2e22',light:'#c8a86a'}],
['Lysmata amboinensis','Pacific Cleaner Shrimp','shrimp','Cr','reef','Indo-Pacific','U','sw','LC',{base:'#e0632c'}],
['Stenopus hispidus','Banded Coral Shrimp','shrimp','Cr','reef','Global','U','sw','LC',{base:'#e0632c',light:'#f2f2ee'}],
['Pandalus borealis','Northern Shrimp','shrimp','Cr','ocean','Atlantic','C','sw','LC'],
['Asterias rubens','Common Starfish','seastar','As','coastal','Atlantic','C','sy','LC',{base:'#d8632c'}],
['Protoreaster nodosus','Chocolate Chip Sea Star','seastar','As','reef','Indo-Pacific','U','sy','LC',{base:'#e0b060'}],
['Linckia laevigata','Blue Sea Star','seastar','As','reef','Indo-Pacific','U','sy','LC',{base:'#2a6ab0'}],
['Acanthaster planci','Crown-of-thorns Star','seastar','As','reef','Indo-Pacific','N','sy','LC',{base:'#8a4a5a'}],
['Diadema setosum','Long-spined Urchin','urchin','Ec','reef','Indo-Pacific','C','sy','LC',{base:'#2a2830'}],
['Tripneustes gratilla','Collector Urchin','urchin','Ec','reef','Indo-Pacific','U','sy','LC',{base:'#3a3a44'}],
['Chrysaora quinquecirrha','Atlantic Sea Nettle','jelly','Sc','ocean','Atlantic','U','pu','LC',{base:'#e0a878'}],
['Cyanea capillata','Lion’s Mane Jellyfish','jelly','Sc','ocean','Arctic','N','pu','LC',{base:'#c86a4a'}],
['Physalia physalis','Portuguese Man o’ War','jelly','Hy','ocean','Global','N','pu','LC',{base:'#8a9ae0'}],
['Actinia equina','Beadlet Anemone','coral','An','coastal','Atlantic','C','sy','LC',{base:'#c8402f'}],
['Heteractis magnifica','Magnificent Sea Anemone','coral','An','reef','Indo-Pacific','N','sy','LC',{base:'#d8863c'}],
['Acropora hyacinthus','Table Coral','coral','An','reef','Indo-Pacific','N','sy','VU',{base:'#c9a05a'}],
['Tubastraea coccinea','Orange Cup Coral','coral','An','reef','Global','U','sy','LC',{base:'#e0862c'}],
['Tridacna gigas','Giant Clam','shell','Bi','reef','Indo-Pacific','R','sy','VU',{base:'#4a8a9a'}],
['Pecten maximus','Great Scallop','shell','Bi','coastal','Atlantic','C','sw','LC',{base:'#e0b878'}],
// ===== NUDIBRANCHS (the jewels of the reef) =====
['Chromodoris annae','Anna’s Chromodoris','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('dorid','#3a6ac8',{mantle:'#2a4a9a',trim:'#f0d24a',gill:'#e8632c',rhino:'#e8632c'})],
['Hypselodoris bullockii','Bullock’s Hypselodoris','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('dorid','#c96ab0',{mantle:'#a84e94',trim:'#f2f2ee',gill:'#e0632c'})],
['Glaucus atlanticus','Blue Dragon','nudibranch','Ga','ocean','Global','R','sw','LC',nd('aeolid','#8ac0e8',{cerata:'#3a6ac8',cerataTip:'#e8f2f8',rhino:'#3a6ac8',stripes:true,trim:'#f2f2ee'})],
['Flabellina iodinea','Spanish Shawl','nudibranch','Ga','reef','Pacific','N','cr','LC',nd('shawl','#8a3a9a',{cerata:'#e0632c',cerataTip:'#f0a84a',rhino:'#e0632c'})],
['Hexabranchus sanguineus','Spanish Dancer','nudibranch','Ga','reef','Indo-Pacific','R','sw','LC',nd('dorid','#d83a2c',{mantle:'#b02a20',trim:'#f0d24a',gill:'#e0632c',rhino:'#d83a2c'})],
['Jorunna parva','Sea Bunny','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('bunny','#f2ead8',{rhino:'#3d342c',gill:'#e8d0a0',spotC:'#3d342c'})],
['Chromodoris willani','Willan’s Chromodoris','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('dorid','#7a9ae0',{mantle:'#4a6ac8',trim:'#2a2830',gill:'#e0e0dc',rhino:'#3a3a44',stripes:true})],
['Nembrotha kubaryana','Variable Neon Slug','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('dorid','#2a3a2a',{mantle:'#1a281a',trim:'#5ac84a',gill:'#e0632c',rhino:'#e0632c'})],
['Chromodoris quadricolor','Pyjama Nudibranch','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('dorid','#e0e0dc',{mantle:'#f2f2ee',trim:'#2a2830',gill:'#e8862c',rhino:'#e8862c',stripes:true})],
['Phyllidia varicosa','Varicose Wart Slug','nudibranch','Ga','reef','Indo-Pacific','U','cr','LC',nd('dorid','#3a4a5a',{mantle:'#2a3644',trim:'#c9d24a',gill:'#c9d24a',rhino:'#e0862c'})],
['Chromodoris magnifica','Magnificent Chromodoris','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('dorid','#e0e0dc',{trim:'#2a2830',gill:'#e8862c',rhino:'#e8862c',stripes:true})],
['Elysia crispata','Lettuce Sea Slug','nudibranch','Ga','reef','Atlantic','U','cr','LC',nd('shawl','#3a8a5a',{cerata:'#4a9a6a',cerataTip:'#8ac86a',rhino:'#3a8a5a'})],
['Costasiella kuroshimae','Leaf Sheep','nudibranch','Ga','reef','Indo-Pacific','R','cr','LC',nd('aeolid','#e8e0c8',{cerata:'#5aa84a',cerataTip:'#e0632c',rhino:'#2a3a2a'})],
['Cadlina luteomarginata','Yellow-edged Cadlina','nudibranch','Ga','coastal','Pacific','U','cr','LC',nd('dorid','#f2f2ee',{trim:'#f0d24a',gill:'#f0d24a',rhino:'#f0d24a'})],
['Chromodoris kuniei','Kunie’s Chromodoris','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('dorid','#c98ad0',{mantle:'#a86ab0',trim:'#8a3a9a',gill:'#c98ad0',spots:true,spotC:'#8a3a9a'})],
['Risbecia tryoni','Tryon’s Nudibranch','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('dorid','#c9a0d0',{trim:'#8a5a9a',gill:'#e0e0dc',spots:true,spotC:'#8a5a9a'})],
['Thecacera pacifica','Pikachu Nudibranch','nudibranch','Ga','reef','Indo-Pacific','R','cr','LC',nd('aeolid','#f0d24a',{cerata:'#e0632c',cerataTip:'#2a2830',rhino:'#e0632c'})],
['Janolus cristatus','Crystal Tips','nudibranch','Ga','coastal','Atlantic','U','cr','LC',nd('shawl','#8ac0e8',{cerata:'#3a6ac8',cerataTip:'#f2f2ee',rhino:'#3a6ac8'})],
['Coryphella verrucosa','Red-gilled Nudibranch','nudibranch','Ga','coastal','Atlantic','U','cr','LC',nd('aeolid','#e0d0c0',{cerata:'#d83a2c',cerataTip:'#f0a84a',rhino:'#d83a2c'})],
['Dirona albolineata','Frosted Nudibranch','nudibranch','Ga','coastal','Pacific','U','cr','LC',nd('aeolid','#e8e0d0',{cerata:'#c8d24a',cerataTip:'#f2f2ee',rhino:'#8ac86a'})],
['Hermissenda crassicornis','Opalescent Nudibranch','nudibranch','Ga','coastal','Pacific','U','cr','LC',nd('aeolid','#e8b84f',{cerata:'#e0632c',cerataTip:'#3a6ac8',rhino:'#3a6ac8'})],
['Bornella anguilla','Dancing Nudibranch','nudibranch','Ga','reef','Indo-Pacific','R','sw','LC',nd('shawl','#e8862c',{cerata:'#e0632c',cerataTip:'#f0d24a',rhino:'#e0632c'})],
['Tambja morosa','Dusky Tambja','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('dorid','#2a6a7a',{mantle:'#1a4a5a',trim:'#f0d24a',gill:'#2a3a2a'})],
['Chromodoris lochi','Loch’s Chromodoris','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('dorid','#8ab0e0',{mantle:'#5a8ac8',trim:'#2a2830',gill:'#e0e0dc',stripes:true})],
['Phyllodesmium longicirrum','Solar-powered Nudibranch','nudibranch','Ga','reef','Indo-Pacific','R','cr','LC',nd('shawl','#c9a060',{cerata:'#a8763e',cerataTip:'#e0b060',rhino:'#8a5a3a'})],
['Aegires villosus','Velvet Aegires','nudibranch','Ga','reef','Indo-Pacific','U','cr','LC',nd('bunny','#f0d24a',{rhino:'#e0862c',gill:'#e8b84f',spotC:'#e0862c'})],
['Doriprismatica atromarginata','Gold-lined Nudibranch','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('dorid','#f2f2ee',{trim:'#2a2830',gill:'#3a352e',rhino:'#3a352e'})],
['Mexichromis multituberculata','Warty Mexichromis','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('dorid','#c98ad0',{trim:'#f0d24a',gill:'#e0632c',spots:true,spotC:'#8a3a9a'})],
['Ceratosoma trilobatum','Three-lobed Ceratosoma','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('dorid','#e0862c',{mantle:'#c86a1c',trim:'#8a3a9a',gill:'#8a3a9a'})],
['Berghia coerulescens','Berghia','nudibranch','Ga','coastal','Atlantic','U','cr','LC',nd('aeolid','#e8e0d0',{cerata:'#c86a4a',cerataTip:'#f0a84a',rhino:'#8a5a3a'})],
['Pteraeolidia ianthina','Blue Dragon Aeolid','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('shawl','#8ac0a8',{cerata:'#4a8a9a',cerataTip:'#8ac0e8',rhino:'#3a6a7a'})],
['Facelina bostoniensis','Boston Facelina','nudibranch','Ga','coastal','Atlantic','U','cr','LC',nd('aeolid','#e0d0c0',{cerata:'#e86a4a',cerataTip:'#8ac0e8',rhino:'#e86a4a'})],
['Cratena peregrina','Cratena','nudibranch','Ga','coastal','Atlantic','U','cr','LC',nd('aeolid','#e8e0d0',{cerata:'#e0632c',cerataTip:'#f2f2ee',rhino:'#e0632c'})],
['Polycera quadrilineata','Four-lined Polycera','nudibranch','Ga','coastal','Atlantic','U','cr','LC',nd('shawl','#f2ead8',{cerata:'#f0d24a',cerataTip:'#2a2830',rhino:'#2a2830'})],
['Dendronotus frondosus','Bushy-backed Nudibranch','nudibranch','Ga','coastal','Atlantic','U','cr','LC',nd('shawl','#c9a878',{cerata:'#a8763e',cerataTip:'#e0d0b0',rhino:'#8a5a3a'})],
['Tritonia hombergii','Tritonia','nudibranch','Ga','coastal','Atlantic','U','cr','LC',nd('shawl','#e8b8c0',{cerata:'#e86a86',cerataTip:'#f2f2ee',rhino:'#c94a6a'})],
['Aplysia californica','California Sea Hare','nudibranch','Ga','coastal','Pacific','U','cr','LC',nd('bunny','#6a5a4a',{rhino:'#3a2f28',gill:'#8a7458',spotC:'#3a2f28'})],
['Chromodoris dianae','Diana’s Chromodoris','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('dorid','#8ab0e0',{mantle:'#5a8ac8',trim:'#f0d24a',gill:'#2a2830',stripes:true})],
['Nembrotha cristata','Crested Nembrotha','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('dorid','#2a3a2a',{mantle:'#1a281a',trim:'#3a8a5a',gill:'#3a8a5a',rhino:'#3a8a5a'})],
['Felimare picta','Painted Nudibranch','nudibranch','Ga','coastal','Atlantic','N','cr','LC',nd('dorid','#2a3a6a',{mantle:'#1a2a5a',trim:'#f0d24a',gill:'#f0d24a',rhino:'#f0d24a'})],
['Goniobranchus reticulatus','Reticulated Nudibranch','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('dorid','#f2f2ee',{mantle:'#f8f4ec',trim:'#e0632c',gill:'#e0632c',rhino:'#c94a6a'})],
['Okenia rosacea','Hopkins’ Rose','nudibranch','Ga','coastal','Pacific','N','cr','LC',nd('shawl','#e86a9a',{cerata:'#d84a7a',cerataTip:'#f2c8d8',rhino:'#c94a6a'})],
['Hypselodoris apolegma','Apolegma Nudibranch','nudibranch','Ga','reef','Indo-Pacific','N','cr','LC',nd('dorid','#c94a8a',{mantle:'#a83a72',trim:'#f2f2ee',gill:'#f0d24a',rhino:'#f0d24a'})]
];
Object.assign(SPECIES, expand(EXTRA));

// Auto-derive a description from an entry when no curated blurb exists.
export function describe(entry) {
  if (!entry) return '';
  if (entry.blurb) return entry.blurb;
  const cw = CLASS_WORD[entry.cls] || 'animal';
  const hw = HAB_WORD[entry.habitat] || 'the wild';
  const rare = { Legendary: 'a legendary', Rare: 'a rare', Notable: 'a notable', Uncommon: 'an uncommon', Common: 'a common' }[entry.rarity] || 'a';
  const reg = (entry.regions && entry.regions.length && entry.regions[0] !== 'Global') ? ` of ${entry.regions[0]}` : '';
  return `${entry.name} is ${rare} ${cw}${reg}, found in ${hw}.`;
}

// ---- resolution ----
export function lookup(record) {
  const sci = norm(record?.scientificName || record?.canonicalName);
  if (sci && SPECIES[sci]) return { key: sci, entry: SPECIES[sci], canonical: true };
  // genus-level fallback: match first word
  const genus = sci.split(' ')[0];
  if (genus) { for (const k in SPECIES) { if (k.split(' ')[0] === genus) return { key: k, entry: SPECIES[k], canonical: false, genusMatch: true }; } }
  return null;
}
export const libraryCount = () => Object.keys(SPECIES).length;
// Canonical species count per animal class — powers the Almanac completion tracker.
export function classTotals() { const t = {}; for (const k in SPECIES) { const c = SPECIES[k].cls; t[c] = (t[c] || 0) + 1; } return t; }
