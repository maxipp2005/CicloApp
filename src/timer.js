// Motor del temporizador.
// Se basa en marcas de tiempo absolutas (endAt), no en contar ticks: así sigue siendo exacto
// aunque el navegador congele la app en segundo plano (iOS) o se recargue la página.
import { state, update, logSession, subjectById, taskById } from './store.js';
import { chime, startAmbient, stopAmbient } from './sound.js';
import { showNotification, vibrate, ntfySchedule, ntfyCancel, keepAwake } from './notify.js';

export const PHASES = {
  focus: { label: 'Enfoque', verb: 'Concéntrate' },
  short: { label: 'Descanso corto', verb: 'Respira' },
  long: { label: 'Descanso largo', verb: 'Desconecta' },
};

const listeners = new Set();
export const onTimer = (fn) => (listeners.add(fn), () => listeners.delete(fn));
const emit = (type, data) => listeners.forEach((l) => l(type, data));

const T = () => state.timer;
export const durationOf = (phase) => state.settings[phase] * 60000;

export function remaining() {
  const t = T();
  if (t.status === 'running') return Math.max(0, t.endAt - Date.now());
  if (t.status === 'paused') return t.remaining;
  return durationOf(t.phase);
}
export const total = () => (T().status === 'idle' ? durationOf(T().phase) : T().total || durationOf(T().phase));
export const progress = () => 1 - remaining() / total();

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

export function start() {
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

export function pause() {
  const t = T();
  if (t.status !== 'running') return;
  update((s) => { s.timer.remaining = Math.max(0, s.timer.endAt - Date.now()); s.timer.endAt = null; s.timer.status = 'paused'; });
  ntfyCancel();
  syncSideEffects();
  emit('change');
}

export const toggle = () => (T().status === 'running' ? pause() : start());

/** Vuelve al inicio de la fase actual. */
export function reset() {
  update((s) => Object.assign(s.timer, { status: 'idle', endAt: null, remaining: null, total: null, sessionStart: null }));
  ntfyCancel();
  syncSideEffects();
  emit('change');
}

/** Cambia de fase manualmente (pestañas superiores). */
export function setPhase(phase) {
  if (!PHASES[phase]) return;
  update((s) => Object.assign(s.timer, { phase, status: 'idle', endAt: null, remaining: null, total: null, sessionStart: null }));
  ntfyCancel();
  syncSideEffects();
  emit('change');
}

/** Salta a la siguiente fase sin contabilizar la actual. */
export function skip() {
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
export function tick() {
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
export function boot() {
  clearInterval(loop);
  loop = setInterval(tick, 250);
  document.addEventListener('visibilitychange', () => { tick(); syncSideEffects(); });
  addEventListener('focus', tick);
  tick();
  syncSideEffects();
}

export function setContext({ subjectId, taskId }) {
  update((s) => {
    if (subjectId !== undefined) s.timer.subjectId = subjectId;
    if (taskId !== undefined) s.timer.taskId = taskId;
  });
  emit('change');
}
