// Audio sintetizado con Web Audio: campanas de aviso y ruido ambiente.
// No usa archivos externos, así que funciona sin conexión.
import { state } from './store.js';

let ctx = null;
let ambient = null; // { src, gain, type }

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/** iOS exige un gesto del usuario para habilitar el audio: se llama en el primer toque. */
export function unlockAudio() {
  const c = ac();
  if (!c) return;
  const b = c.createBuffer(1, 1, 22050);
  const s = c.createBufferSource();
  s.buffer = b; s.connect(c.destination); s.start(0);
}

function bell(c, t, freq, dur, vol) {
  // Campana suave: fundamental + parciales inarmónicos con caída exponencial.
  const out = c.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  out.connect(c.destination);
  [[1, 1], [2.01, 0.35], [2.76, 0.18], [4.07, 0.08]].forEach(([m, a]) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.value = freq * m;
    g.gain.value = a;
    o.connect(g).connect(out);
    o.start(t); o.stop(t + dur + 0.05);
  });
}

/** kind: 'focus-end' | 'break-end' | 'test' */
export function chime(kind = 'focus-end') {
  if (!state.settings.sound) return;
  const c = ac();
  if (!c) return;
  const v = 0.25 * state.settings.volume;
  const t = c.currentTime + 0.02;
  if (kind === 'break-end') {
    // Ascendente: vuelta al trabajo
    bell(c, t, 523.25, 1.4, v);
    bell(c, t + 0.18, 659.25, 1.4, v);
    bell(c, t + 0.36, 783.99, 2.0, v);
  } else {
    // Descendente y cálida: hora de descansar
    bell(c, t, 880, 1.6, v);
    bell(c, t + 0.22, 659.25, 2.2, v);
  }
}

// ---------- Ruido ambiente ----------
function noiseBuffer(c, type) {
  const len = c.sampleRate * 4;
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (type === 'pink') {
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;   b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;   b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      } else if (type === 'brown') {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      } else {
        d[i] = w * 0.35;
      }
    }
    // Fundido en los extremos para que el bucle no haga "clic".
    const f = 2048;
    for (let i = 0; i < f; i++) { const k = i / f; d[i] *= k; d[len - 1 - i] *= k; }
  }
  return buf;
}

const bufCache = {};

export function startAmbient(type = state.settings.ambient) {
  if (!type || type === 'off') return stopAmbient();
  const c = ac();
  if (!c) return;
  if (ambient && ambient.type === type) { setAmbientVolume(); return; }
  stopAmbient(true);
  const src = c.createBufferSource();
  src.buffer = bufCache[type] || (bufCache[type] = noiseBuffer(c, type));
  src.loop = true;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, state.settings.ambientVolume), c.currentTime + 1.2);
  src.connect(gain).connect(c.destination);
  src.start();
  ambient = { src, gain, type };
}

export function setAmbientVolume() {
  if (!ambient || !ctx) return;
  ambient.gain.gain.setTargetAtTime(Math.max(0.0002, state.settings.ambientVolume), ctx.currentTime, 0.15);
}

export function stopAmbient(fast = false) {
  if (!ambient || !ctx) return;
  const { src, gain } = ambient;
  ambient = null;
  const t = ctx.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(Math.max(0.0002, gain.gain.value), t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + (fast ? 0.05 : 0.8));
  src.stop(t + (fast ? 0.08 : 0.85));
}

export const ambientPlaying = () => !!ambient;
