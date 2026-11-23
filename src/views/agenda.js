// Agenda: exámenes, entregas y prácticas con cuenta atrás y horas estudiadas por asignatura.
import { esc, icon, dayKey, parseDay, daysBetween, relDays, monthShort, weekdayShort, fmtHours, uid } from '../utils.js';
import { state, update, subjectById } from '../store.js';
import { sheet, confirmSheet, subjectOptions, subjectChip, viewHeader, emptyState } from '../ui.js';

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

export function render() {
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
    ${up.length ? `<div class="list list--cols">${up.map(eventRow).join('')}</div>`
      : emptyState('calendar', 'Sin fechas próximas', 'Añade tus exámenes y entregas para ver la cuenta atrás y cuántas horas llevas estudiadas de cada asignatura.')}
    ${past.length ? `<h2 class="section-title">Pasados</h2><div class="list list--cols">${past.slice(0, 20).map(eventRow).join('')}</div>` : ''}
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

export const actions = {
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
