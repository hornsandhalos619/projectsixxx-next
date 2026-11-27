// First-person controls: bottom-right joystick (up = forward, down = back, left/right = turn),
// WASD / arrows, drag-to-look, tap-to-select. Capsule (circle in XZ) collision against boxes and circles.
import * as THREE from 'three';

export function makeControls(camera, dom, colliders, { onTap } = {}) {
  const st = { yaw: 0, pitch: 0, pos: new THREE.Vector3(0, 1.65, 14.5), keys: new Set(), joy: { x: 0, y: 0 }, enabled: true, radius: 0.3 };
  const EYE = 1.65;
  // keyboard
  addEventListener('keydown', (e) => { if (e.target.closest && e.target.closest('input,select,textarea')) return; st.keys.add(e.code); if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault(); });
  addEventListener('keyup', (e) => st.keys.delete(e.code));
  addEventListener('blur', () => st.keys.clear());
  // drag to look / tap to select (canvas only; the joystick is its own element)
  let drag = null;
  dom.addEventListener('pointerdown', (e) => { drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), moved: 0 }; dom.setPointerCapture(e.pointerId); });
  dom.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
    const k = e.pointerType === 'touch' ? 0.006 : 0.0042;
    st.yaw -= dx * k; st.pitch = THREE.MathUtils.clamp(st.pitch - dy * k, -1.15, 1.15);
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.moved < 8 && performance.now() - drag.t < 500 && onTap) onTap(e.clientX, e.clientY);
    drag = null;
  };
  dom.addEventListener('pointerup', end); dom.addEventListener('pointercancel', () => (drag = null));
  // joystick
  const joy = document.getElementById('joy'), knob = document.getElementById('knob'); let jid = null;
  const setKnob = (x, y) => { knob.style.transform = `translate(calc(-50% + ${x * 34}px), calc(-50% + ${y * 34}px))`; };
  const jmove = (e) => { const r = joy.getBoundingClientRect(); let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2); const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } st.joy.x = x; st.joy.y = y; setKnob(x, y); };
  joy.addEventListener('pointerdown', (e) => { jid = e.pointerId; joy.setPointerCapture(jid); jmove(e); e.preventDefault(); });
  joy.addEventListener('pointermove', (e) => { if (e.pointerId === jid) jmove(e); });
  const jend = (e) => { if (e.pointerId !== jid) return; jid = null; st.joy.x = st.joy.y = 0; setKnob(0, 0); };
  joy.addEventListener('pointerup', jend); joy.addEventListener('pointercancel', jend);

  function collide(p) {
    const r = st.radius;
    for (let it = 0; it < 3; it++) {
      for (const c of colliders.circles) { const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = c.r + r; if (d < m && d > 1e-6) { p.x = c.x + dx / d * m; p.z = c.z + dz / d * m; } }
      for (const b of colliders.boxes) {
        const cx = Math.max(b.x0, Math.min(p.x, b.x1)), cz = Math.max(b.z0, Math.min(p.z, b.z1));
        const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
        if (d < r) {
          if (d > 1e-6) { p.x = cx + dx / d * r; p.z = cz + dz / d * r; }
          else { // centre inside the box: push out along the shallowest axis
            const o = [[p.x - b.x0 + r, -1, 0], [b.x1 - p.x + r, 1, 0], [p.z - b.z0 + r, 0, -1], [b.z1 - p.z + r, 0, 1]].sort((a, b2) => a[0] - b2[0])[0];
            p.x += o[1] * o[0]; p.z += o[2] * o[0];
          }
        }
      }
    }
  }
  const fwd = new THREE.Vector3(), right = new THREE.Vector3();
  function update(dt) {
    if (st.enabled) {
      const K = st.keys, run = K.has('ShiftLeft') || K.has('ShiftRight');
      let f = 0, s = 0, turn = 0;
      if (K.has('KeyW') || K.has('ArrowUp')) f += 1;
      if (K.has('KeyS') || K.has('ArrowDown')) f -= 1;
      if (K.has('KeyA')) s -= 1; if (K.has('KeyD')) s += 1;
      if (K.has('ArrowLeft')) turn += 1; if (K.has('ArrowRight')) turn -= 1;
      f += -st.joy.y; turn += -st.joy.x * 0.9;
      st.yaw += turn * 1.9 * dt;
      const speed = (run ? 4.4 : 2.6);
      fwd.set(-Math.sin(st.yaw), 0, -Math.cos(st.yaw)); right.set(Math.cos(st.yaw), 0, -Math.sin(st.yaw));
      const mv = fwd.multiplyScalar(f).add(right.multiplyScalar(s)); if (mv.lengthSq() > 1) mv.normalize();
      const steps = Math.ceil(speed * dt / 0.1) || 1;
      for (let i = 0; i < steps; i++) { st.pos.addScaledVector(mv, speed * dt / steps); collide(st.pos); }
      // head bob when walking
      st.bob = (st.bob || 0) + mv.length() * speed * dt * 2.2;
    }
    camera.position.set(st.pos.x, EYE + Math.sin(st.bob || 0) * 0.025, st.pos.z);
    camera.rotation.set(st.pitch, st.yaw, 0, 'YXZ');
  }
  function setPose(x, z, yaw, pitch = 0) { st.pos.set(x, EYE, z); st.yaw = yaw; st.pitch = pitch; collide(st.pos); update(0); }
  return { st, update, setPose };
}
