/* Soft painterly cartoon-vector biome backdrops. Every scene is a realistic, physically grounded
   landscape: rounded shapes, gentle gradients, warm skies with a soft sun and fluffy clouds,
   strong atmospheric depth (distant layers fade toward the sky/water colour) and a slightly
   darker foreground detail band. Nothing floats: every rock rests on the ground and every plant
   grows from soil or from a branch attached to a trunk. Placement is intentionally hand-feeling:
   clustered, gapped and size-varied rather than evenly spaced. Detail and life grow with the
   collection. All motion is gentle and respects prefers-reduced-motion (disabled in CSS). */
const W = 1200, H = 600;
const rnd = (a, b) => a + Math.random() * (b - a);
const clampN = (min, max, v) => Math.max(min, Math.min(max, v));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
// irregular, clustered x positions: a random walk with occasional wide gaps, so elements
// bunch together in places and leave breathing room in others (never evenly spaced)
function scatter(n, x0, x1) {
  if (n <= 0) return [];
  if (n === 1) return [rnd(x0 + (x1 - x0) * 0.12, x1 - (x1 - x0) * 0.12)];
  const steps = [0];
  let t = 0;
  for (let i = 1; i < n; i++) { t += Math.random() < 0.28 ? rnd(1.7, 3.2) : rnd(0.3, 1.25); steps.push(t); }
  return steps.map((v) => x0 + (x1 - x0) * (v / t) + rnd(-18, 18));
}

const SVG = (defs, body) => `<svg class="scene-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${body}</svg>`;
const lg = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const fogDef = (id, c) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity="0"/><stop offset="0.45" stop-color="${c}" stop-opacity=".4"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient>`;
const fogRect = (id, y, h) => `<rect x="0" y="${y}" width="${W}" height="${h}" fill="url(#${id})"/>`;
const mirror = (inner) => `<g transform="translate(${W},0) scale(-1,1)">${inner}</g>`;
// gentle rooted sway (class + randomized duration/phase so nothing moves in lockstep)
const rooted = (deg, d0 = 5, d1 = 9) => `class="scene-rooted" style="--deg:${deg}deg;--dur:${rnd(d0, d1).toFixed(1)}s;--delay:${rnd(-8, 0).toFixed(1)}s"`;

// ---- sky ----
function sun(x, y, r, c, beams) {
  let s = `<g class="scene-sun" style="--o1:.65;--o2:.95;--dur:${rnd(6, 10).toFixed(1)}s">`;
  if (beams) {
    for (let i = 0; i < 7; i++) {
      const a = i * (Math.PI * 2 / 7) + 0.4, L = r * rnd(2.1, 2.9), wA = 0.07;
      s += `<path d="M${x} ${y} L${(x + Math.cos(a - wA) * L).toFixed(1)} ${(y + Math.sin(a - wA) * L).toFixed(1)} L${(x + Math.cos(a + wA) * L).toFixed(1)} ${(y + Math.sin(a + wA) * L).toFixed(1)} Z" fill="#ffffff" opacity=".1"/>`;
    }
  }
  s += `<circle cx="${x}" cy="${y}" r="${(r * 2.1).toFixed(0)}" fill="${c}" opacity=".18"/><circle cx="${x}" cy="${y}" r="${(r * 1.45).toFixed(0)}" fill="${c}" opacity=".3"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${(x - r * 0.3).toFixed(0)}" cy="${(y - r * 0.3).toFixed(0)}" r="${(r * 0.4).toFixed(0)}" fill="#ffffff" opacity=".55"/>`;
  return s + '</g>';
}
function cloud(x, y, s) {
  const w1 = rnd(50, 66) * s, p = rnd(-8, 8) * s;
  return `<g class="scene-cloud" style="--amp:${rnd(18, 44).toFixed(0)}px;--dur:${rnd(38, 74).toFixed(0)}s;--delay:${rnd(-40, 0).toFixed(0)}s">`
    + `<ellipse cx="${x}" cy="${y + 8 * s}" rx="${w1.toFixed(0)}" ry="${13 * s}" fill="#dceaf2" opacity=".8"/>`
    + `<ellipse cx="${x - 26 * s + p}" cy="${y + 2 * s}" rx="${(rnd(26, 34) * s).toFixed(0)}" ry="${17 * s}" fill="#fdfdfa"/>`
    + `<ellipse cx="${x + 6 * s + p * 0.5}" cy="${y - 6 * s}" rx="${(rnd(22, 30) * s).toFixed(0)}" ry="${19 * s}" fill="#ffffff"/>`
    + `<ellipse cx="${x + 34 * s + p}" cy="${y + 3 * s}" rx="${(rnd(22, 30) * s).toFixed(0)}" ry="${14 * s}" fill="#fdfdfa"/>`
    + (Math.random() < 0.5 ? `<ellipse cx="${x + 58 * s}" cy="${y + 7 * s}" rx="${16 * s}" ry="${9 * s}" fill="#f4f8f8" opacity=".9"/>` : '')
    + `</g>`;
}
function sparkles(n, y0, y1, c) { let s = '<g>'; for (let i = 0; i < n; i++) s += `<circle cx="${rnd(30, W - 30).toFixed(0)}" cy="${rnd(y0, y1).toFixed(0)}" r="${rnd(1.2, 2.6).toFixed(1)}" fill="${c}" opacity="${rnd(.3, .7).toFixed(2)}"/>`; return s + '</g>'; }

// ---- terrain ----
// smooth rounded mound (dune / hill); centre may sit off-canvas for edge masses
const dome = (x, w, h, baseY, fill, op = 1) => `<path d="M${x - w} ${baseY} C${(x - w * 0.55).toFixed(0)} ${(baseY - h * 1.3).toFixed(0)} ${(x + w * 0.55).toFixed(0)} ${(baseY - h * 1.3).toFixed(0)} ${x + w} ${baseY} L${x + w} ${H} L${x - w} ${H} Z" fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
// like dome but closed flat at its own base line (for shapes drawn over water / sky)
const mound = (x, w, h, baseY, fill, op = 1) => `<path d="M${x - w} ${baseY} C${(x - w * 0.55).toFixed(0)} ${(baseY - h * 1.3).toFixed(0)} ${(x + w * 0.55).toFixed(0)} ${(baseY - h * 1.3).toFixed(0)} ${x + w} ${baseY} Z" fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
// gently undulating full-width ground band — random control points so no two horizons match
function roll(y, amp, fill, op = 1, segs = 5) {
  let d = `M0 ${(y + rnd(-amp, amp)).toFixed(0)}`;
  const step = W / segs;
  for (let i = 0; i < segs; i++) d += ` Q${(step * (i + 0.3 + Math.random() * 0.4)).toFixed(0)} ${(y + rnd(-amp, amp)).toFixed(0)} ${(step * (i + 1)).toFixed(0)} ${(y + rnd(-amp * 0.8, amp * 0.8)).toFixed(0)}`;
  return `<path d="${d} V${H} H0 Z" fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
}
// jagged asymmetric mountain: offset summit, shoulder notches, shaded east flank, ragged snowline
function crag(x, w, h, baseY, c, snowC, op = 1) {
  const skew = rnd(-0.24, 0.24);
  const tx = x + w * skew, top = baseY - h;
  const lsh = [x - w * rnd(0.52, 0.68), baseY - h * rnd(0.3, 0.44)];
  const lmd = [x - w * rnd(0.26, 0.4) + w * skew * 0.4, baseY - h * rnd(0.56, 0.7)];
  const lnk = [tx - w * rnd(0.1, 0.17), top + h * rnd(0.13, 0.22)];
  const rnk = [tx + w * rnd(0.07, 0.13), top + h * rnd(0.09, 0.17)];
  const rsh = [x + w * rnd(0.3, 0.46), baseY - h * rnd(0.42, 0.58)];
  const rlo = [x + w * rnd(0.6, 0.78), baseY - h * rnd(0.18, 0.3)];
  const pt = (p) => `${p[0].toFixed(0)} ${p[1].toFixed(0)}`;
  const d = `M${(x - w).toFixed(0)} ${baseY} L${pt(lsh)} L${pt(lmd)} L${pt(lnk)} L${tx.toFixed(0)} ${top.toFixed(0)} L${pt(rnk)} L${pt(rsh)} L${pt(rlo)} L${(x + w).toFixed(0)} ${baseY} Z`;
  let s = `<g${op < 1 ? ` opacity="${op}"` : ''}><path d="${d}" fill="${c}"/>`;
  s += `<path d="M${tx.toFixed(0)} ${top.toFixed(0)} L${pt(rnk)} L${pt(rsh)} L${pt(rlo)} L${(x + w).toFixed(0)} ${baseY} L${(x + w * 0.2).toFixed(0)} ${baseY} Z" fill="#1c2a38" opacity=".1"/>`;
  // creases running down the flanks give the rock a carved, weathered feel
  s += `<path d="M${tx.toFixed(0)} ${top.toFixed(0)} L${pt(lnk)} L${pt(lmd)}" stroke="#ffffff" stroke-width="2.5" fill="none" opacity=".2"/>`;
  s += `<path d="M${pt(rnk)} L${pt(rsh)}" stroke="#1c2a38" stroke-width="2.5" fill="none" opacity=".14"/>`;
  if (snowC) {
    const sl = top + h * rnd(0.2, 0.3), lx = tx - w * 0.2, rx2 = tx + w * 0.19;
    s += `<path d="M${lx.toFixed(0)} ${(sl + h * 0.02).toFixed(0)} L${pt(lnk)} L${tx.toFixed(0)} ${top.toFixed(0)} L${pt(rnk)} L${rx2.toFixed(0)} ${(sl - h * 0.02).toFixed(0)} L${(rx2 - w * 0.07).toFixed(0)} ${(sl + h * 0.05).toFixed(0)} L${(tx + w * 0.04).toFixed(0)} ${(sl - h * 0.04).toFixed(0)} L${(tx - w * 0.05).toFixed(0)} ${(sl + h * 0.06).toFixed(0)} L${(lx + w * 0.06).toFixed(0)} ${(sl - h * 0.03).toFixed(0)} Z" fill="${snowC}"/>`;
  }
  return s + '</g>';
}
// rounded boulder resting flat on the ground, with a soft top highlight + ground shadow
function boulder(x, gy, s, c1 = '#95897a', c2 = '#b2a693') {
  return `<g><ellipse cx="${x}" cy="${gy}" rx="${(46 * s).toFixed(1)}" ry="${(7 * s).toFixed(1)}" fill="#20301c" opacity=".18"/>`
    + `<path d="M${(x - 42 * s).toFixed(1)} ${gy} Q${(x - 50 * s).toFixed(1)} ${(gy - 32 * s).toFixed(1)} ${(x - 20 * s).toFixed(1)} ${(gy - 47 * s).toFixed(1)} Q${(x + 4 * s).toFixed(1)} ${(gy - 59 * s).toFixed(1)} ${(x + 29 * s).toFixed(1)} ${(gy - 43 * s).toFixed(1)} Q${(x + 49 * s).toFixed(1)} ${(gy - 27 * s).toFixed(1)} ${(x + 43 * s).toFixed(1)} ${gy} Z" fill="${c1}"/>`
    + `<path d="M${(x - 33 * s).toFixed(1)} ${(gy - 20 * s).toFixed(1)} Q${(x - 30 * s).toFixed(1)} ${(gy - 38 * s).toFixed(1)} ${(x - 8 * s).toFixed(1)} ${(gy - 47 * s).toFixed(1)} Q${(x + 10 * s).toFixed(1)} ${(gy - 53 * s).toFixed(1)} ${(x + 22 * s).toFixed(1)} ${(gy - 43 * s).toFixed(1)} Q${(x + 2 * s).toFixed(1)} ${(gy - 44 * s).toFixed(1)} ${(x - 12 * s).toFixed(1)} ${(gy - 34 * s).toFixed(1)} Q${(x - 27 * s).toFixed(1)} ${(gy - 27 * s).toFixed(1)} ${(x - 33 * s).toFixed(1)} ${(gy - 20 * s).toFixed(1)} Z" fill="${c2}"/>`
    + `<path d="M${(x - 12 * s).toFixed(1)} ${(gy - 8 * s).toFixed(1)} q${(10 * s).toFixed(1)} ${(4 * s).toFixed(1)} ${(24 * s).toFixed(1)} ${(2 * s).toFixed(1)}" stroke="${c1}" stroke-width="${(1.6 * s).toFixed(1)}" fill="none" opacity=".55"/></g>`;
}
// an irregular little family of boulders (sizes + spacing vary; never a tidy pair)
function rockCluster(x, gy, s, c1, c2, n = 3) {
  let g = '<g>', cx = x - n * 22 * s;
  for (let i = 0; i < n; i++) { const rs = s * rnd(0.35, 1.1); g += boulder(cx, gy + rnd(-3, 4), rs, c1, c2); cx += rs * rnd(46, 88); }
  return g + '</g>';
}
function pebbles(n, x0, x1, y0, y1, c, op = 0.75) {
  let s = '<g>';
  for (let i = 0; i < n; i++) s += `<ellipse cx="${rnd(x0, x1).toFixed(0)}" cy="${rnd(y0, y1).toFixed(0)}" rx="${rnd(3.5, 10).toFixed(1)}" ry="${rnd(2, 5.5).toFixed(1)}" fill="${c}" opacity="${(op * rnd(0.7, 1)).toFixed(2)}"/>`;
  return s + '</g>';
}

// ---- vegetation (all rooted in the ground) ----
function tree(x, gy, s, lean) {
  const ln = lean !== undefined ? lean : rnd(-3.5, 3.5);
  const tw = 13 * s, th = (66 + rnd(0, 26)) * s, cy = gy - th;
  const pal = pick([
    ['#34603a', '#3f6f40', '#4c8049', '#5d9456', '#6fa863'],
    ['#3a6a36', '#487c40', '#57904c', '#68a45a', '#7cb468'],
    ['#2f5c38', '#3c6f42', '#4a824c', '#5b9858', '#6fac66']]);
  const blob = (dx, dy, rx, ry, f) => `<ellipse cx="${(x + dx * s).toFixed(1)}" cy="${(cy + dy * s).toFixed(1)}" rx="${(rx * s).toFixed(1)}" ry="${(ry * s).toFixed(1)}" fill="${f}"/>`;
  let cn = blob(rnd(-4, 6), -6, 46 + rnd(0, 12), 40 + rnd(0, 8), pal[0]);
  cn += blob(-24 + rnd(-7, 7), rnd(0, 9), 33 + rnd(0, 9), 29 + rnd(0, 6), pal[1]);
  cn += blob(24 + rnd(-7, 7), rnd(3, 12), 29 + rnd(0, 8), 27 + rnd(0, 6), pal[2]);
  cn += blob(rnd(-7, 7), -22 + rnd(-7, 4), 31 + rnd(0, 6), 27, pal[3]);
  cn += blob(rnd(-17, -3), rnd(-13, -3), 20, 18, pal[4]);
  return `<g><ellipse cx="${x}" cy="${gy}" rx="${(42 * s).toFixed(0)}" ry="${(7 * s).toFixed(1)}" fill="#20351c" opacity=".2"/>`
    + `<g transform="rotate(${ln.toFixed(1)} ${x} ${gy})"><g ${rooted(rnd(0.9, 1.7).toFixed(1), 6, 11)}>`
    + `<path d="M${(x - tw / 2).toFixed(1)} ${gy} L${(x - tw * 0.36).toFixed(1)} ${(cy + 20 * s).toFixed(1)} L${(x + tw * 0.36).toFixed(1)} ${(cy + 20 * s).toFixed(1)} L${(x + tw / 2).toFixed(1)} ${gy} Q${x} ${(gy + 4 * s).toFixed(1)} ${(x - tw / 2).toFixed(1)} ${gy} Z" fill="#5b4029"/>`
    + `<path d="M${(x - tw * 0.06).toFixed(1)} ${gy} L${x} ${(cy + 24 * s).toFixed(1)} L${(x + tw * 0.24).toFixed(1)} ${(cy + 24 * s).toFixed(1)} L${(x + tw * 0.34).toFixed(1)} ${gy} Z" fill="#75603f" opacity=".55"/>`
    + cn + `</g></g></g>`;
}
function pine(x, gy, s, cA = '#3a5f44', cB = '#4a7350', cC = '#5c8a5e') {
  const ln = rnd(-2.5, 2.5), hs = rnd(0.85, 1.2);
  const t = (w, y0, h, f) => `<path d="M${(x - w * s).toFixed(1)} ${(gy - y0 * hs * s).toFixed(1)} Q${x} ${(gy - (y0 + h * 0.55) * hs * s).toFixed(1)} ${x} ${(gy - (y0 + h) * hs * s).toFixed(1)} Q${x} ${(gy - (y0 + h * 0.55) * hs * s).toFixed(1)} ${(x + w * s).toFixed(1)} ${(gy - y0 * hs * s).toFixed(1)} Z" fill="${f}"/>`;
  let tiers = t(30 + rnd(-3, 5), 12, 36, cA) + t(24 + rnd(-3, 4), 36, 32, cB) + t(17 + rnd(-2, 3), 58, 30, cC);
  if (Math.random() < 0.4) tiers += t(11, 80, 24, cC);
  return `<g><ellipse cx="${x}" cy="${gy}" rx="${(28 * s).toFixed(0)}" ry="${(5 * s).toFixed(1)}" fill="#20351c" opacity=".2"/>`
    + `<g transform="rotate(${ln.toFixed(1)} ${x} ${gy})"><g ${rooted(rnd(0.8, 1.5).toFixed(1), 6, 11)}>`
    + `<rect x="${(x - 4 * s).toFixed(1)}" y="${(gy - 18 * s).toFixed(1)}" width="${(8 * s).toFixed(1)}" height="${(18 * s).toFixed(1)}" rx="${(3 * s).toFixed(1)}" fill="#5b4029"/>${tiers}</g></g></g>`;
}
function bush(x, gy, s, c1 = '#3f6f3e', c2 = '#4c8049', c3 = '#598c52') {
  return `<g ${rooted(rnd(0.9, 1.6).toFixed(1), 6, 10)}><ellipse cx="${x}" cy="${gy}" rx="${(44 + rnd(-8, 10)) * s}" ry="${(24 + rnd(-4, 6)) * s}" fill="${c1}"/><ellipse cx="${x - (14 + rnd(0, 8)) * s}" cy="${gy - 6 * s}" rx="${26 * s}" ry="${20 * s}" fill="${c2}"/><ellipse cx="${x + (10 + rnd(0, 10)) * s}" cy="${gy - 3 * s}" rx="${24 * s}" ry="${18 * s}" fill="${c3}"/></g>`;
}
function foliageClump(x, y, s, c1, c2, c3) {
  const b = (dx, dy, r, f) => `<circle cx="${(x + dx * s).toFixed(1)}" cy="${(y + dy * s).toFixed(1)}" r="${(r * s).toFixed(1)}" fill="${f}"/>`;
  return `<g>${b(-24 + rnd(-6, 6), 8, 17, c1)}${b(24 + rnd(-6, 6), 9, 16, c1)}${b(0, 12, 20, c1)}${b(-38, 14, 12, c1)}${b(38, 15, 12, c1)}${b(-13, -4, 16, c2)}${b(13 + rnd(-4, 4), -2, 15, c2)}${b(0, -13, 14, c2)}${b(-27, 3, 11, c2)}${b(26, 4, 10, c2)}${b(-6, -10 + rnd(-3, 3), 9, c3)}${b(9, -8, 8, c3)}${b(-17, -2, 7, c3)}${b(2, 2, 9, c3)}</g>`;
}
function fern(x, gy, s, c = '#3f6f3e') { let f = `<g ${rooted(4, 5, 8)} stroke="${c}" stroke-width="${2.4 * s}" fill="none" stroke-linecap="round">`; for (let i = -2; i <= 2; i++) f += `<path d="M${x} ${gy} q${i * 22 * s} ${-30 * s} ${i * 30 * s} ${-66 * s}"/>`; return f + `</g>`; }
function flower(x, gy, s, c) { const p = (a) => `<ellipse cx="${(x + Math.cos(a) * 7 * s).toFixed(1)}" cy="${(gy - 30 * s + Math.sin(a) * 7 * s).toFixed(1)}" rx="${5 * s}" ry="${7 * s}" fill="${c}" transform="rotate(${(a * 57).toFixed(0)} ${x} ${(gy - 30 * s).toFixed(1)})"/>`; return `<g ${rooted(2.5, 4, 7)}><rect x="${(x - 1.4 * s).toFixed(1)}" y="${(gy - 30 * s).toFixed(1)}" width="${2.8 * s}" height="${30 * s}" fill="#4c8049"/><path d="M${x} ${(gy - 14 * s).toFixed(1)} q${8 * s} ${-3 * s} ${10 * s} ${-10 * s}" stroke="#4c8049" stroke-width="${2 * s}" fill="none"/>${p(0)}${p(1.25)}${p(2.5)}${p(3.77)}${p(5.02)}<circle cx="${x}" cy="${gy - 30 * s}" r="${4 * s}" fill="#f3d24e"/></g>`; }
// tiny distant flower specks scattered in drifts
function flowerDots(n, x0, x1, y0, y1, cols) { let s = '<g>'; for (let i = 0; i < n; i++) s += `<circle cx="${rnd(x0, x1).toFixed(0)}" cy="${rnd(y0, y1).toFixed(0)}" r="${rnd(2, 3.6).toFixed(1)}" fill="${pick(cols)}" opacity="${rnd(.6, .95).toFixed(2)}"/>`; return s + '</g>'; }
function grassTuft(x, gy, s, c = '#4c8049') {
  let g = `<g ${rooted(rnd(3, 6).toFixed(1), 4, 8)} stroke="${c}" stroke-width="${2.6 * s}" fill="none" stroke-linecap="round">`;
  const nB = 3 + Math.floor(rnd(0, 2.6));
  for (let i = 0; i < nB; i++) { const d = (i - (nB - 1) / 2) * rnd(7, 11) * s; g += `<path d="M${x} ${gy} q${(d * 0.4).toFixed(1)} ${-rnd(15, 22) * s} ${d.toFixed(1)} ${-rnd(24, 34) * s}"/>`; }
  return g + '</g>';
}
function reed(x, by, s) { const hh = rnd(78, 104); return `<g ${rooted(3, 5, 8)} stroke-linecap="round"><path d="M${x} ${by} q${-3 * s} ${-hh * 0.45 * s} ${-2 * s} ${-hh * s}" stroke="#5d8a4a" stroke-width="${4 * s}" fill="none"/><path d="M${x + 6 * s} ${by} q${2 * s} ${-hh * 0.5 * s} ${5 * s} ${-(hh - 8) * s}" stroke="#6f9a55" stroke-width="${4 * s}" fill="none"/><path d="M${x + 2 * s} ${by} q${-12 * s} ${-30 * s} ${-20 * s} ${-44 * s}" stroke="#6f9a55" stroke-width="${3 * s}" fill="none"/><ellipse cx="${x - 2 * s}" cy="${by - hh * s}" rx="${5 * s}" ry="${16 * s}" fill="#7a5230"/></g>`; }
function lily(x, y, s) { const notch = rnd(0.6, 1); return `<g class="scene-bob" style="--amp:${rnd(1.5, 3).toFixed(1)}px;--dur:${rnd(5, 9).toFixed(1)}s;--delay:${rnd(-6, 0).toFixed(1)}s"><path d="M${x} ${y} a${24 * s} ${10 * s} 0 1 0 ${0.1} 0 Z" fill="#4c8049"/><path d="M${x} ${y} l${22 * s * notch} ${-3 * s}" stroke="#3f6f3e" stroke-width="2"/><ellipse cx="${x}" cy="${y + 10 * s}" rx="${20 * s}" ry="${5 * s}" fill="#2c5040" opacity=".35"/>${Math.random() < 0.55 ? `<ellipse cx="${x - 6 * s}" cy="${y - 4 * s}" rx="${4 * s}" ry="${5 * s}" fill="#e89ab8"/><circle cx="${x - 6 * s}" cy="${y - 6 * s}" r="${1.8 * s}" fill="#f6c46a"/>` : ''}</g>`; }
function acacia(x, gy, s) {
  const th = (84 + rnd(0, 16)) * s, cy = gy - th, dir = Math.random() < 0.5 ? -1 : 1, off = dir * rnd(6, 16) * s;
  return `<g><ellipse cx="${x}" cy="${gy}" rx="${(50 * s).toFixed(0)}" ry="${(7 * s).toFixed(1)}" fill="#6b5a30" opacity=".25"/>`
    + `<g ${rooted(rnd(0.8, 1.4).toFixed(1), 7, 12)}><path d="M${x - 4 * s} ${gy} L${x - 10 * s} ${cy + 26 * s} L${x - 26 * s} ${cy + 8 * s} M${x - 10 * s} ${cy + 26 * s} L${x + 2 * s} ${cy + 10 * s} M${x + 4 * s} ${gy} L${x + 12 * s} ${cy + 22 * s} L${x + 30 * s} ${cy + 6 * s}" stroke="#6b4a2c" stroke-width="${5 * s}" fill="none" stroke-linecap="round"/>`
    + `<ellipse cx="${(x + off).toFixed(1)}" cy="${cy + 4 * s}" rx="${(48 + rnd(0, 10)) * s}" ry="${13 * s}" fill="#7a8a3f"/><ellipse cx="${(x + off - 14 * s).toFixed(1)}" cy="${cy - 2 * s}" rx="${34 * s}" ry="${9 * s}" fill="#8a9a4a"/><ellipse cx="${(x + off + 20 * s).toFixed(1)}" cy="${cy}" rx="${28 * s}" ry="${8 * s}" fill="#94a452"/><ellipse cx="${(x + off + dir * 8 * s).toFixed(1)}" cy="${cy + 10 * s}" rx="${30 * s}" ry="${6 * s}" fill="#65763a" opacity=".7"/></g></g>`;
}
// tall forest trunk running from above the top edge (where the canopy hides its crown) to the ground
function bigTrunk(x, w, gy, c, hi) {
  return `<g><path d="M${x - w * 0.6} -30 L${x - w * 0.72} ${gy - 70} Q${x - w * 0.8} ${gy - 22} ${x - w * 1.6} ${gy} L${x + w * 1.6} ${gy} Q${x + w * 0.8} ${gy - 22} ${x + w * 0.72} ${gy - 70} L${x + w * 0.6} -30 Z" fill="${c}"/>`
    + `<path d="M${x - w * 0.32} -30 L${x - w * 0.4} ${gy - 50} Q${x - w * 0.45} ${gy - 12} ${x - w * 1.0} ${gy} L${x - w * 0.3} ${gy} Q${x - w * 0.14} ${gy - 40} ${x - w * 0.1} -30 Z" fill="${hi}" opacity=".45"/>`
    + `<path d="M${x - w * 0.5} ${gy - 260} q${-w * 0.4} 10 ${-w * 0.9} 6 M${x + w * 0.48} ${gy - 340} q${w * 0.4} 12 ${w * 0.9} 10" stroke="${c}" stroke-width="${w * 0.28}" fill="none" stroke-linecap="round"/>`
    + `<path d="M${x - w * 0.2} ${gy - 40} q${w * 0.1} -60 ${w * 0.04} -120 M${x + w * 0.3} ${gy - 80} q${-w * 0.06} -50 ${w * 0.02} -110" stroke="#3c2c1a" stroke-width="2.2" fill="none" opacity=".4"/></g>`;
}
// slim hazy background trunk with a slight base flare
const slimTrunk = (x, w, yTop, gy, c, op = 1) => `<path d="M${x - w / 2} ${yTop} L${x - w * 0.66} ${gy - 14} Q${x - w * 0.8} ${gy} ${x - w * 1.3} ${gy} L${x + w * 1.3} ${gy} Q${x + w * 0.8} ${gy} ${x + w * 0.66} ${gy - 14} L${x + w / 2} ${yTop} Z" fill="${c}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
// fallen mossy log resting on the forest floor
function fallenLog(x, gy, s) {
  return `<g><ellipse cx="${x}" cy="${gy}" rx="${74 * s}" ry="${7 * s}" fill="#22381e" opacity=".3"/>`
    + `<rect x="${x - 70 * s}" y="${gy - 22 * s}" width="${140 * s}" height="${22 * s}" rx="${10 * s}" fill="#6b4a2c"/>`
    + `<ellipse cx="${x + 70 * s}" cy="${gy - 11 * s}" rx="${7 * s}" ry="${11 * s}" fill="#8a6a44"/><ellipse cx="${x + 70 * s}" cy="${gy - 11 * s}" rx="${3.5 * s}" ry="${6 * s}" fill="#a5825a"/>`
    + `<path d="M${x - 50 * s} ${gy - 17 * s} q${20 * s} ${3 * s} ${44 * s} ${2 * s} M${x - 26 * s} ${gy - 8 * s} q${26 * s} ${2 * s} ${52 * s} 0" stroke="#5b4029" stroke-width="${1.8 * s}" fill="none" opacity=".7"/>`
    + `<ellipse cx="${x - 34 * s}" cy="${gy - 22 * s}" rx="${16 * s}" ry="${5 * s}" fill="#5d9456" opacity=".85"/><ellipse cx="${x + 18 * s}" cy="${gy - 23 * s}" rx="${9 * s}" ry="${3.5 * s}" fill="#6fa863" opacity=".7"/></g>`;
}
function mushroom(x, gy, s, c = '#c96f52') { return `<g><rect x="${(x - 1.8 * s).toFixed(1)}" y="${(gy - 10 * s).toFixed(1)}" width="${3.6 * s}" height="${10 * s}" rx="${1.6 * s}" fill="#e8dcc0"/><path d="M${(x - 8 * s).toFixed(1)} ${(gy - 9 * s).toFixed(1)} q${8 * s} ${-11 * s} ${16 * s} 0 Z" fill="${c}"/><circle cx="${(x - 2 * s).toFixed(1)}" cy="${(gy - 13 * s).toFixed(1)}" r="${1.2 * s}" fill="#f4e8d4" opacity=".9"/></g>`; }
// scattered fallen leaves (autumn browns/ochres) on the ground
function leafLitter(n, x0, x1, y0, y1) {
  const cs = ['#b98a4a', '#a9772f', '#c9a15e', '#8a6b3a', '#b06a3a'];
  let s = '<g>';
  for (let i = 0; i < n; i++) { const px = rnd(x0, x1), py = rnd(y0, y1); s += `<ellipse cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" rx="${rnd(4, 7).toFixed(1)}" ry="${rnd(2, 3.4).toFixed(1)}" fill="${pick(cs)}" opacity="${rnd(.5, .85).toFixed(2)}" transform="rotate(${rnd(-45, 45).toFixed(0)} ${px.toFixed(0)} ${py.toFixed(0)})"/>`; }
  return s + '</g>';
}
// warm pools of dappled light on the forest floor (shimmer gently)
function lightDapple(n, x0, x1, y0, y1, c) { let s = `<g class="scene-rays" style="--o1:.09;--o2:.22;--dur:${rnd(8, 13).toFixed(0)}s">`; for (let i = 0; i < n; i++) s += `<ellipse cx="${rnd(x0, x1).toFixed(0)}" cy="${rnd(y0, y1).toFixed(0)}" rx="${rnd(14, 34).toFixed(0)}" ry="${rnd(4, 7).toFixed(0)}" fill="${c}"/>`; return s + '</g>'; }
// weathered bare snag (standing dead tree) for wetlands
function snag(x, gy, s) { return `<g><path d="M${x} ${gy} L${x - 3 * s} ${gy - 66 * s} L${x - 15 * s} ${gy - 94 * s} M${x - 1.6 * s} ${gy - 44 * s} L${x + 19 * s} ${gy - 70 * s} M${x - 2.4 * s} ${gy - 58 * s} L${x - 21 * s} ${gy - 72 * s} M${x + 6 * s} ${gy - 52 * s} L${x + 11 * s} ${gy - 60 * s}" stroke="#7a6a54" stroke-width="${5 * s}" fill="none" stroke-linecap="round"/><ellipse cx="${x}" cy="${gy}" rx="${12 * s}" ry="${3 * s}" fill="#4a4234" opacity=".5"/></g>`; }
// sun-bleached driftwood lying on the sand
function driftwood(x, gy, s) { return `<g><ellipse cx="${x}" cy="${gy + 2 * s}" rx="${56 * s}" ry="${5 * s}" fill="#9a8a68" opacity=".35"/><path d="M${x - 50 * s} ${gy} Q${x - 20 * s} ${gy - 15 * s} ${x + 28 * s} ${gy - 8 * s} L${x + 56 * s} ${gy - 14 * s} L${x + 46 * s} ${gy - 2 * s} L${x + 30 * s} ${gy} Z" fill="#b5a284"/><path d="M${x - 50 * s} ${gy} Q${x - 16 * s} ${gy - 9 * s} ${x + 40 * s} ${gy - 4 * s}" stroke="#94805f" stroke-width="${2 * s}" fill="none"/></g>`; }
function termiteMound(x, gy, s) { return `<g><ellipse cx="${x}" cy="${gy}" rx="${32 * s}" ry="${5 * s}" fill="#6b5a30" opacity=".3"/><path d="M${x - 28 * s} ${gy} Q${x - 22 * s} ${gy - 38 * s} ${x - 8 * s} ${gy - 60 * s} Q${x - 1 * s} ${gy - 72 * s} ${x + 5 * s} ${gy - 56 * s} Q${x + 16 * s} ${gy - 28 * s} ${x + 25 * s} ${gy} Z" fill="#a97a4a"/><path d="M${x - 28 * s} ${gy} Q${x - 22 * s} ${gy - 38 * s} ${x - 8 * s} ${gy - 60 * s} Q${x - 6 * s} ${gy - 30 * s} ${x - 2 * s} ${gy} Z" fill="#c2915c" opacity=".7"/></g>`; }
function cactus(x, gy, s) {
  return `<g><ellipse cx="${x}" cy="${gy}" rx="${16 * s}" ry="${4 * s}" fill="#8a6a34" opacity=".35"/><g ${rooted(0.8, 7, 11)}>`
    + `<path d="M${x} ${gy} L${x} ${gy - 64 * s}" stroke="#4e7a3a" stroke-width="${15 * s}" stroke-linecap="round"/>`
    + `<path d="M${x - 8 * s} ${gy - 30 * s} q${-14 * s} ${-2 * s} ${-14 * s} ${-22 * s}" stroke="#4e7a3a" stroke-width="${9 * s}" fill="none" stroke-linecap="round"/>`
    + `<path d="M${x + 8 * s} ${gy - 40 * s} q${15 * s} ${-2 * s} ${15 * s} ${-18 * s}" stroke="#4e7a3a" stroke-width="${9 * s}" fill="none" stroke-linecap="round"/>`
    + `<path d="M${x - 2.5 * s} ${gy - 8 * s} L${x - 2.5 * s} ${gy - 56 * s} M${x + 3 * s} ${gy - 8 * s} L${x + 3 * s} ${gy - 56 * s}" stroke="#3f6630" stroke-width="${1.6 * s}" opacity=".7"/></g></g>`;
}
function dryShrub(x, gy, s, c = '#9a8448') { let g = `<g ${rooted(2, 5, 9)} stroke="${c}" stroke-width="${2 * s}" fill="none" stroke-linecap="round">`; for (let i = -3; i <= 3; i++) g += `<path d="M${x} ${gy} q${i * 8 * s} ${-14 * s} ${i * 12 * s} ${-26 * s}"/>`; return g + '</g>'; }
// soft moss patch hugging a surface (log top, rock crown, damp ground)
function mossPatch(x, y, s, c = '#5d9456') {
  return `<g opacity=".85"><ellipse cx="${x}" cy="${y}" rx="${((14 + rnd(0, 8)) * s).toFixed(1)}" ry="${(4.5 * s).toFixed(1)}" fill="${c}"/><ellipse cx="${(x - 9 * s).toFixed(1)}" cy="${(y + 2 * s).toFixed(1)}" rx="${(7 * s).toFixed(1)}" ry="${(3 * s).toFixed(1)}" fill="${c}" opacity=".8"/><ellipse cx="${(x + 10 * s).toFixed(1)}" cy="${(y + 1.5 * s).toFixed(1)}" rx="${(6 * s).toFixed(1)}" ry="${(2.6 * s).toFixed(1)}" fill="${c}" opacity=".7"/></g>`;
}
// little family of toadstools sprouting together from the soil
function mushroomCluster(x, gy, s, c) {
  const col = c || pick(['#c96f52', '#b98a4a', '#d8956a']);
  let g = '<g>';
  const n = 2 + Math.floor(rnd(1, 2.8));
  for (let i = 0; i < n; i++) g += mushroom(x + (i - (n - 1) / 2) * rnd(9, 14) * s, gy + rnd(-2, 3) * s, s * rnd(0.55, 1.15), col);
  return g + '</g>';
}
// squat ribbed barrel cactus with a bloom on its crown
function barrelCactus(x, gy, s) {
  return `<g><ellipse cx="${x}" cy="${gy}" rx="${14 * s}" ry="${3.5 * s}" fill="#8a6a34" opacity=".35"/><path d="M${x - 12 * s} ${gy} Q${x - 13 * s} ${gy - 22 * s} ${x} ${gy - 24 * s} Q${x + 13 * s} ${gy - 22 * s} ${x + 12 * s} ${gy} Z" fill="#5d8a3c"/><path d="M${x - 6 * s} ${gy} Q${x - 7 * s} ${gy - 21 * s} ${x} ${gy - 24 * s} M${x + 6 * s} ${gy} Q${x + 7 * s} ${gy - 21 * s} ${x} ${gy - 24 * s}" stroke="#456e2c" stroke-width="${1.4 * s}" fill="none" opacity=".8"/><circle cx="${x}" cy="${gy - 23 * s}" r="${3 * s}" fill="#e0698f"/></g>`;
}
// prickly-pear: stacked oval pads with a fruit
function pricklyPear(x, gy, s) {
  const pad = (dx, dy, r, rot) => `<ellipse cx="${(x + dx * s).toFixed(1)}" cy="${(gy + dy * s).toFixed(1)}" rx="${(r * s).toFixed(1)}" ry="${(r * 1.3 * s).toFixed(1)}" fill="#4e7a3a" transform="rotate(${rot} ${(x + dx * s).toFixed(1)} ${(gy + dy * s).toFixed(1)})"/>`;
  return `<g><ellipse cx="${x}" cy="${gy}" rx="${16 * s}" ry="${3.5 * s}" fill="#8a6a34" opacity=".3"/>${pad(0, -10, 10, 0)}${pad(-11, -22, 8, -28)}${pad(10, -24, 7.5, 24)}<circle cx="${(x + 13 * s).toFixed(1)}" cy="${(gy - 32 * s).toFixed(1)}" r="${2.4 * s}" fill="#d65b5b"/></g>`;
}
// flat-topped desert mesa with strata lines and a shaded flank
function mesa(x, w, h, baseY, c1, c2, op = 1) {
  const top = baseY - h, tw = w * rnd(0.64, 0.78);
  let s = `<g${op < 1 ? ` opacity="${op}"` : ''}><path d="M${x - w} ${baseY} Q${(x - tw * 0.96).toFixed(0)} ${(baseY - h * 0.14).toFixed(0)} ${(x - tw * 0.86).toFixed(0)} ${(top + h * 0.38).toFixed(0)} Q${(x - tw * 0.8).toFixed(0)} ${(top + h * 0.12).toFixed(0)} ${(x - tw * 0.62).toFixed(0)} ${top.toFixed(0)} L${(x + tw * 0.7).toFixed(0)} ${top.toFixed(0)} Q${(x + tw * 0.82).toFixed(0)} ${(top + h * 0.1).toFixed(0)} ${(x + tw * 0.9).toFixed(0)} ${(top + h * 0.42).toFixed(0)} Q${(x + tw * 0.98).toFixed(0)} ${(baseY - h * 0.12).toFixed(0)} ${x + w} ${baseY} Z" fill="${c1}"/>`;
  s += `<path d="M${(x + tw * 0.7).toFixed(0)} ${top.toFixed(0)} Q${(x + tw * 0.82).toFixed(0)} ${(top + h * 0.1).toFixed(0)} ${(x + tw * 0.9).toFixed(0)} ${(top + h * 0.42).toFixed(0)} Q${(x + tw * 0.98).toFixed(0)} ${(baseY - h * 0.12).toFixed(0)} ${x + w} ${baseY} L${(x + w * 0.4).toFixed(0)} ${baseY} Z" fill="#1c2a38" opacity=".09"/>`;
  for (let i = 1; i <= 2; i++) s += `<path d="M${(x - tw * 0.88 + i * 6).toFixed(0)} ${(top + h * (0.22 + i * 0.2)).toFixed(0)} Q${x} ${(top + h * (0.26 + i * 0.2)).toFixed(0)} ${(x + tw * 0.92).toFixed(0)} ${(top + h * (0.18 + i * 0.2)).toFixed(0)}" stroke="${c2}" stroke-width="3" opacity=".35" fill="none"/>`;
  return s + '</g>';
}
// sun-bleached dead branch lying on the ground
function bleachedBranch(x, gy, s, c = '#ddd0b0') {
  return `<g><ellipse cx="${x}" cy="${gy + 2 * s}" rx="${40 * s}" ry="${4 * s}" fill="#7a6440" opacity=".25"/><path d="M${x - 38 * s} ${gy} Q${x - 8 * s} ${gy - 10 * s} ${x + 24 * s} ${gy - 4 * s} L${x + 40 * s} ${gy - 12 * s} M${x - 4 * s} ${gy - 7 * s} L${x + 10 * s} ${gy - 20 * s}" stroke="${c}" stroke-width="${4 * s}" fill="none" stroke-linecap="round"/></g>`;
}
// half-submerged log breaking a calm water surface (moss on its dry back)
function halfLog(x, wy, s) {
  return `<g><path d="M${x - 60 * s} ${wy} Q${x - 56 * s} ${wy - 16 * s} ${x - 30 * s} ${wy - 19 * s} L${x + 48 * s} ${wy - 13 * s} Q${x + 60 * s} ${wy - 10 * s} ${x + 62 * s} ${wy} Z" fill="#6b4a2c"/><path d="M${x - 30 * s} ${wy - 19 * s} L${x + 48 * s} ${wy - 13 * s}" stroke="#8a6a44" stroke-width="${3 * s}" fill="none" opacity=".7"/>${mossPatch(x - 22 * s, wy - 15 * s, s * 0.9, '#6fa863')}<ellipse cx="${x}" cy="${wy}" rx="${70 * s}" ry="${5 * s}" fill="#2c5040" opacity=".3"/><path d="M${x - 78 * s} ${wy + 4 * s} q${30 * s} ${5 * s} ${62 * s} ${2 * s} M${x + 20 * s} ${wy + 6 * s} q${26 * s} ${4 * s} ${54 * s} 0" stroke="#ffffff" stroke-width="2.5" fill="none" opacity=".35"/></g>`;
}
// raft of floating marsh vegetation resting ON the water surface (bobs gently)
function vegMat(x, y, s) {
  let g = `<g class="scene-bob" style="--amp:${rnd(1.2, 2.4).toFixed(1)}px;--dur:${rnd(6, 10).toFixed(1)}s;--delay:${rnd(-6, 0).toFixed(1)}s"><ellipse cx="${x}" cy="${y + 5 * s}" rx="${36 * s}" ry="${3.4 * s}" fill="#2c5040" opacity=".3"/><ellipse cx="${x}" cy="${y}" rx="${((40 + rnd(0, 22)) * s).toFixed(1)}" ry="${6 * s}" fill="#5d8a4a"/><ellipse cx="${x - 14 * s}" cy="${y - 2 * s}" rx="${18 * s}" ry="${4 * s}" fill="#6f9a55"/><ellipse cx="${x + 16 * s}" cy="${y - 1 * s}" rx="${14 * s}" ry="${3.4 * s}" fill="#7fa860"/>`;
  for (let i = 0; i < 4; i++) g += `<circle cx="${(x + rnd(-30, 30) * s).toFixed(1)}" cy="${(y - 3 * s).toFixed(1)}" r="${(rnd(1.6, 2.6) * s).toFixed(1)}" fill="#8fb56d"/>`;
  return g + `</g>`;
}
// weathered tide-pool rock shelf: trapped pool, barnacle speckle, limpets, a small sea star
function tidePool(x, gy, s) {
  let g = `<g><ellipse cx="${x}" cy="${gy}" rx="${64 * s}" ry="${7 * s}" fill="#5f5344" opacity=".3"/>`;
  g += `<path d="M${x - 60 * s} ${gy} Q${x - 58 * s} ${gy - 18 * s} ${x - 34 * s} ${gy - 24 * s} L${x + 30 * s} ${gy - 26 * s} Q${x + 58 * s} ${gy - 20 * s} ${x + 60 * s} ${gy} Z" fill="#8d7f6c"/><path d="M${x - 34 * s} ${gy - 24 * s} L${x + 30 * s} ${gy - 26 * s} Q${x + 58 * s} ${gy - 20 * s} ${x + 60 * s} ${gy} L${x + 20 * s} ${gy} Z" fill="#a5967f" opacity=".4"/>`;
  g += `<ellipse cx="${x - 2 * s}" cy="${gy - 20 * s}" rx="${28 * s}" ry="${6.5 * s}" fill="#4f7d92"/><ellipse cx="${x - 8 * s}" cy="${gy - 21 * s}" rx="${13 * s}" ry="${2.6 * s}" fill="#8cc8d8" opacity=".7"/>`;
  for (let i = 0; i < 6; i++) g += `<circle cx="${(x + rnd(-52, 54) * s).toFixed(1)}" cy="${(gy - rnd(2, 12) * s).toFixed(1)}" r="${(rnd(1.6, 2.8) * s).toFixed(1)}" fill="#ded2b8" opacity=".9"/>`;
  g += `<path d="M${x - 44 * s} ${gy - 12 * s} l${5 * s} ${-6 * s} l${5 * s} ${6 * s} Z" fill="#c9b490"/><path d="M${x + 38 * s} ${gy - 8 * s} l${4.5 * s} ${-5 * s} l${4.5 * s} ${5 * s} Z" fill="#bfae86"/>`;
  g += seastar(x + 16 * s, gy - 5 * s, 0.55 * s, '#e8734a');
  return g + '</g>';
}
// angular scree fragments spilling across a slope
function scree(n, x0, x1, y0, y1, c1, c2) {
  let s = '<g>';
  for (let i = 0; i < n; i++) {
    const px = rnd(x0, x1), py = rnd(y0, y1), r = rnd(4, 9), a = rnd(0, 6.3);
    s += `<path d="M${(px + Math.cos(a) * r).toFixed(1)} ${(py + Math.sin(a) * r * 0.7).toFixed(1)} L${(px + Math.cos(a + 2.1) * r).toFixed(1)} ${(py + Math.sin(a + 2.1) * r * 0.7).toFixed(1)} L${(px + Math.cos(a + 4.2) * r).toFixed(1)} ${(py + Math.sin(a + 4.2) * r * 0.7).toFixed(1)} Z" fill="${Math.random() < 0.5 ? c1 : c2}" opacity="${rnd(.6, .95).toFixed(2)}"/>`;
  }
  return s + '</g>';
}

// ---- water / underwater ----
function rays(o1, o2) { let r = `<g class="scene-rays" style="--o1:${o1};--o2:${o2};--dur:${rnd(8, 13).toFixed(0)}s">`; for (const [x, w, o] of [[130, 140, 1], [430, 210, .8], [790, 160, .9], [1050, 120, .7]]) r += `<polygon points="${x},-20 ${x + w},-20 ${x + w * 1.7},620 ${x + w * 0.7},620" fill="#ffffff" opacity="${(o * 0.18).toFixed(3)}"/>`; return r + '</g>'; }
function caustics(yTop, n = 5, op = 0.2) { let g = `<g class="scene-caustic" style="--amp:${rnd(26, 40).toFixed(0)}px;--dur:${rnd(12, 19).toFixed(0)}s;--delay:${rnd(-10, 0).toFixed(0)}s" stroke="#ffffff" stroke-width="3.5" fill="none" opacity="${op}" stroke-linecap="round">`; for (let i = 0; i < n; i++) { const y = yTop + 30 + i * 46 + rnd(-10, 10); g += `<path d="M${rnd(30, 240).toFixed(0)} ${y.toFixed(0)} q${rnd(90, 140).toFixed(0)} ${rnd(-22, 22).toFixed(0)} ${rnd(200, 260).toFixed(0)} 0 q${rnd(90, 140).toFixed(0)} ${rnd(-22, 22).toFixed(0)} ${rnd(200, 260).toFixed(0)} 0"/>`; } return g + '</g>'; }
function school(x, y, n, c) { let s = `<g class="scene-cloud" style="--amp:${rnd(20, 44).toFixed(0)}px;--dur:${rnd(30, 50).toFixed(0)}s;--delay:${rnd(-30, 0).toFixed(0)}s" opacity=".4">`; for (let i = 0; i < n; i++) { const px = x + (i % 5) * 26 + rnd(-9, 9), py = y + Math.floor(i / 5) * 18 + rnd(-7, 7); s += `<path d="M${px.toFixed(0)} ${py.toFixed(0)} q10 -6 20 0 q-6 4 0 8 q-12 4 -20 0 Z" fill="${c}"/>`; } return s + '</g>'; }
function foam(y) { let f = `<g stroke="#ffffff" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round">`; for (let i = 0; i < 4; i++) f += `<path class="scene-caustic" style="--amp:${rnd(18, 32).toFixed(0)}px;--dur:${rnd(9, 15).toFixed(0)}s;--delay:${rnd(-8, 0).toFixed(0)}s" d="M${rnd(30, 260).toFixed(0)} ${(y + i * 26 + rnd(-7, 7)).toFixed(0)} q90 ${rnd(-8, 8).toFixed(0)} 190 0 q100 ${rnd(-8, 8).toFixed(0)} 200 0 q80 ${rnd(-6, 6).toFixed(0)} 170 0"/>`; return f + '</g>'; }
function bubbles(x, y0, n, s = 1) { let g = `<g class="scene-rays" style="--o1:.3;--o2:.7;--dur:${rnd(4, 7).toFixed(1)}s" fill="#e4f6fa">`; for (let i = 0; i < n; i++) g += `<circle cx="${(x + Math.sin(i * 1.9) * 9 * s).toFixed(1)}" cy="${(y0 - i * rnd(30, 44)).toFixed(1)}" r="${(rnd(2, 4.4) * s).toFixed(1)}" opacity="${rnd(.25, .55).toFixed(2)}"/>`; return g + '</g>'; }
// shimmering sun glints on a water surface
function glints(n, x0, x1, y0, y1, c = '#ffffff') { let s = `<g class="scene-rays" style="--o1:.25;--o2:.65;--dur:${rnd(5, 9).toFixed(1)}s">`; for (let i = 0; i < n; i++) s += `<rect x="${rnd(x0, x1).toFixed(0)}" y="${rnd(y0, y1).toFixed(0)}" width="${rnd(12, 42).toFixed(0)}" height="${rnd(2, 3.4).toFixed(1)}" rx="1.5" fill="${c}" opacity="${rnd(.3, .6).toFixed(2)}"/>`; return s + '</g>'; }
// branching coral
function coral(x, gy, s, c1, c2) { const lobe = (dx, h, w, f, op) => `<path d="M${x + dx} ${gy} q${-w} ${-h} 0 ${-h * 1.25} q${w} ${h * 0.25} 0 ${h * 1.25} Z" fill="${f}"${op ? ` opacity="${op}"` : ''}/>`; const hc = (78 + rnd(0, 14)) * s; return `<g ${rooted(1.6, 6, 9)}>${lobe(-18 * s, (58 + rnd(0, 14)) * s, 16 * s, c2)}${lobe(16 * s, (52 + rnd(0, 12)) * s, 15 * s, c2)}${lobe(-2 * s, hc, 18 * s, c1)}${lobe(-30 * s, 44 * s, 13 * s, c1)}${lobe(30 * s, 48 * s, 13 * s, c2)}${lobe(-4 * s, hc * 0.82, 7 * s, '#ffffff', '.22')}${lobe(14 * s, 40 * s, 5 * s, '#ffffff', '.16')}<circle cx="${x - 2 * s}" cy="${gy - 84 * s}" r="${5 * s}" fill="${c1}"/></g>`; }
// rounded brain coral with wavy grooves
function brainCoral(x, gy, s, c1, c2) {
  let g = `<g><path d="M${x - 40 * s} ${gy} Q${x - 44 * s} ${gy - 46 * s} ${x - 6 * s} ${gy - 54 * s} Q${x + 40 * s} ${gy - 50 * s} ${x + 38 * s} ${gy} Z" fill="${c1}"/>`;
  for (let i = 0; i < 4; i++) g += `<path d="M${(x - 30 * s + i * 4 * s).toFixed(1)} ${(gy - 9 * s - i * 11 * s).toFixed(1)} q${18 * s} ${-8 * s} ${(56 - i * 12) * s} 0" stroke="${c2}" stroke-width="${2.6 * s}" fill="none" stroke-linecap="round" opacity=".85"/>`;
  return g + `<ellipse cx="${x - 14 * s}" cy="${gy - 44 * s}" rx="${12 * s}" ry="${5 * s}" fill="#ffffff" opacity=".2"/></g>`;
}
// cluster of tube coral pipes of stepped heights
function tubeCoral(x, gy, s, c1, c2) {
  let g = `<g ${rooted(1.2, 6, 10)}>`, dx = -20 * s;
  for (const h of [30 + rnd(0, 8), 46 + rnd(0, 10), 38, 24 + rnd(0, 8)]) {
    g += `<rect x="${(x + dx).toFixed(1)}" y="${(gy - h * s).toFixed(1)}" width="${10 * s}" height="${(h * s).toFixed(1)}" rx="${5 * s}" fill="${c1}"/><ellipse cx="${(x + dx + 5 * s).toFixed(1)}" cy="${(gy - h * s).toFixed(1)}" rx="${5 * s}" ry="${3 * s}" fill="${c2}"/>`;
    dx += 11 * s;
  }
  return g + '</g>';
}
function seafan(x, gy, s, c) { let f = `<g ${rooted(2.4, 6, 10)} stroke="${c}" stroke-width="${3 * s}" fill="none" stroke-linecap="round">`; for (let i = -3; i <= 3; i++) f += `<path d="M${x} ${gy} q${i * 14 * s} ${-40 * s} ${i * 20 * s} ${-78 * s}"/>`; f += `<path d="M${x - 30 * s} ${gy - 44 * s} q${30 * s} ${-14 * s} ${62 * s} ${-2 * s}" stroke-width="${1.8 * s}" opacity=".7"/>`; return f + `</g>`; }
function anemone(x, gy, s, c, cTip) {
  let f = `<g ${rooted(3, 4, 7)}>`;
  for (let i = -4; i <= 4; i++) {
    const dx = i * 9 * s, dy = -40 * s + Math.abs(i) * 5 * s;
    f += `<path d="M${x} ${gy} q${i * 6 * s} ${-26 * s} ${dx.toFixed(1)} ${dy.toFixed(1)}" stroke="${c}" stroke-width="${4 * s}" fill="none" stroke-linecap="round"/><circle cx="${(x + dx).toFixed(1)}" cy="${(gy + dy).toFixed(1)}" r="${2.6 * s}" fill="${cTip || c}"/>`;
  }
  return f + `<ellipse cx="${x}" cy="${gy}" rx="${20 * s}" ry="${8 * s}" fill="${c}" opacity=".6"/></g>`;
}
function kelp(x, by, s, c = '#3c7a5a') {
  let g = `<g ${rooted(rnd(3.5, 5.5).toFixed(1), 8, 13)}>`;
  const n = Math.random() < 0.5 ? 2 : 3;
  for (let i = 0; i < n; i++) {
    const dx = (i - (n - 1) / 2) * 13 * s, hh = rnd(150, 225) * s;
    g += `<path d="M${(x + dx).toFixed(1)} ${by} q${(-26 * s).toFixed(1)} ${(-hh * 0.5).toFixed(1)} ${(6 * s).toFixed(1)} ${(-hh).toFixed(1)} q${(28 * s).toFixed(1)} ${(-hh * 0.42).toFixed(1)} ${(-4 * s).toFixed(1)} ${(-hh * 0.9).toFixed(1)}" stroke="${c}" stroke-width="${(8 * s).toFixed(1)}" fill="none" stroke-linecap="round" opacity=".62"/>`;
    for (let j = 0; j < 3; j++) { const bx = x + dx + rnd(-8, 8) * s, byy = by - hh * rnd(0.25, 0.85); g += `<ellipse cx="${bx.toFixed(1)}" cy="${byy.toFixed(1)}" rx="${3.5 * s}" ry="${12 * s}" fill="${c}" opacity=".5" transform="rotate(${rnd(-28, 28).toFixed(0)} ${bx.toFixed(1)} ${byy.toFixed(1)})"/>`; }
  }
  return g + '</g>';
}
function seaweedTuft(x, by, s, c) { let g = `<g ${rooted(4, 6, 9)} stroke="${c}" stroke-width="${5 * s}" fill="none" stroke-linecap="round">`; const nB = 4 + Math.floor(rnd(0, 3)); for (let i = 0; i < nB; i++) { const d = (i - (nB - 1) / 2) * rnd(9, 14); g += `<path d="M${x} ${by} q${(d * 0.7 * s).toFixed(1)} ${-rnd(36, 50) * s} ${(d * s).toFixed(1)} ${-rnd(70, 96) * s}"/>`; } return g + '</g>'; }
function seastar(x, y, s, c) {
  const rot = rnd(0, 72);
  let pts = '';
  for (let i = 0; i < 10; i++) { const a = Math.PI * 2 * i / 10 - Math.PI / 2, r = (i % 2 === 0 ? 15 : 6.5) * s; pts += `${(x + Math.cos(a) * r).toFixed(1)},${(y + Math.sin(a) * r * 0.8).toFixed(1)} `; }
  return `<g transform="rotate(${rot.toFixed(0)} ${x} ${y})"><polygon points="${pts.trim()}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${4 * s}" fill="#ffffff" opacity=".25"/></g>`;
}
function urchin(x, y, s, c = '#3a2c4e') { let g = `<g stroke="${c}" stroke-width="${1.6 * s}">`; for (let i = 0; i < 12; i++) { const a = Math.PI * 2 * i / 12; g += `<line x1="${x}" y1="${y}" x2="${(x + Math.cos(a) * 14 * s).toFixed(1)}" y2="${(y + Math.sin(a) * 10 * s).toFixed(1)}"/>`; } return g + `<circle cx="${x}" cy="${y}" r="${8 * s}" fill="${c}"/></g>`; }
// rounded lumpy rock wall hugging the LEFT edge, rising from the seabed (mirror for right)
function seaWall(reach, topY, c1, c2) {
  const r = reach;
  let s = `<path d="M0 ${H} L0 ${topY} Q${(r * 0.34).toFixed(0)} ${topY + 14} ${(r * 0.4).toFixed(0)} ${topY + 78} Q${(r * 0.68).toFixed(0)} ${topY + 104} ${(r * 0.64).toFixed(0)} ${topY + 176} Q${(r * 0.94).toFixed(0)} ${topY + 216} ${(r * 0.86).toFixed(0)} ${topY + 300} Q${(r * 1.06).toFixed(0)} ${topY + 350} ${(r * 0.9).toFixed(0)} ${H} Z" fill="${c1}"/>`;
  s += `<circle cx="${(r * 0.18).toFixed(0)}" cy="${topY + 46}" r="${(r * 0.16).toFixed(0)}" fill="${c2}" opacity=".5"/><circle cx="${(r * 0.3).toFixed(0)}" cy="${topY + 140}" r="${(r * 0.13).toFixed(0)}" fill="${c2}" opacity=".4"/><circle cx="${(r * 0.42).toFixed(0)}" cy="${topY + 250}" r="${(r * 0.15).toFixed(0)}" fill="${c2}" opacity=".35"/>`;
  return s;
}
function glowDot(x, y, r, c) { return `<g class="scene-sun" style="--o1:.25;--o2:.9;--dur:${rnd(3, 7).toFixed(1)}s"><circle cx="${x}" cy="${y}" r="${r * 2.6}" fill="${c}" opacity=".18"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/></g>`; }
function shellProp(x, y, s) { return `<g><path d="M${x} ${y} a${9 * s} ${9 * s} 0 1 1 ${9 * s} ${9 * s}" fill="none" stroke="#c9a166" stroke-width="${5 * s}" stroke-linecap="round"/><circle cx="${x + 3 * s}" cy="${y + 3 * s}" r="${2.4 * s}" fill="#a8834f"/></g>`; }
// small floating light motes (dust caught in sunbeams)
function motes(n, x0, x1, y0, y1, c) { let s = ''; for (let i = 0; i < n; i++) s += glowDot(rnd(x0, x1).toFixed(0), rnd(y0, y1).toFixed(0), rnd(1.4, 2.6).toFixed(1), c); return s; }
// gentle sand-ripple arcs on a seabed / beach
function ripples(y0, n, c, op = .3, x0 = 40, x1 = 1000) { let s = `<g stroke="${c}" stroke-width="3" fill="none" opacity="${op}" stroke-linecap="round">`; for (let i = 0; i < n; i++) { const y = y0 + i * 22 + rnd(-8, 8), x = rnd(x0, x1); s += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q${rnd(50, 90).toFixed(0)} 8 ${rnd(130, 200).toFixed(0)} 0"/>`; } return s + '</g>'; }
// glowing hydrothermal vent chimney (deep sea)
function ventChimney(x, gy, s, c1, c2, glowC) {
  return `<g><path d="M${x - 26 * s} ${gy} Q${x - 20 * s} ${gy - 42 * s} ${x - 9 * s} ${gy - 74 * s} L${x + 7 * s} ${gy - 74 * s} Q${x + 16 * s} ${gy - 38 * s} ${x + 25 * s} ${gy} Z" fill="${c1}"/>`
    + `<path d="M${x - 26 * s} ${gy} Q${x - 20 * s} ${gy - 42 * s} ${x - 9 * s} ${gy - 74 * s} Q${x - 8 * s} ${gy - 36 * s} ${x - 3 * s} ${gy} Z" fill="${c2}" opacity=".6"/>`
    + `<g class="scene-sun" style="--o1:.4;--o2:.95;--dur:${rnd(3, 6).toFixed(1)}s"><ellipse cx="${x - 1 * s}" cy="${gy - 74 * s}" rx="${9 * s}" ry="${4.5 * s}" fill="${glowC}"/><ellipse cx="${x - 1 * s}" cy="${gy - 80 * s}" rx="${17 * s}" ry="${11 * s}" fill="${glowC}" opacity=".3"/><ellipse cx="${x - 1 * s}" cy="${gy - 84 * s}" rx="${26 * s}" ry="${17 * s}" fill="${glowC}" opacity=".12"/></g>`
    + bubbles(x, gy - 86 * s, 4, 0.7 * s) + `</g>`;
}
// cluster of glowing tube worms rooted at a vent base
function tubeWorms(x, gy, s, c, glowC) {
  let g = `<g ${rooted(2, 4, 7)}>`, dx = -14 * s;
  for (const h of [22, 34, 28, 18]) { g += `<rect x="${(x + dx).toFixed(1)}" y="${(gy - h * s).toFixed(1)}" width="${6 * s}" height="${(h * s).toFixed(1)}" rx="${3 * s}" fill="${c}"/><circle cx="${(x + dx + 3 * s).toFixed(1)}" cy="${(gy - h * s).toFixed(1)}" r="${3 * s}" fill="${glowC}"/>`; dx += 8 * s; }
  return g + '</g>';
}

export function backdrop(biome, count) {
  const c = count || 0;
  const P = 's' + Math.floor(Math.random() * 1e9).toString(36) + Math.floor(Math.random() * 1e4).toString(36) + '_';

  // ============ FOREST — trunks receding into misty green depth, canopy attached above ============
  if (biome === 'forest') {
    const defs = lg(P + 'fk', '#f2ecc0', '#c6ddb2') + lg(P + 'fg', '#7aa457', '#4b7a3c') + fogDef(P + 'ffog', '#e6efcf');
    let b = `<rect width="${W}" height="${H}" fill="url(#${P}fk)"/>`;
    b += `<g class="scene-sun" style="--o1:.5;--o2:.85;--dur:${rnd(7, 10).toFixed(1)}s"><circle cx="790" cy="138" r="92" fill="#fdf5d2" opacity=".65"/><circle cx="790" cy="138" r="158" fill="#fdf5d2" opacity=".3"/></g>`;
    // farthest canopy haze — irregular clumps, denser toward the left
    b += scatter(9, -40, 1230).map((x) => `<g opacity="${rnd(.35, .55).toFixed(2)}">${foliageClump(x, rnd(14, 108), rnd(1.3, 2.3), '#a9c497', '#bad5a7', '#cbdfb7')}</g>`).join('');
    // hazy far trunks — clustered with gaps, varied width/height
    b += scatter(8, 30, 1170).map((x) => slimTrunk(x, rnd(6, 13), rnd(78, 150), 468 + rnd(-6, 6), '#b0c49c', rnd(.65, .9))).join('');
    b += roll(462, 8, '#b5d09a', .85);
    b += fogRect(P + 'ffog', 320, 170);
    // mid trunks (still hazed)
    b += scatter(6, 70, 1130).map((x) => slimTrunk(x, rnd(12, 21), rnd(10, 80), 500 + rnd(-4, 8), '#87996f', rnd(.85, 1))).join('');
    b += scatter(4, 120, 1080).map((x) => `<g opacity=".8">${foliageClump(x, rnd(55, 140), rnd(1.1, 1.7), '#6f8f58', '#84a468', '#9ab87a')}</g>`).join('');
    // god-rays through the trees
    b += `<g opacity=".9">${rays(.35, .6)}</g>`;
    b += roll(503, 7, `url(#${P}fg)`);
    // dappled light pooling on the floor
    b += lightDapple(clampN(5, 10, 4 + c), 60, 1140, 516, 592, '#f7ecb4');
    // soft dirt trail bending off-centre toward the camera
    b += `<path d="M430 600 Q545 566 590 536 Q606 524 624 524 L666 524 Q684 526 702 540 Q762 574 910 600 Z" fill="#b9a077" opacity=".5"/><path d="M520 600 Q598 572 622 540 L658 540 Q680 570 810 600 Z" fill="#ccb489" opacity=".38"/>`;
    b += pebbles(6, 560, 800, 556, 592, '#9a835f', .6);
    // mid trees grow with collection — clustered, size-varied, some overlapping
    b += scatter(clampN(3, 6, 2 + Math.floor(c / 3)), 190, 1010).map((x) => tree(x, rnd(516, 548), rnd(0.42, 0.85))).join('');
    // near trunks reaching the canopy — an uneven trio, the widest well off-centre
    b += bigTrunk(112, 30, 566, '#5e4832', '#7d6444');
    b += bigTrunk(322, 20, 556, '#66503a', '#83694a');
    b += bigTrunk(1044, 42, 574, '#57422d', '#75603f');
    if (c >= 4) b += bigTrunk(700, 16, 552, '#66503a', '#83694a');
    // full leafy canopy across the very top (carried by the trunks) — ragged lower edge
    b += scatter(10, -40, 1240).map((x) => foliageClump(x, rnd(-26, 42), rnd(1.5, 2.5), '#3d6833', '#578f45', '#79b25a')).join('');
    b += scatter(6, 40, 1160).map((x) => foliageClump(x, rnd(40, 92), rnd(0.95, 1.6), '#33582b', '#4b7a3c', '#659a4e')).join('');
    // dust motes in the light shafts
    b += motes(clampN(6, 14, 5 + c), 260, 980, 170, 430, '#f7ecb4');
    // foreground detail band
    b += roll(568, 7, '#3c6030');
    b += fallenLog(872, 588, 0.95) + mossPatch(902, 568, 1.0, '#6fa863');
    b += fallenLog(206, 582, 0.62) + mushroomCluster(252, 586, 0.85, '#b98a4a');
    b += mushroomCluster(818, 594, 1.0) + mushroom(930, 594, 0.9, '#b98a4a');
    if (c >= 2) b += mushroomCluster(586, 562, 0.7) + mushroom(468, 594, 0.85, '#d8956a');
    b += boulder(402, 592, 0.55, '#7c7466', '#968c7a') + mossPatch(396, 567, 0.9);
    if (c >= 3) b += boulder(1152, 598, 0.72, '#7c7466', '#968c7a') + mossPatch(1146, 566, 1.0);
    b += mossPatch(122, 566, 1.2, '#4b8a44') + mossPatch(1046, 574, 1.35, '#4b8a44');
    b += scatter(clampN(3, 7, 2 + Math.floor(c / 2)), 30, 1170).map((x) => foliageClump(x, rnd(566, 592), rnd(0.9, 1.5), '#33582b', '#4b7a3c', '#659a4e')).join('');
    b += scatter(4, 130, 1100).map((x) => fern(x, rnd(586, 600), rnd(0.7, 1.15))).join('');
    b += leafLitter(clampN(8, 16, 7 + c), 40, 1160, 560, 598);
    b += scatter(clampN(6, 12, 5 + c), 30, 1170).map((x) => grassTuft(x, rnd(574, 600), rnd(0.75, 1.25), pick(['#59904a', '#4f8340', '#65a054']))).join('');
    if (c >= 5) b += flower(505, 584, 0.9, '#e0698f') + flower(536, 590, 0.7, '#e0698f') + flower(884, 578, 0.8, '#f0d24e');
    return SVG(defs, b);
  }

  // ============ RIVER — boulder-lined stream, banks with trees, hazy mountains ============
  if (biome === 'river') {
    const defs = lg(P + 'vk', '#a2d4ee', '#eef6dd') + lg(P + 'vw', '#9fd8de', '#3f88a8') + lg(P + 'vg', '#7fa858', '#4e7c40') + fogDef(P + 'vfog', '#dcebe4');
    let b = `<rect width="${W}" height="${H}" fill="url(#${P}vk)"/>`;
    b += sun(950, 108, 52, '#fdf3cd');
    b += cloud(250, 96, 1.0) + cloud(560, 58, 0.7) + cloud(760, 128, 0.55) + cloud(1105, 88, 0.8);
    // distant hazy mountains — jagged, uneven heights, staggered depth
    b += crag(150, 300, 148, 394, '#c8d8e2', null, .9) + crag(430, 330, 218, 394, '#b9cdd9', '#e9f1f4') + crag(760, 250, 128, 394, '#cbdae2', null, .85) + crag(1040, 340, 188, 394, '#aec5d2', '#e9f1f4');
    b += fogRect(P + 'vfog', 300, 130);
    // far tree line on both banks — clustered, ragged
    b += roll(386, 6, '#a4c48c', .9);
    b += scatter(6, 10, 440).map((x) => `<g opacity="${rnd(.7, .95).toFixed(2)}">${pine(x, rnd(382, 396), rnd(0.36, 0.66), '#6f9a76', '#7fa886', '#90b696')}</g>`).join('');
    b += scatter(5, 750, 1190).map((x) => `<g opacity="${rnd(.7, .95).toFixed(2)}">${pine(x, rnd(382, 396), rnd(0.36, 0.66), '#6f9a76', '#7fa886', '#90b696')}</g>`).join('');
    // grassy banks
    b += roll(398, 6, `url(#${P}vg)`);
    // the river: narrow at the tree line, bending as it widens toward the camera
    b += `<path d="M560 396 Q542 446 500 492 Q446 546 428 600 L900 600 Q812 540 748 488 Q688 438 664 396 Z" fill="url(#${P}vw)"/>`;
    // rapids / small falls where the channel steps down
    b += `<path d="M540 450 Q600 462 686 448" stroke="#ffffff" stroke-width="7" fill="none" opacity=".5" stroke-linecap="round"/>`;
    b += `<path class="scene-caustic" style="--amp:14px;--dur:${rnd(8, 11).toFixed(1)}s" d="M512 498 Q590 512 716 496" stroke="#ffffff" stroke-width="8" fill="none" opacity=".55" stroke-linecap="round"/>`;
    b += `<path class="scene-caustic" style="--amp:18px;--dur:${rnd(10, 14).toFixed(1)}s;--delay:-4s" d="M470 554 Q620 572 810 550" stroke="#ffffff" stroke-width="9" fill="none" opacity=".5" stroke-linecap="round"/>`;
    b += `<ellipse cx="608" cy="464" rx="38" ry="7" fill="#ffffff" opacity=".35"/><ellipse cx="590" cy="514" rx="52" ry="8" fill="#ffffff" opacity=".3"/><ellipse cx="700" cy="540" rx="30" ry="6" fill="#ffffff" opacity=".25"/>`;
    b += glints(clampN(4, 8, 3 + c), 560, 800, 440, 560);
    // bank-edge highlights
    b += `<path d="M560 396 Q542 446 500 492 Q446 546 428 600" stroke="#c9dfa0" stroke-width="6" fill="none" opacity=".8"/><path d="M664 396 Q688 438 748 488 Q812 540 900 600" stroke="#c9dfa0" stroke-width="6" fill="none" opacity=".8"/>`;
    // boulders in irregular clusters on banks and midstream
    b += boulder(590, 428, 0.42, '#8f8878', '#aca293') + boulder(648, 438, 0.3, '#968d7c', '#b2a893');
    b += boulder(498, 514, 0.72, '#8f8878', '#aca293') + boulder(546, 522, 0.4, '#8a8272', '#a69c8b') + boulder(760, 512, 0.62, '#968d7c', '#b2a893');
    b += `<ellipse cx="640" cy="534" rx="46" ry="12" fill="#ffffff" opacity=".3"/>` + boulder(640, 544, 0.78, '#877f6f', '#a29886');
    // moss capping the damp boulders
    b += mossPatch(494, 481, 0.85, '#5d9456') + mossPatch(636, 510, 0.9, '#5d9456') + mossPatch(756, 484, 0.7, '#6fa863');
    if (c >= 3) b += boulder(452, 578, 1.0, '#8f8878', '#aca293') + boulder(842, 566, 0.66, '#877f6f', '#a29886') + boulder(884, 578, 0.92, '#8a8272', '#a69c8b') + mossPatch(446, 532, 1.0, '#5d9456');
    // pebble shoals lining the waterline on both banks
    b += pebbles(clampN(6, 12, 5 + c), 420, 520, 552, 596, '#9a9184', .7);
    b += pebbles(clampN(5, 10, 4 + c), 800, 900, 556, 598, '#8f8878', .65);
    // a drowned log wedged against the near bank, current rippling past
    if (c >= 2) b += halfLog(700, 578, 0.7);
    // trees on the banks — one big broadleaf off-centre left, staggered pines right
    b += tree(196, 466, 0.92, -2);
    b += scatter(clampN(1, 3, Math.floor(c / 3)), 70, 360).map((x) => tree(x, rnd(432, 470), rnd(0.45, 0.7))).join('');
    b += pine(846, 452, 0.88) + pine(902, 470, 0.6) + pine(1060, 444, 0.72);
    if (c >= 4) b += pine(1140, 470, 0.95) + tree(986, 462, 0.55);
    // foreground banks (rounded, sloping into the water)
    b += `<path d="M0 600 L0 552 Q150 540 288 562 Q356 576 408 600 Z" fill="#3f6533"/><path d="M1200 600 L1200 556 Q1064 546 950 570 Q902 582 878 600 Z" fill="#3f6533"/>`;
    b += rockCluster(140, 596, 0.9, '#7c7466', '#968c7a', 3) + boulder(1080, 598, 1.05, '#7c7466', '#968c7a') + mossPatch(1074, 550, 1.1, '#5d9456');
    b += fallenLog(70, 574, 0.6) + mushroomCluster(118, 578, 0.7, '#c96f52');
    b += fern(262, 592, 0.95) + fern(312, 598, 0.7) + fern(1008, 596, 0.85);
    if (c >= 4) b += fern(956, 588, 0.65, '#4a7a44') + fern(216, 584, 0.6);
    // grass overhanging the cut bank above the water
    b += grassTuft(424, 566, 0.9, '#59904a') + grassTuft(444, 582, 0.8, '#4f8340') + grassTuft(876, 572, 0.85, '#59904a') + grassTuft(858, 588, 0.75, '#4f8340');
    b += scatter(clampN(4, 8, 3 + Math.floor(c / 2)), 20, 380).map((x) => grassTuft(x, rnd(566, 600), rnd(0.8, 1.25), pick(['#59904a', '#4f8340']))).join('');
    b += scatter(clampN(3, 7, 2 + Math.floor(c / 2)), 890, 1180).map((x) => grassTuft(x, rnd(570, 600), rnd(0.8, 1.25), pick(['#59904a', '#4f8340']))).join('');
    b += reed(408, 574, 0.9) + reed(438, 590, 1.05) + reed(852, 588, 0.8);
    b += flowerDots(clampN(3, 7, 2 + c), 40, 330, 566, 594, ['#e0698f', '#f0d24e', '#ffffff']);
    return SVG(defs, b);
  }

  // ============ MOUNTAIN — jagged snowy ridges, pines, off-centre alpine lake ============
  if (biome === 'mountain') {
    const defs = lg(P + 'tk', '#93c3e6', '#eef3e2') + lg(P + 'tg', '#83a878', '#5b8a5c') + lg(P + 'tl', '#b8dce4', '#5f9ab4') + fogDef(P + 'tfog', '#dfe9ec');
    let b = `<rect width="${W}" height="${H}" fill="url(#${P}tk)"/>`;
    b += sun(210, 106, 54, '#fdf4d2');
    b += cloud(470, 76, 0.95) + cloud(700, 148, 0.6) + cloud(920, 108, 0.8) + cloud(1120, 60, 0.65);
    // far ridge — palest, uneven heights, some snowless
    b += crag(60, 320, 190, 420, '#c6d5e0', '#f0f5f8') + crag(360, 260, 132, 420, '#cddbe4', null, .95) + crag(640, 400, 252, 420, '#bdcedb', '#eef4f7') + crag(950, 240, 150, 420, '#cddbe4', null, .9) + crag(1170, 330, 216, 420, '#c6d5e0', '#f0f5f8');
    // mid ridge — sharper, staggered
    b += crag(300, 340, 246, 452, '#9db3c5', '#e9f1f5') + crag(770, 300, 186, 452, '#a6bac9', '#ecf3f6') + crag(1080, 350, 262, 452, '#93abbf', '#e6eff4');
    b += `<g class="scene-cloud" style="--amp:26px;--dur:${rnd(50, 70).toFixed(0)}s;--delay:-20s"><ellipse cx="560" cy="278" rx="150" ry="9" fill="#ffffff" opacity=".28"/><ellipse cx="880" cy="238" rx="95" ry="8" fill="#ffffff" opacity=".22"/><ellipse cx="300" cy="310" rx="80" ry="7" fill="#ffffff" opacity=".18"/></g>`;
    // near ridge — two big unequal masses framing an open middle
    b += crag(70, 340, 252, 486, '#7e97ac', '#e2ecf2') + crag(1110, 300, 198, 486, '#7590a6', '#e2ecf2');
    b += fogRect(P + 'tfog', 400, 90);
    // forested lower slopes — clustered, ragged tree line
    b += roll(474, 7, '#7fa382', .85);
    b += scatter(8, 20, 1180).map((x) => `<g opacity="${rnd(.65, .9).toFixed(2)}">${pine(x, rnd(470, 488), rnd(0.34, 0.62), '#5c8570', '#6d9680', '#7ea790')}</g>`).join('');
    b += roll(497, 6, `url(#${P}tg)`);
    b += scatter(clampN(4, 8, 3 + Math.floor(c / 2)), 40, 1160).map((x) => pine(x, rnd(498, 522), rnd(0.5, 0.95))).join('');
    // alpine lake pushed off-centre right, irregular shoreline
    b += `<path d="M330 548 Q560 512 830 520 Q1070 528 1150 552 Q980 584 640 580 Q430 576 330 548 Z" fill="url(#${P}tl)"/>`;
    b += `<ellipse cx="740" cy="540" rx="300" ry="14" fill="#ffffff" opacity=".26"/>`;
    b += `<ellipse cx="480" cy="556" rx="56" ry="7" fill="#eef6f8" opacity=".35"/><ellipse cx="920" cy="552" rx="48" ry="6" fill="#eef6f8" opacity=".3"/>`;
    b += `<path class="scene-caustic" style="--amp:20px;--dur:${rnd(10, 14).toFixed(0)}s" d="M480 552 q100 6 200 0 q100 -6 200 0" stroke="#ffffff" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>`;
    b += glints(clampN(3, 6, 2 + c), 420, 1060, 534, 566);
    // lakeside pines — a clustered stand on the left shore, singles right
    b += pine(226, 566, 1.0) + pine(288, 580, 0.72) + pine(178, 588, 0.6);
    if (c >= 3) b += pine(1032, 572, 0.85) + pine(1102, 588, 0.55);
    // foreground detail band
    b += roll(578, 7, '#4d7a50');
    b += rockCluster(340, 600, 0.95, '#8b93a0', '#a9b1bd', 3) + mossPatch(318, 560, 0.9, '#6da060');
    b += boulder(940, 602, 1.05, '#7f8794', '#9aa2af');
    if (c >= 2) b += boulder(1024, 594, 0.5, '#8b93a0', '#a9b1bd');
    // scree fans spilling off the rock piles + lingering snow patches
    b += scree(clampN(7, 14, 6 + c), 240, 470, 584, 602, '#8b93a0', '#a9b1bd');
    b += scree(clampN(5, 10, 4 + c), 880, 1090, 586, 602, '#7f8794', '#9aa2af');
    b += `<ellipse cx="590" cy="590" rx="46" ry="7" fill="#eef4f7" opacity=".75"/><ellipse cx="636" cy="596" rx="24" ry="5" fill="#f6fafc" opacity=".65"/><ellipse cx="120" cy="586" rx="34" ry="6" fill="#eef4f7" opacity=".6"/>`;
    // hardy alpine shrubs hugging the ground
    b += bush(700, 590, 0.55, '#4d7a50', '#5d8a5c', '#6d9a68') + bush(80, 594, 0.48, '#456e4a', '#527c52', '#5d8a5c');
    if (c >= 3) b += bush(1130, 592, 0.5, '#4d7a50', '#5d8a5c', '#6d9a68') + dryShrub(508, 594, 0.8, '#7a8a58');
    b += pebbles(clampN(5, 10, 4 + c), 80, 1120, 584, 600, '#7f8794', .5);
    b += scatter(clampN(5, 11, 4 + c), 20, 1180).map((x) => grassTuft(x, rnd(580, 602), rnd(0.75, 1.25), pick(['#5d8f58', '#6da060', '#527f4c']))).join('');
    if (c >= 5) b += flower(452, 592, 0.8, '#7b6fb0') + flower(484, 598, 0.65, '#7b6fb0') + flower(788, 596, 0.8, '#e0698f');
    return SVG(defs, b);
  }

  // ============ MEADOW — rolling hills, wildflower drifts, big soft sky ============
  if (biome === 'meadow') {
    const cols = ['#e0698f', '#e8a23c', '#7b6fb0', '#d65b5b', '#f0d24e'];
    const defs = lg(P + 'mk', '#8ec6e6', '#f0f4dc') + lg(P + 'mg', '#9cc06a', '#74a24c');
    let b = `<rect width="${W}" height="${H}" fill="url(#${P}mk)"/>`;
    b += sun(230, 124, 56, '#fdeec2');
    b += cloud(470, 84, 1.0) + cloud(690, 150, 0.6) + cloud(890, 108, 0.85) + cloud(1100, 62, 0.7) + cloud(340, 186, 0.5);
    // distant hazy hills — overlapping, unequal
    b += dome(150, 380, 108, 412, '#b4ccd6', .8) + dome(520, 300, 64, 414, '#c7dade', .8) + dome(830, 420, 92, 412, '#bcd2da', .8) + dome(1180, 280, 70, 414, '#c2d6dc', .75);
    // rolling green hills, crests at different heights
    b += roll(404, 14, '#b4d18e');
    b += scatter(5, 220, 1160).map((x) => `<g opacity="${rnd(.75, .95).toFixed(2)}">${tree(x, rnd(398, 414), rnd(0.24, 0.44))}</g>`).join('');
    b += `<path d="M0 476 Q240 416 540 456 Q860 494 1200 434 V600 H0 Z" fill="#a3c477"/>`;
    b += roll(488, 12, `url(#${P}mg)`);
    // one grand oak well off-centre + unequal companions
    b += tree(330, 526, 1.4, -2);
    b += tree(958, 504, 0.68) + tree(1042, 516, 0.48);
    if (c >= 4) b += tree(700, 498, 0.42);
    // scattered rounded bushes, bunched irregularly
    b += bush(452, 516, 0.85) + bush(516, 524, 0.55) + bush(872, 522, 0.65);
    if (c >= 2) b += bush(120, 532, 0.75) + bush(1160, 528, 0.6);
    // a small spring pond catching the light, rimmed with reeds
    b += `<path d="M660 540 Q740 528 826 536 Q868 540 880 548 Q812 560 724 558 Q672 554 660 540 Z" fill="#8fc0c4" opacity=".9"/>`;
    b += `<path d="M672 540 Q740 531 818 538" stroke="#ffffff" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>`;
    b += glints(3, 690, 850, 538, 552);
    b += reed(652, 546, 0.65) + reed(886, 552, 0.6) + grassTuft(700, 560, 0.8, '#59904a');
    // lichen-speckled rocks breaking through the turf + a mossy fallen branch
    b += rockCluster(150, 566, 0.72, '#98917e', '#b2ab96', 2) + boulder(1084, 560, 0.55, '#98917e', '#b2ab96') + mossPatch(1080, 535, 0.8, '#6da060');
    if (c >= 3) b += boulder(586, 552, 0.4, '#a09986', '#b8b19c');
    b += fallenLog(84, 596, 0.55) + mushroomCluster(126, 598, 0.6, '#b98a4a');
    // wildflowers in colour drifts (each patch one family, like real seed spread)
    for (const [px, pc] of [[rnd(120, 300), cols[0]], [rnd(520, 700), cols[4]], [rnd(880, 1080), cols[2]]]) {
      b += scatter(clampN(3, 6, 2 + Math.floor(c / 2)), px - 90, px + 90).map((x) => flower(x, rnd(544, 592), rnd(0.75, 1.2), pc)).join('');
      b += flowerDots(6, px - 110, px + 110, 540, 590, [pc, '#ffffff']);
    }
    b += flowerDots(clampN(8, 18, 6 + c * 2), 40, 1160, 508, 560, cols);
    // foreground detail band
    b += roll(572, 8, '#639346');
    b += scatter(clampN(8, 16, 7 + c), 20, 1180).map((x) => grassTuft(x, rnd(578, 602), rnd(0.75, 1.3), pick(['#4f8340', '#59904a', '#447538']))).join('');
    b += scatter(clampN(3, 7, 2 + Math.floor(c / 2)), 60, 1140).map((x, i) => flower(x, rnd(584, 602), rnd(0.9, 1.3), cols[(i + 2) % cols.length])).join('');
    return SVG(defs, b);
  }

  // ============ WETLAND — calm water, reed beds, lily rafts, grassy banks ============
  if (biome === 'wetland') {
    const defs = lg(P + 'wk', '#a9d2dd', '#e9f2da') + lg(P + 'ww', '#a8cec6', '#5e948e') + fogDef(P + 'wfog', '#dcebe2');
    let b = `<rect width="${W}" height="${H}" fill="url(#${P}wk)"/>`;
    b += sun(880, 118, 50, '#fdf3d0');
    b += cloud(290, 84, 0.9) + cloud(560, 128, 0.6) + cloud(680, 58, 0.75) + cloud(1090, 96, 0.55);
    // distant hazy tree line — ragged clumps
    b += roll(352, 6, '#adc9a4', .75);
    b += scatter(8, -20, 1220).map((x) => `<g opacity="${rnd(.4, .65).toFixed(2)}">${foliageClump(x, rnd(322, 350), rnd(0.7, 1.4), '#93b48c', '#a5c49c', '#b8d4ac')}</g>`).join('');
    b += fogRect(P + 'wfog', 300, 110);
    // grassy far bank with unequal trees + a weathered snag
    b += roll(374, 6, '#8fb56d');
    b += tree(128, 384, 0.78, -3) + tree(196, 380, 0.5);
    b += tree(1076, 382, 0.6);
    b += snag(940, 380, 0.85);
    if (c >= 3) b += tree(852, 378, 0.44);
    b += scatter(7, 240, 1010).map((x) => grassTuft(x, rnd(366, 382), rnd(0.55, 0.95), pick(['#6f9a55', '#7fa860']))).join('');
    // calm water
    b += `<rect y="380" width="${W}" height="${H - 380}" fill="url(#${P}ww)"/>`;
    b += `<ellipse cx="600" cy="384" rx="560" ry="7" fill="#ffffff" opacity=".3"/>`;
    b += caustics(390);
    b += caustics(470, 3, .12);
    // reflections beneath the trees and the sun
    b += `<ellipse cx="130" cy="402" rx="44" ry="9" fill="#5d7a4e" opacity=".3"/><ellipse cx="1076" cy="400" rx="36" ry="8" fill="#5d7a4e" opacity=".3"/><ellipse cx="940" cy="398" rx="26" ry="6" fill="#6b6a54" opacity=".3"/>`;
    b += glints(clampN(4, 8, 3 + c), 760, 1020, 400, 470);
    // mud spits — a long one left, a small one right (nothing mirrored)
    b += `<path d="M0 468 Q190 450 370 468 Q210 486 0 488 Z" fill="#6f5a44" opacity=".9"/>`;
    b += `<path d="M1200 512 Q1100 502 1010 514 Q1110 524 1200 526 Z" fill="#66523e" opacity=".85"/>`;
    b += reed(320, 470, 0.7) + reed(1052, 516, 0.6);
    b += pebbles(5, 60, 300, 470, 484, '#8a7458', .55) + grassTuft(150, 476, 0.6, '#6f9a55') + grassTuft(240, 480, 0.5, '#7fa860');
    // a waterlogged log leaning out of the shallows, moss still clinging on
    b += halfLog(760, 524, 1.0);
    if (c >= 2) b += halfLog(180, 542, 0.7);
    // floating vegetation mats drifting in the slack water
    b += vegMat(568, 470, 0.9) + vegMat(892, 500, 0.7);
    if (c >= 3) b += vegMat(340, 522, 0.8);
    // lily rafts — clustered, gently bobbing
    b += scatter(clampN(3, 7, 2 + Math.floor(c / 2)), 300, 1000).map((x) => lily(x, rnd(452, 548), rnd(0.85, 1.35))).join('');
    b += lily(452, 500, 0.7) + lily(496, 516, 1.0) + lily(1088, 462, 0.8) + lily(1042, 478, 0.55);
    // reed beds — a dense stand left, sparse singles right
    b += scatter(clampN(4, 8, 3 + Math.floor(c / 2)), 40, 330).map((x) => reed(x, rnd(458, 494), rnd(0.8, 1.2))).join('');
    b += scatter(clampN(2, 4, 1 + Math.floor(c / 3)), 920, 1160).map((x) => reed(x, rnd(428, 468), rnd(0.7, 1.05))).join('');
    // dark foreground bank with cattail fringe
    b += roll(562, 8, '#4a6b3d');
    b += scatter(clampN(5, 9, 4 + Math.floor(c / 2)), 30, 1170).map((x) => reed(x, rnd(584, 606), rnd(0.9, 1.35))).join('');
    b += scatter(clampN(5, 9, 4 + c), 80, 1120).map((x) => grassTuft(x, rnd(576, 600), rnd(0.85, 1.25), pick(['#5d8a4a', '#527c42']))).join('');
    b += fern(680, 596, 0.8, '#4a7a44');
    if (c >= 4) b += flower(560, 592, 0.8, '#e89ab8') + flower(590, 598, 0.6, '#e89ab8');
    return SVG(defs, b);
  }

  // ============ SAVANNA — acacias, golden grass, kopje rocks, distant blue ridges ============
  if (biome === 'savanna') {
    const defs = lg(P + 'sk', '#a8d2e8', '#f6e4b4') + lg(P + 'sg', '#e0bc6e', '#c49a50');
    let b = `<rect width="${W}" height="${H}" fill="url(#${P}sk)"/>`;
    b += sun(260, 130, 62, '#f8dfa0', true);
    b += cloud(590, 76, 0.9) + cloud(830, 130, 0.6) + cloud(1040, 94, 0.75);
    // distant blue ridges — jagged, unequal, staggered
    b += crag(180, 300, 118, 416, '#a8c2d6', null, .85) + crag(490, 260, 88, 416, '#b4cbdc', null, .8) + crag(760, 330, 148, 416, '#9fbcd2') + crag(1100, 280, 108, 416, '#95b4cc', null, .9);
    // dry golden plains with tonal patches
    b += roll(412, 7, '#e6c584', .95);
    b += `<ellipse cx="380" cy="452" rx="200" ry="16" fill="#f0d494" opacity=".55"/><ellipse cx="900" cy="470" rx="240" ry="18" fill="#d4ac60" opacity=".45"/>`;
    b += `<g opacity=".75">${acacia(884, 448, 0.48)}${acacia(190, 452, 0.4)}${acacia(300, 446, 0.3)}${acacia(608, 444, 0.34)}</g>`;
    b += roll(456, 8, `url(#${P}sg)`);
    // a shallow waterhole tucked left of centre, catching the light
    b += `<path d="M300 512 Q400 498 520 508 Q580 514 600 522 Q520 536 400 534 Q320 530 300 512 Z" fill="#8fc0c4" opacity=".9"/>`;
    b += `<path d="M310 514 Q400 502 516 511" stroke="#ffffff" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>`;
    b += glints(3, 340, 560, 508, 528);
    b += `<path d="M300 512 Q290 518 296 524 M600 522 Q612 526 604 530" stroke="#8a6e3c" stroke-width="4" fill="none" opacity=".5"/>`;
    // main acacias — one grand tree right of centre, unequal partners
    b += acacia(868, 574, 1.55);
    b += acacia(292, 540, 0.85) + acacia(392, 524, 0.55);
    if (c >= 4) b += acacia(640, 530, 0.62);
    b += termiteMound(500, 566, 1.0) + termiteMound(1148, 552, 0.7);
    if (c >= 3) b += termiteMound(742, 540, 0.55);
    // a lightning-killed snag and sun-bleached fallen wood
    b += snag(1008, 548, 0.9);
    b += bleachedBranch(596, 590, 1.0, '#d8c9a4') + bleachedBranch(206, 596, 0.7, '#cdbd96');
    // kopje — a weathered rock cluster off to the left
    b += rockCluster(120, 574, 1.1, '#a0885c', '#b8a072', 3);
    if (c >= 3) b += boulder(676, 586, 0.72, '#a0885c', '#b8a072');
    if (c >= 4) b += rockCluster(1090, 588, 0.6, '#a0885c', '#b8a072', 2);
    // dry bushes bunched irregularly
    b += bush(452, 546, 0.7, '#8a8a44', '#9a9a50', '#aaa85c') + bush(1042, 542, 0.55, '#8a8a44', '#9a9a50', '#aaa85c');
    if (c >= 2) b += bush(226, 552, 0.62, '#8a8a44', '#9a9a50', '#aaa85c') + dryShrub(756, 560, 1.0);
    // foreground golden grass band — thick, wind-brushed
    b += roll(568, 8, '#b08c46');
    b += scatter(clampN(10, 18, 9 + c), 20, 1180).map((x) => grassTuft(x, rnd(556, 600), rnd(0.8, 1.4), pick(['#caa552', '#d8b45e', '#b8944a']))).join('');
    b += scatter(clampN(6, 10, 5 + Math.floor(c / 2)), 60, 1140).map((x) => grassTuft(x, rnd(582, 604), rnd(0.9, 1.3), pick(['#9a7c3a', '#8a6e32']))).join('');
    b += dryShrub(340, 596, 0.9, '#8a7440') + dryShrub(986, 600, 1.1);
    b += pebbles(clampN(4, 8, 3 + c), 160, 1040, 574, 598, '#9a7c48', .6);
    return SVG(defs, b);
  }

  // ============ DESERT — wind-built dunes of unequal size, warm light, sparse life ============
  if (biome === 'desert') {
    const defs = lg(P + 'dk', '#4f9de0', '#c4e6f4') + lg(P + 'ddn', '#f6cf6e', '#df9f4c') + lg(P + 'dd', '#f2c25e', '#dfa04c');
    let b = `<rect width="${W}" height="${H}" fill="url(#${P}dk)"/>`;
    b += sun(690, 100, 44, '#fdf2c4', true);
    b += cloud(200, 66, 0.9) + cloud(410, 138, 0.55) + cloud(920, 84, 0.8) + cloud(1130, 158, 0.5);
    b += sparkles(9, 30, 240, '#ffffff');
    // red-rock mesas towering on the horizon, dune crests lapping their feet
    b += mesa(520, 310, 258, 456, '#d89058', '#b87040', .92) + mesa(858, 230, 178, 456, '#cc8450', '#aa6636', .85);
    if (c >= 2) b += mesa(680, 150, 118, 456, '#e0a068', '#c08050', .7);
    // distant dune crests in the gap — unequal, overlapping
    b += dome(480, 320, 130, 452, '#f4d489', .9) + dome(742, 210, 82, 452, '#eec06a', .95) + dome(330, 170, 60, 454, '#f0c874', .95) + dome(940, 150, 52, 454, '#ecc06e', .9);
    // big dunes — a tall one left, a lower broad one right (never twins)
    b += dome(-90, 500, 372, 470, `url(#${P}ddn)`) + dome(1290, 400, 250, 470, `url(#${P}ddn)`);
    // sunlit windward faces + shaded lee sides
    b += mound(-170, 450, 330, 472, '#fbe098', .5) + mound(1370, 340, 218, 472, '#fbe098', .4);
    b += mound(160, 250, 200, 472, '#c98a44', .35) + mound(1130, 200, 150, 472, '#c98a44', .3);
    // warm accent stripe at the dune bases
    b += `<path d="M0 466 Q300 452 620 462 T1200 456 l0 14 Q880 480 600 474 T0 480 Z" fill="#e2795a" opacity=".45"/>`;
    // sandy field
    b += roll(472, 8, `url(#${P}dd)`);
    b += `<path d="M0 540 Q260 516 540 534 Q840 552 1200 520 V556 Q860 586 560 568 Q280 552 0 574 Z" fill="#f8d67e" opacity=".75"/>`;
    b += roll(574, 7, '#d59a48');
    // wind ripple lines combed across the sand
    b += ripples(500, 4, '#c98a44', .35, 100, 1050);
    b += ripples(556, 3, '#b87c3c', .3, 60, 1000);
    // second accent stripe on the near sand
    b += `<path d="M0 560 Q300 548 640 558 T1200 552 l0 8 Q880 570 600 566 T0 568 Z" fill="#dd8560" opacity=".4"/>`;
    // dark rounded rocks — a cluster low left, a lone giant right of centre
    b += rockCluster(120, 598, 1.1, '#6e4634', '#8a5c42', 3);
    b += boulder(1076, 600, 1.45, '#66412f', '#82573e') + boulder(1176, 592, 0.6, '#7a4f3a', '#96684c');
    if (c >= 3) b += boulder(700, 586, 0.55, '#7a4f3a', '#96684c');
    b += pebbles(clampN(6, 13, 5 + c), 220, 1020, 506, 596, '#b97e42', .8);
    // a dry wash (sun-cracked streambed) snaking across the foreground
    b += `<path d="M0 588 Q180 574 380 582 Q620 592 830 580 Q1020 572 1200 584 L1200 606 Q980 594 800 600 Q560 610 340 602 Q150 596 0 606 Z" fill="#e8c88a" opacity=".85"/>`;
    b += `<path d="M40 592 q60 -4 120 -1 M300 594 q80 4 170 1 M700 590 q90 -5 180 -2" stroke="#c99a54" stroke-width="2.5" fill="none" opacity=".5" stroke-linecap="round"/>`;
    b += pebbles(clampN(8, 16, 7 + c), 40, 1160, 584, 602, '#a98a54', .75);
    // sparse desert life: saguaros, barrels, prickly pear, dry shrubs, hardy grass
    b += cactus(884, 560, 1.05) + cactus(806, 540, 0.6);
    if (c >= 2) b += cactus(232, 528, 0.5);
    b += barrelCactus(316, 572, 1.1) + pricklyPear(508, 566, 1.0);
    if (c >= 3) b += barrelCactus(672, 552, 0.8) + pricklyPear(1010, 556, 0.75);
    b += bleachedBranch(444, 596, 0.95);
    b += dryShrub(420, 566, 1.0, '#8a7440') + dryShrub(560, 594, 1.2) + dryShrub(958, 576, 0.8, '#8a7440');
    b += scatter(clampN(6, 12, 5 + Math.floor(c / 2)), 120, 1080).map((x) => grassTuft(x, rnd(512, 600), rnd(0.65, 1.05), pick(['#5d8a3c', '#9a8448', '#7a9a44']))).join('');
    b += sparkles(6, 480, 590, '#fff3c8');
    return SVG(defs, b);
  }

  // ============ COASTAL — beach, gentle sea, headland + offshore sea stack ============
  if (biome === 'coastal') {
    const defs = lg(P + 'ck', '#8ec6e6', '#f2ecd2') + lg(P + 'cw', '#8cc8d8', '#3f7d9c') + lg(P + 'cs', '#f0e2ba', '#d8c493');
    let b = `<rect width="${W}" height="${H}" fill="url(#${P}ck)"/>`;
    b += sun(920, 108, 58, '#fdf3d5');
    b += cloud(250, 78, 1.0) + cloud(560, 56, 0.7) + cloud(700, 130, 0.5) + cloud(1090, 148, 0.6);
    // sea
    b += `<rect y="316" width="${W}" height="170" fill="url(#${P}cw)"/>`;
    b += `<rect y="316" width="${W}" height="5" fill="#ffffff" opacity=".4"/>`;
    // distant island haze — two unequal humps
    b += mound(880, 140, 28, 321, '#a9c2ce', .7) + mound(1060, 70, 12, 320, '#b4cbd6', .6);
    // sun's glitter path on the water
    b += glints(clampN(6, 12, 5 + c), 830, 1030, 330, 470);
    // waves + foam (behind the headland)
    b += foam(338);
    // offshore sea stack rising out of the water — broad worn base, narrower crown
    b += `<path d="M646 472 Q650 420 658 386 Q664 352 682 336 Q700 324 716 340 Q732 358 736 396 Q740 434 748 472 Z" fill="#8a7b68"/>`;
    b += `<path d="M748 472 Q740 434 736 396 Q732 358 716 340 Q722 384 718 420 Q714 450 712 472 Z" fill="#6f6152" opacity=".85"/>`;
    b += `<path d="M664 372 q18 -26 40 -18 M658 408 q10 6 22 8" stroke="#5f5344" stroke-width="3" fill="none" opacity=".45"/>`;
    b += foliageClump(694, 330, 0.55, '#4b7a3c', '#5f944a', '#78ac5a') + grassTuft(716, 342, 0.6, '#5f944a');
    // a low companion rock beside it (unequal pair, like real stacks)
    b += `<path d="M778 474 Q780 448 792 438 Q804 432 812 444 Q820 458 822 474 Z" fill="#7e7060"/>`;
    b += `<ellipse cx="696" cy="472" rx="40" ry="6" fill="#ffffff" opacity=".5"/><ellipse cx="800" cy="474" rx="22" ry="4" fill="#ffffff" opacity=".45"/>`;
    // rocky headland rising out of the sea at the left, grass on its top
    b += `<path d="M0 420 L0 178 Q60 170 104 196 Q158 228 172 286 Q190 342 232 380 Q258 402 268 420 Z" fill="#8a7b68"/>`;
    b += `<path d="M0 420 L0 300 Q60 316 104 348 Q160 384 200 404 Q230 416 246 420 Z" fill="#6f6152" opacity=".85"/>`;
    b += `<path d="M12 182 Q52 176 88 196 Q120 214 138 246 Q108 232 72 214 Q38 198 12 196 Z" fill="#a5967f" opacity=".8"/>`;
    b += `<path d="M30 260 q30 14 54 40 M18 224 q24 8 46 26" stroke="#5f5344" stroke-width="3" fill="none" opacity=".5"/>`;
    b += foliageClump(34, 172, 1.1, '#4b7a3c', '#5f944a', '#78ac5a') + foliageClump(110, 196, 0.8, '#44703a', '#578a46', '#6fa254');
    b += grassTuft(150, 232, 0.8, '#5f944a') + grassTuft(66, 178, 0.7, '#5f944a');
    // foam clinging to the rocks' waterlines
    b += `<g fill="#ffffff" opacity=".55"><ellipse cx="252" cy="398" rx="30" ry="6"/><ellipse cx="286" cy="410" rx="24" ry="5"/><ellipse cx="222" cy="388" rx="18" ry="4"/><ellipse cx="668" cy="474" rx="18" ry="4"/><ellipse cx="722" cy="476" rx="14" ry="3.5"/></g>`;
    b += `<path class="scene-caustic" style="--amp:22px;--dur:${rnd(9, 12).toFixed(1)}s" d="M60 452 q140 -14 300 0 q160 14 320 0 q160 -12 340 0" stroke="#ffffff" stroke-width="8" fill="none" opacity=".65" stroke-linecap="round"/>`;
    // beach — wet sand band, then dry sand, shoreline curving unevenly
    b += `<path d="M0 490 Q310 458 700 482 Q980 496 1200 464 V600 H0 Z" fill="#c9b48c" opacity=".9"/>`;
    b += `<path class="scene-caustic" style="--amp:16px;--dur:${rnd(11, 15).toFixed(1)}s;--delay:-5s" d="M40 492 Q340 466 700 488 Q980 500 1180 472" stroke="#ffffff" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/>`;
    b += roll(510, 10, `url(#${P}cs)`);
    b += ripples(528, 3, '#c2a878', .5, 60, 1000);
    // wrack line: stranded seaweed scraps along the tide mark
    b += scatter(6, 100, 1100).map((x) => `<path d="M${x.toFixed(0)} ${rnd(516, 534).toFixed(0)} q${rnd(8, 16).toFixed(0)} ${rnd(-5, 5).toFixed(0)} ${rnd(20, 34).toFixed(0)} 0" stroke="#6b7a44" stroke-width="3.5" fill="none" opacity=".55" stroke-linecap="round"/>`).join('');
    // beach details — tide pools, driftwood, shells, pebbles, dune grass massed to the right
    b += tidePool(258, 596, 1.0);
    if (c >= 3) b += tidePool(700, 588, 0.7);
    b += driftwood(420, 566, 1.0);
    if (c >= 4) b += driftwood(950, 552, 0.6);
    b += rockCluster(1080, 592, 0.95, '#8a8072', '#a69c8a', 3);
    if (c >= 2) b += boulder(170, 566, 0.7, '#8a8072', '#a69c8a');
    b += seastar(530, 578, 0.8, '#e8734a');
    if (c >= 3) b += `<g opacity=".9">${shellProp(330, 560, 1)}${shellProp(586, 588, 0.85)}${shellProp(760, 570, 0.75)}${shellProp(902, 582, 0.9)}</g>`;
    if (c >= 5) b += seastar(838, 592, 0.6, '#e06a9a') + shellProp(478, 594, 0.7);
    b += pebbles(clampN(5, 11, 4 + c), 200, 1000, 544, 596, '#b09a72', .6);
    b += scatter(clampN(6, 11, 5 + Math.floor(c / 2)), 860, 1190).map((x) => grassTuft(x, rnd(548, 598), rnd(0.95, 1.4), pick(['#9aa45a', '#aab464']))).join('');
    b += scatter(5, 30, 420).map((x) => grassTuft(x, rnd(550, 598), rnd(0.7, 1.1), pick(['#9aa45a', '#8a9450']))).join('');
    b += sparkles(5, 500, 580, '#fff6d8');
    return SVG(defs, b);
  }

  // ============ REEF — bright shallows crowded with coral, anemones, sea stars ============
  if (biome === 'reef') {
    const defs = lg(P + 'rw', '#b8e8ee', '#3f93b0') + lg(P + 'rs', '#efe3b6', '#cdbf8f');
    let b = `<rect width="${W}" height="${H}" fill="url(#${P}rw)"/>` + rays(.45, .75) + caustics(90) + caustics(280, 4, .12);
    // distant reef silhouettes on the sea floor — ragged, unequal
    b += roll(488, 8, '#3f7d8c', .45);
    b += scatter(6, 140, 1060).map((x) => `<g opacity="${rnd(.3, .5).toFixed(2)}">${coral(x, rnd(498, 512), rnd(0.4, 0.75), '#6f95a0', '#5f8590')}</g>`).join('');
    // sandy seabed
    b += roll(516, 9, `url(#${P}rs)`);
    b += ripples(546, 3, '#b8a878', .45, 80, 1050);
    // pastel coral-gravel patches on the sand
    b += `<ellipse cx="430" cy="560" rx="120" ry="10" fill="#e8c8b0" opacity=".5"/><ellipse cx="860" cy="576" rx="150" ry="12" fill="#d8b8c8" opacity=".4"/>`;
    b += pebbles(8, 160, 1060, 548, 596, '#c9b490', .6);
    // rock walls — asymmetric: low broad left, tall narrow right, encrusted with life
    b += seaWall(150, 246, '#4f7a86', '#68929e');
    b += mirror(seaWall(200, 178, '#456e7a', '#5e8894'));
    // encrusting coral + sponges growing on the rock faces
    b += `<g opacity=".85"><circle cx="52" cy="330" r="14" fill="#e8734a"/><circle cx="88" cy="416" r="10" fill="#e06a9a"/><circle cx="40" cy="480" r="12" fill="#e8b23c"/><ellipse cx="70" cy="540" rx="16" ry="9" fill="#8e6ac0"/></g>`;
    b += `<g opacity=".85"><circle cx="1148" cy="290" r="12" fill="#e8a23c"/><circle cx="1108" cy="380" r="14" fill="#d4524e"/><circle cx="1160" cy="452" r="10" fill="#3cb8a0"/><ellipse cx="1120" cy="520" rx="15" ry="8" fill="#e06a9a"/></g>`;
    b += seafan(104, 470, 0.7, '#e8a23c') + anemone(1136, 440, 0.6, '#e06a9a', '#f6a8c8');
    // life growing off the walls' feet
    b += seaweedTuft(64, 596, 1.15, '#3c8a62') + kelp(118, 600, 0.85) + anemone(96, 588, 0.7, '#e8b23c', '#f6d47a');
    b += kelp(1088, 600, 0.95, '#357a58') + seaweedTuft(1150, 598, 1.0, '#7a4460') + tubeCoral(1042, 596, 0.9, '#e8b23c', '#c98a2c');
    // bubbles rising from the reef
    b += bubbles(300, 470, 5) + bubbles(870, 500, 6) + bubbles(560, 520, 4, 0.8) + bubbles(1010, 540, 3, 0.7);
    // fish
    b += school(300, 200, 8, '#e8f4f8') + school(740, 140, 7, '#dceef4');
    if (c >= 3) b += school(540, 330, 9, '#cfe6ee');
    // the coral garden: two big unequal banks + loners between (grows with collection)
    const cc = [['#e8734a', '#c9532e'], ['#e8a23c', '#c9822c'], ['#e06a9a', '#bd4a76'], ['#8e6ac0', '#6f4ea0'], ['#d4524e', '#b03a38']];
    // left bank — dense mixed cluster
    b += brainCoral(268, 588, 1.1, '#e8a23c', '#c9822c');
    b += coral(346, 592, 1.2, '#e8734a', '#c9532e');
    b += tubeCoral(212, 594, 1.05, '#3cb8a0', '#2a9484');
    b += anemone(408, 586, 0.95, '#e06a9a', '#f6a8c8');
    if (c >= 2) b += seafan(178, 588, 0.9, '#c9538e');
    // right bank — taller, different mix
    b += coral(872, 596, 1.35, '#8e6ac0', '#6f4ea0');
    b += brainCoral(956, 592, 0.85, '#d4524e', '#e88a80');
    b += anemone(806, 590, 1.1, '#3cb8a0', '#8ae0cc');
    b += tubeCoral(920, 600, 0.8, '#e8734a', '#c9532e');
    if (c >= 4) b += seafan(760, 592, 1.05, '#aa5573');
    // mid-floor loners + count-scaled extras
    b += scatter(clampN(2, 6, 1 + Math.floor(c / 2)), 460, 740).map((x, i) => coral(x, rnd(566, 596), rnd(0.6, 1.0), cc[i % cc.length][0], cc[i % cc.length][1])).join('');
    b += seastar(520, 588, 1.0, '#e8734a') + seastar(672, 596, 0.75, '#e06a9a');
    if (c >= 2) b += seastar(1104, 588, 0.8, '#e8a23c');
    b += urchin(444, 594, 0.8) + urchin(940, 588, 0.65);
    b += seaweedTuft(590, 600, 0.9, '#3c8a62') + seaweedTuft(710, 596, 0.7, '#5aa04a');
    // seagrass bed swaying in the surge channel + scattered shells
    b += seaweedTuft(640, 604, 0.6, '#4a9a5a') + seaweedTuft(496, 602, 0.65, '#3c8a62');
    b += `<g opacity=".85">${shellProp(478, 592, 0.8)}${shellProp(742, 590, 0.7)}</g>`;
    if (c >= 3) b += shellProp(1002, 594, 0.75);
    if (c >= 5) b += anemone(614, 592, 0.7, '#e8b23c', '#f6d47a') + tubeCoral(548, 600, 0.7, '#e06a9a', '#bd4a76');
    return SVG(defs, b);
  }

  // ============ DEEPSEA — dark depths, vent chimneys, sparse living glow ============
  if (biome === 'deepsea') {
    const defs = `<linearGradient id="${P}zk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16405e"/><stop offset="0.5" stop-color="#0c2440"/><stop offset="1" stop-color="#061224"/></linearGradient>` + lg(P + 'zr', '#1a3a52', '#0e2436');
    let b = `<rect width="${W}" height="${H}" fill="url(#${P}zk)"/>`;
    b += `<g opacity=".55">${rays(.2, .4)}</g>`;
    // marine snow + sparse glowing plankton — scale with discoveries
    for (let i = 0; i < clampN(8, 20, 7 + c * 2); i++) b += glowDot(rnd(40, 1160).toFixed(0), rnd(60, 520).toFixed(0), rnd(1.4, 3).toFixed(1), ['#67e0c4', '#5bc9e8', '#9d8fc2', '#e0d27a'][i % 4]);
    b += `<g opacity=".5">${sparkles(10, 80, 480, '#8fb4c9')}</g>`;
    // a faint school of deep fish passing far off in the gloom
    b += `<g opacity=".8">${school(420, 240, 7, '#2a5a74')}</g>`;
    if (c >= 3) b += `<g opacity=".65">${school(860, 340, 6, '#26526a')}</g>`;
    b += bubbles(240, 480, 5, 0.8) + bubbles(920, 500, 4, 0.9);
    // seabed — uneven silty floor
    b += roll(514, 9, `url(#${P}zr)`);
    b += ripples(548, 3, '#1c3a50', .5, 100, 1000);
    // rocky outcrops in an irregular group
    b += rockCluster(320, 590, 1.15, '#132c3e', '#1c3a4e', 3);
    b += boulder(850, 596, 1.35, '#102636', '#183446');
    if (c >= 2) b += boulder(950, 586, 0.6, '#132c3e', '#1c3a4e');
    // hydrothermal vents with shimmering glow + tube worm colonies at their feet
    b += ventChimney(560, 588, 1.1, '#1c3648', '#26445a', '#67e0c4');
    b += ventChimney(668, 596, 0.7, '#183042', '#223e52', '#5bc9e8');
    b += tubeWorms(618, 594, 1.0, '#3a5a6c', '#e08a8a');
    if (c >= 3) b += tubeWorms(516, 598, 0.8, '#345264', '#e08a8a');
    // glowing anemones nestled by the rocks
    b += anemone(392, 592, 0.8, '#2a6a7a', '#67e0c4');
    if (c >= 4) b += anemone(908, 590, 0.7, '#2a5a7a', '#5bc9e8');
    // foreground seaweed / coral silhouettes — clustered left, sparse right
    b += kelp(80, 600, 1.05, '#2a7268') + kelp(150, 604, 0.7, '#256258') + seaweedTuft(200, 602, 1.1, '#22525e') + seaweedTuft(112, 606, 0.7, '#1e4c58');
    b += kelp(1122, 600, 0.9, '#286a62') + seaweedTuft(1058, 604, 0.8, '#22525e');
    b += seaweedTuft(820, 604, 0.7, '#1e4c58');
    b += `<g opacity=".95">${coral(452, 606, 0.95, '#265268', '#1c4254')}${coral(772, 608, 0.8, '#265268', '#1c4254')}</g>`;
    if (c >= 4) b += seafan(1032, 604, 0.95, '#2a5a70');
    if (c >= 5) b += urchin(276, 600, 0.9, '#0e2030') + urchin(716, 604, 0.7, '#0e2030');
    return SVG(defs, b);
  }

  // ============ OCEAN — open mid-blue water over a sandy floor with a kelp stand ============
  const defs = `<linearGradient id="${P}ok" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcdae8"/><stop offset="0.4" stop-color="#5f93b4"/><stop offset="0.75" stop-color="#306e90"/><stop offset="1" stop-color="#1f4d6b"/></linearGradient>` + lg(P + 'os', '#3f7290', '#26536e');
  let b = `<rect width="${W}" height="${H}" fill="url(#${P}ok)"/>` + rays(.45, .75) + caustics(60) + caustics(240, 4, .12);
  b += glints(6, 100, 1100, 30, 90, '#e8f6fa');
  b += school(240, 190, 9, '#d8eaf2') + school(730, 120, 7, '#cfe2ec') + school(980, 260, 6, '#c4dae6');
  if (c >= 3) b += school(500, 340, 10, '#bcd6e2');
  b += bubbles(360, 420, 6) + bubbles(1000, 460, 5, 0.9) + bubbles(660, 500, 4, 0.7);
  // distant reef shelf silhouette breaking the open-water emptiness
  b += roll(506, 7, '#2a5f80', .55);
  b += scatter(5, 160, 1040).map((x) => `<g opacity="${rnd(.3, .45).toFixed(2)}">${coral(x, rnd(514, 524), rnd(0.35, 0.6), '#3f7290', '#35617c')}</g>`).join('');
  // sea floor with grounded rocks and a kelp forest massed to the left
  b += roll(528, 9, `url(#${P}os)`);
  // low sand humps breaking up the flat floor
  b += mound(430, 150, 22, 584, '#356884', .6) + mound(760, 120, 16, 590, '#31627e', .55) + mound(1010, 90, 13, 588, '#356884', .5);
  b += ripples(558, 3, '#1c4560', .5, 80, 1050);
  b += pebbles(7, 200, 1000, 560, 598, '#2c5a76', .5);
  b += rockCluster(300, 596, 1.05, '#1f4a64', '#2c5a76', 3);
  b += boulder(680, 592, 0.6, '#1f4a64', '#2c5a76') + seaweedTuft(664, 590, 0.55, '#2c6a58');
  b += boulder(930, 600, 1.25, '#1b4460', '#28546e');
  if (c >= 2) b += boulder(1020, 590, 0.55, '#1f4a64', '#2c5a76');
  // kelp forest: staggered heights on the left, sparse strands right
  b += kelp(66, 600, 1.25) + kelp(140, 604, 0.9, '#357254') + kelp(206, 600, 1.05) + kelp(258, 606, 0.6, '#357254');
  b += kelp(1136, 600, 1.0) + kelp(1078, 604, 0.65, '#357254');
  // seagrass meadow patches mid-floor — bunched, unequal
  b += seaweedTuft(480, 600, 1.0, '#2c6a58') + seaweedTuft(542, 604, 0.75, '#337a64') + seaweedTuft(508, 606, 0.55, '#2c6a58') + seaweedTuft(866, 602, 0.9, '#276252') + seaweedTuft(912, 606, 0.6, '#2c6a58');
  if (c >= 3) b += seaweedTuft(700, 606, 0.85, '#2c6a58') + seafan(790, 600, 0.8, '#3a6a80') + seaweedTuft(748, 604, 0.6, '#337a64');
  if (c >= 4) b += coral(620, 604, 0.75, '#3a6a80', '#2c5468') + seastar(410, 592, 0.8, '#c9822c');
  // shells and urchins scattered where the sand settles
  b += `<g opacity=".8">${shellProp(568, 590, 0.8)}${shellProp(806, 594, 0.7)}</g>`;
  b += urchin(388, 596, 0.7, '#1b3a50');
  if (c >= 2) b += seastar(742, 588, 0.7, '#c96f52') + shellProp(1060, 592, 0.75);
  if (c >= 5) b += anemone(660, 598, 0.7, '#2a7a8a', '#8ae0cc');
  return SVG(defs, b);
}
