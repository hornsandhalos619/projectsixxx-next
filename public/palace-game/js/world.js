// Architecture + set dressing for the vertical slice: Entrance Hall (z 0..16) and Great Hall (z 0..-44).
// Everything here is real geometry; no painted walls. Units: metres. Player looks down -Z at start.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { worldUV, arcRib } from './materials.js';
import { makeFire, makeEmbers, makeSmoke, glowSprite, makeCandleFlames, sway, portalMaterial, flicker, U } from './fx.js';

export const HALL = { halfW: 9, z0: 0, z1: -44, spring: 10, R: 9 };
export const HALLWAY = { halfW: 3, z0: 0.8, z1: 16, spring: 4.5, R: 3 };
export const BAYS = [-1, -7, -13, -19, -25, -31, -37, -43]; // column lines
const bayC = (k) => (BAYS[k] + BAYS[k + 1]) / 2; // bay centres: -4,-10,-16,-22,-28,-34,-40

// Product display slots (consumed by products.js). pos = floor point, rotY = facing.
export const SLOTS = {
  hallL: { pos: [-2.93, 2.0, 8.0], rotY: Math.PI / 2, wall: true },
  hallR: { pos: [2.93, 2.0, 8.0], rotY: -Math.PI / 2, wall: true },
  tapL1: { pos: [-8.95, 3.0, bayC(0)], rotY: Math.PI / 2, wall: true },
  tapL2: { pos: [-8.95, 3.0, bayC(4)], rotY: Math.PI / 2, wall: true },
  tapR1: { pos: [8.95, 3.0, bayC(0)], rotY: -Math.PI / 2, wall: true },
  tapR2: { pos: [8.95, 3.0, bayC(2)], rotY: -Math.PI / 2, wall: true },
  manL1: { pos: [-3.6, 0, -8.6], rotY: Math.PI / 2 - 0.35 },
  manL2: { pos: [-3.6, 0, -11.6], rotY: Math.PI / 2 - 0.2 },
  manR1: { pos: [3.6, 0, -8.6], rotY: -Math.PI / 2 + 0.35 },
  manR2: { pos: [3.6, 0, -11.6], rotY: -Math.PI / 2 + 0.2 },
  pedL: { pos: [-2.7, 0, -21.5], rotY: Math.PI / 2 },
  pedR: { pos: [2.7, 0, -21.5], rotY: -Math.PI / 2 },
  easelL: { pos: [-2.6, 0, -38.2], rotY: 0.45 },
  easelR: { pos: [2.6, 0, -38.2], rotY: -0.45 },
};

export function buildWorld(scene, M, { mobile = false, shadows = true } = {}) {
  const buckets = new Map();
  const colliders = { boxes: [], circles: [] };
  const fires = []; // {light, base, seed}
  const audioSpots = [];
  const interact = [];
  const candlePos = [];
  const box = (x0, x1, z0, z1) => colliders.boxes.push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) });
  const circ = (x, z, r) => colliders.circles.push({ x, z, r });

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s3 = new THREE.Vector3(), p3 = new THREE.Vector3();
  function add(mat, geom, { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1], uv = 2 } = {}) {
    m4.compose(p3.set(...pos), q.setFromEuler(e.set(...rot)), s3.set(...scale));
    const g = worldUV(geom.clone(), uv, m4);
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!buckets.has(mat)) buckets.set(mat, []);
    buckets.get(mat).push(g);
  }
  // map an extruded 2D shape (u,v,w) into the world with a function; flips winding if the map mirrors.
  function mapGeom(geom, fn, flip) {
    let g = geom.index ? geom.toNonIndexed() : geom;
    const p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { fn(v.fromBufferAttribute(p, i)); p.setXYZ(i, v.x, v.y, v.z); }
    if (flip) for (let i = 0; i < p.count; i += 3) { const x = p.getX(i + 1), y = p.getY(i + 1), z = p.getZ(i + 1); p.setXYZ(i + 1, p.getX(i + 2), p.getY(i + 2), p.getZ(i + 2)); p.setXYZ(i + 2, x, y, z); }
    g.deleteAttribute('normal'); g.computeVertexNormals();
    return g;
  }
  const G = {
    box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
    cyl: (r0, r1, h, s = 16) => new THREE.CylinderGeometry(r0, r1, h, s),
    torus: (r, t, rs = 8, ts = 32, arc = Math.PI * 2) => new THREE.TorusGeometry(r, t, rs, ts, arc),
  };

  // ---------------- floors ----------------
  add(M.floor, new THREE.PlaneGeometry(18, 44).rotateX(-Math.PI / 2), { pos: [0, 0, -22], uv: 3 });
  add(M.floor, new THREE.PlaneGeometry(6, 15.2).rotateX(-Math.PI / 2), { pos: [0, 0, 8.4], uv: 3 });
  add(M.blackMarble, new THREE.PlaneGeometry(6, 0.8).rotateX(-Math.PI / 2), { pos: [0, 0.001, 0.4], uv: 3 });
  // gold inlay: border lines either side of the runner + a grid of cross-lines every bay
  for (const x of [-1.95, 1.95]) add(M.goldBright, G.box(0.05, 0.006, 58), { pos: [x, 0.003, -13.5] });
  for (const x of [-8.3, 8.3]) add(M.goldBright, G.box(0.05, 0.006, 44), { pos: [x, 0.003, -22] });
  for (const z of BAYS) add(M.goldBright, G.box(16.6, 0.006, 0.05), { pos: [0, 0.003, z] });
  // carpet runner (own UVs, tiles along its length)
  {
    const len = 57.5, w = 3.2;
    const g = new THREE.PlaneGeometry(w, len, 1, 1).rotateX(-Math.PI / 2);
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) * len / (w * 2));
    const carpet = new THREE.Mesh(g, M.carpet); carpet.position.set(0, 0.012, 15.5 - len / 2); carpet.receiveShadow = true; scene.add(carpet);
    add(M.goldBright, G.box(0.06, 0.02, len), { pos: [-w / 2, 0.012, 15.5 - len / 2] });
    add(M.goldBright, G.box(0.06, 0.02, len), { pos: [w / 2, 0.012, 15.5 - len / 2] });
  }

  // ---------------- Great Hall walls ----------------
  for (const sd of [-1, 1]) {
    add(M.stone, G.box(0.6, 10.2, 44.4), { pos: [sd * 9.3, 5.1, -22], uv: 2.5 });
    box(sd * 9, sd * 10, 1, -45);
    // arcade wall at |x| = 8..8.4 with 7 arched bay openings (real extruded shape)
    const sh = new THREE.Shape(); sh.moveTo(0, 0);
    for (let k = 0; k < 7; k++) {
      const uc = -bayC(k), uL = uc - 2.25, uR = uc + 2.25;
      sh.lineTo(uL, 0); sh.lineTo(uL, 6.2); sh.absarc(uc, 6.2, 2.25, Math.PI, 0, true); sh.lineTo(uR, 0);
      // solid pier colliders between bays
    }
    sh.lineTo(44, 0); sh.lineTo(44, 10); sh.lineTo(0, 10); sh.lineTo(0, 0);
    const ex = new THREE.ExtrudeGeometry(sh, { depth: 0.4, bevelEnabled: false, curveSegments: 24 });
    const g = mapGeom(ex, (v) => v.set(sd * (8.0 + v.z), v.y, -v.x), sd > 0);
    add(M.stone, g, { uv: 2.5 });
    // gold archivolt on each arch + cornice
    for (let k = 0; k < 7; k++) {
      add(M.goldBright, arcRib(2.35, 0.06, 0.1, 0, Math.PI, 28), { pos: [sd * 7.98, 6.2, bayC(k)], rot: [0, Math.PI / 2, 0] });
      add(M.stoneDark, arcRib(2.55, 0.16, 0.2, 0, Math.PI, 28), { pos: [sd * 7.95, 6.2, bayC(k)], rot: [0, Math.PI / 2, 0] });
    }
    add(M.goldBright, G.box(0.5, 0.12, 44), { pos: [sd * 8.2, 10.02, -22] });
    add(M.stoneDark, G.box(0.7, 0.35, 44), { pos: [sd * 8.25, 9.8, -22] });
    // piers between arches are solid
    let prev = 1;
    for (let k = 0; k < 7; k++) { const zL = bayC(k) + 2.25; box(sd * 7.95, sd * 8.45, prev, zL); prev = bayC(k) - 2.25; }
    box(sd * 7.95, sd * 8.45, prev, -45);
    // a dado of dark marble inside each bay
    add(M.blackMarble, G.box(0.08, 1.0, 44), { pos: [sd * 8.97, 0.5, -22], uv: 2 });
    add(M.goldBright, G.box(0.1, 0.05, 44), { pos: [sd * 8.97, 1.02, -22] });
  }
  // end walls (vault profile) — front with the Entrance Hall opening, back with the Portal
  {
    const outer = (s) => { s.moveTo(-9, 0); s.lineTo(9, 0); s.lineTo(9, 10); s.absarc(0, 10, 9, 0, Math.PI, false); s.lineTo(-9, 0); };
    const f = new THREE.Shape(); f.moveTo(-9, 0); f.lineTo(-3, 0); f.lineTo(-3, 4.5); f.absarc(0, 4.5, 3, Math.PI, 0, true); f.lineTo(3, 0); f.lineTo(9, 0); f.lineTo(9, 10); f.absarc(0, 10, 9, 0, Math.PI, false); f.lineTo(-9, 0);
    add(M.stone, mapGeom(new THREE.ExtrudeGeometry(f, { depth: 0.8, bevelEnabled: false, curveSegments: 40 }), (v) => v.set(v.x, v.y, v.z), false), { uv: 2.5 });
    box(-10, -3, -0.05, 0.85); box(3, 10, -0.05, 0.85);
    add(M.goldBright, arcRib(3.25, 0.12, 0.18, 0, Math.PI, 32), { pos: [0, 4.5, -0.04] });
    for (const x of [-3.16, 3.16]) add(M.goldBright, G.box(0.18, 4.5, 0.12), { pos: [x, 2.25, -0.04] });
    const b = new THREE.Shape(); outer(b); const hole = new THREE.Path(); hole.absarc(0, 4.2, 3.95, 0, Math.PI * 2, true); b.holes.push(hole);
    add(M.stone, mapGeom(new THREE.ExtrudeGeometry(b, { depth: 0.8, bevelEnabled: false, curveSegments: 48 }), (v) => v.set(v.x, v.y, -44 - v.z), true), { uv: 2.5 });
    box(-10, 10, -43.6, -46);
  }
  // ---------------- Great Hall vault: barrel + real coffer ribs ----------------
  {
    const segA = 64, segZ = 1; const g = new THREE.PlaneGeometry(1, 1, segA, segZ);
    const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) + 0.5, v = p.getY(i) + 0.5; const a = Math.PI * u; const z = -44 * v;
      p.setXYZ(i, 9 * Math.cos(a), 10 + 9 * Math.sin(a), z); uv.setXY(i, (9 * a) / 2.5, z / 2.5);
    }
    g.computeVertexNormals();
    const vault = new THREE.Mesh(g, M.stoneDark); vault.material = M.stoneDark; scene.add(vault);
    vault.geometry = flipIfOutward(g, new THREE.Vector3(0, 10, -22));
    const ribAngles = []; for (let i = 1; i < 8; i++) ribAngles.push(Math.PI * i / 8);
    for (let z = 0; z >= -44; z -= 2) {
      const major = BAYS.includes(z) || z === 0 || z === -44;
      add(M.stoneDark, arcRib(9, major ? 0.42 : 0.24, major ? 0.55 : 0.36, 0, Math.PI, 48), { pos: [0, 10, z === 0 ? -0.2 : z === -44 ? -43.8 : z] });
      add(M.goldBright, arcRib(major ? 8.46 : 8.65, 0.07, 0.03, 0, Math.PI, 48), { pos: [0, 10, z === 0 ? -0.2 : z === -44 ? -43.8 : z] });
    }
    for (const a of ribAngles) {
      add(M.stoneDark, G.box(0.36, 0.24, 44), { pos: [8.82 * Math.cos(a), 10 + 8.82 * Math.sin(a), -22], rot: [0, 0, a] });
      add(M.goldBright, G.box(0.03, 0.07, 44), { pos: [8.63 * Math.cos(a), 10 + 8.63 * Math.sin(a), -22], rot: [0, 0, a] });
      for (let z = -2; z > -44; z -= 2) add(M.goldBright, new THREE.SphereGeometry(0.13, 8, 6), { pos: [8.6 * Math.cos(a), 10 + 8.6 * Math.sin(a), z] });
    }
    // inner coffer panels: a recessed darker square inside each coffer for depth
  }
  // ---------------- clustered columns ----------------
  for (const sd of [-1, 1]) for (const z of BAYS) {
    const x = sd * 7.55;
    add(M.blackMarble, G.box(1.3, 0.55, 1.3), { pos: [x, 0.275, z] });
    add(M.goldBright, G.torus(0.62, 0.07, 8, 28), { pos: [x, 0.6, z], rot: [Math.PI / 2, 0, 0] });
    add(M.blackMarble, G.cyl(0.42, 0.46, 8.8, 20), { pos: [x, 5.0, z], uv: 1.5 });
    for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; add(M.gold, G.cyl(0.11, 0.11, 8.8, 8), { pos: [x + Math.cos(a) * 0.45, 5.0, z + Math.sin(a) * 0.45] }); }
    for (const y of [3.4, 6.6]) add(M.goldBright, G.torus(0.5, 0.06, 6, 24), { pos: [x, y, z], rot: [Math.PI / 2, 0, 0] });
    add(M.gold, G.cyl(0.85, 0.48, 0.7, 20), { pos: [x, 9.7, z] });
    add(M.blackMarble, G.box(1.6, 0.25, 1.6), { pos: [x, 10.15, z] });
    circ(x, z, 0.85);
  }

  // ---------------- Entrance Hall (hallway) ----------------
  for (const sd of [-1, 1]) {
    add(M.slate, G.box(0.6, 4.6, 15.4), { pos: [sd * 3.3, 2.3, 8.4], uv: 2.2 });
    add(M.blackMarble, G.box(0.1, 0.9, 15.2), { pos: [sd * 2.98, 0.45, 8.4] });
    add(M.goldBright, G.box(0.12, 0.05, 15.2), { pos: [sd * 2.97, 0.92, 8.4] });
    add(M.stoneDark, G.box(0.25, 0.25, 15.2), { pos: [sd * 2.92, 4.45, 8.4] });
    box(sd * 2.95, sd * 4, 0.6, 16.5);
  }
  {
    const g = new THREE.PlaneGeometry(1, 1, 32, 1); const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) { const u = p.getX(i) + 0.5, v = p.getY(i) + 0.5, a = Math.PI * u, z = 0.8 + 15.2 * v; p.setXYZ(i, 3 * Math.cos(a), 4.5 + 3 * Math.sin(a), z); uv.setXY(i, 3 * a / 2.2, z / 2.2); }
    g.computeVertexNormals();
    const m = new THREE.Mesh(flipIfOutward(g, new THREE.Vector3(0, 4.5, 8)), M.slate); scene.add(m);
    for (let z = 1.6; z <= 15.6; z += 2) {
      add(M.stoneDark, arcRib(3, 0.3, 0.3, 0, Math.PI, 32), { pos: [0, 4.5, z] });
      add(M.goldBright, arcRib(2.72, 0.05, 0.02, 0, Math.PI, 32), { pos: [0, 4.5, z] });
      for (const sd of [-1, 1]) add(M.stoneDark, G.box(0.3, 4.5, 0.32), { pos: [sd * 2.88, 2.25, z] });
    }
    // entrance end wall (closed, with the great doors you came through)
    const sh = new THREE.Shape(); sh.moveTo(-3.6, 0); sh.lineTo(3.6, 0); sh.lineTo(3.6, 4.5); sh.absarc(0, 4.5, 3.6, 0, Math.PI, false); sh.lineTo(-3.6, 0);
    add(M.slate, mapGeom(new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: false, curveSegments: 32 }), (v) => v.set(v.x, v.y, 16 + v.z), false), { uv: 2.2 });
    box(-4, 4, 15.7, 17);
    // double doors: planks, iron straps, studs, ring pulls, gold arch frame
    const dw = 1.3, dh = 3.4;
    for (const sd of [-1, 1]) {
      add(M.woodDark, G.box(dw, dh, 0.16), { pos: [sd * dw / 2, dh / 2, 15.9] });
      for (const y of [0.6, 1.7, 2.8]) add(M.iron, G.box(dw - 0.08, 0.12, 0.04), { pos: [sd * dw / 2, y, 15.8] });
      for (const y of [0.6, 1.7, 2.8]) for (let k = 0; k < 5; k++) add(M.goldBright, new THREE.SphereGeometry(0.03, 6, 4), { pos: [sd * (0.12 + k * 0.26), y, 15.77] });
      add(M.goldBright, G.torus(0.11, 0.018, 6, 20), { pos: [sd * 0.22, 1.45, 15.76] });
    }
    // arched tympanum above the doors
    add(M.woodDark, new THREE.CircleGeometry(1.3, 24, 0, Math.PI), { pos: [0, dh, 15.82], rot: [0, Math.PI, 0] });
    add(M.goldBright, arcRib(1.42, 0.14, 0.14, 0, Math.PI, 28), { pos: [0, dh, 15.8] });
    for (const sd of [-1, 1]) add(M.goldBright, G.box(0.14, dh, 0.14), { pos: [sd * 1.36, dh / 2, 15.8] });
    add(M.goldBright, G.torus(0.42, 0.035, 8, 32), { pos: [0, dh + 0.62, 15.76] });
  }

  // ---------------- lights ----------------
  scene.add(new THREE.HemisphereLight(0x6a5a70, 0x1a0c0c, 0.9));
  scene.add(new THREE.AmbientLight(0x2a2026, 0.7));
  function fireLight(pos, color, intensity, dist, castShadow = false, seed = Math.random() * 100) {
    const l = new THREE.PointLight(color, intensity * 1.25, dist, 1.6); l.position.set(...pos);
    if (castShadow && shadows) { l.castShadow = true; l.shadow.mapSize.set(mobile ? 512 : 1024, mobile ? 512 : 1024); l.shadow.bias = -0.004; l.shadow.radius = 4; l.shadow.camera.near = 0.3; l.shadow.camera.far = dist; }
    scene.add(l); fires.push({ light: l, base: intensity * 1.25, seed }); return l;
  }

  // ---------------- hearth (left bay 2): stone surround, hood, logs, real-time fire ----------------
  {
    const z = bayC(2), x = -8.95;
    add(M.blackMarble, G.box(0.9, 0.25, 3.6), { pos: [x + 0.45, 0.125, z] }); // hearthstone
    for (const sd of [-1, 1]) {
      add(M.stone, G.box(0.85, 2.3, 0.55), { pos: [x + 0.43, 1.15, z + sd * 1.25] });
      add(M.gold, G.cyl(0.09, 0.09, 2.2, 8), { pos: [x + 0.88, 1.15, z + sd * 1.25] });
    }
    add(M.blackMarble, G.box(1.1, 0.35, 3.2), { pos: [x + 0.5, 2.45, z] }); // mantel shelf
    add(M.goldBright, G.box(0.04, 0.08, 3.1), { pos: [x + 1.05, 2.35, z] });
    // tapered chimney hood up to the arcade
    const hood = new THREE.CylinderGeometry(0.5, 1.0, 3.6, 4, 1, true).rotateY(Math.PI / 4);
    add(M.slate, hood, { pos: [x + 0.4, 4.4, z], scale: [0.9, 1, 1.9], uv: 2 });
    add(M.void, G.box(0.05, 2.0, 1.95), { pos: [x + 0.08, 1.15, z] }); // firebox back
    add(M.stoneDark, G.box(0.7, 0.05, 2.0), { pos: [x + 0.35, 2.28, z] });
    for (const sd of [-1, 1]) add(M.stoneDark, G.box(0.7, 2.1, 0.05), { pos: [x + 0.35, 1.15, z + sd * 1.0] });
    // andirons + logs
    for (const sd of [-0.6, 0.6]) add(M.iron, G.box(0.5, 0.08, 0.05), { pos: [x + 0.5, 0.36, z + sd] });
    const logs = [[0, 0.42, -0.1, 0.4], [0.05, 0.45, 0.15, -0.3], [-0.05, 0.56, 0, 0.1]];
    for (const [dx, y, dz, ry] of logs) add(M.woodDark, G.cyl(0.09, 0.1, 1.4, 10), { pos: [x + 0.5 + dx, y, z + dz], rot: [Math.PI / 2, ry, 0] });
    const coals = new THREE.Mesh(new THREE.CircleGeometry(0.6, 16).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff3c08 }));
    coals.position.set(x + 0.5, 0.27, z); coals.scale.set(0.7, 1, 1.4); scene.add(coals);
    const fire = makeFire({ width: 1.5, height: 1.5, count: 6, intensity: 1.15 }); fire.position.set(x + 0.5, 0.3, z); scene.add(fire);
    const glow = glowSprite(0xff7a2a, 4.5, 0.55); glow.position.set(x + 0.9, 1.0, z); scene.add(glow);
    scene.add(makeEmbers({ origin: [x + 0.55, 0.6, z], spread: [0.5, 0.2, 1.2], drift: [0.55, 0, 0], rise: 0.7, life: 4.5, size: 0.045, n: mobile ? 90 : 180 }));
    scene.add(makeSmoke({ origin: [x + 0.4, 1.4, z], spread: [0.3, 0.2, 0.8], drift: [-0.03, 0, 0], rise: 0.45, life: 6, size: 1.0, n: mobile ? 20 : 36, opacity: 0.18 }));
    fireLight([x + 1.4, 1.1, z], 0xff7a30, 60, 16, true, 1);
    audioSpots.push({ pos: [x + 0.6, 0.8, z], gain: 1.0, ref: 2.2, kind: 'hearth' });
    box(x, x + 1.0, z - 1.8, z + 1.8);
    interact.push({ kind: 'hearth', pos: [x + 0.6, 1, z] });
  }

  // ---------------- braziers (Horns side) and candle stands (Halos side) ----------------
  function brazier(x, z, withLight) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3; add(M.iron, G.cyl(0.03, 0.04, 1.05, 6), { pos: [x + Math.cos(a) * 0.22, 0.5, z + Math.sin(a) * 0.22], rot: [Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25] }); }
    add(M.gold, new THREE.SphereGeometry(0.42, 18, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { pos: [x, 1.15, z] });
    add(M.goldBright, G.torus(0.42, 0.035, 6, 24), { pos: [x, 1.15, z], rot: [Math.PI / 2, 0, 0] });
    const c = new THREE.Mesh(new THREE.CircleGeometry(0.38, 14).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff4a10 })); c.position.set(x, 1.12, z); scene.add(c);
    const f = makeFire({ width: 0.7, height: 0.95, count: 3, intensity: 1.1 }); f.position.set(x, 1.1, z); scene.add(f);
    const gl = glowSprite(0xff8030, 2.6, 0.5); gl.position.set(x, 1.5, z); scene.add(gl);
    scene.add(makeEmbers({ origin: [x, 1.3, z], spread: [0.4, 0.1, 0.4], rise: 1.0, life: 3.2, size: 0.04, n: mobile ? 40 : 70 }));
    scene.add(makeSmoke({ origin: [x, 2.0, z], spread: [0.2, 0.1, 0.2], rise: 0.5, life: 6, size: 0.9, n: mobile ? 10 : 18, opacity: 0.12 }));
    if (withLight) fireLight([x, 1.9, z], 0xff8838, 22, 11, false);
    audioSpots.push({ pos: [x, 1.2, z], gain: 0.35, ref: 1.2, kind: 'brazier' });
    circ(x, z, 0.5);
  }
  brazier(-6.1, -4, true); brazier(-6.1, -28, true); brazier(-6.1, -40, false);
  function candleStand(x, z) {
    add(M.iron, G.cyl(0.25, 0.32, 0.08, 12), { pos: [x, 0.04, z] });
    add(M.iron, G.cyl(0.03, 0.04, 1.6, 8), { pos: [x, 0.84, z] });
    add(M.goldBright, G.torus(0.3, 0.025, 6, 20), { pos: [x, 1.62, z], rot: [Math.PI / 2, 0, 0] });
    for (let k = 0; k < 7; k++) {
      const a = k * Math.PI * 2 / 7, cx = x + Math.cos(a) * 0.3, cz = z + Math.sin(a) * 0.3, h = 0.18 + (k % 3) * 0.05;
      add(M.wax, G.cyl(0.025, 0.028, h, 8), { pos: [cx, 1.64 + h / 2, cz] }); candlePos.push(cx, 1.66 + h + 0.03, cz);
    }
    add(M.wax, G.cyl(0.03, 0.032, 0.32, 8), { pos: [x, 1.78, z] }); candlePos.push(x, 1.98, z);
    const gl = glowSprite(0xffc070, 1.6, 0.45); gl.position.set(x, 1.9, z); scene.add(gl);
    circ(x, z, 0.4);
  }
  candleStand(6.1, -4); candleStand(6.1, -28); candleStand(6.1, -40);
  if (!mobile) fireLight([6.1, 2.2, -16], 0xffc078, 14, 14, false, 5);

  // ---------------- ring chandeliers ----------------
  function chandelier(z, y = 8.2) {
    const R = 2.0;
    add(M.iron, G.torus(R, 0.07, 8, 48), { pos: [0, y, z], rot: [Math.PI / 2, 0, 0] });
    add(M.goldBright, G.torus(R + 0.12, 0.03, 6, 48), { pos: [0, y + 0.06, z], rot: [Math.PI / 2, 0, 0] });
    add(M.iron, G.torus(R * 0.55, 0.05, 6, 32), { pos: [0, y - 0.55, z], rot: [Math.PI / 2, 0, 0] });
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; add(M.iron, G.cyl(0.02, 0.02, 2.2, 4), { pos: [Math.cos(a) * R * 0.5, y + 1.05, z + Math.sin(a) * R * 0.5], rot: [Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4] }); }
    add(M.iron, G.cyl(0.03, 0.03, 18.6 - y - 2.0, 4), { pos: [0, (y + 2.0 + 18.6) / 2, z] });
    const n = 20;
    for (let k = 0; k < n; k++) { const a = k * Math.PI * 2 / n; const cx = Math.cos(a) * R, cz = z + Math.sin(a) * R; add(M.wax, G.cyl(0.03, 0.034, 0.26, 6), { pos: [cx, y + 0.2, cz] }); candlePos.push(cx, y + 0.37, cz); }
    for (let k = 0; k < 10; k++) { const a = k * Math.PI * 2 / 10 + 0.3; const cx = Math.cos(a) * R * 0.55, cz = z + Math.sin(a) * R * 0.55; add(M.wax, G.cyl(0.028, 0.03, 0.2, 6), { pos: [cx, y - 0.4, cz] }); candlePos.push(cx, y - 0.26, cz); }
    const gl = glowSprite(0xffb050, 6, 0.35); gl.position.set(0, y + 0.2, z); scene.add(gl);
    fireLight([0, y - 0.6, z], 0xffb468, 55, 26, !mobile && z === -16, 2 + z);
  }
  chandelier(-16); chandelier(-31);

  // ---------------- hallway torches ----------------
  for (const z of [4.2, 11.8]) for (const sd of [-1, 1]) {
    const x = sd * 2.92;
    add(M.iron, G.box(0.08, 0.5, 0.08), { pos: [x, 2.2, z] });
    add(M.iron, G.cyl(0.03, 0.03, 0.4, 6), { pos: [x - sd * 0.18, 2.35, z], rot: [0, 0, sd * 0.9] });
    add(M.goldBright, G.cyl(0.12, 0.06, 0.2, 10), { pos: [x - sd * 0.32, 2.55, z] });
    const f = makeFire({ width: 0.3, height: 0.5, count: 2, intensity: 1 }); f.position.set(x - sd * 0.32, 2.62, z); scene.add(f);
    const gl = glowSprite(0xff9040, 1.6, 0.5); gl.position.set(x - sd * 0.32, 2.85, z); scene.add(gl);
    scene.add(makeEmbers({ origin: [x - sd * 0.32, 2.8, z], spread: [0.12, 0.05, 0.12], rise: 0.8, life: 2.2, size: 0.03, n: 20 }));
    if (sd === 1) { fireLight([0, 3.0, z], 0xff9a48, 22, 12, false, z); audioSpots.push({ pos: [x, 2.6, z], gain: 0.18, ref: 0.8, kind: 'torch' }); }
  }

  // ---------------- benches (velvet, solid) ----------------
  function bench(x, z, len = 2.4) {
    add(M.woodDark, G.box(0.6, 0.08, len), { pos: [x, 0.42, z] });
    add(M.velvet, new THREE.BoxGeometry(0.56, 0.1, len - 0.06, 1, 1, 1), { pos: [x, 0.51, z], uv: 0.6 });
    for (const dz of [-len / 2 + 0.12, len / 2 - 0.12]) for (const dx of [-0.24, 0.24]) add(M.woodDark, G.box(0.07, 0.42, 0.07), { pos: [x + dx, 0.21, z + dz] });
    add(M.goldBright, G.box(0.62, 0.03, 0.03), { pos: [x, 0.47, z - len / 2] }); add(M.goldBright, G.box(0.62, 0.03, 0.03), { pos: [x, 0.47, z + len / 2] });
    box(x - 0.34, x + 0.34, z - len / 2 - 0.05, z + len / 2 + 0.05);
  }
  for (const z of [-15.5, -18.5, -25.5]) { bench(-5.4, z); bench(5.4, z); }

  // ---------------- tall arched mirrors in the Halos-side bays, crimson banners on the Horns side ----------------
  const banners = [];
  for (const k of [1, 3, 5]) {
    const z = bayC(k);
    const ms = new THREE.Shape(); ms.moveTo(-1.2, 0); ms.lineTo(1.2, 0); ms.lineTo(1.2, 4.2); ms.absarc(0, 4.2, 1.2, 0, Math.PI, false); ms.lineTo(-1.2, 0);
    const mg = new THREE.ShapeGeometry(ms, 24); mg.rotateY(-Math.PI / 2);
    const mirror = new THREE.Mesh(mg, M.mirror); mirror.position.set(8.9, 1.2, z); scene.add(mirror);
    add(M.goldBright, arcRib(1.32, 0.1, 0.14, 0, Math.PI, 28), { pos: [8.9, 5.4, z], rot: [0, Math.PI / 2, 0] });
    for (const dz of [-1.26, 1.26]) add(M.goldBright, G.box(0.1, 4.2, 0.14), { pos: [8.9, 3.3, z + dz] });
    add(M.goldBright, G.box(0.1, 0.14, 2.66), { pos: [8.9, 1.2, z] });
  }
  // vertical banners on the inner faces of the columns: crimson (Horns, left) and ivory (Halos, right)
  const bTex = { L: 'assets/tex/banner_crimson.webp', R: 'assets/tex/banner_ivory.webp' };
  const tl = new THREE.TextureLoader();
  for (const sd of [-1, 1]) {
    const t = tl.load(bTex[sd < 0 ? 'L' : 'R']); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    for (const z of BAYS.slice(1, 7)) {
      const h = 4.6, w = 1.25;
      const mat = sway(new THREE.MeshStandardMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9, normalMap: M.velvet.normalMap }), { height: h, amp: 0.06, speed: 0.9 + Math.random() * 0.3 });
      const g = new THREE.PlaneGeometry(w, h, 8, 18);
      const b = new THREE.Mesh(g, mat); b.position.set(sd * 6.92, 8.9 - h / 2, z); b.rotation.y = sd < 0 ? Math.PI / 2 : -Math.PI / 2;
      b.castShadow = false; scene.add(b); banners.push(b);
      add(M.goldBright, G.cyl(0.035, 0.035, w + 0.3, 8), { pos: [sd * 6.92, 8.92, z], rot: [Math.PI / 2, 0, 0] });
      for (const dz of [-(w + 0.3) / 2, (w + 0.3) / 2]) add(M.goldBright, new THREE.SphereGeometry(0.07, 8, 6), { pos: [sd * 6.92, 8.92, z + dz] });
    }
  }

  // ---------------- statue pedestals (statues are loaded GLBs, see main.js) ----------------
  const statueSpots = [];
  for (const sd of [-1, 1]) {
    const x = sd * 5.3, z = -34;
    add(M.blackMarble, G.box(2.2, 0.35, 2.2), { pos: [x, 0.175, z] });
    add(M.blackMarble, G.box(1.8, 1.3, 1.8), { pos: [x, 1.0, z] });
    add(M.blackMarble, G.box(2.0, 0.25, 2.0), { pos: [x, 1.77, z] });
    add(M.goldBright, G.box(1.84, 0.05, 1.84), { pos: [x, 0.37, z] }); add(M.goldBright, G.box(1.84, 0.05, 1.84), { pos: [x, 1.62, z] });
    // blank inscription plate (design: pedestals stay blank on purpose)
    add(M.gold, G.box(0.9, 0.35, 0.03), { pos: [x, 1.0, z + 0.915] });
    box(x - 1.15, x + 1.15, z - 1.15, z + 1.15);
    statueSpots.push({ side: sd, pos: [x, 1.9, z] });
  }

  // ---------------- the Portal (way onward) + Horns/Halos wing doors ----------------
  const portal = new THREE.Group(); portal.position.set(0, 4.2, -43.9); scene.add(portal);
  {
    const ring = new THREE.Mesh(G.torus(4.25, 0.32, 16, 96), M.goldBright); portal.add(ring);
    const ring2 = new THREE.Mesh(G.torus(4.75, 0.14, 10, 96), M.gold); portal.add(ring2);
    const ring3 = new THREE.Mesh(G.torus(3.88, 0.1, 8, 96), M.obsidian); portal.add(ring3);
    const spin = new THREE.Group(); portal.add(spin);
    for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12; const n = new THREE.Mesh(G.box(0.12, 0.5, 0.18), k % 2 ? M.obsidian : M.goldBright); n.position.set(Math.cos(a) * 4.5, Math.sin(a) * 4.5, 0.1); n.rotation.z = a; spin.add(n); }
    const disc = new THREE.Mesh(new THREE.CircleGeometry(3.96, 64), portalMaterial()); disc.position.z = -0.25; portal.add(disc);
    disc.userData.interact = { kind: 'portal' }; interact.push({ kind: 'portal', mesh: disc });
    const pl = new THREE.PointLight(0xff9a50, 25, 18, 1.6); pl.position.set(0, 0, 2.5); portal.add(pl);
    portal.userData.spin = spin; portal.userData.light = pl;
    add(M.blackMarble, G.box(10, 0.25, 2.2), { pos: [0, 0.125, -42.9] });
  }
  for (const sd of [-1, 1]) {
    const z = bayC(6), x = sd * 8.93, dh = 3.8, dw = 2.0;
    add(M.woodDark, G.box(0.1, dh, dw), { pos: [x, dh / 2, z] });
    add(M.woodDark, new THREE.CircleGeometry(dw / 2, 20, 0, Math.PI).rotateY(sd < 0 ? Math.PI / 2 : -Math.PI / 2), { pos: [x - sd * 0.05, dh, z] });
    for (const y of [0.7, 1.9, 3.1]) add(M.iron, G.box(0.04, 0.1, dw - 0.1), { pos: [x - sd * 0.06, y, z] });
    add(M.goldBright, arcRib(dw / 2 + 0.12, 0.14, 0.14, 0, Math.PI, 24), { pos: [x - sd * 0.06, dh, z], rot: [0, Math.PI / 2, 0] });
    for (const dz of [-(dw / 2 + 0.05), dw / 2 + 0.05]) add(M.goldBright, G.box(0.14, dh, 0.14), { pos: [x - sd * 0.06, dh / 2, z + dz] });
    // wing emblem above the door: horns (left) or halo (right)
    if (sd < 0) { add(M.goldBright, G.torus(0.35, 0.05, 8, 24, Math.PI), { pos: [x - sd * 0.1, dh + 1.4, z], rot: [0, Math.PI / 2, Math.PI] }); }
    else { add(M.goldBright, G.torus(0.4, 0.04, 8, 32), { pos: [x - sd * 0.12, dh + 1.5, z], rot: [Math.PI / 2, 0, 0] }); }
    const door = new THREE.Mesh(G.box(0.3, dh, dw), new THREE.MeshBasicMaterial({ visible: false }));
    door.position.set(x - sd * 0.2, dh / 2, z); door.userData.interact = { kind: 'door', wing: sd < 0 ? 'Horns' : 'Halos' }; scene.add(door);
    interact.push({ kind: 'door', mesh: door });
  }

  // ---------------- candle flames (one draw) ----------------
  scene.add(makeCandleFlames(candlePos, 0.11));

  // ---------------- merge static buckets ----------------
  const meshes = [];
  for (const [mat, list] of buckets) {
    const g = mergeGeometries(list, false);
    const mesh = new THREE.Mesh(g, mat); mesh.receiveShadow = true; mesh.castShadow = true; mesh.matrixAutoUpdate = false; mesh.updateMatrix();
    scene.add(mesh); meshes.push(mesh);
  }

  function update(t) {
    for (const f of fires) f.light.intensity = f.base * flicker(t, f.seed);
    portal.userData.spin.rotation.z = t * (Math.PI * 2 / 40);
    portal.userData.light.color.setHSL(THREE.MathUtils.lerp(0.04, 0.12, 0.5 + 0.5 * Math.sin(t * Math.PI * 2 / 40)), 0.8, 0.6);
  }
  return { colliders, fires, audioSpots, interact, statueSpots, portal, banners, update, box, circ, meshes };
}

function flipIfOutward(g, inside) {
  // ensure normals point toward `inside` (vaults are seen from below)
  const p = g.attributes.position, n = g.attributes.normal; const v = new THREE.Vector3(p.getX(0), p.getY(0), p.getZ(0));
  const nn = new THREE.Vector3(n.getX(0), n.getY(0), n.getZ(0));
  if (nn.dot(inside.clone().sub(v)) < 0) {
    const idx = g.index.array; for (let i = 0; i < idx.length; i += 3) { const a = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = a; }
    for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i));
  }
  return g;
}
