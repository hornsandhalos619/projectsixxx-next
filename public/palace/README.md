# Palace of Wonders: 3D web viewer (minimal)
Static files for projectsixxx.com. NOT deployed anywhere yet.
- index.html, palace.css, palace.js, palace.glb (meshopt + WebP, ~3.9 MB), palace-hotspots.json
- Three.js r170 loaded from jsDelivr via an import map; no build step.
- Click/tap a product (glowing frame, banner, plinth or screen) -> drawer with live price snapshot and "View in the shop" (Shopify product URL with palace UTM). Draft/unpublished items show "Coming to the palace" with no link.
- Portal in the Great Hall -> confirm -> Shopify 2D palace (PALACE_2D_URL in build_palace.py; /pages/palace-of-wonders).
- ANSI ceiling tiles open their 16colo.rs credit page.
- Room menu jumps between the 27 spaces; "Objects in this room" gives a text list (accessibility/SEO).
- prefers-reduced-motion stops the portal spin and camera damping.
Test locally: `python3 -m http.server` in this folder, open http://localhost:8000/

## v3 (2026-11-12 PT): rooms match the 2D paintings
Each room is its 2D painting projected onto geometry rebuilt from the painting's perspective and the 2D hotspot rects
(emission-only, so render with NoToneMapping and no lights on painted surfaces). Every room opens at the painting's camera
(ROOM_* extras: cam_pos, cam_target, hfov, shift_x, shift_y); drag to look around in 3D. Gold rings are doors (teleport, as on
the 2D site); 2D hotspots open their story/spec; products sit at the 2D stations. The throne-room chessboard square is reserved and blank.

## v3-hd (2026-11-12 PT): two texture tiers
- `palace.glb` (~7 MB): paintings 1600 px, WebP q72. Loaded on phones, tablets and slow or data-saver connections.
- `palace-hd.glb` (~22 MB): Real-ESRGAN x4plus 2x paintings at 3200x1800 and 1600 px Shopify product originals, WebP q85.
  Loaded automatically on desktop with a fast connection. Force it with `?hd=1`, or force the light file with `?hd=0`.
