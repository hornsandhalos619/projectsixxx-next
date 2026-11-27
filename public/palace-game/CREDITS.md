# Palace of Wonders: game vertical slice, credits and licenses

Everything in this folder is either made by Horns & Halos or is free-licensed third-party content listed below.
Prepared Nov 14, 2026 (PT).

## Horns & Halos (owned by Horns & Halos / Matthew Feldman)
- Product photos and art in `assets/products/` are from the public Horns & Halos store catalog (hornshalosshop.myshopify.com/products.json), fetched read-only on Nov 14, 2026. The `-cut` and `-decal` files are cutouts and crops of the same photos.
- The Official Sigil (`assets/ui/sigil.webp`, and the banner art in `assets/tex/banner_*.webp`) comes from the House sigil file.
- NPC dialogue in `data/dialogue.json` comes from the House dialogue batch (`/workspace/palace/dialogue/batch-2026-11-12-scale/all-npc-lines-draft.csv`). Those lines are still drafts, and Six hasn't spot-checked them yet.
- I generated the carpet runner and banner textures procedurally (`assets-src/build_tex.py`).

## 3D scans (statues): Three D Scans (threedscans.com), no copyright claimed
Three D Scans (artist Oliver Laric) publishes its museum scans for free download "without any copyright restrictions". He says he claims no copyright in the scans, and the objects themselves are public domain. Source: the creator's statement, quoted on BlenderNation (May 9, 2016). Licensing is effectively CC0/public domain.
- **Pan**: marble, Heraklion Archaeological Museum, scanned 2025. https://threedscans.com/uncategorized/pan/
  Used as the horned obsidian colossus. I decimated it to about 60k triangles, re-materialed it, and added modelled ram horns.
- **Neptune (restored by Iustinian Funie)**: Musée de la Romanité, Nîmes. https://threedscans.com/uncategorized/neptune-restored-by-iustinian-funie/
  Used as the haloed alabaster colossus. I decimated it to about 60k triangles and added a modelled gold halo.

## Characters: Quaternius, CC0 1.0 (via poly.pizza)
- **"Hooded Adventurer"** by Quaternius, CC0 1.0. https://poly.pizza/m/y9KWOVG21R
  Restyled as **Bifrons**, the haloed archivist: ivory and gold robes, with a modelled halo attached to the head bone. I hid the weapons.
- **"Man"** by Quaternius, CC0 1.0. https://poly.pizza/m/HMnuH5geEG
  Restyled as **Mammon**, the horned keeper of the shops: a crimson-charcoal coat, with modelled horns attached to the head bone.

## PBR textures: CC0 1.0
- Poly Haven (https://polyhaven.com, CC0):
  - `medieval_blocks_03` (hall walls)
  - `castle_wall_slates` (hallway, chimney)
  - `dark_wood` (benches, doors, easels, tables)
  - `velour_velvet` (cushions, cloth normal)
- ambientCG (https://ambientcg.com, CC0):
  - `Marble016` (black marble floor, columns, plinths, obsidian)
  - `Marble021` (alabaster)
  - `Metal048B` (aged gold)

## Audio
- **"Fireplace Sound Loop"** by PagDev, CC0, from OpenGameArt: https://opengameart.org/content/fireplace-sound-loop
  Re-encoded to mono 64 kbps MP3 as `assets/audio/fire-loop.mp3`. It plays as positional audio from the hearth, braziers and torches.
- The extra crackle pops, the hall wind and the low stone drone are synthesized live with WebAudio, so there's no audio file for them.

## Code
- three.js r170 (MIT): `vendor/three/` (see `vendor/three/LICENSE`).
- meshoptimizer decoder (MIT), bundled with three.js addons.
- Game code in `js/`: written for Horns & Halos.
