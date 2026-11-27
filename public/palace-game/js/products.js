// Real Horns & Halos products as 3D displays + the buy panel (Shopify cart permalinks, no API keys).
import * as THREE from 'three';
import { SLOTS } from './world.js';
import { sway } from './fx.js';

const tl = new THREE.TextureLoader();
function T(path) { const t = tl.load(path); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
export function setProductLoadingManager(m) { tl.manager = m; }

export function buildProducts(scene, M, data, world) {
  const items = []; const markers = [];
  const markerGeo = new THREE.OctahedronGeometry(0.07, 0);
  const markerMat = new THREE.MeshBasicMaterial({ color: 0xffcf6a, transparent: true, opacity: 0.85 });
  for (const p of data.products) {
    const s = SLOTS[p.slot]; if (!s) continue;
    const g = new THREE.Group(); g.position.set(...s.pos); g.rotation.y = s.rotY; scene.add(g);
    const hit = []; let top = 1.8;
    if (p.kind === 'tapestry') {
      const w = 2.1, h = w * 762 / 1024;
      const tt = T(p.tex); const mat = sway(new THREE.MeshStandardMaterial({ map: tt, emissiveMap: tt, emissive: 0xffffff, emissiveIntensity: 0.22, side: THREE.DoubleSide, roughness: 0.95, normalMap: M.velvet.normalMap, normalScale: new THREE.Vector2(0.4, 0.4) }), { height: h, amp: 0.022, speed: 0.8 });
      const cloth = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 18, 14), mat); cloth.position.set(0, 0, 0.12); g.add(cloth); hit.push(cloth);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, w + 0.3, 8).rotateZ(Math.PI / 2), M.goldBright); rod.position.set(0, h / 2 + 0.03, 0.12); g.add(rod);
      for (const sx of [-1, 1]) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), M.goldBright); f.position.set(sx * (w / 2 + 0.17), h / 2 + 0.03, 0.12); g.add(f);
        const br = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.14), M.iron); br.position.set(sx * (w / 2 + 0.05), h / 2 + 0.03, 0.06); g.add(br); }
      top = h / 2 + 0.25;
    } else if (p.kind === 'frame') {
      const h = s.wall ? 1.25 : 1.15, w = h * 0.79; const tex = T(p.tex);
      const art = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.3, roughness: 0.25, metalness: 0.35, envMapIntensity: 0.6 }));
      const fr = new THREE.Group();
      const bw = 0.09; const fm = M.goldBright;
      for (const [x, y, ww, hh] of [[0, h / 2 + bw / 2, w + 2 * bw, bw], [0, -h / 2 - bw / 2, w + 2 * bw, bw], [w / 2 + bw / 2, 0, bw, h], [-w / 2 - bw / 2, 0, bw, h]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(ww, hh, 0.07), fm); b.position.set(x, y, 0.0); fr.add(b); }
      const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), M.woodDark); back.position.z = -0.03; fr.add(back);
      art.position.z = 0.017; fr.add(art); hit.push(art);
      if (s.wall) { fr.position.set(0, 0, 0.06); g.add(fr); top = h / 2 + 0.25; }
      else {
        // easel: two front legs, back leg, ledge
        for (const sx of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.1, 0.06), M.woodDark); l.position.set(sx * 0.42, 1.0, 0); l.rotation.z = -sx * 0.1; g.add(l); }
        const bl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.0, 0.06), M.woodDark); bl.position.set(0, 0.95, -0.45); bl.rotation.x = -0.25; g.add(bl);
        const ledge = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.14), M.woodDark); ledge.position.set(0, 0.86, 0.05); g.add(ledge);
        fr.position.set(0, 0.88 + h / 2 + bw, 0.07); fr.rotation.x = -0.1; g.add(fr); top = 0.88 + h + 0.4;
        world.circ(s.pos[0], s.pos[2], 0.6);
      }
    } else if (['hoodie', 'tee', 'dress'].includes(p.kind)) {
      // dress-form mannequin on a gold stand + the garment (its photo cut-out on a curved panel)
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.06, 24), M.blackMarble); base.position.y = 0.03; g.add(base);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 8), M.goldBright); pole.position.y = 0.55; g.add(pole);
      const prof = []; const pts = [[0, 0], [0.13, 0.0], [0.16, 0.08], [0.15, 0.22], [0.13, 0.32], [0.155, 0.45], [0.19, 0.56], [0.2, 0.62], [0.12, 0.66], [0.05, 0.7], [0.05, 0.8], [0, 0.8]];
      for (const [r, y] of pts) prof.push(new THREE.Vector2(r, y));
      const torso = new THREE.Mesh(new THREE.LatheGeometry(prof, 24), M.velvetBlack); torso.scale.set(1.15, 1.0, 0.75);
      torso.position.y = p.kind === 'dress' ? 0.95 : 1.02; g.add(torso);
      const nk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12), M.goldBright); nk.position.y = torso.position.y + 0.81; g.add(nk);
      const tex = T(p.tex.replace('.webp', '-cut.webp'));
      const asp = { hoodie: 518 / 699, tee: 648 / 710, dress: 300 / 714 }[p.kind];
      const H = { hoodie: 0.86, tee: 0.72, dress: 1.25 }[p.kind], W = H * asp;
      const arc = 1.6, R = W / arc; // curved panel wraps the form
      const geo = new THREE.CylinderGeometry(R, R, H, 24, 1, true, -arc / 2, arc);
      const front = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.55, alphaTest: 0.45, roughness: 0.9, side: THREE.FrontSide, normalMap: M.velvet.normalMap, normalScale: new THREE.Vector2(0.3, 0.3) }));
      const backM = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ alphaMap: tex, alphaTest: 0.45, color: 0x0d0c0d, roughness: 0.95, side: THREE.BackSide }));
      const cy = { hoodie: 1.5, tee: 1.52, dress: 1.27 }[p.kind];
      for (const mm of [front, backM]) { mm.position.set(0, cy, 0.17 - R); g.add(mm); }
      // flip u so the photo reads correctly on the outside of the cylinder
      tex.wrapS = THREE.RepeatWrapping; tex.repeat.x = 1;
      hit.push(front, torso); top = cy + H / 2 + 0.2;
      world.circ(s.pos[0], s.pos[2], 0.5);
    } else if (p.kind === 'mug' || p.kind === 'cap') {
      // display table (solid) with a velvet runner; the object sits on a gold stand, shown at 2x
      if (!world._tables) world._tables = new Set();
      const tk = s.pos[0] < 0 ? 'L' : 'R';
      if (!world._tables.has(tk)) {
        world._tables.add(tk);
        const t = new THREE.Group(); t.position.set(...s.pos); t.rotation.y = s.rotY; scene.add(t);
        const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.95), M.woodDark); top.position.y = 0.9; t.add(top);
        const run = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.012, 0.5), M.velvet); run.position.y = 0.946; t.add(run);
        const edge = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.03, 0.99), M.goldBright); edge.position.y = 0.86; t.add(edge);
        for (const x of [-0.95, 0.95]) for (const z of [-0.38, 0.38]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.035, 0.86, 10), M.woodDark); l.position.set(x, 0.43, z); t.add(l); }
        // candle pair on the table
        for (const x of [-0.85, 0.85]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.22, 8), M.wax); c.position.set(x, 1.06, -0.2); t.add(c); }
        world.box(s.pos[0] - 0.55, s.pos[0] + 0.55, s.pos[2] - 1.2, s.pos[2] + 1.2);
      }
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.06, 20), M.goldBright); stand.position.set(0, 0.98, 0); g.add(stand);
      const obj = new THREE.Group(); obj.position.set(0, 1.01, 0); obj.scale.setScalar(2); g.add(obj);
      if (p.kind === 'mug') {
        const r = 0.042, h = 0.096;
        const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.97, h, 32, 1, true), M.ceramicBlack); body.position.y = h / 2; obj.add(body);
        const inner = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.92, r * 0.9, h * 0.96, 32, 1, true), M.ceramicBlack); inner.material = M.ceramicBlack.clone(); inner.material.side = THREE.BackSide; inner.position.y = h / 2 + 0.002; obj.add(inner);
        const bottom = new THREE.Mesh(new THREE.CircleGeometry(r, 32).rotateX(-Math.PI / 2), M.ceramicBlack); bottom.position.y = 0.006; obj.add(bottom);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(r * 0.96, 0.0025, 6, 40).rotateX(Math.PI / 2), M.ceramicBlack); rim.position.y = h; obj.add(rim);
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0065, 10, 24, Math.PI * 1.1), M.ceramicBlack); handle.position.set(-r - 0.002, h / 2, 0); handle.rotation.z = Math.PI / 2 + 0.16; handle.rotation.y = 0; obj.add(handle);
        const dec = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.004, r * 0.974, h * 0.8, 24, 1, true, -0.85, 1.7), (() => { const d = T(p.tex.replace('.webp', '-decal.webp')); return new THREE.MeshStandardMaterial({ map: d, emissiveMap: d, emissive: 0xffffff, emissiveIntensity: 0.35, roughness: 0.2, envMapIntensity: 1.2 }); })());
        dec.position.y = h / 2; obj.add(dec);
        hit.push(body, dec); obj.rotation.y = 0.5;
      } else {
        const crown = new THREE.Mesh(new THREE.SphereGeometry(0.09, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), M.fabricBlack); crown.scale.set(1, 0.85, 1.08); obj.add(crown);
        const brimShape = new THREE.Shape(); brimShape.absellipse(0, 0, 0.085, 0.08, Math.PI, 0, true); brimShape.lineTo(0.085, 0); brimShape.absellipse(0, 0, 0.085, 0.0, 0, Math.PI, false);
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.006, 28, 1, false, -Math.PI / 2, Math.PI), M.fabricBlack); brim.scale.set(1.0, 1, 0.85); brim.position.set(0, 0.004, 0.06); brim.rotation.x = 0.12; obj.add(brim);
        const button = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), M.fabricBlack); button.position.y = 0.077; obj.add(button);
        const dec = new THREE.Mesh(new THREE.SphereGeometry(0.0905, 20, 10, Math.PI / 2 - 0.55, 1.1, 0.75, 0.55), (() => { const d = T(p.tex.replace('.webp', '-decal.webp')); return new THREE.MeshStandardMaterial({ map: d, emissiveMap: d, emissive: 0xffffff, emissiveIntensity: 0.35, roughness: 0.85 }); })());
        dec.scale.copy(crown.scale); obj.add(dec);
        hit.push(crown, dec, brim); obj.rotation.y = -0.4;
      }
      top = 1.5;
    }
    const mk = new THREE.Mesh(markerGeo, markerMat.clone()); mk.position.set(0, top, p.kind === 'tapestry' || s.wall ? 0.2 : 0); g.add(mk); markers.push(mk);
    for (const h of hit) h.userData.interact = { kind: 'product', handle: p.handle };
    items.push({ p, group: g, hit, marker: mk });
  }
  function update(t, targetHandle) {
    for (const it of items) {
      const on = it.p.handle === targetHandle;
      it.marker.rotation.y = t * 1.5; it.marker.position.y += Math.sin(t * 2 + it.group.position.x) * 0.0008;
      it.marker.material.opacity = on ? 1 : 0.55 + 0.25 * Math.sin(t * 2.4 + it.group.position.z);
      it.marker.scale.setScalar(on ? 1.6 : 1);
    }
  }
  return { items, update, hitMeshes: items.flatMap((i) => i.hit) };
}

// ---------------- buy panel ----------------
export function productPanel(data, { onOpen, onClose } = {}) {
  const el = document.getElementById('panel');
  const $ = (id) => document.getElementById(id);
  let cur = null;
  const money = (v) => '$' + Number(v).toFixed(2) + ' ' + (data.products[0]?.currency || 'USD');
  function variant() { return cur.variants.find((v) => String(v.id) === $('p-variant').value) || cur.variants[0]; }
  function refresh() {
    const v = variant(); const qty = Math.max(1, Math.min(9, parseInt($('p-qty').value || '1', 10)));
    $('p-price').textContent = money(v.price);
    const ok = v.available;
    $('p-avail').textContent = ok ? 'Available in the shop' : 'Not available in the shop right now';
    $('p-avail').className = ok ? 'ok' : 'no';
    for (const b of [$('p-add'), $('p-buy')]) b.toggleAttribute('disabled', !ok);
    $('p-add').dataset.href = `${data.shop}/cart/add?id=${v.id}&quantity=${qty}`;
    $('p-buy').dataset.href = `${data.shop}/cart/${v.id}:${qty}`;
  }
  function open(handle) {
    cur = data.products.find((p) => p.handle === handle); if (!cur) return;
    $('p-img').src = cur.image; $('p-img').alt = cur.title;
    $('p-title').textContent = cur.title; $('p-type').textContent = cur.type;
    const sel = $('p-variant'); sel.innerHTML = '';
    for (const v of cur.variants) { const o = document.createElement('option'); o.value = v.id; o.textContent = v.title === 'Default Title' ? 'One option' : `${v.title} · ${money(v.price)}`; if (!v.available) o.textContent += ' (unavailable)'; sel.appendChild(o); }
    $('p-vrow').hidden = cur.variants.length < 2;
    $('p-qty').value = 1; $('p-link').href = cur.url;
    refresh(); el.hidden = false; onOpen && onOpen(cur);
  }
  function close() { el.hidden = true; cur = null; onClose && onClose(); }
  $('p-variant').addEventListener('change', refresh); $('p-qty').addEventListener('input', refresh);
  $('p-close').addEventListener('click', close);
  for (const id of ['p-add', 'p-buy']) $(id).addEventListener('click', () => { const h = $(id).dataset.href; if (h) window.open(h, '_blank', 'noopener'); });
  return { open, close, get current() { return cur; } };
}
