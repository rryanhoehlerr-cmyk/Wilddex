/* First-run welcome — a warm, one-time introduction to the core loop.
   Shown once per device after the player first enters the app. */
import { el, go } from './components.js';
import * as db from '../core/db.js';

const STEPS = [
  { icon: '📷', t: 'Identify', s: 'Snap a photo of any animal and AI names it — from your backyard to the reef.' },
  { icon: '📖', t: 'Collect', s: 'Every find is pressed into your journal as handcrafted artwork, yours forever.' },
  { icon: '🌿', t: 'Grow', s: 'Your animals bring habitats to life. Harvest resources and grow living ecosystems.' }
];

export async function maybeShow() {
  try { if (await db.kvGet('onboarded', false)) return; } catch (_) { return; }
  show();
}

function show() {
  const card = el('div', { class: 'onboard-card', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Welcome to Wilddex' });
  card.append(el('div', { class: 'onboard-mark', 'aria-hidden': 'true' }));
  card.append(el('div', { class: 'onboard-title' }, 'Welcome to Wilddex'));
  card.append(el('div', { class: 'onboard-sub' }, 'Explore. Identify. Discover.'));
  const steps = el('div', { class: 'onboard-steps' });
  STEPS.forEach((st) => steps.append(el('div', { class: 'onboard-step' },
    el('span', { class: 'onboard-ico', 'aria-hidden': 'true' }, st.icon),
    el('div', {}, el('div', { class: 'onboard-step-t' }, st.t), el('div', { class: 'onboard-step-s' }, st.s)))));
  card.append(steps);
  const begin = el('button', { class: 'btn', style: 'margin-top:22px' }, 'Start exploring');
  const finish = async (dest) => { try { await db.kvSet('onboarded', true); } catch (_) {} ov.remove(); if (dest) go(dest); };
  begin.addEventListener('click', () => finish('#/capture'));
  card.append(begin);
  card.append(el('button', { class: 'onboard-skip', onclick: () => finish(null) }, 'Maybe later'));
  const ov = el('div', { class: 'onboard' }, card);
  document.body.append(ov);
  requestAnimationFrame(() => begin.focus());
}
