"use strict";
/* Widgets for the Advanced track. */
const betaGrid = (a, b) => { const xs = [], d = []; let mx = -Infinity; for (let i=0;i<400;i++){ const x = (i+.5)/400; xs.push(x); const v = (a-1)*Math.log(x)+(b-1)*Math.log(1-x); d.push(v); if (v > mx) mx = v; } let z = 0; const p = d.map(v => { const e = Math.exp(v-mx); z += e; return e; }); const cdf = []; let acc = 0; p.forEach(v => { acc += v/z; cdf.push(acc); }); const q = (u) => xs[Math.max(0, cdf.findIndex(v => v >= u))] ; return {xs, p, cdf, q, above: (x) => 1-cdf[clamp(Math.round(x*400-.5),0,399)]}; };
const gammaS = (k) => { const d = k-1/3, cc = 1/Math.sqrt(9*d); for (;;) { let x, v; do { x = randn(); v = 1+cc*x; } while (v <= 0); v = v*v*v; const u = Math.random(); if (Math.log(u) < 0.5*x*x+d-d*v+d*Math.log(v)) return d*v; } };
const betaS = (a, b) => { const x = gammaS(a), y = gammaS(b); return x/(x+y); };

/* ---------- A1 ---------- */
W.beta = (root, c) => {
  const s = c.state({pm:50, pk:2, pass:0, fail:0, mp:0});
  root.innerHTML = `<div class="controls">${sliderH("w-m", t(["Your hunch before any data: pass rate","Tu corazonada antes de ver datos: tasa de aciertos"]), 10, 90, 5, s.pm)}${sliderH("w-k", t(["How strongly you hold it","Con cuánta fuerza la sostienes"]), 2, 60, 2, s.pk)}</div>
    <div class="controls">${btnH("w-p", t(["+1 pass","+1 acierto"]))}${btnH("w-f", t(["+1 fail","+1 fallo"]))}${btnH("w-20", t(["Run 20 more cases","Ejecutar 20 casos más"]), 1)}${btnH("w-r", t(["Clear the data","Borrar los datos"]))}</div>
    <div id="w-ch"></div><div class="legend"><span><i style="border-top:2px dashed var(--muted);height:0;width:16px;border-radius:0"></i>${t(["prior: belief before the data","prior: creencia antes de los datos"])}</span>${lg("k1", t(["posterior: belief after the data (shaded: 95% most plausible)","posterior: creencia tras los datos (sombreado: 95 % más plausible)"]))}</div><dl class="readouts" id="w-rd"></dl>`;
  const paint = () => {
    const a0 = s.pm/100*s.pk, b0 = (1-s.pm/100)*s.pk, a = a0+s.pass, b = b0+s.fail, pr = betaGrid(Math.max(a0,1.0001), Math.max(b0,1.0001)), po = betaGrid(Math.max(a,1.0001), Math.max(b,1.0001));
    setT("w-m-o", pc(s.pm/100)); setT("w-k-o", t([`worth ${s.pk} cases`,`equivale a ${s.pk} casos`]));
    const lo = po.q(.025), hi = po.q(.975);
    const ch = Chart({x:[0,1], y:[0,1.1], xt:[0,.2,.4,.6,.8,1], xf:v=>pc(v), xl:t(["Possible true pass rate","Posible tasa real de aciertos"]), yl:t(["Plausibility","Plausibilidad"]), aria:t(["Prior and posterior belief curves","Curvas de creencia: prior y posterior"])});
    ch.area(po.xs.map((x,i)=>[x,po.p[i]]).filter(p => p[0] >= lo && p[0] <= hi)).line(pr.xs.map((x,i)=>[x,pr.p[i]]),"l4").line(po.xs.map((x,i)=>[x,po.p[i]]));
    g("w-ch").innerHTML = ch.end();
    g("w-rd").innerHTML = readsH([[t(["Data so far","Datos hasta ahora"]), t([`${s.pass} passes, ${s.fail} fails`,`${s.pass} aciertos, ${s.fail} fallos`])], [t(["Best estimate (posterior mean)","Mejor estimación (media posterior)"]), pc(a/(a+b),1)], [t(["95% credible interval","Intervalo creíble del 95 %"]), pc(lo)+" – "+pc(hi)], [t(["Chance the rate is above 75%","Probabilidad de que supere el 75 %"]), pc(po.above(.75))]]);
    if (s.mp && s.pass+s.fail >= 20) c.done();
  };
  g("w-m").oninput = (e) => { s.pm = +e.target.value; s.mp = 1; paint(); }; g("w-k").oninput = (e) => { s.pk = +e.target.value; s.mp = 1; paint(); };
  g("w-p").onclick = () => { s.pass++; paint(); }; g("w-f").onclick = () => { s.fail++; paint(); };
  g("w-20").onclick = () => { for (let i=0;i<20;i++) Math.random() < 0.8 ? s.pass++ : s.fail++; paint(); };
  g("w-r").onclick = () => { s.pass = 0; s.fail = 0; paint(); };
  paint();
};

/* ---------- A2 ---------- */
W.multi = (root, c) => {
  const NS = [20,50,100,200,500];
  const s = c.state({k:20, ni:2, scores:null, hold:null, T:0, sw:0, sh:0});
  const reset = () => Object.assign(s, {scores:null, hold:null, T:0, sw:0, sh:0});
  root.innerHTML = `<div class="controls">${sliderH("w-k", t(["Prompt variants in the bake-off","Variantes de prompt en la comparativa"]), 2, 50, 1, s.k)}${sliderH("w-n", t(["Eval cases per variant","Casos de eval por variante"]), 0, NS.length-1, 1, s.ni)}</div>
    <div class="controls">${btnH("w-1", t(["Run the bake-off","Ejecutar la comparativa"]))}${btnH("w-100", t(["Run it 100 times","Ejecutarla 100 veces"]), 1)}${btnH("w-r", t(["Clear","Borrar"]))}</div>
    <div id="w-ch"></div><div class="legend">${lg("k1", t(["each variant's score","puntuación de cada variante"]))}${lg("k3", t(["the “winner”","la «ganadora»"]))}${lg("k2", t(["the winner retested on fresh cases","la ganadora, reevaluada con casos nuevos"]))}</div><dl class="readouts" id="w-rd"></dl>`;
  const run = () => { const n = NS[s.ni]; s.scores = Array.from({length:s.k}, () => binom(n,.7)/n); s.hold = binom(n,.7)/n; s.T++; s.sw += Math.max(...s.scores); s.sh += s.hold; };
  const paint = () => {
    setT("w-k-o", s.k); setT("w-n-o", num(NS[s.ni]));
    const ch = Chart({x:[0,s.k], y:[.4,1], yt:[.4,.55,.7,.85,1], yf:v=>pc(v), xl:t(["Prompt variants (every one has a true pass rate of 70%)","Variantes de prompt (todas tienen una tasa real de aciertos del 70 %)"]), yl:t(["Eval score","Puntuación"]), aria:t(["Scores of identical prompt variants; the best one is highlighted","Puntuaciones de variantes idénticas; la mejor está resaltada"])});
    ch.hline(.7, t(["true pass rate 70%","tasa real 70 %"]));
    if (s.scores) { const w = s.scores.indexOf(Math.max(...s.scores)); s.scores.forEach((v,i) => ch.bar(i+.12, i+.88, v, i===w?"b3":"bar", .4)); ch.dot(w+.5, s.hold, "d2", 7); }
    g("w-ch").innerHTML = ch.end();
    g("w-rd").innerHTML = readsH([[t(["Bake-offs run","Comparativas ejecutadas"]), num(s.T)], [t(["Average winner score","Puntuación media de la ganadora"]), s.T ? pc(s.sw/s.T,1) : "–"], [t(["Average winner score on fresh cases","Media de la ganadora con casos nuevos"]), s.T ? pc(s.sh/s.T,1) : "–"]]);
    if (s.T >= 100) c.done();
  };
  g("w-1").onclick = () => { run(); paint(); }; g("w-100").onclick = () => { for (let i=0;i<100;i++) run(); paint(); }; g("w-r").onclick = () => { reset(); paint(); };
  g("w-k").oninput = (e) => { s.k = +e.target.value; reset(); paint(); }; g("w-n").oninput = (e) => { s.ni = +e.target.value; reset(); paint(); };
  paint();
};

/* ---------- A3 ---------- */
W.calib = (root, c) => {
  const s = c.state({k:1, hi:0, lo:0});
  if (!s.p) { const r = RNG(22); s.p = Array.from({length:3000}, () => .5+.5*r.u()); s.o = s.p.map(p => r.u() < p ? 1 : 0); }
  root.innerHTML = `<div class="controls">${sliderH("w-k", t(["Confidence dial","Dial de confianza"]), 0.4, 3, 0.1, s.k)}</div><div id="w-ch"></div>
    <div class="legend">${lg("k1", t(["how often answers in that confidence band are right","cuántas veces aciertan las respuestas de esa franja de confianza"]))}<span><i style="border-top:2px dashed var(--muted);height:0;width:16px;border-radius:0"></i>${t(["perfect calibration","calibración perfecta"])}</span></div><dl class="readouts" id="w-rd"></dl>`;
  const paint = () => {
    setT("w-k-o", s.k < .95 ? t(["underconfident","poco confiado"]) : s.k > 1.05 ? t(["overconfident","demasiado confiado"]) : t(["calibrated","calibrado"]));
    const conf = s.p.map(p => { const l = Math.log(p/(1-p))*s.k; return 1/(1+Math.exp(-l)); });
    const bins = Array.from({length:5}, () => ({n:0, c:0, o:0})); let brier = 0, sc = 0, so = 0;
    conf.forEach((cf,i) => { const b = bins[clamp(Math.floor((cf-.5)/.1), 0, 4)]; b.n++; b.c += cf; b.o += s.o[i]; brier += (cf-s.o[i])**2; sc += cf; so += s.o[i]; });
    const ece = bins.reduce((a,b) => a + (b.n ? Math.abs(b.o/b.n-b.c/b.n)*b.n/3000 : 0), 0);
    const ch = Chart({h:320, x:[.5,1], y:[.5,1], yt:[.5,.6,.7,.8,.9,1], yf:v=>pc(v), xt:[.5,.6,.7,.8,.9,1], xf:v=>pc(v), xl:t(["Confidence the model states","Confianza que declara el modelo"]), yl:t(["How often it is right","Cuántas veces acierta"]), aria:t(["Calibration curve","Curva de calibración"])});
    bins.forEach((b,i) => { if (b.n >= 5) { ch.bar(.5+i*.1+.01, .6+i*.1-.01, b.o/b.n, "bar", .5); } });
    ch.line([[.5,.5],[1,1]], "l4");
    g("w-ch").innerHTML = ch.end();
    g("w-rd").innerHTML = readsH([[t(["Average stated confidence","Confianza media declarada"]), pc(sc/3000,1)], [t(["Actual accuracy","Acierto real"]), pc(so/3000,1)], [t(["Calibration gap (ECE)","Brecha de calibración (ECE)"]), num(ece*100,1)+" "+t(["points","puntos"])], [t(["Brier score (lower is better)","Puntuación de Brier (menor es mejor)"]), num(brier/3000,3)]]);
    if (s.k >= 2) s.hi = 1; if (s.k <= .6) s.lo = 1; if (s.hi && s.lo) c.done();
  };
  g("w-k").oninput = (e) => { s.k = +e.target.value; paint(); };
  paint();
};

/* ---------- A4 ---------- */
W.chain = (root, c) => {
  const s = c.state({p:95, steps:20, retry:0, alive:null, mr:0, ran:0});
  root.innerHTML = `<div class="controls">${sliderH("w-p", t(["Success rate of one step","Tasa de éxito de un paso"]), 80, 99.9, 0.1, s.p)}${sliderH("w-s", t(["Steps in the task","Pasos de la tarea"]), 1, 40, 1, s.steps)}${sliderH("w-t", t(["Retries allowed per step","Reintentos permitidos por paso"]), 0, 3, 1, s.retry)}</div>
    <div class="bigstat" id="w-big"></div><div id="w-ch"></div><div class="controls">${btnH("w-sim", t(["Run 200 agents","Ejecutar 200 agentes"]), 1)}<span class="status" id="w-st"></span></div>`;
  const eff = () => 1-Math.pow(1-s.p/100, s.retry+1);
  const paint = () => {
    const e = eff(), tot = Math.pow(e, s.steps); setT("w-p-o", pc(s.p/100,1)); setT("w-s-o", s.steps); setT("w-t-o", s.retry);
    g("w-big").innerHTML = `${pc(tot,1)}<small>${t([`of tasks finish all ${s.steps} steps. One step works ${pc(e,2)} of the time${s.retry?" with retries":""}.`,`de las tareas completan los ${s.steps} pasos. Un paso funciona el ${pc(e,2)} de las veces${s.retry?" con reintentos":""}.`])}</small>`;
    const ch = Chart({x:[0,40], y:[0,1], yt:[0,.25,.5,.75,1], yf:v=>pc(v), xt:[0,10,20,30,40], xl:t(["Steps completed","Pasos completados"]), yl:t(["Agents still on track","Agentes que siguen en pie"]), aria:t(["Share of agents surviving each step","Proporción de agentes que supera cada paso"])});
    ch.line(ticks(0,40,1).map(n => [n, Math.pow(e,n)])).dot(s.steps, tot, "d1", 6);
    if (s.alive) s.alive.forEach((v,n) => ch.dot(n, v/200, "d3", 3));
    g("w-ch").innerHTML = ch.end();
    setT("w-st", s.alive ? t([`${s.alive[s.alive.length-1]} of 200 simulated agents finished (orange dots).`,`${s.alive[s.alive.length-1]} de 200 agentes simulados terminaron (puntos naranjas).`]) : "");
    if (s.mr && s.ran) c.done();
  };
  g("w-p").oninput = (e) => { s.p = +e.target.value; s.alive = null; paint(); }; g("w-s").oninput = (e) => { s.steps = +e.target.value; s.alive = null; paint(); };
  g("w-t").oninput = (e) => { s.retry = +e.target.value; s.mr = 1; s.alive = null; paint(); };
  g("w-sim").onclick = () => { const e = eff(), a = new Array(s.steps+1).fill(0); for (let i=0;i<200;i++){ let n = 0; while (n < s.steps && Math.random() < e) n++; for (let j=0;j<=n;j++) a[j]++; } s.alive = a; s.ran = 1; paint(); };
  paint();
};

W.vote = (root, c) => {
  const s = c.state({p:70, k:5, rho:0, mk:0, mr:0});
  const maj = (p, k) => { let tot = 0, cmb = 1; for (let j=0;j<=k;j++){ if (j > k/2) tot += cmb*Math.pow(p,j)*Math.pow(1-p,k-j); cmb = cmb*(k-j)/(j+1); } return tot; };
  root.innerHTML = `<div class="controls">${sliderH("w-p", t(["Accuracy of a single call","Acierto de una sola llamada"]), 40, 95, 1, s.p)}${sliderH("w-k", t(["Calls that vote","Llamadas que votan"]), 1, 25, 2, s.k)}${sliderH("w-r", t(["Mistakes shared by all calls","Errores compartidos por todas las llamadas"]), 0, 100, 5, s.rho)}</div>
    <div id="w-ch"></div><dl class="readouts" id="w-rd"></dl>`;
  const paint = () => {
    const p = s.p/100, rho = s.rho/100, acc = (k) => rho*p+(1-rho)*maj(p,k); setT("w-p-o", pc(p)); setT("w-k-o", s.k); setT("w-r-o", pc(rho));
    const ch = Chart({x:[0,26], y:[.2,1], yt:[.2,.4,.6,.8,1], yf:v=>pc(v), xt:[1,5,9,13,17,21,25], xl:t(["Number of calls voting (majority wins)","Número de llamadas que votan (gana la mayoría)"]), yl:t(["Accuracy of the vote","Acierto del voto"]), aria:t(["Accuracy of majority vote by number of calls","Acierto del voto mayoritario según el número de llamadas"])});
    ch.hline(p, t(["single call","una sola llamada"])+" "+pc(p)); const pts = ticks(1,25,2).map(k => [k, acc(k)]); ch.line(pts); pts.forEach(q => ch.dot(q[0], q[1], q[0]===s.k ? "d3" : "d1", q[0]===s.k ? 7 : 3));
    g("w-ch").innerHTML = ch.end();
    const v = acc(s.k);
    g("w-rd").innerHTML = readsH([[t(["Single call","Una llamada"]), pc(p,1)], [t([`Majority of ${s.k}`,`Mayoría de ${s.k}`]), pc(v,1)], [t(["Change from voting","Cambio por votar"]), (v>=p?"+":"−")+num(Math.abs(v-p)*100,1)+" "+t(["points","puntos"])]]);
    if (s.mk && s.mr) c.done();
  };
  g("w-p").oninput = (e) => { s.p = +e.target.value; paint(); }; g("w-k").oninput = (e) => { s.k = +e.target.value; s.mk = 1; paint(); }; g("w-r").oninput = (e) => { s.rho = +e.target.value; s.mr = 1; paint(); };
  paint();
};

/* ---------- A5 ---------- */
W.bandit = (root, c) => {
  const TR = [.62,.70,.78], NM = ["A","B","C"];
  const s = c.state({ok:[0,0,0], ko:[0,0,0], show:false});
  root.innerHTML = `<div class="controls">${btnH("w-1", t(["Route 1 request","Enrutar 1 petición"]))}${btnH("w-10", t(["Route 10","Enrutar 10"]))}${btnH("w-200", t(["Route 200","Enrutar 200"]), 1)}${btnH("w-r", t(["Start over","Empezar de nuevo"]))}<label><input type="checkbox" id="w-s"> ${t(["Reveal the true pass rates","Mostrar las tasas reales"])}</label></div>
    <div id="w-ch"></div><div class="legend">${lg("k1","Prompt A")}${lg("k2","Prompt B")}${lg("k3","Prompt C")}</div>
    <div class="tablewrap"><table id="w-tb"></table></div><p class="caption" id="w-cap"></p>`;
  g("w-s").checked = s.show;
  const paint = () => {
    const ch = Chart({x:[.3,1], y:[0,1.1], xt:[.3,.4,.5,.6,.7,.8,.9,1], xf:v=>pc(v), xl:t(["Possible true pass rate","Posible tasa real de aciertos"]), yl:t(["Belief","Creencia"]), aria:t(["Belief curves for three prompts","Curvas de creencia de tres prompts"])});
    [0,1,2].forEach(i => { const b = betaGrid(1.0001+s.ok[i], 1.0001+s.ko[i]); ch.line(b.xs.map((x,j)=>[x,b.p[j]]).filter(q => q[0] >= .3), "l"+(i+1)); if (s.show) ch.vline(TR[i], NM[i]+" "+pc(TR[i]), "v"+(i+1), "lab"+(i+1), -i*13); });
    g("w-ch").innerHTML = ch.end().replace('viewBox="0 0 640 300"', 'viewBox="0 -30 640 330"');
    const n = s.ok.map((v,i) => v+s.ko[i]), N = n[0]+n[1]+n[2], P = s.ok[0]+s.ok[1]+s.ok[2];
    g("w-tb").innerHTML = `<thead><tr><th scope="col">Prompt</th><th scope="col">${t(["Requests sent","Peticiones enviadas"])}</th><th scope="col">${t(["Share of traffic","Parte del tráfico"])}</th><th scope="col">${t(["Observed pass rate","Tasa de aciertos observada"])}</th></tr></thead><tbody>` + [0,1,2].map(i => `<tr><td>${NM[i]}</td><td>${num(n[i])}</td><td>${N ? pc(n[i]/N) : "–"}</td><td>${n[i] ? pc(s.ok[i]/n[i],1) : "–"}</td></tr>`).join("") + "</tbody>";
    setT("w-cap", N ? t([`${num(N)} requests routed, ${pc(P/N,1)} passed. An even three-way split would pass about 70%.`,`${num(N)} peticiones enrutadas, pasa el ${pc(P/N,1)}. Un reparto a partes iguales pasaría alrededor del 70 %.`]) : t(["No requests yet. Each curve is flat: you know nothing about any prompt.","Aún no hay peticiones. Cada curva es plana: no sabes nada de ningún prompt."]));
    if (N >= 400) c.done();
  };
  const route = (k) => { for (let j=0;j<k;j++){ let best = 0, bv = -1; for (let i=0;i<3;i++){ const v = betaS(1+s.ok[i], 1+s.ko[i]); if (v > bv) { bv = v; best = i; } } Math.random() < TR[best] ? s.ok[best]++ : s.ko[best]++; } paint(); };
  g("w-1").onclick = () => route(1); g("w-10").onclick = () => route(10); g("w-200").onclick = () => route(200);
  g("w-r").onclick = () => { s.ok = [0,0,0]; s.ko = [0,0,0]; paint(); }; g("w-s").onchange = (e) => { s.show = e.target.checked; paint(); };
  paint();
};

/* ---------- A6 ---------- */
W.cosine = (root, c) => {
  const s = c.state({a1:20, a2:65, len:1, ma:0, ml:0});
  let cur = null;
  root.innerHTML = `<div class="controls">${sliderH("w-a", t(["Direction of the query","Dirección de la consulta"]), 0, 180, 1, s.a1)}${sliderH("w-b", t(["Direction of the document","Dirección del documento"]), 0, 180, 1, s.a2)}${sliderH("w-l", t(["Length of the document vector","Longitud del vector del documento"]), 0.3, 2, 0.1, s.len)}</div>
    <div id="w-box" class="chart dragxy"></div><div class="legend">${lg("k1", t(["query embedding","embedding de la consulta"]))}${lg("k3", t(["document embedding (drag either arrow tip)","embedding del documento (arrastra la punta de cualquier flecha)"]))}</div><dl class="readouts" id="w-rd"></dl>`;
  const rad = (d) => d*Math.PI/180;
  const paint = () => {
    setT("w-a-o", s.a1+"°"); setT("w-b-o", s.a2+"°"); setT("w-l-o", num(s.len,1));
    const u = [Math.cos(rad(s.a1)), Math.sin(rad(s.a1))], v = [s.len*Math.cos(rad(s.a2)), s.len*Math.sin(rad(s.a2))], cs = Math.cos(rad(s.a2-s.a1));
    const ch = Chart({h:360, l:16, x:[-2.2,2.2], y:[0,2.2], xt:[-2,-1,0,1,2], aria:t(["Two vectors from the origin","Dos vectores desde el origen"])});
    const ln = (p, cls) => ch.add(`<line class="${cls}" x1="${ch.x(0)}" y1="${ch.y(0)}" x2="${ch.x(p[0])}" y2="${ch.y(p[1])}"/>`);
    ln(u, "v1"); ln(v, "v3"); ch.dot(u[0], u[1], "d1", 8).dot(v[0], v[1], "d3", 8);
    cur = ch; g("w-box").innerHTML = ch.end();
    g("w-rd").innerHTML = readsH([[t(["Cosine similarity","Similitud coseno"]), num(cs,2)], [t(["Angle between them","Ángulo entre ellos"]), Math.abs(s.a2-s.a1)+"°"], [t(["Dot product (changes with length)","Producto escalar (cambia con la longitud)"]), num(cs*s.len,2)]]);
    if (s.ma && s.ml) c.done();
  };
  let which = null;
  g("w-box").addEventListener("pointerdown", () => { which = null; });
  dragOn(g("w-box"), () => cur, (fx, fy) => {
    const x = -2.2+fx*4.4, y = fy*2.2, ang = clamp(Math.round(Math.atan2(y, x)*180/Math.PI), 0, 180), d = Math.hypot(x, y);
    if (which == null) { const u = [Math.cos(rad(s.a1)), Math.sin(rad(s.a1))], v = [s.len*Math.cos(rad(s.a2)), s.len*Math.sin(rad(s.a2))]; which = Math.hypot(x-u[0], y-u[1]) < Math.hypot(x-v[0], y-v[1]) ? 1 : 2; }
    if (which === 1) { s.a1 = ang; g("w-a").value = ang; } else { s.a2 = ang; s.len = clamp(Math.round(d*10)/10, .3, 2); g("w-b").value = ang; g("w-l").value = s.len; s.ml = 1; }
    s.ma = 1; paint();
  });
  g("w-a").oninput = (e) => { s.a1 = +e.target.value; s.ma = 1; paint(); }; g("w-b").oninput = (e) => { s.a2 = +e.target.value; s.ma = 1; paint(); }; g("w-l").oninput = (e) => { s.len = +e.target.value; s.ml = 1; paint(); };
  paint();
};

W.drift = (root, c) => {
  const s = c.state({shift:0, nw:0});
  root.innerHTML = `<div class="controls">${sliderH("w-s", t(["All traffic drifts a little","Todo el tráfico se desplaza un poco"]), 0, 2, 0.1, s.shift)}${sliderH("w-n", t(["Share of traffic on a brand-new topic","Parte del tráfico sobre un tema nuevo"]), 0, 50, 1, s.nw)}</div>
    <div class="bigstat" id="w-big"></div><div id="w-ch"></div><div class="legend">${lg("k4", t(["last month (baseline)","mes pasado (referencia)"]))}<span><i style="border:2px solid var(--ink);background:transparent"></i>${t(["this week (production)","esta semana (producción)"])}</span></div><dl class="readouts" id="w-rd"></dl>`;
  const paint = () => {
    setT("w-s-o", num(s.shift,1)); setT("w-n-o", pc(s.nw/100));
    const w = s.nw/100, m2 = .70-s.shift*.08, cdfB = (x) => Phi((x-.70)/.08), cdfP = (x) => (1-w)*Phi((x-m2)/.08)+w*Phi((x-.40)/.07);
    const edges = ticks(.2,1,.05); let psi = 0; const pb = [], pp = [];
    for (let i=0;i<edges.length-1;i++){ const p = Math.max(1e-4, (i===edges.length-2?1:cdfB(edges[i+1]))-(i===0?0:cdfB(edges[i]))), q = Math.max(1e-4, (i===edges.length-2?1:cdfP(edges[i+1]))-(i===0?0:cdfP(edges[i]))); pb.push(p); pp.push(q); psi += (q-p)*Math.log(q/p); }
    const thr = .70-1.645*.08, ood = cdfP(thr), top = .45;
    const ch = Chart({x:[.2,1], y:[0,top], yt:[0,.15,.3,.45], yf:v=>pc(v), xt:[.2,.4,.6,.8,1], xf:v=>num(v,1), xl:t(["Cosine similarity of each request to its nearest known topic","Similitud coseno de cada petición con su tema conocido más cercano"]), yl:t(["Share of requests","Proporción de peticiones"]), aria:t(["Baseline and production distributions of similarity","Distribuciones de similitud: referencia y producción"])});
    pb.forEach((p,i) => ch.bar(edges[i], edges[i+1], p, "b4")); pp.forEach((q,i) => ch.add(`<rect class="ghost" x="${ch.x(edges[i])+2}" y="${ch.y(q)}" width="${ch.x(edges[i+1])-ch.x(edges[i])-4}" height="${ch.y(0)-ch.y(q)}"/>`));
    ch.vline(thr, t(["out-of-distribution below here","fuera de distribución por debajo"]), "v3", "lab3");
    g("w-ch").innerHTML = ch.end();
    const lvl = psi < .1 ? t(["stable","estable"]) : psi < .25 ? t(["watch","vigilar"]) : t(["alert","alerta"]);
    g("w-big").innerHTML = `PSI ${num(psi,2)} · ${lvl}<small>${t(["Population Stability Index: 0 means identical. Rule of thumb: under 0.1 stable, above 0.25 investigate.","Índice de estabilidad de la población: 0 significa idénticas. Regla práctica: menos de 0,1 estable; más de 0,25, investigar."])}</small>`;
    g("w-rd").innerHTML = readsH([[t(["Out-of-distribution requests last month","Peticiones fuera de distribución el mes pasado"]), pc(.05)], [t(["Out-of-distribution requests this week","Peticiones fuera de distribución esta semana"]), pc(ood,1)]]);
    if (psi >= .25) c.done();
  };
  g("w-s").oninput = (e) => { s.shift = +e.target.value; paint(); }; g("w-n").oninput = (e) => { s.nw = +e.target.value; paint(); };
  paint();
};

/* ---------- A7: claim-by-claim audit ---------- */
W.audit = (root, c, a) => {
  const s = c.state({v:{}});
  const rows = dataOf(LESSONS.a7), facts = a.facts(rows);
  root.innerHTML = a.claims.map((cl,i) => `<div class="claim" id="w-c${i}"><blockquote>${fill(t(cl.q), facts)}</blockquote><p class="facts">${t(["From the raw data:","De los datos en bruto:"])} ${fill(t(cl.f), facts)}</p>
    <div class="controls"><button class="btn" type="button" data-i="${i}" data-v="ok">${t(["Holds up","Se sostiene"])}</button><button class="btn" type="button" data-i="${i}" data-v="bad">${t(["Problem","Problema"])}</button></div><div id="w-f${i}" role="status"></div></div>`).join("");
  const show = (i) => { const cl = a.claims[i], v = s.v[i]; if (!v) return; const right = (v === "bad") === cl.bad;
    g("w-f"+i).innerHTML = `<div class="feedback ${right?"good":"bad"}"><strong class="${right?"good":"bad"}">${t(right ? T.correct : T.notQuite)}</strong> ${fill(t(right ? cl.why : cl.hint), facts)}</div>`;
    $$(`#w-c${i} button`).forEach(b => b.setAttribute("aria-pressed", b.dataset.v === v)); };
  $$("button[data-i]", root).forEach(b => b.onclick = () => { s.v[b.dataset.i] = b.dataset.v; show(+b.dataset.i); if (a.claims.every((cl,i) => s.v[i] && (s.v[i] === "bad") === cl.bad)) c.done(); });
  a.claims.forEach((cl,i) => show(i));
  if (a.claims.every((cl,i) => s.v[i] && (s.v[i] === "bad") === cl.bad)) c.done();
};
