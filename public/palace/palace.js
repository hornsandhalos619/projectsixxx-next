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
const ASSETS = {
  hotspots: '/palace/palace-hotspots.json',
};
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
controls.enableDamping = !reduceMotion; controls.maxPolarAngle = Math.PI * 0.95;

const rooms = {}; const hotspots = []; const ceilings = []; let portal = null;
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
  camera.position.copy(b2t(r.cam_pos)); controls.target.copy(b2t(r.cam_target));
  controls.maxDistance = span * 1.5; controls.update();
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
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  controls.update(); renderer.render(scene, camera);
});
