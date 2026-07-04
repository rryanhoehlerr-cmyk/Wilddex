/* On-device photo identification — free, no API key, no account.
   Uses TensorFlow.js + MobileNet (loaded from CDN, cached by the browser) to classify the
   photo, then resolves the guessed labels against the GBIF backbone. Best for common animals;
   if it can't find a confident match the app falls back to naming. */
import * as catalog from '../data/catalog.js';

const TFJS = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
const MNET = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js';
let _model = null, _loading = null;

function loadScript(src) {
  return new Promise((res, rej) => {
    if ([...document.scripts].some((s) => s.src === src)) return res();
    const el = document.createElement('script'); el.src = src; el.async = true;
    el.onload = res; el.onerror = () => rej(new Error('Could not load ' + src));
    document.head.appendChild(el);
  });
}
async function model() {
  if (_model) return _model;
  if (_loading) return _loading;
  _loading = (async () => {
    await loadScript(TFJS); await loadScript(MNET);
    _model = await window.mobilenet.load({ version: 2, alpha: 1.0 });
    return _model;
  })();
  return _loading;
}
export const available = () => true;

/* dataUrl -> ranked GBIF candidates [{taxonKey,name,scientificName,score}] */
export async function identifyImage(dataUrl) {
  const m = await model();
  const img = new Image(); img.decoding = 'async'; img.src = dataUrl;
  await (img.decode ? img.decode() : new Promise((r) => { img.onload = r; }));
  const preds = await m.classify(img, 6); // [{className, probability}]
  const out = []; const seen = new Set();
  for (const p of preds) {
    if (p.probability < 0.06) continue;
    const parts = p.className.split(',').map((s) => s.trim()).filter(Boolean);
    for (const name of parts) {
      let cands = [];
      try { cands = await catalog.matchName(name); } catch (_) {}
      if (cands[0] && !seen.has(cands[0].taxonKey)) { seen.add(cands[0].taxonKey); out.push({ ...cands[0], score: p.probability }); break; }
    }
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 5);
}
