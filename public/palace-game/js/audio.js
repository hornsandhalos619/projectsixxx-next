// Audio: positional CC0 fire crackle loops on every fire + procedural castle ambience (wind and a low drone).
// Starts on the first user gesture (browser autoplay rules). Mute button toggles the master volume.
import * as THREE from 'three';

export function makeAudio(camera, scene, spots) {
  const listener = new THREE.AudioListener(); camera.add(listener);
  let started = false, muted = false, buffer = null;
  const loading = new THREE.AudioLoader().loadAsync('assets/audio/fire-loop.mp3').then((b) => (buffer = b)).catch(() => null);
  async function start() {
    if (started) return; started = true;
    const ctx = listener.context; if (ctx.state === 'suspended') await ctx.resume();
    await loading;
    if (buffer) for (const s of spots) {
      const a = new THREE.PositionalAudio(listener); a.setBuffer(buffer); a.setLoop(true); a.setRefDistance(s.ref); a.setRolloffFactor(1.6); a.setDistanceModel('inverse'); a.setVolume(s.gain);
      a.position.set(...s.pos); scene.add(a); a.offset = Math.random() * buffer.duration * 0.9; a.play();
    }
    // extra crackle pops at the hearth (filtered noise bursts through a panner)
    const hearth = spots.find((s) => s.kind === 'hearth');
    if (hearth) {
      const pop = new THREE.PositionalAudio(listener); const g = ctx.createGain(); g.gain.value = 1; pop.setNodeSource(g); pop.setRefDistance(1.8); pop.setVolume(0.9);
      pop.position.set(...hearth.pos); scene.add(pop);
      const nb = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate); const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 6);
      const crack = () => { const s = ctx.createBufferSource(); s.buffer = nb; s.playbackRate.value = 0.6 + Math.random() * 1.6; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 900 + Math.random() * 2500; const v = ctx.createGain(); v.gain.value = 0.25 + Math.random() * 0.6; s.connect(f).connect(v).connect(g); s.start(); setTimeout(crack, 120 + Math.random() * (Math.random() < 0.2 ? 1600 : 500)); };
      crack();
    }
    // ambience: wind through the hall (band-passed noise with a slow swell) + a low stone-room drone
    const amb = ctx.createGain(); amb.gain.value = 0.5; amb.connect(listener.getInput());
    const nbuf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate); const nd = nbuf.getChannelData(0); let last = 0; for (let i = 0; i < nd.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; nd[i] = last * 3.5; }
    const wind = ctx.createBufferSource(); wind.buffer = nbuf; wind.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 380; bp.Q.value = 0.7;
    const wg = ctx.createGain(); wg.gain.value = 0.25; const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07; const lg = ctx.createGain(); lg.gain.value = 0.18; lfo.connect(lg).connect(wg.gain);
    wind.connect(bp).connect(wg).connect(amb); wind.start(); lfo.start();
    for (const [f, v] of [[55, 0.035], [82.4, 0.02], [110.3, 0.008]]) { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; const og = ctx.createGain(); og.gain.value = v; o.connect(og).connect(amb); o.start(); }
  }
  function setMuted(m) { muted = m; listener.setMasterVolume(m ? 0 : 1); }
  return { start, setMuted, get muted() { return muted; }, get started() { return started; }, listener };
}
