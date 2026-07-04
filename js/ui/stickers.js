/* ============================================================
   WILDDEX STICKER ART ENGINE
   The game's canonical illustration system. Hand-tuned vector
   rigs in a single art direction: bold warm-brown linework,
   soft rounded forms, restrained dot eyes, subtle fur/feather
   texture, muted natural palettes, soft ground shadow.
   Every species resolves to exactly one artwork (see
   data/library.js) — identical for every player, forever.
   ============================================================ */

export const OUT = '#33241c';
const SW = 3;
const attrs = `stroke="${OUT}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"`;
const P = (d, fill, sw = SW) => `<path d="${d}" fill="${fill}" stroke="${OUT}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
const F = (d, fill, o = 1) => `<path d="${d}" fill="${fill}" opacity="${o}"/>`;
const E = (cx, cy, rx, ry, fill, sw = SW) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${OUT}" stroke-width="${sw}"/>`;
const EF = (cx, cy, rx, ry, fill, o = 1) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${o}"/>`;
const C = (cx, cy, r, fill, sw = SW) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${OUT}" stroke-width="${sw}"/>`;
const L = (d, w = 1.5, o = 0.5) => `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
const LW = (d, w, color, o = 1) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
const eye = (x, y, r = 2.4) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${OUT}"/><circle cx="${(x - r * 0.32).toFixed(1)}" cy="${(y - r * 0.36).toFixed(1)}" r="${(r * 0.34).toFixed(2)}" fill="#fff"/>`;
const closedEye = (x, y, r = 2.4) => L(`M${x - r},${y} q${r},${r * 1.1} ${r * 2},0`, 1.8, 1);
const nose = (x, y, r = 1.7, c = OUT) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.8}" fill="${c}"/>`;
const shadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${Math.max(3.4, rx * 0.16)}" fill="${OUT}" opacity=".13"/>`;

// A standing leg — tapers from thigh to a slim cannon, rounded foot, darker hoof/paw band.
function leg(x, top, h, w, fill, hoof, hoofH = 6, lean = 0) {
  const b = top + h, ht = w / 2, hb = Math.max(2.7, w * 0.37), xb = x + lean;
  const d = `M${(x - ht).toFixed(1)},${top} C${(x - ht + 0.4).toFixed(1)},${(top + h * 0.42).toFixed(1)} ${(xb - hb).toFixed(1)},${(b - h * 0.42).toFixed(1)} ${(xb - hb).toFixed(1)},${b - 3} Q${(xb - hb).toFixed(1)},${b} ${(xb - hb + 2.2).toFixed(1)},${b} L${(xb + hb - 2.2).toFixed(1)},${b} Q${(xb + hb).toFixed(1)},${b} ${(xb + hb).toFixed(1)},${b - 3} C${(xb + hb).toFixed(1)},${(b - h * 0.42).toFixed(1)} ${(x + ht - 0.4).toFixed(1)},${(top + h * 0.42).toFixed(1)} ${(x + ht).toFixed(1)},${top} Z`;
  let s = P(d, fill);
  if (hoof) s += P(`M${(xb - hb).toFixed(1)},${b - hoofH} L${(xb + hb).toFixed(1)},${b - hoofH} L${(xb + hb).toFixed(1)},${b - 3} Q${(xb + hb).toFixed(1)},${b} ${(xb + hb - 2.2).toFixed(1)},${b} L${(xb - hb + 2.2).toFixed(1)},${b} Q${(xb - hb).toFixed(1)},${b} ${(xb - hb).toFixed(1)},${b - 3} Z`, hoof, 2.2);
  return s;
}
// Near-side leg that merges into the body: an unstroked seam patch hides the top stroke
// so the outline reads as one continuous body+leg silhouette.
function legN(x, top, h, w, fill, hoof, hoofH = 6, lean = 0) {
  const ht = w / 2;
  return leg(x, top, h, w, fill, hoof, hoofH, lean)
    + F(`M${(x - ht + 1).toFixed(1)},${top - 2} L${(x + ht - 1).toFixed(1)},${top - 2} L${(x + ht - 1).toFixed(1)},${top + 11} L${(x - ht + 1).toFixed(1)},${top + 11} Z`, fill);
}
const furTicks = (pts, o = 0.42) => pts.map(([x, y, dx, dy]) => L(`M${x},${y} q${dx / 2},${dy / 2} ${dx},${dy}`, 1.3, o)).join('');
// Scattered little "w" fur hatches (very low opacity surface texture).
const wMarks = (pts, o = 0.3) => pts.map(([x, y]) => L(`M${x},${y} q1.4,2 2.8,0 q1.4,2 2.8,0`, 1.1, o)).join('');

/* ================= MAMMALS ================= */

// Deer / moose / horse / cow / goat / sheep / llama / camel — one parametric ungulate.
let _clip = 0;
function ungulate(p) {
  const B = p.base, D = p.dark, LT = p.light, SH = p.shade, HC = p.headC || B;
  const neck = p.neck || 'mid'; // 'short' | 'mid' | 'long'
  const hx = 88;
  const hy = neck === 'long' ? 19 : neck === 'short' ? 33 : 25;
  let s = shadow(60, 107, 40);
  // — antlers & horns (behind the head) —
  const antC = p.antlerC || '#dcc8a8';
  const branch = (d) => `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${antC}" stroke-width="3" stroke-linecap="round"/>`;
  if (p.antler === 'deer') {
    s += branch(`M${hx - 8},${hy - 6} C${hx - 12},${hy - 16} ${hx - 12},${hy - 24} ${hx - 8},${hy - 30} M${hx - 10},${hy - 14} C${hx - 15},${hy - 17} ${hx - 18},${hy - 21} ${hx - 19},${hy - 26} M${hx - 9},${hy - 22} C${hx - 13},${hy - 26} ${hx - 14},${hy - 30} ${hx - 13},${hy - 33}`);
    s += branch(`M${hx + 2},${hy - 8} C${hx + 4},${hy - 18} ${hx + 6},${hy - 26} ${hx + 12},${hy - 31} M${hx + 3},${hy - 16} C${hx + 8},${hy - 19} ${hx + 11},${hy - 23} ${hx + 12},${hy - 27} M${hx + 5},${hy - 23} C${hx + 9},${hy - 26} ${hx + 15},${hy - 27} ${hx + 18},${hy - 25}`);
  }
  if (p.antler === 'moose') {
    s += P(`M${hx - 6},${hy - 8} C${hx - 20},${hy - 8} ${hx - 30},${hy - 16} ${hx - 30},${hy - 27} C${hx - 22},${hy - 32} ${hx - 10},${hy - 26} ${hx - 5},${hy - 16} Z`, antC, 2.8);
    s += P(`M${hx + 4},${hy - 9} C${hx + 16},${hy - 12} ${hx + 24},${hy - 22} ${hx + 22},${hy - 32} C${hx + 13},${hy - 35} ${hx + 4},${hy - 27} ${hx + 1},${hy - 16} Z`, antC, 2.8);
    s += L(`M${hx - 24},${hy - 25} l2,5 M${hx - 17},${hy - 26} l1,5 M${hx + 16},${hy - 29} l-2,5 M${hx + 10},${hy - 30} l-1,5`, 1.6, .5);
  }
  if (p.horn === 'goat') s += branch(`M${hx - 6},${hy - 8} C${hx - 9},${hy - 15} ${hx - 8},${hy - 22} ${hx - 3},${hy - 26} M${hx + 4},${hy - 9} C${hx + 2},${hy - 16} ${hx + 4},${hy - 23} ${hx + 9},${hy - 26}`);
  if (p.horn === 'ibex') s += P(`M${hx + 5},${hy - 8} C${hx + 2},${hy - 22} ${hx - 10},${hy - 30} ${hx - 24},${hy - 26} C${hx - 26},${hy - 18} ${hx - 18},${hy - 14} ${hx - 10},${hy - 15} C${hx - 4},${hy - 15} ${hx - 1},${hy - 12} ${hx - 1},${hy - 7} Z`, p.hornC || '#c9a97e', 2.8) + L(`M${hx - 4},${hy - 18} q-2,-4 -6,-5 M${hx - 1},${hy - 12} q-1,-4 -4,-6`, 1.5, .55);
  if (p.horn === 'cow') { const hornC = p.hornC || '#e8dcc0'; s += P(`M${hx - 9},${hy - 6} C${hx - 16},${hy - 8} ${hx - 19},${hy - 14} ${hx - 17},${hy - 19} C${hx - 11},${hy - 18} ${hx - 8},${hy - 13} ${hx - 7},${hy - 8} Z`, hornC, 2.6) + P(`M${hx + 7},${hy - 7} C${hx + 14},${hy - 9} ${hx + 17},${hy - 15} ${hx + 15},${hy - 20} C${hx + 9},${hy - 19} ${hx + 6},${hy - 14} ${hx + 5},${hy - 9} Z`, hornC, 2.6); }
  // — far legs (hind under the rump, front under the chest; shaded) —
  s += leg(34, 64, 40, 7.5, SH, p.hoof, 6, -1);
  s += leg(82, 62, 42, 7.5, SH, p.hoof, 6, 1);
  // — tail —
  s += p.tail === 'horse'
    ? P('M27,52 C17,56 13,72 18,86 C25,81 28,66 31,58 Z', D)
    : P('M28,54 q-9,3 -9,12 q7,0 11,-6 Z', B);
  // — body: defined chest, belly tuck, rounded rump (wool = scalloped back) —
  const bodyD = p.wool
    ? 'M26,66 C21,58 25,49 33,48 C31,40 41,35 48,40 C51,32 63,32 66,40 C73,35 83,40 81,48 C89,49 93,58 90,66 C88,75 80,79 67,80 C51,81 37,80 31,76 C27,73 26,70 26,66 Z'
    : p.hump === 2
      ? 'M26,66 C23,54 30,46 42,44 C45,32 57,32 61,42 C65,32 77,32 81,42 C90,46 94,55 92,64 C90,73 83,78 72,79 C58,80 44,80 35,77 C29,74 27,70 26,66 Z'
      : 'M26,66 C23,52 31,44 45,42 C58,40 72,40 81,44 C90,48 94,56 92,64 C90,73 83,78 72,79 C58,80 44,80 35,77 C29,74 27,70 26,66 Z';
  s += P(bodyD, B);
  // — neck (unstroked fill merges into body; only exterior edges get linework) —
  s += F(`M${hx - 16},${hy + 14} C${hx - 14},${hy + 4} ${hx - 8},${hy - 4} ${hx + 2},${hy - 6} L${hx + 12},${hy + 4} C${hx + 10},${hy + 16} ${hx + 2},${hy + 30} ${hx - 2},${hy + 42} L${hx - 22},${hy + 38} C${hx - 20},${hy + 28} ${hx - 18},${hy + 20} ${hx - 16},${hy + 14} Z`, HC);
  s += LW(`M${hx - 16},${hy + 14} C${hx - 14},${hy + 4} ${hx - 8},${hy - 4} ${hx + 2},${hy - 6}`, SW, OUT);
  s += LW(`M${hx + 12},${hy + 4} C${hx + 10.5},${hy + 13} ${hx + 6},${hy + 22} ${hx + 2},${hy + 29}`, SW, OUT);
  if (p.mane) s += P(`M${hx - 16},${hy + 14} C${hx - 14},${hy + 4} ${hx - 8},${hy - 4} ${hx + 2},${hy - 6} L${hx - 1},${hy + 2} C${hx - 8},${hy + 4} ${hx - 11.5},${hy + 10} ${hx - 12.5},${hy + 18} Z`, p.maneC || D, 2.2);
  if (p.pattern === 'zebra') s += LW(`M${hx - 8},${hy + 5} l7,5 M${hx - 12},${hy + 13} l8,5 M${hx - 15},${hy + 21} l9,5`, 3, D, .8);
  // — near legs (merged into the body silhouette) —
  s += legN(43, 69, 37, 9, B, p.hoof, 6, -1);
  s += legN(72, 67, 39, 9, B, p.hoof, 6, 1);
  // — markings, clipped to the body so they never spill —
  const cid = 'stc' + (++_clip);
  let marks = F('M28,68 C42,80 76,80 92,60 C91,75 76,83 57,82 C42,81 32,76 28,68 Z', LT, .5);
  if (p.pattern === 'patches') marks += F('M38,48 C52,42 62,48 61,57 C60,65 48,69 41,62 C36,57 35,52 38,48 Z', LT) + F('M70,58 C80,53 88,60 84,69 C80,76 69,75 67,67 C66,63 67,60 70,58 Z', LT);
  if (p.pattern === 'spots') marks += [[45, 52], [55, 48], [65, 51], [50, 60], [62, 60], [72, 56]].map(([x, y]) => EF(x, y, 2.1, 1.7, LT, .92)).join('');
  if (p.pattern === 'belly') marks += F('M28,66 C42,80 76,80 92,58 C90,74 74,84 56,83 C42,82 31,75 28,66 Z', LT, .9);
  if (p.pattern === 'zebra') marks += [[37, -2, 43, 24], [46, 2, 41, 30], [55, -2, 40, 32], [64, 2, 40, 31], [73, -2, 42, 28], [82, 2, 44, 22]].map(([x, k, y0, len]) => LW(`M${x},${y0} q${k * 2},${len * 0.55} ${k * 0.5},${len}`, 3.5, D, .88)).join('') + LW('M33,60 q4,4 3,10 M88,56 q-4,4 -3,10', 3.2, D, .8);
  s += `<clipPath id="${cid}"><path d="${bodyD}"/></clipPath><g clip-path="url(#${cid})">${marks}</g>`;
  // — ears —
  s += P(`M${hx - 7},${hy - 5} C${hx - 15},${hy - 12} ${hx - 14},${hy - 20} ${hx - 8},${hy - 18} C${hx - 4},${hy - 16} ${hx - 3},${hy - 9} ${hx - 4},${hy - 5} Z`, HC);
  s += P(`M${hx + 5},${hy - 6} C${hx + 9},${hy - 14} ${hx + 15},${hy - 15} ${hx + 15},${hy - 9} C${hx + 15},${hy - 5} ${hx + 11},${hy - 2} ${hx + 8},${hy - 2} Z`, HC);
  // — skull + muzzle (moose gets the big drooping nose) —
  const bigMz = p.antler === 'moose';
  s += E(hx, hy + 2, 12, 10.2, HC);
  s += bigMz ? E(hx + 9, hy + 7, 8.8, 6.8, p.muzzleC || LT, 2.5) : E(hx + 10, hy + 6, 7.5, 5.7, p.muzzleC || LT, 2.5);
  s += nose(hx + (bigMz ? 12 : 13), hy + (bigMz ? 5.8 : 4.6), 1.5);
  s += L(`M${hx + 10},${hy + (bigMz ? 10.5 : 9)} q3,1 5.4,-.4`, 1.5, .7);
  s += eye(hx - 3, hy, 2.3);
  s += L(`M${hx - 11},${hy + 7} q2,3 6,4`, 1.3, .3); // soft cheek
  if (p.forelock) s += F(`M${hx - 8},${hy - 8} C${hx - 4},${hy - 14} ${hx + 6},${hy - 14} ${hx + 9},${hy - 7} C${hx + 3},${hy - 10} ${hx - 3},${hy - 10} ${hx - 8},${hy - 8} Z`, D);
  // — fur texture: back-ridge flicks + scattered "w" hatches —
  s += furTicks(p.wool
    ? [[40, 46, 3, 2], [54, 42, 3, 2], [68, 44, 3, 2], [46, 56, 3, 2], [60, 58, 3, 2], [74, 56, 3, 2], [33, 66, 2, 3]]
    : [[42, 46, 3, -2], [54, 42, 3, -1.5], [66, 42, 3, -1.5], [77, 46, 3, -1], [34, 54, -2, 3], [87, 56, 2, 2]]);
  s += wMarks(p.wool ? [[48, 64], [62, 66], [38, 58]] : [[47, 64], [59, 62], [70, 65], [39, 60]]);
  return s;
}

// Fox / wolf / big cat / raccoon — round-headed carnivore, side stance.
function carnivore(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(58, 105, 36);
  // far legs — hind under the haunch, front under the chest
  s += leg(38, 64, 38, 7, p.shade, p.dark, 5, -1);
  s += leg(78, 62, 40, 7, p.shade, p.dark, 5, 1);
  // tail
  if (p.tailKind === 'bushy') s += P('M30,60 C13,55 4,70 12,85 C24,91 34,78 36,66 Z', B) + F('M12,81 C17,88 25,86 29,79 C24,84 17,84 12,81 Z', LT);
  else if (p.tailKind === 'ringed') s += P('M30,62 C16,60 7,72 12,88 C23,92 34,80 36,68 Z', B) + F('M12,73 C19,75 27,72 32,66 L35,71 C29,78 19,79 11,79 Z', D) + F('M12,84 C18,88 26,86 30,80 L32,85 C26,91 17,91 12,88 Z', D);
  else s += P('M31,58 C19,56 10,62 8,74 C15,78 25,72 32,65 Z', B); // smooth cat tail
  // body — deep chest, tucked waist, round haunch
  const bodyD = 'M28,64 C25,51 34,45 48,43 C61,41 74,42 81,47 C87,51 89,57 87,63 C85,71 77,76 65,77 C51,78 37,77 32,72 C29,69 28,67 28,64 Z';
  s += P(bodyD, B);
  // near legs (merged into silhouette)
  s += legN(45, 66, 37, 8.5, B, p.dark, 5, -1);
  s += legN(71, 64, 39, 8.5, B, p.dark, 5, 1);
  // haunch + shoulder creases
  s += L('M53,72 C57,63 53,52 43,48', 1.6, .3) + L('M65,72 C64,63 66,53 72,49', 1.6, .2);
  const cid = 'stc' + (++_clip);
  if (p.pattern === 'spots') s += [[48, 54], [60, 50], [70, 58], [52, 64], [40, 58], [64, 66]].map(([x, y]) => EF(x, y, 2.2, 1.8, D, .55)).join('');
  if (p.pattern === 'stripes') s += `<clipPath id="${cid}"><path d="${bodyD}"/></clipPath><g clip-path="url(#${cid})">`
    + [[40, 3], [50, -4], [60, 3], [70, -4], [80, 3]].map(([x, k]) => LW(`M${x},44 q${k},17 ${k * 0.4},34`, 3.4, D, .9)).join('')
    + LW('M38,68 q3,5 0,10 M78,66 q-3,5 0,10', 3, D, .8) + '</g>';
  // head — round with short muzzle, 3/4 facing right
  const hx = 84, hy = 34;
  const earH = p.earKind === 'pointy' ? 16 : 10;
  s += P(`M${hx - 12},${hy - 6} L${hx - 15},${hy - 6 - earH} L${hx - 3},${hy - 12} Z`, B) + F(`M${hx - 11.4},${hy - 8} L${hx - 13},${hy - 4 - earH} L${hx - 6},${hy - 11} Z`, p.earIn || '#e3b7a6', .9);
  s += P(`M${hx + 4},${hy - 10} L${hx + 10},${hy - 9 - earH} L${hx + 13},${hy - 2} Z`, B) + F(`M${hx + 6},${hy - 10} L${hx + 9.4},${hy - 6 - earH} L${hx + 11},${hy - 4} Z`, p.earIn || '#e3b7a6', .9);
  s += C(hx, hy, 13.5, B);
  // cheek fur points
  s += L(`M${hx - 13.5},${hy + 3} l-3,1.5 M${hx - 12.5},${hy + 6.5} l-2.6,2`, 1.5, .55);
  if (p.mask) s += F(`M${hx - 12},${hy - 2} C${hx - 8},${hy + 6} ${hx - 2},${hy + 6} ${hx},${hy} C${hx + 2},${hy + 6} ${hx + 8},${hy + 6} ${hx + 12},${hy - 2} L${hx + 13},${hy + 4} C${hx + 8},${hy + 10} ${hx - 8},${hy + 10} ${hx - 13},${hy + 4} Z`, D, .95);
  s += E(hx + 3, hy + 7, 7.5, 5.5, LT, 2.4);
  s += nose(hx + 3, hy + 4.6, 1.8);
  s += L(`M${hx + 3},${hy + 6.4} q0,2.4 -2.4,3 M${hx + 3},${hy + 6.4} q0,2.4 2.4,3`, 1.5, .85);
  s += eye(hx - 6, hy + 1, 2.2) + eye(hx + 9, hy + 1, 2.2);
  if (p.brows) s += L(`M${hx - 9},${hy - 4} q3,-1.6 5,-.6 M${hx + 6},${hy - 4.6} q3,-.6 5,.8`, 1.5, .6);
  s += furTicks([[44, 46, 3, -2], [56, 44, 3, -1.5], [68, 44, 3, -1.5], [34, 58, -2, 2], [76, 50, 2, -1]]);
  s += wMarks([[48, 62], [60, 60], [40, 56]]);
  if (p.chest) s += F('M72,68 C78,64 84,58 85,52 C88,61 84,72 74,76 C70,74 70,70 72,68 Z', LT, .9);
  return s;
}

// Bear — chunky standing silhouette with shoulder hump.
function bear(p) {
  const B = p.base, LT = p.light;
  let s = shadow(60, 107, 42);
  // far legs
  s += leg(40, 70, 36, 10, p.shade, null, 6, -1) + leg(84, 68, 38, 9.5, p.shade, null, 6, 1);
  // body — massive shoulder hump toward the head, round rump
  s += P('M22,72 C17,52 30,41 50,37 C64,33 78,34 87,41 C96,46 100,55 98,64 C96,77 87,84 72,86 C56,88 38,87 29,82 C24,79 23,76 22,72 Z', B);
  // near legs (merged, chunky but separated)
  s += legN(32, 70, 36, 12.5, B, null, 6, -1) + legN(72, 68, 38, 11.5, B, null, 6, 1);
  // toe lines on the near feet
  s += L('M29,102 l0,3.4 M34,102 l0,3.4 M69,100 l0,3.4 M74,100 l0,3.4', 1.6, .6);
  // haunch + shoulder creases
  s += L('M42,76 C46,66 42,54 32,50', 1.6, .28) + L('M64,76 C63,66 66,54 74,48', 1.6, .2);
  // head
  const hx = 88, hy = 38;
  s += C(hx - 13, hy - 12, 5, B) + C(hx + 5, hy - 15, 5, B);
  s += `<circle cx="${hx - 13}" cy="${hy - 12}" r="2.2" fill="${LT}" opacity=".55"/><circle cx="${hx + 5}" cy="${hy - 15}" r="2.2" fill="${LT}" opacity=".55"/>`;
  s += P(`M${hx - 16},${hy - 4} C${hx - 16},${hy - 16} ${hx - 4},${hy - 20} ${hx + 4},${hy - 16} C${hx + 13},${hy - 12} ${hx + 15},${hy - 2} ${hx + 10},${hy + 6} C${hx + 4},${hy + 12} ${hx - 10},${hy + 12} ${hx - 14},${hy + 4} Z`, B);
  s += E(hx + 5, hy + 4, 7.5, 6, LT, 2.4);
  s += nose(hx + 6, hy + 1.6, 2.2);
  s += L(`M${hx + 6},${hy + 4} q0,2.2 -2.2,2.8`, 1.5, .8);
  s += eye(hx - 7, hy - 3, 2.2) + eye(hx + 8, hy - 5, 2.2);
  s += furTicks([[40, 42, 3, -2], [54, 38, 3, -1.5], [68, 38, 3, -1], [30, 56, -2, 3], [78, 44, 3, -1], [92, 58, 2, 2]]);
  s += wMarks([[46, 60], [58, 58], [70, 62], [36, 64]]);
  return s;
}

// Sitting small mammal — rodent, rabbit, squirrel, beaver, otter-ish.
function critter(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 104, 30);
  // tails first
  if (p.tailKind === 'squirrel') s += P('M78,84 C96,80 100,58 88,44 C78,36 66,42 70,52 C78,50 86,56 84,66 C82,76 74,80 70,82 Z', B) + L('M88,52 C92,60 90,70 82,76', 1.6, .5);
  if (p.tailKind === 'beaver') s += P('M74,88 C88,86 100,90 102,98 C100,104 86,106 74,100 Z', D, 2.6) + L('M80,92 l16,2 M78,96 l18,2', 1.2, .5);
  if (p.tailKind === 'thin') s += P('M76,92 C90,94 98,88 100,80', 'none', 2.6);
  if (p.tailKind === 'puff') s += C(76, 84, 6, LT, 2.4);
  // body — pear sit
  s += P('M38,86 C30,70 36,50 52,44 C68,38 84,48 86,66 C88,80 80,94 62,96 C50,97 42,94 38,86 Z', B);
  // haunch — big sitting thigh gives the pear shape anatomy
  s += L('M56,92 C44,92 36,84 36,72 C36,64 41,58 47,58', 2.2, .45);
  if (p.belly) s += E(62, 76, 12.5, 14, LT, 2.4);
  // hind foot + front paws
  s += E(46, 96, 8.5, 4.5, B, 2.6) + L('M42,96 l0,2.6 M46,96 l0,2.6 M50,96 l0,2.6', 1.3, .5);
  s += P('M58,74 q-3,7 2,10 M68,74 q3,7 -2,10', 'none', 2.6);
  s += furTicks([[44, 64, -2, 2], [42, 76, -2, 2], [78, 62, 2, 2], [80, 74, 2, 2]]) + wMarks([[52, 52], [66, 50]]);
  // head
  const hx = 62, hy = 38;
  if (p.earKind === 'tall') s += P(`M${hx - 10},${hy - 8} C${hx - 16},${hy - 30} ${hx - 8},${hy - 36} ${hx - 4},${hy - 28} C${hx - 2},${hy - 20} ${hx - 4},${hy - 12} ${hx - 6},${hy - 8} Z`, B) + P(`M${hx + 4},${hy - 9} C${hx + 4},${hy - 32} ${hx + 12},${hy - 36} ${hx + 14},${hy - 27} C${hx + 15},${hy - 18} ${hx + 12},${hy - 11} ${hx + 8},${hy - 8} Z`, B);
  else s += C(hx - 10, hy - 9, p.earKind === 'round' ? 6.5 : 5, B) + C(hx + 10, hy - 10, p.earKind === 'round' ? 6.5 : 5, B) + `<circle cx="${hx - 10}" cy="${hy - 9}" r="2.6" fill="${p.earIn || '#e3b7a6'}"/><circle cx="${hx + 10}" cy="${hy - 10}" r="2.6" fill="${p.earIn || '#e3b7a6'}"/>`;
  s += E(hx, hy, 15, 13, B);
  if (p.mask) s += F(`M${hx - 14},${hy - 3} C${hx - 9},${hy + 3} ${hx - 3},${hy + 3} ${hx},${hy - 1} C${hx + 3},${hy + 3} ${hx + 9},${hy + 3} ${hx + 14},${hy - 3} L${hx + 14},${hy + 3} C${hx + 8},${hy + 8} ${hx - 8},${hy + 8} ${hx - 14},${hy + 3} Z`, D, .95);
  s += E(hx, hy + 6, 6.5, 4.8, LT, 2.2);
  s += nose(hx, hy + 3.4, 1.6);
  if (p.teeth) s += P(`M${hx - 2.4},${hy + 8} h4.8 v3.4 q0,1.2 -1.2,1.2 h-2.4 q-1.2,0 -1.2,-1.2 Z`, '#fff', 1.6) + L(`M${hx},${hy + 8} v4`, 1.2, .8);
  s += eye(hx - 7, hy - 1, 2.2) + eye(hx + 7, hy - 1, 2.2);
  s += L(`M${hx + 13},${hy + 3} l6,-1 M${hx + 13},${hy + 5} l6,1 M${hx - 13},${hy + 3} l-6,-1 M${hx - 13},${hy + 5} l-6,1`, 1.1, .45);
  s += furTicks([[48, 56, -2, 2], [76, 58, 2, 2]]);
  return s;
}

/* ================= BIRDS ================= */

function songbird(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 102, 26);
  // tail
  s += P('M42,64 L20,50 L26,66 L18,62 L30,74 Z', D, 2.8);
  // body
  s += P('M38,72 C32,54 44,40 62,40 C80,40 90,52 86,68 C83,80 72,86 58,86 C48,86 41,81 38,72 Z', B);
  if (p.crest) s += P('M56,42 L52,28 L62,38 L64,26 L70,40 Z', p.crestC || B, 2.6);
  if (p.capC) s += F('M46,50 C50,40 62,36 72,40 C80,43 84,49 84,54 C76,48 60,46 46,50 Z', p.capC);
  s += F('M42,72 C50,80 68,82 80,72 C76,82 64,88 54,86 C46,84 42,78 42,72 Z', LT, .95);
  // wing
  s += P('M50,58 C60,52 74,54 76,62 C77,70 68,76 58,74 C50,72 46,64 50,58 Z', p.wingC || D, 2.6);
  s += L('M56,62 q8,-2 14,2 M55,68 q8,-1 13,2', 1.4, .55);
  if (p.wingbar) s += LW('M54,60 q9,-3 17,1', 2.6, LT, .95);
  // beak + eye
  s += P('M86,56 L96,58 L86,62 Z', p.beakC || '#e8a94f', 2.4);
  s += eye(78, 52, 2.4);
  if (p.cheek) s += EF(80, 58, 3.4, 2.6, p.cheek, .85);
  // legs
  s += L('M56,86 L54,98 M66,84 L66,98', 2.4, 1) + L('M50,99 h8 M62,99 h8', 2.2, 1);
  return s;
}

function owl(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 104, 26);
  if (p.tufts) s += P('M42,26 L36,12 L50,20 Z M78,26 L84,12 L70,20 Z', B, 2.6);
  s += P('M38,60 C36,34 46,20 60,20 C74,20 84,34 82,60 C81,80 72,92 60,92 C48,92 39,80 38,60 Z', B);
  // wings folded
  s += P('M38,50 C32,58 32,72 38,82 C43,76 44,60 43,52 Z', D, 2.6) + P('M82,50 C88,58 88,72 82,82 C77,76 76,60 77,52 Z', D, 2.6);
  // belly texture
  s += E(60, 68, 14, 16, LT, 2.4);
  s += L('M52,62 q3,3 6,0 M62,62 q3,3 6,0 M56,70 q3,3 6,0 M52,78 q3,3 6,0 M62,78 q3,3 6,0', 1.3, .5);
  // face disc
  s += P('M44,40 C44,28 52,24 60,24 C68,24 76,28 76,40 C76,48 68,52 60,52 C52,52 44,48 44,40 Z', LT, 2.6);
  s += C(52, 38, 6.5, '#fff', 2.4) + C(68, 38, 6.5, '#fff', 2.4);
  s += `<circle cx="52" cy="38" r="3" fill="${OUT}"/><circle cx="51" cy="37" r=".9" fill="#fff"/><circle cx="68" cy="38" r="3" fill="${OUT}"/><circle cx="67" cy="37" r=".9" fill="#fff"/>`;
  s += P('M60,42 L57,48 L63,48 Z', p.beakC || '#d9a441', 2);
  s += L('M52,92 l-2,6 M56,93 l0,6 M64,93 l0,6 M68,92 l2,6', 2.2, 1);
  return s;
}

function raptor(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 106, 26);
  s += P('M50,88 L44,102 L58,96 Z M70,88 L76,102 L62,96 Z', D, 2.6); // tail
  s += P('M42,64 C40,40 48,26 62,24 C76,22 84,34 82,54 C81,74 74,88 60,90 C50,90 44,80 42,64 Z', B);
  // wing
  s += P('M44,48 C38,60 40,76 48,86 C56,80 56,60 52,48 Z', D, 2.6) + L('M46,60 q4,-2 6,0 M45,70 q4,-2 6,0 M47,78 q4,-2 6,0', 1.4, .5);
  if (p.headC) s += F('M48,42 C48,30 56,24 63,24 C72,24 80,32 80,42 C70,36 56,36 48,42 Z', p.headC);
  // fierce brow + hooked beak
  s += P('M76,32 C84,31 88,35 87,41 C84,45 79,43 76,39 Z', p.beakC || '#e0b04f', 2.4) + L('M83,41 q2,2 0,4', 2, .9);
  s += L('M62,29 q6,-2 10,1', 2, .9);
  s += eye(69, 33, 2.6);
  s += E(60, 72, 11, 12, LT, 2.2) + L('M55,66 q3,3 6,0 M60,74 q3,3 6,0', 1.3, .45);
  s += L('M54,90 l-1,8 M62,90 l0,8', 2.4, 1) + L('M48,99 h9 M58,99 h9', 2.2, 1) + L('M50,101 l-2,3 M66,101 l2,3', 1.8, .9);
  return s;
}

function duck(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 104, 30);
  s += P('M34,72 C28,58 38,48 52,48 C58,48 64,50 68,54 L74,58 C84,60 90,66 88,74 C86,84 74,90 58,90 C44,90 36,84 34,72 Z', B);
  s += P('M48,60 C58,54 70,58 72,66 C73,74 64,80 54,78 C46,76 43,66 48,60 Z', p.wingC || D, 2.6) + L('M52,64 q8,-2 14,2 M51,70 q8,-1 13,2', 1.3, .5);
  if (p.speculum) s += LW('M52,74 q8,2 14,-1', 3, p.speculum, .95);
  // neck + head
  s += P('M64,54 C64,44 66,36 74,32 L84,36 C84,44 80,50 74,56 Z', p.headC || B);
  s += C(78, 32, 10, p.headC || B);
  if (p.eyering) s += LW('M72,28 a7,7 0 1,0 12,2', 1.6, LT, .8);
  s += P('M86,32 C94,31 98,33 98,36 C98,39 93,40 86,38 Z', p.beakC || '#e0a83c', 2.4);
  s += eye(78, 29, 2.2);
  s += L('M52,90 l-2,8 M64,90 l0,8', 2.4, 1) + P('M44,98 l8,-2 l2,5 Z M60,98 l8,-2 l2,5 Z', p.beakC || '#e0a83c', 2);
  return s;
}

function heron(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(58, 108, 26);
  // body
  s += P('M36,70 C32,58 40,48 54,46 C66,44 76,50 76,60 C76,72 66,80 52,80 C44,80 38,76 36,70 Z', B);
  s += P('M44,58 C54,52 66,56 66,64 C66,70 58,74 50,72 C44,70 41,63 44,58 Z', D, 2.6) + L('M48,62 q7,-2 12,1', 1.3, .5);
  // S-neck up to head
  s += P('M66,52 C60,42 64,30 74,26 C82,23 88,26 88,32 C88,38 82,40 78,44 C74,48 72,52 72,56 Z', LT, 2.8);
  s += C(82, 30, 8, LT, 2.8);
  if (p.crestStripe) s += P('M78,24 C84,20 92,20 96,24 L86,28 Z', D, 2.2);
  s += P('M89,30 L104,33 L89,36 Z', p.beakC || '#e0b04f', 2.2);
  s += eye(84, 29, 2);
  s += L('M50,80 l-2,20 M60,79 l0,21', 2.4, 1) + L('M42,101 h11 M54,101 h11', 2.2, 1);
  return s;
}

function hummingbird(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = '';
  // blurred wings up
  s += P('M52,38 C44,22 52,12 62,14 C64,22 60,32 56,40 Z', D, 2.4) + `<path d="M60,36 C56,24 60,16 68,16" fill="none" stroke="${OUT}" stroke-width="1.6" opacity=".4"/>`;
  s += P('M40,66 L22,78 L34,80 L28,88 L44,80 Z', D, 2.6); // tail
  s += P('M38,70 C36,54 48,44 62,46 C74,48 80,58 76,68 C72,78 60,82 50,80 C42,78 39,76 38,70 Z', B);
  if (p.throatC) s += F('M64,60 C72,58 78,62 76,68 C72,74 64,72 62,66 Z', p.throatC);
  s += F('M42,72 C50,78 62,80 70,74 C66,82 54,84 46,80 Z', LT, .9);
  s += P('M76,54 L100,50 L77,58 Z', OUT, 1.6);
  s += eye(70, 54, 2.1);
  s += shadow(58, 100, 20);
  return s;
}

/* ================= AQUATIC ================= */

function fish(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 100, 30);
  // tail
  s += P('M34,60 C26,50 20,46 14,46 C18,54 18,66 14,74 C20,74 26,70 34,60 Z', D, 2.8);
  // body
  const bodyD = 'M30,60 C34,44 48,36 64,36 C82,36 96,46 98,58 C96,72 82,82 64,82 C48,82 34,76 30,60 Z';
  s += P(bodyD, B);
  const cid = 'stc' + (++_clip);
  let marks = F('M34,66 C48,78 76,80 94,66 C88,78 74,84 58,82 C44,80 36,74 34,66 Z', LT, .95);
  if (p.stripes) marks += F('M52,38 L62,38 L58,82 L48,80 Z', D, .8) + F('M70,38 L80,40 L78,80 L68,82 Z', D, .8);
  s += `<clipPath id="${cid}"><path d="${bodyD}"/></clipPath><g clip-path="url(#${cid})">${marks}</g>`;
  // dorsal + pectoral fins
  s += P('M50,38 C54,28 68,24 78,28 L66,38 Z', p.finC || D, 2.6);
  s += P('M56,62 C64,58 72,60 72,66 C70,72 60,72 56,68 Z', p.finC || D, 2.4) + L('M60,62 l8,3', 1.2, .5);
  // face
  s += eye(84, 54, 2.8);
  s += L('M94,62 q3,2 0,4', 1.8, .85);
  return s;
}

function shark(p) {
  const B = p.base, LT = p.light;
  let s = shadow(60, 102, 40);
  s += P('M26,58 C18,46 14,38 16,30 C24,36 30,44 34,52 Z', B, 2.8); // upper tail
  s += P('M26,62 C20,70 18,76 20,82 C26,78 30,70 32,64 Z', B, 2.8); // lower tail
  const bodyD = 'M24,60 C32,44 52,36 72,38 C88,40 100,48 104,58 C100,68 88,76 70,78 C50,80 32,74 24,60 Z';
  s += P(bodyD, B);
  const cid = 'stc' + (++_clip);
  s += `<clipPath id="${cid}"><path d="${bodyD}"/></clipPath><g clip-path="url(#${cid})">` + F('M28,66 C46,78 78,80 102,62 C98,74 82,82 62,82 C44,82 32,76 28,66 Z', LT, .95) + '</g>';
  s += P('M52,40 C54,26 62,20 70,20 C70,30 66,36 62,40 Z', B, 2.8); // dorsal
  s += P('M54,70 C58,80 56,86 50,90 C46,84 46,76 48,70 Z', B, 2.6); // pectoral
  s += L('M60,52 q2,5 0,10 M67,52 q2,5 0,10 M74,52 q2,5 0,10', 1.6, .5); // gills
  s += eye(92, 52, 2.6);
  s += L('M100,60 q-4,4 -10,4', 1.8, .85);
  return s;
}

function ray(p) {
  const B = p.base, LT = p.light;
  let s = shadow(60, 100, 40);
  s += P('M78,66 C92,72 102,84 104,96 C98,96 88,90 80,80 Z', B, 2.6); // tail
  s += P('M20,56 C22,40 38,28 58,28 C78,28 94,40 96,56 C94,70 78,80 58,80 C38,80 22,70 20,56 Z', B); // disc
  s += P('M20,56 C10,52 6,44 8,36 C16,38 22,44 26,50 Z', B, 2.6); // left wing tip
  s += P('M96,56 C106,52 110,44 108,36 C100,38 94,44 90,50 Z', B, 2.6); // right wing tip
  s += EF(58, 68, 16, 8, LT, .9);
  s += L('M50,68 q3,2 6,0 M60,68 q3,2 6,0', 1.4, .6);
  s += eye(48, 44, 2.5) + eye(68, 44, 2.5);
  s += L('M52,56 q6,4 12,0', 1.8, .85);
  s += [[40, 36], [58, 33], [76, 36]].map(([x, y]) => EF(x, y, 2, 1.6, LT, .5)).join('');
  return s;
}

function whale(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 104, 42);
  // fluke
  s += P('M26,64 C18,58 10,58 6,62 C10,52 16,50 22,52 C20,46 24,40 30,40 C32,48 32,56 30,62 Z', B, 2.8);
  const bodyD = 'M24,62 C30,44 50,34 70,36 C90,38 104,50 104,62 C102,76 86,86 62,86 C42,86 28,78 24,62 Z';
  s += P(bodyD, B);
  const cid = 'stc' + (++_clip);
  s += `<clipPath id="${cid}"><path d="${bodyD}"/></clipPath><g clip-path="url(#${cid})">`
    + F('M26,68 C48,82 82,84 104,64 C102,78 84,88 60,88 C42,88 30,80 26,68 Z', LT, .95)
    + LW('M34,70 q10,6 22,7 M36,76 q8,4 16,5', 1.6, OUT, .35) + '</g>';
  s += P('M58,76 C64,84 62,90 56,93 C52,88 52,80 54,75 Z', B, 2.6); // flipper
  s += eye(90, 58, 2.6);
  s += L('M100,64 q-4,4 -10,4', 1.8, .85);
  if (p.spout) s += LW('M78,34 q-2,-8 -8,-10 M78,34 q2,-8 8,-10 M78,34 q0,-9 0,-12', 2, '#a8cbd8', .9);
  return s;
}

function seal(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(58, 106, 42);
  // rear flippers up
  s += P('M20,84 C10,78 4,80 2,88 C8,92 16,92 22,90 Z M22,92 C12,92 6,96 6,102 C14,104 22,100 26,96 Z', B, 2.6);
  // body slug curve
  s += P('M18,90 C20,70 34,52 58,46 C80,42 98,52 100,68 C102,84 88,100 62,102 L34,102 C24,100 18,96 18,90 Z', B);
  // front flipper
  s += P('M52,84 C58,92 56,100 48,104 C42,100 42,90 46,84 Z', B, 2.6) + L('M48,92 l4,6 M51,89 l4,6', 1.3, .5);
  // head
  const hx = 84, hy = 52;
  s += C(hx, hy, 16, B);
  s += E(hx + 2, hy + 8, 9, 6.5, LT, 2.4);
  s += nose(hx + 2, hy + 3.6, 2);
  if (p.tusks) s += P(`M${hx - 3},${hy + 11} C${hx - 4},${hy + 19} ${hx - 3},${hy + 24} ${hx - 1},${hy + 27} C${hx + 1},${hy + 24} ${hx + 1},${hy + 17} ${hx},${hy + 11} Z M${hx + 5},${hy + 11} C${hx + 6},${hy + 19} ${hx + 7},${hy + 23} ${hx + 9},${hy + 26} C${hx + 11},${hy + 22} ${hx + 10},${hy + 16} ${hx + 8},${hy + 10} Z`, '#f2ead8', 2.2);
  s += L(`M${hx + 10},${hy + 6} l7,-2 M${hx + 10},${hy + 9} l7,1 M${hx - 6},${hy + 6} l-7,-2 M${hx - 6},${hy + 9} l-7,1`, 1.2, .5);
  s += p.sleepy ? closedEye(hx - 6, hy - 3, 2.6) + closedEye(hx + 9, hy - 3, 2.6) : eye(hx - 6, hy - 2, 2.3) + eye(hx + 9, hy - 2, 2.3);
  s += furTicks([[36, 70, -2, 3], [30, 84, -1, 3], [60, 56, 2, -2]]);
  return s;
}

function turtle(p) {
  const B = p.base, D = p.dark, LT = p.light, SH = p.shellC || '#7a9a5c', SD = p.shellD || '#5d7a44';
  let s = shadow(58, 104, 36);
  // legs
  s += P('M38,84 L36,98 Q36,102 40,102 L46,102 L48,86 Z', B, 2.6) + P('M66,84 L64,98 Q64,102 68,102 L74,102 L76,86 Z', B, 2.6);
  // tail
  s += P('M28,76 q-8,2 -10,8 q6,2 11,-2 Z', B, 2.4);
  // shell dome
  const shellD2 = 'M26,74 C24,52 40,38 58,38 C78,38 92,52 90,74 C88,82 80,86 58,86 C36,86 28,82 26,74 Z';
  s += P(shellD2, SH);
  const cid = 'stc' + (++_clip);
  s += `<clipPath id="${cid}"><path d="${shellD2}"/></clipPath><g clip-path="url(#${cid})">`
    + [[42, 56], [58, 48], [74, 56], [50, 70], [66, 70]].map(([x, y]) => `<path d="M${x - 8},${y} L${x - 4},${y - 7} L${x + 4},${y - 7} L${x + 8},${y} L${x + 4},${y + 7} L${x - 4},${y + 7} Z" fill="none" stroke="${SD}" stroke-width="2.4" opacity=".9"/>`).join('')
    + F('M26,78 L90,78 L90,86 L26,86 Z', SD, .5) + '</g>';
  // head
  s += P('M88,70 C96,68 104,60 104,52 C104,44 98,40 92,42 C86,44 84,52 84,60 Z', B);
  s += eye(95, 50, 2.4);
  s += L('M101,56 q-3,3 -7,3', 1.7, .85);
  s += EF(97, 55, 2.6, 2, LT, .5);
  return s;
}

/* ================= HERPS & BAT ================= */

function frog(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 104, 34);
  // haunches
  s += P('M28,80 C22,66 30,54 42,54 C50,54 54,62 52,72 C50,82 40,88 32,86 Z', D, 2.8) + P('M92,80 C98,66 90,54 78,54 C70,54 66,62 68,72 C70,82 80,88 88,86 Z', D, 2.8);
  // body
  s += P('M34,74 C32,54 44,42 60,42 C76,42 88,54 86,74 C84,88 74,96 60,96 C46,96 36,88 34,74 Z', B);
  s += E(60, 80, 15, 11, LT, 2.4);
  // front legs
  s += P('M48,86 L46,100 M72,86 L74,100', 'none', 2.8) + L('M41,101 h10 M69,101 h10', 2.4, 1);
  // eye bumps
  s += C(46, 40, 8.5, B) + C(74, 40, 8.5, B);
  s += eye(46, 39, 3) + eye(74, 39, 3);
  s += L('M50,56 q10,6 20,0', 2, .85); // wide smile
  if (p.spots) s += EF(48, 62, 2.4, 2, D, .55) + EF(70, 60, 2.4, 2, D, .55) + EF(60, 52, 2, 1.7, D, .55);
  s += p.cheeks ? EF(42, 52, 3.4, 2.6, '#e0917a', .6) + EF(78, 52, 3.4, 2.6, '#e0917a', .6) : '';
  return s;
}

function lizard(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(58, 102, 38);
  // tail curling right→left
  s += P('M30,80 C16,80 8,72 10,62 C18,64 24,70 34,72 Z', B, 2.8);
  // body low
  const bodyD = 'M28,78 C30,64 44,56 62,56 C80,56 92,64 94,74 C92,86 78,92 58,92 C42,92 30,88 28,78 Z';
  s += P(bodyD, B);
  const cid = 'stc' + (++_clip);
  s += `<clipPath id="${cid}"><path d="${bodyD}"/></clipPath><g clip-path="url(#${cid})">` + F('M30,82 C48,92 76,92 92,78 C88,90 72,96 54,94 C40,92 32,88 30,82 Z', LT, .9) + '</g>';
  // legs
  s += P('M42,88 l-4,10 M50,90 l0,10 M72,90 l0,10 M80,88 l4,10', 'none', 2.8) + L('M34,99 h8 M46,101 h8 M68,101 h8 M80,99 h8', 2.2, 1);
  // head
  s += E(94, 60, 13, 10, B);
  s += eye(92, 56, 2.6);
  s += L('M102,64 q-4,3 -9,3', 1.8, .85);
  if (p.crest) s += P('M50,56 L54,48 L58,56 M62,56 L66,48 L70,56', 'none', 2.2);
  s += [[44, 66], [58, 62], [72, 66]].map(([x, y]) => EF(x, y, 2, 1.6, D, .45)).join('');
  return s;
}

function snake(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 104, 34);
  // coil
  s += P('M88,88 C100,84 104,72 98,62 C92,52 76,50 62,54 C50,58 44,66 46,74 C48,82 58,86 68,84 C76,82 80,76 77,70 C74,65 66,64 62,68', 'none', 13);
  s += LW('M88,88 C100,84 104,72 98,62 C92,52 76,50 62,54 C50,58 44,66 46,74 C48,82 58,86 68,84 C76,82 80,76 77,70 C74,65 66,64 62,68', 7.6, B);
  if (p.bands) s += LW('M94,80 l7,4 M98,70 l8,0 M88,56 l5,-6 M70,52 l0,-7 M52,60 l-5,-5 M46,72 l-7,1', 3.4, D, .85);
  // tail tip + head
  s += P('M88,90 C94,92 100,92 104,88 C100,84 94,84 90,85 Z', B, 2.6);
  s += E(56, 44, 12, 9.5, B);
  s += eye(52, 41, 2.4) + eye(63, 41, 2.4);
  s += L('M56,49 q3,2 6,0', 1.7, .85);
  s += LW('M44,46 q-6,1 -8,4 M36,50 l-3,-2 M36,50 l-2,3', 1.8, '#c05a4a', .95); // tongue
  return s;
}

function croc(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(58, 104, 44);
  // tail
  s += P('M28,74 C16,74 8,80 6,88 C14,90 24,86 30,82 Z', B, 2.8);
  s += P('M20,78 l4,-6 4,5 M12,82 l4,-6 4,5', 'none', 2.2);
  // body
  const bodyD = 'M26,80 C28,66 44,60 62,60 C80,60 92,66 94,76 C92,88 78,94 58,94 C42,94 28,90 26,80 Z';
  s += P(bodyD, B);
  // back ridges
  s += P('M38,62 l4,-7 4,6 M52,60 l4,-7 4,6 M66,60 l4,-7 4,6', 'none', 2.4);
  // legs
  s += P('M42,90 l-3,10 M52,92 l0,9 M70,92 l0,9 M80,90 l3,10', 'none', 2.8) + L('M35,101 h8 M48,102 h8 M66,102 h8 M79,101 h8', 2.2, 1);
  // long snout head
  s += P('M86,72 C90,60 96,54 106,54 C112,54 114,58 112,62 C110,66 102,68 96,70 C92,74 88,76 86,76 Z', B);
  s += C(90, 58, 6.5, B); // eye bump
  s += eye(90, 57, 2.4);
  s += L('M96,66 q8,-1 14,-4', 1.8, .85);
  s += `<circle cx="109" cy="59" r="1" fill="${OUT}"/>`;
  s += F('M98,68 l2,2.6 2,-2.9 2,2.6 2,-2.9', '#fff') + L('M98,68 l2,2.6 2,-2.9 2,2.6 2,-2.9', 1.2, .8);
  return s;
}

function salamander(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(58, 102, 36);
  s += P('M30,78 C18,80 10,76 8,68 C16,66 26,70 34,72 Z', B, 2.6); // tail
  const bodyD = 'M28,78 C32,66 46,60 62,60 C78,60 90,66 92,76 C90,86 76,92 58,92 C42,92 30,88 28,78 Z';
  s += P(bodyD, B);
  s += P('M44,88 l-4,9 M52,90 l0,9 M70,90 l0,9 M78,88 l4,9', 'none', 2.6) + L('M36,98 h8 M48,100 h8 M66,100 h8 M78,98 h8', 2, 1);
  s += E(92, 64, 12, 9.5, B);
  s += eye(90, 60, 2.5);
  s += L('M99,68 q-3,3 -8,3', 1.7, .85);
  if (p.spots) s += [[42, 70], [56, 66], [70, 70], [82, 62]].map(([x, y]) => C(x, y, 2.6, p.spotC || '#e8c33a', 1.6)).join('');
  return s;
}

function bat(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = '';
  // wings
  s += P('M46,52 C34,40 18,36 6,42 C10,50 18,52 22,58 C26,52 32,54 34,60 C38,56 44,58 46,64 Z', D, 2.8);
  s += P('M74,52 C86,40 102,36 114,42 C110,50 102,52 98,58 C94,52 88,54 86,60 C82,56 76,58 74,64 Z', D, 2.8);
  // ears
  s += P('M50,38 L46,22 L58,32 Z M70,38 L74,22 L62,32 Z', B, 2.8);
  // body
  s += E(60, 56, 17, 20, B);
  s += EF(60, 64, 10, 9, LT, .85);
  s += eye(53, 50, 2.4) + eye(67, 50, 2.4);
  s += nose(60, 55, 1.6);
  s += L('M56,60 q4,3 8,0', 1.7, .85);
  s += P('M54,74 l-2,7 M66,74 l2,7', 'none', 2.2);
  s += shadow(60, 102, 26);
  return s;
}

/* ================= INVERTEBRATES ================= */

function butterfly(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 102, 26);
  // upper wings
  s += P('M54,56 C44,38 28,28 16,32 C12,44 22,58 40,64 Z', B, 2.8);
  s += P('M66,56 C76,38 92,28 104,32 C108,44 98,58 80,64 Z', B, 2.8);
  // lower wings
  s += P('M54,62 C44,68 34,78 36,88 C46,90 56,80 58,70 Z', B, 2.8);
  s += P('M66,62 C76,68 86,78 84,88 C74,90 64,80 62,70 Z', B, 2.8);
  // wing pattern
  s += EF(32, 42, 5.5, 4.5, LT, .95) + EF(88, 42, 5.5, 4.5, LT, .95) + EF(43, 80, 3.4, 3, LT, .85) + EF(77, 80, 3.4, 3, LT, .85);
  s += C(26, 50, 2.2, D, 1.4) + C(94, 50, 2.2, D, 1.4);
  // body + antennae
  s += E(60, 62, 5.5, 15, D, 2.6);
  s += L('M60,50 q0,4 0,8', 1.4, .4);
  s += eye(57, 51, 1.7) + eye(63, 51, 1.7);
  s += L('M56,46 C52,40 46,36 40,36 M64,46 C68,40 74,36 80,36', 1.8, .9) + `<circle cx="39" cy="36" r="1.8" fill="${OUT}"/><circle cx="81" cy="36" r="1.8" fill="${OUT}"/>`;
  return s;
}

function bee(p) {
  const B = p.base || '#e0b04f', D = p.dark || '#3d2f18', LT = p.light;
  let s = shadow(60, 100, 26);
  // wings
  s += P('M50,42 C40,26 48,14 60,18 C62,28 58,38 54,44 Z', '#e8e4d8', 2.4) + P('M70,42 C80,26 72,14 60,18 C58,28 62,38 66,44 Z', '#e8e4d8', 2.4);
  // body
  const bodyD = 'M36,66 C36,48 46,38 60,38 C74,38 84,48 84,66 C84,80 74,90 60,90 C46,90 36,80 36,66 Z';
  s += P(bodyD, B);
  const cid = 'stc' + (++_clip);
  s += `<clipPath id="${cid}"><path d="${bodyD}"/></clipPath><g clip-path="url(#${cid})">` + F('M34,52 h52 v9 h-52 Z', D) + F('M34,68 h52 v9 h-52 Z', D) + F('M34,84 h52 v9 h-52 Z', D) + '</g>';
  s += eye(52, 46, 2.4) + eye(68, 46, 2.4);
  s += L('M56,52 q4,3 8,0', 1.7, .85);
  s += L('M52,38 C48,32 44,30 40,30 M68,38 C72,32 76,30 80,30', 1.8, .9) + `<circle cx="39" cy="30" r="1.7" fill="${OUT}"/><circle cx="81" cy="30" r="1.7" fill="${OUT}"/>`;
  s += P('M60,90 L60,96 L57,93 Z', D, 1.6); // stinger
  return s;
}

function beetle(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 100, 26);
  s += L('M44,84 l-8,7 M40,68 l-10,2 M46,52 l-8,-6 M76,84 l8,7 M80,68 l10,2 M74,52 l8,-6', 2.4, .95);
  const bodyD = 'M38,62 C38,44 48,34 60,34 C72,34 82,44 82,62 C82,78 72,90 60,90 C48,90 38,78 38,62 Z';
  s += P(bodyD, B);
  s += L('M60,40 L60,88', 2.2, .85);
  const cid = 'stc' + (++_clip);
  s += `<clipPath id="${cid}"><path d="${bodyD}"/></clipPath><g clip-path="url(#${cid})">` + (p.spots ? [[50, 52], [70, 52], [46, 68], [74, 68], [56, 78], [64, 78]].map(([x, y]) => C(x, y, 3.4, D, 1.6)).join('') : EF(50, 50, 5, 10, LT, .3)) + '</g>';
  s += C(60, 30, 8, D, 2.6);
  s += eye(57, 28, 1.8) + eye(63, 28, 1.8);
  s += L('M54,24 q-4,-6 -10,-6 M66,24 q4,-6 10,-6', 1.7, .9);
  return s;
}

function dragonfly(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 100, 30);
  // wings
  const wing = (x, y, dx, dy) => P(`M${x},${y} C${x + dx * 0.4},${y + dy - 8} ${x + dx},${y + dy - 6} ${x + dx},${y + dy} C${x + dx},${y + dy + 5} ${x + dx * 0.4},${y + dy + 4} ${x},${y + 4} Z`, '#e4e8e0', 2.2);
  s += wing(52, 48, -34, -8) + wing(52, 56, -36, 4) + wing(68, 48, 34, -8) + wing(68, 56, 36, 4);
  s += L('M30,42 l6,4 M24,56 l8,1', 1.2, .4) + L('M90,42 l-6,4 M96,56 l-8,1', 1.2, .4);
  // tail
  s += LW('M60,64 L60,102', 7.5, B) + LW('M60,64 L60,102', 3, p.dark, .0);
  s += L('M56,72 h8 M56,80 h8 M56,88 h8 M56,96 h8', 1.6, .6);
  s += `<path d="M56,100 q4,4 8,0" fill="none" stroke="${OUT}" stroke-width="2.4"/>`;
  // thorax + eyes
  s += E(60, 54, 9, 11, B);
  s += C(53, 40, 6.5, D, 2.4) + C(67, 40, 6.5, D, 2.4);
  s += `<circle cx="51.5" cy="38" r="1.6" fill="#fff" opacity=".85"/><circle cx="65.5" cy="38" r="1.6" fill="#fff" opacity=".85"/>`;
  return s;
}

function octopus(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 104, 38);
  // arms — curled row
  const arm = (x, c1x, c2x, ex, ey) => P(`M${x},74 C${c1x},88 ${c2x},98 ${ex},${ey} C${ex + 7},${ey + 3} ${ex + 9},${ey - 4} ${ex + 5},${ey - 7} `, B, 2.6);
  s += arm(34, 24, 18, 22, 96) + arm(46, 42, 36, 38, 102) + arm(62, 62, 60, 58, 104) + arm(78, 84, 90, 88, 100);
  // mantle
  s += P('M32,58 C32,34 44,20 60,20 C76,20 88,34 88,58 C88,72 76,80 60,80 C44,80 32,72 32,58 Z', B);
  s += EF(48, 34, 8, 6, LT, .3);
  s += [[42, 82], [52, 88], [66, 88], [76, 82]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.7" fill="${LT}" opacity=".8"/>`).join('');
  s += eye(50, 54, 3) + eye(70, 54, 3);
  s += L('M55,64 q5,4 10,0', 1.8, .85);
  s += p.cheeks ? EF(44, 62, 3.4, 2.6, '#e0917a', .55) + EF(76, 62, 3.4, 2.6, '#e0917a', .55) : '';
  return s;
}

function jelly(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 106, 30);
  // tentacles
  s += LW('M44,66 C40,78 46,86 42,98 M54,68 C52,80 58,90 54,102 M66,68 C68,80 62,90 66,102 M76,66 C80,78 74,86 78,98', 2.6, B, .9);
  s += LW('M49,67 C47,76 51,84 48,94 M71,67 C73,76 69,84 72,94', 1.8, D, .6);
  // bell
  s += P('M32,56 C32,36 44,24 60,24 C76,24 88,36 88,56 C88,62 84,66 78,64 C76,68 70,70 66,67 C63,70 57,70 54,67 C50,70 44,68 42,64 C36,66 32,62 32,56 Z', B);
  s += `<path d="M40,46 C42,36 50,30 58,30" fill="none" stroke="${LT}" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
  s += eye(52, 48, 2.4) + eye(68, 48, 2.4);
  s += L('M56,56 q4,3 8,0', 1.7, .8);
  return s;
}

function crab(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 102, 36);
  // legs
  s += L('M36,74 L22,84 M40,80 L30,92 M84,74 L98,84 M80,80 L90,92', 2.8, .95);
  // claws up
  s += P('M32,52 C24,46 20,38 24,30 C32,30 38,36 38,44 Z', B, 2.6) + P('M24,30 l6,-6', 'none', 2.4);
  s += P('M88,52 C96,46 100,38 96,30 C88,30 82,36 82,44 Z', B, 2.6) + P('M96,30 l-6,-6', 'none', 2.4);
  s += P('M34,48 l-4,8 M86,48 l4,8', 'none', 2.6);
  // shell
  s += P('M30,66 C30,50 42,42 60,42 C78,42 90,50 90,66 C90,78 78,86 60,86 C42,86 30,78 30,66 Z', B);
  s += EF(60, 76, 18, 7, LT, .5);
  // eye stalks
  s += L('M50,44 L48,34 M70,44 L72,34', 2.4, .95);
  s += `<circle cx="48" cy="32" r="3.6" fill="#fff" stroke="${OUT}" stroke-width="2.2"/><circle cx="48" cy="32" r="1.7" fill="${OUT}"/><circle cx="72" cy="32" r="3.6" fill="#fff" stroke="${OUT}" stroke-width="2.2"/><circle cx="72" cy="32" r="1.7" fill="${OUT}"/>`;
  s += L('M54,58 q6,4 12,0', 1.8, .85);
  s += EF(46, 56, 3, 2.4, D, .35) + EF(74, 56, 3, 2.4, D, .35);
  return s;
}

function seastar(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 104, 32);
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
    const a2 = a + Math.PI / 5;
    pts.push([60 + Math.cos(a) * 38, 58 + Math.sin(a) * 38, 60 + Math.cos(a2) * 15, 58 + Math.sin(a2) * 15]);
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < 5; i++) { const n = pts[(i + 1) % 5]; d += ` Q${pts[i][2].toFixed(1)},${pts[i][3].toFixed(1)} ${n[0].toFixed(1)},${n[1].toFixed(1)}`; }
  s += P(d + ' Z', B);
  s += [[60, 34], [80, 52], [72, 76], [48, 76], [40, 52]].map(([x, y]) => C(x, y, 1.8, LT, 1.2)).join('');
  s += eye(54, 54, 2.2) + eye(66, 54, 2.2);
  s += L('M56,62 q4,3 8,0', 1.6, .8);
  return s;
}

function urchin(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 102, 30);
  let spikes = '';
  for (let i = 0; i < 14; i++) { const a = i * Math.PI * 2 / 14; const x1 = 60 + Math.cos(a) * 24, y1 = 58 + Math.sin(a) * 24, x2 = 60 + Math.cos(a) * 38, y2 = 58 + Math.sin(a) * 38; spikes += `M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)} `; }
  s += LW(spikes, 3.4, OUT) + LW(spikes, 1.2, B);
  s += C(60, 58, 25, B);
  s += [[52, 50], [68, 50], [60, 64], [48, 62], [72, 62]].map(([x, y]) => C(x, y, 1.7, LT, 1.1)).join('');
  return s;
}

// Nudibranch — vivid parametric sea slugs.
// opts: form ('dorid'|'aeolid'|'shawl'|'bunny'), base (foot/body), mantle,
// trim (mantle-edge line), cerata + cerataTip, gill, rhino, spots/spotC, stripes.
function nudibranch(p) {
  const form = p.form || 'dorid';
  const B = p.base;
  const M = p.mantle || B;
  const T = p.trim || p.light || '#f2e8c4';
  const CE = p.cerata || p.dark || B;
  const CT = p.cerataTip || T;
  const G = p.gill || CE;
  const R = p.rhino || CE;
  const SP = p.spotC || T;
  let s = shadow(60, 100, 36);
  // annulated club rhinophore
  const rhinophore = (x, y, lean, h) => {
    const tx = x + lean, ty = y - h;
    return P(`M${x - 2.6},${y} C${(x - 2.4).toFixed(1)},${(y - h * 0.55).toFixed(1)} ${tx - 2},${ty + 3} ${tx},${ty} C${tx + 2},${ty + 3} ${(x + 2.6).toFixed(1)},${(y - h * 0.55).toFixed(1)} ${x + 2.6},${y} Z`, R, 2.2)
      + L(`M${(x - 1.8 + lean * 0.3).toFixed(1)},${(y - h * 0.4).toFixed(1)} l3.6,-1 M${(x - 1.2 + lean * 0.6).toFixed(1)},${(y - h * 0.65).toFixed(1)} l3,-.8`, 1.1, .55);
  };
  if (form === 'bunny') {
    // fuzzy sea bunny
    s += P('M28,86 C22,72 32,56 52,52 C72,48 88,58 90,72 C92,84 82,93 64,95 C46,97 33,94 28,86 Z', B);
    s += furTicks([[29, 74, -3, -1], [34, 63, -2.6, -2], [44, 56, -1.4, -2.8], [55, 52, 0, -3], [69, 52, 1.4, -2.8], [80, 57, 2.6, -2], [88, 65, 3, -1], [91, 76, 3, .6]], .6);
    if (p.spots !== false) s += [[42, 66], [54, 60], [66, 62], [48, 78], [62, 80], [74, 72], [36, 80], [56, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="${SP}"/>`).join('');
    // upright rhinophore "ears"
    s += P('M46,55 C43,45 45,36 50,32 C54,37 54,47 52,55 Z', R, 2.4) + L('M46.5,47 l5,-1.2 M47,41 l4.6,-1.2', 1.2, .6);
    s += P('M60,52 C59,42 62,33 67,30 C70,35 68,45 65,52 Z', R, 2.4) + L('M60.5,44 l5,-1.2 M62,38 l4.6,-1.2', 1.2, .6);
    // gill tuft tail — little fan of petals
    s += P('M31,79 C27,72 21,70 17,74 C18,79 24,82 29,83 Z', G, 2.2) + L('M21,75 l6,4', 1.1, .5);
    s += P('M31,84 C25,82 19,84 18,88 C21,91 28,90 32,87 Z', G, 2.2) + L('M22,87 l7,-1', 1.1, .5);
    // face
    s += eye(74, 74, 2) + eye(84, 70, 2);
    s += L('M77,79 q3,2 6,-1', 1.5, .8);
  } else if (form === 'aeolid' || form === 'shawl') {
    const dense = form === 'shawl';
    // finger cerata sprouting from the back (drawn first so bases tuck under the body)
    const cer = (x, y, h, lean, w) =>
      P(`M${(x - w / 2).toFixed(1)},${y} C${(x - w / 2 + lean * 0.3).toFixed(1)},${(y - h * 0.6).toFixed(1)} ${(x + lean - 1.6).toFixed(1)},${y - h + 2} ${x + lean},${y - h} C${(x + lean + 1.6).toFixed(1)},${y - h + 2} ${(x + w / 2 + lean * 0.6).toFixed(1)},${(y - h * 0.55).toFixed(1)} ${(x + w / 2).toFixed(1)},${y} Z`, CE, 2.2)
      + EF(x + lean, y - h + 2.8, 1.5, 2.2, CT, .95);
    if (dense) {
      [[24, 82, 20, -7], [32, 78, 25, -6], [40, 76, 29, -5], [48, 74, 31, -4], [56, 73, 32, -2], [64, 72, 31, -1], [72, 72, 29, 0], [80, 72, 25, 1], [88, 74, 20, 2]].forEach(([x, y, h, ln]) => { s += cer(x, y, h, ln, 6.5); });
      [[28, 84, 14, -4], [36, 80, 17, -4], [44, 78, 20, -3], [52, 76, 21, -2], [60, 75, 21, -1], [68, 75, 20, 0], [76, 75, 17, 1], [84, 76, 13, 2]].forEach(([x, y, h, ln]) => { s += cer(x, y, h, ln, 5.5); });
    } else {
      [[26, 81, 13, -5], [36, 77, 18, -4], [46, 74, 21, -3], [56, 73, 22, -2], [66, 72, 20, -1], [76, 72, 16, 0], [85, 74, 12, 1]].forEach(([x, y, h, ln]) => { s += cer(x, y, h, ln, 6); });
    }
    // body — slender foot
    const bodyD = 'M14,86 C12,79 20,73 32,71 C52,67 76,66 92,69 C102,71 106,77 101,83 C90,91 34,93 14,86 Z';
    s += P(bodyD, B);
    if (p.stripes) s += LW('M20,78 C44,72 76,71 98,74', 2.6, T, .9);
    if (p.spots) { const cid = 'stc' + (++_clip); s += `<clipPath id="${cid}"><path d="${bodyD}"/></clipPath><g clip-path="url(#${cid})">` + [[30, 80], [48, 77], [66, 76], [84, 78]].map(([x, y]) => EF(x, y, 2, 1.6, SP, .9)).join('') + '</g>'; }
    // oral tentacles
    s += LW('M102,78 C108,76 112,72 113,67', 2.6, R, .95) + LW('M100,74 C105,71 107,66 107,61', 2.6, R, .95);
    // rhinophores
    s += rhinophore(93, 70, 2, 16) + rhinophore(100, 73, 3, 13);
    // face
    s += eye(96, 79, 1.9);
    s += L('M100,84 q-3,2 -6,2', 1.5, .75);
  } else {
    // dorid — smooth mantle, feathery gill rosette at the rear, two rhinophores
    // foot peeking under the mantle
    s += P('M24,86 C20,82 24,77 32,77 L96,74 C103,76 105,81 100,85 C86,91 36,92 24,86 Z', B, 2.6);
    const mantleD = 'M18,82 C14,70 28,59 48,57 C68,55 88,58 97,66 C103,72 101,79 92,83 C70,89 32,89 18,82 Z';
    s += P(mantleD, M);
    // markings clipped to the mantle
    const cid = 'stc' + (++_clip);
    let marks = '';
    if (p.stripes) marks += LW('M20,74 C44,64 76,62 98,70', 3, T, .9) + LW('M24,81 C48,73 76,71 98,77', 2.2, T, .7);
    if (p.spots !== false) marks += [[34, 70], [50, 64], [68, 63], [84, 68], [42, 78], [60, 72], [78, 74]].map(([x, y]) => C(x, y, 2.4, SP, 1.5)).join('');
    s += `<clipPath id="${cid}"><path d="${mantleD}"/></clipPath><g clip-path="url(#${cid})">${marks}</g>`;
    // mantle-edge trim
    s += LW('M20,78 C36,86 76,86 94,78', 2.6, T, .95);
    // gill rosette
    const plume = (x, y, lean, h) => P(`M${x},${y} C${x - 3 + lean},${(y - h * 0.5).toFixed(1)} ${x - 2 + lean},${y - h} ${x + lean + 1},${y - h - 1} C${x + lean + 3},${y - h + 2} ${x + 4 + lean},${(y - h * 0.4).toFixed(1)} ${x + 4},${y} Z`, G, 2)
      + L(`M${x + 2},${y - 2} C${x + 1 + lean},${(y - h * 0.5).toFixed(1)} ${x + 1 + lean},${(y - h * 0.7).toFixed(1)} ${x + lean + 1},${y - h + 1}`, 1.1, .5);
    s += plume(30, 60, -6, 12) + plume(36, 57, -2, 15) + plume(43, 56, 2, 14) + plume(49, 58, 6, 11);
    // rhinophores
    s += rhinophore(84, 60, -1, 14) + rhinophore(93, 63, 2, 12);
    // face
    s += eye(95, 72, 1.9);
    s += L('M99,78 q-2,2 -5,2', 1.5, .75);
  }
  return s;
}

function seahorse(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(58, 104, 24);
  // curled tail
  s += P('M56,84 C52,96 58,104 68,102 C74,100 76,92 70,88 C66,86 62,88 62,92', 'none', 8);
  s += LW('M56,84 C52,96 58,104 68,102 C74,100 76,92 70,88 C66,86 62,88 62,92', 4.4, B);
  // body
  s += P('M52,42 C44,50 42,64 48,76 C52,84 60,88 66,84 C72,80 72,70 68,58 C66,50 60,42 52,42 Z', B);
  // dorsal fin
  s += P('M68,58 C76,56 80,62 78,70 C74,74 70,72 68,68 Z', D, 2.4) + L('M72,60 l2,8', 1.2, .5);
  // belly ridges
  s += L('M50,56 q6,3 12,1 M49,64 q6,3 12,1 M50,72 q6,3 12,1', 1.5, .5);
  // head + snout + coronet
  s += E(52, 36, 11, 9, B);
  s += P('M44,32 L30,34 L44,39 Z', B, 2.4);
  s += P('M52,26 l-2,-6 M57,27 l2,-6', 'none', 2.2);
  s += eye(54, 34, 2.4);
  return s;
}

function snail(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 102, 34);
  // body
  s += P('M24,90 C22,80 30,74 42,74 L84,74 C94,74 100,80 98,88 C96,94 88,96 76,96 L38,96 C30,96 26,94 24,90 Z', p.bodyC || '#d8bC94');
  // eye stalks
  s += P('M88,76 L92,60 M96,78 L102,64', 'none', 2.6) + `<circle cx="92" cy="58" r="3" fill="${p.bodyC || '#d8bc94'}" stroke="${OUT}" stroke-width="2"/><circle cx="102" cy="62" r="3" fill="${p.bodyC || '#d8bc94'}" stroke="${OUT}" stroke-width="2"/>` + `<circle cx="92" cy="58" r="1.2" fill="${OUT}"/><circle cx="102" cy="62" r="1.2" fill="${OUT}"/>`;
  s += L('M96,84 q-2,3 -6,3', 1.5, .75);
  // spiral shell
  s += C(52, 52, 26, B);
  s += LW('M52,52 m16,0 A16,16 0 1,1 52,36 A11,11 0 1,1 63,52 A6,6 0 1,1 52,46', 2.6, OUT, .85);
  s += EF(42, 40, 6, 4.5, LT, .5);
  return s;
}

function coral(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 104, 34);
  const lobe = (x, h, w) => P(`M${x - w},102 C${x - w},${102 - h * 0.7} ${x - w * 0.8},${102 - h} ${x},${102 - h} C${x + w * 0.8},${102 - h} ${x + w},${102 - h * 0.7} ${x + w},102 Z`, B, 2.8);
  s += lobe(38, 40, 10) + lobe(82, 46, 10) + lobe(60, 62, 12);
  s += [[60, 46], [58, 62], [62, 76], [38, 70], [40, 84], [82, 64], [80, 80]].map(([x, y]) => C(x, y, 1.9, LT, 1.2)).join('');
  s += L('M52,90 q8,4 16,0', 1.6, .4);
  return s;
}

/* ================= PLANTS & FUNGI ================= */

function tree(p) {
  const B = p.base || '#6b9a52', D = p.dark || '#4c7a3e', LT = p.light || '#8ab46a';
  let s = shadow(60, 106, 30);
  s += P('M54,70 L54,100 Q54,103 58,103 L62,103 Q66,103 66,100 L66,70 Z', '#8a5c3c', 2.8);
  s += L('M60,84 q-6,-4 -8,-10', 2, .6);
  s += C(42, 52, 17, D, 2.8) + C(78, 52, 17, D, 2.8) + C(60, 36, 20, B, 2.8) + C(60, 56, 18, B, 2.8);
  s += EF(52, 32, 6, 4.5, LT, .8) + EF(70, 50, 5, 4, LT, .7);
  return s;
}
function fern(p) {
  const B = p.base || '#5d8a4a';
  let s = shadow(60, 104, 28);
  const frond = (dx, k) => P(`M60,100 C${60 + dx * 0.4},${86} ${60 + dx * 0.8},${70} ${60 + dx},${54 + k}`, 'none', 3) + [0.3, 0.5, 0.7, 0.88].map((t) => L(`M${60 + dx * t},${100 - 46 * t + k * t} l${dx > 0 ? 7 : -7},-6 M${60 + dx * t},${100 - 46 * t + k * t} l${dx > 0 ? -5 : 5},-7`, 2, .85)).join('');
  s += frond(-26, 6) + frond(26, 6) + frond(-8, -8) + frond(8, -8);
  return s.replace(/stroke="#33241c" stroke-width="3"/g, `stroke="${B}" stroke-width="3.4"`);
}
function flower(p) {
  const B = p.base || '#d88aa8', D = p.dark || '#b46a88', LT = p.light || '#f2d9e4';
  let s = shadow(60, 104, 22);
  s += P('M58,70 L58,102 M60,84 q8,-4 10,-12 M60,90 q-8,-4 -10,-12', 'none', 2.8);
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; s += E(60 + Math.cos(a) * 14, 48 + Math.sin(a) * 14, 8.5, 6.5, B, 2.4).replace('<ellipse', `<ellipse transform="rotate(${(a * 57.3).toFixed(0)} ${(60 + Math.cos(a) * 14).toFixed(1)} ${(48 + Math.sin(a) * 14).toFixed(1)})"`); }
  s += C(60, 48, 8, '#e8c33a', 2.6);
  s += L('M57,46 l0,1 M63,46 l0,1', 1.6, .5);
  return s;
}
function mushroom(p) {
  const B = p.base || '#c96a4e', D = p.dark || '#a84e38', LT = p.light || '#f2e4d0';
  let s = shadow(60, 104, 28);
  s += P('M48,66 L46,94 Q46,100 54,100 L66,100 Q74,100 74,94 L72,66 Z', LT, 2.8);
  s += L('M52,74 q8,3 16,0', 1.6, .5);
  s += P('M28,64 C28,40 42,26 60,26 C78,26 92,40 92,64 Q92,68 86,68 L34,68 Q28,68 28,64 Z', B);
  s += C(46, 44, 4.5, LT, 1.8) + C(66, 38, 3.6, LT, 1.8) + C(74, 52, 4, LT, 1.8) + C(38, 56, 3, LT, 1.8);
  return s;
}

/* ================= MEGAFAUNA & COMMON ENCOUNTERS ================= */

// Elephant — gentle barrel body, fan ear, curled trunk.
function elephant(p) {
  const B = p.base, D = p.dark, LT = p.light, SH = p.shade;
  let s = shadow(60, 107, 44);
  // far legs
  s += leg(36, 68, 38, 11, SH, null, 6, 0);
  s += leg(76, 66, 40, 11, SH, null, 6, 0);
  // tail
  s += P('M24,54 C17,60 15,70 18,80', 'none', 2.8) + P('M18,80 q-4,5 -1,8 q4,-1 5,-7 Z', D, 2);
  // body
  s += P('M22,62 C20,46 34,36 54,34 C72,32 86,38 92,48 C96,56 95,64 90,70 C84,80 70,85 56,85 C40,85 27,80 23,72 Z', B);
  // near legs (columnar)
  s += legN(42, 72, 34, 14, B, null, 6, 0);
  s += legN(68, 70, 36, 13, B, null, 6, 0);
  // toenails
  s += [[39, 42], [45, 42], [65.5, 68], [70.5, 68]].map(([x]) => `<path d="M${x - 2.6},106 a2.6,2.4 0 0,1 5.2,0 Z" fill="${LT}" opacity=".85"/>`).join('');
  // head
  s += E(90, 40, 14, 12, B);
  // tusk
  s += P('M84,50 C83,57 84,62 88,65 C91,62 90,55 88,50 Z', '#f2ead8', 2.2);
  // trunk — merged fill, exterior edges inked
  s += F('M95,38 C106,40 110,49 108,58 C105,69 100,77 93,81 C90,79 89.5,75 91,71 C95,64 97,56 95,50 C93,44 89,42 85,44 Z', B);
  s += LW('M98,39 C107,42 110,50 108,58 C105,69 100,77 93,81', SW, OUT);
  s += LW('M93,81 C90,79 89.5,75 91,71 C95,64 97,56 95.5,51', SW, OUT);
  s += L('M100,50 q4,1 6,-1 M99,58 q4,1 6,-1 M97,66 q4,1 6,-1', 1.4, .45);
  // ear — soft flap over the cheek
  s += P('M85,28 C69,22 57,32 60,46 C63,58 74,63 82,57 C86,50 88,38 85,28 Z', B);
  s += F('M81,32 C71,30 64,37 66,46 C68,55 76,58 81,53 C83,47 83,38 81,32 Z', SH, .5);
  s += eye(90, 36, 2.3);
  s += L('M84,49 q3,2 6,1', 1.4, .55);
  s += wMarks([[42, 56], [56, 52], [48, 68], [66, 62]]);
  return s;
}

// Giraffe — long neck, ossicones, angular patches.
function giraffe(p) {
  const B = p.base, D = p.dark, LT = p.light, SH = p.shade;
  let s = shadow(62, 107, 38);
  // far legs
  s += leg(40, 66, 40, 7, SH, p.hoof, 6, -1);
  s += leg(84, 60, 46, 7, SH, p.hoof, 6, 1);
  // tail
  s += P('M30,60 C24,66 22,74 24,82', 'none', 2.4) + P('M24,82 q-3,5 0,8 q4,-2 4,-8 Z', D, 2);
  // body slopes up to the chest
  const bodyD = 'M28,68 C25,56 32,48 44,46 C58,42 74,38 84,38 C92,38 96,45 94,53 C92,62 86,68 76,71 C60,75 42,76 33,73 C29,71 28,70 28,68 Z';
  s += P(bodyD, B);
  // neck — merged fill, exterior edges inked
  s += F('M80,44 C82,32 88,22 95,15 L106,22 C103,31 99,41 96,50 L80,54 Z', B);
  s += LW('M80.5,45 C82,33 88,23 95,16', SW, OUT);
  s += LW('M105,23 C102.5,32 99,41 96,49', SW, OUT);
  // mane
  s += P('M80,45 C82,33 88,23 95,16 L99,19 C93,26 87,35 85,46 Z', D, 2.2);
  // near legs
  s += legN(48, 70, 36, 8.5, B, p.hoof, 6, -1);
  s += legN(78, 64, 42, 8.5, B, p.hoof, 6, 1);
  // patches clipped to body
  const cid = 'stc' + (++_clip);
  s += `<clipPath id="${cid}"><path d="${bodyD}"/></clipPath><g clip-path="url(#${cid})">`
    + [[38, 54], [54, 50], [70, 46], [46, 66], [62, 62], [78, 58], [34, 70]].map(([x, y]) => F(`M${x - 5},${y} L${x - 2},${y - 5} L${x + 4},${y - 4} L${x + 6},${y + 2} L${x + 2},${y + 6} L${x - 4},${y + 4} Z`, D, .8)).join('') + '</g>';
  // neck patches
  s += [[89, 33], [95, 24], [87, 43]].map(([x, y]) => EF(x, y, 2.8, 3.4, D, .75)).join('');
  // head
  const hx = 100, hy = 16;
  s += L(`M${hx - 3},${hy - 7} l-1,-4 M${hx + 3},${hy - 8} l1,-4`, 2.6, 1);
  s += C(hx - 4.2, hy - 12.4, 2.2, D, 1.6) + C(hx + 4.4, hy - 13.4, 2.2, D, 1.6);
  s += P(`M${hx - 8},${hy - 2} C${hx - 15},${hy - 7} ${hx - 20},${hy - 4} ${hx - 18},${hy + 1} C${hx - 15},${hy + 4} ${hx - 10},${hy + 3} ${hx - 8},${hy + 1} Z`, B, 2.4);
  s += E(hx, hy, 9.5, 8.5, B);
  s += E(hx + 6, hy + 3, 6, 4.8, LT, 2.4);
  s += nose(hx + 8.5, hy + 1.6, 1.2);
  s += L(`M${hx + 6},${hy + 5.5} q2.5,1 4.5,-.3`, 1.4, .7);
  s += eye(hx - 3, hy - 1, 2.2);
  s += furTicks([[40, 50, 3, -2], [56, 46, 3, -2], [34, 60, -2, 3]]) + wMarks([[48, 60], [66, 56]]);
  return s;
}

// Rhino — heavy grey tank with a two-horned snout.
function rhino(p) {
  const B = p.base, D = p.dark, LT = p.light, SH = p.shade;
  let s = shadow(60, 107, 44);
  s += leg(36, 70, 36, 10, SH, null, 6, 0);
  s += leg(78, 68, 38, 10, SH, null, 6, 0);
  s += P('M24,58 C18,62 15,70 17,78', 'none', 2.6) + P('M17,78 q-3,5 0,7 q4,-2 4,-7 Z', D, 2);
  s += P('M22,66 C20,50 32,40 52,38 C70,36 84,42 89,50 C93,57 92,64 87,70 C81,78 68,82 54,82 C38,82 26,78 23,72 Z', B);
  s += legN(42, 72, 34, 13, B, null, 6, 0);
  s += legN(68, 70, 36, 12, B, null, 6, 0);
  s += [[39, 42], [45, 42], [65.5, 68], [70.5, 68]].map(([x]) => `<path d="M${x - 2.5},106 a2.5,2.3 0 0,1 5,0 Z" fill="${LT}" opacity=".8"/>`).join('');
  // horns (in front of the head base, behind the snout tip)
  s += P('M100,52 C103,42 107,36 112,33 C113,42 109,50 104,55 Z', p.hornC || '#ded2b6', 2.4);
  s += P('M91,49 l3,-9 l4,8 Z', p.hornC || '#ded2b6', 2.4);
  // ear — small rounded leaf
  s += P('M82,45 C78,40 79,34 84,34 C87,36 87,41 86,45 Z', B, 2.4);
  // head — low, snouty
  s += P('M84,46 C94,44 102,50 105,58 C107,64 104,69 97,70 C89,71 82,66 82,58 C82,53 82,48 84,46 Z', B);
  s += eye(92, 55, 2.1);
  s += `<circle cx="102" cy="61" r="1.3" fill="${OUT}"/>`;
  s += L('M96,66 q4,1 7,-1', 1.5, .7);
  // skin folds
  s += L('M50,42 q2,8 0,16 M68,42 q2,8 0,15', 1.5, .3);
  s += wMarks([[44, 58], [60, 54], [52, 70]]);
  return s;
}

// Hippo — round river barrel with a huge friendly muzzle.
function hippo(p) {
  const B = p.base, D = p.dark, LT = p.light, SH = p.shade;
  let s = shadow(60, 106, 44);
  s += leg(38, 76, 28, 10, SH, null, 5, 0);
  s += leg(74, 76, 28, 10, SH, null, 5, 0);
  s += P('M24,62 q-7,4 -6,12 q6,0 9,-7 Z', B, 2.4);
  s += P('M22,72 C20,52 36,42 58,40 C76,38 90,46 93,58 C95,68 90,76 82,80 C70,85 44,86 33,81 C26,78 23,76 22,72 Z', B);
  s += legN(44, 80, 24, 13, B, null, 5, 0);
  s += legN(68, 80, 24, 12, B, null, 5, 0);
  s += [[41, 42], [47, 42], [65.5, 68], [70.5, 68]].map(([x]) => `<path d="M${x - 2.5},104 a2.5,2.3 0 0,1 5,0 Z" fill="${LT}" opacity=".8"/>`).join('');
  // ears
  s += C(81, 41, 3.6, B, 2.4) + C(93, 39, 3.6, B, 2.4);
  // head
  s += E(88, 52, 13, 11, B);
  // muzzle — big rounded box
  s += P('M84,56 C92,52 102,54 105,61 C107,67 103,72 96,73 C88,74 82,70 81,64 C81,60 82,58 84,56 Z', p.muzzleC || B);
  s += `<circle cx="97" cy="59.5" r="1.4" fill="${OUT}"/><circle cx="102.5" cy="61.5" r="1.4" fill="${OUT}"/>`;
  s += eye(85, 47, 2.1);
  s += L('M91,69 q5,1 9,-2', 1.6, .7);
  s += F('M90,70.5 l0,3.2 3,0 0,-3 Z', '#f2ead8') + L('M90,70.5 l0,3.2 3,0 0,-3', 1.2, .75);
  s += wMarks([[44, 60], [58, 54], [50, 72]]);
  return s;
}

// Kangaroo — upright, big haunch and feet, propped tail.
function kangaroo(p) {
  const B = p.base, D = p.dark, LT = p.light, SH = p.shade;
  let s = shadow(56, 104, 40);
  // tail — thick, rests on the ground behind
  s += P('M46,84 C36,92 20,94 9,88 C9,81 19,76 31,77 L46,74 Z', B, 2.8);
  // body — leaning forward, big haunch
  s += P('M36,78 C30,62 36,44 50,36 C58,31 68,32 73,39 C78,46 77,57 72,67 C68,80 60,90 47,91 C40,91 37,85 36,78 Z', B);
  // belly
  s += E(57, 64, 10, 14, LT, 2.4);
  // haunch crease
  s += L('M50,88 C41,88 34,80 34,69 C34,61 39,55 45,55', 2.2, .45);
  // long near foot
  s += P('M33,98 Q30,92 37,91 L61,91 Q67,91 67,94.5 Q67,98 60,98 L37,98 Q34,98 33,98 Z', B, 2.6);
  s += L('M56,91 l0,7', 1.3, .4);
  // arms
  s += P('M58,56 C64,58 66,63 64,68', 'none', 2.8) + L('M64,68 l3.4,1.6', 2.4, 1);
  s += P('M65,54 C71,56 73,61 71,66', 'none', 2.8) + L('M71,66 l3.4,1.6', 2.4, 1);
  // head
  const hx = 71, hy = 27;
  s += P(`M${hx - 8},${hy - 8} C${hx - 12},${hy - 20} ${hx - 8},${hy - 26} ${hx - 4},${hy - 21} C${hx - 2},${hy - 16} ${hx - 3},${hy - 10} ${hx - 4},${hy - 7} Z`, B) + F(`M${hx - 7.4},${hy - 10} C${hx - 9.6},${hy - 18} ${hx - 7},${hy - 22} ${hx - 5.4},${hy - 18} C${hx - 4.6},${hy - 14} ${hx - 5.2},${hy - 10} ${hx - 5.6},${hy - 9} Z`, '#e3b7a6', .9);
  s += P(`M${hx + 3},${hy - 9} C${hx + 3},${hy - 21} ${hx + 8},${hy - 27} ${hx + 11},${hy - 21} C${hx + 12},${hy - 15} ${hx + 9},${hy - 9} ${hx + 6},${hy - 7} Z`, B);
  s += E(hx, hy, 10.5, 9, B);
  s += E(hx + 7, hy + 3.5, 6.2, 4.8, LT, 2.4);
  s += nose(hx + 10.5, hy + 2, 1.5);
  s += L(`M${hx + 7},${hy + 6} q2.5,1 4.6,-.3`, 1.4, .7);
  s += eye(hx - 2, hy - 1, 2.2);
  s += furTicks([[42, 52, -3, 1], [40, 64, -3, 1], [70, 48, 3, 1]]) + wMarks([[50, 60], [62, 76]]);
  return s;
}

// Primate — round-faced monkey sitting with long arms.
function primate(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 104, 32);
  // tail curled
  s += P('M80,84 C96,80 102,66 94,54 C90,58 92,68 84,76 Z', B, 2.6);
  // body
  s += P('M38,82 C33,68 38,54 54,48 C70,43 83,52 85,66 C87,79 77,91 60,93 C48,94 41,90 38,82 Z', B);
  // belly
  s += E(61, 72, 11, 12, LT, 2.4);
  // folded legs — feet forward
  s += E(47, 92, 8, 4.5, B, 2.6) + L('M43,92 v2.6 M47,92 v2.6 M51,92 v2.6', 1.3, .5);
  s += E(72, 92, 7.5, 4.2, B, 2.6) + L('M69,92 v2.6 M73,92 v2.6', 1.3, .5);
  // long arms, hands to the ground
  s += P('M44,58 C37,66 34,78 36,88 C37,92 42,93 44,90 C43,82 45,72 50,64 Z', B, 2.6);
  s += P('M76,58 C82,66 85,78 83,88 C82,92 77,93 75,90 C76,82 74,72 70,64 Z', B, 2.6);
  // head
  const hx = 61, hy = 31;
  s += C(hx - 13.5, hy - 1, 4.6, B, 2.4) + C(hx + 13.5, hy - 1, 4.6, B, 2.4);
  s += `<circle cx="${hx - 13.5}" cy="${hy - 1}" r="2" fill="${LT}" opacity=".7"/><circle cx="${hx + 13.5}" cy="${hy - 1}" r="2" fill="${LT}" opacity=".7"/>`;
  s += C(hx, hy, 13.5, B);
  // face plate
  s += E(hx, hy + 2.5, 9.5, 8.5, LT, 2.4);
  s += F(`M${hx - 8},${hy - 2} C${hx - 5},${hy - 5.5} ${hx - 1.5},${hy - 5.5} ${hx},${hy - 3} C${hx + 1.5},${hy - 5.5} ${hx + 5},${hy - 5.5} ${hx + 8},${hy - 2} L${hx + 8},${hy - 1} C${hx + 4},${hy - 3} ${hx - 4},${hy - 3} ${hx - 8},${hy - 1} Z`, B, .9);
  s += eye(hx - 4, hy, 2.2) + eye(hx + 4, hy, 2.2);
  s += `<circle cx="${hx - 1.4}" cy="${hy + 4.6}" r=".9" fill="${OUT}"/><circle cx="${hx + 1.4}" cy="${hy + 4.6}" r=".9" fill="${OUT}"/>`;
  s += L(`M${hx - 3},${hy + 7.6} q3,2 6,0`, 1.6, .85);
  s += L(`M${hx - 4},${hy - 13.5} q1,-4 4,-5 M${hx + 1},${hy - 13.8} q2.4,-3 5.4,-3`, 1.6, .7);
  s += furTicks([[44, 60, -3, 1], [78, 60, 3, 1]]) + wMarks([[50, 78], [70, 80]]);
  return s;
}

// Penguin — upright tuxedo bird.
function penguin(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 105, 26);
  s += P('M40,60 C38,34 48,20 60,20 C72,20 82,34 80,60 C79,80 72,92 60,92 C48,92 41,80 40,60 Z', B);
  // flippers
  s += P('M40,48 C33,56 33,72 39,82 C44,76 45,58 44,50 Z', D, 2.6);
  s += P('M80,48 C87,56 87,72 81,82 C76,76 75,58 76,50 Z', D, 2.6);
  // belly
  s += E(60, 64, 13, 19, LT, 2.4);
  // face
  s += EF(53, 32, 5, 4.2, LT, .9) + EF(67, 32, 5, 4.2, LT, .9);
  s += eye(53, 31, 2.3) + eye(67, 31, 2.3);
  s += P('M55,37 L65,37 L60,44 Z', p.beakC || '#e8a94f', 2.2);
  // feet
  s += L('M52,92 l-1,4 M66,92 l1,4', 2.4, 1);
  s += P('M44,96 l8,-2 l2,5 Z M60,96 l8,-2 l2,5 Z', p.beakC || '#e8a94f', 2);
  return s;
}

// Dolphin — sleek smiling marine arc.
function dolphin(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 104, 42);
  // fluke
  s += P('M22,62 C14,56 6,56 2,60 C6,51 13,49 18,51 C16,45 20,39 26,40 C28,48 27,56 25,60 Z', B, 2.8);
  // body
  const bodyD = 'M20,58 C28,42 50,34 70,36 C86,38 98,46 102,54 C99,64 88,71 72,73 C50,76 28,70 20,58 Z';
  s += P(bodyD, B);
  // dorsal fin — tucked into the back
  s += P('M54,39 C56,27 63,21 70,22 C69,31 64,37 59,41 Z', B, 2.8);
  const cid = 'stc' + (++_clip);
  s += `<clipPath id="${cid}"><path d="${bodyD}"/></clipPath><g clip-path="url(#${cid})">` + F('M24,62 C44,74 78,76 100,58 C96,70 80,78 60,78 C42,78 30,72 24,62 Z', LT, .95) + '</g>';
  // beak — merged fill, exterior edges inked
  s += F('M97,50 C106,49 112,52 113,56 C112,59 106,60 98,58 L95,54 Z', B);
  s += LW('M100,50 C107,49.5 112,52 113,56 C112,59 106,60 100,58.5', SW, OUT);
  s += L('M99,55.5 q7,1 12,-.5', 1.8, .85);
  // flipper
  s += P('M58,62 C62,72 60,79 52,81 C48,75 50,66 54,61 Z', B, 2.6);
  s += eye(88, 48, 2.6);
  return s;
}

// Flamingo — pink S-neck wader on one leg.
function flamingo(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(56, 107, 24);
  // body
  s += P('M32,64 C30,52 40,44 54,44 C66,44 74,50 74,60 C74,70 64,77 50,77 C40,77 34,72 32,64 Z', B);
  // tail fluff
  s += P('M35,68 C29,66 23,68 21,72 C25,76 33,75 37,72 Z', D, 2.4);
  // wing — folded, tucked low
  s += P('M43,58 C51,53 61,55 62,62 C62,69 54,73 47,71 C41,69 40,63 43,58 Z', D, 2.4) + L('M47,61 q6,-1 10,2 M46,66 q6,0 10,2', 1.3, .5);
  // neck — S curve up
  s += P('M62,50 C58,38 62,26 72,20 C80,16 88,20 88,27 C88,33 82,36 78,40 C73,44 71,48 71,52 Z', B, 2.8);
  s += C(82, 24, 8, B);
  // beak — deep keel, bent down, black tip
  s += P('M88,26 C94,26 98,30 98,35 C96,38 92,38 90,35 C89,32 88,29 88,26 Z', p.beakC || '#ece2d0', 2.4);
  s += F('M96.5,31 C97.6,33 97.6,35 96.6,36.6 C94.6,36.8 93.2,35.6 92.8,33.6 Z', OUT);
  s += eye(83, 22, 2);
  // legs — one straight, one tucked
  s += L('M50,77 L48,103', 2.4, 1) + L('M44,104 h10', 2.2, 1);
  s += L('M58,76 C62,84 62,90 57,93', 2.4, 1);
  return s;
}

// Swan — white curves, orange bill with a black knob.
function swan(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 104, 32);
  // tail tip
  s += P('M32,66 L22,58 L26,68 L20,66 L28,74 Z', B, 2.6);
  // body
  s += P('M28,70 C26,56 38,48 54,48 L68,54 C80,56 88,62 86,72 C83,82 70,88 54,88 C40,88 31,82 28,70 Z', B);
  // folded wing, scalloped feathers
  s += P('M42,58 C52,50 68,52 70,62 C71,72 60,78 50,76 C42,74 38,66 42,58 Z', LT, 2.4);
  s += L('M50,62 q6,4 13,2 M46,68 q5,4 11,3 M46,74 q6,3 12,2', 1.4, .45);
  // neck
  s += P('M60,54 C58,42 60,30 70,24 C78,20 85,24 85,31 C85,37 79,39 75,43 C71,47 70,51 70,55 Z', B, 2.8);
  s += C(79, 28, 8, B);
  // beak + knob
  s += P('M86,28 C92,27 97,29 97,32 C97,35 92,36 86,33 Z', p.beakC || '#e0873c', 2.2);
  s += F('M85,25.5 C87,26 88,28 87.5,30.5 L85,32 C84,30 84,27.5 85,25.5 Z', OUT);
  s += eye(81, 26.5, 2);
  // feet
  s += L('M50,88 l-2,8 M62,88 l0,8', 2.4, 1) + P('M42,96 l8,-2 l2,5 Z M58,96 l8,-2 l2,5 Z', '#54463c', 2);
  return s;
}

// Parrot — perched, hooked beak, long tail.
function parrot(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 107, 30);
  // long tail
  s += P('M46,74 C40,84 36,94 35,104 L44,101 C46,91 50,82 54,76 Z', p.tailC || '#c05a48', 2.6);
  // body
  s += P('M40,58 C38,38 48,26 61,26 C74,26 82,38 80,56 C78,72 71,82 58,82 C48,82 42,72 40,58 Z', B);
  // wing — folded, leaving breast visible
  s += P('M50,50 C58,46 66,50 68,58 C69,66 63,72 56,71 C50,70 47,58 50,50 Z', p.wingC || D, 2.6);
  s += L('M55,55 q7,-2 11,2 M54,62 q7,-1 11,2', 1.4, .5);
  // face + hooked beak
  s += EF(69, 36, 6, 5.5, p.cheek || '#ece6d4', .95);
  s += eye(69, 36, 2.3);
  s += P('M76,34 C84,32 88,36 87,42 C84,46 79,44 76,40 Z', p.beakC || '#b4a894', 2.4);
  s += L('M83,42 q2,2 0,4', 2, .9);
  // legs, branch, gripping toes
  s += L('M54,82 l-2,10 M64,80 l0,11', 2.4, 1);
  s += P('M26,94 L94,94 Q98,94 98,97.5 Q98,101 94,101 L26,101 Q22,101 22,97.5 Q22,94 26,94 Z', '#8a5c3c', 2.6);
  s += L('M32,97 h10 M76,97 h12', 1.3, .3);
  s += L('M50,92 q3,4 7,2 M62,91 q3,4 7,2', 2.2, 1);
  return s;
}

// Hedgehog — spiky mantle over a soft pointed face.
function hedgehog(p) {
  const B = p.base, D = p.dark, LT = p.light, SPK = p.spikeC || D;
  let s = shadow(60, 103, 36);
  // body + face
  s += P('M30,90 C24,86 24,80 30,76 L80,66 C92,61 100,66 105,74 C107,79 103,82 97,84 C80,89 46,94 30,90 Z', B);
  // feet
  s += E(46, 96.5, 4.4, 2.8, B, 2.2) + E(72, 95, 4.4, 2.8, B, 2.2);
  // spiky mantle
  const cx = 54, cy = 80, ro = 37, ri = 28, n = 9, a0 = Math.PI * 1.02, a1 = -0.08;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const av = a0 + (a1 - a0) * i / n;
    d += (i ? 'L' : 'M') + (cx + Math.cos(av) * ri).toFixed(1) + ',' + (cy - Math.sin(av) * ri * 0.92).toFixed(1) + ' ';
    if (i < n) { const am = a0 + (a1 - a0) * (i + 0.5) / n; d += `L${(cx + Math.cos(am) * ro).toFixed(1)},${(cy - Math.sin(am) * ro * 0.92).toFixed(1)} `; }
  }
  s += P(d + 'Z', SPK);
  // inner spike texture
  s += LW('M40,64 l-5,-7 M52,58 l-2,-8 M64,58 l2,-8 M74,64 l5,-7', 1.6, LT, .4);
  // face
  s += eye(91, 72, 2.2);
  s += nose(104.5, 74.5, 1.7);
  s += L('M99,79 q-3,2 -6,1', 1.4, .6);
  s += EF(93, 78, 3.2, 2.4, '#e0917a', .45);
  s += L('M96,74 l5,-1.4 M96,77 l5,.6', 1.1, .45);
  return s;
}

// Boar — bristly wedge with a snout and little tusk.
function boar(p) {
  const B = p.base, D = p.dark, LT = p.light, SH = p.shade;
  let s = shadow(60, 106, 40);
  s += leg(38, 68, 36, 7, SH, p.hoof, 6, -1);
  s += leg(80, 66, 38, 7, SH, p.hoof, 6, 1);
  // curly tail
  s += P('M28,54 C21,52 16,55 17,61 C21,63 26,60 27,57', 'none', 2.4);
  // body — high shoulders
  const bodyD = 'M26,64 C24,50 34,42 50,40 C66,36 80,38 88,46 C93,52 93,60 89,66 C85,74 72,78 58,78 C42,79 30,76 27,70 Z';
  s += P(bodyD, B);
  // bristle ridge
  s += P('M36,45 l4,-6 4,5 5,-6 4,5 5,-6 4,5 5,-6 4,5', 'none', 2.2);
  s += legN(44, 68, 36, 8.5, B, p.hoof, 6, -1);
  s += legN(74, 66, 38, 8.5, B, p.hoof, 6, 1);
  // head
  s += P('M84,38 C82,32 85,27 90,28 C93,30 93,36 91,40 Z', B, 2.4); // ear
  s += E(92, 50, 12, 10.5, B);
  s += E(103, 55, 6, 4.8, p.snoutC || '#c9a084', 2.4);
  s += `<circle cx="102" cy="54.5" r="1" fill="${OUT}"/><circle cx="105.5" cy="55.5" r="1" fill="${OUT}"/>`;
  // tusk
  s += P('M96,59 C97,63 100,65 103,64 C103,61 101,58 98,57 Z', '#f2ead8', 1.8);
  s += eye(89, 46, 2.2);
  s += L('M95,62 q-3,1.4 -6,.6', 1.4, .6);
  s += furTicks([[42, 44, 3, -2], [56, 40, 3, -1.5], [70, 41, 3, -1], [32, 56, -2, 2]]);
  s += wMarks([[46, 60], [62, 58], [38, 66]]);
  return s;
}

// Bison — huge shaggy hump, low dark head.
function bison(p) {
  const B = p.base, D = p.dark, LT = p.light, SH = p.shade;
  let s = shadow(60, 107, 42);
  s += leg(38, 68, 38, 8, SH, p.hoof, 6, -1);
  s += leg(82, 66, 40, 8, SH, p.hoof, 6, 1);
  s += P('M26,56 C20,60 18,68 20,76', 'none', 2.4) + P('M20,76 q-3,5 0,8 q4,-2 4,-8 Z', D, 2);
  // body — massive front hump
  const bodyD = 'M24,64 C22,54 27,47 36,45 C40,30 58,24 72,30 C82,34 88,42 90,50 C92,58 90,64 86,69 C80,77 64,81 50,81 C36,81 27,77 24,70 Z';
  s += P(bodyD, B);
  // shaggy cape over the front
  const cid = 'stc' + (++_clip);
  s += `<clipPath id="${cid}"><path d="${bodyD}"/></clipPath><g clip-path="url(#${cid})">`
    + F('M54,24 L94,24 L94,84 L62,84 L65,77 L59,72 L64,66 L58,60 L63,54 L57,47 L62,41 L56,34 Z', D, .45) + '</g>';
  s += legN(46, 70, 36, 10, B, p.hoof, 6, -1);
  s += legN(74, 68, 38, 9.5, B, p.hoof, 6, 1);
  // horns
  s += P('M84,48 C81,42 83,36 88,35 C90,39 89,45 87,49 Z', p.hornC || '#d8c49c', 2.2);
  s += P('M97,46 C96,40 99,34 104,34 C105,39 103,44 100,48 Z', p.hornC || '#d8c49c', 2.2);
  // ear
  s += P('M81,50 C77,47 75,43 78,41 C81,41 83,45 84,49 Z', D, 2.2);
  // head — low, dark
  s += E(92, 56, 12, 11, D);
  // beard — shaggy tuft under the chin
  s += P('M88,65 C86,71 87,78 91,82 C94,78 95,71 94,66 Z', D, 2.2) + L('M91,70 l0,7', 1.2, .4);
  s += E(99, 61, 6, 4.6, B, 2.4);
  s += nose(101.5, 60, 1.5);
  s += eye(89, 52, 2.2);
  s += furTicks([[44, 32, 2, -3], [56, 26, 3, -2], [68, 28, 3, -1], [36, 46, -2, 2], [80, 38, 3, -1], [30, 60, -2, 2]]);
  s += wMarks([[44, 60], [60, 66], [34, 70]]);
  return s;
}

/* ================= MORE AQUATICS ================= */

// Lobster — armored, big claws forward, curled tail.
function lobster(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(62, 104, 40);
  // antennae
  s += L('M86,42 C96,32 102,22 103,12', 2, .9) + L('M91,44 C102,38 110,30 114,22', 2, .9);
  // tail segments curling left
  s += P('M44,54 C34,52 26,56 24,62 C28,68 38,70 46,66 Z', B, 2.6);
  s += P('M28,60 C20,60 13,64 12,70 C16,75 26,75 32,70 Z', B, 2.6);
  // tail fan
  s += P('M16,68 C9,66 3,68 2,73 C6,78 14,77 18,73 Z M18,72 C12,74 9,79 10,84 C16,85 21,80 21,74 Z', B, 2.4);
  // walking legs
  s += L('M54,70 l-6,12 M62,72 l-2,12 M72,72 l2,12', 2.4, .9);
  // carapace
  s += P('M42,56 C44,42 56,34 70,36 C84,38 92,48 90,58 C88,68 78,74 64,74 C52,74 44,68 42,56 Z', B);
  s += L('M54,42 q-3,8 -1,17 M64,38 q-3,10 -1,21', 1.4, .35);
  // claws — forward
  s += P('M84,44 C87,35 95,30 103,33 C107,37 105,45 99,48 C94,50 87,49 84,44 Z', B, 2.6) + L('M102,34 l-5,7', 2, .85) + P('M101,31 l4,-5', 'none', 2.4);
  s += P('M87,58 C92,52 100,51 105,56 C106,61 102,66 96,66 C91,66 88,63 87,58 Z', B, 2.6) + L('M104,57 l-6,4', 2, .85);
  // face
  s += eye(78, 44, 2.3);
  s += L('M84,52 q-3,2 -6,2', 1.5, .75);
  return s;
}

// Shrimp — curled comma with a fan tail.
function shrimp(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 102, 34);
  // antennae
  s += L('M84,42 C96,44 104,52 107,62', 1.8, .85) + L('M86,38 C100,36 110,42 114,52', 1.8, .85);
  // tail fan
  s += P('M56,84 C50,88 47,94 49,100 C56,100 61,95 62,89 Z M60,84 C62,92 68,96 75,95 C75,89 70,84 64,82 Z', B, 2.4);
  // abdomen — plump comma curling down-left
  s += P('M64,44 C46,46 34,57 34,70 C34,83 45,92 58,91 C62,88 62,84 59,82 C50,79 45,74 46,67 C48,58 57,53 67,54 Z', B);
  // segment arcs
  s += L('M52,53 q-6,5 -7,13 M44,62 q-4,6 -2,14', 1.5, .5);
  // little legs
  s += L('M66,56 l-2,9 M72,57 l-1,9 M78,56 l1,9', 2, .85);
  // carapace + head
  s += E(74, 46, 15, 12.5, B);
  s += P('M85,39 L94,34 L88,44 Z', B, 2.4);
  s += LW('M66,37 q-4,9 -1,18 M74,34 q-3,10 0,20', 2.6, LT, .55);
  s += eye(81, 42, 2.6);
  s += L('M85,51 q-3,3 -7,3', 1.6, .8);
  return s;
}

// Pufferfish — round, spiky, pursed lips.
function pufferfish(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 102, 32);
  // spikes
  let spk = '';
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6 + 0.26;
    if (Math.cos(a) > 0.9) continue;
    const x1 = 60 + Math.cos(a) * 24, y1 = 56 + Math.sin(a) * 24, x2 = 60 + Math.cos(a) * 33, y2 = 56 + Math.sin(a) * 33;
    spk += `M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)} `;
  }
  s += LW(spk, 3.2, OUT) + LW(spk, 1.1, B);
  // tail fin
  s += P('M38,58 C30,52 24,52 20,56 C24,62 31,64 38,64 Z', p.finC || D, 2.4);
  // body
  s += C(60, 56, 25, B);
  s += `<path d="M38,64 C46,74 74,74 82,62 C78,76 66,82 54,80 C44,78 38,72 38,64 Z" fill="${LT}" opacity=".95"/>`;
  // spots
  s += [[50, 42], [64, 38], [74, 50], [45, 54]].map(([x, y]) => EF(x, y, 2.6, 2.2, D, .45)).join('');
  // pectoral fin
  s += P('M60,58 C66,56 72,58 72,63 C70,68 62,68 59,64 Z', p.finC || D, 2.4);
  // face — pursed lips
  s += eye(75, 48, 2.8);
  s += E(84.5, 57, 3, 2.7, '#e0a894', 2);
  return s;
}

// Eel — sinuous ribbon with a dorsal fin.
function eel(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(60, 102, 40);
  const spine = 'M12,84 C22,92 36,92 44,82 C52,72 60,66 72,66 C84,66 92,60 95,50';
  // pointed tail fin
  s += P('M15,87 C10,92 4,93 1,90 C3,84 8,81 14,80 Z', D, 2.4);
  // dorsal ridge peeking above the back
  const ridge = 'M12,78 C22,86 36,86 44,76 C52,66 60,60 72,60 C84,60 90,54 93,45';
  s += P(ridge, 'none', 8) + LW(ridge, 4.6, D);
  // body
  s += P(spine, 'none', 12) + LW(spine, 8.6, B);
  // belly glint
  s += LW('M20,88 C30,92 38,90 44,84 M60,72 C66,69 72,68 78,68', 1.8, LT, .5);
  // head
  s += E(94, 46, 10.5, 8, B);
  // pectoral fin
  s += P('M86,52 C82,58 82,62 86,65 C90,62 91,56 90,52 Z', D, 2.2);
  s += eye(96, 43, 2.3);
  s += L('M101,49 q-3,3 -8,3', 1.7, .85);
  return s;
}

// Manatee — plump gentle sea cow with a whiskery muzzle.
function manatee(p) {
  const B = p.base, D = p.dark, LT = p.light;
  let s = shadow(58, 106, 42);
  // round paddle fluke
  s += P('M24,74 C14,70 6,74 4,82 C8,90 20,90 26,84 Z', B, 2.8);
  // body
  s += P('M20,80 C18,62 34,48 58,44 C80,40 98,50 100,66 C102,82 88,96 62,98 C40,100 24,94 20,80 Z', B);
  // flipper
  s += P('M56,80 C62,88 60,96 52,100 C46,96 46,86 50,80 Z', B, 2.6) + L('M52,90 l4,5 M55,87 l4,5', 1.3, .5);
  // head
  s += E(86, 58, 13, 12, B);
  // muzzle pad
  s += E(94, 66, 8, 6.2, LT, 2.4);
  s += `<circle cx="92.5" cy="63" r="1.2" fill="${OUT}"/><circle cx="97" cy="63.5" r="1.2" fill="${OUT}"/>`;
  s += `<circle cx="90" cy="68" r=".7" fill="${OUT}" opacity=".5"/><circle cx="94" cy="69.5" r=".7" fill="${OUT}" opacity=".5"/><circle cx="98" cy="68.5" r=".7" fill="${OUT}" opacity=".5"/>`;
  s += eye(81, 53, 2.1);
  s += L('M89,72 q3,1.4 6,0', 1.4, .7);
  s += wMarks([[44, 66], [58, 60], [70, 68], [36, 78]]);
  return s;
}

/* ================= RIG REGISTRY (batch 1) ================= */
export const RIGS = {
  deer: (o) => ungulate({ base: '#b9805a', dark: '#8a5a3c', light: '#e8d4bc', shade: '#9a684a', hoof: '#6b4a34', antler: o?.antler ?? 'deer', pattern: o?.pattern ?? 'spots', ...o }),
  moose: (o) => ungulate({ base: '#7a5238', dark: '#5d3d28', light: '#c9a97e', shade: '#63432c', hoof: '#4a3020', antler: 'moose', ...o }),
  horse: (o) => ungulate({ base: '#a06a44', dark: '#6b4a34', light: '#e8d9c4', shade: '#84563a', hoof: '#54402e', tail: 'horse', pattern: 'patches', forelock: true, ...o }),
  cow: (o) => ungulate({ base: '#b9825e', dark: '#84563a', light: '#f2e9d8', shade: '#9a6a4c', hoof: '#5d4534', horn: 'cow', pattern: 'patches', neck: 'short', ...o }),
  goat: (o) => ungulate({ base: '#c98d54', dark: '#94643c', light: '#e8d4bc', shade: '#a8744a', hoof: '#5d4534', horn: o?.horn ?? 'goat', ...o }),
  camel: (o) => ungulate({ base: '#b9825a', dark: '#8a5c3c', light: '#dcc09c', shade: '#9a6a48', hoof: '#6b4a34', hump: 2, ...o }),
  sheep: (o) => ungulate({ base: '#ddd0b4', dark: '#8a7a5c', light: '#f2ead8', shade: '#bcae92', hoof: '#4a3a2c', wool: true, neck: 'short', headC: '#54443a', muzzleC: '#8a7868', ...o }),
  llama: (o) => ungulate({ base: '#e8dcc4', dark: '#b4a184', light: '#f4ecd8', shade: '#c9bA9c', hoof: '#6b5a44', wool: true, neck: 'long', ...o }),
  fox: (o) => carnivore({ base: '#c9763e', dark: '#8a4c26', light: '#f2e9d8', shade: '#a85e30', earKind: 'pointy', tailKind: 'bushy', chest: true, ...o }),
  bigcat: (o) => carnivore({ base: '#d0a054', dark: '#9a6c34', light: '#ecd9b4', shade: '#b48644', earKind: 'round', tailKind: 'cat', pattern: o?.pattern ?? 'spots', ...o }),
  raccoon: (o) => carnivore({ base: '#a89684', dark: '#544438', light: '#e0d4c4', shade: '#8a7864', earKind: 'pointy', tailKind: 'ringed', mask: true, ...o }),
  bear: (o) => bear({ base: '#9a6b48', light: '#d8bc98', shade: '#7d5538', ...o }),
  rodent: (o) => critter({ base: '#b09a80', dark: '#7d6a54', light: '#e8dcC8', earKind: 'round', tailKind: 'thin', belly: true, ...o }),
  rabbit: (o) => critter({ base: '#c4ab8c', dark: '#8a7458', light: '#eee2cc', earKind: 'tall', tailKind: 'puff', belly: true, ...o }),
  squirrel: (o) => critter({ base: '#b97a4c', dark: '#84532e', light: '#ecd9bc', earKind: 'small', tailKind: 'squirrel', belly: true, ...o }),
  beaver: (o) => critter({ base: '#9a6b44', dark: '#5d4028', light: '#d8bc98', earKind: 'small', tailKind: 'beaver', belly: true, teeth: true, ...o }),
  songbird: (o) => songbird({ base: '#8aa0be', dark: '#5a708e', light: '#e8e0cc', beakC: '#e8a94f', ...o }),
  owl: (o) => owl({ base: '#a8845c', dark: '#7d5e40', light: '#e8d8bc', tufts: true, ...o }),
  raptor: (o) => raptor({ base: '#8a6244', dark: '#5d422e', light: '#d8c4a4', headC: '#f2ead8', ...o }),
  duck: (o) => duck({ base: '#b99a6e', dark: '#8a6e4a', light: '#e8dcc4', headC: o?.headC ?? '#4a7a58', speculum: '#5a8ab8', ...o }),
  heron: (o) => heron({ base: '#9aa8b4', dark: '#66788a', light: '#e4e8e4', crestStripe: true, ...o }),
  hummingbird: (o) => hummingbird({ base: '#5a9a72', dark: '#3d7052', light: '#e0e8d8', throatC: '#c94f6d', ...o }),
  fish: (o) => fish({ base: '#7a9cc0', dark: '#54749a', light: '#dce4e8', ...o }),
  shark: (o) => shark({ base: '#8a9cac', light: '#e0e6e8', ...o }),
  ray: (o) => ray({ base: '#8a94a8', light: '#dce0e4', ...o }),
  whale: (o) => whale({ base: '#6a8aa8', dark: '#4a6a88', light: '#d8e2e8', spout: true, ...o }),
  seal: (o) => seal({ base: '#a8917a', dark: '#7d6a54', light: '#e4d8c4', ...o }),
  walrus: (o) => seal({ base: '#b98a68', dark: '#8a6248', light: '#e0c9ac', tusks: true, sleepy: true, ...o }),
  turtle: (o) => turtle({ base: '#8aa864', dark: '#5d7a44', light: '#d8e0c0', shellC: o?.shellC ?? '#7a9a5c', shellD: o?.shellD ?? '#55703e', ...o }),
  frog: (o) => frog({ base: '#7aa858', dark: '#54804a', light: '#e0e8c8', cheeks: true, ...o }),
  lizard: (o) => lizard({ base: '#94a858', dark: '#6a8040', light: '#dce4bc', ...o }),
  snake: (o) => snake({ base: '#8a9a54', dark: '#5d7040', light: '#dce0b4', bands: true, ...o }),
  croc: (o) => croc({ base: '#7a9160', dark: '#556e44', light: '#ccd8ac', ...o }),
  salamander: (o) => salamander({ base: '#4a4038', dark: '#332c26', light: '#8a7a68', spots: true, spotC: '#e8c33a', ...o }),
  bat: (o) => bat({ base: '#7a6a5c', dark: '#54463c', light: '#c4b4a0', ...o }),
  butterfly: (o) => butterfly({ base: '#d99a4a', dark: '#a06a2e', light: '#f2e0bc', ...o }),
  bee: (o) => bee({ base: '#e0b04f', dark: '#3d2f18', light: '#f2e0b4', ...o }),
  beetle: (o) => beetle({ base: '#c05a48', dark: '#33241c', light: '#e89a88', spots: true, ...o }),
  dragonfly: (o) => dragonfly({ base: '#5a9aa0', dark: '#3d7078', light: '#c4e0e0', ...o }),
  octopus: (o) => octopus({ base: '#c98a74', dark: '#a06450', light: '#ecd4c4', cheeks: true, ...o }),
  jelly: (o) => jelly({ base: '#b4a4d4', dark: '#8a7ab4', light: '#e4dcf2', ...o }),
  crab: (o) => crab({ base: '#c96a50', dark: '#a04c38', light: '#ecc4b0', ...o }),
  seastar: (o) => seastar({ base: '#d89058', dark: '#b47040', light: '#f2dcbc', ...o }),
  urchin: (o) => urchin({ base: '#6a5a80', dark: '#4c4060', light: '#b4a4c8', ...o }),
  nudibranch: (o) => nudibranch({ base: '#e0a0b8', mantle: '#cf6e94', dark: '#a84e74', light: '#f2d4e0', trim: '#f2e8c4', gill: '#a84e74', rhino: '#a84e74', spotC: '#f2e8c4', form: 'dorid', ...o }),
  seahorse: (o) => seahorse({ base: '#d8a860', dark: '#b48440', light: '#f2e0bc', ...o }),
  shell: (o) => snail({ base: '#c9a068', dark: '#a07c48', light: '#ecdcbc', bodyC: '#d8bc94', ...o }),
  coral: (o) => coral({ base: '#d8846a', dark: '#b46450', light: '#f2d0c0', ...o }),
  rodentSm: (o) => critter({ base: '#a89484', dark: '#7a6a58', light: '#e4d8c8', earKind: 'round', tailKind: 'thin', belly: true, ...o }),
  elephant: (o) => elephant({ base: '#a29aa4', dark: '#7b7280', light: '#d2cbd4', shade: '#867e8c', ...o }),
  giraffe: (o) => giraffe({ base: '#e0bc74', dark: '#a8763e', light: '#f2e2ba', shade: '#c49c54', hoof: '#6b5138', ...o }),
  zebra: (o) => ungulate({ base: '#eee9dc', dark: '#453931', light: '#f8f4ea', shade: '#c9c0ae', hoof: '#453931', tail: 'horse', pattern: 'zebra', mane: true, muzzleC: '#8a7767', ...o }),
  rhino: (o) => rhino({ base: '#a89c94', dark: '#7d7168', light: '#d4cabe', shade: '#8d8078', hornC: '#ded2b6', ...o }),
  hippo: (o) => hippo({ base: '#9d8898', dark: '#755f72', light: '#cdb2be', shade: '#7f6a7c', muzzleC: '#ab96a4', ...o }),
  kangaroo: (o) => kangaroo({ base: '#c08a5c', dark: '#8a5c3a', light: '#e8d0ac', shade: '#a4714a', ...o }),
  primate: (o) => primate({ base: '#8a674a', dark: '#5f4531', light: '#dcc09e', shade: '#715339', ...o }),
  penguin: (o) => penguin({ base: '#454a56', dark: '#2f333d', light: '#f2ead8', beakC: '#e8a94f', ...o }),
  dolphin: (o) => dolphin({ base: '#8aa6c0', dark: '#5f7f9c', light: '#dde6ec', ...o }),
  flamingo: (o) => flamingo({ base: '#eb9aa6', dark: '#d0707f', light: '#f7d3d6', beakC: '#ece2d0', ...o }),
  swan: (o) => swan({ base: '#f2ecdc', dark: '#c9bfa8', light: '#faf6ea', beakC: '#e0873c', ...o }),
  parrot: (o) => parrot({ base: '#63a85e', dark: '#3f7a4d', light: '#e6e2ce', beakC: '#b4a894', tailC: '#c05a48', cheek: '#ece6d4', ...o }),
  hedgehog: (o) => hedgehog({ base: '#d9c09c', dark: '#54402e', light: '#efe0c4', spikeC: '#6f5640', ...o }),
  boar: (o) => boar({ base: '#7d5b44', dark: '#573f2e', light: '#c9a97e', shade: '#654834', hoof: '#4a3626', snoutC: '#c99a80', ...o }),
  bison: (o) => bison({ base: '#7d573a', dark: '#5a3d26', light: '#b08a5c', shade: '#66452c', hornC: '#d8c49c', hoof: '#463020', ...o }),
  lobster: (o) => lobster({ base: '#bc4f3a', dark: '#93392a', light: '#eba98e', ...o }),
  shrimp: (o) => shrimp({ base: '#eba088', dark: '#cc7358', light: '#f7d6c4', ...o }),
  pufferfish: (o) => pufferfish({ base: '#cfae66', dark: '#a6853f', light: '#f2e6c0', finC: '#a6853f', ...o }),
  eel: (o) => eel({ base: '#7c9873', dark: '#5a7452', light: '#c7d6b2', ...o }),
  manatee: (o) => manatee({ base: '#9c9088', dark: '#776c64', light: '#cbc0b4', ...o }),
  tree: (o) => tree({ ...o }),
  fern: (o) => fern({ ...o }),
  flower: (o) => flower({ ...o }),
  mushroom: (o) => mushroom({ ...o })
};

export function stickerSVG(rig, opts = {}) {
  const fn = RIGS[rig];
  if (!fn) return null;
  return `<svg viewBox="0 0 120 120" class="sticker" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${fn(opts)}</svg>`;
}
export const hasRig = (rig) => !!RIGS[rig];
