// Palace of Wonders — game vertical slice (Entrance Hall + Great Hall). Three.js r170, static site.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeMaterials, setLoadingManager, worldUV, ramHorn, setAnisotropy } from './materials.js';
import { buildWorld } from './world.js';
import { U, glowSprite } from './fx.js';
import { buildProducts, productPanel, setProductLoadingManager } from './products.js';
import { buildNPCs, dialogueUI } from './npc.js';
import { makeControls } from './controls.js';
import { makeAudio } from './audio.js';

const qs = new URLSearchParams(location.search);
const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 820);
const lowFx = qs.get('fx') !== '1'; // bloom is opt-in (?fx=1): hot specular highlights on the marble can bloom into squares
const $ = (id) => document.getElementById(id);

// ---------- renderer ----------
const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' });
const PR = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75);
renderer.setPixelRatio(PR); U.uPR.value = PR;
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
setAnisotropy(Math.min(mobile ? 4 : 8, renderer.capabilities.getMaxAnisotropy()));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050405);
scene.fog = new THREE.FogExp2(0x0a0708, 0.018);
const camera = new THREE.PerspectiveCamera(mobile ? 70 : 62, innerWidth / innerHeight, 0.05, 120);
scene.add(camera);

// ---------- loading ----------
const manager = new THREE.LoadingManager();
let loaded = 0, total = 1;
manager.onProgress = (_u, l, t) => { loaded = l; total = t; const p = Math.round((l / t) * 100); $('pct').textContent = p + '%'; $('bar-fill').style.width = p + '%'; };
setLoadingManager(manager); setProductLoadingManager(manager);
const gltfLoader = new GLTFLoader(manager); gltfLoader.setMeshoptDecoder(MeshoptDecoder);
const npcLoader = new GLTFLoader(); npcLoader.setMeshoptDecoder(MeshoptDecoder); // streamed after the hall is visible

const M = makeMaterials();
const world = buildWorld(scene, M, { mobile, shadows: true });

const [products, dialogue] = await Promise.all([fetch('data/products.json').then((r) => r.json()), fetch('data/dialogue.json').then((r) => r.json())]);
const prod = buildProducts(scene, M, products, world);
// vertex tangents for every normal-mapped mesh (avoids derivative-based tangent frames, which some mobile/software GPUs get wrong)
function addTangents(root) {
  root.traverse((o) => {
    if (!o.isMesh || o.isSkinnedMesh || !o.material || !o.material.normalMap || o.geometry.attributes.tangent) return;
    let g = o.geometry; if (!g.attributes.uv || !g.attributes.normal) return;
    try { if (!g.index) g = mergeVertices(g, 1e-5); g.computeTangents(); o.geometry = g; } catch (e) { console.warn('tangents', e.message); }
  });
}
addTangents(scene);

// ---------- statues: CC0 Three D Scans, restyled (obsidian Pan with modelled ram horns; alabaster Neptune with a gold halo) ----------
async function statue(file, spot, mat, height) {
  const g = await gltfLoader.loadAsync(file);
  let mesh = null; g.scene.updateMatrixWorld(true); g.scene.traverse((o) => { if (o.isMesh && !mesh) mesh = o; });
  // de-quantize (meshopt/KHR_mesh_quantization stores int16 positions + a node transform) into float positions
  const src = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry; const sp = src.attributes.position;
  const f = new Float32Array(sp.count * 3); const v = new THREE.Vector3();
  for (let i = 0; i < sp.count; i++) { v.fromBufferAttribute(sp, i).applyMatrix4(mesh.matrixWorld); f.set([v.x, v.y, v.z], i * 3); }
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(f, 3));
  const geom = worldUV(fg, 0.12); // scans have no UVs; box-project the marble
  geom.computeBoundingBox(); const bb = geom.boundingBox; geom.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2); geom.scale(1 / (bb.max.y - bb.min.y), 1 / (bb.max.y - bb.min.y), 1 / (bb.max.y - bb.min.y));
  const m = new THREE.Mesh(geom, mat); m.castShadow = true; m.receiveShadow = true;
  const grp = new THREE.Group(); grp.add(m); m.scale.setScalar(height);
  grp.position.set(...spot.pos); grp.rotation.y = Math.PI + (spot.side < 0 ? 0.32 : -0.32);
  scene.add(grp);
  // find the head: densest XZ cluster among vertices in the top 14% of the figure
  const p = geom.attributes.position, bins = new Map();
  for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < 0.86) continue; const k = Math.round(p.getX(i) / 0.02) + ':' + Math.round(p.getZ(i) / 0.02); const b = bins.get(k) || { n: 0, x: 0, z: 0, y: 0 }; b.n++; b.x += p.getX(i); b.z += p.getZ(i); b.y = Math.max(b.y, y); bins.set(k, b); }
  let best = null; for (const b of bins.values()) if (!best || b.n > best.n) best = b;
  const head = new THREE.Vector3(best.x / best.n, best.y, best.z / best.n);
  return { grp, m, head, height };
}
const statuesP = Promise.all([
  statue('assets/models/pan.glb', world.statueSpots[0], M.obsidian, 4.6),
  statue('assets/models/neptune.glb', world.statueSpots[1], M.alabaster, 5.0),
]).then(([pan, nep]) => {
  // ram horns on Pan, sized to his head
  for (const sd of [-1, 1]) {
    const h = new THREE.Mesh(ramHorn(sd, 0.95), M.obsidian); h.castShadow = true;
    h.position.copy(pan.head).multiplyScalar(pan.height); h.position.y -= 0.32; h.position.x += sd * 0.02; h.rotation.y = Math.PI; pan.grp.add(h);
  }
  // gold halo ring above Neptune
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 12, 64), M.goldEmissive);
  halo.position.copy(nep.head).multiplyScalar(nep.height); halo.position.y += 0.38; halo.rotation.x = Math.PI / 2 - 0.12; nep.grp.add(halo);
  const gl = glowSprite(0xffd27a, 1.8, 0.5); gl.position.copy(halo.position); nep.grp.add(gl);
  // warm uplights so both colossi read against the dark bays (replaces a separate halo light)
  for (const s of [pan, nep]) { const ul = new THREE.PointLight(0xffb070, 30, 9, 1.6); ul.position.set(0, 0.6, 2.2); s.grp.add(ul); }
  return { pan, nep, halo };
});

// ---------- post ----------
let composer = null;
const canFloatRT = renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float');
if (!lowFx && canFloatRT) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.32, 0.45, 0.93));
  composer.addPass(new OutputPass());
}

// ---------- UI + interaction ----------
const panel = productPanel(products, {});
const controls = makeControls(camera, canvas, world.colliders, { onTap: (x, y) => tapAt(x, y) });
controls.setPose(0, 14.5, 0, -0.02);
const audio = makeAudio(camera, scene, world.audioSpots);
let npcSys = null, dialog = null;
const ray = new THREE.Raycaster(); ray.far = 9;
function interactables() { return [...prod.hitMeshes, ...(npcSys ? npcSys.hitMeshes : []), ...world.interact.filter((i) => i.mesh).map((i) => i.mesh)]; }
function pickAt(ndc) { ray.setFromCamera(ndc, camera); const h = ray.intersectObjects(interactables(), false)[0]; return h ? h.object.userData.interact : null; }
function act(it) {
  if (!it) return;
  if (it.kind === 'product') { dialog && dialog.close(); panel.open(it.handle); }
  else if (it.kind === 'npc') { panel.close(); const n = npcSys.npcs.find((x) => x.id === it.id); dialog.talk(n); }
  else if (it.kind === 'portal') toast('The Ring turns between fire and pale gold. The Ballroom beyond it opens in the next build. <a href="https://projectsixxx.com" target="_blank" rel="noopener">Leave the palace for projectsixxx.com</a>', 7000);
  else if (it.kind === 'door') toast(`The ${it.wing} Wing door. It opens in the next build.`, 3500);
}
function tapAt(x, y) { audio.start(); const it = pickAt(new THREE.Vector2((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1)); act(it); }
let target = null;
addEventListener('keydown', (e) => { if (e.code === 'KeyE' || e.code === 'Enter') { if (target && !(e.target.closest && e.target.closest('input,select,button,a'))) act(target); } if (e.code === 'Escape') { panel.close(); dialog && dialog.close(); } });
$('prompt').addEventListener('click', () => act(target));
$('mute').addEventListener('click', () => { audio.start(); audio.setMuted(!audio.muted); $('mute').textContent = audio.muted ? 'Sound off' : 'Sound on'; $('mute').setAttribute('aria-pressed', String(audio.muted)); });
addEventListener('pointerdown', () => audio.start(), { once: true });
addEventListener('keydown', () => audio.start(), { once: true });
let toastT = 0;
function toast(html, ms = 3000) { const t = $('toast'); t.innerHTML = html; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), ms); }
// pieces list (shop without walking)
const list = $('piece-list');
for (const it of prod.items) { const li = document.createElement('li'); const b = document.createElement('button'); b.textContent = it.p.title; b.addEventListener('click', () => { goTo(it); panel.open(it.p.handle); $('pieces').open = false; }); li.appendChild(b); list.appendChild(li); }
function goTo(it) { const wp = new THREE.Vector3(); it.group.getWorldPosition(wp); const dir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), it.group.rotation.y); const st = wp.clone().addScaledVector(dir, 2.6); controls.setPose(st.x, st.z, Math.atan2(dir.x, dir.z)); }
addEventListener('npc-recommend', (e) => { const it = prod.items.find((i) => i.p.handle === e.detail); if (it) toast(`Mammon points you to: <b>${it.p.title}</b>`, 2600); });

// ---------- environment probe (one-time cube capture of the lit hall for reflections) ----------
function captureEnv() {
  const rt = new THREE.WebGLCubeRenderTarget(mobile ? 128 : 256, { type: THREE.HalfFloatType });
  const cc = new THREE.CubeCamera(0.1, 80, rt); cc.position.set(0, 3.2, -18); scene.add(cc);
  const fog = scene.fog; scene.fog = null;
  const hidden = []; scene.traverse((o) => { const m = o.material; if ((o.isSprite || o.isPoints || (m && (m.blending === THREE.AdditiveBlending || m.isShaderMaterial))) && o.visible) { o.visible = false; hidden.push(o); } });
  cc.update(renderer, scene); scene.fog = fog; for (const o of hidden) o.visible = true;
  const pm = new THREE.PMREMGenerator(renderer); const env = pm.fromCubemap(rt.texture).texture; scene.environment = env; scene.environmentIntensity = 0.45;
  rt.dispose(); pm.dispose(); scene.remove(cc);
}

// ---------- loop ----------
const clock = new THREE.Clock(); let t = 0; let ready = false;
const centre = new THREE.Vector2(0, 0); let lastPick = 0;
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05); t += dt; U.uTime.value = t;
  if (!panel.current && !(dialog && dialog.open)) controls.st.enabled = true;
  controls.update(dt);
  world.update(t);
  if (npcSys) npcSys.update(dt, controls.st.pos, (n) => { if (n.id === 'bifrons') bark(n, dialogue.bifrons.greet[Math.floor(Math.random() * dialogue.bifrons.greet.length)]); });
  if (t - lastPick > 0.12) {
    lastPick = t; const it = pickAt(centre); target = it;
    const p = $('prompt');
    if (it) {
      const label = it.kind === 'product' ? products.products.find((x) => x.handle === it.handle).title : it.kind === 'npc' ? 'Talk to ' + npcSys.npcs.find((n) => n.id === it.id).name : it.kind === 'portal' ? 'The Ring' : it.wing + ' Wing door';
      p.innerHTML = `<span class="k">${mobile ? 'Tap' : 'E'}</span> ${it.kind === 'product' ? 'Inspect ' : ''}${label}`; p.hidden = false;
    } else p.hidden = true;
    $('room').textContent = controls.st.pos.z > 0.4 ? 'Entrance Hall' : 'Great Hall';
  }
  prod.update(t, target && target.kind === 'product' ? target.handle : null);
  if (composer) composer.render(); else renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
function bark(n, text) { toast(`<b>${n.name}:</b> ${text}`, 4200); }
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer && composer.setSize(innerWidth, innerHeight); });

// wait for textures + statues, then light probe + static shadows, then reveal
await statuesP;
await new Promise((res) => { if (loaded >= total) res(); manager.onLoad = res; setTimeout(res, 20000); });
renderer.compile(scene, camera);
if (qs.get('env') !== '0') captureEnv();
renderer.shadowMap.needsUpdate = true;
frame();
$('pct').textContent = '100%'; $('bar-fill').style.width = '100%';
$('enter').hidden = false; $('loadmsg').textContent = 'The doors are open.';
const enter = () => { $('loading').hidden = true; audio.start(); ready = true; };
$('enter').addEventListener('click', enter);
if (qs.get('autostart') === '1') { $('loading').hidden = true; ready = true; }
// NPCs stream in after the hall is visible (progressive loading)
buildNPCs(scene, npcLoader, M, dialogue, world).then((sys) => { npcSys = sys; dialog = dialogueUI(dialogue, products, panel, sys); renderer.shadowMap.needsUpdate = true; window.__game.npcReady = true; });

// test / automation hook
window.__game = { THREE, scene, camera, renderer, controls, panel, world, prod, get npc() { return npcSys; }, get dialog() { return dialog; }, act, setPose: controls.setPose, toast, npcReady: false, bloom: !!composer, canFloatRT };
