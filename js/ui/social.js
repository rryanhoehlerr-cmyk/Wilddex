/* Play Together — leaderboards, daily challenges, friends, live events, and
   visiting other explorers' living habitats. Community data is simulated
   locally (see data/players.js); swaps to Supabase when keys are configured. */
import { el, go, goBack, spinner, toast, fmt, hud } from './components.js';
import { silSVG } from './illustrations.js';
import { stickerSVG, hasRig } from './stickers.js';
import * as store from '../core/store.js';
import * as session from '../core/auth.js';
import * as players from '../data/players.js';
import * as quests from '../features/quests.js';
import * as expeditions from '../features/expeditions.js';
import * as scenes from './scenes.js';

const avatar = (p, lg = false) => el('span', { class: 'avatar' + (lg ? ' lg' : ''), style: `background:${p.color}` }, (p.name || '?')[0].toUpperCase(), el('span', { class: 'presence' + (p.online ? '' : ' off') }));

const BOARDS = [
  { id: 'species', label: 'Most animals', key: (p) => p.species, mine: (me) => me.species, unit: 'species' },
  { id: 'habitats', label: 'Best habitats', key: (p) => p.habitatScore, mine: (me) => me.habitatScore, unit: 'points' },
  { id: 'conservation', label: 'Conservation', key: (p) => p.conservation, mine: (me) => me.conservation, unit: 'm² saved' },
  { id: 'daily', label: 'Daily challenge', key: (p) => p.daily, mine: (me) => me.daily, unit: 'points' },
  { id: 'photos', label: 'Photo IDs', key: (p) => p.photoIds, mine: (me) => me.photoIds, unit: 'photos' }
];

async function myStats() {
  const profile = store.getProfile();
  const count = await store.collectionCount();
  const streak = store.getStreak();
  const qs = await quests.getToday();
  return {
    name: session.current()?.displayName || 'You', color: '#7ed957', online: true, level: profile.level,
    species: count, habitatScore: count * 3 + profile.level * 12, conservation: profile.conservation || 0,
    daily: qs.filter((q) => q.done).length * 60 + qs.reduce((a, q) => a + q.progress * 10, 0),
    photoIds: profile.photoIds || 0, streak: streak.current, profile
  };
}

export async function view() {
  const root = el('div', { class: 'pad' });
  const me = await myStats();
  root.append(el('div', { class: 'masthead' },
    el('div', { class: 'mast-kicker' }, 'Play Together'),
    el('div', { class: 'mast-title' }, 'The Wild Circle'),
    hud(me.profile)));

  // Weekly expedition (playable event)
  root.append(el('div', { class: 'section-h' }, el('h3', {}, 'This week'), el('a', {}, expeditions.timerLabel())));
  root.append(await expeditionCard());

  // Daily challenges
  root.append(questCard(await quests.getToday(), me));

  // Leaderboards
  root.append(el('div', { class: 'section-h' }, el('h3', {}, 'Leaderboards')));
  const tabs = el('div', { class: 'lb-tabs' });
  const list = el('div', { class: 'lb' });
  let current = 'species';
  const renderBoard = () => {
    const board = BOARDS.find((b) => b.id === current);
    tabs.querySelectorAll('.lb-tab').forEach((t) => t.classList.toggle('on', t.dataset.b === current));
    list.innerHTML = '';
    const field = players.players().map((p) => ({ p, score: board.key(p) }));
    field.push({ p: { ...me, id: '__me' }, score: board.mine(me), me: true });
    field.sort((a, b) => b.score - a.score);
    const myIdx = field.findIndex((f) => f.me);
    const shown = new Set([...field.slice(0, 10), field[myIdx]]);
    let lastRank = 0;
    field.forEach((f, i) => {
      if (!shown.has(f)) return;
      const rank = i + 1;
      if (rank - lastRank > 1) list.append(el('div', { class: 'lb-sub center', style: 'padding:2px 0' }, '···'));
      lastRank = rank;
      list.append(lbRow(f, rank, board));
    });
  };
  BOARDS.forEach((b) => tabs.append(el('button', { class: 'lb-tab', dataset: { b: b.id }, onclick: () => { current = b.id; renderBoard(); } }, b.label)));
  root.append(tabs, list); renderBoard();

  // Conservation impact
  root.append(el('div', { class: 'section-h' }, el('h3', {}, 'Your impact')));
  root.append(impactCard(me));

  // Friends
  root.append(el('div', { class: 'section-h' }, el('h3', {}, 'Friends'), el('a', { onclick: () => toast('Friend codes arrive with cloud accounts') }, 'Add friend')));
  const fg = el('div', { class: 'friend-grid' });
  players.friends().forEach((p) => fg.append(el('div', { class: 'friend-card', role: 'button', tabindex: '0', onclick: () => go('#/player/' + p.id) },
    avatar(p),
    el('div', { class: 'friend-main' }, el('div', { class: 'friend-n' }, p.name, p.online ? el('span', { class: 'online-dot', title: 'Online' }) : null), el('div', { class: 'friend-s' }, `Lvl ${p.level} · ${fmt(p.species)} species · ${p.motto}`)),
    el('button', { class: 'friend-visit', onclick: (e) => { e.stopPropagation(); go('#/player/' + p.id); } }, 'Visit'))));
  root.append(fg);

  root.append(el('div', { class: 'data-note' }, el('p', {}, 'You are exploring with a simulated community while cloud play is being prepared. Leaderboards, visits, and events all work — real explorers join when accounts go live.')));
  root.append(el('div', { style: 'height:8px' }));
  return root;
}

function lbRow(f, rank, board) {
  const p = f.p;
  const row = el('div', { class: 'lb-row' + (f.me ? ' me' : ''), role: f.me ? null : 'button', tabindex: f.me ? null : '0', onclick: () => { if (!f.me) go('#/player/' + p.id); } },
    el('span', { class: 'lb-rank' + (rank <= 3 ? ' top' + rank : '') }, rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : String(rank)),
    avatar(p),
    el('div', { class: 'lb-main' }, el('div', { class: 'lb-name' }, f.me ? 'You' : p.name, p.online && !f.me ? el('span', { class: 'online-dot' }) : null), el('div', { class: 'lb-sub' }, `Level ${p.level}${p.streak ? ` · ${p.streak}-day streak` : ''}`)),
    el('div', { class: 'lb-score' }, fmt(f.score), el('small', {}, board.unit)));
  return row;
}

async function expeditionCard() {
  const wrap = el('div', { class: 'exped-card' });
  let g; try { g = await expeditions.get(); } catch (_) { return el('div', {}); }
  const def = g.def;
  wrap.append(el('div', { class: 'exped-banner' },
    el('span', { class: 'exped-ico' }, def.icon),
    el('div', { class: 'exped-head' }, el('div', { class: 'exped-t' }, def.title), el('div', { class: 'exped-s' }, def.blurb)),
    el('span', { class: 'ev-live' }, el('span', { class: 'online-dot' }), 'Live')));
  const list = el('div', { class: 'exped-objs' });
  g.objectives.forEach((o) => {
    const pct = Math.round((o.progress / o.n) * 100);
    const row = el('div', { class: 'exped-obj' + (o.done ? ' done' : '') },
      el('div', { class: 'exped-obj-main' },
        el('div', { class: 'exped-obj-t' }, o.label),
        el('div', { class: 'exped-obj-sub' }, el('span', { class: 'bar' }, el('i', { style: `width:${pct}%` })), el('span', { class: 'exped-n' }, `${o.progress}/${o.n}`))));
    if (o.done && !o.claimed) { const b = el('button', { class: 'q-claim', onclick: async () => { const r = await expeditions.claim(o.id); if (r) { toast(`+${r.coins} coins`); ecoRefreshPlay(); } } }, 'Claim'); row.append(b); }
    else if (o.claimed) row.append(el('span', { class: 'q-check' }, '✓'));
    list.append(row);
  });
  wrap.append(list);
  // Bonus reward
  const r = def.reward;
  const parts = [];
  if (r.gems) parts.push(`💎${r.gems}`); if (r.seeds) parts.push(`🌰${r.seeds}`); if (r.nectar) parts.push(`🌸${r.nectar}`); if (r.plankton) parts.push(`🦠${r.plankton}`); if (r.leaves) parts.push(`🍃${r.leaves}`);
  const foot = el('div', { class: 'exped-foot' });
  foot.append(el('div', { class: 'exped-bonus' }, el('span', { class: 'exped-bonus-k' }, 'Complete all for'), el('span', { class: 'exped-bonus-v' }, parts.join('  '))));
  if (g.allDone && !g.bonusClaimed) { const b = el('button', { class: 'exped-claim-all', onclick: async () => { const rr = await expeditions.claimBonus(); if (rr) { toast('Expedition complete!  ' + parts.join('  ')); ecoRefreshPlay(); } } }, 'Claim reward'); foot.append(b); }
  else if (g.bonusClaimed) foot.append(el('span', { class: 'exped-done-badge' }, '✓ Expedition complete'));
  wrap.append(foot);
  return wrap;
}
function ecoRefreshPlay() { try { const m = document.querySelector('#view'); if (m) import('./shell.js').then((s) => s.render()); } catch (_) {} }
function questCard(qs, me) {
  const card = el('div', { class: 'quest-card', style: 'margin-top:16px' });
  card.append(el('div', { class: 'q-head' }, el('span', { class: 'q-k' }, 'Daily challenges'), el('span', { class: 'q-timer' }, quests.timerLabel())));
  qs.forEach((q) => card.append(questRow(q, card)));
  if (me.streak > 1) card.append(el('div', { style: 'margin-top:12px' }, el('span', { class: 'streak-flame' }, '🔥', `${me.streak}-day streak — keep it alive`)));
  return card;
}
function questRow(q, card) {
  const row = el('div', { class: 'q-row' + (q.done ? ' done' : '') });
  row.append(el('span', { class: 'q-ico' }, q.icon));
  const pct = Math.round((q.progress / q.n) * 100);
  row.append(el('div', { class: 'q-main' }, el('div', { class: 'q-t' }, q.title),
    el('div', { class: 'q-sub' }, el('span', { class: 'bar' }, el('i', { style: `width:${pct}%` })), el('span', { class: 'q-n' }, `${q.progress}/${q.n}`))));
  if (q.done && !q.claimed) {
    const btn = el('button', { class: 'q-claim', onclick: async () => { const r = await quests.claim(q.id); if (r) { toast(`+${r.coins} coins · +${r.xp} XP${r.leaves ? ` · +${r.leaves} 🍃` : ''}`); btn.replaceWith(el('span', { class: 'q-check' }, '✓')); } } }, 'Claim');
    row.append(btn);
  } else if (q.claimed) row.append(el('span', { class: 'q-check' }, '✓'));
  else row.append(el('div', { class: 'q-reward' }, el('div', { class: 'q-amt' }, `+${q.reward.coins}`), el('div', { class: 'q-lbl' }, 'coins')));
  return row;
}

function impactCard(me) {
  const c = el('div', { class: 'impact-card' });
  c.append(el('div', { class: 'impact-k' }, 'You made a difference'));
  const t = el('div', { class: 'impact-t', html: `You helped protect <b>${fmt(me.conservation)} m²</b> of wild habitat` });
  c.append(t);
  c.append(el('div', { class: 'impact-s' }, 'Every discovery, daily challenge, and leaf you donate supports real conservation partners. Leaves convert to protected habitat: 1 🍃 = 10 m².'));
  const leaves = me.profile.leaves || 0;
  const btn = el('button', { class: 'btn ghost', style: 'width:auto;padding:11px 18px', onclick: async () => { const gained = await store.donateLeaves(leaves); if (gained > 0) { toast(`Donated — +${fmt(gained)} m² protected`); const p = store.getProfile(); t.innerHTML = `You helped protect <b>${fmt(p.conservation)} m²</b> of wild habitat`; btn.textContent = 'Donate leaves (0 🍃)'; btn.disabled = true; } else toast('Earn leaves by finding threatened species'); } }, `Donate leaves (${leaves} 🍃)`);
  if (!leaves) btn.disabled = true;
  c.append(el('div', { class: 'impact-row' }, btn));
  return c;
}

/* ---- Visit another explorer's habitat ---- */
const BEH = { swim: ['fish', 'shark', 'ray', 'seal', 'whale', 'turtle'], perch: ['songbird', 'raptor', 'owl', 'duck', 'heron'], hover: ['hummingbird'], flutter: ['butterfly', 'bee', 'dragonfly', 'bat'], pulse: ['jelly'], crawl: ['crab', 'nudibranch', 'octopus'], sway: ['coral', 'seastar', 'urchin', 'shell', 'seahorse', 'tree', 'fern', 'flower', 'mushroom'] };
const behaviourOf = (cat) => { for (const b in BEH) if (BEH[b].includes(cat)) return b; return 'walk'; };
const BAND = { perch: [66, 86], hover: [26, 50], flutter: [46, 68], swim: [30, 74], pulse: [16, 64], walk: [70, 88], crawl: [82, 92], sway: [76, 92] };
const DUR = { swim: [14, 26], perch: [7, 14], hover: [4, 8], flutter: [3.6, 7], pulse: [5, 10], walk: [16, 28], crawl: [13, 22], sway: [5, 11] };
const SIZE = { whale: 2.0, shark: 1.5, ray: 1.3, seal: 1.15, turtle: 1.0, octopus: 1.0, fish: 0.58, jelly: 0.85, crab: 0.6, nudibranch: 0.5, seastar: 0.62, urchin: 0.55, shell: 0.45, coral: 0.95, raptor: 1.15, owl: 1.0, heron: 1.2, duck: 0.9, songbird: 0.55, hummingbird: 0.42, bat: 0.6, bigcat: 1.45, bear: 1.6, deer: 1.3, fox: 0.95, rabbit: 0.62, rodent: 0.45, lizard: 0.55, snake: 0.85, croc: 1.5, frog: 0.5, salamander: 0.5, butterfly: 0.55, bee: 0.4, dragonfly: 0.55, beetle: 0.42, flower: 0.7, mushroom: 0.6 };
const timeTint = () => { const h = new Date().getHours(); if (h < 6 || h >= 20) return 'night'; if (h < 9) return 'dawn'; if (h >= 17) return 'dusk'; return 'day'; };

export async function playerView(id) {
  const p = players.playerById(id);
  const root = el('div', { class: 'pad' });
  if (!p) { root.append(el('div', { class: 'back-head' }, el('button', { class: 'back-btn', onclick: () => goBack('#/play') }, '‹'), el('h1', { class: 'h-title' }, 'Explorer not found'))); return root; }
  quests.bump('visit_player').catch(() => {});
  root.append(el('div', { class: 'back-head' }, el('button', { class: 'back-btn', 'aria-label': 'Back', onclick: () => goBack('#/play') }, '‹'), el('h1', { class: 'h-title' }, 'Visiting')));
  root.append(el('div', { class: 'visit-head' }, avatar(p, true), el('div', { class: 'vh-main' },
    el('div', { class: 'visit-name' }, p.name),
    el('div', { class: 'visit-sub' }, `Level ${p.level} · ${p.online ? 'online now' : 'away'} · “${p.motto}”`))));
  root.append(el('div', { class: 'visit-stats' },
    vs(fmt(p.species), 'Species'), vs(fmt(p.habitatScore), 'Habitat'), vs(fmt(p.conservation), 'm² saved'), vs(String(p.streak), 'Streak')));

  const scene = el('div', { class: `habitat-scene ${p.biome} ${timeTint()}` });
  const world = el('div', { class: 'habitat-world' });
  const bg = el('div', { class: 'habitat-bg' });
  const art = document.createElement('div'); art.className = 'scene-art'; art.innerHTML = scenes.backdrop(p.biome, p.creatures.length); bg.append(art);
  world.append(bg);
  p.creatures.forEach((c) => {
    const beh = behaviourOf(c.cat);
    const [b0, b1] = BAND[beh] || [60, 85];
    const [d0, d1] = DUR[beh] || [10, 18];
    const dur = d0 + Math.random() * (d1 - d0);
    const size = 58 * (SIZE[c.cat] || 0.8);
    const alt = (['swim', 'walk', 'flutter', 'crawl', 'perch'].includes(beh) && Math.random() < 0.45) ? ' alt' : '';
    const node = el('button', { class: 'habitat-creature roam-' + beh + alt, title: c.name, 'aria-label': c.name, onclick: () => toast(`${c.name} — recorded by ${p.name}`) });
    const rig = hasRig(c.cat) ? c.cat : (c.cat === 'rodent' ? 'rodentSm' : null);
    const face = el('div', { class: 'creature-face face-' + beh }); face.innerHTML = (rig && stickerSVG(rig)) || silSVG(c.cat, 'specimen'); node.append(face);
    node.style.cssText = `--sz:${size.toFixed(0)}px;width:var(--sz);height:var(--sz);left:${(4 + Math.random() * 88).toFixed(1)}%;top:${(b0 + Math.random() * (b1 - b0)).toFixed(1)}%;--dur:${dur.toFixed(1)}s;--delay:${(-Math.random() * dur).toFixed(1)}s;z-index:${10 + Math.round(Math.random() * 6)};`;
    world.append(node);
  });
  scene.append(world);
  root.append(scene);

  const cheer = el('button', { class: 'btn', onclick: async () => { await store.countLike(); cheer.disabled = true; cheer.textContent = 'Cheered 🎉'; toast(`${p.name} will see your cheer`); } }, 'Cheer this habitat');
  const trade = el('button', { class: 'btn ghost', onclick: () => { trade.disabled = true; trade.textContent = 'Offer sent'; toast(`Trade offer sent — ${p.name.split(/(?=[A-Z])/)[0]} will respond when online`); } }, 'Offer a trade');
  root.append(el('div', { class: 'visit-act' }, cheer, trade));
  root.append(el('div', { class: 'guest-note' }, `You are a guest in ${p.name}'s ${p.biome} habitat. Tap any animal to see who found it.`));
  root.append(el('div', { style: 'height:8px' }));
  return root;
}
const vs = (v, k) => el('div', { class: 'vs' }, el('div', { class: 'v' }, v), el('div', { class: 'k' }, k));
