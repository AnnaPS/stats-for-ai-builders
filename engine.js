"use strict";
/* Stats for AI Builders: lesson engine. Lessons are data (lessons-*.js); interactions are widgets (widgets.js). */
const PYURL = window.__PYURL || "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const el = (html) => { const t=document.createElement("template"); t.innerHTML=html.trim(); return t.content.firstElementChild; };
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const reduceMotion = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

/* ---------- saved progress (this browser only) ---------- */
const KEY = "stats-ai-builders-v2";
let S = { xp:0, earned:{}, ans:{}, pos:{}, done:{}, streak:0, last:null, theme:null, lang:null };
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(S, JSON.parse(raw)); } catch(e) {}
if (!S.lang) S.lang = ((navigator.language||"en").toLowerCase().startsWith("es")) ? "es" : "en";
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e) {} }
const LANG = () => S.lang === "es" ? 1 : 0;
const t = (p) => Array.isArray(p) ? p[LANG()] : p;
const num = (v, d=0) => Number(v).toLocaleString(LANG() ? "es-ES" : "en-US", {minimumFractionDigits:d, maximumFractionDigits:d, useGrouping: Math.abs(v) >= 10000 || !LANG()});
const pc = (v, d=0) => num(v*100, d) + (LANG() ? " %" : "%");
const dayStr = (d) => d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
function award(key, amount){
  if (S.earned[key]) return "";
  S.earned[key] = amount; S.xp += amount;
  const today = dayStr(new Date()), y = new Date(); y.setDate(y.getDate()-1);
  if (S.last !== today) { S.streak = (S.last === dayStr(y)) ? S.streak + 1 : 1; S.last = today; }
  save(); paintStats();
  return `<span class="xp">+${amount} XP</span>`;
}

/* ---------- UI strings ---------- */
const T = {
  map:["Course map","Mapa del curso"], gloss:["Glossary","Glosario"], streak:["Streak","Racha"], day:["day","día"], days:["days","días"],
  light:["Light theme","Tema claro"], dark:["Dark theme","Tema oscuro"], other:["Español","English"],
  h1:["Statistics you can use on Monday's eval","Estadística que puedes usar en la eval del lunes"],
  lede:["Every lesson starts from a question you already have at work. You play with a simulation first, write the code second, and meet the formula last.","Cada lección parte de una pregunta que ya te haces en el trabajo. Primero juegas con una simulación, después escribes el código y la fórmula llega al final."],
  start:["Start","Empezar"], cont:["Continue","Continuar"], completed:["Completed","Completada"], mins:["10 to 15 min","10 a 15 min"],
  saved:["Progress, XP and streak are saved in this browser only.","El progreso, los XP y la racha se guardan solo en este navegador."],
  lessonsDone:["lessons done","lecciones hechas"],
  parts:[["Hook","Gancho"],["Play","Juega"],["Code","Código"],["Check","Comprueba"],["Apply","Aplica"],["Recap","Resumen"]],
  back:["Back","Atrás"], next:["Continue","Continuar"], finish:["Finish lesson","Terminar lección"],
  hookEy:["Hook · a question from work","Gancho · una pregunta del trabajo"],
  predSaved:["Prediction saved.","Predicción guardada."], predLater:["No answer yet. You will test it yourself on the next screens.","Aún no hay respuesta. La comprobarás tú en las siguientes pantallas."],
  yourPred:["Your prediction:","Tu predicción:"], predRight:["You called it.","Acertaste."], predWrong:["Most people expect something else here.","La mayoría espera otra cosa aquí."],
  notice:["What to notice:","Fíjate en esto:"],
  correct:["Correct.","Correcto."], notQuite:["Not quite.","No del todo."], pickAnother:["Pick another answer.","Elige otra respuesta."], notYet:["Not yet.","Todavía no."],
  qOf:(i,n)=>[`Check · question ${i} of ${n}`,`Comprueba · pregunta ${i} de ${n}`],
  kinds:{mc:["Multiple choice","Opción múltiple"], predict:["Predict the output","Predice la salida"], fix:["Fix this code","Arregla este código"]},
  whatPrints:["What does this print?","¿Qué imprime esto?"],
  codeEy:["Code · run it yourself","Código · ejecútalo tú"], run:["Run","Ejecutar"], reset:["Reset code","Restablecer código"], showSol:["Show the solution","Ver la solución"], solIntro:["This is the completed line. Copy it into the cell, or let the button do it, then press Run.","Esta es la línea completa. Cópiala en la celda, o deja que lo haga el botón, y pulsa Ejecutar."], solIntroN:["These are the completed lines. Copy them into the cell, or let the button do it, then press Run.","Estas son las líneas completas. Cópialas en la celda, o deja que lo haga el botón, y pulsa Ejecutar."], copySol:["Copy","Copiar"], putSol:["Put it in the cell","Ponerla en la celda"], putDone:["Done. The cell now holds the solution. Press Run.","Hecho. La celda contiene ahora la solución. Pulsa Ejecutar."],
  pyNote:["Python runs in your browser. The first run downloads it and takes a few seconds.","Python se ejecuta en tu navegador. La primera ejecución lo descarga y tarda unos segundos."],
  running:["Running…","Ejecutando…"], outHere:["Output appears here.","La salida aparece aquí."], doneRun:["Done.","Listo."], pyErr:["Python stopped with an error.","Python se detuvo con un error."],
  pyDown:["The Python runtime could not be downloaded. Check your connection and press Run again.","No se pudo descargar Python. Revisa tu conexión y pulsa Ejecutar otra vez."],
  pyNA:["Python is not available right now.","Python no está disponible ahora mismo."], pyLoading:["Downloading Python (about 25 MB, first run only)…","Descargando Python (unos 25 MB, solo la primera vez)…"], pyPkgs:["Loading NumPy and pandas…","Cargando NumPy y pandas…"], pyTimeout:["Python took too long to load","Python ha tardado demasiado en cargar"], pyFail:["Python could not start in this browser. Reload the page and press Run again. The reason reported was:","Python no ha podido arrancar en este navegador. Recarga la página y pulsa Ejecutar otra vez. El motivo indicado fue:"], noOut:["(no output)","(sin salida)"],
  gapMsg:["The gap is still there. Replace <code>____</code> with your answer and run again.","El hueco sigue ahí. Sustituye <code>____</code> por tu respuesta y ejecuta de nuevo."],
  errMsg:["Read the last line of the error above. It names the problem. Fix that line and run again.","Lee la última línea del error de arriba: nombra el problema. Corrige esa línea y ejecuta de nuevo."],
  noMsg:["The code runs, but the result is not the expected one. Reread the comment above the gap.","El código se ejecuta, pero el resultado no es el esperado. Relee el comentario que hay sobre el hueco."],
  dotsMsg:["<code>answer</code> is still <code>...</code>. Replace the dots with your own expression.","<code>answer</code> sigue siendo <code>...</code>. Sustituye los puntos por tu propia expresión."],
  dartNote:["Copy the code, open DartPad, paste, and press Run.","Copia el código, abre DartPad, pégalo y pulsa Run."], copyDart:["Copy Dart code","Copiar código Dart"], openDart:["Open DartPad","Abrir DartPad"],
  copied:["Copied.","Copiado."], selected:["Code selected. Press Ctrl+C or Cmd+C to copy.","Código seleccionado. Pulsa Ctrl+C o Cmd+C para copiar."],
  dartSame:["Same logic in plain Dart, without NumPy or pandas. Dart's random generator differs from NumPy's, so exact numbers differ while the pattern stays the same.","La misma lógica en Dart puro, sin NumPy ni pandas. El generador aleatorio de Dart es distinto al de NumPy: los números exactos cambian, el patrón no."],
  applyEy:["Apply · mini challenge","Aplica · mini reto"], firstRows:(a,b)=>[`First ${a} of ${b} rows, loaded as the DataFrame <code>df</code>. The data is synthetic and generated in this page.`,`Primeras ${a} de ${b} filas, cargadas como el DataFrame <code>df</code>. Los datos son sintéticos y se generan en esta página.`],
  task:["Your task:","Tu tarea:"], hint:["Stuck? Show a hint","¿Atascado? Ver una pista"],
  recapEy:["Recap","Resumen"], recapH:["What you now know","Lo que ya sabes"], formulaH:["The formula, as a summary of what you saw","La fórmula, como resumen de lo que viste"],
  symNote:["Select a symbol to jump back to the thing you manipulated.","Selecciona un símbolo para volver a lo que manipulaste."],
  nextUp:["Coming next:","A continuación:"], deeper:["Go deeper","Para profundizar"],
  bank:["Press Finish lesson to bank your XP.","Pulsa Terminar lección para guardar tus XP."], lessonDone:["Lesson completed.","Lección completada."],
  glossH:["Every term, in plain words","Cada término, en palabras sencillas"], glossLede:["Each term links to the screen that introduced it.","Cada término enlaza con la pantalla donde apareció por primera vez."],
  playEy:(i,n)=>[`Play · ${i} of ${n}`,`Juega · ${i} de ${n}`],
  language:["Language","Lenguaje"], question:["Question","Pregunta"],
  stepsLeft:(k)=>[k===1?"1 step left":`${k} steps left`, k===1?"Falta 1 paso":`Faltan ${k} pasos`], stepsOf:(a,b)=>[`${a} of ${b} steps`,`${a} de ${b} pasos`],
  missedH:["Steps you have not completed yet:","Pasos que aún no has completado:"], missedNote:["Each one gives XP when you finish its activity. The lesson shows as completed on the course map once all of them are done.","Cada uno da XP cuando terminas su actividad. La lección aparece como completada en el mapa del curso cuando están todos hechos."]
};
const TRACKS = [
  {id:"b", name:["Basic","Básico"], sub:["Build intuition by simulating","Construye intuición simulando"]},
  {id:"i", name:["Intermediate","Intermedio"], sub:["Decide with data","Decide con datos"]},
  {id:"a", name:["Advanced","Avanzado"], sub:["Statistics for agents and production AI","Estadística para agentes e IA en producción"]}
];
const LESSONS = {}; const ORDER = [];
function L(def){ LESSONS[def.id] = def; ORDER.push(def.id); }
window.LESSONS = LESSONS;
const W = {};   // widgets, filled by widgets.js

function stepsOf(l){
  const s = [{id:"hook", part:0, xp:5}];
  l.plays.forEach((p,i) => s.push({id:"p"+(i+1), part:1, i, xp:10}));
  s.push({id:"code", part:2, xp:20});
  l.qs.forEach((q,i) => s.push({id:"q"+(i+1), part:3, i, xp:10}));
  s.push({id:"apply", part:4, xp:30}, {id:"recap", part:5, xp:15});
  return s;
}
const progressOf = (l) => { const st = stepsOf(l); return st.filter(s => S.earned[l.id+":"+s.id]).length / st.length; };
const missingOf = (l) => stepsOf(l).filter(s => !S.earned[l.id+":"+s.id]);
const stepName = (l, s) => s.id === "hook" ? t(T.parts[0]) : s.part === 1 ? t(T.parts[1]) + " " + (s.i+1) : s.id === "code" ? t(T.parts[2]) : s.part === 3 ? t(T.question) + " " + (s.i+1) : s.id === "apply" ? t(T.parts[4]) : t(T.parts[5]);
const lessonNo = (l) => t(TRACKS.find(k => k.id === l.id[0]).name) + " " + l.id.slice(1);

/* ---------- theme, shell ---------- */
function applyTheme(){ if (S.theme) document.documentElement.setAttribute("data-theme", S.theme); document.documentElement.lang = S.lang; document.title = t(T.h1); }
function isDark(){ const a=document.documentElement.getAttribute("data-theme"); return a ? a==="dark" : (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches); }
const app = $("#app");
function topbar(){
  return `<header class="top">
    <a class="brand" href="#map">Stats for <span>AI Builders</span></a>
    <nav aria-label="Main"><a href="#map">${t(T.map)}</a><a href="#glossary">${t(T.gloss)}</a></nav>
    <span class="stat" id="stat-streak"></span><span class="stat" id="stat-xp"></span>
    <button class="btn small lang" id="lang" type="button" lang="${LANG()?"en":"es"}">${t(T.other)}</button>
    <button class="btn small" id="theme" type="button"></button>
  </header>`;
}
function paintStats(){
  const a=$("#stat-streak"), b=$("#stat-xp"), c=$("#theme");
  if (a) a.innerHTML = `${t(T.streak)} <b>${S.streak} ${t(S.streak===1?T.day:T.days)}</b>`;
  if (b) b.innerHTML = `<b>${S.xp}</b> XP`;
  if (c) c.textContent = t(isDark() ? T.light : T.dark);
}
function wireTop(){
  $("#theme").addEventListener("click", () => { S.theme = isDark() ? "light" : "dark"; applyTheme(); save(); paintStats(); });
  $("#lang").addEventListener("click", () => { S.lang = LANG() ? "en" : "es"; save(); applyTheme(); route(); });
  paintStats();
}

/* ---------- course map and glossary ---------- */
function renderMap(){
  app.className = "wrap wide";
  let html = topbar() + `<div><p class="eyebrow">${t(T.map)}</p><h1>${t(T.h1)}</h1><p class="lede" style="margin-top:10px">${t(T.lede)}</p></div>`;
  TRACKS.forEach(tr => {
    const ls = ORDER.filter(id => id[0] === tr.id).map(id => LESSONS[id]);
    const done = ls.filter(l => progressOf(l) === 1).length;
    html += `<section class="track" aria-labelledby="t-${tr.id}"><div class="track-head"><h2 id="t-${tr.id}">${t(tr.name)}</h2><p>${t(tr.sub)}</p>
      <div class="meter" role="img" aria-label="${done} / ${ls.length} ${t(T.lessonsDone)}"><i style="width:${done/ls.length*100}%"></i></div><p>${done} / ${ls.length} ${t(T.lessonsDone)}</p></div><ol class="lessons">`;
    ls.forEach(l => {
      const p = progressOf(l), miss = missingOf(l), n = stepsOf(l).length, full = miss.length === 0;
      const label = full ? T.completed : S.done[l.id] ? T.stepsLeft(miss.length) : p > 0 ? T.cont : T.start;
      const href = !full && S.done[l.id] ? `#${l.id}-${miss[0].id}` : `#${l.id}`;
      html += `<li><a class="lesson-tile" href="${href}"><span class="num">${lessonNo(l)} · ${t(T.mins)}</span><h3>${t(l.title)}</h3><span class="q">${t(l.q)}</span>
        <div class="meter" role="img" aria-label="${t(T.stepsOf(n-miss.length, n))}"><i style="width:${p*100}%"></i></div>
        <span class="pill ${full?"done":p>0?"live":""}">${t(label)}</span><span class="num">${t(T.stepsOf(n-miss.length, n))}</span></a></li>`;
    });
    html += `</ol></section>`;
  });
  html += `<p class="caption">${t(T.saved)}</p>`;
  app.innerHTML = html; wireTop();
}
function renderGlossary(){
  app.className = "wrap wide";
  const items = [];
  ORDER.forEach(id => (LESSONS[id].gloss||[]).forEach(g => items.push([t(g[0]), t(g[1]), id, g[2]])));
  items.sort((a,b) => a[0].localeCompare(b[0], S.lang));
  app.innerHTML = topbar() + `<div><p class="eyebrow">${t(T.gloss)}</p><h1>${t(T.glossH)}</h1><p class="lede" style="margin-top:10px">${t(T.glossLede)}</p></div>
    <dl class="glossary">` + items.map(g => `<div><dt>${g[0]}</dt><dd>${g[1]}</dd><a href="#${g[2]}-${g[3]}">${lessonNo(LESSONS[g[2]])}: ${t(LESSONS[g[2]].title)}</a></div>`).join("") + `</dl>`;
  wireTop();
}

/* ---------- lesson runner ---------- */
let timers = [], CUR = null, pendingFlash = null;
const wstate = {};
function clearTimers(){ timers.forEach(x => { clearInterval(x); cancelAnimationFrame(x); }); timers = []; }
function renderLesson(l, flashSel){
  clearTimers(); CUR = l;
  app.className = "wrap";
  const steps = stepsOf(l), i = clamp(S.pos[l.id]|0, 0, steps.length-1), st = steps[i];
  const parts = T.parts.map((p,pi) => {
    const segs = steps.map((s,k) => s.part===pi ? `<i class="${k===i?"now":k<i?"seen":""}"></i>` : "").join("");
    return `<li class="${st.part===pi?"on":""}"${st.part===pi?' aria-current="step"':""}><div class="segs">${segs}</div><span>${t(p)}</span></li>`;
  }).join("");
  app.innerHTML = topbar() + `<div><p class="eyebrow">${lessonNo(l)}</p><h1 style="font-size:1.35rem">${t(l.title)}</h1></div>
    <ol class="parts" aria-label="${t(T.map)}">${parts}</ol>
    <section class="card" id="step" tabindex="-1"></section>
    <div class="stepnav"><button class="btn" id="back" type="button" ${i===0?"disabled":""}>${t(T.back)}</button>
      <span class="count">${i+1} / ${steps.length}</span>
      <button class="btn primary" id="next" type="button">${t(i===steps.length-1?T.finish:T.next)}</button></div>`;
  wireTop();
  const root = $("#step"), key = l.id+":"+st.id;
  if (st.id === "hook") stepHook(root, l, key, st);
  else if (st.part === 1) stepPlay(root, l, key, st, steps);
  else if (st.id === "code") stepCode(root, l, key, st);
  else if (st.part === 3) stepQ(root, l, key, st);
  else if (st.id === "apply") stepApply(root, l, key, st);
  else stepRecap(root, l, key, st);
  $("#back").addEventListener("click", () => go(l, i-1));
  $("#next").addEventListener("click", () => {
    if (i === steps.length-1) { award(key, st.xp); S.done[l.id] = true; save(); location.hash = "#map"; }
    else go(l, i+1);
  });
  if (flashSel) { const f = $(flashSel); if (f) { f.classList.add("flash"); f.scrollIntoView({block:"center"}); } }
}
function go(l, i, flashSel){
  const steps = stepsOf(l); i = clamp(i, 0, steps.length-1);
  S.pos[l.id] = i; save();
  const h = "#" + l.id + "-" + steps[i].id;
  if (location.hash !== h) { pendingFlash = flashSel; location.hash = h; } else renderLesson(l, flashSel);
  if (!flashSel) window.scrollTo(0,0);
}

/* multiple choice: every option carries its own explanation */
function choices(root, key, legend, opts, xp){
  const fs = el(`<fieldset class="choices"><legend>${legend}</legend></fieldset>`);
  const fb = el(`<div class="feedback" role="status" hidden></div>`);
  const letters = "ABCDE";
  function show(k){
    $$(".choice", fs).forEach((b,j) => {
      b.setAttribute("aria-pressed", j===k); b.classList.remove("right","wrong");
      $(".mark", b).textContent = letters[j];
      if (j===k) { b.classList.add(opts[j].ok ? "right" : "wrong"); $(".mark", b).textContent = opts[j].ok ? "✓" : "×"; }
    });
    const o = opts[k], bonus = o.ok ? award(key, xp) : "";
    fb.hidden = false; fb.className = "feedback " + (o.ok ? "good" : "bad");
    fb.innerHTML = `<strong class="${o.ok?"good":"bad"}">${t(o.ok ? T.correct : T.notQuite)}</strong>${bonus} ${t(o.why)}` + (o.ok ? "" : ` <em>${t(T.pickAnother)}</em>`);
  }
  opts.forEach((o,k) => {
    const b = el(`<button type="button" class="choice" aria-pressed="false"><span class="mark">${letters[k]}</span><span>${t(o.t)}</span></button>`);
    b.addEventListener("click", () => { S.ans[key] = k; save(); show(k); });
    fs.appendChild(b);
  });
  root.append(fs, fb);
  if (S.ans[key] != null && opts[S.ans[key]]) show(S.ans[key]);
}

function stepHook(root, l, key, st){
  const h = l.hook;
  root.innerHTML = `<p class="eyebrow">${t(T.hookEy)}</p><h2>${t(h.title)}</h2><div class="prose">${t(h.body)}</div>`;
  const fs = el(`<fieldset class="choices"><legend>${t(h.legend)}</legend></fieldset>`), fb = el(`<div class="feedback" role="status" hidden></div>`);
  const show = () => {
    $$(".choice", fs).forEach((b,j) => b.setAttribute("aria-pressed", j===S.ans[key]));
    fb.hidden = false; fb.innerHTML = `<strong>${t(T.predSaved)}</strong>${award(key, st.xp)} ${t(T.predLater)}`;
  };
  h.opts.forEach((o,k) => {
    const b = el(`<button type="button" class="choice" aria-pressed="false"><span class="mark">${"ABCD"[k]}</span><span>${t(o)}</span></button>`);
    b.addEventListener("click", () => { S.ans[key] = k; save(); show(); });
    fs.appendChild(b);
  });
  root.append(fs, fb);
  if (S.ans[key] != null) show();
}

function stepPlay(root, l, key, st, steps){
  const p = l.plays[st.i];
  root.innerHTML = `<p class="eyebrow">${t(T.playEy(st.i+1, l.plays.length))}</p><h2>${t(p.title)}</h2><div class="prose">${t(p.intro)}</div>
    <div id="widget" style="display:flex;flex-direction:column;gap:14px"></div>
    <p class="caption"><b>${t(T.notice)}</b> ${t(p.notice)}</p><div id="playdone" role="status"></div>`;
  const sk = key; if (!wstate[sk]) wstate[sk] = {};
  const showDone = () => {
    let html = `<div class="feedback good"><strong class="good">${t(p.doneTitle || ["Seen it.","Visto."])}</strong>${award(key, st.xp)} ${t(p.done)}</div>`;
    const h = l.hook, hk = l.id+":hook";
    if ((h.at || "p1") === st.id) {
      const a = S.ans[hk], right = a === h.answer;
      html = `<div class="feedback ${a==null||right?"good":"bad"}">` + (a != null ? `<strong class="${right?"good":"bad"}">${t(T.yourPred)} “${t(h.opts[a])}”.</strong> ${t(right?T.predRight:T.predWrong)} ` : "") + t(h.reveal) + `</div>` + html;
    }
    $("#playdone").innerHTML = html;
  };
  const ctx = {
    t, root: $("#widget"), a: p.a || {},
    state: (init) => { const o = wstate[sk]; if (!o._i) { Object.assign(o, init); o._i = 1; } return o; },
    done: () => { if (!wstate[sk]._done) { wstate[sk]._done = 1; } showDone(); },
    every: (ms, fn) => { const id = setInterval(fn, ms); timers.push(id); return () => clearInterval(id); },
    raf: (fn) => { const id = requestAnimationFrame(fn); timers.push(id); return id; }
  };
  W[p.w](ctx.root, ctx, ctx.a);
  if (wstate[sk]._done || S.earned[key]) showDone();
}

/* ---------- Python in the browser ---------- */
let pyPromise = null;
const PY_LOCAL = new URL("py/", document.baseURI).href;
/* files too large to ship whole are stored in parts and joined here */
const PY_PARTS = {"python_stdlib.zip": ["python_stdlib.wasm"], "numpy-1.26.4-cp312-cp312-pyodide_2024_0_wasm32.whl": ["numpy-whl.wasm"], "pandas-2.2.0-cp312-cp312-pyodide_2024_0_wasm32.whl": ["pandas-whl-1.wasm", "pandas-whl-2.wasm"],
  "python_dateutil-2.9.0.post0-py2.py3-none-any.whl": ["dateutil-whl.wasm"], "pytz-2024.1-py2.py3-none-any.whl": ["pytz-whl.wasm"], "six-1.16.0-py2.py3-none-any.whl": ["six-whl.wasm"]};
function patchFetch(base){
  if (window.__pyFetch) return; window.__pyFetch = 1;
  const orig = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const u = typeof input === "string" ? input : (input && input.url) || String(input);
    for (const k in PY_PARTS) if (u.startsWith(base) && u.endsWith(k)) {
      const bufs = await Promise.all(PY_PARTS[k].map(p => orig(base + p).then(r => { if (!r.ok) throw new Error(p + ": HTTP " + r.status); return r.arrayBuffer(); })));
      return new Response(new Blob(bufs), {status:200, headers:{"Content-Type":"application/octet-stream"}});
    }
    return orig(input, init);
  };
}
function loadScript(src){ return new Promise((res,rej) => { const s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=()=>rej(new Error(t(T.pyDown))); document.head.appendChild(s); }); }
const withTimeout = (p, ms, what) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(t(T.pyTimeout) + " (" + what + ")")), ms))]);
async function initPy(){
  let last;
  for (const base of (window.__PYURL ? [window.__PYURL] : [PY_LOCAL, PYURL])) {
    try {
      if (base === PY_LOCAL) patchFetch(base);
      await withTimeout(loadScript(base + "pyodide.js"), 30000, "pyodide.js");
      return await withTimeout(loadPyodide({indexURL: base}), 120000, "runtime");
    } catch(e) { last = e; console.warn("Python runtime failed to load from", base, e); }
  }
  throw last;
}
async function getPy(pkgs, status){
  if (!pyPromise) { if (status) status(t(T.pyLoading)); pyPromise = initPy(); pyPromise.catch(() => { pyPromise = null; }); }
  const py = await pyPromise;
  if (status) status(t(T.pyPkgs));
  await withTimeout(py.loadPackage(pkgs), 180000, pkgs.join(", "));
  return py;
}
async function runPy(code, pkgs, pre, status){
  const py = await getPy(pkgs, status); let out = "";
  if (status) status(t(T.running));
  py.setStdout({batched: s => out += s + "\n"}); py.setStderr({batched: s => out += s + "\n"});
  const ns = py.globals.get("dict")(); if (pre) pre(py, ns);
  try { await py.runPythonAsync(code, {globals: ns}); return {py, ns, out}; }
  catch(e) { const lines = String(e.message||e).trim().split("\n"); return {py, ns, out, err: lines[lines.length-1], trace: lines.slice(-6).join("\n")}; }
}
window.runPy = runPy;
const localize = (code) => code.replace(/(#|\/\/)~ (.*?)(?: ~~ (.*))?$/gm, (m,c,en,es) => c + " " + (LANG() && es ? es : en));
const applySol = (src, sol) => sol.reduce((s, [a,b]) => s.split(a).join(b), src);
const fill = (msg, vars) => msg.replace(/\{(\w+)\}/g, (m,k) => vars && vars[k] != null ? (typeof vars[k] === "number" ? Number(vars[k]).toLocaleString(LANG() ? "es-ES" : "en-US", {maximumFractionDigits:3}) : esc(vars[k])) : m);

/* a code cell. judge(result, source) returns {ok, msg} */
function codeCell(root, id, starter, pkgs, pre, judge, sol, xpKey, xp){
  const sk = id + ":" + S.lang;
  const box = el(`<div class="cellbox">
    <textarea class="code" id="ta" spellcheck="false" autocapitalize="off" autocomplete="off" rows="${starter.split("\n").length+1}" aria-label="Python"></textarea>
    <div class="controls"><button class="btn primary" type="button" id="runbtn">${t(T.run)}</button><button class="btn" type="button" id="resetbtn">${t(T.reset)}</button><span class="status" id="pyst" role="status">${t(T.pyNote)}</span></div>
    <pre class="out" id="pyout" aria-label="Output">${t(T.outHere)}</pre>
    <div id="pyfb" role="status"></div></div>`);
  root.appendChild(box);
  const ta = $("#ta"), out = $("#pyout"), st = $("#pyst"), fb = $("#pyfb"), btn = $("#runbtn");
  ta.value = S.ans[sk] || starter;
  ta.addEventListener("input", () => { S.ans[sk] = ta.value; save(); });
  $("#resetbtn").addEventListener("click", () => { ta.value = starter; delete S.ans[sk]; save(); out.textContent = t(T.outHere); out.classList.remove("err"); fb.innerHTML = ""; });
  btn.addEventListener("click", async () => {
    btn.disabled = true; st.textContent = t(T.running); out.classList.remove("err"); fb.innerHTML = "";
    try {
      const r = await runPy(ta.value, pkgs, pre, (m) => { st.textContent = m; });
      out.textContent = (r.out || "") + (r.err ? r.trace : "") || t(T.noOut);
      if (r.err) out.classList.add("err");
      st.textContent = t(r.err ? T.pyErr : T.doneRun);
      const res = judge(r, ta.value);
      fb.dataset.key = res.key || "";
      fb.innerHTML = `<div class="feedback ${res.ok?"good":"bad"}"><strong class="${res.ok?"good":"bad"}">${t(res.ok?T.correct:T.notYet)}</strong>${res.ok ? award(xpKey, xp) : ""} ${res.msg}</div>`;
    } catch(e) { out.textContent = t(T.pyFail) + "\n" + String(e && e.message || e); out.classList.add("err"); st.textContent = t(T.pyNA); }
    btn.disabled = false;
  });
}
/* the solved line(s), shown the same way as a hint */
function solutionBox(root, starter, sol, sk){
  const lines = starter.split("\n");
  const solved = sol.map(([a,b]) => { const ln = lines.find(x => x.includes(a)); return (ln == null ? b : ln.split(a).join(b)).split("\n").map(x => x.replace(/\s+$/, "")).join("\n"); });
  const indent = Math.min(...solved.join("\n").split("\n").filter(x => x.trim()).map(x => x.match(/^ */)[0].length));
  const text = solved.map(x => x.split("\n").map(y => y.slice(indent)).join("\n")).join("\n");
  const box = el(`<details class="solution"><summary>${t(T.showSol)}</summary><div class="prose" style="margin-top:10px"><p>${t(text.includes("\n") ? T.solIntroN : T.solIntro)}</p><pre id="soltext">${esc(text)}</pre>
    <div class="controls"><button class="btn small" type="button" id="solcopy">${t(T.copySol)}</button><button class="btn small" type="button" id="solput">${t(T.putSol)}</button><span class="status" id="solst" role="status"></span></div></div></details>`);
  root.appendChild(box);
  $("#solcopy").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(text); $("#solst").textContent = t(T.copied); }
    catch(x) { const r=document.createRange(); r.selectNodeContents($("#soltext")); const s=getSelection(); s.removeAllRanges(); s.addRange(r); $("#solst").textContent = t(T.selected); }
  });
  $("#solput").addEventListener("click", () => { const ta = $("#ta"); ta.value = applySol(starter, sol); S.ans[sk] = ta.value; save(); $("#solst").textContent = t(T.putDone); });
}
function judgeWith(c, r, src, isApply){
  if (src.includes("____")) return {ok:false, key:"gap", msg:t(T.gapMsg)};
  if (r.err) return {ok:false, key:"err", msg:t((c.msgs && c.msgs.err) || T.errMsg)};
  let key, vars = null;
  try { r.ns.set("_out", r.out || ""); key = r.py.runPython(c.check, {globals: r.ns}); } catch(e) { key = "_"; }
  if (typeof key === "string" && key[0] === "{") { try { vars = JSON.parse(key); key = vars.k; } catch(e) { key = "_"; } }
  if (key === "ok") return {ok:true, key, msg:fill(t(c.ok), vars)};
  if (key === "dots") return {ok:false, key, msg:t(T.dotsMsg)};
  return {ok:false, key:String(key), msg:fill(t((c.msgs && c.msgs[key]) || T.noMsg), vars)};
}
window.judgeWith = judgeWith;

const codeTab = {};
function stepCode(root, l, key, st){
  const c = l.code, tab = codeTab[l.id] || "py";
  root.innerHTML = `<p class="eyebrow">${t(T.codeEy)}</p><h2>${t(c.title)}</h2><div class="prose">${t(c.intro)}</div>
  <div><div class="tabs" role="tablist" aria-label="${t(T.language)}"><button role="tab" id="tab-py" type="button" aria-selected="${tab==="py"}">Python</button><button role="tab" id="tab-dart" type="button" aria-selected="${tab==="dart"}">Dart</button></div><div id="pane"></div></div>`;
  const pane = $("#pane");
  const pre = c.data ? (py, ns) => { ns.set("_csv", toCSV(dataOf(l), l.apply.cols)); py.runPython("import pandas as pd, io\ndf = pd.read_csv(io.StringIO(_csv))\ndel _csv", {globals: ns}); } : null;
  if (tab === "py") { codeCell(pane, key, localize(c.py), c.pkgs || ["numpy"], pre, (r, src) => judgeWith(c, r, src), c.sol, key, st.xp); solutionBox(pane, localize(c.py), c.sol, key + ":" + S.lang); }
  else {
    const dart = localize(c.dart);
    pane.appendChild(el(`<div class="cellbox"><pre id="dartcode" style="border-radius:0 8px 8px 8px">${esc(dart)}</pre>
      <div class="controls"><button class="btn" type="button" id="copydart">${t(T.copyDart)}</button><a href="https://dartpad.dev/" target="_blank" rel="noopener">${t(T.openDart)}</a><span class="status" id="copyst" role="status">${t(T.dartNote)}</span></div>
      <p class="caption">${t(T.dartSame)}</p></div>`));
    $("#copydart").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(dart); $("#copyst").textContent = t(T.copied); }
      catch(e) { const r=document.createRange(); r.selectNodeContents($("#dartcode")); const sel=getSelection(); sel.removeAllRanges(); sel.addRange(r); $("#copyst").textContent = t(T.selected); }
    });
  }
  $("#tab-py").addEventListener("click", () => { codeTab[l.id]="py"; stepCode(root, l, key, st); });
  $("#tab-dart").addEventListener("click", () => { codeTab[l.id]="dart"; stepCode(root, l, key, st); });
}

function stepQ(root, l, key, st){
  const q = l.qs[st.i];
  root.innerHTML = `<p class="eyebrow">${t(T.qOf(st.i+1, l.qs.length))} · ${t(T.kinds[q.kind])}</p><h2>${t(q.title)}</h2>
    <div class="prose">${q.body ? t(q.body) : ""}${q.code ? `<pre>${esc(localize(q.code))}</pre>` : ""}</div><div id="qbox"></div>`;
  const opts = q.opts.map(o => q.kind === "predict" && typeof o.t === "string" ? Object.assign({}, o, {t:`<code>${esc(o.t)}</code>`}) : o);
  choices($("#qbox"), key, t(q.legend || T.whatPrints), opts, st.xp);
}

/* ---------- datasets for Apply ---------- */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let x=Math.imul(a^a>>>15,1|a);x=x+Math.imul(x^x>>>7,61|x)^x;return((x^x>>>14)>>>0)/4294967296;};}
function RNG(seed){
  const u = mulberry32(seed);
  const r = { u, n: () => Math.sqrt(-2*Math.log(1-u()))*Math.cos(2*Math.PI*u()), int: (a,b) => a + Math.floor(u()*(b-a+1)),
    pick: (arr, w) => { if (!w) return arr[Math.floor(u()*arr.length)]; let x = u(); for (let i=0;i<arr.length;i++){ if (x < w[i]) return arr[i]; x -= w[i]; } return arr[arr.length-1]; },
    shuffle: (arr) => { for (let i=arr.length-1;i>0;i--){ const j=Math.floor(u()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; } };
  return r;
}
const pad = (i, n=4) => String(i).padStart(n, "0");
const dataCache = {};
function dataOf(l){ if (!dataCache[l.id]) dataCache[l.id] = l.apply.gen(RNG(l.apply.seed || 1)); return dataCache[l.id]; }
window.dataOf = dataOf;
const cellStr = (v) => v === true ? "True" : v === false ? "False" : v;
function toCSV(rows, cols){ return cols.join(",") + "\n" + rows.map(r => cols.map(c => cellStr(r[c])).join(",")).join("\n"); }
function stepApply(root, l, key, st){
  const a = l.apply, rows = dataOf(l), cols = a.cols, show = a.show || 6;
  root.innerHTML = `<p class="eyebrow">${t(T.applyEy)}</p><h2>${t(a.title)}</h2><div class="prose">${t(a.body)}</div>
  <div class="tablewrap" tabindex="0" role="region" aria-label="df"><table><thead><tr>${cols.map(c=>`<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>${rows.slice(0,show).map(r=>`<tr>${cols.map(c=>`<td>${cellStr(r[c])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
  <p class="caption">${t(T.firstRows(show, num(rows.length)))}</p>
  <div class="prose"><p><b>${t(T.task)}</b> ${t(a.task)}</p></div><div id="apane"></div>
  <details><summary>${t(T.hint)}</summary><div class="prose" style="margin-top:10px"><p>${t(a.hint)}</p></div></details><div id="asol"></div>${a.extra ? `<div id="aextra"></div>` : ""}`;
  codeCell($("#apane"), key, localize(a.py), a.pkgs || ["numpy","pandas"],
    (py, ns) => { ns.set("_csv", toCSV(rows, cols)); py.runPython("import pandas as pd, io\ndf = pd.read_csv(io.StringIO(_csv))\ndel _csv", {globals: ns}); },
    (r, src) => judgeWith(a, r, src, true), a.sol, key, st.xp);
  solutionBox($("#asol"), localize(a.py), a.sol, key + ":" + S.lang);
  if (a.extra) a.extra($("#aextra"), l);
}

function stepRecap(root, l, key, st){
  const r = l.recap;
  root.innerHTML = `<p class="eyebrow">${t(T.recapEy)}</p><h2>${t(T.recapH)}</h2>
  <ul class="take">${r.takes.map(x => `<li>${t(x)}</li>`).join("")}</ul>
  <h3>${t(T.formulaH)}</h3><div class="formula">${t(r.f)}</div>
  <p class="caption">${t(r.read)} ${t(T.symNote)}</p>
  <ul class="symlist">${r.syms.map(s => `<li><button class="sym" type="button" data-g="${s.g}">${s.s}</button><span>${t(s.d)}</span></li>`).join("")}</ul>
  ${r.next ? `<div class="note"><b>${t(T.nextUp)}</b> ${t(r.next)}</div>` : ""}
  <h3>${t(T.deeper)}</h3><ul class="take">${r.deeper.map(d => `<li><a href="${t(d.u)}" target="_blank" rel="noopener">${t(d.t)}</a>${d.d ? ": " + t(d.d) : ""}</li>`).join("")}</ul>
  <p class="caption">${t(S.earned[key] ? T.lessonDone : T.bank)}</p>`;
  const steps = stepsOf(l), miss = missingOf(l).filter(s => s.id !== "recap");
  if (miss.length) root.appendChild(el(`<div class="note" id="missed"><b>${t(T.missedH)}</b> ${miss.map(s => `<a href="#${l.id}-${s.id}">${stepName(l, s)}</a>`).join(" · ")}<br>${t(T.missedNote)}</div>`));
  $$(".sym[data-g]", root).forEach(b => b.addEventListener("click", () => go(l, steps.findIndex(s => s.id === b.dataset.g), "#widget")));
}

/* ---------- shared links for "Go deeper" ---------- */
const ST = (ch) => [`https://seeing-theory.brown.edu/${ch}/index.html`, `https://seeing-theory.brown.edu/${ch}/es.html`];
const SRC = {
  st: (ch, en, es) => ({u: ST(ch), t: ["Seeing Theory: " + en, "Seeing Theory: " + es], d: ["interactive visuals from Brown University", "visualizaciones interactivas de la Universidad de Brown"]}),
  rp: {u: "https://realpython.com/start/data-science-analytics/", t: ["Real Python, data science path", "Real Python, ruta de ciencia de datos"], d: ["NumPy and pandas idioms used in the code cells", "los modismos de NumPy y pandas de las celdas de código"]},
  ax: {u: "https://arxiv.org/html/2412.10331v1", t: ["Applied Statistics in the Era of Artificial Intelligence (arXiv 2412.10331)", "Applied Statistics in the Era of Artificial Intelligence (arXiv 2412.10331)"], d: ["uncertainty, AI assurance, out-of-distribution detection and imbalanced-class metrics", "incertidumbre, garantías de IA, detección fuera de distribución y métricas con clases desbalanceadas"]},
  ca: {u: "https://academy.claude.com/use-cases/verify-statistics-from-raw-data", t: ["Claude Academy: verify statistics from raw data", "Claude Academy: verificar estadísticas a partir de los datos en bruto"], d: ["the audit workflow this capstone follows", "el flujo de auditoría que sigue este proyecto final"]}
};

/* ---------- router ---------- */
function route(){
  clearTimers();
  const h = (location.hash || "#map").slice(1);
  if (h === "glossary") return renderGlossary();
  const m = h.match(/^([bia]\d)(?:-(\w+))?$/);
  if (m && LESSONS[m[1]]) {
    const l = LESSONS[m[1]];
    if (m[2]) { const k = stepsOf(l).findIndex(s => s.id === m[2]); if (k >= 0) { S.pos[l.id] = k; save(); } }
    const f = pendingFlash; pendingFlash = null;
    return renderLesson(l, f);
  }
  renderMap();
}
function boot(){ applyTheme(); window.addEventListener("hashchange", route); route(); }

/* ---------- helpers shared by widgets ---------- */
const sliderH = (id, label, min, max, step, val) => `<div class="slider"><label for="${id}">${label} <output id="${id}-o"></output></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`;
const readsH = (arr) => arr.map(([k,v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
function niceTop(v){ v = Math.max(v,4); for (let e=1;;e*=10) for (const s of [1,2,5]) if (s*e*4 >= v) return s*e*4; }
const Phi = (z) => { const k = 1/(1+0.2316419*Math.abs(z)); const d = 0.3989423*Math.exp(-z*z/2); const p = d*k*(0.3193815+k*(-0.3565638+k*(1.781478+k*(-1.821256+k*1.330274)))); return z > 0 ? 1-p : p; };
const npdf = (x, m, s) => Math.exp(-0.5*((x-m)/s)**2)/(s*Math.sqrt(2*Math.PI));
/* chart builder: returns helpers that append SVG and scale data to pixels */
function Chart(o){
  const Wd=o.w||640, H=o.h||300, l=o.l||50, r=o.r||16, tp=o.t||28, b=o.b||46, pw=Wd-l-r, ph=H-tp-b;
  const xs = o.xs || (v => (v-o.x[0])/(o.x[1]-o.x[0]));
  const x = v => l + xs(v)*pw, y = v => tp + ph - (clamp(v,o.y[0],o.y[1])-o.y[0])/(o.y[1]-o.y[0])*ph;
  let s = `<svg class="chart ${o.cls||""}" ${o.id?`id="${o.id}"`:""} viewBox="0 0 ${Wd} ${H}" role="img" aria-label="${esc(o.aria||"")}">`;
  (o.yt||[]).forEach((v,i) => { const [val,lab] = Array.isArray(v) ? v : [v, o.yf ? o.yf(v) : v]; s += `<line class="${val===o.y[0]?"axis":"grid"}" x1="${l}" x2="${Wd-r}" y1="${y(val)}" y2="${y(val)}"/><text x="${l-6}" y="${y(val)+4}" text-anchor="end">${lab}</text>`; });
  (o.xt||[]).forEach(v => { const [val,lab] = Array.isArray(v) ? v : [v, o.xf ? o.xf(v) : v]; s += `<line class="axis" x1="${x(val)}" x2="${x(val)}" y1="${tp+ph}" y2="${tp+ph+5}"/><text x="${x(val)}" y="${tp+ph+19}" text-anchor="middle">${lab}</text>`; });
  s += `<line class="axis" x1="${l}" x2="${Wd-r}" y1="${tp+ph}" y2="${tp+ph}"/>`;
  if (o.xl) s += `<text x="${l+pw/2}" y="${H-6}" text-anchor="middle">${o.xl}</text>`;
  if (o.yl) s += `<text transform="translate(13 ${tp+ph/2}) rotate(-90)" text-anchor="middle">${o.yl}</text>`;
  const c = { x, y, l, t:tp, pw, ph, W:Wd, H, r,
    add(z){ s += z; return c; },
    bar(x0, x1, v, cls="bar", v0=o.y[0]){ const a=x(x0), bb=x(x1), top=y(v), bot=y(v0); if (v > v0) s += `<rect class="${cls}" x="${(a+0.8).toFixed(1)}" y="${top.toFixed(1)}" width="${Math.max(1,bb-a-1.6).toFixed(1)}" height="${(bot-top).toFixed(1)}" rx="2"/>`; return c; },
    line(pts, cls="l1"){ s += `<polyline class="${cls}" points="${pts.map(p => x(p[0]).toFixed(1)+","+y(p[1]).toFixed(1)).join(" ")}"/>`; return c; },
    area(pts, cls="a1"){ if (!pts.length) return c; s += `<polygon class="${cls}" points="${x(pts[0][0]).toFixed(1)},${y(o.y[0])} ${pts.map(p => x(p[0]).toFixed(1)+","+y(p[1]).toFixed(1)).join(" ")} ${x(pts[pts.length-1][0]).toFixed(1)},${y(o.y[0])}"/>`; return c; },
    vline(v, label, cls="truth", lcls="truthlabel", dy=0){ const px=x(v); s += `<line class="${cls}" x1="${px}" x2="${px}" y1="${tp-4+dy}" y2="${tp+ph}"/>`; if (label) s += `<text class="${lcls}" x="${clamp(px, l+40, Wd-r-40)}" y="${tp-9+dy}" text-anchor="middle">${label}</text>`; return c; },
    hline(v, label, cls="truth", lcls="truthlabel"){ const py=y(v); s += `<line class="${cls}" x1="${l}" x2="${Wd-r}" y1="${py}" y2="${py}"/>`; if (label) s += `<text class="${lcls}" x="${Wd-r}" y="${py-6}" text-anchor="end">${label}</text>`; return c; },
    dot(xv, yv, cls="d1", rad=4){ s += `<circle class="${cls}" cx="${x(xv).toFixed(1)}" cy="${y(yv).toFixed(1)}" r="${rad}"/>`; return c; },
    text(xv, yv, str, cls="", anchor="middle"){ s += `<text class="${cls}" x="${x(xv)}" y="${y(yv)}" text-anchor="${anchor}">${str}</text>`; return c; },
    title(str){ s += `<text class="truthlabel" x="${Wd-r}" y="${tp-12}" text-anchor="end">${str}</text>`; return c; },
    end(){ return s + "</svg>"; } };
  return c;
}
/* pointer drag on a persistent box holding a chart: calls fn(fx, fy) with fractions of the plot area */
function dragOn(box, getC, fn){
  const at = (e) => { const svg = box.querySelector("svg"), c = getC(); if (!svg || !c) return; const r = svg.getBoundingClientRect(), sx = c.W/r.width, sy = c.H/r.height; fn(clamp(((e.clientX-r.left)*sx - c.l)/c.pw, 0, 1), clamp(1 - ((e.clientY-r.top)*sy - c.t)/c.ph, 0, 1)); };
  box.style.touchAction = "none";
  box.addEventListener("pointerdown", e => { try { box.setPointerCapture(e.pointerId); } catch(x) {} box._d = 1; at(e); });
  box.addEventListener("pointermove", e => { if (box._d) at(e); });
  box.addEventListener("pointerup", () => { box._d = 0; }); box.addEventListener("pointercancel", () => { box._d = 0; });
}
const ticks = (a, b, step) => { const o=[]; for (let v=a; v<=b+1e-9; v+=step) o.push(+v.toFixed(6)); return o; };
