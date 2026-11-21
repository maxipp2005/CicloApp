// Notificaciones: del sistema (Service Worker), push remoto opcional con ntfy y bloqueo de pantalla.
import { state, update } from './store.js';

export const notifSupported = () => 'Notification' in window;
export const notifPermission = () => (notifSupported() ? Notification.permission : 'unsupported');

export async function requestNotifications() {
  if (!notifSupported()) return 'unsupported';
  let p = Notification.permission;
  if (p === 'default') p = await Notification.requestPermission();
  update((s) => { s.settings.notifications = p === 'granted'; });
  return p;
}

/** Muestra una notificación del sistema. Usa el Service Worker cuando existe (obligatorio en iOS/Android). */
export async function showNotification(title, body, tag = 'ciclo') {
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

export function vibrate(pattern = [200, 90, 200]) {
  if (state.settings.vibrate && navigator.vibrate) navigator.vibrate(pattern);
}

// ---------- ntfy (push aunque la app esté cerrada o el móvil bloqueado) ----------
// Se programa un mensaje con retraso en el servidor de ntfy al iniciar el temporizador
// y se cancela si el usuario pausa, reinicia o salta la fase.
const ntfyBase = () => (state.settings.ntfyServer || 'https://ntfy.sh').replace(/\/+$/, '');
const topic = () => encodeURIComponent(state.settings.ntfyTopic.trim());
export const ntfyReady = () => state.settings.ntfyEnabled && !!state.settings.ntfyTopic.trim();

export async function ntfySchedule(endAt, title, message) {
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

export async function ntfyCancel() {
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

export async function ntfyTest() {
  const q = new URLSearchParams({ title: 'Ciclo', tags: 'white_check_mark' });
  const r = await fetch(`${ntfyBase()}/${topic()}?${q}`, { method: 'POST', body: 'Las notificaciones de Ciclo funcionan.' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
}

export function randomTopic() {
  const a = new Uint8Array(9);
  crypto.getRandomValues(a);
  return 'ciclo-' + [...a].map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 14);
}

// ---------- Mantener la pantalla encendida ----------
let lock = null;
export async function keepAwake(on) {
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
