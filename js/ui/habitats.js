/* Habitats — a continuous, pannable living world per biome, populated with the collection in the
   unified vector language (or a hand-illustrated version per species the user "places"). Animals
   move with ecology-true behaviour at believable relative sizes, and in Curate mode can be
   selected, resized, dragged to reposition, or hidden. Calm, performant, reduced-motion aware. */
import { el, go, spinner, toast } from './components.js';
import { silSVG, categoryOf } from './illustrations.js';
import { stickerFor } from '../features/artwork.js';
import * as worldEnv from '../core/world.js';
import * as store from '../core/store.js';
import * as places from './places.js';
import * as scenes from './scenes.js';
import * as artwork from '../features/artwork.js';

const BIOMES = [
  { id: 'forest', name: 'Forest', target: 12 },
  { id: 'river', name: 'River', target: 8 },
  { id: 'meadow', name: 'Meadow', target: 8 },
  { id: 'wetland', name: 'Wetland', target: 8 },
  { id: 'savanna', name: 'Savanna', target: 6 },
  { id: 'desert', name: 'Desert', target: 6 },
  { id: 'mountain', name: 'Mountains', target: 6 },
  { id: 'coastal', name: 'Coastal', target: 8 },
  { id: 'reef', name: 'Coral Reef', target: 12 },
  { id: 'ocean', name: 'Open Ocean', target: 8 },
  { id: 'deepsea', name: 'Deep Sea', target: 4 }
];
const OPEN_OCEAN = new Set(['shark', 'ray', 'whale']);
const DEEPSEA_CAT = new Set(['jelly']);
const COASTAL_CAT = new Set(['seal', 'crab', 'shell', 'seastar', 'urchin']);
const WETLAND_CAT = new Set(['duck', 'heron', 'frog', 'salamander', 'turtle']);
const RIVER_CAT = new Set(['fish', 'croc']); // freshwater fish & crocodilians (marine fish stay on the reef)
const MEADOW_CAT = new Set(['butterfly', 'bee', 'dragonfly', 'flower', 'hummingbird']);
const SAVANNA_CAT = new Set(['bigcat']);
const DESERT_CAT = new Set(['lizard', 'snake']);
const MOUNTAIN_CAT = new Set(['raptor']);
function biomeOf(sp, cat) {
  if (sp.realm === 'marine') { if (DEEPSEA_CAT.has(cat)) return 'deepsea'; if (COASTAL_CAT.has(cat)) return 'coastal'; return OPEN_OCEAN.has(cat) ? 'ocean' : 'reef'; }
  if (RIVER_CAT.has(cat)) return 'river';
  if (WETLAND_CAT.has(cat)) return 'wetland';
  if (MEADOW_CAT.has(cat)) return 'meadow';
  if (SAVANNA_CAT.has(cat)) return 'savanna';
  if (DESERT_CAT.has(cat)) return 'desert';
  if (MOUNTAIN_CAT.has(cat)) return 'mountain';
  if (DEEPSEA_CAT.has(cat)) return 'deepsea';
  return 'forest';
}
const BEHAVIOUR = {
  // Ecologically grounded behaviour. Birds PERCH/hop on the ground (they do not
  // float in open air); only hummingbirds hover. Fish & sharks cruise submerged,
  // jellies pulse, crabs/octopus crawl the seabed, coral & rooted life only sway.
  swim: new Set(['fish', 'shark', 'ray', 'seal', 'whale', 'turtle']),
  perch: new Set(['songbird', 'raptor', 'owl', 'duck', 'heron']),
  hover: new Set(['hummingbird']),
  flutter: new Set(['butterfly', 'bee', 'dragonfly', 'bat']),
  pulse: new Set(['jelly']),
  crawl: new Set(['crab', 'nudibranch', 'octopus']),
  sway: new Set(['coral', 'seastar', 'urchin', 'shell', 'seahorse', 'tree', 'fern', 'flower', 'mushroom'])
};
function behaviourOf(cat) { for (const b in BEHAVIOUR) if (BEHAVIOUR[b].has(cat)) return b; return 'walk'; }
// Vertical bands (% of scene height). Land life sits low (on the ground); flyers
// that aren't hovering are grounded too. Marine life fills the water column.
const BAND = { perch: [66, 86], hover: [26, 50], flutter: [46, 68], swim: [30, 74], pulse: [16, 64], walk: [70, 88], crawl: [82, 92], sway: [76, 92] };
const DUR = { swim: [14, 26], perch: [7, 14], hover: [4, 8], flutter: [3.6, 7], pulse: [5, 10], walk: [16, 28], crawl: [13, 22], sway: [5, 11] };
const SIZE = {
  whale: 2.0, shark: 1.5, ray: 1.3, seal: 1.15, turtle: 1.0, octopus: 1.0, seahorse: 0.5, fish: 0.58, jelly: 0.85,
  crab: 0.6, nudibranch: 0.5, seastar: 0.62, urchin: 0.55, shell: 0.45, coral: 0.95,
  raptor: 1.15, owl: 1.0, heron: 1.2, duck: 0.9, songbird: 0.55, hummingbird: 0.42, bat: 0.6,
  bigcat: 1.45, bear: 1.6, deer: 1.3, fox: 0.95, rabbit: 0.62, rodent: 0.45,
  lizard: 0.55, snake: 0.85, croc: 1.5, frog: 0.5, salamander: 0.5,
  butterfly: 0.55, bee: 0.4, dragonfly: 0.55, beetle: 0.42, tree: 1.4, fern: 0.9, flower: 0.7, mushroom: 0.6
};
const BASE = 58;
const timeTint = () => { const h = new Date().getHours(); if (h < 6 || h >= 20) return 'night'; if (h < 9) return 'dawn'; if (h >= 17) return 'dusk'; return 'day'; };

const UNDERWATER = new Set(['reef', 'ocean', 'deepsea']);
function backdrop(biome, count) {
  const wrap = el('div', { class: 'habitat-bg' });
  const art = document.createElement('div'); art.className = 'scene-art'; art.innerHTML = scenes.backdrop(biome, count); wrap.append(art);
  const pc = UNDERWATER.has(biome) || biome === 'river' ? 'bubble' : 'pollen';
  const n = biome === 'deepsea' ? 14 : 9;
  for (let i = 0; i < n; i++) { const sp = el('span', { class: 'particle ' + pc }); sp.style.cssText = `left:${Math.random() * 100}%;bottom:${Math.random() * 45}%;--p:${(6 + Math.random() * 8).toFixed(1)}s;--pd:${(-Math.random() * 8).toFixed(1)}s;`; wrap.append(sp); }
  const w = weather(biome);
  if (w) wrap.append(w);
  return wrap;
}
/* Ambient weather & atmosphere — subtle, biome-aware, never on underwater scenes. */
function weather(biome) {
  if (UNDERWATER.has(biome)) return null;
  const tint = timeTint(); const roll = Math.random();
  if (biome === 'mountain' && roll < 0.3) return fall('weather-snow', 22);
  if (['wetland', 'river', 'forest'].includes(biome) && roll < 0.22) return fall('weather-rain', 26);
  if (['forest', 'savanna', 'meadow'].includes(biome) && roll < 0.2) return fall('weather-leaf', 8, biome === 'savanna' ? '#c9a45c' : '#8faa5a');
  if ((biome === 'mountain' || biome === 'forest') && (tint === 'dawn' || tint === 'dusk')) {
    const m = el('div', { class: 'weather-mist' });
    for (let i = 0; i < 3; i++) { const s = el('span'); s.style.cssText = `top:${28 + i * 20 + Math.random() * 8}%;--dur:${(30 + Math.random() * 24).toFixed(0)}s;--delay:${(-Math.random() * 30).toFixed(0)}s;`; m.append(s); }
    return m;
  }
  return null;
}
function fall(cls, n, color) {
  const box = el('div', { class: 'weather ' + cls });
  for (let i = 0; i < n; i++) { const s = el('span'); s.style.cssText = `left:${Math.random() * 100}%;--fd:${(cls === 'weather-rain' ? 0.7 + Math.random() * 0.5 : 5 + Math.random() * 6).toFixed(2)}s;--fdel:${(-Math.random() * 8).toFixed(1)}s;${color ? `background:${color};` : ''}--drift:${(Math.random() * 60 - 30).toFixed(0)}px;`; box.append(s); }
  return box;
}

let editing = false, selectedKey = null;

export async function view() {
  editing = false; selectedKey = null;
  import('../features/quests.js').then((q) => q.bump('visit_habitat')).catch(() => {});
  const root = el('div', { class: 'pad' });
  const placesBtn = el('button', { class: 'curate-pill', onclick: () => render('places') }, 'Photo habitats');
  const curate = el('button', { class: 'curate-pill', 'aria-label': 'Curate habitat', onclick: () => { editing = !editing; selectedKey = null; curate.classList.toggle('on', editing); curate.textContent = editing ? 'Done' : 'Curate'; render(current); } }, 'Curate');
  root.append(el('div', { class: 'masthead' }, el('div', { class: 'mast-kicker' }, 'Living collection'), el('div', { class: 'mast-title' }, 'Habitats'), el('div', { class: 'mast-meta' }, el('span', {}, 'Pan to explore'), el('div', { class: 'mast-actions' }, placesBtn, curate))));
  const ecoBar = el('div', { class: 'eco-bar', id: 'eco-bar' }); root.append(ecoBar);
  const seg = el('div', { class: 'seg seg-scroll' });
  seg.append(el('div', { dataset: { b: 'world' }, class: 'places-chip' }, '🌍 World'));
  BIOMES.forEach((b, i) => seg.append(el('div', { class: i === 0 ? 'on' : '', dataset: { b: b.id } }, b.name)));
  seg.append(el('div', { dataset: { b: 'places' }, class: 'places-chip' }, 'My Places'));
  root.append(seg);
  const scene = el('div', { class: 'habitat-scene forest ' + timeTint() }, spinner('Gathering your creatures…')); root.append(scene);
  const meter = el('div', { class: 'habitat-meter' }, el('div', { class: 'hm-row' }, el('span', { id: 'hm-label' }, ''), el('b', { id: 'hm-pct' }, '')), el('div', { class: 'bar' }, el('i', { id: 'hm-bar', style: 'width:0%' }))); root.append(meter);
  const growRow = el('div', { class: 'grow-row', id: 'grow-row' }); root.append(growRow);
  const manage = el('div', { class: 'manage-bar', id: 'manage' }); root.append(manage);

  const col = await store.getCollection();
  let hidden = new Set(await store.getHabitatHidden());
  let scales = await store.getAnimalScales();
  let posMap = await store.getAnimalPositions();
  let placed = await store.getPlacedArt();
  let artMap = await artwork.artMapFor(col);
  const { lookup: libLookup } = await import('../data/library.js');
  const BIOME_IDS = new Set(BIOMES.map((b) => b.id));
  const byBiome = {}; BIOMES.forEach((b) => (byBiome[b.id] = []));
  col.forEach((sp) => {
    const cat = categoryOf({ class: sp.cls, order: sp.order, family: sp.family, phylum: sp.phylum, kingdom: sp.kingdom, realm: sp.realm });
    // Prefer the species' canonical habitat from the library; fall back to ecology heuristic.
    const hit = libLookup({ scientificName: sp.scientificName, canonicalName: sp.scientificName });
    let biome = (hit && hit.canonical && BIOME_IDS.has(hit.entry.habitat)) ? hit.entry.habitat : biomeOf(sp, cat);
    byBiome[biome].push({ sp, cat });
  });
  let current = 'forest';

  const sizeFor = (it) => BASE * (SIZE[it.cat] || 0.8) * (scales[it.sp.taxonKey] || 1);
  async function hide(key) { hidden.add(key); selectedKey = null; await store.hideFromHabitat(key); render(current); toast('Hidden · still in your collection'); }
  async function restoreAll() { for (const k of [...hidden]) await store.showInHabitat(k); hidden = new Set(); render(current); toast('All animals restored'); }
  const persistPos = (key, pos) => store.setAnimalPos(key, pos);

  // ---- ecosystem resources ----
  const DOM = { forest: 'seeds', mountain: 'seeds', savanna: 'seeds', desert: 'seeds', meadow: 'nectar', wetland: 'plankton', river: 'plankton', coastal: 'plankton', reef: 'plankton', ocean: 'plankton', deepsea: 'plankton' };
  function resChip(kind, val) { const m = store.RESOURCE_META[kind]; return el('span', { class: 'eco-chip ' + kind, title: `${m.name} — from ${m.from}` }, el('span', { class: 'res-dot ' + kind }, m.icon), String(val)); }
  function ecoChime() { try { const ac = new (window.AudioContext || window.webkitAudioContext)(); [523.25, 784, 1046].forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(ac.destination); const t = ac.currentTime + i * 0.08; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4); o.start(t); o.stop(t + 0.42); }); } catch (_) {} }
  function renderEco() {
    const bar = root.querySelector('#eco-bar'); if (!bar) return;
    const bal = store.getResources();
    const pend = store.pendingResources(col);
    const total = pend.seeds + pend.nectar + pend.plankton;
    bar.innerHTML = '';
    bar.append(resChip('seeds', bal.seeds), resChip('nectar', bal.nectar), resChip('plankton', bal.plankton));
    const harvest = el('button', { class: 'eco-harvest' + (total > 0 ? ' ready' : ''), disabled: total > 0 ? null : '' },
      total > 0 ? `Harvest +${total}` : (col.length ? `Growing… ${pend.fillPct}%` : 'No animals yet'));
    harvest.addEventListener('click', async () => {
      const res = await store.harvestResources(col);
      if (res.total > 0) {
        try { navigator.vibrate && navigator.vibrate([8, 30, 12]); } catch (_) {}
        ecoChime();
        const parts = Object.entries(res.gained).filter(([, v]) => v > 0).map(([k, v]) => `${store.RESOURCE_META[k].icon}${v}`).join('  ');
        toast('Harvested  ' + parts);
        const fly = el('div', { class: 'eco-float' }, '+' + res.total); bar.append(fly); setTimeout(() => fly.remove(), 900);
        renderEco();
      }
    });
    bar.append(harvest);
  }

  function selectControl(it) {
    manage.innerHTML = '';
    const s = scales[it.sp.taxonKey] || 1;
    const slider = el('input', { type: 'range', min: '0.45', max: '2.6', step: '0.05', value: String(s), 'aria-label': 'Resize animal' });
    slider.addEventListener('input', () => { const v = parseFloat(slider.value); const node = scene.querySelector(`[data-key="${it.sp.taxonKey}"]`); if (node) node.style.setProperty('--sz', (BASE * (SIZE[it.cat] || 0.8) * v).toFixed(0) + 'px'); });
    slider.addEventListener('change', async () => { const v = parseFloat(slider.value); scales[it.sp.taxonKey] = v; await store.setAnimalScale(it.sp.taxonKey, v); });
    manage.append(el('div', { class: 'animal-ctl' },
      el('div', { class: 'ac-name' }, it.sp.commonName || ''),
      el('div', { class: 'ac-hint' }, 'Drag the animal to move it · slider to resize'),
      el('div', { class: 'ac-row' }, el('span', {}, 'Size'), slider),
      el('div', { class: 'ac-actions' },
        el('button', { class: 'link-btn', onclick: () => go('#/species/' + it.sp.taxonKey) }, 'Open'),
        el('button', { class: 'link-btn', onclick: () => hide(it.sp.taxonKey) }, 'Hide'),
        el('button', { class: 'link-btn', onclick: () => { selectedKey = null; scene.querySelectorAll('.selected').forEach((n) => n.classList.remove('selected')); baseManage(); } }, 'Done'))));
  }
  function baseManage() {
    manage.innerHTML = '';
    if (hidden.size) manage.append(el('span', { class: 'mb-note' }, `${hidden.size} hidden`), el('button', { class: 'link-btn', onclick: restoreAll }, 'Restore all'));
    if (editing) manage.append(el('span', { class: 'mb-note' }, 'Tap an animal to move, resize, or hide it'));
  }
  function renderGrow(bid, tier) {
    growRow.innerHTML = '';
    const stars = el('span', { class: 'grow-stars', title: `Habitat tier ${tier}/${store.MAX_TIER}` }); for (let i = 0; i < store.MAX_TIER; i++) stars.append(el('span', { class: 'gs' + (i < tier ? ' on' : '') }, '★'));
    growRow.append(el('span', { class: 'grow-label' }, 'Habitat tier'), stars);
    if (tier >= store.MAX_TIER) { growRow.append(el('span', { class: 'grow-max' }, 'Fully grown')); return; }
    const kind = DOM[bid] || 'seeds'; const cost = store.growCost(bid, kind); if (!cost) return;
    const m = store.RESOURCE_META[kind]; const have = store.getResources()[kind] || 0; const can = have >= cost.amount;
    const btn = el('button', { class: 'eco-grow' + (can ? ' ready' : ''), disabled: can ? null : '' }, `Grow  ${m.icon}${cost.amount}`);
    btn.addEventListener('click', async () => {
      const res = await store.growHabitat(bid, kind);
      if (res.ok) { try { navigator.vibrate && navigator.vibrate([10, 40, 16]); } catch (_) {} ecoChime(); toast(`${BIOMES.find((b) => b.id === bid).name} grew to tier ${res.tier}!  +2🍃`); render(bid); renderEco(); }
      else if (res.reason === 'insufficient') toast(`Need ${m.icon}${cost.amount} ${m.name} — harvest more from this habitat`);
    });
    growRow.append(btn, el('span', { class: 'grow-hint' }, `spends ${m.name} to enrich the scene & yield`));
  }

  /* One continuous, seamlessly scrolling world — every populated biome joined side by side. */
  function renderWorld() {
    meter.style.display = 'none'; manage.style.display = 'none'; growRow.style.display = 'none'; curate.style.display = 'none';
    scene.className = 'landscape'; scene.innerHTML = '';
    const tint = timeTint();
    const populated = BIOMES.filter((b) => (byBiome[b.id] || []).some((it) => !hidden.has(it.sp.taxonKey)));
    if (!populated.length) {
      scene.className = 'habitat-scene forest ' + tint;
      scene.append(el('div', { class: 'habitat-empty' }, el('p', {}, 'Your world is waiting for its first inhabitant.'), el('button', { class: 'btn', style: 'width:auto;margin:0', onclick: () => go('#/capture') }, 'Go discover')));
      return;
    }
    const world = el('div', { class: 'land-world' }); scene.append(world);
    const ctx = { sizeFor, posMap: {}, placed, artMap, persistPos: () => {}, get editing() { return false; }, onSelect: () => {} };
    populated.forEach((b, i) => {
      const shown = byBiome[b.id].filter((it) => !hidden.has(it.sp.taxonKey));
      const panel = el('div', { class: 'land-panel' + (i ? ' seam' : '') });
      panel.append(backdrop(b.id, shown.length));
      placeCreatures(panel, shown, ctx);
      panel.append(el('div', { class: 'land-tint ' + tint }));
      panel.append(el('span', { class: 'land-label' }, `${b.name} · ${shown.length}`));
      world.append(panel);
    });
  }
  function render(bid) {
    current = bid;
    seg.querySelectorAll('div').forEach((d) => d.classList.toggle('on', d.dataset.b === bid));
    if (bid === 'world') { current = bid; renderWorld(); return; }
    if (bid === 'places') { meter.style.display = 'none'; manage.style.display = 'none'; growRow.style.display = 'none'; curate.style.display = 'none'; scene.className = 'habitat-places'; scene.innerHTML = ''; places.mount(scene); return; }
    meter.style.display = ''; manage.style.display = ''; growRow.style.display = ''; curate.style.display = '';
    const biome = BIOMES.find((b) => b.id === bid);
    const tier = store.getHabitatTier(bid);
    scene.className = 'habitat-scene ' + bid + ' ' + timeTint() + (editing ? ' editing' : ''); scene.innerHTML = '';
    const all = byBiome[bid]; const shown = all.filter((it) => !hidden.has(it.sp.taxonKey));
    const span = Math.min(2.6, Math.max(1, 1 + shown.length * 0.06));
    const world = el('div', { class: 'habitat-world', style: `width:${(span * 100).toFixed(0)}%` }); scene.append(world);
    world.append(backdrop(bid, shown.length + tier * 4));
    if (!UNDERWATER.has(bid)) world.append(el('div', { class: 'season-veil ' + worldEnv.seasonVeil() }));
    renderGrow(bid, tier);
    const pct = Math.min(100, Math.round(shown.length / biome.target * 100));
    root.querySelector('#hm-label').textContent = `Habitat richness · ${shown.length} species`;
    root.querySelector('#hm-pct').textContent = pct + '%';
    root.querySelector('#hm-bar').style.width = pct + '%';
    if (!selectedKey) baseManage();
    if (!all.length) { world.append(el('div', { class: 'habitat-empty' }, el('p', {}, 'This habitat is waiting for life.'), el('button', { class: 'btn', style: 'width:auto;margin:0', onclick: () => go('#/capture') }, 'Go discover'))); return; }
    if (!shown.length) { world.append(el('div', { class: 'habitat-empty' }, el('p', {}, 'Every animal here is hidden.'), el('button', { class: 'btn', style: 'width:auto;margin:0', onclick: restoreAll }, 'Restore them'))); return; }
    placeCreatures(world, shown, { sizeFor, posMap, placed, artMap, persistPos,
      get editing() { return editing; },
      onSelect: (node, it) => { scene.querySelectorAll('.selected').forEach((n) => n.classList.remove('selected')); node.classList.add('selected'); selectedKey = it.sp.taxonKey; selectControl(it); } });
  }
  seg.querySelectorAll('div').forEach((d) => d.addEventListener('click', () => render(d.dataset.b)));
  render('forest');
  renderEco();
  return root;
}

function attachDrag(outer, it, world, ctx) {
  let active = false;
  outer.addEventListener('pointerdown', (e) => { if (!ctx.editing) return; e.preventDefault(); active = true; try { outer.setPointerCapture(e.pointerId); } catch (_) {} outer.classList.add('dragging'); });
  outer.addEventListener('pointermove', (e) => { if (!active) return; const r = world.getBoundingClientRect(); let x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top) / r.height * 100; x = Math.max(2, Math.min(96, x)); y = Math.max(5, Math.min(92, y)); outer.style.left = x.toFixed(1) + '%'; outer.style.top = y.toFixed(1) + '%'; outer._pos = { x, y }; });
  const end = (e) => { if (!active) return; active = false; try { outer.releasePointerCapture(e.pointerId); } catch (_) {} outer.classList.remove('dragging'); if (outer._pos) { ctx.posMap[it.sp.taxonKey] = outer._pos; ctx.persistPos(it.sp.taxonKey, outer._pos); } };
  outer.addEventListener('pointerup', end); outer.addEventListener('pointercancel', end);
}

function placeCreatures(world, list, ctx) {
  const cluster = { x: 24 + Math.random() * 50, y: 44 + Math.random() * 20 };
  list.slice(0, 40).forEach((it) => {
    const key = it.sp.taxonKey;
    const beh = behaviourOf(it.cat);
    const alt = (['swim', 'walk', 'flutter', 'crawl', 'perch'].includes(beh) && Math.random() < 0.45) ? ' alt' : '';
    const outer = el('button', { class: 'habitat-creature roam-' + beh + alt, dataset: { key }, title: it.sp.commonName || '', 'aria-label': it.sp.commonName || 'animal' });
    const rec = { scientificName: it.sp.scientificName, canonicalName: it.sp.scientificName, taxonKey: key, class: it.sp.cls, order: it.sp.order, family: it.sp.family, phylum: it.sp.phylum, kingdom: it.sp.kingdom, realm: it.sp.realm };
    const face = el('div', { class: 'creature-face face-' + beh }); face.innerHTML = stickerFor(rec) || silSVG(it.cat, 'specimen'); outer.append(face);
    const [b0, b1] = BAND[beh] || [60, 85];
    const size = ctx.sizeFor(it) * 1.5;
    let left, top; const saved = ctx.posMap[key];
    if (saved) { left = saved.x; top = saved.y; }
    else if (beh === 'swim' && it.cat === 'fish') { left = cluster.x + (Math.random() * 22 - 11); top = cluster.y + (Math.random() * 16 - 8); }
    else { left = 3 + Math.random() * 92; top = b0 + Math.random() * (b1 - b0); }
    const [d0, d1] = DUR[beh] || [10, 18]; const dur = d0 + Math.random() * (d1 - d0); const delay = -Math.random() * dur;
    const behind = (beh === 'swim' || beh === 'crawl' || beh === 'walk') && Math.random() < 0.3;
    const z = behind ? 4 : 10 + Math.round(top / 8);
    outer.style.cssText = `--sz:${size.toFixed(0)}px;width:var(--sz);height:var(--sz);left:${Math.max(2, Math.min(96, left)).toFixed(1)}%;top:${Math.max(5, Math.min(92, top)).toFixed(1)}%;--dur:${dur.toFixed(1)}s;--delay:${delay.toFixed(1)}s;z-index:${z};`;
    outer.addEventListener('click', () => { if (!ctx.editing) go('#/species/' + key); else ctx.onSelect(outer, it); });
    attachDrag(outer, it, world, ctx);
    world.append(outer);
  });
}
