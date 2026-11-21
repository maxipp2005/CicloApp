// Estado de la aplicación: persistencia en localStorage, migraciones y consultas.
import { uid, dayKey } from './utils.js';

const KEY = 'ciclo:v1';
const SCHEMA = 1;

export const DEFAULT_SETTINGS = {
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

export const state = load();
const listeners = new Set();
let saveTimer = null;

export function save(immediate = false) {
  const write = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { console.warn('[Ciclo] No se pudo guardar', e); }
  };
  clearTimeout(saveTimer);
  if (immediate) write(); else saveTimer = setTimeout(write, 120);
}

/** Ejecuta una mutación, guarda y avisa a los suscriptores. */
export function update(fn, { silent = false } = {}) {
  fn(state);
  save();
  if (!silent) listeners.forEach((l) => l(state));
}
export const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn));

// Guardado inmediato al salir/ocultar (iOS puede congelar la app en cualquier momento).
addEventListener('pagehide', () => save(true));
document.addEventListener('visibilitychange', () => { if (document.hidden) save(true); });

// ---------- Consultas ----------
export const subjectById = (id) => state.subjects.find((s) => s.id === id) || null;
export const taskById = (id) => state.tasks.find((t) => t.id === id) || null;

export function minutesByDay() {
  const map = new Map();
  for (const s of state.sessions) {
    const k = dayKey(new Date(s.start));
    map.set(k, (map.get(k) || 0) + s.min);
  }
  return map;
}

export function sessionsOn(key) {
  return state.sessions.filter((s) => dayKey(new Date(s.start)) === key);
}

/** Racha de días consecutivos con al menos una sesión (hoy cuenta si ya hay estudio). */
export function streak() {
  const days = new Set(state.sessions.map((s) => dayKey(new Date(s.start))));
  let n = 0;
  const d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (days.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export function bestStreak() {
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
export function addSubject(name, color) {
  const s = { id: uid(), name: name.trim(), color };
  update((st) => st.subjects.push(s));
  return s;
}

export function addTask({ title, subjectId = null, est = 1 }) {
  const t = { id: uid(), title: title.trim(), subjectId, est, done: 0, completed: false, createdAt: Date.now(), completedAt: null };
  update((st) => st.tasks.unshift(t));
  return t;
}

export function logSession({ start, end, subjectId, taskId, partial = false }) {
  const min = Math.round((end - start) / 60000);
  if (min < 1) return;
  update((st) => {
    st.sessions.push({ id: uid(), start, end, min, subjectId, taskId, ...(partial ? { partial: true } : {}) });
    const t = st.tasks.find((x) => x.id === taskId);
    if (t && !partial) t.done += 1;
  });
}

// ---------- Copias de seguridad ----------
export function exportData() {
  return JSON.stringify({ app: 'Ciclo', exportedAt: new Date().toISOString(), ...state }, null, 2);
}

export function importData(text) {
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

export function resetAll() {
  const fresh = defaults();
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, fresh);
  save(true);
  listeners.forEach((l) => l(state));
}
