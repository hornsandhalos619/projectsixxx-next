// Palace of Wonders v3.2: painting-projected rooms (unlit, emission-only) with a fragment
// projective shader so surfaces stay sharp off-axis, plus animated fire / candles.
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
const liteFx = reduceMotion || !!navigator.connection?.saveData ||
  (matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 800);

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, logarithmicDepthBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, liteFx ? 1.25 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.NoToneMapping;   // painted surfaces are emission-only: show the painting's exact colours
renderer.outputColorSpace = THREE.SRGBColorSpace;
const maxAniso = renderer.capabilities.getMaxAnisotropy();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05060a);
scene.add(new THREE.HemisphereLight(0x9fb4d8, 0x1a1210, 0.6));
const moon = new THREE.DirectionalLight(0xbfd0ff, 0.6); moon.position.set(60, 120, 40); scene.add(moon);

// Tight clip range (was 0.1–1500): cuts z-fighting on floor decals and thin props. Log depth is the backstop.
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.25, 300);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = !reduceMotion;
controls.maxPolarAngle = Math.PI * 0.5;   // never orbit below the target (eye level): the camera can't drop under the floor
controls.minDistance = 0.3;

const rooms = {}; const hotspots = []; const ceilings = []; const doors = []; const fxNodes = [];
let portal = null; let cur = null;
const b2t = (v) => new THREE.Vector3(v[0], v[2] ?? 0, -v[1]);   // Blender (x,y,z) -> three (x,z,-y)

function prepTex(t) {
  if (!t || !t.isTexture) return;
  t.anisotropy = maxAniso;
  t.colorSpace = THREE.SRGBColorSpace;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = true;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.needsUpdate = true;
}

const paintingVert = /* glsl */`
  varying vec3 vWorld;
  #include <common>
  #include <logdepthbuf_pars_vertex>
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
    #include <logdepthbuf_vertex>
  }
`;
const paintingFrag = /* glsl */`
  uniform sampler2D map;
  uniform vec3 fill;
  uniform vec3 off;   // Blender room origin (off.x, off.y, 0)
  uniform float hc;
  uniform float vx;
  uniform float vy;
  uniform float k;      // 2 * tan(hfov/2)
  uniform float kasp;   // 2 * tan(hfov/2) * 9/16
  uniform vec3 camPos;
  uniform vec2 mapSize;
  varying vec3 vWorld;
  #include <common>
  #include <logdepthbuf_pars_fragment>

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float grain(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  void main() {
    #include <logdepthbuf_fragment>
    // Three Y-up world -> room-local Blender: (x, -z, y) - off
    float xl = vWorld.x - off.x;
    float yl = -vWorld.z - off.y;
    float zl = vWorld.y;
    vec3 r = vec3(xl, yl, zl - hc);

    float g = grain(vWorld * 6.0);
    vec3 fillC = fill * (0.90 + 0.20 * grain(vWorld * 3.2));

    if (r.y < 0.08) {
      gl_FragColor = vec4(fillC, 1.0);
      return;
    }
    float u = vx + r.x / (r.y * k);
    float v = vy - r.z / (r.y * kasp);
    // Feather the painting edge instead of clamping UVs (clamp is what tore/smeared the walls and floors).
    float inx = smoothstep(-0.008, 0.016, u) * smoothstep(-0.008, 0.016, 1.0 - u);
    float iny = smoothstep(-0.008, 0.016, v) * smoothstep(-0.008, 0.016, 1.0 - v);
    float inside = inx * iny;
    vec3 paint = fillC;
    if (inside > 0.001) {
      vec2 uv = vec2(u, v);
      paint = texture2D(map, uv).rgb;
      float dist = length(camPos - vWorld);
      float sharp = smoothstep(5.0, 1.1, dist) * 0.30;
      if (sharp > 0.02) {
        vec2 px = 1.0 / mapSize;
        vec3 blur = (
          texture2D(map, uv + vec2(px.x, 0.0)).rgb +
          texture2D(map, uv - vec2(px.x, 0.0)).rgb +
          texture2D(map, uv + vec2(0.0, px.y)).rgb +
          texture2D(map, uv - vec2(0.0, px.y)).rgb
        ) * 0.25;
        paint += (paint - blur) * sharp;
      }
      paint *= 1.0 + (g - 0.5) * smoothstep(4.0, 0.5, dist) * 0.16;
    }
    gl_FragColor = vec4(mix(fillC, paint, inside), 1.0);
  }
`;

function colorFromMat(m) {
  if (!m) return new THREE.Color(0x1a1614);
  const e = m.emissive, c = m.color;
  if (e && e.r + e.g + e.b > 0.02) return e.clone();
  if (c) return c.clone();
  return new THREE.Color(0x1a1614);
}

function makePaintingMat(tex, room, fill) {
  const T = Math.tan(THREE.MathUtils.degToRad(room.hfov || 75) / 2);
  const ASP = 0.5625;
  const off = room.off || (room.cam_pos ? [room.cam_pos[0], room.cam_pos[1], 0] : [0, 0, 0]);
  const hc = room.hc != null ? room.hc : (room.cam_pos ? room.cam_pos[2] : 1.6);
  const vx = (room.vp_x != null ? room.vp_x : 50) / 100;
  const vy = (room.vp_y != null ? room.vp_y : 50) / 100;
  const img = tex && tex.image;
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: tex },
      fill: { value: fill },
      off: { value: new THREE.Vector3(off[0] || 0, off[1] || 0, 0) },
      hc: { value: hc },
      vx: { value: vx },
      vy: { value: vy },
      k: { value: 2 * T },
      kasp: { value: 2 * T * ASP },
      camPos: { value: camera.position },
      mapSize: { value: new THREE.Vector2(img && img.width ? img.width : 1600, img && img.height ? img.height : 900) },
    },
    vertexShader: paintingVert,
    fragmentShader: paintingFrag,
    side: THREE.FrontSide,
    toneMapped: false,
    lights: false,
  });
}

function isPaintingMat(m) {
  if (!m) return false;
  const n = m.name || '';
  const u = m.userData || {};
  if (u.projected_painting || u.vp_x != null || n.startsWith('MP_')) return true;
  // gltf-transform may keep the Blender name on the material
  if (/_painting$/.test(n) || n.startsWith('MP')) return true;
  return false;
}

const DECAL_RE = /rug|runner|mat|chessboard|placemat|doormat|HS2D_/i;
const ARCH_RE = /^(ARCH_|CEIL_)/;

// ---- fire / candle / lantern sprites (procedural, no extra textures)
const flameVert = /* glsl */`
  varying vec2 vUv;
  #include <common>
  #include <logdepthbuf_pars_vertex>
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #include <logdepthbuf_vertex>
  }
`;
const flameFrag = /* glsl */`
  uniform float time;
  uniform float phase;
  uniform float kind; // 0 hearth, 1 torch, 2 candle, 3 chandelier, 4 lantern
  varying vec2 vUv;
  #include <common>
  #include <logdepthbuf_pars_fragment>
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
  }
  void main(){
    #include <logdepthbuf_fragment>
    vec2 uv = vUv;
    float t = time;
    // scroll noisy domain upward
    float n = noise(vec2(uv.x * 4.0 + phase, uv.y * 3.2 - t * 1.9));
    n += 0.5 * noise(vec2(uv.x * 8.0 - phase, uv.y * 6.0 - t * 3.1));
    float waver = 0.06 * sin(t * 7.0 + phase + uv.y * 6.0);
    float w = 0.18 + 0.28 * (1.0 - uv.y);
    if (kind > 1.5 && kind < 3.5) w *= 0.72; // candles / chandelier tongues
    float shape = 1.0 - smoothstep(w, w + 0.12, abs(uv.x - 0.5 - waver * (1.0 - uv.y)));
    shape *= smoothstep(0.0, 0.08, uv.y) * (1.0 - smoothstep(0.55, 1.0, uv.y + n * 0.22));
    float f = shape * (0.55 + 0.6 * n);
    if (f < 0.07) discard;
    vec3 col = mix(vec3(0.55, 0.06, 0.01), vec3(1.0, 0.55, 0.08), clamp(f, 0.0, 1.0));
    col = mix(col, vec3(1.0, 0.92, 0.55), smoothstep(0.65, 1.05, f));
    if (kind > 3.5) { // lantern: smaller, warmer, more glow
      col = mix(vec3(0.7, 0.25, 0.02), vec3(1.0, 0.8, 0.35), clamp(f, 0.0, 1.0));
    }
    float alpha = smoothstep(0.08, 0.28, f) * 0.7;
    gl_FragColor = vec4(col, alpha);
  }
`;
const smokeFrag = /* glsl */`
  uniform float time;
  uniform float phase;
  varying vec2 vUv;
  #include <common>
  #include <logdepthbuf_pars_fragment>
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
  }
  void main(){
    #include <logdepthbuf_fragment>
    vec2 uv = vUv;
    float n = noise(vec2(uv.x * 3.0 + phase + time * 0.15, uv.y * 2.0 - time * 0.35));
    float m = (1.0 - uv.y) * smoothstep(0.0, 0.15, uv.y) * (1.0 - smoothstep(0.25, 0.5, abs(uv.x - 0.5 - 0.08 * sin(time * 0.7 + uv.y * 3.0 + phase))));
    float a = m * n * 0.28;
    if (a < 0.03) discard;
    gl_FragColor = vec4(vec3(0.18, 0.16, 0.14), a);
  }
`;
const emberVert = /* glsl */`
  attribute float aSeed;
  uniform float time;
  uniform float height;
  varying float vLife;
  #include <common>
  #include <logdepthbuf_pars_vertex>
  void main(){
    float cycle = 2.4 + fract(aSeed * 5.3) * 2.2;
    float life = fract(time * (0.25 + fract(aSeed) * 0.2) + aSeed);
    vLife = life;
    vec3 p = position;
    float rise = life * height;
    p.y += rise;
    p.x += sin(life * 6.28 + aSeed * 10.0) * (0.08 + rise * 0.12);
    p.z += cos(life * 5.1 + aSeed * 7.0) * (0.08 + rise * 0.10);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp((2.5 + 2.5 * (1.0 - life)) * (40.0 / max(-mv.z, 0.2)), 1.2, 7.0);
    #include <logdepthbuf_vertex>
  }
`;
const emberFrag = /* glsl */`
  varying float vLife;
  #include <common>
  #include <logdepthbuf_pars_fragment>
  void main(){
    #include <logdepthbuf_fragment>
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float a = (1.0 - vLife) * (1.0 - smoothstep(0.15, 0.5, d));
    vec3 col = mix(vec3(1.0, 0.85, 0.4), vec3(1.0, 0.3, 0.05), vLife);
    gl_FragColor = vec4(col, a);
  }
`;

const KIND_ID = { hearth: 0, torch: 1, candle: 2, chandelier: 3, lantern: 4 };
const fxItems = [];

function fxMat(frag, extra) {
  return new THREE.ShaderMaterial({
    uniforms: Object.assign({ time: { value: 0 }, phase: { value: Math.random() * 10 }, kind: { value: 0 } }, extra || {}),
    vertexShader: flameVert,
    fragmentShader: frag,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
  });
}

function makeFx(node) {
  const u = node.userData || {};
  const kind = u.fx; if (!kind) return;
  const scale = u.fx_scale || 1;
  const group = new THREE.Group();
  node.add(group);
  const phase = Math.random() * 10;
  const cards = [];
  const nFlames = kind === 'hearth' ? 2 : kind === 'chandelier' ? (liteFx ? 2 : 4) : 1;
  const baseH = ({ hearth: 0.32, torch: 0.20, candle: 0.09, chandelier: 0.07, lantern: 0.12 }[kind] || 0.15) * scale;
  const baseW = ({ hearth: 0.18, torch: 0.08, candle: 0.04, chandelier: 0.035, lantern: 0.06 }[kind] || 0.08) * scale;
  for (let i = 0; i < nFlames; i++) {
    const mat = fxMat(flameFrag);
    mat.uniforms.phase.value = phase + i * 0.9;
    mat.uniforms.kind.value = KIND_ID[kind] ?? 1;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(baseW * (0.75 + Math.random() * 0.5), baseH * (0.8 + Math.random() * 0.4)), mat);
    if (kind === 'chandelier') {
      const a = (i / nFlames) * Math.PI * 2;
      mesh.position.set(Math.cos(a) * 0.35 * scale, -0.05, Math.sin(a) * 0.35 * scale);
    } else if (kind === 'hearth') {
      mesh.position.set((i - (nFlames - 1) / 2) * 0.10 * scale, baseH * 0.42, 0.015 * i);
    } else {
      mesh.position.y = baseH * 0.45;
    }
    mesh.renderOrder = 2;
    group.add(mesh); cards.push(mesh);
  }
  let smoke = [];
  if (kind === 'hearth' && !liteFx) {
    for (let i = 0; i < 2; i++) {
      const mat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, phase: { value: phase + i } },
        vertexShader: flameVert, fragmentShader: smokeFrag,
        transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
        blending: THREE.NormalBlending,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.7 * scale, 1.4 * scale), mat);
      mesh.position.set((i - 0.5) * 0.15, 1.1 * scale, 0);
      mesh.renderOrder = 1;
      group.add(mesh); smoke.push(mesh);
    }
  }
  let embers = null;
  if ((kind === 'hearth' || kind === 'torch') && !reduceMotion) {
    const n = liteFx ? (kind === 'hearth' ? 18 : 8) : (kind === 'hearth' ? 40 : 14);
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.3 * scale;
      pos[i * 3 + 1] = Math.random() * 0.15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.15 * scale;
      seed[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, height: { value: (kind === 'hearth' ? 1.6 : 0.7) * scale } },
      vertexShader: emberVert, fragmentShader: emberFrag,
      transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending,
    });
    embers = new THREE.Points(g, mat);
    embers.renderOrder = 3;
    group.add(embers);
  }
  let light = null;
  const intensity = ({ hearth: 1.8, torch: 0.8, candle: 0.28, chandelier: 1.0, lantern: 0.7 }[kind] || 0.6) * scale;
  const dist = ({ hearth: 6, torch: 3.5, candle: 1.8, chandelier: 5, lantern: 3.2 }[kind] || 3) * Math.sqrt(scale);
  light = new THREE.PointLight(kind === 'lantern' || kind === 'chandelier' ? 0xffc878 : 0xff7a2a, reduceMotion ? intensity * 0.7 : intensity, dist, 2);
  light.position.set(0, baseH * 0.5, 0.05);
  group.add(light);
  fxItems.push({ kind, node, group, cards, smoke, embers, light, intensity, phase, room: u.room });
}

function updateFx(t) {
  // Only light the current room; cap concurrent point lights for mobile.
  const here = [];
  for (const fx of fxItems) {
    const on = fx.room === cur;
    fx.group.visible = on;
    if (fx.light) fx.light.visible = false;
    if (on) here.push(fx);
  }
  here.sort((a, b) => {
    const pa = a.node.getWorldPosition(new THREE.Vector3());
    const pb = b.node.getWorldPosition(new THREE.Vector3());
    return pa.distanceToSquared(camera.position) - pb.distanceToSquared(camera.position);
  });
  const lightCap = liteFx ? 2 : 3;
  for (let i = 0; i < here.length; i++) {
    const fx = here[i];
    for (const c of fx.cards) {
      if (c.material.uniforms.time) c.material.uniforms.time.value = t;
      const camL = c.parent.worldToLocal(camera.position.clone());
      camL.y = c.position.y;
      c.lookAt(camL);
    }
    for (const s of fx.smoke) {
      s.material.uniforms.time.value = t;
      const camL = s.parent.worldToLocal(camera.position.clone());
      camL.y = s.position.y;
      s.lookAt(camL);
    }
    if (fx.embers) fx.embers.material.uniforms.time.value = t;
    if (fx.light && i < lightCap) {
      fx.light.visible = true;
      if (!reduceMotion) {
        const flicker = 1 + 0.18 * Math.sin(t * 6.7 + fx.phase) + 0.12 * Math.sin(t * 13.3 + fx.phase * 1.7) + 0.08 * Math.sin(t * 23.0 + fx.phase * 0.4);
        fx.light.intensity = fx.intensity * flicker;
      }
    }
  }
}

const fxCatalogP = fetch(ASSETS.hotspots).then((r) => r.json()).catch(() => ({ fx: [] }));
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
loader.load(CONFIG.model, async (gltf) => {
  try {
  scene.add(gltf.scene);
  const paintingByRoom = {};
  const catalog = await fxCatalogP;
  const byId = new Map();
  if (catalog && Array.isArray(catalog.hotspots)) {
    for (const spot of catalog.hotspots) {
      if (spot && spot.hotspot_id) byId.set(spot.hotspot_id, spot);
    }
  }
  gltf.scene.traverse((o) => {
    const u = o.userData || {};
    if (u.hotspot_id && byId.has(u.hotspot_id)) Object.assign(u, byId.get(u.hotspot_id));
    if (catalog && catalog.palace_2d_url && u.interactive === 'portal') u.link_url = catalog.palace_2d_url;
    if (u.room_slug) rooms[u.room_slug] = u;
    if (u.ceiling) ceilings.push(o);
    if (o.name === 'PORTAL') portal = o;
    if (u.hotspot_id && o.type === 'Object3D') hotspots.push(o);
    if (u.interactive === 'door') doors.push(o);
    if (u.fx) fxNodes.push(o);
    if (o.isMesh) {
      const mats = [].concat(o.material || []);
      const arch = ARCH_RE.test(o.name);
      const decal = DECAL_RE.test(o.name) || (u.interactive === 'object2d' && /rug|runner|mat|chessboard|placemat|doormat/i.test(u.name2d || ''));
      mats.forEach((m) => {
        if (!m) return;
        m.side = arch ? THREE.FrontSide : THREE.DoubleSide;
        if (m.map) prepTex(m.map);
        if (m.emissiveMap) prepTex(m.emissiveMap);
        if (decal) { m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2; }
      });
    }
  });
  function roomOf(o) {
    for (let x = o; x; x = x.parent) {
      const u = x.userData || {};
      if (u.room && rooms[u.room]) return rooms[u.room];
      if (u.room_slug && rooms[u.room_slug]) return rooms[u.room_slug];
    }
    const n = o.name || '';
    const slugs = Object.keys(rooms).sort((a, b) => b.length - a.length);
    for (const s of slugs) if (n.includes(s)) return rooms[s];
    return null;
  }
  // Replace painted-surface materials with the projective shader (per room).
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    const r = roomOf(o);
    const mats = [].concat(o.material || []);
    const fillSrc = mats.find((m) => m && !isPaintingMat(m)) || mats[1] || mats[0];
    const next = mats.map((m) => {
      if (!isPaintingMat(m) || !r) return m;
      const tex = m.emissiveMap || m.map;
      if (!tex) return m;
      prepTex(tex);
      const fill = colorFromMat(fillSrc);
      const key = (r.room_slug || '') + '|' + tex.uuid + '|' + fill.getHexString();
      if (!paintingByRoom[key]) {
        const mat = makePaintingMat(tex, r, fill);
        mat.polygonOffset = true; mat.polygonOffsetFactor = -1; mat.polygonOffsetUnits = -1;
        paintingByRoom[key] = mat;
      }
      return paintingByRoom[key];
    });
    o.material = next.length === 1 ? next[0] : next;
  });
  if (!fxNodes.length) {
    const cat = catalog;
    for (const rec of (cat.fx || [])) {
      const o = new THREE.Object3D();
      o.position.copy(b2t(rec.pos));
      o.userData = { fx: rec.kind, fx_scale: rec.scale, room: rec.room, fx_src: rec.src };
      scene.add(o);
      fxNodes.push(o);
    }
  }
  fxNodes.forEach(makeFx);
  const skip = document.getElementById('skip');
  if (skip) skip.href = (catalog && catalog.shop) || DEFAULT_SHOP;
  buildRoomMenu(); goRoom((catalog && catalog.start_room) || CONFIG.startRoom);
  document.getElementById('loading').hidden = true;
  } catch (err) {
    console.error(err);
    document.getElementById('loading').hidden = false;
    document.getElementById('loading').textContent = 'The palace could not open: ' + (err && err.message ? err.message : err);
  }
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
  walk(dt); controls.update(); clampToRoom();
  updateFx(clock.elapsedTime);
  renderer.render(scene, camera);
});
