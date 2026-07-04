# Wildlore — Wildlife Identification System Audit

*Prepared by tracing the actual codebase (no assumptions). Version audited: v1.19.0.*
*Files referenced are in the deployed app bundle.*

---

## 0. TL;DR (the honest headline)

- **By default, with no API keys configured, Wildlore is NOT using iNaturalist's vision model.** It falls back to a **generic on-device MobileNet (ImageNet, 1,000 classes)** — a real classifier, not a fake one, but a weak, general-purpose model for wildlife.
- **iNaturalist's computer vision is used only if you set four OAuth env vars** on Netlify. When set, it becomes the primary recognizer and the app is competitive for organisms.
- **Species data, taxonomy, common names, and reference photos do NOT come from iNaturalist.** They come from **GBIF** (plus **OBIS** for marine). iNaturalist (optional) and **Google Cloud Vision Web Detection** (optional) are *only* image recognizers; their label output is then resolved to a GBIF species.
- **Nothing is fabricated**, but **confidence percentages are not on a single consistent scale** across engines, and the "your guess" path injects a synthetic 97% — both are real user-trust issues.
- **Production-ready?** The *engineering* (fallbacks, caching, multi-candidate UX, confirm-before-save) is production-grade. The *default accuracy* is not best-in-class. The path to best-in-class is clear and mostly already wired — it hinges on **getting iNaturalist CV access approved** (or self-hosting an iNat-class model).

---

## 1. Exactly how the current pipeline works

### 1.1 Photo identification — step by step

Source of truth: `js/ui/capture.js` → `analyzePhoto()`; `netlify/functions/identify.mjs`; `js/features/vision.js`; `js/data/catalog.js` → `matchName()`.

1. **Capture / upload.** `renderPhoto()` reads the file to a base64 data URL (`toB64`).
2. **Crop / focus.** `buildFramer()` lets the user tap the animal; `cropAround()` crops a square (~72% of the short side) centered on the tap. The crop is used for recognition; the full photo is saved to the journal.
3. **`analyzePhoto(cropped, hint)`** runs recognizers in this order:

   **(a) Server vision endpoint** — `CONFIG.identify.visionEndpoint = '/.netlify/functions/identify'` (always set).
   The client POSTs `{ imageBase64, lat, lng }`. The Netlify function `identify.mjs`:
   - **iNaturalist CV** *(only if `INAT_*` env vars exist)*: mints an OAuth token (`getJwt`), then POSTs the image to `api.inaturalist.org/v1/computervision/score_image`. Returns candidates `{ name: scientificName, common, score: combined_score/100 }`.
   - **Google Vision Web Detection** *(only if `GOOGLE_VISION_KEY` exists)*: POSTs to `vision.googleapis.com/v1/images:annotate` with `WEB_DETECTION`. Adds candidates from `bestGuessLabels` (score 0.9) and `webEntities` (score `entity.score/2`), plus `visuallySimilarImages` URLs.
   - **If neither key is set → returns `{ candidates: [] }`.**
   Back on the client, `visionEndpoint()` takes each returned **name** and calls `catalog.matchName(name)` to resolve it to a **GBIF** species record (taxonKey, scientific + common name, class/order). It also passes through `similarImages`.

   **(b) On-device fallback** — if the endpoint returned nothing and `CONFIG.identify.onDeviceVision` is `true` (it is): `vision.identifyImage()`:
   - Lazily loads **TensorFlow.js 4.22** + **MobileNet v2** from the jsDelivr CDN.
   - Center-crops, runs `model.classify(input, 10)` → top-10 **ImageNet** labels.
   - Maps each label to a scientific name via a **hand-authored `ALIASES` table (~150 entries)** (e.g., `hen → Gallus gallus`, `great white shark → Carcharodon carcharias`) plus regex rules for dog/cat breeds; unmapped labels are passed as-is.
   - Each name is resolved via `catalog.matchName` → GBIF. Results are ranked **animals (kingdom Animalia) first**, then others. Returns top 5.

   **(c) Hint** — if the user typed a guess, `catalog.matchName(hint)` is prepended with a **forced score of 0.97**.

4. **`showGate(candidates)`** → `candRow()` shows up to 5 matches with a thumbnail (GBIF reference photo) and a confidence %. Clicking one opens **`showCompare()`** (your photo vs. large reference photo, a strip of more reference photos, "similar web photos" if present, common name first, scientific behind a tap).
5. **Confirm** → `confirmCandidate()` → `store.recordDiscovery()` writes the discovery; only then is it added to the collection. `artwork.ensureArt()` kicks off the illustration generation.

### 1.2 Name → species resolution (`catalog.matchName`, `js/data/catalog.js`)

- Tries GBIF `/species/match` (exact scientific match) first.
- Then GBIF `/species/search` with `nameType=SCIENTIFIC` (excludes viruses/odd name types), `status=ACCEPTED`. Each result is **re-scored**: +0.32 if an English vernacular name equals the query, +0.18 if it contains it, +0.08 if kingdom = Animalia; synonyms skipped. Top 6 returned.
- **This layer had a real bug, now fixed:** before the `nameType` filter, searching "sea otter" returned *Sea otterpox virus* above the actual otter. Verified fixed against live GBIF: *Enhydra lutris* now ranks first.

### 1.3 Species record + reference photos (`catalog.getSpecies`)

All from **GBIF**, in parallel: `/species/{key}` (taxonomy), `/species/{key}/vernacularNames` (common names), `/occurrence/search?taxonKey=…&mediaType=StillImage` (reference photos), `/speciesProfiles`, `/descriptions`, `/iucnRedListCategory`. Marine species are enriched via **OBIS** `/taxon/{name}` (depth, marine confirmation). Cached in IndexedDB for 30 days.

### 1.4 Audio (separate feature)

`js/features/sounds.js`: iNaturalist research-grade observation audio (`/v1/observations?sounds=true`), Xeno-canto for birds. Graceful "no verified recording" otherwise. Not part of photo ID.

---

## 2. Every external API in use

| # | API / Endpoint | Purpose | Auth | Official? | Production reliability |
|---|---|---|---|---|---|
| 1 | `api.inaturalist.org/v1/computervision/score_image` | **Primary image recognition** (optional) | OAuth (4 env vars) | Official API, but **CV access is gated** — requires an approved iNat application; not openly documented for third-party production use | **Medium / at risk.** Powerful, but you must be approved; iNat may rate-limit or decline production use. **This is the biggest external dependency risk.** |
| 2 | `inaturalist.org/oauth/token` + `/users/api_token` | Mint iNat JWT (12h cache) | Password grant | Official | Medium; tied to #1 |
| 3 | `vision.googleapis.com/v1/images:annotate` (WEB_DETECTION) | Reverse-image fallback + similar web photos (optional) | API key | Official, documented | **High**, but **paid** (~$1.50 / 1,000 images) |
| 4 | `api.gbif.org/v1/*` (match, search, species, vernacular, descriptions, speciesProfiles, iucnRedListCategory, occurrence/search) | Taxonomy, common names, reference photos, conservation | None | Official, documented, free | **High** — the dependable backbone |
| 5 | `api.obis.org/v3/taxon` | Marine enrichment | None | Official, free | High (non-critical) |
| 6 | jsDelivr CDN — TensorFlow.js 4.22 + MobileNet v2 | **Default on-device recognizer** | None | Official libraries | High CDN; **model is generic ImageNet, not wildlife-specialized** |
| 7 | GBIF occurrence media image URLs | Reference/comparison photos | None | Hotlinked contributor images | **Variable** — licenses differ; some hosts block hotlinking → occasional broken thumbnails |
| 8 | iNaturalist observations API + Xeno-canto | Animal sounds (separate) | None | Official | Medium-High |

**Flag:** #1 (iNat CV) is the one to worry about for a published app — it is **access-gated and not contractually guaranteed** for third-party production. #6 (MobileNet) is reliable to load but **weak for wildlife**.

---

## 3. Accuracy analysis (honest)

### Where it does well
- **With iNat keys set:** genuinely strong for organisms, and **geo-aware** (the app passes `lat/lng`, which meaningfully improves results).
- **Resolution layer (now fixed):** common-name → species mapping is reliable and animal-biased.
- **UX hedging:** 5 candidates + comparison photos + confirm-before-save means a wrong top-1 doesn't corrupt the collection.

### Where it does poorly
- **Default (no keys):** MobileNet only knows ~1,000 ImageNet classes (~hundreds of animals, heavily biased to dog breeds, common birds, zoo mammals). It has **almost no coverage** of specific **nudibranchs, most fish, jellyfish, corals, many reptiles/amphibians/insects** — exactly your themed taxa. For those it will return nothing or a wrong generic guess. The `ALIASES` table papers over ~150 common cases but can't scale to real biodiversity.
- **Confidence is not a single scale:** iNat = `combined_score/100`; MobileNet = ImageNet class probability re-attached to a *resolved* species; Google = heuristics (0.9 / score÷2); hint = hard-coded **0.97**. A "92%" from one engine ≠ "92%" from another. **This is a user-trust problem.**
- **No fabrication, but the hint path can look like model confidence** when it's really "the user told us." It should be labeled as the user's guess, not a confidence.

### Likely failure points
Marine inverts (nudibranchs, jellies, corals), small/cryptic fish, juvenile/eclipse-plumage birds, look-alike species pairs, cluttered backgrounds (mitigated by tap-to-crop).

### Can it compete with iNaturalist today?
- **With iNat CV keys:** essentially yes, because it *is* iNat's model under the hood (plus your nicer collection UX).
- **Without keys:** **no.** MobileNet is not in the same league for wildlife breadth.

---

## 4. Best-in-class comparison

| System | Model / data | Strengths | Why they beat the default | Officially usable by us? |
|---|---|---|---|---|
| **iNaturalist / Seek** | CV model trained on tens of millions of research-grade observations across ~100k+ taxa; **geo-aware** | Best wildlife breadth & precision; on-device (Seek) | Vastly larger, taxonomy-aware, location-priored training set | **Gated** — needs approved API access; Seek's on-device model isn't a public API |
| **Google Lens** | Web-scale visual search | Phenomenal recall on anything | Sees the entire web, not just a taxon list | **No official Lens API** (third-party scrapers only). Cloud Vision Web Detection is the official, weaker proxy |
| **Merlin / BirdNET (Cornell)** | Bird-specialist (image + audio) | Best-in-class for **birds** specifically | Domain-specialized | BirdNET is open; Merlin API is limited |
| **Wildlore (default)** | Generic MobileNet + GBIF | Great data backbone, clean UX | — | Fully ours |

**What they do better & how we close it:** breadth (use iNat's model or a self-hosted iNat-class model), location priors (already wired — keep), and domain specialists for birds (add BirdNET/Merlin). We already match or beat them on *collection UX and data presentation*.

---

## 5. Recommended architecture

**Priorities: accuracy → speed → scalability → trust → maintainability.**

### Option A — iNaturalist CV as the real primary *(recommended now)*
Make iNat CV the default (apply for/secure API access), geo-aware, 5 candidates; **GBIF** for taxonomy/photos/common-names; **MobileNet** demoted to *offline-only* fallback; Google Vision as optional reverse-image + "similar web photos."
- **Pros:** best accuracy with least new code (already 90% wired); low maintenance.
- **Cons:** depends on iNat granting production CV access.

### Option B — Self-host an iNat-class model
Deploy an open wildlife classifier (e.g., an iNat-2021-trained model) on serverless GPU (**Replicate / Modal / Hugging Face Inference**), called from the existing `identify` function.
- **Pros:** no dependency on iNat's gate; full control; scalable.
- **Cons:** model selection, hosting cost, and MLOps maintenance.

### Option C — Google Cloud Vision only
- **Pros:** trivial, reliable, official, paid.
- **Cons:** weakest taxonomic precision; not ranked taxa.

### Option D — Ensemble *(growth target)*
iNat (general) + **BirdNET/Merlin** (birds) + Google (reverse-image fallback), merged by normalized confidence with a geo prior.
- **Pros:** best possible accuracy, especially for birds (where most users test).
- **Cons:** most complexity.

### My recommendation
**Adopt A immediately** (fastest route to best accuracy, lowest maintenance, mostly already built). **Hold B as the contingency** if iNat access is denied. **Grow into D** (add BirdNET for birds) once usage justifies it. In all cases: **GBIF stays the taxonomy/photo backbone**, **MobileNet stays offline-only**, and **confidence is normalized to one scale** before display.

---

## 6. UX improvements

The requested flow (upload → analyze → 5 ranked matches with % → comparison images → common names first → user can correct → confirm before adding) is **already implemented** (v1.17+). Recommended refinements:
1. **Normalize confidence to one honest scale** and label the engine ("iNaturalist vision", "on-device", "your guess") so 92% means the same thing everywhere.
2. **Show the "why":** "Common near your location" when the geo prior fired.
3. **"Not sure? Save as unconfirmed"** — log a provisional record the user can resolve later (great for hard inverts).
4. **Multi-photo capture** (2–3 angles) to boost accuracy on tricky species.
5. **Offline honesty:** when only MobileNet is available, say "Offline guess — verify when online."

---

## 7. Testing

**What I could verify from this environment (no browser, no keys, restricted egress):**
- **Resolution layer — tested live against GBIF.** Found and fixed a real bug: `q=sea otter` returned *Sea otterpox virus* above the otter. After adding `nameType=SCIENTIFIC` + vernacular/animal ranking, **Enhydra lutris (Sea Otter)** ranks first. ✔
- Confirmed every module loads, imports resolve, and is precached.

**What I could NOT run here (and must not fake):** the browser-only MobileNet model and the key-gated iNaturalist CV. End-to-end *image → species* accuracy must be measured on a real device.

### Reproducible on-device test protocol (run after deploy + keys)
Use appropriately-licensed images (Wikimedia Commons CC-BY/CC0, your own photos, or iNaturalist CC observations). One clean and one cluttered image per taxon:

| Taxon | Suggested species | Expected top result |
|---|---|---|
| Bird | Blue Jay | Cyanocitta cristata |
| Mammal | Sea Otter | Enhydra lutris |
| Fish | Clownfish | Amphiprion ocellaris |
| Shark | Great White | Carcharodon carcharias |
| Nudibranch | Spanish Shawl | Flabellina iodinea |
| Jellyfish | Moon Jelly | Aurelia aurita |
| Reptile | Green Sea Turtle | Chelonia mydas |
| Amphibian | American Bullfrog | Lithobates catesbeianus |
| Insect | Monarch | Danaus plexippus |

For each: record engine used, top-1 correct? top-5 contains correct? confidence shown. **Target:** ≥80% top-1 and ≥95% top-5 *with iNat keys*. Expect the **no-key MobileNet path to fail most inverts** — that result is itself the argument for Option A.

---

## 8. Final answers

1. **Pipeline:** Section 1 — recognizer (iNat CV *if keyed*, else on-device MobileNet, plus optional Google Web Detection, plus manual/hint) → label resolved to a **GBIF** species → 5-candidate compare → confirm → save.
2. **APIs/models:** Section 2 — iNat CV (optional, gated), Google Vision (optional, paid), **GBIF** (core), OBIS (marine), TensorFlow.js+MobileNet (default fallback), Xeno-canto/iNat audio (sounds).
3. **Weaknesses:** default = generic MobileNet (poor wildlife breadth); inconsistent confidence scales; iNat CV access is gated; hotlinked reference photos can break.
4. **Production-ready?** Engineering yes; default accuracy no. Becomes competitive **only with iNat keys** — and that access is the key risk to close.
5. **Redesign:** Section 5 — **Option A** (iNat primary, GBIF backbone, MobileNet offline-only, normalized confidence), contingency **B** (self-host), grow to **D** (add BirdNET for birds).
6. **Migration plan:** Section 9.

---

## 9. Step-by-step migration plan (no code changed yet — your call)

1. **Secure iNaturalist CV access.** Apply for API/CV permission for a published app; set the 4 `INAT_*` env vars. *(If denied → jump to step 6.)*
2. **Make iNat the labeled default** and demote MobileNet to offline-only (small change; logic already present).
3. **Normalize confidence** to one 0–100 scale across engines; label the engine; relabel the hint path as "your guess," not a confidence.
4. **Keep the geo prior** (already passing lat/lng) and surface "near your location."
5. **Harden reference photos:** prefer iNat/GBIF images with known licenses; add a broken-image fallback to the vector illustration.
6. **Contingency (if iNat denied):** stand up a self-hosted iNat-class classifier on Replicate/Modal/HF; point the existing `identify` function at it. No client changes needed.
7. **Add a bird specialist (BirdNET/Merlin)** behind the same endpoint; merge by normalized confidence. (Birds are the highest-volume real-world test.)
8. **Instrument accuracy:** log (privately, with consent) top-1/top-5 correctness from user confirmations to measure real-world accuracy and tune thresholds.
9. **Run the Section 7 protocol on-device** before calling ID "done."

**Bottom line:** the architecture is sound and most of the redesign is already wired. The single highest-leverage move is **turning iNaturalist's vision model from an optional add-on into the actual default** — and securing the access that makes that legitimate for a published app.
