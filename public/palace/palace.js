// Palace of Wonders v3: minimal Three.js viewer. Each room is the 2D painting projected onto matched geometry
// (unlit, emission-only), so every room opens at its painting camera (ROOM_* extras: cam_pos, hfov, shift).
// Doors teleport between rooms like the 2D site; 2D hotspots and products open a drawer.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Two tiers: palace.glb (~7 MB) by default; palace-hd.glb (~22 MB, Real-ESRGAN 2x paintings) on desktop with a
// fast connection, or forced with ?hd=1 (?hd=0 forces the light file).
function pickModel() {
  const q = new URLSearchParams(location.search).get('hd');
  if (q === '1') return '/palace/palace-hd.glb';
  if (q === '0') return '/palace/palace.glb';
  const c = navigator.connection || {};
  const desktop = matchMedia('(pointer: fine)').matches && Math.min(screen.width, screen.height) >= 800;
  const fast = !c.saveData && (!c.effectiveType || c.effectiveType === '4g') && (!c.downlink || c.downlink >= 5);
  return desktop && fast ? '/palace/palace-hd.glb' : '/palace/palace.glb';
}
const ASSETS = { hotspots: '/palace/palace-hotspots.json' };
const DEFAULT_SHOP = 'https://hornshalosshop.myshopify.com';
const DEFAULT_ROOM = 'great-hall';
const CONFIG = {
  model: pickModel(),
  shop: DEFAULT_SHOP,
  startRoom: DEFAULT_ROOM,
};
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.NoToneMapping;   // painted surfaces are emission-only: show the painting's exact colours
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05060a);
scene.add(new THREE.HemisphereLight(0x9fb4d8, 0x1a1210, 0.6));
const moon = new THREE.DirectionalLight(0xbfd0ff, 0.6); moon.position.set(60, 120, 40); scene.add(moon);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1500);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = !reduceMotion;
controls.maxPolarAngle = Math.PI * 0.5;   // never orbit below the target (eye level): the camera can't drop under the floor
controls.minDistance = 0.3;

const rooms = {}; const hotspots = []; const ceilings = []; const doors = []; let portal = null; let cur = null;
const b2t = (v) => new THREE.Vector3(v[0], v[2] ?? 0, -v[1]);   // Blender (x,y,z) -> three (x,z,-y)

const catalogPromise = fetch(ASSETS.hotspots)
  .then((r) => { if (!r.ok) throw new Error('hotspots ' + r.status); return r.json(); })
  .catch((err) => { console.warn('Palace hotspots JSON unavailable; using model extras.', err); return null; });

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
loader.load(CONFIG.model, async (gltf) => {
  const catalog = await catalogPromise;
  const byId = new Map();
  if (catalog && Array.isArray(catalog.hotspots)) {
    for (const spot of catalog.hotspots) {
      if (spot && spot.hotspot_id) byId.set(spot.hotspot_id, spot);
    }
  }
  scene.add(gltf.scene);
  gltf.scene.traverse((o) => {
    const u = o.userData || {};
    if (u.hotspot_id && byId.has(u.hotspot_id)) Object.assign(u, byId.get(u.hotspot_id));
    if (catalog && catalog.palace_2d_url && u.interactive === 'portal') u.link_url = catalog.palace_2d_url;
    if (u.room_slug) rooms[u.room_slug] = u;
    if (u.ceiling) ceilings.push(o);
    if (o.name === 'PORTAL') portal = o;
    if (u.hotspot_id && o.type === 'Object3D') hotspots.push(o);
    if (u.interactive === 'door') doors.push(o);
    if (o.isMesh) o.material.side = THREE.DoubleSide;
  });
  const skip = document.getElementById('skip');
  if (skip) skip.href = (catalog && catalog.shop) || DEFAULT_SHOP;
  buildRoomMenu(); goRoom((catalog && catalog.start_room) || CONFIG.startRoom);
  document.getElementById('loading').hidden = true;
}, (e) => { if (e.total) document.getElementById('pct').textContent = Math.round(e.loaded / e.total * 100) + '%'; },
  (err) => { document.getElementById('loading').textContent = 'The palace could not open: ' + err.message; });

function buildRoomMenu() {
  const sel = document.getElementById('rooms');
  for (const r of Object.values(rooms).sort((a, b) => a.room_name.localeCompare(b.room_name))) {
    const o = document.createElement('option'); o.value = r.room_slug; o.textContent = r.room_name; sel.append(o);
  }
  sel.onchange = () => goRoom(sel.value);
  const ce = document.getElementById('ceil'); ce.checked = true;
  ce.onchange = (e) => ceilings.forEach((c) => (c.visible = e.target.checked));
}

function goRoom(slug) {
  const r = rooms[slug]; if (!r) return;
  document.getElementById('rooms').value = slug;
  const [x0, x1, y0, y1] = r.bounds; const span = Math.max(x1 - x0, y1 - y0);
  // painting camera: same horizontal FOV and lens shift as the 2D painting (16:9)
  const t = Math.tan(THREE.MathUtils.degToRad(r.hfov || 75) / 2);
  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(t * 9 / 16)); camera.aspect = 16 / 9;
  const W = 1600, H = 900;
  camera.setViewOffset(W, H, (r.shift_x || 0) * W, -(r.shift_y || 0) * W, W, H);
  shifted = true; fitAspect();
  const cp = b2t(r.cam_pos), ct = b2t(r.cam_target);
  camera.position.copy(cp); controls.target.copy(cp.clone().lerp(ct, 0.3));   // orbit pivot 3 m ahead, inside the room
  controls.maxDistance = Math.min(span, 12); controls.update();
  cur = slug; doorCooldown = performance.now() + 1200;
  listObjects(slug);
}

function listObjects(slug) {
  const ul = document.getElementById('obj-list'); ul.innerHTML = '';
  for (const h of hotspots.filter((h) => h.userData.room === slug)) {
    const li = document.createElement('li'); const b = document.createElement('button');
    b.textContent = h.userData.product_title + (h.userData.status === 'live' ? '' : ' (coming)');
    b.onclick = () => openDrawer(h.userData); li.append(b); ul.append(li);
  }
  if (!ul.children.length) ul.innerHTML = '<li>No pieces in this room yet.</li>';
}

// ---- picking
const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2(); let down = null;
function pick(ev) {
  const b = canvas.getBoundingClientRect();
  ptr.set((ev.clientX - b.left) / b.width * 2 - 1, -((ev.clientY - b.top) / b.height) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  for (const hit of ray.intersectObjects(scene.children, true)) {
    if (!hit.object.visible) continue;
    for (let o = hit.object; o; o = o.parent) {
      const u = o.userData || {};
      if (u.product_handle || u.interactive) return u;
    }
    return null;   // first visible surface blocks
  }
  return null;
}
canvas.addEventListener('pointerdown', (e) => (down = [e.clientX, e.clientY]));
canvas.addEventListener('pointerup', (e) => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
  const u = pick(e); if (!u) return;
  if (u.product_handle) openDrawer(u);
  else if (u.interactive === 'door') goRoom(u.door_to);
  else if (u.interactive === 'portal' && confirm(u.confirm || 'Leave the palace for the shop?')) location.href = u.link_url;
  else if (u.interactive === 'object2d') openDrawer2d(u);
  else if (u.interactive === 'ansi_tile' && u.link_url) window.open(u.link_url, '_blank', 'noopener');
});
canvas.addEventListener('pointermove', (e) => { canvas.style.cursor = pick(e) ? 'pointer' : 'grab'; });

function openDrawer(u) {
  const d = document.getElementById('drawer'); d.hidden = false;
  document.getElementById('d-title').textContent = u.product_title || '';
  document.getElementById('d-meta').textContent = [u.product_type, u.station].filter(Boolean).join(' · ');
  document.getElementById('d-price').textContent = u.price && u.status === 'live' ? `$${Number(u.price).toFixed(2)} ${u.currency || ''}` : '';
  const img = document.getElementById('d-img'); img.hidden = !u.image_url; if (u.image_url) img.src = u.image_url;
  const link = document.getElementById('d-link'); const coming = document.getElementById('d-coming');
  const live = u.status === 'live' && u.product_url;
  link.hidden = !live; coming.hidden = !!live;
  if (live) link.href = u.product_url_utm || u.product_url;
}
function openDrawer2d(u) {   // a 2D hotspot (story + spec, optional link), same copy as the 2D palace
  const d = document.getElementById('drawer'); d.hidden = false;
  document.getElementById('d-title').textContent = u.name2d || '';
  document.getElementById('d-meta').textContent = [u.story, u.spec].filter(Boolean).join(' · ');
  document.getElementById('d-price').textContent = u.reserved ? 'Reserved square' : '';
  document.getElementById('d-img').hidden = true;
  const link = document.getElementById('d-link'); const coming = document.getElementById('d-coming');
  link.hidden = !u.link_url; coming.hidden = true; if (u.link_url) link.href = u.link_url;
}
document.getElementById('close').onclick = () => (document.getElementById('drawer').hidden = true);

// Keep the painting's 16:9 framing: letterbox the canvas to 16:9 while the painting camera is active.
let shifted = false;
function fitAspect() {
  let w = innerWidth, h = innerHeight;
  if (shifted) { if (w / h > 16 / 9) w = Math.round(h * 16 / 9); else h = Math.round(w * 9 / 16); }
  else camera.aspect = w / h;
  renderer.setSize(w, h); canvas.style.margin = `${(innerHeight - h) / 2}px auto 0`; canvas.style.display = 'block';
  camera.updateProjectionMatrix();
}
controls.addEventListener('start', () => {   // free look: drop the lens shift and fill the window
  if (!shifted) return; shifted = false; camera.clearViewOffset(); camera.fov = 60; fitAspect();
});
addEventListener('resize', fitAspect);
// ---- keep the camera inside the current room: above the floor, below the ceiling, within the walls
function roomBox(r) {   // walk_bounds are Blender x/y; three: x = x, z = -y
  const [x0, x1, y0, y1] = r.walk_bounds || r.bounds;
  return { x0, x1, z0: -y1, z1: -y0, top: r.kind === 'interior' ? (r.height || 6) - 0.3 : 60 };
}
function clampToRoom() {
  const r = rooms[cur]; if (!r) return;
  const b = roomBox(r);
  for (const v of [camera.position, controls.target]) {
    v.x = THREE.MathUtils.clamp(v.x, b.x0, b.x1); v.z = THREE.MathUtils.clamp(v.z, b.z0, b.z1);
  }
  camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.4, b.top);
  controls.target.y = THREE.MathUtils.clamp(controls.target.y, 0.2, b.top);
}

// ---- walking: thumb joystick (bottom-right) + arrow keys / WASD. up = forward, down = back, left/right = turn
const joy = document.getElementById('joy'), knob = document.getElementById('knob');
const stick = { x: 0, y: 0, on: false }; const keys = new Set(); let doorCooldown = 0;
function setStick(ev) {
  const b = joy.getBoundingClientRect(), R = b.width / 2;
  let dx = ev.clientX - (b.left + R), dy = ev.clientY - (b.top + R);
  const m = Math.hypot(dx, dy), lim = R * 0.62; if (m > lim) { dx *= lim / m; dy *= lim / m; }
  knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  stick.x = dx / lim; stick.y = -dy / lim;   // y up = forward
}
joy.addEventListener('pointerdown', (e) => { try { joy.setPointerCapture(e.pointerId); } catch {} stick.on = true; setStick(e); e.preventDefault(); });
joy.addEventListener('pointermove', (e) => { if (stick.on) setStick(e); });
const release = () => { stick.on = false; stick.x = stick.y = 0; knob.style.transform = 'translate(-50%, -50%)'; };
joy.addEventListener('pointerup', release); joy.addEventListener('pointercancel', release);
const KEYMAP = { ArrowUp: 'f', KeyW: 'f', ArrowDown: 'b', KeyS: 'b', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r' };
addEventListener('keydown', (e) => {
  if (!KEYMAP[e.code] || (e.target.closest && e.target.closest('select,input,textarea'))) return;
  keys.add(KEYMAP[e.code]); e.preventDefault();
});
addEventListener('keyup', (e) => keys.delete(KEYMAP[e.code]));
addEventListener('blur', () => keys.clear());

const UP = new THREE.Vector3(0, 1, 0);
function walk(dt) {
  let fwd = stick.y, turn = stick.x;
  if (!stick.on) { fwd = (keys.has('f') ? 1 : 0) - (keys.has('b') ? 1 : 0); turn = (keys.has('r') ? 1 : 0) - (keys.has('l') ? 1 : 0); }
  if (Math.abs(fwd) < 0.12 && Math.abs(turn) < 0.12) return;
  const r = rooms[cur]; if (!r) return;
  if (shifted) { shifted = false; camera.clearViewOffset(); camera.fov = 60; fitAspect(); }   // leave the painting frame
  const eye = r.eye_height || 1.65;
  const dir = controls.target.clone().sub(camera.position); dir.y = 0;
  if (dir.lengthSq() < 1e-6) dir.set(0, 0, -1);
  dir.normalize().applyAxisAngle(UP, -turn * 1.7 * dt);           // right = turn right (clockwise from above)
  camera.position.addScaledVector(dir, fwd * 2.6 * dt); camera.position.y = eye;
  clampToRoom(); camera.position.y = eye;
  controls.target.copy(camera.position).addScaledVector(dir, 3); controls.target.y = eye;
  // walk into a doorway ring -> next room (same as clicking it)
  if (performance.now() < doorCooldown) return;
  const b = roomBox(r), p = new THREE.Vector3();
  for (const d of doors) {
    d.getWorldPosition(p);
    if (p.x < b.x0 - 3 || p.x > b.x1 + 3 || p.z < b.z0 - 3 || p.z > b.z1 + 3) continue;   // not this room's door
    if (Math.hypot(p.x - camera.position.x, p.z - camera.position.z) < 1.8) { goRoom(d.userData.door_to); return; }
  }
}

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  walk(dt); controls.update(); clampToRoom(); renderer.render(scene, camera);
});
