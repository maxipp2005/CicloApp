// Punto de entrada: enrutado, delegación de eventos, atajos, título y Service Worker.
import { $, $$, fmtClock } from './utils.js';
import { state } from './store.js';
import * as timer from './timer.js';
import { parse, go } from './router.js';
import { toast } from './ui.js';
import { unlockAudio } from './sound.js';
import * as focusView from './views/focus.js';
import * as tasksView from './views/tasks.js';
import * as agendaView from './views/agenda.js';
import * as statsView from './views/stats.js';
import * as moreView from './views/more.js';

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
