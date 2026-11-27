// PBR materials (CC0 textures from Poly Haven + ambientCG, see CREDITS.md) and geometry helpers.
import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const cache = new Map();
export let anisotropy = 4;
export function setAnisotropy(a) { anisotropy = a; }

export function tex(path, { srgb = false, repeat = null } = {}) {
  const key = path + (srgb ? ':s' : '');
  if (cache.has(key)) return cache.get(key);
  const t = loader.load(path);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = anisotropy;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.repeat.set(repeat, repeat);
  cache.set(key, t);
  return t;
}
export function setLoadingManager(m) { loader.manager = m; }

const T = 'assets/tex/';
function pbr(name, opts = {}) {
  const m = new THREE.MeshStandardMaterial({
    map: tex(T + name + '_c.webp', { srgb: true }),
    normalMap: opts.normal === false ? null : tex(T + name + '_n.webp'),
    roughnessMap: opts.orm ? tex(T + name + '_orm.webp') : null,
    aoMap: null,
    metalnessMap: opts.metalMap ? tex(T + name + '_orm.webp') : null,
    color: opts.color ?? 0xffffff,
    roughness: opts.roughness ?? 1,
    metalness: opts.metalness ?? 0,
    envMapIntensity: opts.env ?? 1,
  });
  if (opts.normalScale) m.normalScale.set(opts.normalScale, opts.normalScale);
  return m;
}

export function makeMaterials() {
  const M = {};
  // black polished marble floor (ambientCG Marble016)
  M.floor = pbr('marble_black', { orm: true, roughness: 0.5, color: 0xffffff, env: 1.4 });
  // dark ashlar stone walls (Poly Haven medieval_blocks_03), darkened to the painting's near-black
  M.stone = pbr('stone', { orm: true, roughness: 1, color: 0x7a706a, normalScale: 1.3 });
  M.stoneDark = pbr('stone', { orm: true, roughness: 1, color: 0x5a524e });
  // rubble slate for hallway / chimney (Poly Haven castle_wall_slates)
  M.slate = pbr('slate', { orm: true, roughness: 1, color: 0x847a72 });
  // black marble for columns, plinths
  M.blackMarble = pbr('marble_black', { orm: true, roughness: 0.32, color: 0xffffff, env: 1.3 });
  // alabaster / white marble (ambientCG Marble021)
  M.alabaster = new THREE.MeshStandardMaterial({ map: tex(T + 'marble_white_c.webp', { srgb: true }), color: 0xf2e8da, roughness: 0.42, metalness: 0, envMapIntensity: 0.8 });
  M.obsidian = new THREE.MeshStandardMaterial({ map: tex(T + 'marble_black_c.webp', { srgb: true }), color: 0xc8c0b8, roughness: 0.2, metalness: 0.15, envMapIntensity: 2.2 });
  // aged gold (ambientCG Metal048B)
  M.gold = pbr('gold', { orm: true, metalMap: true, roughness: 1, metalness: 1, color: 0xffd9a0, env: 1.5 });
  M.goldBright = new THREE.MeshStandardMaterial({ color: 0xd4a646, metalness: 1, roughness: 0.28, envMapIntensity: 1.8 });
  M.goldEmissive = new THREE.MeshStandardMaterial({ color: 0xffd27a, metalness: 1, roughness: 0.25, emissive: 0xffb340, emissiveIntensity: 1.6 });
  M.iron = new THREE.MeshStandardMaterial({ color: 0x1d1c1c, metalness: 0.9, roughness: 0.55, envMapIntensity: 1.2 });
  M.wood = pbr('wood', { orm: true, roughness: 1, color: 0xd0a890 });
  M.woodDark = pbr('wood', { orm: true, roughness: 1, color: 0x8c6a58 });
  M.velvet = new THREE.MeshStandardMaterial({ map: tex(T + 'velvet_c.webp', { srgb: true }), normalMap: tex(T + 'velvet_n.webp'), color: 0x8a1420, roughness: 0.85, metalness: 0, envMapIntensity: 0.4 });
  M.velvetBlack = new THREE.MeshStandardMaterial({ map: tex(T + 'velvet_c.webp', { srgb: true }), normalMap: tex(T + 'velvet_n.webp'), color: 0x1a1618, roughness: 0.9, envMapIntensity: 0.3 });
  const carpet = tex(T + 'carpet_c.webp', { srgb: true });
  M.carpet = new THREE.MeshStandardMaterial({ map: carpet, normalMap: tex(T + 'velvet_n.webp'), roughness: 0.92, envMapIntensity: 0.3 });
  M.fabricBlack = new THREE.MeshStandardMaterial({ color: 0x121012, normalMap: tex(T + 'velvet_n.webp'), roughness: 0.95 });
  M.ceramicBlack = new THREE.MeshStandardMaterial({ color: 0x0c0b0c, roughness: 0.18, metalness: 0, envMapIntensity: 1.4 });
  M.mirror = new THREE.MeshStandardMaterial({ color: 0xb8bcc4, metalness: 1, roughness: 0.06, envMapIntensity: 1.0 });
  M.ember = new THREE.MeshBasicMaterial({ color: 0xff5a1a });
  M.void = new THREE.MeshBasicMaterial({ color: 0x050405 });
  M.wax = new THREE.MeshStandardMaterial({ color: 0xe9dcc4, roughness: 0.6, emissive: 0x3a2008, emissiveIntensity: 0.4 });
  return M;
}

// World-space box-projected UVs so tiled textures keep a constant texel density on any geometry.
export function worldUV(geom, scale = 1, matrix = null) {
  geom = geom.index ? geom.toNonIndexed() : geom;
  if (matrix) geom.applyMatrix4(matrix);
  geom.computeVertexNormals();
  const p = geom.attributes.position, n = geom.attributes.normal;
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i += 3) {
    // per-face dominant axis (use face normal from 3 verts)
    let nx = 0, ny = 0, nz = 0;
    for (let k = 0; k < 3; k++) { nx += Math.abs(n.getX(i + k)); ny += Math.abs(n.getY(i + k)); nz += Math.abs(n.getZ(i + k)); }
    for (let k = 0; k < 3; k++) {
      const x = p.getX(i + k), y = p.getY(i + k), z = p.getZ(i + k);
      let u, v;
      if (ny >= nx && ny >= nz) { u = x; v = z; } else if (nx >= nz) { u = z; v = y; } else { u = x; v = y; }
      uv[(i + k) * 2] = u / scale; uv[(i + k) * 2 + 1] = v / scale;
    }
  }
  geom.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geom;
}

// Tapered tube along a list of points (used for horns, candles' drips, scrollwork).
export function taperTube(points, r0, r1, tubular = 40, radial = 10, closed = false) {
  const curve = new THREE.CatmullRomCurve3(points);
  const g = new THREE.TubeGeometry(curve, tubular, 1, radial, closed);
  const pos = g.attributes.position;
  const frames = curve.computeFrenetFrames(tubular, closed);
  const v = new THREE.Vector3();
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular, c = curve.getPointAt(t);
    const r = r0 + (r1 - r0) * Math.pow(t, 0.9);
    for (let j = 0; j <= radial; j++) {
      const idx = i * (radial + 1) + j;
      v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(r).add(c);
      pos.setXYZ(idx, v.x, v.y, v.z);
    }
  }
  g.computeVertexNormals();
  return g;
}

// Ram-horn spiral (Pan statue) and swept-back horns (Mammon).
export function ramHorn(side = 1, scale = 1) {
  const pts = [];
  const turns = 1.25, N = 26;
  for (let i = 0; i <= N; i++) {
    const t = i / N, a = t * turns * Math.PI * 2;
    const rr = (0.05 + 0.22 * (1 - t * 0.55)) * scale;
    pts.push(new THREE.Vector3(side * (0.06 + t * 0.16) * scale, Math.sin(a) * rr + t * 0.05 * scale, -Math.cos(a) * rr + rr));
  }
  return taperTube(pts, 0.075 * scale, 0.012 * scale, 60, 12);
}
export function sweptHorn(side = 1, scale = 1) {
  const pts = [
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(side * 0.04, 0.06, -0.02),
    new THREE.Vector3(side * 0.07, 0.13, -0.07), new THREE.Vector3(side * 0.06, 0.19, -0.15),
    new THREE.Vector3(side * 0.03, 0.21, -0.22),
  ].map((p) => p.multiplyScalar(scale));
  return taperTube(pts, 0.03 * scale, 0.003 * scale, 24, 10);
}

// Box-section arc (vault ribs, arch rings). Arc in XY plane centred at origin.
export function arcRib(radius, width, depth, a0, a1, seg = 24) {
  const shape = new THREE.Shape();
  shape.moveTo(Math.cos(a0) * radius, Math.sin(a0) * radius);
  for (let i = 0; i <= seg; i++) { const a = a0 + (a1 - a0) * i / seg; shape.lineTo(Math.cos(a) * radius, Math.sin(a) * radius); }
  for (let i = seg; i >= 0; i--) { const a = a0 + (a1 - a0) * i / seg; shape.lineTo(Math.cos(a) * (radius - depth), Math.sin(a) * (radius - depth)); }
  const g = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: false, curveSegments: 1 });
  g.translate(0, 0, -width / 2);
  return g;
}
