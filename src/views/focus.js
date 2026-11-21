// Vista principal: temporizador.
import { $, $$, esc, icon, fmtClock, fmtMinutes, dayKey, daysBetween, parseDay, relDays } from '../utils.js';
import { state, update, subjectById, taskById, sessionsOn, addSubject, addTask } from '../store.js';
import * as timer from '../timer.js';
import { pickSheet, sheet, toast, subjectOptions, swatches } from '../ui.js';
import { startAmbient, stopAmbient, setAmbientVolume, unlockAudio } from '../sound.js';
import { PALETTE } from '../utils.js';

const R = 47.5;
const C = 2 * Math.PI * R;
const AMBIENT = { off: 'Sin sonido', white: 'Ruido blanco', pink: 'Ruido rosa', brown: 'Ruido marrón' };

export function render() {
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

export function mount(root) {
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
export function unmount() { offTimer?.(); offTimer = null; }

/** Actualiza solo lo que cambia cada segundo (sin rehacer el DOM). */
export function paint(first = false) {
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

export function paintContext() {
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
export const actions = {
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

export async function newSubjectSheet() {
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

export function toggleZen(force) {
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
