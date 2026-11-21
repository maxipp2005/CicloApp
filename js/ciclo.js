/* Ciclo — archivo generado por build.mjs a partir de src/. No lo edites a mano. */
(() => {
'use strict';
const __m = {};

// ===== utils.js =====
__m["utils.js"] = (() => {
// Utilidades compartidas: DOM, formato, fechas e iconos.

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

/** mm:ss (o h:mm:ss) a partir de milisegundos */
function fmtClock(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** "2 h 15 min" / "45 min" */
function fmtMinutes(min) {
  min = Math.round(min);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Horas con un decimal: "3,5" */
const fmtHours = (min) => (min / 60).toLocaleString('es-ES', { maximumFractionDigits: 1 });

// ---------- Fechas (siempre en hora local) ----------
const pad2 = (n) => String(n).padStart(2, '0');
const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseDay = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / 86400000);

const WD = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const WD_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const MO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const weekdayShort = (d) => WD[d.getDay()];
const weekdayLetter = (d) => WD_SHORT[d.getDay()];
const monthShort = (d) => MO[d.getMonth()];
const fmtDate = (d) => `${weekdayShort(d)} ${d.getDate()} ${monthShort(d)}`;
const fmtTime = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

/** Texto relativo para una cuenta atrás en días */
function relDays(n) {
  if (n === 0) return 'Hoy';
  if (n === 1) return 'Mañana';
  if (n === -1) return 'Ayer';
  if (n < 0) return `Hace ${-n} días`;
  if (n < 14) return `En ${n} días`;
  const w = Math.round(n / 7);
  return n < 60 ? `En ${w} semanas` : `En ${Math.round(n / 30)} meses`;
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

function debounce(fn, ms = 300) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

function download(filename, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

const PALETTE = ['#E5532F', '#E0912F', '#D4B21E', '#2F9C72', '#2A9DB0', '#4C66E6', '#8A5CF0', '#D9468C', '#7A7A80'];

// ---------- Iconos (trazos de 24px) ----------
const P = {
  play: '<path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/>',
  pause: '<rect x="6.5" y="5" width="4" height="14" rx="1.3"/><rect x="13.5" y="5" width="4" height="14" rx="1.3"/>',
  reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/>',
  skip: '<path d="M6 5l9 7-9 7V5zM18 5v14"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/>',
  chevR: '<path d="M9 6l6 6-6 6"/>',
  chevL: '<path d="M15 6l-6 6 6 6"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>',
  sound: '<path d="M4 10v4h3l5 4V6L7 10H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>',
  mute: '<path d="M4 10v4h3l5 4V6L7 10H4zM17 10l4 4M21 10l-4 4"/>',
  wave: '<path d="M3 12h2l2-5 3 10 3-14 3 12 2-3h3"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
  note: '<path d="M6 3h9l5 5v13H6zM15 3v5h5M9 13h7M9 17h5"/>',
  tools: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19l-3 1 1-3 7.5-7.5zM4 4l5 5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  binary: '<path d="M6 4v6M4 4h2M4 10h4M16 4a2 2 0 0 1 2 2v2a2 2 0 0 1-4 0V6a2 2 0 0 1 2-2zM8 14a2 2 0 0 1 2 2v2a2 2 0 0 1-4 0v-2a2 2 0 0 1 2-2zM18 14v6M16 14h2M16 20h4"/>',
  grade: '<path d="M3 9l9-5 9 5-9 5-9-5zM7 11.5V16c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.5M21 9v6"/>',
  keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M7 14h10"/>',
  bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16zM10 20.5a2 2 0 0 0 4 0"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 20V9M7 13.5l5-5 5 5M5 4h14"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  flame: '<path d="M12 3s5 4.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 1.5-4s.5 2.5 2.5 2.5C11 9 12 3 12 3z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.2-1-1.6-1-2.6 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
};
const icon = (name, cls = '') => `<svg viewBox="0 0 24 24" aria-hidden="true"${cls ? ` class="${cls}"` : ''}>${P[name] || ''}</svg>`;

return { $, $$, esc, uid, clamp, fmtClock, fmtMinutes, fmtHours, dayKey, parseDay, startOfDay, addDays, daysBetween, weekdayShort, weekdayLetter, monthShort, fmtDate, fmtTime, relDays, plural, debounce, download, isIOS, isStandalone, PALETTE, icon };
})();

// ===== store.js =====
__m["store.js"] = (() => {
// Estado de la aplicación: persistencia en localStorage, migraciones y consultas.
const { uid, dayKey } = __m["utils.js"];
const KEY = 'ciclo:v1';
const SCHEMA = 1;

const DEFAULT_SETTINGS = {
  focus: 25,            // minutos
  short: 5,
  long: 15,
  longEvery: 4,         // sesiones de enfoque antes del descanso largo
  autoStartBreaks: true,
  autoStartFocus: false,
  dailyGoal: 8,         // pomodoros al día
  sound: true,
  volume: 0.7,
  vibrate: true,
  notifications: false,
  ntfyEnabled: false,
  ntfyTopic: '',
  ntfyServer: 'https://ntfy.sh',
  wakeLock: true,
  titleTimer: true,
  theme: 'auto',        // auto | light | dark
  ambient: 'off',       // off | white | pink | brown
  ambientVolume: 0.35,
  ambientAuto: true,    // sonar solo durante el enfoque
  weekStart: 1,         // lunes
};

const defaults = () => ({
  version: SCHEMA,
  settings: { ...DEFAULT_SETTINGS },
  timer: { phase: 'focus', status: 'idle', endAt: null, remaining: null, cycle: 0, subjectId: null, taskId: null, sessionStart: null, ntfyId: null },
  subjects: [],
  tasks: [],
  events: [],
  sessions: [],
  notes: [],
  grades: { target: 5, items: [] },
  ui: { tasksFilter: 'pending', onboarded: false },
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    return migrate(JSON.parse(raw));
  } catch (e) {
    console.warn('[Ciclo] No se pudo leer el estado, se usa uno nuevo.', e);
    return defaults();
  }
}

/** Rellena claves nuevas sin perder datos de versiones anteriores. */
function migrate(data) {
  const base = defaults();
  const out = { ...base, ...data };
  out.settings = { ...base.settings, ...(data.settings || {}) };
  out.timer = { ...base.timer, ...(data.timer || {}) };
  out.grades = { ...base.grades, ...(data.grades || {}) };
  out.ui = { ...base.ui, ...(data.ui || {}) };
  for (const k of ['subjects', 'tasks', 'events', 'sessions', 'notes']) if (!Array.isArray(out[k])) out[k] = [];
  out.version = SCHEMA;
  return out;
}

const state = load();
const listeners = new Set();
let saveTimer = null;

function save(immediate = false) {
  const write = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { console.warn('[Ciclo] No se pudo guardar', e); }
  };
  clearTimeout(saveTimer);
  if (immediate) write(); else saveTimer = setTimeout(write, 120);
}

/** Ejecuta una mutación, guarda y avisa a los suscriptores. */
function update(fn, { silent = false } = {}) {
  fn(state);
  save();
  if (!silent) listeners.forEach((l) => l(state));
}
const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn));

// Guardado inmediato al salir/ocultar (iOS puede congelar la app en cualquier momento).
addEventListener('pagehide', () => save(true));
document.addEventListener('visibilitychange', () => { if (document.hidden) save(true); });

// ---------- Consultas ----------
const subjectById = (id) => state.subjects.find((s) => s.id === id) || null;
const taskById = (id) => state.tasks.find((t) => t.id === id) || null;

function minutesByDay() {
  const map = new Map();
  for (const s of state.sessions) {
    const k = dayKey(new Date(s.start));
    map.set(k, (map.get(k) || 0) + s.min);
  }
  return map;
}

function sessionsOn(key) {
  return state.sessions.filter((s) => dayKey(new Date(s.start)) === key);
}

/** Racha de días consecutivos con al menos una sesión (hoy cuenta si ya hay estudio). */
function streak() {
  const days = new Set(state.sessions.map((s) => dayKey(new Date(s.start))));
  let n = 0;
  const d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (days.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

function bestStreak() {
  const keys = [...new Set(state.sessions.map((s) => dayKey(new Date(s.start))))].sort();
  let best = 0, cur = 0, prev = null;
  for (const k of keys) {
    const d = new Date(k + 'T12:00:00');
    cur = prev && Math.round((d - prev) / 86400000) === 1 ? cur + 1 : 1;
    best = Math.max(best, cur);
    prev = d;
  }
  return best;
}

// ---------- Mutaciones frecuentes ----------
function addSubject(name, color) {
  const s = { id: uid(), name: name.trim(), color };
  update((st) => st.subjects.push(s));
  return s;
}

function addTask({ title, subjectId = null, est = 1 }) {
  const t = { id: uid(), title: title.trim(), subjectId, est, done: 0, completed: false, createdAt: Date.now(), completedAt: null };
  update((st) => st.tasks.unshift(t));
  return t;
}

function logSession({ start, end, subjectId, taskId, partial = false }) {
  const min = Math.round((end - start) / 60000);
  if (min < 1) return;
  update((st) => {
    st.sessions.push({ id: uid(), start, end, min, subjectId, taskId, ...(partial ? { partial: true } : {}) });
    const t = st.tasks.find((x) => x.id === taskId);
    if (t && !partial) t.done += 1;
  });
}

// ---------- Copias de seguridad ----------
function exportData() {
  return JSON.stringify({ app: 'Ciclo', exportedAt: new Date().toISOString(), ...state }, null, 2);
}

function importData(text) {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object' || !('settings' in data)) throw new Error('El archivo no parece una copia de Ciclo.');
  const next = migrate(data);
  delete next.app; delete next.exportedAt;
  next.timer = defaults().timer;
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, next);
  save(true);
  listeners.forEach((l) => l(state));
}

function resetAll() {
  const fresh = defaults();
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, fresh);
  save(true);
  listeners.forEach((l) => l(state));
}

return { DEFAULT_SETTINGS, state, save, update, subscribe, subjectById, taskById, minutesByDay, sessionsOn, streak, bestStreak, addSubject, addTask, logSession, exportData, importData, resetAll };
})();

// ===== sound.js =====
__m["sound.js"] = (() => {
// Audio sintetizado con Web Audio: campanas de aviso y ruido ambiente.
// No usa archivos externos, así que funciona sin conexión.
const { state } = __m["store.js"];
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
function unlockAudio() {
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
function chime(kind = 'focus-end') {
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

function startAmbient(type = state.settings.ambient) {
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

function setAmbientVolume() {
  if (!ambient || !ctx) return;
  ambient.gain.gain.setTargetAtTime(Math.max(0.0002, state.settings.ambientVolume), ctx.currentTime, 0.15);
}

function stopAmbient(fast = false) {
  if (!ambient || !ctx) return;
  const { src, gain } = ambient;
  ambient = null;
  const t = ctx.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(Math.max(0.0002, gain.gain.value), t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + (fast ? 0.05 : 0.8));
  src.stop(t + (fast ? 0.08 : 0.85));
}

const ambientPlaying = () => !!ambient;

return { unlockAudio, chime, startAmbient, setAmbientVolume, stopAmbient, ambientPlaying };
})();

// ===== notify.js =====
__m["notify.js"] = (() => {
// Notificaciones: del sistema (Service Worker), push remoto opcional con ntfy y bloqueo de pantalla.
const { state, update } = __m["store.js"];
const notifSupported = () => 'Notification' in window;
const notifPermission = () => (notifSupported() ? Notification.permission : 'unsupported');

async function requestNotifications() {
  if (!notifSupported()) return 'unsupported';
  let p = Notification.permission;
  if (p === 'default') p = await Notification.requestPermission();
  update((s) => { s.settings.notifications = p === 'granted'; });
  return p;
}

/** Muestra una notificación del sistema. Usa el Service Worker cuando existe (obligatorio en iOS/Android). */
async function showNotification(title, body, tag = 'ciclo') {
  if (!state.settings.notifications || notifPermission() !== 'granted') return false;
  const opts = {
    body, tag, renotify: true,
    icon: 'icons/icon-192.png', badge: 'icons/icon-192.png',
    vibrate: state.settings.vibrate ? [180, 80, 180] : undefined,
    data: { url: './#/enfoque' },
  };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) { await reg.showNotification(title, opts); return true; }
    new Notification(title, opts);
    return true;
  } catch (e) {
    console.warn('[Ciclo] Notificación fallida', e);
    return false;
  }
}

function vibrate(pattern = [200, 90, 200]) {
  if (state.settings.vibrate && navigator.vibrate) navigator.vibrate(pattern);
}

// ---------- ntfy (push aunque la app esté cerrada o el móvil bloqueado) ----------
// Se programa un mensaje con retraso en el servidor de ntfy al iniciar el temporizador
// y se cancela si el usuario pausa, reinicia o salta la fase.
const ntfyBase = () => (state.settings.ntfyServer || 'https://ntfy.sh').replace(/\/+$/, '');
const topic = () => encodeURIComponent(state.settings.ntfyTopic.trim());
const ntfyReady = () => state.settings.ntfyEnabled && !!state.settings.ntfyTopic.trim();

async function ntfySchedule(endAt, title, message) {
  if (!ntfyReady()) return;
  await ntfyCancel();
  const delaySec = Math.round((endAt - Date.now()) / 1000);
  if (delaySec < 10) return; // mínimo que admite ntfy
  const id = 'ciclo' + Date.now().toString(36);
  const q = new URLSearchParams({ title, delay: `${delaySec}s`, tags: 'hourglass', priority: '4', click: location.href.split('#')[0] + '#/enfoque' });
  try {
    // POST sin cabeceras personalizadas = petición "simple" (sin preflight CORS).
    const r = await fetch(`${ntfyBase()}/${topic()}/${id}?${q}`, { method: 'POST', body: message });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    update((s) => { s.timer.ntfyId = id; }, { silent: true });
  } catch (e) {
    console.warn('[Ciclo] ntfy: no se pudo programar', e);
  }
}

async function ntfyCancel() {
  const id = state.timer.ntfyId;
  if (!id) return;
  update((s) => { s.timer.ntfyId = null; }, { silent: true });
  if (!state.settings.ntfyTopic) return;
  try {
    await fetch(`${ntfyBase()}/${topic()}/${id}/delete`, { method: 'GET', cache: 'no-store' });
  } catch (e) {
    console.warn('[Ciclo] ntfy: no se pudo cancelar', e);
  }
}

async function ntfyTest() {
  const q = new URLSearchParams({ title: 'Ciclo', tags: 'white_check_mark' });
  const r = await fetch(`${ntfyBase()}/${topic()}?${q}`, { method: 'POST', body: 'Las notificaciones de Ciclo funcionan.' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
}

function randomTopic() {
  const a = new Uint8Array(9);
  crypto.getRandomValues(a);
  return 'ciclo-' + [...a].map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 14);
}

// ---------- Mantener la pantalla encendida ----------
let lock = null;
async function keepAwake(on) {
  try {
    if (on && state.settings.wakeLock && 'wakeLock' in navigator && !document.hidden) {
      if (!lock) {
        lock = await navigator.wakeLock.request('screen');
        lock.addEventListener('release', () => { lock = null; });
      }
    } else if (lock) {
      await lock.release();
      lock = null;
    }
  } catch { lock = null; }
}

return { notifSupported, notifPermission, requestNotifications, showNotification, vibrate, ntfyReady, ntfySchedule, ntfyCancel, ntfyTest, randomTopic, keepAwake };
})();

// ===== timer.js =====
__m["timer.js"] = (() => {
// Motor del temporizador.
// Se basa en marcas de tiempo absolutas (endAt), no en contar ticks: así sigue siendo exacto
// aunque el navegador congele la app en segundo plano (iOS) o se recargue la página.
const { state, update, logSession, subjectById, taskById } = __m["store.js"];
const { chime, startAmbient, stopAmbient } = __m["sound.js"];
const { showNotification, vibrate, ntfySchedule, ntfyCancel, keepAwake } = __m["notify.js"];
const PHASES = {
  focus: { label: 'Enfoque', verb: 'Concéntrate' },
  short: { label: 'Descanso corto', verb: 'Respira' },
  long: { label: 'Descanso largo', verb: 'Desconecta' },
};

const listeners = new Set();
const onTimer = (fn) => (listeners.add(fn), () => listeners.delete(fn));
const emit = (type, data) => listeners.forEach((l) => l(type, data));

const T = () => state.timer;
const durationOf = (phase) => state.settings[phase] * 60000;

function remaining() {
  const t = T();
  if (t.status === 'running') return Math.max(0, t.endAt - Date.now());
  if (t.status === 'paused') return t.remaining;
  return durationOf(t.phase);
}
const total = () => (T().status === 'idle' ? durationOf(T().phase) : T().total || durationOf(T().phase));
const progress = () => 1 - remaining() / total();

function nextPhase() {
  const t = T();
  if (t.phase !== 'focus') return 'focus';
  return t.cycle + 1 >= state.settings.longEvery ? 'long' : 'short';
}

function syncSideEffects() {
  const t = T();
  const running = t.status === 'running';
  keepAwake(running);
  const s = state.settings;
  if (running && s.ambient !== 'off' && (!s.ambientAuto || t.phase === 'focus')) startAmbient();
  else stopAmbient();
}

function scheduleRemote() {
  const t = T();
  const next = nextPhase();
  const title = t.phase === 'focus' ? 'Enfoque completado' : 'Descanso terminado';
  const body = t.phase === 'focus'
    ? `Buen trabajo. Toca ${PHASES[next].label.toLowerCase()}.`
    : 'Hora de volver a concentrarte.';
  ntfySchedule(t.endAt, title, body);
}

function start() {
  const t = T();
  if (t.status === 'running') return;
  const now = Date.now();
  update((s) => {
    const tm = s.timer;
    const ms = tm.status === 'paused' ? tm.remaining : durationOf(tm.phase);
    if (tm.status === 'idle') { tm.total = ms; if (tm.phase === 'focus') tm.sessionStart = now; }
    tm.endAt = now + ms;
    tm.remaining = null;
    tm.status = 'running';
  });
  scheduleRemote();
  syncSideEffects();
  emit('change');
}

function pause() {
  const t = T();
  if (t.status !== 'running') return;
  update((s) => { s.timer.remaining = Math.max(0, s.timer.endAt - Date.now()); s.timer.endAt = null; s.timer.status = 'paused'; });
  ntfyCancel();
  syncSideEffects();
  emit('change');
}

const toggle = () => (T().status === 'running' ? pause() : start());

/** Vuelve al inicio de la fase actual. */
function reset() {
  update((s) => Object.assign(s.timer, { status: 'idle', endAt: null, remaining: null, total: null, sessionStart: null }));
  ntfyCancel();
  syncSideEffects();
  emit('change');
}

/** Cambia de fase manualmente (pestañas superiores). */
function setPhase(phase) {
  if (!PHASES[phase]) return;
  update((s) => Object.assign(s.timer, { phase, status: 'idle', endAt: null, remaining: null, total: null, sessionStart: null }));
  ntfyCancel();
  syncSideEffects();
  emit('change');
}

/** Salta a la siguiente fase sin contabilizar la actual. */
function skip() {
  const t = T();
  // El tiempo real estudiado se guarda (si pasa de 1 min), pero no cuenta como pomodoro completo.
  if (t.phase === 'focus' && t.status !== 'idle') {
    const studied = (t.total || durationOf('focus')) - remaining();
    if (studied >= 60000) logSession({ start: Date.now() - studied, end: Date.now(), subjectId: t.subjectId, taskId: t.taskId, partial: true });
  }
  const next = nextPhase();
  update((s) => {
    if (s.timer.phase === 'long') s.timer.cycle = 0;
    Object.assign(s.timer, { phase: next, status: 'idle', endAt: null, remaining: null, total: null, sessionStart: null });
  });
  ntfyCancel();
  syncSideEffects();
  emit('change');
}

/** Termina la fase actual en `at` (ms) y prepara la siguiente. Devuelve true si arranca sola. */
function complete(at) {
  const t = T();
  const finished = t.phase;
  if (finished === 'focus') {
    // Se registra la duración planificada (las pausas no cuentan como estudio).
    logSession({ start: at - (t.total || durationOf('focus')), end: at, subjectId: t.subjectId, taskId: t.taskId });
  }
  const next = nextPhase();
  const auto = next === 'focus' ? state.settings.autoStartFocus : state.settings.autoStartBreaks;
  update((s) => {
    const tm = s.timer;
    if (finished === 'focus') tm.cycle += 1;
    if (finished === 'long') tm.cycle = 0;
    tm.phase = next;
    tm.remaining = null;
    tm.ntfyId = null;
    if (auto) {
      tm.status = 'running';
      tm.total = durationOf(next);
      tm.endAt = at + tm.total;
      tm.sessionStart = next === 'focus' ? at : null;
    } else {
      Object.assign(tm, { status: 'idle', endAt: null, total: null, sessionStart: null });
    }
  });
  return auto;
}

/** Sonido, vibración, notificación y aviso interno de fin de fase. */
function announce(finished, auto) {
  const next = T().phase;
  const what = taskById(T().taskId)?.title || subjectById(T().subjectId)?.name;
  const title = finished === 'focus' ? 'Ciclo completado' : 'Descanso terminado';
  const body = finished === 'focus'
    ? `${what ? `«${what}» · ` : ''}Buen trabajo. ${auto ? 'Empieza' : 'Toca'} ${PHASES[next].label.toLowerCase()}.`
    : `Hora de volver a concentrarte${auto ? ': el enfoque ya está en marcha' : ''}.`;
  chime(finished === 'focus' ? 'focus-end' : 'break-end');
  vibrate();
  // Con la app a la vista basta el aviso interno; si no, notificación del sistema.
  if (document.hidden || !document.hasFocus()) showNotification(title, body, 'ciclo-phase');
  emit('complete', { finished, next, auto, title, body });
}

/**
 * Comprueba si la fase terminó. Si la app estuvo congelada (p. ej. iPhone bloqueado),
 * encadena las fases que se habrían completado con autoinicio usando sus horas reales
 * y avisa una sola vez.
 */
function tick() {
  const t = T();
  if (t.status !== 'running') return;
  if (Date.now() < t.endAt) { emit('tick'); return; }
  let last = null, guard = 0;
  while (T().status === 'running' && Date.now() >= T().endAt && guard++ < 50) {
    const finished = T().phase;
    last = { finished, auto: complete(T().endAt) };
  }
  if (last) announce(last.finished, last.auto);
  if (T().status === 'running') scheduleRemote();
  syncSideEffects();
  emit('change');
}

let loop = null;
function boot() {
  clearInterval(loop);
  loop = setInterval(tick, 250);
  document.addEventListener('visibilitychange', () => { tick(); syncSideEffects(); });
  addEventListener('focus', tick);
  tick();
  syncSideEffects();
}

function setContext({ subjectId, taskId }) {
  update((s) => {
    if (subjectId !== undefined) s.timer.subjectId = subjectId;
    if (taskId !== undefined) s.timer.taskId = taskId;
  });
  emit('change');
}

return { PHASES, onTimer, durationOf, remaining, total, progress, start, pause, toggle, reset, setPhase, skip, tick, boot, setContext };
})();

// ===== router.js =====
__m["router.js"] = (() => {
// Enrutado por hash: funciona en GitHub Pages sin configurar el servidor.
const parse = () => {
  const [view = 'enfoque', sub = ''] = location.hash.replace(/^#\/?/, '').split('/');
  return { view: view || 'enfoque', sub };
};
const go = (view, sub = '') => { location.hash = `#/${view}${sub ? '/' + sub : ''}`; };

return { parse, go };
})();

// ===== ui.js =====
__m["ui.js"] = (() => {
// Componentes de interfaz reutilizables: avisos, hojas modales y selectores.
const { $, esc, icon, PALETTE } = __m["utils.js"];
const { state, subjectById } = __m["store.js"];
// ---------- Avisos (toasts) ----------
function toast(msg, { action, onAction, timeout = 3800 } = {}) {
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${esc(action)}</button>` : ''}`;
  box.appendChild(el);
  const close = () => { el.classList.add('is-out'); setTimeout(() => el.remove(), 300); };
  if (action) el.querySelector('button').onclick = () => { onAction?.(); close(); };
  setTimeout(close, timeout);
  while (box.children.length > 3) box.firstChild.remove();
}

// ---------- Hoja modal ----------
/**
 * Abre una hoja con un formulario. Resuelve con { value, data } al cerrarse.
 * value = valor del botón pulsado ('' si se cerró con Esc o tocando fuera).
 */
function sheet({ title, text = '', body = '', actions, onOpen } = {}) {
  const dlg = $('#sheet');
  const form = $('#sheetInner');
  actions ??= [{ label: 'Cancelar', value: 'cancel' }, { label: 'Guardar', value: 'ok', kind: 'primary' }];
  const primary = actions.find((a) => a.kind === 'primary' || a.kind === 'accent');
  form.innerHTML = `
    ${primary ? `<button class="sr-only" value="${primary.value}" tabindex="-1" aria-hidden="true"></button>` : ''}
    ${title ?`<h2 class="sheet__title">${esc(title)}</h2>` : ''}
    ${text ? `<p class="sheet__text">${text}</p>` : ''}
    ${body}
    ${actions.length ? `<div class="sheet__actions">${actions.map((a) =>
      `<button class="btn btn--${a.kind || 'ghost'}" value="${a.value}" ${a.value === 'cancel' || a.novalidate ? 'formnovalidate' : ''}>${esc(a.label)}</button>`).join('')}</div>` : ''}`;
  dlg.returnValue = '';
  return new Promise((resolve) => {
    const close = (value) => { dlg.close(value); };
    const onBackdrop = (e) => { if (e.target === dlg) close(''); };
    dlg.addEventListener('click', onBackdrop);
    dlg.addEventListener('close', () => {
      dlg.removeEventListener('click', onBackdrop);
      const data = Object.fromEntries(new FormData(form));
      resolve({ value: dlg.returnValue, data, form });
    }, { once: true });
    dlg.showModal();
    onOpen?.(form, close);
    const first = form.querySelector('[autofocus]');
    if (first && matchMedia('(hover: hover)').matches) first.focus();
  });
}

async function confirmSheet(title, text, { ok = 'Eliminar', kind = 'danger' } = {}) {
  const { value } = await sheet({ title, text, actions: [{ label: 'Cancelar', value: 'cancel' }, { label: ok, value: 'ok', kind }] });
  return value === 'ok';
}

/** Lista de opciones a elegir. options: [{ value, label, color?, hint? }] */
async function pickSheet(title, options, current, { footer = '' } = {}) {
  const body = `<div class="opt-list">${options.map((o) => `
    <button type="button" class="opt ${o.value === current ? 'is-on' : ''}" data-v="${esc(o.value ?? '')}">
      ${o.color !== undefined ? `<i style="background:${o.color || 'var(--line-strong)'}"></i>` : ''}
      <span>${esc(o.label)}</span>${o.hint ? `<small>${esc(o.hint)}</small>` : ''}
      ${o.value === current ? icon('check', 'row__chev') : ''}
    </button>`).join('')}</div>${footer}`;
  let picked;
  const res = await sheet({
    title, body, actions: [{ label: 'Cerrar', value: 'cancel' }],
    onOpen: (form, close) => form.querySelectorAll('[data-v]').forEach((b) =>
      b.addEventListener('click', () => { picked = b.dataset.v; close('pick'); })),
  });
  return res.value === 'pick' ? picked : undefined;
}

// ---------- Fragmentos HTML ----------
const subjectOptions = (selected, { none = 'Sin asignatura' } = {}) =>
  `<option value="">${esc(none)}</option>` +
  state.subjects.map((s) => `<option value="${s.id}" ${s.id === selected ? 'selected' : ''}>${esc(s.name)}</option>`).join('');

function subjectChip(id) {
  const s = subjectById(id);
  if (!s) return '';
  return `<span class="chip"><i style="background:${s.color}"></i><b>${esc(s.name)}</b></span>`;
}

const swatches = (name, current) => `<div class="swatches">${PALETTE.map((c) => `
  <label style="color:${c}"><input type="radio" name="${name}" value="${c}" ${c === current ? 'checked' : ''}><span style="background:${c}"></span></label>`).join('')}</div>`;

const stepper = (key, value, unit = '') =>
  `<div class="stepper" data-stepper="${key}"><button type="button" data-act="step" data-step="-1" aria-label="Menos">−</button><output>${value}${unit}</output><button type="button" data-act="step" data-step="1" aria-label="Más">+</button></div>`;

const toggle = (key, on, label) =>
  `<label class="switch"><input type="checkbox" data-setting="${key}" ${on ? 'checked' : ''} aria-label="${esc(label || key)}"><span></span></label>`;

const viewHeader = (title, sub = '', end = '') =>
  `<header class="vh"><div><h1>${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ''}</div>${end}</header>`;

const emptyState = (ic, title, text) =>
  `<div class="empty">${icon(ic)}<b>${esc(title)}</b><p>${text}</p></div>`;

return { toast, sheet, confirmSheet, pickSheet, subjectOptions, subjectChip, swatches, stepper, toggle, viewHeader, emptyState };
})();

// ===== views/focus.js =====
__m["views/focus.js"] = (() => {
// Vista principal: temporizador.
const { $, $$, esc, icon, fmtClock, fmtMinutes, dayKey, daysBetween, parseDay, relDays } = __m["utils.js"];
const { state, update, subjectById, taskById, sessionsOn, addSubject, addTask } = __m["store.js"];
const timer = __m["timer.js"];
const { pickSheet, sheet, toast, subjectOptions, swatches } = __m["ui.js"];
const { startAmbient, stopAmbient, setAmbientVolume, unlockAudio } = __m["sound.js"];
const { PALETTE } = __m["utils.js"];
const R = 47.5;
const C = 2 * Math.PI * R;
const AMBIENT = { off: 'Sin sonido', white: 'Ruido blanco', pink: 'Ruido rosa', brown: 'Ruido marrón' };

function render() {
  const t = state.timer;
  const s = state.settings;
  const dots = Array.from({ length: s.longEvery }, (_, i) => `<span data-dot="${i}"></span>`).join('');
  return `
  <section class="view focus focus--wide">
    <div class="focus__stage">
      <div class="focus__top">
        <div class="phase-tabs" role="tablist" aria-label="Fase">
          ${Object.entries(timer.PHASES).map(([k, p]) => `<button role="tab" data-act="phase" data-phase="${k}">${k === 'focus' ? 'Enfoque' : k === 'short' ? 'Corto' : 'Largo'}</button>`).join('')}
        </div>
        <button class="icon-btn" data-act="zen" title="Modo concentración (F)" aria-label="Modo concentración">${icon('expand')}</button>
      </div>

      <div class="dial" id="dial">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle class="dial__track" cx="50" cy="50" r="${R}"/>
          <circle class="dial__arc no-anim" id="arc" cx="50" cy="50" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="0"/>
        </svg>
        <div class="dial__center">
          <div class="dial__time" id="time" role="timer" aria-live="off">--:--</div>
          <div class="dial__label" id="plabel"></div>
        </div>
      </div>

      <div>
        <div class="cycle-dots" id="dots" aria-hidden="true">${dots}</div>
        <div class="cycle-meta" id="cmeta"></div>
      </div>

      <div class="controls">
        <button class="icon-btn" data-act="reset" title="Reiniciar (R)" aria-label="Reiniciar">${icon('reset')}</button>
        <button class="play" data-act="toggle" id="play" aria-label="Iniciar">${icon('play')}</button>
        <button class="icon-btn" data-act="skip" title="Saltar fase (S)" aria-label="Saltar fase">${icon('skip')}</button>
      </div>

      <div class="goal-line" id="goal"></div>
    </div>

    <aside class="focus__context">
      <button class="picker" data-act="pick-subject">
        <span class="picker__dot" id="subjDot"></span>
        <span class="picker__main"><span class="picker__k">Asignatura</span><span class="picker__v" id="subjName"></span></span>
        ${icon('chevR', 'row__chev')}
      </button>
      <button class="picker" data-act="pick-task">
        <span class="picker__dot" style="background:transparent;box-shadow:inset 0 0 0 1.5px var(--muted)"></span>
        <span class="picker__main"><span class="picker__k">Tarea</span><span class="picker__v" id="taskName"></span></span>
        ${icon('chevR', 'row__chev')}
      </button>
      <div class="focus__tools">
        <button class="tool-pill ${s.ambient !== 'off' ? 'is-on' : ''}" data-act="ambient" id="ambPill">${icon('wave')}<span>${AMBIENT[s.ambient]}</span></button>
        <button class="tool-pill ${s.sound ? '' : 'is-on'}" data-act="sound" id="sndPill">${icon(s.sound ? 'sound' : 'mute')}<span>${s.sound ? 'Aviso sonoro' : 'Silencio'}</span></button>
      </div>
      <div id="nextEvent"></div>
    </aside>
  </section>`;
}

let offTimer = null;
let lastPhase = null;

function mount(root) {
  lastPhase = null;
  offTimer = timer.onTimer((type, data) => {
    paint();
    if (type === 'complete') {
      $('#dial')?.classList.add('is-done');
      setTimeout(() => $('#dial')?.classList.remove('is-done'), 2600);
    }
  });
  paint(true);
  paintContext();
  paintNextEvent();
}
function unmount() { offTimer?.(); offTimer = null; }

/** Actualiza solo lo que cambia cada segundo (sin rehacer el DOM). */
function paint(first = false) {
  const t = state.timer;
  const time = $('#time');
  if (!time) return;
  const rem = timer.remaining();
  const prog = Math.min(1, Math.max(0, timer.progress()));
  time.textContent = fmtClock(rem);

  const arc = $('#arc');
  const phaseChanged = lastPhase !== t.phase;
  if (first || phaseChanged || t.status !== 'running') arc.classList.add('no-anim'); else arc.classList.remove('no-anim');
  arc.style.strokeDashoffset = String(C * prog);
  lastPhase = t.phase;

  const p = timer.PHASES[t.phase];
  $('#plabel').innerHTML = t.status === 'paused' ? 'En pausa' : t.status === 'running' ? `<b>${p.label}</b>` : p.label;
  const play = $('#play');
  const running = t.status === 'running';
  play.innerHTML = icon(running ? 'pause' : 'play');
  play.setAttribute('aria-label', running ? 'Pausar' : t.status === 'paused' ? 'Reanudar' : 'Iniciar');
  $$('[data-act="phase"]').forEach((b) => { const on = b.dataset.phase === t.phase; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });

  const n = state.settings.longEvery;
  $$('#dots span').forEach((d, i) => {
    d.className = i < t.cycle ? 'is-done' : (i === t.cycle && t.phase === 'focus' ? 'is-now' : '');
  });
  const round = Math.min(t.cycle + (t.phase === 'focus' ? 1 : 0), n);
  $('#cmeta').textContent = t.phase === 'long' ? 'Ciclo completo: descanso largo' : `Sesión ${Math.max(round, 1)} de ${n}`;

  const today = sessionsOn(dayKey());
  const poms = today.filter((s) => !s.partial && !s.manual).length;
  const mins = today.reduce((a, s) => a + s.min, 0);
  const goal = state.settings.dailyGoal;
  $('#goal').innerHTML = `<span>${poms}/${goal} hoy</span><span class="goal-bar"><i style="width:${Math.min(100, (poms / goal) * 100)}%"></i></span><span>${fmtMinutes(mins)}</span>`;
}

function paintContext() {
  const t = state.timer;
  const subj = subjectById(t.subjectId);
  const task = taskById(t.taskId);
  const sn = $('#subjName'), tn = $('#taskName');
  if (!sn) return;
  $('#subjDot').style.background = subj ? subj.color : 'var(--line-strong)';
  sn.textContent = subj ? subj.name : 'Elegir asignatura';
  sn.classList.toggle('is-empty', !subj);
  tn.textContent = task ? `${task.title} · ${task.done}/${task.est}` : 'Elegir tarea (opcional)';
  tn.classList.toggle('is-empty', !task);
}

function paintNextEvent() {
  const box = $('#nextEvent');
  if (!box) return;
  const today = dayKey();
  const next = state.events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
  if (!next) { box.innerHTML = ''; return; }
  const n = daysBetween(new Date(), parseDay(next.date));
  const subj = subjectById(next.subjectId);
  box.innerHTML = `<a class="picker" href="#/agenda">
    <span class="picker__dot" style="background:${subj?.color || 'var(--muted)'}"></span>
    <span class="picker__main"><span class="picker__k">Próximo · ${esc(next.type)}</span><span class="picker__v">${esc(next.title)}</span></span>
    <span class="countdown" style="color:${n <= 3 ? 'var(--danger)' : n <= 7 ? 'var(--warn)' : 'var(--muted)'}">${relDays(n)}</span></a>`;
}

// ---------- Acciones ----------
const actions = {
  toggle() { unlockAudio(); timer.toggle(); },
  reset() { timer.reset(); },
  skip() { timer.skip(); },
  phase(el) { timer.setPhase(el.dataset.phase); },
  zen() { toggleZen(); },

  async 'pick-subject'() {
    const opts = [{ value: '', label: 'Sin asignatura', color: '' },
      ...state.subjects.map((s) => ({ value: s.id, label: s.name, color: s.color })),
      { value: '__new', label: 'Nueva asignatura…' }];
    const v = await pickSheet('Asignatura', opts, state.timer.subjectId || '');
    if (v === undefined) return;
    if (v === '__new') {
      const s = await newSubjectSheet();
      if (s) timer.setContext({ subjectId: s.id });
    } else {
      const task = taskById(state.timer.taskId);
      timer.setContext({ subjectId: v || null, ...(task && task.subjectId !== (v || null) ? { taskId: null } : {}) });
    }
    paintContext();
  },

  async 'pick-task'() {
    const sid = state.timer.subjectId;
    const pending = state.tasks.filter((t) => !t.completed && (!sid || t.subjectId === sid));
    const opts = [{ value: '', label: 'Sin tarea' },
      ...pending.map((t) => ({ value: t.id, label: t.title, hint: `${t.done}/${t.est}`, color: subjectById(t.subjectId)?.color || '' })),
      { value: '__new', label: 'Nueva tarea…' }];
    const v = await pickSheet(sid ? `Tareas · ${subjectById(sid)?.name}` : 'Tarea', opts, state.timer.taskId || '');
    if (v === undefined) return;
    if (v === '__new') {
      const { value, data } = await sheet({
        title: 'Nueva tarea',
        body: `<div class="form-stack">
          <label class="field"><span>Qué vas a hacer</span><input class="input" name="title" required maxlength="140" autofocus placeholder="Ej. Ejercicios de grafos, tema 4"></label>
          <label class="field"><span>Asignatura</span><select class="select" name="subjectId">${subjectOptions(sid)}</select></label>
          <label class="field"><span>Pomodoros estimados</span><input class="input" name="est" type="number" min="1" max="40" value="2" inputmode="numeric"></label>
        </div>`,
      });
      if (value !== 'ok' || !data.title.trim()) return;
      const t = addTask({ title: data.title, subjectId: data.subjectId || null, est: Math.max(1, +data.est || 1) });
      timer.setContext({ taskId: t.id, subjectId: t.subjectId });
    } else {
      const task = taskById(v);
      timer.setContext({ taskId: v || null, ...(task ? { subjectId: task.subjectId } : {}) });
    }
    paintContext();
  },

  async ambient() {
    const s = state.settings;
    const footer = `<label class="field mt"><span>Volumen del ambiente</span><input type="range" name="vol" min="0.05" max="1" step="0.05" value="${s.ambientVolume}" id="ambVol"></label>
      <p class="small muted mt">El ruido marrón es el más suave y suele ir mejor para programar o leer. ${s.ambientAuto ? 'Suena solo durante el enfoque.' : ''}</p>`;
    const v = await pickSheet('Sonido ambiente', Object.entries(AMBIENT).map(([value, label]) => ({ value, label })), s.ambient, { footer });
    const vol = $('#ambVol');
    update((st) => { if (v) st.settings.ambient = v; if (vol) st.settings.ambientVolume = +vol.value; });
    unlockAudio();
    setAmbientVolume();
    const t = state.timer;
    if (state.settings.ambient === 'off') stopAmbient();
    else if (t.status === 'running' && (!state.settings.ambientAuto || t.phase === 'focus')) startAmbient();
    else if (v && v !== 'off') { startAmbient(); setTimeout(() => { if (state.timer.status !== 'running') stopAmbient(); }, 2500); toast('Vista previa: sonará cuando inicies el enfoque'); }
    const pill = $('#ambPill');
    if (pill) { pill.classList.toggle('is-on', state.settings.ambient !== 'off'); pill.querySelector('span').textContent = AMBIENT[state.settings.ambient]; }
  },

  sound() {
    update((st) => { st.settings.sound = !st.settings.sound; });
    const s = state.settings.sound;
    const pill = $('#sndPill');
    pill.classList.toggle('is-on', !s);
    pill.innerHTML = `${icon(s ? 'sound' : 'mute')}<span>${s ? 'Aviso sonoro' : 'Silencio'}</span>`;
  },
};

async function newSubjectSheet() {
  const color = PALETTE[state.subjects.length % PALETTE.length];
  const { value, data } = await sheet({
    title: 'Nueva asignatura',
    body: `<div class="form-stack">
      <label class="field"><span>Nombre</span><input class="input" name="name" required maxlength="60" autofocus placeholder="Ej. Estructuras de Datos"></label>
      <div class="field"><span>Color</span>${swatches('color', color)}</div></div>`,
  });
  if (value !== 'ok' || !data.name?.trim()) return null;
  return addSubject(data.name, data.color || color);
}

function toggleZen(force) {
  const on = force ?? !document.body.classList.contains('zen');
  document.body.classList.toggle('zen', on);
  let btn = $('.zen-exit');
  if (on && !btn) {
    btn = document.createElement('button');
    btn.className = 'icon-btn zen-exit';
    btn.setAttribute('aria-label', 'Salir del modo concentración');
    btn.innerHTML = icon('close');
    btn.onclick = () => toggleZen(false);
    document.body.appendChild(btn);
  } else if (!on) btn?.remove();
  try {
    if (on && matchMedia('(hover: hover)').matches && document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  } catch {}
}
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && document.body.classList.contains('zen')) toggleZen(false); });

return { render, mount, unmount, paint, paintContext, actions, newSubjectSheet, toggleZen };
})();

// ===== views/tasks.js =====
__m["views/tasks.js"] = (() => {
// Vista de tareas: lista con estimación en pomodoros, filtros por estado y asignatura.
const { $, esc, icon, plural } = __m["utils.js"];
const { state, update, addTask, subjectById, taskById } = __m["store.js"];
const { sheet, confirmSheet, toast, subjectOptions, subjectChip, viewHeader, emptyState } = __m["ui.js"];
const timer = __m["timer.js"];
const { go } = __m["router.js"];
const FILTERS = { pending: 'Pendientes', done: 'Hechas', all: 'Todas' };

function visible() {
  const f = state.ui.tasksFilter;
  const sf = state.ui.tasksSubject || '';
  return state.tasks
    .filter((t) => (f === 'all' ? true : f === 'done' ? t.completed : !t.completed))
    .filter((t) => !sf || t.subjectId === sf)
    .sort((a, b) => (a.completed - b.completed) || (a.completed ? b.completedAt - a.completedAt : (a.order ?? 0) - (b.order ?? 0) || b.createdAt - a.createdAt));
}

function tomatoes(t) {
  const n = Math.max(t.est, t.done);
  if (n > 8) return `<span class="tomatoes"><i class="on"></i>${t.done}/${t.est}</span>`;
  return `<span class="tomatoes" title="${t.done} de ${t.est} pomodoros">${Array.from({ length: n }, (_, i) => `<i class="${i < t.done ? 'on' : ''}"></i>`).join('')}</span>`;
}

function render() {
  const pending = state.tasks.filter((t) => !t.completed);
  const left = pending.reduce((a, t) => a + Math.max(0, t.est - t.done), 0);
  const list = visible();
  const cur = state.timer.taskId;
  const sf = state.ui.tasksSubject || '';
  return `<section class="view">
    ${viewHeader('Tareas', pending.length ? `${plural(pending.length, 'pendiente', 'pendientes')} · ${plural(left, 'pomodoro', 'pomodoros')} estimados` : 'Divide el estudio en tareas concretas')}
    <form class="quick-add" data-form="quick">
      <input class="input" name="title" placeholder="Añadir tarea…" maxlength="140" autocomplete="off" enterkeyhint="done" aria-label="Nueva tarea">
      <button class="btn btn--primary" aria-label="Añadir">${icon('plus')}</button>
    </form>
    <div class="toolbar">
      <div class="seg" role="tablist">${Object.entries(FILTERS).map(([k, l]) => `<button data-act="filter" data-f="${k}" class="${state.ui.tasksFilter === k ? 'is-on' : ''}">${l}</button>`).join('')}</div>
      ${state.subjects.length ? `<select class="select" style="width:auto;height:38px;font-size:14px" data-change="subject-filter" aria-label="Filtrar por asignatura">${subjectOptions(sf, { none: 'Todas las asignaturas' })}</select>` : ''}
    </div>
    ${list.length ? `<div class="list">${list.map((t) => `
      <div class="item ${t.completed ? 'is-done' : ''} ${t.id === cur && !t.completed ? 'is-current' : ''}" data-id="${t.id}">
        <button class="check ${t.completed ? 'is-on' : ''}" data-act="check" aria-label="${t.completed ? 'Marcar como pendiente' : 'Completar'}">${icon('check')}</button>
        <button class="item__main" data-act="edit" style="text-align:left">
          <div class="item__title">${esc(t.title)}</div>
          <div class="item__meta">${subjectChip(t.subjectId)}${tomatoes(t)}${t.id === cur && !t.completed ? '<span style="color:var(--focus);font-weight:600">En curso</span>' : ''}</div>
        </button>
        ${t.completed ? '' : `<div class="item__actions"><button class="icon-btn" data-act="focus" title="Estudiar ahora" aria-label="Estudiar ahora">${icon('play')}</button></div>`}
      </div>`).join('')}</div>`
    : emptyState('check', state.ui.tasksFilter === 'done' ? 'Aún no has completado tareas' : 'Nada pendiente', 'Escribe arriba lo próximo que vas a estudiar. Mejor tareas pequeñas: «Ejercicios 1–5 de recursividad» en lugar de «Estudiar Programación».')}
    ${state.tasks.some((t) => t.completed) && state.ui.tasksFilter !== 'pending' ? `<div class="center mt-lg"><button class="btn btn--ghost btn--sm" data-act="clear-done">${icon('trash')} Borrar completadas</button></div>` : ''}
  </section>`;
}

function mount(root) {
  const form = root.querySelector('[data-form="quick"]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = form.title.value.trim();
    if (!title) return;
    addTask({ title, subjectId: state.ui.tasksSubject || state.timer.subjectId || null, est: 1 });
    form.reset();
    if (state.ui.tasksFilter === 'done') update((s) => { s.ui.tasksFilter = 'pending'; });
    refresh(root);
    root.querySelector('[name="title"]').focus();
  });
}

const refresh = (root) => { const y = scrollY; root.innerHTML = render(); mount(root); scrollTo(0, y); };
const idOf = (el) => el.closest('[data-id]')?.dataset.id;

const actions = {
  filter(el, e, root) { update((s) => { s.ui.tasksFilter = el.dataset.f; }); refresh(root); },
  'subject-filter'(el, e, root) { update((s) => { s.ui.tasksSubject = el.value; }); refresh(root); },
  check(el, e, root) {
    const id = idOf(el);
    update((s) => { const t = s.tasks.find((x) => x.id === id); t.completed = !t.completed; t.completedAt = t.completed ? Date.now() : null; });
    const t = taskById(id);
    if (t.completed) {
      if (state.timer.taskId === id) timer.setContext({ taskId: null });
      toast('Tarea completada', { action: 'Deshacer', onAction: () => { update((s) => { const x = s.tasks.find((y) => y.id === id); x.completed = false; x.completedAt = null; }); refresh(root); } });
    }
    refresh(root);
  },
  focus(el) {
    const t = taskById(idOf(el));
    timer.setContext({ taskId: t.id, subjectId: t.subjectId });
    go('enfoque');
    if (state.timer.status !== 'running') { if (state.timer.phase !== 'focus' && state.timer.status === 'idle') timer.setPhase('focus'); }
    toast(`Tarea activa: ${t.title}`);
  },
  async edit(el, e, root) {
    const t = taskById(idOf(el));
    const { value, data } = await sheet({
      title: 'Editar tarea',
      body: `<div class="form-stack">
        <label class="field"><span>Tarea</span><input class="input" name="title" required maxlength="140" value="${esc(t.title)}"></label>
        <label class="field"><span>Asignatura</span><select class="select" name="subjectId">${subjectOptions(t.subjectId)}</select></label>
        <div class="form-row">
          <label class="field"><span>Estimados</span><input class="input" name="est" type="number" min="1" max="40" value="${t.est}" inputmode="numeric"></label>
          <label class="field"><span>Hechos</span><input class="input" name="done" type="number" min="0" max="99" value="${t.done}" inputmode="numeric"></label>
        </div></div>`,
      actions: [{ label: 'Eliminar', value: 'delete', kind: 'danger', novalidate: true }, { label: 'Cancelar', value: 'cancel' }, { label: 'Guardar', value: 'ok', kind: 'primary' }],
    });
    if (value === 'delete') {
      if (!(await confirmSheet('¿Eliminar tarea?', esc(t.title)))) return;
      update((s) => { s.tasks = s.tasks.filter((x) => x.id !== t.id); if (s.timer.taskId === t.id) s.timer.taskId = null; });
    } else if (value === 'ok') {
      update((s) => { const x = s.tasks.find((y) => y.id === t.id); Object.assign(x, { title: data.title.trim() || x.title, subjectId: data.subjectId || null, est: Math.max(1, +data.est || 1), done: Math.max(0, +data.done || 0) }); });
    }
    refresh(root);
  },
  async 'clear-done'(el, e, root) {
    const n = state.tasks.filter((t) => t.completed).length;
    if (!(await confirmSheet('Borrar completadas', `Se eliminarán ${plural(n, 'tarea', 'tareas')}. Tus estadísticas no cambian.`, { ok: 'Borrar' }))) return;
    update((s) => { s.tasks = s.tasks.filter((t) => !t.completed); });
    refresh(root);
  },
};

return { render, mount, actions };
})();

// ===== views/agenda.js =====
__m["views/agenda.js"] = (() => {
// Agenda: exámenes, entregas y prácticas con cuenta atrás y horas estudiadas por asignatura.
const { esc, icon, dayKey, parseDay, daysBetween, relDays, monthShort, weekdayShort, fmtHours, uid } = __m["utils.js"];
const { state, update, subjectById } = __m["store.js"];
const { sheet, confirmSheet, subjectOptions, subjectChip, viewHeader, emptyState } = __m["ui.js"];
const TYPES = ['Examen', 'Parcial', 'Entrega', 'Práctica', 'Exposición', 'Otro'];

const studiedFor = (sid) => state.sessions.filter((s) => s.subjectId === sid).reduce((a, s) => a + s.min, 0);

function urgency(n) {
  if (n < 0) return 'var(--muted)';
  if (n <= 3) return 'var(--danger)';
  if (n <= 7) return 'var(--warn)';
  return 'var(--text-2)';
}

function eventRow(e) {
  const d = parseDay(e.date);
  const n = daysBetween(new Date(), d);
  const subj = subjectById(e.subjectId);
  const hrs = subj ? studiedFor(subj.id) : 0;
  return `<div class="item event" data-id="${e.id}" style="${n < 0 ? 'opacity:.55' : ''}">
    <div class="event__date" style="${subj ? `box-shadow: inset 3px 0 0 ${subj.color}` : ''}"><small>${monthShort(d)}</small><b>${d.getDate()}</b></div>
    <button class="item__main" data-act="edit" style="text-align:left">
      <div class="item__title">${esc(e.title)}</div>
      <div class="item__meta"><span>${esc(e.type)} · ${weekdayShort(d)}${e.time ? ' ' + esc(e.time) : ''}</span>${subjectChip(e.subjectId)}${subj && n >= 0 ? `<span>${fmtHours(hrs)} h estudiadas</span>` : ''}</div>
    </button>
    <span class="countdown" style="color:${urgency(n)}">${relDays(n)}</span>
  </div>`;
}

function render() {
  const today = dayKey();
  const up = state.events.filter((e) => e.date >= today).sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
  const past = state.events.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date));
  const next = up.find((e) => ['Examen', 'Parcial'].includes(e.type)) || up[0];
  const add = `<button class="btn btn--primary btn--sm" data-act="add">${icon('plus')} Añadir</button>`;

  let hero = '';
  if (next) {
    const n = daysBetween(new Date(), parseDay(next.date));
    const subj = subjectById(next.subjectId);
    const week = up.filter((e) => daysBetween(new Date(), parseDay(e.date)) <= 7).length;
    hero = `<div class="card next-up" style="margin-bottom:22px">
      <div class="next-up__n">${n === 0 ? 'Hoy' : n}${n > 0 ? `<small>${n === 1 ? 'día' : 'días'}</small>` : ''}</div>
      <div style="min-width:0">
        <div class="muted small">Próximo ${esc(next.type.toLowerCase())}</div>
        <div style="font-weight:600;font-size:17px;overflow-wrap:anywhere">${esc(next.title)}</div>
        <div class="small muted">${subj ? `${esc(subj.name)} · ${fmtHours(studiedFor(subj.id))} h estudiadas` : ''}${week > 1 ? `${subj ? ' · ' : ''}${week} eventos esta semana` : ''}</div>
      </div></div>`;
  }

  return `<section class="view">
    ${viewHeader('Agenda', 'Exámenes, entregas y prácticas', add)}
    ${hero}
    ${up.length ? `<div class="list">${up.map(eventRow).join('')}</div>`
      : emptyState('calendar', 'Sin fechas próximas', 'Añade tus exámenes y entregas para ver la cuenta atrás y cuántas horas llevas estudiadas de cada asignatura.')}
    ${past.length ? `<h2 class="section-title">Pasados</h2><div class="list">${past.slice(0, 20).map(eventRow).join('')}</div>` : ''}
  </section>`;
}

const refresh = (root) => { const y = scrollY; root.innerHTML = render(); scrollTo(0, y); };

async function editor(e = null) {
  const ev = e || { title: '', type: 'Examen', subjectId: state.timer.subjectId, date: dayKey(new Date(Date.now() + 7 * 86400000)), time: '', notes: '' };
  return sheet({
    title: e ? 'Editar' : 'Nueva fecha',
    body: `<div class="form-stack">
      <label class="field"><span>Título</span><input class="input" name="title" required maxlength="100" value="${esc(ev.title)}" placeholder="Ej. Parcial de Redes" autofocus></label>
      <div class="form-row">
        <label class="field"><span>Tipo</span><select class="select" name="type">${TYPES.map((t) => `<option ${t === ev.type ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
        <label class="field"><span>Asignatura</span><select class="select" name="subjectId">${subjectOptions(ev.subjectId, { none: 'Ninguna' })}</select></label>
      </div>
      <div class="form-row">
        <label class="field"><span>Fecha</span><input class="input" type="date" name="date" required value="${ev.date}"></label>
        <label class="field"><span>Hora</span><input class="input" type="time" name="time" value="${esc(ev.time || '')}"></label>
      </div>
      <label class="field"><span>Notas</span><textarea class="textarea" name="notes" rows="3" placeholder="Temario, aula, material permitido…">${esc(ev.notes || '')}</textarea></label>
    </div>`,
    actions: e
      ? [{ label: 'Eliminar', value: 'delete', kind: 'danger', novalidate: true }, { label: 'Cancelar', value: 'cancel' }, { label: 'Guardar', value: 'ok', kind: 'primary' }]
      : undefined,
  });
}

const clean = (d) => ({ title: d.title.trim(), type: d.type, subjectId: d.subjectId || null, date: d.date, time: d.time || '', notes: d.notes || '' });

const actions = {
  async add(el, e, root) {
    const { value, data } = await editor();
    if (value !== 'ok' || !data.title.trim() || !data.date) return;
    update((s) => s.events.push({ id: uid(), ...clean(data) }));
    refresh(root);
  },
  async edit(el, e, root) {
    const ev = state.events.find((x) => x.id === el.closest('[data-id]').dataset.id);
    const { value, data } = await editor(ev);
    if (value === 'delete') {
      if (!(await confirmSheet('¿Eliminar?', esc(ev.title)))) return;
      update((s) => { s.events = s.events.filter((x) => x.id !== ev.id); });
    } else if (value === 'ok' && data.title.trim() && data.date) {
      update((s) => Object.assign(s.events.find((x) => x.id === ev.id), clean(data)));
    }
    refresh(root);
  },
};

return { render, actions };
})();

// ===== views/stats.js =====
__m["views/stats.js"] = (() => {
// Progreso: resumen del día, últimos 7 días, mapa de actividad y reparto por asignatura.
const { esc, icon, dayKey, addDays, startOfDay, weekdayLetter, fmtMinutes, fmtHours, fmtTime, fmtDate, uid, monthShort } = __m["utils.js"];
const { state, update, minutesByDay, sessionsOn, streak, bestStreak, subjectById, taskById } = __m["store.js"];
const { sheet, confirmSheet, subjectOptions, viewHeader, emptyState } = __m["ui.js"];
const WEEKS = 26;

function render() {
  const byDay = minutesByDay();
  const todayKey = dayKey();
  const todaySessions = sessionsOn(todayKey);
  const todayMin = byDay.get(todayKey) || 0;
  const todayPoms = todaySessions.filter((s) => !s.partial && !s.manual).length;
  const goal = state.settings.dailyGoal;

  // Últimos 7 días
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(), i - 6));
  const vals = days.map((d) => byDay.get(dayKey(d)) || 0);
  const weekMin = vals.reduce((a, b) => a + b, 0);
  const max = Math.max(60, ...vals);

  // Mapa de calor: columnas = semanas (lunes a domingo)
  const today = startOfDay();
  const offset = (today.getDay() + 6) % 7; // 0 = lunes
  const first = addDays(today, -offset - (WEEKS - 1) * 7);
  const cells = [];
  for (let i = 0; i < WEEKS * 7; i++) {
    const d = addDays(first, i);
    const m = byDay.get(dayKey(d)) || 0;
    const l = m === 0 ? 0 : m < 30 ? 1 : m < 90 ? 2 : m < 180 ? 3 : 4;
    cells.push(`<i data-l="${l}" class="${d > today ? 'is-future' : ''}" title="${fmtDate(d)}: ${fmtMinutes(m)}"></i>`);
  }
  const activeDays = [...byDay.keys()].length;
  const totalMin = state.sessions.reduce((a, s) => a + s.min, 0);

  // Reparto por asignatura (30 días)
  const since = addDays(today, -29).getTime();
  const per = new Map();
  for (const s of state.sessions) if (s.start >= since) per.set(s.subjectId || '', (per.get(s.subjectId || '') || 0) + s.min);
  const perTotal = [...per.values()].reduce((a, b) => a + b, 0);
  const share = [...per.entries()].sort((a, b) => b[1] - a[1]).map(([id, m]) => {
    const s = subjectById(id);
    const c = s?.color || 'var(--muted)';
    return `<div class="share__row"><span>${esc(s?.name || 'Sin asignatura')}</span><span>${fmtMinutes(m)}</span>
      <div class="share__bar"><i style="width:${(m / perTotal) * 100}%;background:${c}"></i></div></div>`;
  }).join('');

  const add = `<button class="btn btn--sm" data-act="add-session">${icon('plus')} Sesión</button>`;

  return `<section class="view">
    ${viewHeader('Progreso', totalMin ? `${fmtHours(totalMin)} h en total · ${activeDays} ${activeDays === 1 ? 'día' : 'días'} de estudio` : 'Tus estadísticas aparecerán aquí', add)}
    <div class="grid grid-4">
      <div class="stat"><div class="stat__k">Hoy</div><div class="stat__v">${fmtHours(todayMin)}<small>h</small></div></div>
      <div class="stat"><div class="stat__k">Pomodoros</div><div class="stat__v">${todayPoms}<small>/ ${goal}</small></div></div>
      <div class="stat"><div class="stat__k">Racha</div><div class="stat__v">${streak()}<small>${streak() === 1 ? 'día' : 'días'}</small></div></div>
      <div class="stat"><div class="stat__k">7 días</div><div class="stat__v">${fmtHours(weekMin)}<small>h</small></div></div>
    </div>

    <div class="card mt">
      <div class="spread"><b>Últimos 7 días</b><span class="small muted">Media ${fmtMinutes(weekMin / 7)}/día</span></div>
      <div class="bars">${days.map((d, i) => `<div class="bars__col"><div class="bars__track"><div class="bars__bar ${i === 6 ? 'is-today' : ''}" style="height:${(vals[i] / max) * 100}%">${vals[i] ? `<span>${vals[i] >= 60 ? fmtHours(vals[i]) + 'h' : vals[i] + "'"}</span>` : ''}</div></div><div class="bars__lbl">${weekdayLetter(d)}</div></div>`).join('')}</div>
    </div>

    <div class="card mt">
      <div class="spread" style="margin-bottom:14px"><b>Constancia</b><span class="small muted">Mejor racha: ${bestStreak()} días</span></div>
      <div class="heat" aria-label="Mapa de actividad de los últimos 6 meses">${cells.join('')}</div>
      <div class="heat-legend"><span>${monthShort(first)}</span><span style="flex:1"></span>Menos <i style="background:var(--surface-2)"></i><i style="background:color-mix(in srgb,var(--focus) 25%,var(--surface-2))"></i><i style="background:color-mix(in srgb,var(--focus) 50%,var(--surface-2))"></i><i style="background:color-mix(in srgb,var(--focus) 75%,var(--surface-2))"></i><i style="background:var(--focus)"></i> Más</div>
    </div>

    <h2 class="section-title">Por asignatura · 30 días</h2>
    <div class="card">${share ? `<div class="share">${share}</div>` : '<p class="muted small">Aún no hay sesiones en los últimos 30 días.</p>'}</div>

    <h2 class="section-title">Sesiones de hoy</h2>
    ${todaySessions.length ? `<div class="list">${todaySessions.slice().reverse().map((s) => {
      const subj = subjectById(s.subjectId); const t = taskById(s.taskId);
      return `<div class="item" data-id="${s.id}">
        <span class="picker__dot" style="background:${subj?.color || 'var(--line-strong)'}"></span>
        <div class="item__main"><div class="item__title">${esc(t?.title || subj?.name || 'Enfoque')}</div>
        <div class="item__meta"><span>${fmtTime(new Date(s.start))}–${fmtTime(new Date(s.end))}</span><span>${fmtMinutes(s.min)}</span>${s.partial ? '<span>parcial</span>' : ''}${s.manual ? '<span>manual</span>' : ''}</div></div>
        <button class="icon-btn" data-act="del-session" aria-label="Eliminar sesión">${icon('trash')}</button></div>`;
    }).join('')}</div>` : emptyState('target', 'Hoy todavía no hay sesiones', 'Completa un enfoque o añade una sesión manual si has estudiado sin el temporizador.')}
  </section>`;
}

const refresh = (root) => { const y = scrollY; root.innerHTML = render(); scrollTo(0, y); };

const actions = {
  async 'del-session'(el, e, root) {
    const id = el.closest('[data-id]').dataset.id;
    if (!(await confirmSheet('¿Eliminar sesión?', 'Se restará de tus estadísticas.'))) return;
    update((s) => {
      const ses = s.sessions.find((x) => x.id === id);
      const t = ses && !ses.partial && s.tasks.find((x) => x.id === ses.taskId);
      if (t && t.done > 0) t.done -= 1;
      s.sessions = s.sessions.filter((x) => x.id !== id);
    });
    refresh(root);
  },
  async 'add-session'(el, e, root) {
    const now = new Date();
    const { value, data } = await sheet({
      title: 'Añadir sesión',
      text: 'Para el tiempo que estudiaste sin el temporizador (biblioteca, clase de prácticas…).',
      body: `<div class="form-stack">
        <div class="form-row">
          <label class="field"><span>Fecha</span><input class="input" type="date" name="date" value="${dayKey(now)}" max="${dayKey(now)}" required></label>
          <label class="field"><span>Inicio</span><input class="input" type="time" name="time" value="${fmtTime(new Date(now - 3600000))}" required></label>
        </div>
        <label class="field"><span>Minutos</span><input class="input" type="number" name="min" min="1" max="600" value="${state.settings.focus}" inputmode="numeric" required></label>
        <label class="field"><span>Asignatura</span><select class="select" name="subjectId">${subjectOptions(state.timer.subjectId)}</select></label>
      </div>`,
    });
    if (value !== 'ok') return;
    const start = new Date(`${data.date}T${data.time}`).getTime();
    const min = Math.max(1, Math.min(600, +data.min || 0));
    if (!Number.isFinite(start)) return;
    update((s) => s.sessions.push({ id: uid(), start, end: start + min * 60000, min, subjectId: data.subjectId || null, taskId: null, manual: true }));
    refresh(root);
  },
};

return { render, actions };
})();

// ===== views/more.js =====
__m["views/more.js"] = (() => {
// "Más": asignaturas, notas, herramientas (conversor de bases, calculadora de notas), ajustes y ayuda.
const { $, $$, esc, icon, uid, fmtHours, debounce, download, isIOS, isStandalone, dayKey, clamp, PALETTE } = __m["utils.js"];
const { state, update, exportData, importData, resetAll, DEFAULT_SETTINGS } = __m["store.js"];
const { sheet, confirmSheet, toast, subjectOptions, swatches, stepper, toggle, viewHeader, emptyState } = __m["ui.js"];
const { requestNotifications, notifPermission, notifSupported, ntfyTest, randomTopic, ntfyCancel } = __m["notify.js"];
const { chime, unlockAudio, setAmbientVolume } = __m["sound.js"];
const { go } = __m["router.js"];
const { newSubjectSheet } = __m["views/focus.js"];
const APP_VERSION = '1.0.1';
const back = (to = '') => `<a class="back" href="#/mas${to ? '/' + to : ''}">${icon('chevL')} Más</a>`;

// =====================================================================
// Hub
// =====================================================================
const TILES = [
  ['asignaturas', 'Asignaturas', 'Colores y horas', 'book', '#E0912F'],
  ['notas', 'Apuntes', 'Notas rápidas y código', 'note', '#2A9DB0'],
  ['bases', 'Conversor', 'Bin · Oct · Dec · Hex', 'binary', '#8A5CF0'],
  ['calificaciones', 'Calificaciones', '¿Qué nota necesito?', 'grade', '#2F9C72'],
  ['ajustes', 'Ajustes', 'Tiempos y avisos', 'gear', '#7A7A80'],
  ['instalar', 'Instalar', 'iPhone, iPad y PC', 'phone', '#4C66E6'],
];

function hub() {
  return `<section class="view">
    ${viewHeader('Más')}
    <div class="tiles">${TILES.map(([k, t, s, ic, c]) => `
      <a class="tile" href="#/mas/${k}"><span class="row__icon" style="background:${c}">${icon(ic)}</span><span><b>${t}</b><small>${s}</small></span></a>`).join('')}
    </div>
    <div class="rows mt-lg">
      <a class="row row--link" href="#/mas/atajos"><span class="row__icon" style="background:#5E5E63">${icon('keyboard')}</span><span class="row__main"><span class="row__title">Atajos de teclado</span></span>${icon('chevR', 'row__chev')}</a>
      <a class="row row--link" href="#/mas/acerca"><span class="row__icon" style="background:#E5532F">${icon('info')}</span><span class="row__main"><span class="row__title">Acerca de Ciclo</span></span><span class="row__end">v${APP_VERSION}</span></a>
    </div>
  </section>`;
}

// =====================================================================
// Asignaturas
// =====================================================================
const SUGGESTED = ['Programación', 'Estructuras de Datos', 'Algoritmia', 'Matemática Discreta', 'Cálculo', 'Álgebra Lineal', 'Estadística', 'Bases de Datos', 'Sistemas Operativos', 'Redes de Computadores', 'Arquitectura de Computadores', 'Ingeniería del Software', 'Inteligencia Artificial', 'Compiladores', 'Seguridad Informática'];

function subjects() {
  const mins = new Map();
  for (const s of state.sessions) if (s.subjectId) mins.set(s.subjectId, (mins.get(s.subjectId) || 0) + s.min);
  const existing = new Set(state.subjects.map((s) => s.name.toLowerCase()));
  const sugg = SUGGESTED.filter((n) => !existing.has(n.toLowerCase()));
  return `<section class="view">
    ${back()}
    ${viewHeader('Asignaturas', 'Asocia tus sesiones para saber a qué dedicas el tiempo', `<button class="btn btn--primary btn--sm" data-act="subj-add">${icon('plus')} Nueva</button>`)}
    ${state.subjects.length ? `<div class="list">${state.subjects.map((s) => `
      <div class="item" data-id="${s.id}">
        <span class="row__icon" style="background:${s.color};width:12px;height:36px;border-radius:6px"></span>
        <button class="item__main" data-act="subj-edit" style="text-align:left"><div class="item__title">${esc(s.name)}</div>
        <div class="item__meta"><span>${fmtHours(mins.get(s.id) || 0)} h estudiadas</span><span>${state.tasks.filter((t) => t.subjectId === s.id && !t.completed).length} tareas pendientes</span></div></button>
        <button class="icon-btn" data-act="subj-edit" aria-label="Editar">${icon('edit')}</button>
      </div>`).join('')}</div>` : emptyState('book', 'Sin asignaturas', 'Crea las de este cuatrimestre o elige entre las sugerencias.')}
    ${sugg.length ? `<h2 class="section-title">Sugerencias</h2><div style="display:flex;flex-wrap:wrap;gap:8px">${sugg.map((n) => `<button class="chip" style="height:32px;padding:0 12px" data-act="subj-suggest" data-name="${esc(n)}">${icon('plus', 'row__chev')}${esc(n)}</button>`).join('')}</div>` : ''}
  </section>`;
}

// =====================================================================
// Apuntes
// =====================================================================
let activeNote = null;
let noteQuery = '';

function notes() {
  const q = noteQuery.toLowerCase();
  const list = state.notes.filter((n) => !q || (n.title + ' ' + n.body).toLowerCase().includes(q)).sort((a, b) => b.updatedAt - a.updatedAt);
  const cur = state.notes.find((n) => n.id === activeNote);
  const wide = matchMedia('(min-width: 900px)').matches;
  const editor = cur ? `<div class="card note-editor" data-note="${cur.id}">
      <div class="spread" style="margin-bottom:6px">
        <select class="select" style="width:auto;height:34px;font-size:13.5px" data-note-field="subjectId" aria-label="Asignatura">${subjectOptions(cur.subjectId)}</select>
        <div style="display:flex;gap:4px">
          <button class="btn btn--sm ${cur.mono ? 'btn--primary' : ''}" data-act="note-mono" title="Fuente monoespaciada para código">&lt;/&gt;</button>
          <button class="icon-btn" data-act="note-del" aria-label="Eliminar apunte">${icon('trash')}</button>
        </div>
      </div>
      <input class="input" data-note-field="title" value="${esc(cur.title)}" placeholder="Título" maxlength="120">
      <textarea class="textarea ${cur.mono ? 'mono' : ''}" data-note-field="body" placeholder="Escribe aquí… dudas para tutoría, fórmulas, comandos, fragmentos de código." spellcheck="${!cur.mono}">${esc(cur.body)}</textarea>
      <div class="small muted" data-saved>Se guarda automáticamente</div>
    </div>` : '';
  const listHtml = `<div class="card card--flush" style="padding:8px">
      <input class="input" type="search" placeholder="Buscar en apuntes" value="${esc(noteQuery)}" data-note-search style="margin-bottom:6px">
      ${list.length ? list.map((n) => `<button class="note-item ${n.id === activeNote ? 'is-on' : ''}" data-act="note-open" data-id="${n.id}"><b>${esc(n.title || 'Sin título')}</b><small>${esc((n.body || '').slice(0, 80) || '—')}</small></button>`).join('') : `<p class="small muted" style="padding:10px">${q ? 'Sin resultados' : 'Aún no hay apuntes'}</p>`}
    </div>`;
  const showList = wide || !cur;
  return `<section class="view">
    ${cur && !wide ? `<button class="back" data-act="note-close">${icon('chevL')} Apuntes</button>` : back()}
    ${viewHeader('Apuntes', '', `<button class="btn btn--primary btn--sm" data-act="note-new">${icon('plus')} Nuevo</button>`)}
    <div class="notes ${wide ? 'notes--split' : ''}">${showList ? listHtml : ''}${editor || (wide ? emptyState('note', 'Elige o crea un apunte', 'Ideal para dudas que llevar a tutoría, fórmulas o comandos que siempre olvidas.') : '')}</div>
  </section>`;
}

const markSaved = debounce(() => { const el = $('[data-saved]'); if (el) el.textContent = 'Guardado'; }, 500);
function saveNote(id, field, value) {
  // El estado se actualiza al momento (el guardado en disco ya va agrupado en store.save).
  update((s) => { const n = s.notes.find((x) => x.id === id); if (n) { n[field] = value; n.updatedAt = Date.now(); } }, { silent: true });
  markSaved();
}

// =====================================================================
// Conversor de bases
// =====================================================================
let base = { input: '', from: 10, bits: 8 };

function parseBig(str, radix) {
  let s = str.trim().toLowerCase().replace(/[\s_]/g, '');
  if (!s) return null;
  let neg = false;
  if (s.startsWith('-')) { neg = true; s = s.slice(1); }
  const pref = { '0x': 16, '0b': 2, '0o': 8 };
  if (pref[s.slice(0, 2)]) { radix = pref[s.slice(0, 2)]; s = s.slice(2); }
  const digits = '0123456789abcdef'.slice(0, radix);
  if (!s || [...s].some((c) => !digits.includes(c))) return undefined;
  let v = 0n;
  for (const c of s) v = v * BigInt(radix) + BigInt(digits.indexOf(c));
  return neg ? -v : v;
}
const group = (s, n) => s.replace(new RegExp(`\\B(?=(.{${n}})+(?!.))`, 'g'), ' ');

function baseResults() {
  const v = parseBig(base.input, base.from);
  if (v === null) return '<p class="small muted" style="padding:14px 16px">Escribe un número. Admite prefijos 0x, 0b, 0o y negativos.</p>';
  if (v === undefined) return `<p class="small" style="padding:14px 16px;color:var(--danger)">No es un número válido en base ${base.from}.</p>`;
  const neg = v < 0n, abs = neg ? -v : v, sg = neg ? '-' : '';
  const n = BigInt(base.bits);
  const fits = v >= -(1n << (n - 1n)) && v < (1n << n);
  let comp = '';
  if (fits) {
    const u = neg ? (1n << n) + v : v;
    const signed = u >= (1n << (n - 1n)) ? u - (1n << n) : u;
    comp = `
      <div class="row"><span class="row__title">C2 ${base.bits}b</span><code>${group(u.toString(2).padStart(base.bits, '0'), 4)}</code></div>
      <div class="row"><span class="row__title">Hex ${base.bits}b</span><code>0x${u.toString(16).toUpperCase().padStart(base.bits / 4, '0')}</code></div>
      <div class="row"><span class="row__title">Signo</span><code>${signed} <span class="muted">con signo</span> · ${u} <span class="muted">sin signo</span></code></div>`;
  } else {
    comp = `<div class="row"><span class="row__title">C2</span><span class="small muted">No cabe en ${base.bits} bits</span></div>`;
  }
  const ascii = !neg && abs >= 32n && abs <= 126n ? `<div class="row"><span class="row__title">ASCII</span><code>'${esc(String.fromCharCode(Number(abs)))}'</code></div>` : '';
  return `
    <div class="row"><span class="row__title">DEC</span><code>${sg}${group(abs.toString(10), 3).replace(/ /g, '.')}</code></div>
    <div class="row"><span class="row__title">BIN</span><code>${sg}${group(abs.toString(2), 4)}</code></div>
    <div class="row"><span class="row__title">OCT</span><code>${sg}${abs.toString(8)}</code></div>
    <div class="row"><span class="row__title">HEX</span><code>${sg}${abs.toString(16).toUpperCase()}</code></div>
    ${comp}${ascii}`;
}

function bases() {
  return `<section class="view">
    ${back()}
    ${viewHeader('Conversor de bases', 'Binario, octal, decimal, hexadecimal y complemento a 2')}
    <div class="card form-stack">
      <input class="input mono" data-base-input value="${esc(base.input)}" placeholder="Ej. 255, -42, 0xFF, 1011" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="text" aria-label="Número">
      <div class="spread" style="flex-wrap:wrap">
        <div class="seg">${[[2, 'BIN'], [8, 'OCT'], [10, 'DEC'], [16, 'HEX']].map(([b, l]) => `<button type="button" data-act="base-from" data-b="${b}" class="${base.from === b ? 'is-on' : ''}">${l}</button>`).join('')}</div>
        <div class="seg">${[8, 16, 32, 64].map((b) => `<button type="button" data-act="base-bits" data-b="${b}" class="${base.bits === b ? 'is-on' : ''}">${b}b</button>`).join('')}</div>
      </div>
    </div>
    <div class="rows base-out mt" id="baseOut">${baseResults()}</div>
  </section>`;
}

// =====================================================================
// Calculadora de calificaciones
// =====================================================================
function gradeCalc() {
  const g = state.grades;
  let doneW = 0, pendW = 0, acc = 0;
  for (const it of g.items) {
    const w = +it.weight || 0;
    if (it.grade === '' || it.grade == null) pendW += w; else { doneW += w; acc += (w * clamp(+it.grade, 0, 10)) / 100; }
  }
  const sumW = doneW + pendW;
  const needed = pendW > 0 ? ((g.target - acc) / (pendW / 100)) : null;
  const avgDone = doneW ? (acc / (doneW / 100)) : null;
  const f = (n) => (Math.round(n * 100) / 100).toLocaleString('es-ES');
  let verdict = '';
  if (!g.items.length) verdict = '<p class="small muted">Añade las partes de la evaluación (examen final, prácticas, parciales…) con su peso.</p>';
  else if (needed === null) verdict = `<div class="result-big" style="color:${acc >= g.target ? 'var(--short)' : 'var(--danger)'}">${f(acc)}</div><p class="small muted">Nota final${acc >= g.target ? ' · ¡aprobado!' : ''}</p>`;
  else if (needed <= 0) verdict = `<div class="result-big" style="color:var(--short)">0</div><p class="small muted">Ya tienes asegurado el ${f(g.target)} aunque saques un 0 en lo pendiente.</p>`;
  else if (needed > 10) verdict = `<div class="result-big" style="color:var(--danger)">${f(needed)}</div><p class="small muted">Necesitarías más de un 10 de media en lo pendiente (${f(pendW)} %): no es alcanzable con estos pesos.</p>`;
  else verdict = `<div class="result-big" style="color:${needed > 7 ? 'var(--warn)' : 'var(--text)'}">${f(needed)}</div><p class="small muted">Nota media que necesitas en lo pendiente (${f(pendW)} % de la nota) para llegar al ${f(g.target)}.</p>`;

  return `
    <div class="card">${verdict}
      ${g.items.length ? `<div class="small muted mt">Acumulado: <b style="color:var(--text)">${f(acc)}</b> de ${f(doneW / 10)} posibles${avgDone !== null ? ` · media en lo evaluado ${f(avgDone)}` : ''}${Math.abs(sumW - 100) > 0.01 ? ` · <span style="color:var(--warn)">los pesos suman ${f(sumW)} %</span>` : ''}</div>` : ''}
    </div>`;
}

function grades() {
  const g = state.grades;
  return `<section class="view">
    ${back()}
    ${viewHeader('Calificaciones', 'Calcula qué nota necesitas para aprobar')}
    <div class="card form-stack">
      <div class="spread"><span class="small" style="font-weight:500;color:var(--text-2)">Nota objetivo</span><input class="input" style="width:90px;text-align:center" type="number" min="0" max="10" step="0.1" inputmode="decimal" data-grade-target value="${g.target}"></div>
      <div class="grade-row grade-head"><span>Parte</span><span>Peso %</span><span>Nota</span><span></span></div>
      <div class="form-stack" style="gap:8px">${g.items.map((it) => `
        <div class="grade-row" data-id="${it.id}">
          <input class="input" data-g="name" value="${esc(it.name)}" placeholder="Ej. Examen final" aria-label="Parte">
          <input class="input" data-g="weight" type="number" min="0" max="100" step="any" inputmode="decimal" value="${esc(it.weight)}" aria-label="Peso">
          <input class="input" data-g="grade" type="number" min="0" max="10" step="any" inputmode="decimal" value="${esc(it.grade ?? '')}" placeholder="—" aria-label="Nota">
          <button class="icon-btn" data-act="grade-del" aria-label="Quitar">${icon('close')}</button>
        </div>`).join('')}</div>
      <div class="spread"><button class="btn btn--sm" data-act="grade-add">${icon('plus')} Añadir parte</button>${g.items.length ? '<button class="btn btn--ghost btn--sm" data-act="grade-clear">Vaciar</button>' : ''}</div>
      <p class="small muted">Deja la nota vacía en las partes que aún no tienes.</p>
    </div>
    <div class="mt" id="gradeOut">${gradeCalc()}</div>
  </section>`;
}

// =====================================================================
// Ajustes
// =====================================================================
const LIMITS = { focus: [1, 180], short: [1, 60], long: [1, 90], longEvery: [2, 10], dailyGoal: [1, 24] };
const PRESETS = [['Clásico', 25, 5, 15], ['Profundo', 50, 10, 30], ['Ultradiano', 90, 20, 30]];

function settingsView() {
  const s = state.settings;
  const perm = notifPermission();
  const permText = { granted: 'Activadas', denied: 'Bloqueadas en el sistema', default: 'Sin activar', unsupported: isIOS() && !isStandalone() ? 'Instala la app primero' : 'No disponibles' }[perm];
  const row = (title, sub, end) => `<div class="row"><div class="row__main"><div class="row__title">${title}</div>${sub ? `<div class="row__sub">${sub}</div>` : ''}</div><div class="row__end">${end}</div></div>`;
  return `<section class="view">
    ${back()}
    ${viewHeader('Ajustes')}

    <h2 class="section-title">Temporizador</h2>
    <div class="seg" style="margin-bottom:10px">${PRESETS.map(([n, f, sh, l]) => `<button type="button" data-act="preset" data-v="${f},${sh},${l}" class="${s.focus === f && s.short === sh && s.long === l ? 'is-on' : ''}">${n} ${f}/${sh}</button>`).join('')}</div>
    <div class="rows">
      ${row('Enfoque', '', stepper('focus', s.focus, ' min'))}
      ${row('Descanso corto', '', stepper('short', s.short, ' min'))}
      ${row('Descanso largo', '', stepper('long', s.long, ' min'))}
      ${row('Descanso largo cada', 'Sesiones de enfoque por ciclo', stepper('longEvery', s.longEvery))}
      ${row('Iniciar descansos solo', '', toggle('autoStartBreaks', s.autoStartBreaks, 'Iniciar descansos automáticamente'))}
      ${row('Iniciar enfoque solo', 'Tras cada descanso', toggle('autoStartFocus', s.autoStartFocus, 'Iniciar enfoque automáticamente'))}
      ${row('Objetivo diario', 'Pomodoros al día', stepper('dailyGoal', s.dailyGoal))}
    </div>

    <h2 class="section-title">Avisos</h2>
    <div class="rows">
      ${row('Notificaciones', permText, perm === 'granted' ? toggle('notifications', s.notifications, 'Notificaciones') : `<button class="btn btn--sm btn--accent" data-act="notif-enable" ${perm === 'denied' || perm === 'unsupported' ? 'disabled style="opacity:.5"' : ''}>Activar</button>`)}
      ${row('Sonido', '', `<button class="btn btn--sm btn--ghost" data-act="test-sound">Probar</button>${toggle('sound', s.sound, 'Sonido')}`)}
      <div class="row"><div class="row__main"><div class="row__title">Volumen</div><input type="range" min="0.05" max="1" step="0.05" value="${s.volume}" data-range="volume" style="width:100%;margin-top:8px" aria-label="Volumen"></div></div>
      ${row('Vibración', 'Android', toggle('vibrate', s.vibrate, 'Vibración'))}
    </div>
    ${isIOS() && !isStandalone() ? `<div class="callout mt">${icon('info')}<div>En iPhone y iPad las notificaciones solo funcionan con Ciclo <b>añadida a la pantalla de inicio</b>. <a href="#/mas/instalar" style="color:var(--phase);font-weight:600">Cómo instalarla</a></div></div>` : ''}

    <h2 class="section-title">Aviso con el móvil bloqueado (ntfy)</h2>
    <div class="rows">
      ${row('Usar ntfy', 'Push gratuito que llega aunque Ciclo esté cerrada', toggle('ntfyEnabled', s.ntfyEnabled, 'Usar ntfy'))}
      <div class="row" ${s.ntfyEnabled ? '' : 'hidden'}><div class="row__main form-stack" style="gap:8px;padding:4px 0">
        <label class="field"><span>Tema (canal privado)</span><input class="input mono" data-text="ntfyTopic" value="${esc(s.ntfyTopic)}" placeholder="ciclo-xxxxxxxx" autocapitalize="off" autocomplete="off" spellcheck="false"></label>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn--sm" data-act="ntfy-gen">Generar tema</button><button class="btn btn--sm" data-act="ntfy-copy">Copiar</button><button class="btn btn--sm btn--accent" data-act="ntfy-test">Enviar prueba</button></div>
      </div></div>
    </div>
    <p class="small muted mt" style="padding:0 4px">${s.ntfyEnabled ? `1) Instala la app gratuita <b>ntfy</b> en el iPhone/iPad. 2) Suscríbete al mismo tema. 3) Pulsa «Enviar prueba». Al iniciar un temporizador, Ciclo programa el aviso en el servidor de ntfy y lo cancela si pausas o reinicias. Usa un tema difícil de adivinar: cualquiera que lo conozca puede leerlo.` : 'iOS congela las apps web en segundo plano. Activa ntfy si quieres el aviso aunque tengas el móvil bloqueado.'}</p>

    <h2 class="section-title">Pantalla y sonido ambiente</h2>
    <div class="rows">
      ${row('Mantener pantalla encendida', 'Mientras el temporizador está en marcha', toggle('wakeLock', s.wakeLock, 'Mantener pantalla encendida'))}
      ${row('Tiempo en la pestaña', 'Muestra la cuenta atrás en el título', toggle('titleTimer', s.titleTimer, 'Tiempo en la pestaña'))}
      ${row('Ambiente solo en enfoque', 'Silencio durante los descansos', toggle('ambientAuto', s.ambientAuto, 'Ambiente solo en enfoque'))}
      ${row('Tema', '', `<div class="seg">${[['auto', 'Auto'], ['light', 'Claro'], ['dark', 'Oscuro']].map(([v, l]) => `<button type="button" data-act="theme" data-v="${v}" class="${s.theme === v ? 'is-on' : ''}">${l}</button>`).join('')}</div>`)}
    </div>

    <h2 class="section-title">Datos</h2>
    <div class="rows">
      <button class="row row--link" data-act="export"><span class="row__icon" style="background:var(--short)">${icon('download')}</span><span class="row__main"><span class="row__title">Exportar copia de seguridad</span><span class="row__sub">Archivo .json con todo tu progreso</span></span></button>
      <button class="row row--link" data-act="import"><span class="row__icon" style="background:var(--long)">${icon('upload')}</span><span class="row__main"><span class="row__title">Importar copia</span><span class="row__sub">Pasa tus datos del iPhone al PC y viceversa</span></span></button>
      <button class="row row--link" data-act="wipe"><span class="row__icon" style="background:var(--danger)">${icon('trash')}</span><span class="row__main"><span class="row__title" style="color:var(--danger)">Borrar todos los datos</span></span></button>
    </div>
    <p class="small muted mt center">Tus datos se guardan solo en este dispositivo. Exporta una copia de vez en cuando.</p>
    <input type="file" accept="application/json,.json" id="importFile" hidden>
  </section>`;
}

// =====================================================================
// Instalar / atajos / acerca
// =====================================================================
let deferredPrompt = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });

function install() {
  const step = (n, t) => `<div class="row"><span class="row__icon" style="background:var(--surface-2);color:var(--text);font-weight:700">${n}</span><div class="row__main">${t}</div></div>`;
  return `<section class="view">
    ${back()}
    ${viewHeader('Instalar Ciclo', isStandalone() ? 'Ya estás usando la app instalada ✓' : 'Úsala como una app nativa, sin conexión')}
    ${deferredPrompt ? `<button class="btn btn--accent btn--block" data-act="install" style="margin-bottom:18px">${icon('download')} Instalar en este dispositivo</button>` : ''}
    <h2 class="section-title">iPhone y iPad (Safari)</h2>
    <div class="rows">
      ${step(1, 'Abre la web de Ciclo en <b>Safari</b>.')}
      ${step(2, 'Pulsa <b>Compartir</b> (el cuadrado con la flecha hacia arriba).')}
      ${step(3, 'Elige <b>Añadir a pantalla de inicio</b> y confirma con <b>Añadir</b>.')}
      ${step(4, 'Abre Ciclo desde el icono y activa las notificaciones en <a href="#/mas/ajustes" style="color:var(--phase);font-weight:600">Ajustes</a>.')}
    </div>
    <h2 class="section-title">PC y Mac (Chrome o Edge)</h2>
    <div class="rows">
      ${step(1, 'Abre la web de Ciclo.')}
      ${step(2, 'Pulsa el icono de <b>instalar</b> en la barra de direcciones (o menú ⋮ → <b>Instalar Ciclo</b>).')}
      ${step(3, 'Ciclo se abrirá en su propia ventana y aparecerá en el menú Inicio o el Dock.')}
    </div>
    <h2 class="section-title">Mac con Safari</h2>
    <div class="rows">${step(1, 'Menú <b>Archivo → Añadir al Dock</b>.')}</div>
    <div class="callout mt-lg">${icon('info')}<div>Cada dispositivo guarda sus propios datos. Para pasar tu progreso de uno a otro usa <b>Exportar</b> e <b>Importar</b> en Ajustes.</div></div>
  </section>`;
}

function shortcuts() {
  const k = (keys, d) => `<div><span>${d}</span><span>${keys.map((x) => `<span class="kbd">${x}</span>`).join(' ')}</span></div>`;
  return `<section class="view">
    ${back()}
    ${viewHeader('Atajos de teclado', 'En PC, Mac o iPad con teclado')}
    <div class="card kbd-list">
      ${k(['Espacio'], 'Iniciar / pausar')}
      ${k(['R'], 'Reiniciar fase')}
      ${k(['S'], 'Saltar a la siguiente fase')}
      ${k(['F'], 'Modo concentración')}
      ${k(['N'], 'Nueva tarea')}
      ${k(['1'], 'Enfoque')}${k(['2'], 'Tareas')}${k(['3'], 'Agenda')}${k(['4'], 'Progreso')}${k(['5'], 'Más')}
      ${k(['Esc'], 'Salir del modo concentración')}
    </div>
  </section>`;
}

function about() {
  return `<section class="view">
    ${back()}
    <div class="center" style="padding:20px 0 8px">
      <img src="icons/icon.svg" width="96" height="96" alt="" style="margin:0 auto 16px;border-radius:22px;box-shadow:var(--shadow)">
      <h1 style="font-size:28px;letter-spacing:-.02em">Ciclo</h1>
      <p class="muted">Versión ${APP_VERSION}</p>
    </div>
    <div class="card"><p style="color:var(--text-2)">Ciclo alterna bloques de concentración con descansos (técnica Pomodoro) y te ayuda a organizar tareas, exámenes y apuntes de la carrera. Funciona sin conexión, no tiene anuncios ni cuentas, y tus datos nunca salen de tu dispositivo (salvo el aviso de ntfy si lo activas).</p></div>
    <h2 class="section-title">Cómo sacarle partido</h2>
    <div class="card" style="color:var(--text-2);display:grid;gap:10px">
      <p><b style="color:var(--text)">Una tarea por enfoque.</b> Antes de empezar, elige qué vas a hacer exactamente.</p>
      <p><b style="color:var(--text)">Los descansos son parte del método.</b> Levántate, bebe agua, aléjate de la pantalla.</p>
      <p><b style="color:var(--text)">Programación y problemas:</b> prueba el preset «Profundo» (50/10). Cuesta entrar en foco y 25 minutos se quedan cortos.</p>
      <p><b style="color:var(--text)">Anota las dudas</b> en Apuntes para llevarlas a tutoría en vez de atascarte.</p>
    </div>
  </section>`;
}

// =====================================================================
// Enrutado interno de "Más"
// =====================================================================
const PAGES = { '': hub, asignaturas: subjects, notas: notes, bases, calificaciones: grades, ajustes: settingsView, instalar: install, atajos: shortcuts, acerca: about };

function render(sub = '') { return (PAGES[sub] || hub)(); }

function mount(root, sub) {
  if (sub === 'notas') {
    root.querySelectorAll('[data-note-field]').forEach((el) => {
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => {
        const id = el.closest('[data-note]').dataset.note;
        const el2 = $('[data-saved]'); if (el2) el2.textContent = 'Guardando…';
        saveNote(id, el.dataset.noteField, el.tagName === 'SELECT' ? (el.value || null) : el.value);
        if (el.dataset.noteField === 'title') {
          const item = root.querySelector(`.note-item[data-id="${id}"] b`); if (item) item.textContent = el.value || 'Sin título';
        }
      });
    });
    const search = root.querySelector('[data-note-search]');
    search?.addEventListener('input', debounce(() => { noteQuery = search.value; rerender(root, sub, '[data-note-search]'); }, 200));
  }
  if (sub === 'bases') {
    const inp = root.querySelector('[data-base-input]');
    inp.addEventListener('input', () => { base.input = inp.value; $('#baseOut').innerHTML = baseResults(); });
  }
  if (sub === 'calificaciones') {
    root.addEventListener('input', (e) => {
      const t = e.target;
      if (t.matches('[data-grade-target]')) update((s) => { s.grades.target = clamp(parseFloat(t.value) || 0, 0, 10); }, { silent: true });
      else if (t.dataset.g) {
        const id = t.closest('[data-id]').dataset.id;
        update((s) => { const it = s.grades.items.find((x) => x.id === id); it[t.dataset.g] = t.dataset.g === 'name' ? t.value : (t.value === '' ? '' : parseFloat(t.value)); }, { silent: true });
      } else return;
      $('#gradeOut').innerHTML = gradeCalc();
    });
  }
  if (sub === 'ajustes') {
    root.addEventListener('change', (e) => {
      const t = e.target;
      if (t.dataset.setting) {
        const key = t.dataset.setting;
        if (key === 'notifications' && t.checked && notifPermission() !== 'granted') return requestNotifications().then(() => rerender(root, sub));
        update((s) => { s.settings[key] = t.checked; });
        if (key === 'ntfyEnabled') { if (!t.checked) ntfyCancel(); else if (!state.settings.ntfyTopic) update((s) => { s.settings.ntfyTopic = randomTopic(); }); rerender(root, sub); }
      }
      if (t.dataset.text) update((s) => { s.settings[t.dataset.text] = t.value.trim(); });
    });
    root.addEventListener('input', (e) => {
      const t = e.target;
      if (t.dataset.range) { update((s) => { s.settings[t.dataset.range] = +t.value; }, { silent: true }); setAmbientVolume(); }
    });
    $('#importFile').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        if (!(await confirmSheet('¿Importar copia?', 'Se reemplazarán los datos actuales de este dispositivo por los del archivo.', { ok: 'Importar', kind: 'primary' }))) return;
        importData(text);
        toast('Copia importada');
        rerender(root, sub);
      } catch (err) { toast(err.message || 'No se pudo importar'); }
      e.target.value = '';
    });
  }
}

function rerender(root, sub, focusSel) {
  const y = scrollY;
  root.innerHTML = render(sub);
  mount(root, sub);
  scrollTo(0, y);
  if (focusSel) { const el = root.querySelector(focusSel); if (el) { el.focus(); el.setSelectionRange?.(el.value.length, el.value.length); } }
}

// =====================================================================
// Acciones
// =====================================================================
const actions = {
  // Asignaturas
  async 'subj-add'(el, e, root, sub) { await newSubjectSheet(); rerender(root, sub); },
  'subj-suggest'(el, e, root, sub) {
    const used = new Set(state.subjects.map((s) => s.color));
    const color = PALETTE.find((c) => !used.has(c)) || PALETTE[state.subjects.length % PALETTE.length];
    update((s) => s.subjects.push({ id: uid(), name: el.dataset.name, color }));
    rerender(root, sub);
  },
  async 'subj-edit'(el, e, root, sub) {
    const s = state.subjects.find((x) => x.id === el.closest('[data-id]').dataset.id);
    const { value, data } = await sheet({
      title: 'Editar asignatura',
      body: `<div class="form-stack"><label class="field"><span>Nombre</span><input class="input" name="name" required maxlength="60" value="${esc(s.name)}"></label>
        <div class="field"><span>Color</span>${swatches('color', s.color)}</div></div>`,
      actions: [{ label: 'Eliminar', value: 'delete', kind: 'danger', novalidate: true }, { label: 'Cancelar', value: 'cancel' }, { label: 'Guardar', value: 'ok', kind: 'primary' }],
    });
    if (value === 'delete') {
      if (!(await confirmSheet(`¿Eliminar «${esc(s.name)}»?`, 'Sus tareas y sesiones se conservan, pero quedarán sin asignatura.'))) return;
      update((st) => {
        st.subjects = st.subjects.filter((x) => x.id !== s.id);
        st.tasks.forEach((t) => { if (t.subjectId === s.id) t.subjectId = null; });
        st.events.forEach((t) => { if (t.subjectId === s.id) t.subjectId = null; });
        if (st.timer.subjectId === s.id) st.timer.subjectId = null;
      });
    } else if (value === 'ok') {
      update((st) => Object.assign(st.subjects.find((x) => x.id === s.id), { name: data.name.trim() || s.name, color: data.color || s.color }));
    }
    rerender(root, sub);
  },

  // Apuntes
  'note-new'(el, e, root, sub) {
    const n = { id: uid(), title: '', body: '', subjectId: state.timer.subjectId, mono: false, updatedAt: Date.now() };
    update((s) => s.notes.push(n), { silent: true });
    activeNote = n.id; noteQuery = '';
    rerender(root, sub);
    root.querySelector('[data-note-field="title"]')?.focus();
  },
  'note-open'(el, e, root, sub) { activeNote = el.dataset.id; rerender(root, sub); },
  'note-close'(el, e, root, sub) { cleanupEmptyNote(); activeNote = null; rerender(root, sub); },
  'note-mono'(el, e, root, sub) { update((s) => { const n = s.notes.find((x) => x.id === activeNote); n.mono = !n.mono; }, { silent: true }); rerender(root, sub); },
  async 'note-del'(el, e, root, sub) {
    if (!(await confirmSheet('¿Eliminar apunte?', 'No se puede deshacer.'))) return;
    update((s) => { s.notes = s.notes.filter((x) => x.id !== activeNote); }, { silent: true });
    activeNote = null; rerender(root, sub);
  },

  // Conversor
  'base-from'(el, e, root, sub) { base.from = +el.dataset.b; rerender(root, sub, '[data-base-input]'); },
  'base-bits'(el, e, root, sub) { base.bits = +el.dataset.b; rerender(root, sub); },

  // Calificaciones
  'grade-add'(el, e, root, sub) {
    const used = state.grades.items.reduce((a, i) => a + (+i.weight || 0), 0);
    update((s) => s.grades.items.push({ id: uid(), name: '', weight: Math.max(0, 100 - used) || 10, grade: '' }), { silent: true });
    rerender(root, sub);
    const rows = root.querySelectorAll('[data-g="name"]'); rows[rows.length - 1]?.focus();
  },
  'grade-del'(el, e, root, sub) { const id = el.closest('[data-id]').dataset.id; update((s) => { s.grades.items = s.grades.items.filter((x) => x.id !== id); }, { silent: true }); rerender(root, sub); },
  async 'grade-clear'(el, e, root, sub) { if (await confirmSheet('¿Vaciar calculadora?', '', { ok: 'Vaciar' })) { update((s) => { s.grades.items = []; }, { silent: true }); rerender(root, sub); } },

  // Ajustes
  step(el, e, root, sub) {
    const key = el.closest('[data-stepper]').dataset.stepper;
    const [min, max] = LIMITS[key];
    const cur = state.settings[key];
    const big = ['focus', 'long'].includes(key) && cur >= (el.dataset.step > 0 ? 10 : 15) ? 5 : 1;
    const next = clamp(cur + Number(el.dataset.step) * big, min, max);
    update((s) => { s.settings[key] = next; });
    el.closest('[data-stepper]').querySelector('output').textContent = next + (['focus', 'short', 'long'].includes(key) ? ' min' : '');
    root.querySelectorAll('[data-act="preset"]').forEach((b) => b.classList.toggle('is-on', b.dataset.v === `${state.settings.focus},${state.settings.short},${state.settings.long}`));
  },
  preset(el, e, root, sub) { const [f, s, l] = el.dataset.v.split(',').map(Number); update((st) => Object.assign(st.settings, { focus: f, short: s, long: l })); rerender(root, sub); toast(`Tiempos: ${f}/${s}/${l} min`); },
  theme(el, e, root, sub) {
    const v = el.dataset.v;
    update((s) => { s.settings.theme = v; });
    if (v === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = v;
    rerender(root, sub);
  },
  async 'notif-enable'(el, e, root, sub) {
    const p = await requestNotifications();
    toast(p === 'granted' ? 'Notificaciones activadas' : p === 'denied' ? 'Has bloqueado las notificaciones. Actívalas en los ajustes del sistema.' : 'No se activaron las notificaciones');
    rerender(root, sub);
  },
  'test-sound'() { unlockAudio(); const prev = state.settings.sound; state.settings.sound = true; chime('focus-end'); state.settings.sound = prev; },
  'ntfy-gen'(el, e, root, sub) { update((s) => { s.settings.ntfyTopic = randomTopic(); }); rerender(root, sub); },
  async 'ntfy-copy'() { try { await navigator.clipboard.writeText(state.settings.ntfyTopic); toast('Tema copiado'); } catch { toast('No se pudo copiar'); } },
  async 'ntfy-test'(el) {
    if (!state.settings.ntfyTopic) return toast('Escribe o genera un tema primero');
    el.disabled = true;
    try { await ntfyTest(); toast('Prueba enviada. Revisa la app ntfy.'); } catch { toast('No se pudo contactar con ntfy'); }
    el.disabled = false;
  },
  export() { download(`ciclo-copia-${dayKey()}.json`, exportData()); toast('Copia descargada'); },
  import() { $('#importFile').click(); },
  async wipe(el, e, root, sub) {
    if (!(await confirmSheet('¿Borrar todo?', 'Se eliminarán tareas, sesiones, agenda, apuntes y ajustes de este dispositivo. Exporta antes una copia si quieres conservarlos.', { ok: 'Borrar todo' }))) return;
    resetAll();
    delete document.documentElement.dataset.theme;
    toast('Datos borrados');
    go('enfoque');
  },
  async install(el, e, root, sub) {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(() => {});
    deferredPrompt = null;
    rerender(root, sub);
  },
};

function cleanupEmptyNote() {
  const n = state.notes.find((x) => x.id === activeNote);
  if (n && !n.title.trim() && !n.body.trim()) update((s) => { s.notes = s.notes.filter((x) => x.id !== n.id); }, { silent: true });
}
function unmount() { cleanupEmptyNote(); }

return { APP_VERSION, render, mount, actions, unmount };
})();

// ===== app.js =====
__m["app.js"] = (() => {
// Punto de entrada: enrutado, delegación de eventos, atajos, título y Service Worker.
const { $, $$, fmtClock } = __m["utils.js"];
const { state } = __m["store.js"];
const timer = __m["timer.js"];
const { parse, go } = __m["router.js"];
const { toast } = __m["ui.js"];
const { unlockAudio } = __m["sound.js"];
const focusView = __m["views/focus.js"];
const tasksView = __m["views/tasks.js"];
const agendaView = __m["views/agenda.js"];
const statsView = __m["views/stats.js"];
const moreView = __m["views/more.js"];
const VIEWS = { enfoque: focusView, tareas: tasksView, agenda: agendaView, progreso: statsView, mas: moreView };
const main = $('#main');
let current = null; // { view, sub, mod }

function render() {
  const { view, sub } = parse();
  const mod = VIEWS[view] || focusView;
  const name = VIEWS[view] ? view : 'enfoque';
  current?.mod.unmount?.();
  if (document.body.classList.contains('zen') && name !== 'enfoque') focusView.toggleZen(false);
  main.innerHTML = mod.render(sub);
  main.classList.toggle('is-focus-view', name === 'enfoque');
  current = { view: name, sub, mod };
  mod.mount?.(main, sub);
  const heat = main.querySelector('.heat');
  if (heat) heat.scrollLeft = heat.scrollWidth; // muestra las semanas recientes
  $$('.nav__item').forEach((a) => {
    const on = a.dataset.route === name;
    a.classList.toggle('is-active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  if (!sub) scrollTo(0, 0);
  paintChrome();
}

// ---------- Delegación de eventos ----------
main.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || !main.contains(el)) return;
  const fn = current?.mod.actions?.[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el, e, main, current.sub); }
});
main.addEventListener('change', (e) => {
  const el = e.target.closest('[data-change]');
  const fn = el && current?.mod.actions?.[el.dataset.change];
  if (fn) fn(el, e, main, current.sub);
});

// ---------- Barra lateral, título y fase ----------
let lastTitle = '';
function paintChrome() {
  const t = state.timer;
  document.body.dataset.phase = t.phase;
  const running = t.status === 'running';
  const label = timer.PHASES[t.phase].label;
  const clock = fmtClock(timer.remaining());
  const title = state.settings.titleTimer && t.status !== 'idle' ? `${clock} · ${running ? label : 'En pausa'}` : 'Ciclo';
  if (title !== lastTitle) { document.title = title; lastTitle = title; }
  const mini = $('#navMini');
  const show = t.status !== 'idle' && current?.view !== 'enfoque';
  mini.hidden = !show;
  if (show) mini.innerHTML = `<i></i><span style="flex:1">${running ? label : 'En pausa'}</span><b>${clock}</b>`;
}
$('#navMini').addEventListener('click', () => go('enfoque'));

timer.onTimer((type, data) => {
  paintChrome();
  if (type === 'complete' && !document.hidden) {
    toast(data.title + (data.auto ? '' : ' · ' + (data.next === 'focus' ? 'listo para el enfoque' : 'toca descansar')),
      current?.view === 'enfoque' ? {} : { action: 'Ver', onAction: () => go('enfoque') });
  }
  if (type === 'change' && current?.view === 'enfoque') focusView.paintContext();
});

// ---------- Atajos de teclado ----------
document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = e.target.tagName;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || e.target.isContentEditable || $('#sheet').open) return;
  const k = e.key.toLowerCase();
  const map = { 1: 'enfoque', 2: 'tareas', 3: 'agenda', 4: 'progreso', 5: 'mas' };
  if (map[k]) return go(map[k]);
  if (k === ' ' || e.code === 'Space') {
    if (tag === 'BUTTON' || tag === 'A') return; // deja que el botón enfocado actúe
    e.preventDefault(); unlockAudio(); timer.toggle(); return;
  }
  if (k === 'r') return timer.reset();
  if (k === 's') return timer.skip();
  if (k === 'f') { if (current?.view !== 'enfoque') go('enfoque'); return focusView.toggleZen(); }
  if (k === 'n') { e.preventDefault(); go('tareas'); setTimeout(() => $('[data-form="quick"] input')?.focus(), 50); return; }
  if (k === 'escape' && document.body.classList.contains('zen')) focusView.toggleZen(false);
});

// iOS: el audio solo se habilita tras un gesto del usuario.
addEventListener('pointerdown', unlockAudio, { once: true, capture: true });

// ---------- Service Worker (offline + notificaciones) ----------
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('sw.js');
      const offer = (w) => toast('Hay una nueva versión de Ciclo', { action: 'Actualizar', timeout: 12000, onAction: () => w.postMessage('skip-waiting') });
      if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w); });
      });
      let reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloading) { reloading = true; location.reload(); } });
    } catch (err) { console.warn('[Ciclo] Service Worker no registrado', err); }
  });
}

// ---------- Arranque ----------
addEventListener('hashchange', render);
if (!location.hash) history.replaceState(null, '', '#/enfoque');
render();
timer.boot();
setInterval(() => { if (state.timer.status === 'running') paintChrome(); }, 1000);

return {  };
})();
})();
