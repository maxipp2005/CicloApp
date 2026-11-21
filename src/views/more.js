// "Más": asignaturas, notas, herramientas (conversor de bases, calculadora de notas), ajustes y ayuda.
import { $, $$, esc, icon, uid, fmtHours, debounce, download, isIOS, isStandalone, dayKey, clamp, PALETTE } from '../utils.js';
import { state, update, exportData, importData, resetAll, DEFAULT_SETTINGS } from '../store.js';
import { sheet, confirmSheet, toast, subjectOptions, swatches, stepper, toggle, viewHeader, emptyState } from '../ui.js';
import { requestNotifications, notifPermission, notifSupported, ntfyTest, randomTopic, ntfyCancel } from '../notify.js';
import { chime, unlockAudio, setAmbientVolume } from '../sound.js';
import { go } from '../router.js';
import { newSubjectSheet } from './focus.js';

export const APP_VERSION = '1.0.1';
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

export function render(sub = '') { return (PAGES[sub] || hub)(); }

export function mount(root, sub) {
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
export const actions = {
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
export function unmount() { cleanupEmptyNote(); }
