// Vista de tareas: lista con estimación en pomodoros, filtros por estado y asignatura.
import { $, esc, icon, plural } from '../utils.js';
import { state, update, addTask, subjectById, taskById } from '../store.js';
import { sheet, confirmSheet, toast, subjectOptions, subjectChip, viewHeader, emptyState } from '../ui.js';
import * as timer from '../timer.js';
import { go } from '../router.js';

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

export function render() {
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

export function mount(root) {
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

export const actions = {
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
