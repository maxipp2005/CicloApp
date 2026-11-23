// Progreso: resumen del día, últimos 7 días, mapa de actividad y reparto por asignatura.
import { esc, icon, dayKey, addDays, startOfDay, weekdayLetter, fmtMinutes, fmtHours, fmtTime, fmtDate, uid, monthShort } from '../utils.js';
import { state, update, minutesByDay, sessionsOn, streak, bestStreak, subjectById, taskById } from '../store.js';
import { sheet, confirmSheet, subjectOptions, viewHeader, emptyState } from '../ui.js';


export function render() {
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

  // Mapa de calor: columnas = semanas (lunes a domingo). Un año entero en pantallas anchas.
  const WEEKS = matchMedia('(min-width: 1000px)').matches ? 52 : 26;
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

    <div class="duo mt">
    <div class="card">
      <div class="spread"><b>Últimos 7 días</b><span class="small muted">Media ${fmtMinutes(weekMin / 7)}/día</span></div>
      <div class="bars">${days.map((d, i) => `<div class="bars__col"><div class="bars__track"><div class="bars__bar ${i === 6 ? 'is-today' : ''}" style="height:${(vals[i] / max) * 100}%">${vals[i] ? `<span>${vals[i] >= 60 ? fmtHours(vals[i]) + 'h' : vals[i] + "'"}</span>` : ''}</div></div><div class="bars__lbl">${weekdayLetter(d)}</div></div>`).join('')}</div>
    </div>
    <div class="card">
      <div class="spread" style="margin-bottom:14px"><b>Por asignatura</b><span class="small muted">Últimos 30 días</span></div>
      ${share ? `<div class="share">${share}</div>` : '<p class="muted small">Aún no hay sesiones en los últimos 30 días.</p>'}
    </div>
    </div>

    <div class="card mt">
      <div class="spread" style="margin-bottom:14px"><b>Constancia</b><span class="small muted">Mejor racha: ${bestStreak()} días</span></div>
      <div class="heat" aria-label="Mapa de actividad">${cells.join('')}</div>
      <div class="heat-legend"><span>${monthShort(first)}</span><span style="flex:1"></span>Menos <i style="background:var(--surface-2)"></i><i style="background:color-mix(in srgb,var(--focus) 25%,var(--surface-2))"></i><i style="background:color-mix(in srgb,var(--focus) 50%,var(--surface-2))"></i><i style="background:color-mix(in srgb,var(--focus) 75%,var(--surface-2))"></i><i style="background:var(--focus)"></i> Más</div>
    </div>

    <h2 class="section-title">Sesiones de hoy</h2>
    ${todaySessions.length ? `<div class="list list--cols">${todaySessions.slice().reverse().map((s) => {
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

export const actions = {
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
