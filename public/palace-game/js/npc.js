// NPCs: CC0 Quaternius rigged characters restyled in the House palette, with modelled halo / horns.
import * as THREE from 'three';
import { sweptHorn, ramHorn } from './materials.js';
import { glowSprite } from './fx.js';

export async function buildNPCs(scene, loader, M, dialogue, world) {
  const npcs = [];
  const defs = [
    { id: 'bifrons', name: 'Bifrons', role: 'Archivist of the House', file: 'assets/models/npc-hooded.glb', pos: [-1.75, 0, 2.7], yaw: 0.35, height: 1.9,
      idle: ['CharacterArmature|Idle_Neutral', 'CharacterArmature|Idle'], talk: 'CharacterArmature|Interact', greet: 'CharacterArmature|Wave', look: 'halo' },
    { id: 'mammon', name: 'Mammon', role: 'Keeper of the shops', file: 'assets/models/npc-man.glb', pos: [1.55, 0, -23.4], yaw: -0.3, height: 1.88,
      idle: ['HumanArmature|Man_Idle'], talk: 'HumanArmature|Man_Standing', greet: 'HumanArmature|Man_Clapping', look: 'horns' },
  ];
  for (const d of defs) {
    const gltf = await loader.loadAsync(d.file);
    const root = gltf.scene; const holder = new THREE.Group(); holder.add(root); scene.add(holder);
    // scale to height
    const bb = new THREE.Box3().setFromObject(root); const h = bb.max.y - bb.min.y; const k = d.height / h;
    root.scale.setScalar(k); root.position.y = -bb.min.y * k;
    holder.position.set(...d.pos); holder.rotation.y = d.yaw;
    let head = null;
    root.traverse((o) => {
      if (o.isBone && o.name === 'Head') head = o;
      if (o.isMesh) {
        o.castShadow = true; o.frustumCulled = false;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        const re = mats.map((m) => restyle(m, d.look));
        o.material = Array.isArray(o.material) ? re : re[0];
        if (/gun|sword|pistol|knife|dagger|axe/i.test(o.name)) o.visible = false;
      }
    });
    // modelled accessories, parented to the head bone so they follow the animation
    if (head) {
      const inv = 1 / (k * worldScale(head, root));
      const acc = new THREE.Group(); acc.scale.setScalar(inv); head.add(acc);
      if (d.look === 'halo') {
        const halo = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.014, 10, 48), M.goldEmissive); halo.rotation.x = Math.PI / 2 - 0.25; halo.position.set(0, 0.36, -0.06); acc.add(halo);
        const gl = glowSprite(0xffcf70, 0.7, 0.45); gl.position.copy(halo.position); acc.add(gl);
      } else {
        for (const sd of [-1, 1]) { const hm = new THREE.Mesh(sweptHorn(sd, 1.0), M.obsidian); hm.position.set(sd * 0.075, 0.2, 0.02); hm.rotation.z = -sd * 0.25; acc.add(hm); }
      }
    }
    const mixer = new THREE.AnimationMixer(root);
    const clip = (n) => (Array.isArray(n) ? n : [n]).map((x) => THREE.AnimationClip.findByName(gltf.animations, x)).find(Boolean);
    const idle = mixer.clipAction(clip(d.idle) || gltf.animations[0]); idle.play();
    const acts = { idle };
    for (const kk of ['talk', 'greet']) { const c = clip(d[kk]); if (c) { const a = mixer.clipAction(c); a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = false; acts[kk] = a; } }
    mixer.addEventListener('finished', () => { idle.reset().fadeIn(0.3).play(); });
    // invisible tap target (capsule)
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, d.height, 8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = d.height / 2; hit.userData.interact = { kind: 'npc', id: d.id }; holder.add(hit);
    world.circ(d.pos[0], d.pos[2], 0.45);
    npcs.push({ ...d, holder, root, mixer, acts, hit, baseYaw: d.yaw, greeted: false, lineIdx: 0 });
  }
  function play(n, which) { const a = n.acts[which]; if (!a) return; n.acts.idle.fadeOut(0.25); a.reset().fadeIn(0.25).play(); }
  const tmp = new THREE.Vector3();
  function update(dt, player, onNear) {
    for (const n of npcs) {
      n.mixer.update(dt);
      tmp.set(player.x - n.holder.position.x, 0, player.z - n.holder.position.z);
      const dist = tmp.length();
      const want = dist < 6 ? Math.atan2(tmp.x, tmp.z) : n.baseYaw;
      let dy = want - n.holder.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      n.holder.rotation.y += dy * Math.min(1, dt * 3);
      if (dist < 4.2 && !n.greeted) { n.greeted = true; play(n, 'greet'); onNear && onNear(n); }
    }
  }
  return { npcs, update, play, hitMeshes: npcs.map((n) => n.hit) };
}

function worldScale(bone, root) { const v = new THREE.Vector3(); root.updateMatrixWorld(true); bone.getWorldScale(v); const r = new THREE.Vector3(); root.getWorldScale(r); return v.x / r.x; }

// House palette restyle: Bifrons in ivory and gold robes; Mammon in a gold-threaded charcoal coat.
function restyle(m, look) {
  const n = (m.name || '').toLowerCase();
  const out = new THREE.MeshStandardMaterial({ color: m.color ? m.color.clone() : new THREE.Color(0x777777), roughness: 0.8, metalness: 0 });
  const set = (hex, r = 0.8, mt = 0) => { out.color.set(hex); out.roughness = r; out.metalness = mt; };
  if (n.includes('skin')) set(look === 'halo' ? 0xe6d0ba : 0xc9b6a8, 0.55);
  else if (n.includes('eye')) set(0x101010, 0.3);
  else if (n.includes('hair')) set(0x0d0b0b, 0.7);
  else if (look === 'halo') {
    if (n.includes('gold') || n.includes('metal')) set(0xd4a646, 0.3, 1);
    else if (n.includes('black') || n.includes('dark')) set(0x8a7a5a, 0.6, 0.6);
    else set(0xe6dccb, 0.85);
  } else {
    if (n.includes('shirt')) set(0x5a2a30, 0.6, 0.15);
    else if (n.includes('pants')) set(0x2a2426, 0.8);
    else if (n.includes('sock') || n.includes('shoe')) set(0x0a0909, 0.5);
    else set(0x3a3437, 0.8);
  }
  out.emissive = out.color.clone().multiplyScalar(0.12); if (look !== 'halo' && n.includes('shirt')) out.emissive.add(new THREE.Color(0x2a1a04));
  return out;
}

// ---------------- dialogue box ----------------
export function dialogueUI(data, products, panel, npcSys) {
  const el = document.getElementById('dialog'), $ = (id) => document.getElementById(id);
  let cur = null; let idx = {};
  const pick = (arr, key) => { idx[key] = ((idx[key] ?? -1) + 1) % arr.length; return arr[idx[key]]; };
  function say(n, text, buttons) {
    cur = n; $('dl-name').textContent = n.name; $('dl-role').textContent = n.role; $('dl-text').textContent = text;
    const b = $('dl-buttons'); b.innerHTML = '';
    for (const [label, fn] of buttons) { const x = document.createElement('button'); x.textContent = label; x.addEventListener('click', fn); b.appendChild(x); }
    el.hidden = false;
  }
  function close() { el.hidden = true; cur = null; }
  function bifrons(n) {
    const L = data.bifrons;
    say(n, pick(L.idle, 'bi'), [
      ['Tell me more', () => bifrons(n)],
      ['Where does the ring lead?', () => say(n, pick(L.portal, 'bp'), [['Tell me more', () => bifrons(n)], ['Goodbye', close]])],
      ['Goodbye', close],
    ]);
  }
  function spec(p) {
    const opts = p.variants.map((v) => v.title).filter((t) => t !== 'Default Title');
    return opts.length ? `${p.type}. Options on the record: ${opts.slice(0, 5).join(', ')}${opts.length > 5 ? ', and more' : ''}` : `${p.type}`;
  }
  function show(n) {
    const L = data.mammon;
    idx.mp = ((idx.mp ?? -1) + 1) % data_products.length; const p = data_products[idx.mp];
    const status = p.variants.some((v) => v.available) ? 'available in the shop today' : 'not available in the shop today';
    const line = pick(L.drawer, 'md').replace('{title}', p.title).replace('{spec_line}', spec(p)).replace('{status_phrase}', status).replace(/\.\./g, '.');
    say(n, line, [['Show me another', () => show(n)], ['What is it worth?', () => mammon(n, false)], ['Goodbye', close]]);
    panel.open(p.handle); npcSys.play(n, 'talk');
    window.dispatchEvent(new CustomEvent('npc-recommend', { detail: p.handle }));
  }
  function mammon(n, first) {
    const L = data.mammon;
    say(n, first ? pick(L.enter, 'me') : pick(L.worth, 'mw'), [
      ['Show me something', () => show(n)],
      ["I'm just looking", () => say(n, pick(L.looking, 'ml'), [['Show me something', () => show(n)], ['Goodbye', close]])],
      ['Goodbye', close],
    ]);
  }
  let data_products = products.products.slice().sort(() => 0.5 - Math.random());
  function talk(n) { npcSys.play(n, 'talk'); if (n.id === 'bifrons') bifrons(n); else { mammon(n, !n._met); n._met = true; } }
  $('dl-close').addEventListener('click', close);
  return { talk, close, show, get open() { return !el.hidden; }, say };
}
