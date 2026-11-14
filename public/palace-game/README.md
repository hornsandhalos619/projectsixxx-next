# Palace of Wonders: game vertical slice (v4 slice, Nov 14, 2026)

This is a static site, with no build step. You can serve the folder from any static host (Vercel, Netlify, S3) or open it with a local server:

    python3 -m http.server 8000   # then open http://localhost:8000/

## What's in the slice
- **Entrance Hall.** A barrel-vaulted corridor with gold-filleted ribs. It has torches with fire, embers and crackle, iron-bound entrance doors behind you, and two framed metal prints. **Bifrons** waits at the arch.
- **Great Hall.** About 44 m long, with an 18 m nave and a 19 m vault. It has:
  - a real coffered barrel vault with gold bosses
  - 16 clustered black-marble columns with gold shafts
  - 7 arched bays per side
  - a black marble floor with gold inlay, and a crimson runner
  - a hearth with blazing fire, embers drifting into the room and smoke
  - three braziers and three candle stands
  - two ring chandeliers with 60 candles
  - swaying crimson and ivory banners
  - arched mirrors
  - velvet benches
- **The colossi.** Two statues on pedestals: a horned obsidian figure (Pan scan with modelled ram horns) and an alabaster figure (Neptune scan with a gold halo).
- **The Ring.** A gold and obsidian portal that alternates fire and pale-gold phases on a 40 s cycle. It's the "way onward"; tapping it explains that the Ballroom comes next and offers a link to projectsixxx.com. There are also Horns Wing and Halos Wing doors in the last bays.
- **14 real products, all clickable:**
  - 4 crest tapestries hung as swaying cloth
  - 4 metal prints (2 on easels, 2 on the hallway walls)
  - 4 garments on dress forms: 2 hoodies, a tee and a slip dress
  - a mug and a cap on display tables
- **The product panel.** It shows the image, title, live-catalog price, variant picker, quantity, **Add to cart** (`/cart/add?id=VARIANT&quantity=N`, new tab) and **Buy now** (`/cart/VARIANT:N` checkout permalink). There are no API keys and nothing writes to Shopify.
- **NPCs.**
  - **Bifrons** is the haloed archivist. He waves when you approach, turns to face you and talks in House lines.
  - **Mammon** is the horned keeper of the shops. He has the "Show me something" recommendation, which opens a product and reads its catalog record.
- **Controls.**
  - Bottom-right joystick: up is forward, down is back, left and right turn.
  - WASD or the arrow keys walk (Shift runs), and you drag to look.
  - Tap a piece or press E to inspect it.
  - "Pieces in this hall" lists every item so you can jump straight to it.
  - There's a sound toggle.
- **Collision.** Walls, piers, columns, benches, tables, pedestals, braziers, mannequins, easels and NPCs all block you. The player is a circle with radius 0.3 m.
- **Audio.** Positional CC0 fire loops plus synthesized crackle, wind and drone. Sound starts on "Enter the Palace" or on your first tap.

## URL flags
- `?fx=1` turns on bloom. It's off by default, because hot highlights on the marble can bloom into squares.
- `?autostart=1` skips the Enter screen (used for testing).
- `?env=0` turns off the reflection probe.

## Performance budget
- Download is about 5.0 MB in total, including three.js. Textures are WebP; models are meshopt-compressed GLB.
- The scene is about 210k triangles and about 265 draw calls. That includes 12 lights; shadows are static and rendered once.
- The NPCs stream in after the hall is already visible.
- On phones: pixel ratio is capped at 1.5, there's no MSAA, particle counts are lower, the chandelier shadow and one fill light are dropped, and the reflection probe is 128 px.

## Rebuilding the assets
The source assets and scripts are in `/workspace/palace-game/assets-src/` and `/workspace/palace-game/build/` on the box:
- `build_products.py` fetches the public products.json and writes `data/products.json` plus the product textures.
- `build_decals.py` makes the garment cutouts and the mug and cap decals.
- `build_tex.py` builds the PBR WebP textures, carpet and banners.
- `build/statues.py` decimates the scans with Blender 4.2.3 headless. Then I ran `gltf-transform optimize --compress meshopt`.
- `build/capture.mjs` takes headless screenshots and runs the collision tests.
