"use strict";
/* Interactive widgets. Each one: W.name(root, ctx, params). ctx.state() persists while the page is open; ctx.done() marks the play complete. */
const g = (id) => document.getElementById(id);
const setT = (id, v) => { const e = g(id); if (e) e.textContent = v; };
const btnH = (id, label, primary) => `<button class="btn ${primary?"primary":""}" id="${id}" type="button">${label}</button>`;
const binom = (n, p) => { let k=0; for (let i=0;i<n;i++) if (Math.random()<p) k++; return k; };
const randn = () => Math.sqrt(-2*Math.log(1-Math.random()))*Math.cos(2*Math.PI*Math.random());
const mean = (a) => a.reduce((x,y)=>x+y,0)/a.length;
const quant = (sorted, q) => { const i=(sorted.length-1)*q, lo=Math.floor(i), hi=Math.ceil(i); return sorted[lo]+(sorted[hi]-sorted[lo])*(i-lo); };
const corr = (xs, ys) => { const mx=mean(xs), my=mean(ys); let a=0,b=0,c=0; for (let i=0;i<xs.length;i++){ a+=(xs[i]-mx)*(ys[i]-my); b+=(xs[i]-mx)**2; c+=(ys[i]-my)**2; } return {r:a/Math.sqrt(b*c), slope:a/b, icpt:my-a/b*mx}; };
const lg = (cls, label) => `<span><i class="${cls}"></i>${label}</span>`;

/* ---------- B1 ---------- */
W.coin = (root, c) => {
  const s = c.state({p:50, share:[], heads:0, last:null});
  root.innerHTML = `<div class="controls">${sliderH("w-p", t(["Chance of heads","Probabilidad de cara"]), 10, 90, 5, s.p)}</div>
    <div class="controls">${btnH("w-1", t(["Flip 1","Lanzar 1"]))}${btnH("w-10", t(["Flip 10","Lanzar 10"]))}${btnH("w-100", t(["Flip 100","Lanzar 100"]), 1)}${btnH("w-r", t(["Start over","Empezar de nuevo"]))}</div>
    <div class="bigscore" id="w-big"></div><div id="w-ch"></div><dl class="readouts" id="w-rd"></dl>`;
  const paint = () => {
    const n = s.share.length; setT("w-p-o", pc(s.p/100));
    g("w-big").innerHTML = s.last == null ? `–<small>${t(["flip the coin","lanza la moneda"])}</small>` : `${s.last ? t(["Heads","Cara"]) : t(["Tails","Cruz"])}<small>${t(["last flip","último lanzamiento"])}</small>`;
    const xm = Math.max(100, n), ch = Chart({x:[0,xm], y:[0,1], yt:[0,.25,.5,.75,1], yf:v=>pc(v), xt:ticks(0,xm,xm/5).map(Math.round), xl:t(["Flips so far","Lanzamientos hasta ahora"]), yl:t(["Share of heads","Proporción de caras"]), aria:t(["Running share of heads","Proporción acumulada de caras"])});
    ch.hline(s.p/100, t(["true chance","probabilidad real"])+" "+pc(s.p/100));
    if (n) ch.line(s.share.map((v,i)=>[i+1,v])).dot(n, s.share[n-1]);
    g("w-ch").innerHTML = ch.end();
    g("w-rd").innerHTML = readsH([[t(["Flips","Lanzamientos"]), num(n)], [t(["Heads","Caras"]), num(s.heads)], [t(["Share of heads","Proporción de caras"]), n ? pc(s.heads/n,1) : "–"]]);
    if (n >= 200) c.done();
  };
  const flip = (k) => { for (let i=0;i<k && s.share.length<5000;i++){ s.last = Math.random() < s.p/100; if (s.last) s.heads++; s.share.push(s.heads/(s.share.length+1)); } paint(); };
  g("w-1").onclick = () => flip(1); g("w-10").onclick = () => flip(10); g("w-100").onclick = () => flip(100);
  const reset = () => { s.share = []; s.heads = 0; s.last = null; paint(); };
  g("w-r").onclick = reset; g("w-p").oninput = (e) => { s.p = +e.target.value; reset(); };
  paint();
};

W.tokens = (root, c) => {
  const TOK = ["Sure","Hi","Thanks","Sorry","Hmm"], LOG = [2.0,1.5,1.0,0.2,-0.5];
  const s = c.state({T:1, counts:[0,0,0,0,0], total:0, last:null, seen:{}});
  root.innerHTML = `<p class="caption">${t(["The model is about to write the first word of a support reply. These are its five candidate tokens (a token is a word or piece of a word).","El modelo va a escribir la primera palabra de una respuesta de soporte. Estos son sus cinco tokens candidatos (un token es una palabra o un trozo de palabra)."])}</p>
    <div class="controls">${sliderH("w-t", t(["Temperature","Temperatura"]), 0.1, 2, 0.1, s.T)}</div>
    <div class="controls">${btnH("w-1", t(["Sample 1 token","Muestrear 1 token"]))}${btnH("w-100", t(["Sample 100","Muestrear 100"]), 1)}${btnH("w-r", t(["Clear","Borrar"]))}<span class="status" id="w-last"></span></div>
    <div id="w-ch"></div><div class="legend">${lg("k1", t(["share you sampled","proporción muestreada"]))}<span><i style="border:2px solid var(--ink);background:transparent"></i>${t(["model's probability","probabilidad del modelo"])}</span></div>`;
  const probs = () => { const e = LOG.map(l => Math.exp(l/s.T)), z = e.reduce((a,b)=>a+b); return e.map(v => v/z); };
  const paint = () => {
    const p = probs(); setT("w-t-o", num(s.T,1));
    const ch = Chart({x:[0,5], y:[0,1], yt:[0,.25,.5,.75,1], yf:v=>pc(v), xt:TOK.map((k,i)=>[i+.5, `"${k}" ${pc(p[i])}`]), yl:t(["Probability","Probabilidad"]), aria:t(["Token probabilities and sampled shares","Probabilidades de cada token y proporciones muestreadas"])});
    TOK.forEach((k,i) => { if (s.total) ch.bar(i+.2, i+.8, s.counts[i]/s.total); ch.add(`<rect class="ghost" x="${ch.x(i+.15)}" y="${ch.y(p[i])}" width="${ch.x(i+.85)-ch.x(i+.15)}" height="${ch.y(0)-ch.y(p[i])}"/>`); });
    g("w-ch").innerHTML = ch.end();
    setT("w-last", s.total ? `${t(["Sampled","Muestreados"])}: ${s.total}. ${t(["Last token","Último token"])}: "${s.last}"` : "");
    if (Object.keys(s.seen).length >= 2) c.done();
  };
  const sample = (k) => { const p = probs(); for (let j=0;j<k;j++){ let u=Math.random(), i=0; while (i<4 && u>p[i]) { u-=p[i]; i++; } s.counts[i]++; s.total++; s.last=TOK[i]; } if (s.total>=100) s.seen[s.T]=1; paint(); };
  const reset = () => { s.counts=[0,0,0,0,0]; s.total=0; s.last=null; paint(); };
  g("w-1").onclick = () => sample(1); g("w-100").onclick = () => sample(100); g("w-r").onclick = reset;
  g("w-t").oninput = (e) => { s.T = +e.target.value; reset(); };
  paint();
};

/* ---------- B2 ---------- */
W.latency = (root, c) => {
  const s = c.state({tail:0, slow:10, m1:0, m2:0});
  if (!s.base) { const r = RNG(7); s.base = Array.from({length:300}, () => 0.8*Math.exp(0.45*r.n())); s.j = Array.from({length:300}, () => 0.8+0.4*r.u()); }
  root.innerHTML = `<div class="controls">${sliderH("w-a", t(["Requests that hit a slow tool call","Peticiones con una llamada lenta a una herramienta"]), 0, 15, 1, s.tail)}${sliderH("w-b", t(["How slow those are","Cómo de lentas son"]), 2, 30, 1, s.slow)}</div>
    <div id="w-ch"></div><dl class="readouts" id="w-rd"></dl>`;
  const paint = () => {
    setT("w-a-o", pc(s.tail/100)); setT("w-b-o", num(s.slow)+" s");
    const k = Math.round(300*s.tail/100), v = s.base.map((x,i) => i < k ? s.slow*s.j[i] : x), so = [...v].sort((a,b)=>a-b);
    const mu = mean(v), med = quant(so,.5), p95 = quant(so,.95), cnt = new Array(25).fill(0);
    v.forEach(x => cnt[Math.min(24, Math.floor(x/0.25))]++);
    const ch = Chart({t:56, x:[0,6.25], y:[0,niceTop(Math.max(...cnt))], yt:ticks(0,niceTop(Math.max(...cnt)),niceTop(Math.max(...cnt))/4), xt:[0,1,2,3,4,5,[6.125,"6+"]], xl:t(["Latency in seconds (everything above 6 s is in the last bar)","Latencia en segundos (todo lo que supera 6 s está en la última barra)"]), yl:t(["Requests","Peticiones"]), aria:t(["Histogram of latency with mean, median and p95","Histograma de latencia con media, mediana y p95"])});
    cnt.forEach((n,i) => ch.bar(i*.25, i*.25+.25, n, i===24?"b4":"bar"));
    ch.vline(Math.min(med,6.1), t(["median","mediana"]), "v2", "lab2", 0).vline(Math.min(mu,6.1), t(["mean","media"]), "v1", "lab1", -14).vline(Math.min(p95,6.1), "p95", "v3", "lab3", -28);
    g("w-ch").innerHTML = ch.end();
    g("w-rd").innerHTML = readsH([[t(["Median (typical request)","Mediana (petición típica)"]), num(med,2)+" s"], [t(["Mean (average)","Media (promedio)"]), num(mu,2)+" s"], ["p95", num(p95,2)+" s"], [t(["Slowest","La más lenta"]), num(so[299],1)+" s"]]);
    if (s.m1 && s.m2 && s.tail >= 6) c.done();
  };
  g("w-a").oninput = (e) => { s.tail = +e.target.value; s.m1 = 1; paint(); };
  g("w-b").oninput = (e) => { s.slow = +e.target.value; s.m2 = 1; paint(); };
  paint();
};

/* ---------- B3 ---------- */
W.drawdist = (root, c) => {
  const TOK = ["yes","no","maybe","sure","sorry"];
  const s = c.state({w:[5,3,2,1,1], counts:[0,0,0,0,0], total:0, moved:0});
  let cur = null;
  root.innerHTML = `<div id="w-box" class="chart dragy"></div>
    <div class="two" style="grid-template-columns:repeat(auto-fit,minmax(110px,1fr))">${TOK.map((k,i) => sliderH("w-s"+i, `"${k}"`, 0.2, 10, 0.2, s.w[i])).join("")}</div>
    <div class="controls">${btnH("w-100", t(["Sample 100 tokens","Muestrear 100 tokens"]), 1)}${btnH("w-r", t(["Clear samples","Borrar muestras"]))}<span class="status" id="w-st"></span></div>
    <div class="legend">${lg("k1", t(["probability you set (drag a bar up or down)","probabilidad que fijas (arrastra una barra arriba o abajo)"]))}<span><i style="border:2px solid var(--ink);background:transparent"></i>${t(["share in your sample","proporción en tu muestra"])}</span></div>`;
  const probs = () => { const z = s.w.reduce((a,b)=>a+b); return s.w.map(v => v/z); };
  const paint = () => {
    const p = probs();
    const ch = Chart({x:[0,5], y:[0,1], yt:[0,.25,.5,.75,1], yf:v=>pc(v), xt:TOK.map((k,i)=>[i+.5, `"${k}" ${pc(p[i])}`]), yl:t(["Probability","Probabilidad"]), aria:t(["Draggable probability bars for five tokens","Barras de probabilidad arrastrables para cinco tokens"])});
    TOK.forEach((k,i) => { ch.bar(i+.2, i+.8, p[i]); if (s.total) ch.add(`<rect class="ghost" x="${ch.x(i+.15)}" y="${ch.y(s.counts[i]/s.total)}" width="${ch.x(i+.85)-ch.x(i+.15)}" height="${ch.y(0)-ch.y(s.counts[i]/s.total)}"/>`); });
    cur = ch; g("w-box").innerHTML = ch.end();
    TOK.forEach((k,i) => { g("w-s"+i).value = s.w[i]; setT("w-s"+i+"-o", pc(p[i])); });
    setT("w-st", `${t(["The five bars always add up to","Las cinco barras siempre suman"])} ${pc(1)}. ${s.total ? t(["Sampled","Muestreados"])+": "+s.total : ""}`);
    if (s.moved && s.total >= 100) c.done();
  };
  dragOn(g("w-box"), () => cur, (fx, fy) => { const i = clamp(Math.floor(fx*5), 0, 4); s.w[i] = clamp(Math.round(fy*50)/5, 0.2, 10); s.moved = 1; s.counts=[0,0,0,0,0]; s.total=0; paint(); });
  TOK.forEach((k,i) => g("w-s"+i).oninput = (e) => { s.w[i] = +e.target.value; s.moved = 1; s.counts=[0,0,0,0,0]; s.total=0; paint(); });
  g("w-100").onclick = () => { const p = probs(); for (let j=0;j<100;j++){ let u=Math.random(), i=0; while (i<4 && u>p[i]) { u-=p[i]; i++; } s.counts[i]++; s.total++; } paint(); };
  g("w-r").onclick = () => { s.counts=[0,0,0,0,0]; s.total=0; paint(); };
  paint();
};

W.shapes = (root, c) => {
  const NS = [20,100,500,5000];
  const s = c.state({shape:"bell", ni:2, bins:20, seed:1, seen:{}, mb:0});
  root.innerHTML = `<div class="controls"><label class="field" for="w-sh">${t(["What you measure","Qué mides"])}<select id="w-sh"><option value="bell">${t(["Reply length in tokens (bell-shaped)","Longitud de la respuesta en tokens (forma de campana)"])}</option><option value="tail">${t(["Latency in seconds (long-tailed)","Latencia en segundos (cola larga)"])}</option></select></label>
    ${sliderH("w-n", t(["Sample size","Tamaño de la muestra"]), 0, 3, 1, s.ni)}${sliderH("w-b", t(["Number of bins","Número de intervalos"]), 4, 60, 1, s.bins)}</div>
    <div class="controls">${btnH("w-new", t(["Draw a new sample","Sacar una muestra nueva"]), 1)}</div><div id="w-ch"></div><dl class="readouts" id="w-rd"></dl>`;
  g("w-sh").value = s.shape;
  const paint = () => {
    const r = RNG(s.seed*7+s.ni), n = NS[s.ni], bell = s.shape === "bell", lo = bell ? 150 : 0, hi = bell ? 450 : 8;
    const v = Array.from({length:n}, () => bell ? 300+40*r.n() : Math.exp(0.8*r.n())), so = [...v].sort((a,b)=>a-b);
    const cnt = new Array(s.bins).fill(0), bw = (hi-lo)/s.bins; v.forEach(x => cnt[clamp(Math.floor((x-lo)/bw), 0, s.bins-1)]++);
    setT("w-n-o", num(n)); setT("w-b-o", s.bins);
    const top = niceTop(Math.max(...cnt)), ch = Chart({t:44, x:[lo,hi], y:[0,top], yt:ticks(0,top,top/4), xt:ticks(lo,hi,(hi-lo)/(bell?6:8)), xl: bell ? t(["Reply length (tokens)","Longitud de la respuesta (tokens)"]) : t(["Latency (seconds; values above 8 are in the last bar)","Latencia (segundos; lo que supera 8 está en la última barra)"]), yl:t(["How many","Cuántos"]), aria:t(["Histogram","Histograma"])});
    cnt.forEach((k,i) => ch.bar(lo+i*bw, lo+(i+1)*bw, k));
    ch.vline(clamp(quant(so,.5),lo,hi), t(["median","mediana"]), "v2", "lab2", 0).vline(clamp(mean(v),lo,hi), t(["mean","media"]), "v1", "lab1", -14);
    g("w-ch").innerHTML = ch.end();
    g("w-rd").innerHTML = readsH([[t(["Mean","Media"]), num(mean(v), bell?0:2)], [t(["Median","Mediana"]), num(quant(so,.5), bell?0:2)], [t(["Largest value","Valor más grande"]), num(so[n-1], bell?0:1)]]);
    s.seen[s.shape] = 1; if (s.seen.bell && s.seen.tail && s.mb) c.done();
  };
  g("w-sh").onchange = (e) => { s.shape = e.target.value; paint(); };
  g("w-n").oninput = (e) => { s.ni = +e.target.value; paint(); }; g("w-b").oninput = (e) => { s.bins = +e.target.value; s.mb = 1; paint(); };
  g("w-new").onclick = () => { s.seed++; paint(); };
  paint();
};

/* ---------- B4 ---------- */
W.grid20 = (root, c) => {
  const s = c.state({cells:null, hist:[]});
  root.innerHTML = `<div class="controls">${btnH("w-run", t(["Run a 20-case eval","Ejecutar una eval de 20 casos"]), 1)}<span class="status" id="w-n"></span></div>
    <div class="grid20" id="w-grid" role="img"></div><div class="bigscore" id="w-big" aria-live="polite"></div>
    <div><p class="caption" style="margin-bottom:6px">${t(["Your scores so far, newest first:","Tus puntuaciones hasta ahora, la más reciente primero:"])}</p><div class="chips" id="w-hist"></div></div>`;
  const paint = () => {
    const gr = g("w-grid"); gr.innerHTML = "";
    for (let i=0;i<20;i++){ const v = s.cells ? s.cells[i] : null; gr.appendChild(el(`<div class="cell ${v==null?"":v?"p":"f"}">${v==null?"":v?"✓":"×"}</div>`)); }
    const k = s.cells ? s.cells.filter(Boolean).length : 0;
    gr.setAttribute("aria-label", s.cells ? t([`20 cases: ${k} passed, ${20-k} failed`,`20 casos: ${k} pasan, ${20-k} fallan`]) : t(["20 eval cases","20 casos de la eval"]));
    g("w-big").innerHTML = s.cells ? `${pc(k/20)}<small>${t([`${k} of 20 passed · true pass rate is 70%`,`${k} de 20 pasan · la tasa real de aciertos es 70 %`])}</small>` : `–<small>${t(["press the button","pulsa el botón"])}</small>`;
    g("w-hist").innerHTML = s.hist.map((v,j) => `<span class="chip ${j===0?"new":""}">${pc(v/100)}</span>`).join("");
    setT("w-n", s.hist.length ? `${s.hist.length} ${t(["evals run","evals ejecutadas"])}` : "");
    if (s.hist.length >= 5) c.done();
  };
  g("w-run").onclick = () => { s.cells = Array.from({length:20}, () => Math.random() < 0.7); s.hist.unshift(s.cells.filter(Boolean).length*5); s.hist = s.hist.slice(0,24); paint(); };
  paint();
};

W.hist = (root, c) => {
  const NS = [10,20,50,100,200,500,1000];
  const s = c.state({ni:1, p:70, counts:new Array(21).fill(0), total:0, lo:null, hi:null, abs:0, within:0, seen:{}});
  const reset = () => Object.assign(s, {counts:new Array(21).fill(0), total:0, lo:null, hi:null, abs:0, within:0});
  root.innerHTML = `<div class="controls">${sliderH("w-n", t(["Cases per eval (sample size)","Casos por eval (tamaño de la muestra)"]), 0, NS.length-1, 1, s.ni)}${sliderH("w-p", t(["True pass rate","Tasa real de aciertos"]), 50, 95, 5, s.p)}</div>
    <div class="controls">${btnH("w-1", t(["Run 1 eval","Ejecutar 1 eval"]))}${btnH("w-100", t(["Run 100 evals","Ejecutar 100 evals"]), 1)}${btnH("w-r", t(["Clear chart","Borrar gráfico"]))}</div><div id="w-ch"></div><dl class="readouts" id="w-rd"></dl>`;
  const paint = () => {
    setT("w-n-o", num(NS[s.ni])); setT("w-p-o", pc(s.p/100));
    const top = niceTop(Math.max(...s.counts)), ch = Chart({x:[-2.5,102.5], y:[0,top], yt:ticks(0,top,top/4), xt:[0,20,40,60,80,100], xf:v=>pc(v/100), xl:t(["Eval score (share of cases passed), in 5-point bins","Puntuación de la eval (proporción de casos que pasan), en intervalos de 5 puntos"]), yl:t(["Number of evals","Número de evals"]), aria:t(["Histogram of eval scores","Histograma de puntuaciones"])});
    s.counts.forEach((k,i) => ch.bar(i*5-2.5, i*5+2.5, k));
    ch.vline(s.p, t(["true pass rate","tasa real"])+" "+pc(s.p/100));
    g("w-ch").innerHTML = ch.end();
    const n = s.total;
    g("w-rd").innerHTML = readsH([[t(["Evals run","Evals ejecutadas"]), num(n)], [t(["Lowest to highest score","Puntuación más baja y más alta"]), n ? pc(s.lo/100)+" – "+pc(s.hi/100) : "–"], [t(["Typical miss from the truth","Error típico respecto a la verdad"]), n ? num(s.abs/n,1)+" "+t(["points","puntos"]) : "–"], [t(["Within 5 points of the truth","A 5 puntos o menos de la verdad"]), n ? pc(s.within/n) : "–"]]);
    if (Object.keys(s.seen).length >= 2) c.done();
  };
  const add = (k) => { const n = NS[s.ni]; for (let e=0;e<k;e++){ const v = binom(n, s.p/100)/n*100; s.counts[Math.min(20, Math.round(v/5))]++; s.total++; s.lo = s.lo==null?v:Math.min(s.lo,v); s.hi = s.hi==null?v:Math.max(s.hi,v); s.abs += Math.abs(v-s.p); if (Math.abs(v-s.p) <= 5.0001) s.within++; } if (s.total >= 100) s.seen[n] = 1; };
  const batch = (k) => { if (k===1 || reduceMotion()) { add(k); paint(); return; } let left = k; const stop = c.every(40, () => { add(10); left -= 10; paint(); if (left <= 0) stop(); }); };
  g("w-1").onclick = () => batch(1); g("w-100").onclick = () => batch(100); g("w-r").onclick = () => { reset(); paint(); };
  g("w-n").oninput = (e) => { s.ni = +e.target.value; reset(); paint(); }; g("w-p").oninput = (e) => { s.p = +e.target.value; reset(); paint(); };
  paint();
};

W.running = (root, c) => {
  const N = 1000, s = c.state({list:[], shown:0, busy:false});
  s.busy = false; if (s.list.length) s.shown = N;
  root.innerHTML = `<div class="controls">${btnH("w-add", "", 1)}${btnH("w-r", t(["Clear","Borrar"]))}<span class="status" id="w-n"></span></div><div id="w-ch"></div><dl class="readouts" id="w-rd"></dl>`;
  const paint = () => {
    const ch = Chart({h:320, b:48, x:[0,N], xs:v=>Math.sqrt(v/N), y:[.2,1], yt:[.2,.4,.6,.8,1], yf:v=>pc(v), xt:[1,20,100,250,500,[1000,num(1000)]], xl:t(["Cases graded so far (early cases stretched so you can see them)","Casos corregidos hasta ahora (los primeros están estirados para que se vean)"]), yl:t(["Pass rate so far","Tasa de aciertos hasta ahora"]), aria:t(["Running pass rate of each run; all end near 70%","Tasa acumulada de cada tanda; todas acaban cerca del 70 %"])});
    ch.add(`<rect class="band" x="${ch.l}" y="${ch.y(.75)}" width="${ch.pw}" height="${ch.y(.65)-ch.y(.75)}"/>`).hline(.7).title(t(["dashed: true pass rate 70% · shaded: within 5 points","discontinua: tasa real 70 % · sombreado: a 5 puntos o menos"]));
    s.list.forEach((a,j) => { const latest = j === s.list.length-1, upto = latest ? s.shown : N, pts = []; for (let i=0;i<upto;i++) pts.push([i+1,a[i]]); ch.line(pts, "run "+(latest?"latest":"")); if (latest && upto) ch.dot(upto, a[upto-1]); });
    g("w-ch").innerHTML = ch.end();
    const a = s.list[s.list.length-1], at = n => a && s.shown >= n ? pc(a[n-1],1) : "–";
    g("w-rd").innerHTML = readsH([[t(["Latest run after 20 cases","Última tanda tras 20 casos"]), at(20)], [t(["After 100 cases","Tras 100 casos"]), at(100)], [t(["After 1,000 cases","Tras 1000 casos"]), at(1000)]]);
    setT("w-n", s.list.length ? `${s.list.length} ${t(["runs","tandas"])}` : "");
    g("w-add").textContent = s.list.length ? t(["Add another run","Añadir otra tanda"]) : t(["Start a run of 1,000 cases","Empezar una tanda de 1000 casos"]);
    g("w-add").disabled = s.busy;
    if (s.list.length >= 3 && !s.busy) c.done();
  };
  g("w-add").onclick = () => {
    if (s.busy) return; if (s.list.length >= 8) s.list.shift();
    let k=0; const a = new Float32Array(N); for (let i=0;i<N;i++){ if (Math.random()<0.7) k++; a[i]=k/(i+1); } s.list.push(a); s.shown = 0;
    if (reduceMotion()) { s.shown = N; paint(); return; }
    s.busy = true; const t0 = performance.now();
    const tick = (now) => { const f = Math.min(1, (now-t0)/3200); s.shown = Math.max(1, Math.round(f*f*N)); if (f >= 1) s.busy = false; paint(); if (f < 1) c.raf(tick); };
    c.raf(tick);
  };
  g("w-r").onclick = () => { clearTimers(); s.list = []; s.shown = 0; s.busy = false; paint(); };
  paint();
};

/* ---------- B5 ---------- */
W.bayes = (root, c) => {
  const s = c.state({base:1, sens:95, fpr:5, m:0, low:0});
  root.innerHTML = `<div class="controls">${sliderH("w-b", t(["Messages that are truly harmful (base rate)","Mensajes realmente dañinos (tasa base)"]), 0.5, 30, 0.5, s.base)}${sliderH("w-s", t(["Harmful messages the guardrail catches","Mensajes dañinos que el filtro detecta"]), 50, 100, 1, s.sens)}${sliderH("w-f", t(["Safe messages it flags by mistake","Mensajes seguros que marca por error"]), 0, 20, 1, s.fpr)}</div>
    <div class="bigstat" id="w-big"></div><div id="w-ch"></div>
    <div class="legend">${lg("k3", t(["harmful and flagged (true alarm)","dañino y marcado (alarma real)"]))}<span><i style="border:2px solid var(--fail);background:transparent"></i>${t(["harmful, missed","dañino, no detectado"])}</span>${lg("k1", t(["safe but flagged (false alarm)","seguro pero marcado (falsa alarma)"]))}${lg("k4", t(["safe, not flagged","seguro, sin marcar"]))}</div>`;
  const paint = () => {
    setT("w-b-o", pc(s.base/100,1)); setT("w-s-o", pc(s.sens/100)); setT("w-f-o", pc(s.fpr/100));
    const H = Math.round(10*s.base), TP = Math.round(H*s.sens/100), FP = Math.round((1000-H)*s.fpr/100), fl = TP+FP;
    let svg = `<svg class="chart" viewBox="0 0 640 262" role="img" aria-label="${t([`1,000 messages: ${H} harmful, ${fl} flagged, ${TP} of the flagged are harmful`,`1000 mensajes: ${H} dañinos, ${fl} marcados, ${TP} de los marcados son dañinos`])}">`;
    for (let i=0;i<1000;i++){ const col = Math.floor(i/20), row = i%20, x = 4+col*12.6, y = 4+row*12.6;
      const k = i < TP ? `fill="var(--fail)"` : i < H ? `fill="none" stroke="var(--fail)" stroke-width="2"` : i < H+FP ? `fill="var(--accent)"` : `fill="var(--muted)" opacity=".3"`;
      svg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="10" height="10" rx="2" ${k}/>`; }
    g("w-ch").innerHTML = svg + "</svg>";
    g("w-big").innerHTML = fl ? `${pc(TP/fl)}<small>${t([`of the ${fl} flagged messages are truly harmful (${TP} true alarms, ${FP} false alarms, out of 1,000 messages)`,`de los ${fl} mensajes marcados son realmente dañinos (${TP} alarmas reales, ${FP} falsas alarmas, de 1000 mensajes)`])}</small>` : "–";
    if (s.base <= 2 && s.m) s.low = 1; if (s.m && s.low && s.base >= 10) c.done();
  };
  [["w-b","base"],["w-s","sens"],["w-f","fpr"]].forEach(([id,k]) => g(id).oninput = (e) => { s[k] = +e.target.value; if (k==="base") s.m = 1; paint(); });
  s.low = s.low || (s.base <= 2 ? 1 : 0);
  paint();
};

/* ---------- B6 ---------- */
W.table = (root, c) => {
  const s = c.state({model:"all", cat:"all", grp:"none", met:"pass", ug:0, uf:0});
  if (!s.rows) { const r = RNG(5); s.rows = Array.from({length:240}, (_,i) => { const model = r.pick(["small","large"]), category = r.pick(["billing","refund","login","shipping"]); const base = {billing:.8,refund:.6,login:.85,shipping:.7}[category] + (model==="large"?.08:-.06); return {model, category, passed: r.u() < base, latency_ms: Math.round((model==="large"?1500:700)*Math.exp(0.4*r.n()))}; }); }
  const sel = (id, label, opts) => `<label class="field" for="${id}">${label}<select id="${id}">${opts.map(o => `<option value="${o[0]}">${o[1]}</option>`).join("")}</select></label>`;
  const all = t(["all","todos"]);
  root.innerHTML = `<div class="controls">${sel("w-m", t(["Filter: model","Filtro: modelo"]), [["all",all],["small","small"],["large","large"]])}${sel("w-c", t(["Filter: category","Filtro: categoría"]), [["all",all],["billing","billing"],["refund","refund"],["login","login"],["shipping","shipping"]])}
    ${sel("w-g", t(["Group by","Agrupar por"]), [["none",t(["nothing","nada"])],["model","model"],["category","category"]])}${sel("w-t", t(["Summarise","Resumir"]), [["pass",t(["pass rate","tasa de aciertos"])],["lat",t(["mean latency","latencia media"])],["n",t(["number of rows","número de filas"])]])}</div>
    <div class="codeline" id="w-code" aria-live="polite"></div><div id="w-ch"></div><p class="caption" id="w-cap"></p>`;
  g("w-m").value = s.model; g("w-c").value = s.cat; g("w-g").value = s.grp; g("w-t").value = s.met;
  const paint = () => {
    const rows = s.rows.filter(r => (s.model==="all" || r.model===s.model) && (s.cat==="all" || r.category===s.cat));
    const conds = []; if (s.model!=="all") conds.push(`(df["model"] == "${s.model}")`); if (s.cat!=="all") conds.push(`(df["category"] == "${s.cat}")`);
    const base = conds.length ? `df[${conds.length===1 ? conds[0].slice(1,-1) : conds.join(" & ")}]` : "df";
    const col = s.met==="pass" ? `["passed"].mean()` : s.met==="lat" ? `["latency_ms"].mean()` : s.met==="n" && s.grp!=="none" ? `.size()` : null;
    g("w-code").textContent = (s.grp==="none" ? (col ? base+col : `len(${base})`) : `${base}.groupby("${s.grp}")${col}`);
    const groups = {}; rows.forEach(r => { const k = s.grp==="none" ? all : r[s.grp]; (groups[k] = groups[k] || []).push(r); });
    const keys = Object.keys(groups).sort(), val = (a) => s.met==="pass" ? mean(a.map(r=>r.passed?1:0)) : s.met==="lat" ? mean(a.map(r=>r.latency_ms)) : a.length;
    const vals = keys.map(k => val(groups[k])), top = s.met==="pass" ? 1 : niceTop(Math.max(1,...vals));
    const fmt = (v) => s.met==="pass" ? pc(v,1) : s.met==="lat" ? num(v)+" ms" : num(v);
    const ch = Chart({h:260, x:[0,Math.max(1,keys.length)], y:[0,top], yt:ticks(0,top,top/4), yf:v=>s.met==="pass"?pc(v):num(v), xt:keys.map((k,i)=>[i+.5,k]), yl:g("w-t").selectedOptions[0].textContent, aria:t(["Bar chart of the summary per group","Gráfico de barras del resumen por grupo"])});
    keys.forEach((k,i) => { ch.bar(i+.25, i+.75, vals[i]); ch.text(i+.5, vals[i], fmt(vals[i]), "labk").add(""); });
    g("w-ch").innerHTML = ch.end().replace(/(<text class="labk"[^>]*y=")([\d.]+)"/g, (m,a,y) => `${a}${(+y-6).toFixed(1)}"`);
    setT("w-cap", `${num(rows.length)} ${t(["of 240 rows match the filter.","de 240 filas cumplen el filtro."])}`);
    if (s.ug && s.uf) c.done();
  };
  g("w-m").onchange = (e) => { s.model = e.target.value; s.uf = 1; paint(); }; g("w-c").onchange = (e) => { s.cat = e.target.value; s.uf = 1; paint(); };
  g("w-g").onchange = (e) => { s.grp = e.target.value; if (s.grp!=="none") s.ug = 1; paint(); }; g("w-t").onchange = (e) => { s.met = e.target.value; paint(); };
  paint();
};

/* ---------- I1 ---------- */
W.clt = (root, c) => {
  const NS = [1,4,16,64], MU = -0.2, SG = 0.7, PM = Math.exp(MU+SG*SG/2), PSD = PM*Math.sqrt(Math.exp(SG*SG)-1);
  const s = c.state({ni:0, cnt:new Array(30).fill(0), n:0, sum:0, sq:0, seen:{}});
  if (!s.pop) { const r = RNG(31); s.pop = new Array(30).fill(0); for (let i=0;i<4000;i++) s.pop[Math.min(29, Math.floor(Math.exp(MU+SG*r.n())/0.1))]++; }
  const reset = () => Object.assign(s, {cnt:new Array(30).fill(0), n:0, sum:0, sq:0});
  root.innerHTML = `<div id="w-pop"></div><div class="controls">${sliderH("w-n", t(["Requests averaged per sample (n)","Peticiones promediadas por muestra (n)"]), 0, NS.length-1, 1, s.ni)}</div>
    <div class="controls">${btnH("w-1", t(["Draw 1 sample mean","Sacar 1 media muestral"]))}${btnH("w-500", t(["Draw 500","Sacar 500"]), 1)}${btnH("w-r", t(["Clear","Borrar"]))}</div><div id="w-ch"></div><dl class="readouts" id="w-rd"></dl>`;
  const ptop = niceTop(Math.max(...s.pop)), pch = Chart({h:190, x:[0,3], y:[0,ptop], yt:[0,ptop], xt:[0,.5,1,1.5,2,2.5,3], yl:t(["Requests","Peticiones"]), aria:t(["Individual latencies: a long-tailed shape","Latencias individuales: forma de cola larga"])});
  s.pop.forEach((k,i) => pch.bar(i*.1, i*.1+.1, k, "b4")); pch.title(t(["Single requests: latency in seconds (long tail)","Peticiones sueltas: latencia en segundos (cola larga)"]));
  g("w-pop").innerHTML = pch.end();
  const paint = () => {
    setT("w-n-o", NS[s.ni]);
    const top = niceTop(Math.max(...s.cnt)), ch = Chart({h:250, x:[0,3], y:[0,top], yt:ticks(0,top,top/4), xt:[0,.5,1,1.5,2,2.5,3], xl:t(["Mean latency of one sample (seconds)","Latencia media de una muestra (segundos)"]), yl:t(["Samples","Muestras"]), aria:t(["Histogram of sample means","Histograma de medias muestrales"])});
    s.cnt.forEach((k,i) => ch.bar(i*.1, i*.1+.1, k)); ch.vline(PM, t(["true mean","media real"])+" "+num(PM,2)+" s");
    g("w-ch").innerHTML = ch.end();
    const sd = s.n > 1 ? Math.sqrt(Math.max(0, s.sq/s.n-(s.sum/s.n)**2)) : null;
    g("w-rd").innerHTML = readsH([[t(["Sample means drawn","Medias muestrales"]), num(s.n)], [t(["Spread of the means (measured)","Dispersión de las medias (medida)"]), sd!=null ? num(sd,3)+" s" : "–"], [t(["Standard error (predicted)","Error estándar (predicho)"]), num(PSD/Math.sqrt(NS[s.ni]),3)+" s"]]);
    if (Object.keys(s.seen).length >= 2) c.done();
  };
  const draw = (k) => { const n = NS[s.ni]; for (let j=0;j<k;j++){ let a=0; for (let i=0;i<n;i++) a += Math.exp(MU+SG*randn()); a/=n; s.cnt[Math.min(29, Math.floor(a/0.1))]++; s.n++; s.sum+=a; s.sq+=a*a; } if (s.n >= 500) s.seen[n] = 1; paint(); };
  g("w-1").onclick = () => draw(1); g("w-500").onclick = () => draw(500); g("w-r").onclick = () => { reset(); paint(); };
  g("w-n").oninput = (e) => { s.ni = +e.target.value; reset(); paint(); };
  paint();
};

/* ---------- I2 ---------- */
W.boot = (root, c) => {
  const s = c.state({scores:[], picks:null});
  if (!s.data) s.data = RNG(3).shuffle(Array.from({length:40}, (_,i) => i < 29));
  root.innerHTML = `<div class="gridN" id="w-grid" style="grid-template-columns:repeat(10,1fr);max-width:440px" role="img"></div><p class="caption" id="w-cap"></p>
    <div class="controls">${btnH("w-1", t(["Resample once","Remuestrear una vez"]))}${btnH("w-1000", t(["Resample 1,000 times","Remuestrear 1000 veces"]), 1)}${btnH("w-r", t(["Clear","Borrar"]))}</div><div id="w-ch"></div><dl class="readouts" id="w-rd"></dl>`;
  const paint = () => {
    g("w-grid").innerHTML = s.data.map((v,i) => `<div class="cell ${v?"p":"f"}" style="${s.picks && !s.picks[i] ? "opacity:.25" : ""}">${s.picks ? (s.picks[i] ? "×"+s.picks[i] : "") : (v?"✓":"×")}</div>`).join("");
    g("w-grid").setAttribute("aria-label", t(["The original eval: 29 of 40 cases passed","La eval original: 29 de 40 casos pasan"]));
    setT("w-cap", s.picks ? t(["Last resample: the number in each square is how many times that case was drawn. Faded squares were left out.","Último remuestreo: el número de cada cuadro indica cuántas veces salió ese caso. Los cuadros atenuados se quedaron fuera."]) : t(["Your one real eval: 29 of 40 cases passed (72.5%). Green passes, orange fails.","Tu única eval real: 29 de 40 casos pasan (72,5 %). Verde pasa, naranja falla."]));
    const cnt = new Array(25).fill(0); s.scores.forEach(v => cnt[clamp(Math.round((v-40)/2.5), 0, 24)]++);
    const top = niceTop(Math.max(...cnt)), ch = Chart({x:[38.75,101.25], y:[0,top], yt:ticks(0,top,top/4), xt:[40,50,60,70,80,90,100], xf:v=>pc(v/100), xl:t(["Score of each resample","Puntuación de cada remuestreo"]), yl:t(["Resamples","Remuestreos"]), aria:t(["Histogram of resampled scores","Histograma de puntuaciones remuestreadas"])});
    const so = [...s.scores].sort((a,b)=>a-b), lo = so.length >= 40 ? quant(so,.025) : null, hi = so.length >= 40 ? quant(so,.975) : null;
    if (lo != null) ch.add(`<rect class="band" x="${ch.x(lo)}" y="${ch.t}" width="${ch.x(hi)-ch.x(lo)}" height="${ch.ph}"/>`);
    cnt.forEach((k,i) => ch.bar(40+i*2.5-1.25, 40+i*2.5+1.25, k)); ch.vline(72.5, t(["your eval","tu eval"])+" "+pc(.725,1));
    g("w-ch").innerHTML = ch.end();
    g("w-rd").innerHTML = readsH([[t(["Resamples","Remuestreos"]), num(so.length)], [t(["Middle 95% of resamples","95 % central de los remuestreos"]), lo != null ? pc(lo/100,1)+" – "+pc(hi/100,1) : "–"]]);
    if (so.length >= 1000) c.done();
  };
  const once = (keep) => { const p = keep ? new Array(40).fill(0) : null; let k=0; for (let i=0;i<40;i++){ const j = Math.floor(Math.random()*40); if (p) p[j]++; if (s.data[j]) k++; } if (keep) s.picks = p; s.scores.push(k/40*100); };
  g("w-1").onclick = () => { once(true); paint(); };
  g("w-1000").onclick = () => { if (reduceMotion()) { for (let i=0;i<1000;i++) once(i===999); paint(); return; } let left = 1000; const stop = c.every(40, () => { for (let i=0;i<100;i++) once(i===99); left -= 100; paint(); if (left <= 0) stop(); }); };
  g("w-r").onclick = () => { s.scores = []; s.picks = null; paint(); };
  paint();
};

/* ---------- I3 ---------- */
W.perm = (root, c) => {
  const A = [...Array(33).fill(1), ...Array(16).fill(0), ...Array(10).fill(0), 1], B = [...Array(33).fill(1), ...Array(16).fill(0), ...Array(10).fill(1), 0];
  const OBS = (43-34)/60*100, BW = 10/3;
  const s = c.state({mode:"unpaired", d:{paired:{cnt:new Array(18).fill(0), n:0, ext:0}, unpaired:{cnt:new Array(18).fill(0), n:0, ext:0}}});
  root.innerHTML = `<p class="caption">${t(["60 test cases. Prompt A passed 34 (56.7%). Prompt B passed 43 (71.7%). Both prompts ran on the same 60 cases: 49 cases got the same result from both, 10 passed only with B, 1 passed only with A.","60 casos de prueba. El prompt A pasa 34 (56,7 %). El prompt B pasa 43 (71,7 %). Los dos prompts se ejecutaron sobre los mismos 60 casos: 49 casos dan el mismo resultado con ambos, 10 solo pasan con B y 1 solo pasa con A."])}</p>
    <div class="controls"><label class="field" for="w-m">${t(["How to shuffle","Cómo barajar"])}<select id="w-m"><option value="unpaired">${t(["Unpaired: pool all 120 results and deal them out again","Sin emparejar: junta los 120 resultados y repártelos de nuevo"])}</option><option value="paired">${t(["Paired: within each case, swap A and B at random","Emparejado: en cada caso, intercambia A y B al azar"])}</option></select></label></div>
    <div class="controls">${btnH("w-1", t(["Shuffle once","Barajar una vez"]))}${btnH("w-1000", t(["Shuffle 1,000 times","Barajar 1000 veces"]), 1)}${btnH("w-r", t(["Clear","Borrar"]))}</div><div id="w-ch"></div><dl class="readouts" id="w-rd"></dl>`;
  g("w-m").value = s.mode;
  const paint = () => {
    const d = s.d[s.mode], top = niceTop(Math.max(...d.cnt)), ch = Chart({x:[-30,30], y:[0,top], yt:ticks(0,top,top/4), xt:[-30,-20,-10,0,10,20,30], xl:t(["B minus A after shuffling (percentage points)","B menos A después de barajar (puntos porcentuales)"]), yl:t(["Shuffles","Barajadas"]), aria:t(["Histogram of shuffled differences","Histograma de diferencias al barajar"])});
    d.cnt.forEach((k,i) => ch.bar(-30+i*BW, -30+(i+1)*BW, k, Math.abs(-30+(i+.5)*BW) >= OBS-0.01 ? "b3" : "bar"));
    ch.vline(OBS, t(["what you observed","lo que observaste"])+" +"+num(OBS,1), "v3", "lab3");
    g("w-ch").innerHTML = ch.end();
    g("w-rd").innerHTML = readsH([[t(["Shuffles","Barajadas"]), num(d.n)], [t(["At least as extreme as +15 or −15","Tan extremas como +15 o −15"]), num(d.ext)], [t(["p-value (that share)","Valor p (esa proporción)"]), d.n ? num(d.ext/d.n,3) : "–"]]);
    if (s.d.paired.n >= 1000 && s.d.unpaired.n >= 1000) c.done();
  };
  const shuffle = (k) => { const d = s.d[s.mode];
    for (let j=0;j<k;j++){ let diff;
      if (s.mode === "paired") { let x=0; for (let i=0;i<60;i++) if (A[i]!==B[i]) x += (Math.random()<.5 ? 1 : -1)*(B[i]-A[i]); diff = x/60*100; }
      else { const pool = A.concat(B); let sa=0; for (let i=0;i<60;i++){ const m = i+Math.floor(Math.random()*(120-i)); [pool[i],pool[m]]=[pool[m],pool[i]]; sa += pool[i]; } diff = (77-sa-sa)/60*100; }
      d.cnt[clamp(Math.floor((diff+30)/BW), 0, 17)]++; d.n++; if (Math.abs(diff) >= OBS-1e-6) d.ext++; }
    paint(); };
  g("w-1").onclick = () => shuffle(1); g("w-1000").onclick = () => shuffle(1000);
  g("w-r").onclick = () => { s.d[s.mode] = {cnt:new Array(18).fill(0), n:0, ext:0}; paint(); };
  g("w-m").onchange = (e) => { s.mode = e.target.value; paint(); };
  paint();
};

/* ---------- I4 ---------- */
W.power = (root, c) => {
  const NS = [20,50,100,200,400,800,1600,3200], PA = 0.70;
  const s = c.state({d:5, ni:2, sim:null, m1:0, m2:0, ran:0});
  root.innerHTML = `<div class="controls">${sliderH("w-d", t(["Real improvement of prompt B","Mejora real del prompt B"]), 0, 15, 1, s.d)}${sliderH("w-n", t(["Eval cases per prompt","Casos de eval por prompt"]), 0, NS.length-1, 1, s.ni)}</div>
    <div id="w-ch"></div><div class="legend"><span><i style="border-top:2px dashed var(--muted);height:0;width:16px;border-radius:0"></i>${t(["gaps you would see if B were no better","diferencias que verías si B no fuera mejor"])}</span>${lg("k1", t(["gaps you see with the real improvement (shaded: detected)","diferencias que ves con la mejora real (sombreado: detectada)"]))}</div>
    <dl class="readouts" id="w-rd"></dl><div class="controls">${btnH("w-sim", t(["Run 200 A/B tests","Ejecutar 200 pruebas A/B"]), 1)}<span class="status" id="w-st"></span></div>`;
  const calc = () => { const n = NS[s.ni], pb = PA+s.d/100, se = Math.sqrt(PA*(1-PA)/n + pb*(1-pb)/n)*100, z = s.d/se; return {n, pb, se, power: 1-Phi(1.96-z)+Phi(-1.96-z), need: s.d ? Math.ceil((1.96+0.8416)**2*(PA*(1-PA)+pb*(1-pb))/(s.d/100)**2) : null}; };
  const paint = () => {
    const k = calc(); setT("w-d-o", "+"+s.d+" "+t(["points","puntos"])); setT("w-n-o", num(k.n));
    const ch = Chart({x:[-25,35], y:[0,1.08], xt:[-20,-10,0,10,20,30], xl:t(["Observed gap, B minus A (percentage points)","Diferencia observada, B menos A (puntos porcentuales)"]), aria:t(["Two bell curves: gaps under no improvement and under the real improvement","Dos campanas: diferencias sin mejora y con la mejora real"])});
    const xs = ticks(-25,35,.25), thr = 1.96*k.se, f = (x,m) => Math.exp(-0.5*((x-m)/k.se)**2);
    ch.area(xs.filter(x => x >= thr).map(x => [x, f(x,s.d)])).line(xs.map(x => [x, f(x,0)]), "l4").line(xs.map(x => [x, f(x,s.d)]));
    ch.vline(Math.min(thr,34), t(["gap needed to call it real","diferencia necesaria para creérsela"]), "v3", "lab3");
    g("w-ch").innerHTML = ch.end();
    g("w-rd").innerHTML = readsH([[t(["Noise in the gap (standard error)","Ruido de la diferencia (error estándar)"]), num(k.se,1)+" "+t(["points","puntos"])], [t(["Chance you detect B (power)","Probabilidad de detectar B (potencia)"]), pc(k.power)], [t(["Cases per prompt for 80% power","Casos por prompt para 80 % de potencia"]), k.need ? num(k.need) : "–"]]);
    setT("w-st", s.sim ? t([`200 tests at these settings: B was detected in ${s.sim} of them.`,`200 pruebas con estos ajustes: B se detectó en ${s.sim}.`]) : "");
    if (s.m1 && s.m2 && s.ran) c.done();
  };
  g("w-d").oninput = (e) => { s.d = +e.target.value; s.m1 = 1; s.sim = null; paint(); }; g("w-n").oninput = (e) => { s.ni = +e.target.value; s.m2 = 1; s.sim = null; paint(); };
  g("w-sim").onclick = () => { const k = calc(); let det = 0; for (let i=0;i<200;i++){ const a = binom(k.n,PA)/k.n, b = binom(k.n,k.pb)/k.n, se = Math.sqrt(a*(1-a)/k.n+b*(1-b)/k.n); if (Math.abs(b-a) > 1.96*se) det++; } s.sim = String(det); s.ran = 1; paint(); };
  paint();
};

/* ---------- I5 ---------- */
W.scatter = (root, c) => {
  const s = c.state({slope:0.6, noise:6, extra:[], m:0});
  if (!s.u) { const r = RNG(12); s.u = Array.from({length:120}, () => 1+31*r.u()); s.z = Array.from({length:120}, () => r.n()); }
  let cur = null;
  root.innerHTML = `<div class="controls">${sliderH("w-s", t(["Real effect of context length","Efecto real de la longitud del contexto"]), 0, 1.5, 0.1, s.slope)}${sliderH("w-z", t(["Noise from everything else","Ruido de todo lo demás"]), 1, 20, 1, s.noise)}</div>
    <div id="w-box" class="chart dragxy"></div><div class="controls">${btnH("w-add", t(["Add an outlier point","Añadir un punto extremo"]))}${btnH("w-r", t(["Remove the points I added","Quitar los puntos que añadí"]))}<span class="status">${t(["Or click the chart to place a point yourself.","O haz clic en el gráfico para colocar tú un punto."])}</span></div><dl class="readouts" id="w-rd"></dl>`;
  const paint = () => {
    setT("w-s-o", num(s.slope,1)); setT("w-z-o", num(s.noise));
    const xs = s.u.concat(s.extra.map(p=>p[0])), ys = s.u.map((x,i) => clamp(5+s.slope*x+s.noise*s.z[i], 0, 60)).concat(s.extra.map(p=>p[1])), k = corr(xs, ys);
    const ch = Chart({h:340, x:[0,34], y:[0,60], yt:[0,15,30,45,60], xt:[0,8,16,24,32], xl:t(["Context length (thousands of tokens)","Longitud del contexto (miles de tokens)"]), yl:t(["Failures per 100 answers","Fallos por cada 100 respuestas"]), aria:t(["Scatter plot with fitted line","Diagrama de dispersión con recta ajustada"])});
    xs.forEach((x,i) => ch.dot(x, ys[i], i >= 120 ? "d3" : "d1", i >= 120 ? 6 : 3.5));
    ch.line([[0,k.icpt],[34,k.icpt+34*k.slope]], "l2");
    cur = ch; g("w-box").innerHTML = ch.end();
    g("w-rd").innerHTML = readsH([[t(["Correlation r","Correlación r"]), num(k.r,2)], [t(["Slope of the line","Pendiente de la recta"]), (k.slope>=0?"+":"")+num(k.slope,2)+" "+t(["per 1k tokens","por cada 1k tokens"])], [t(["Points","Puntos"]), xs.length]]);
    if (s.m && s.extra.length) c.done();
  };
  g("w-box").addEventListener("click", (e) => { const svg = $("svg", g("w-box")), r = svg.getBoundingClientRect(); const fx = ((e.clientX-r.left)*cur.W/r.width-cur.l)/cur.pw, fy = 1-((e.clientY-r.top)*cur.H/r.height-cur.t)/cur.ph; if (fx<0||fx>1||fy<0||fy>1) return; s.extra.push([fx*34, fy*60]); paint(); });
  g("w-s").oninput = (e) => { s.slope = +e.target.value; paint(); }; g("w-z").oninput = (e) => { s.noise = +e.target.value; s.m = 1; paint(); };
  g("w-r").onclick = () => { s.extra = []; paint(); };
  g("w-add").onclick = () => { s.extra.push(s.extra.length % 2 ? [3, 55] : [31, 2]); paint(); };
  paint();
};

W.confound = (root, c) => {
  const s = c.state({show:false});
  if (!s.pts) { const r = RNG(13); s.pts = []; for (let i=0;i<80;i++) s.pts.push([1+11*r.u(), clamp(8+3.5*r.n(),0,60), 0]); for (let i=0;i<80;i++) s.pts.push([14+18*r.u(), clamp(26+5*r.n(),0,60), 1]); }
  root.innerHTML = `<div class="controls">${btnH("w-t", "", 1)}</div><div id="w-ch"></div><div class="legend" id="w-lg"></div><dl class="readouts" id="w-rd"></dl>`;
  const paint = () => {
    const all = corr(s.pts.map(p=>p[0]), s.pts.map(p=>p[1])), grp = [0,1].map(k => { const q = s.pts.filter(p=>p[2]===k); return corr(q.map(p=>p[0]), q.map(p=>p[1])); });
    const ch = Chart({h:340, x:[0,34], y:[0,45], yt:[0,15,30,45], xt:[0,8,16,24,32], xl:t(["Context length (thousands of tokens)","Longitud del contexto (miles de tokens)"]), yl:t(["Failures per 100 answers","Fallos por cada 100 respuestas"]), aria:t(["Scatter plot of failures against context length","Dispersión de fallos frente a longitud del contexto"])});
    s.pts.forEach(p => ch.dot(p[0], p[1], s.show ? (p[2] ? "d3" : "d2") : "d1", 3.5));
    if (s.show) { ch.line([[1,grp[0].icpt+grp[0].slope],[12,grp[0].icpt+12*grp[0].slope]], "l2").line([[14,grp[1].icpt+14*grp[1].slope],[32,grp[1].icpt+32*grp[1].slope]], "l3"); }
    else ch.line([[0,all.icpt],[34,all.icpt+34*all.slope]], "l1");
    g("w-ch").innerHTML = ch.end();
    g("w-t").textContent = s.show ? t(["Hide task type","Ocultar el tipo de tarea"]) : t(["Colour the points by task type","Colorear los puntos por tipo de tarea"]);
    g("w-lg").innerHTML = s.show ? lg("k2", t(["simple tasks (short contexts)","tareas simples (contextos cortos)"])) + lg("k3", t(["complex tasks (long contexts)","tareas complejas (contextos largos)"])) : "";
    g("w-rd").innerHTML = readsH([[t(["r, all points","r, todos los puntos"]), num(all.r,2)], [t(["r, simple tasks only","r, solo tareas simples"]), s.show ? num(grp[0].r,2) : "?"], [t(["r, complex tasks only","r, solo tareas complejas"]), s.show ? num(grp[1].r,2) : "?"]]);
    if (s.show) c.done();
  };
  g("w-t").onclick = () => { s.show = !s.show; paint(); };
  paint();
};

/* ---------- I6 ---------- */
W.threshold = (root, c) => {
  const MH = .68, MS = .38, SD = .14;
  const s = c.state({th:.5, prev:4, m1:0, m2:0});
  let cur = null;
  root.innerHTML = `<div class="controls">${sliderH("w-t", t(["Flag a message when its score is above","Marcar un mensaje si su puntuación supera"]), 0, 1, 0.01, s.th)}${sliderH("w-p", t(["Share of messages that are harmful","Proporción de mensajes dañinos"]), 1, 50, 1, s.prev)}</div>
    <div class="two"><div><div id="w-box" class="chart drag"></div><div class="legend">${lg("k2", t(["safe messages","mensajes seguros"]))}${lg("k3", t(["harmful messages","mensajes dañinos"]))}</div></div><div id="w-roc"></div></div>
    <div class="tablewrap" style="border:0"><table class="cm" id="w-cm"></table></div><dl class="readouts" id="w-rd"></dl>`;
  const paint = () => {
    setT("w-t-o", num(s.th,2)); setT("w-p-o", pc(s.prev/100));
    const tpr = 1-Phi((s.th-MH)/SD), fpr = 1-Phi((s.th-MS)/SD), H = 10000*s.prev/100, TP = Math.round(H*tpr), FN = Math.round(H)-TP, FP = Math.round((10000-H)*fpr), TN = 10000-Math.round(H)-FP;
    const xs = ticks(0,1,.01), pk = npdf(0,0,SD);
    const ch = Chart({w:420, h:280, l:16, x:[0,1], y:[0,1.1], xt:[0,.25,.5,.75,1], xl:t(["Guardrail score (drag the line)","Puntuación del filtro (arrastra la línea)"]), aria:t(["Score distributions for safe and harmful messages with the threshold","Distribución de puntuaciones de mensajes seguros y dañinos, con el umbral"])});
    ch.area(xs.map(x=>[x,npdf(x,MS,SD)/pk]),"a2").area(xs.map(x=>[x,npdf(x,MH,SD)/pk]),"a3").line(xs.map(x=>[x,npdf(x,MS,SD)/pk]),"l2").line(xs.map(x=>[x,npdf(x,MH,SD)/pk]),"l3").vline(s.th, t(["threshold","umbral"])+" "+num(s.th,2));
    cur = ch; g("w-box").innerHTML = ch.end();
    const roc = Chart({w:420, h:280, x:[0,1], y:[0,1], yt:[0,.5,1], yf:v=>pc(v), xt:[0,.5,1], xf:v=>pc(v), xl:t(["Safe messages flagged (false positive rate)","Mensajes seguros marcados (tasa de falsos positivos)"]), yl:t(["Harmful caught (recall)","Dañinos detectados (recall)"]), aria:t(["ROC curve with the current threshold as a point","Curva ROC con el umbral actual como punto"])});
    roc.line([[0,0],[1,1]],"l4").line(xs.map(x=>[1-Phi((x-MS)/SD), 1-Phi((x-MH)/SD)])).dot(fpr,tpr,"d3",7).title("ROC");
    g("w-roc").innerHTML = roc.end();
    g("w-cm").innerHTML = `<caption class="caption" style="caption-side:top;text-align:left;padding-bottom:6px">${t(["Out of 10,000 messages:","De 10 000 mensajes:"])}</caption><tr><td style="border:0"></td><th scope="col">${t(["Flagged","Marcado"])}</th><th scope="col">${t(["Not flagged","Sin marcar"])}</th></tr>
      <tr><th scope="row">${t(["Truly harmful","Realmente dañino"])}</th><td class="good"><b>${num(TP)}</b>${t(["true positives","verdaderos positivos"])}</td><td class="bad"><b>${num(FN)}</b>${t(["false negatives (missed)","falsos negativos (se escapan)"])}</td></tr>
      <tr><th scope="row">${t(["Truly safe","Realmente seguro"])}</th><td class="bad"><b>${num(FP)}</b>${t(["false positives (false alarms)","falsos positivos (falsas alarmas)"])}</td><td class="good"><b>${num(TN)}</b>${t(["true negatives","verdaderos negativos"])}</td></tr>`;
    const prec = TP+FP ? TP/(TP+FP) : 0, rec = TP+FN ? TP/(TP+FN) : 0;
    g("w-rd").innerHTML = readsH([[t(["Precision (flags that are right)","Precisión (marcas correctas)"]), TP+FP ? pc(prec,1) : "–"], [t(["Recall (harmful caught)","Recall (dañinos detectados)"]), pc(rec,1)], ["F1", prec+rec ? pc(2*prec*rec/(prec+rec),1) : "–"], [t(["Accuracy","Exactitud (accuracy)"]), pc((TP+TN)/10000,1)], [t(["Balanced accuracy","Exactitud balanceada"]), pc((tpr+1-fpr)/2,1)]]);
    if (s.m1 && s.m2) c.done();
  };
  dragOn(g("w-box"), () => cur, (fx) => { s.th = Math.round(fx*100)/100; s.m1 = 1; g("w-t").value = s.th; paint(); });
  g("w-t").oninput = (e) => { s.th = +e.target.value; s.m1 = 1; paint(); }; g("w-p").oninput = (e) => { s.prev = +e.target.value; s.m2 = 1; paint(); };
  paint();
};

/* ---------- I7 ---------- */
W.kappa = (root, c) => {
  const s = c.state({b:85, a:90, lazy:false, ml:0, mb:0});
  root.innerHTML = `<div class="controls">${sliderH("w-b", t(["Answers the human grader passes","Respuestas que el evaluador humano aprueba"]), 50, 98, 1, s.b)}${sliderH("w-a", t(["How often the LLM judge matches the human","Con qué frecuencia el juez LLM coincide con el humano"]), 50, 100, 1, s.a)}</div>
    <div class="controls"><label><input type="checkbox" id="w-l"> ${t(["Swap in a lazy judge that says “pass” to everything","Cambiar a un juez perezoso que dice «pasa» a todo"])}</label></div>
    <div class="tablewrap" style="border:0"><table class="cm" id="w-cm"></table></div><div id="w-ch"></div>
    <div class="legend">${lg("k4", t(["agreement you would get by chance","acuerdo que saldría por azar"]))}${lg("k2", t(["agreement beyond chance","acuerdo más allá del azar"]))}${lg("k3", t(["disagreement","desacuerdo"]))}</div><dl class="readouts" id="w-rd"></dl>`;
  g("w-l").checked = s.lazy;
  const paint = () => {
    const b = s.b/100, a = s.lazy ? null : s.a/100; setT("w-b-o", pc(b)); setT("w-a-o", s.lazy ? "–" : pc(s.a/100)); g("w-a").disabled = s.lazy;
    const pp = s.lazy ? b : b*a, pf = s.lazy ? 0 : b*(1-a), fp = s.lazy ? 1-b : (1-b)*(1-a), ff = s.lazy ? 0 : (1-b)*a;
    const po = pp+ff, jp = pp+fp, pe = b*jp+(1-b)*(1-jp), k = 1-pe > 1e-9 ? (po-pe)/(1-pe) : 0, n = (v) => num(Math.round(v*200));
    g("w-cm").innerHTML = `<caption class="caption" style="caption-side:top;text-align:left;padding-bottom:6px">${t(["200 answers graded by both:","200 respuestas corregidas por ambos:"])}</caption><tr><td style="border:0"></td><th scope="col">${t(["Judge: pass","Juez: pasa"])}</th><th scope="col">${t(["Judge: fail","Juez: falla"])}</th></tr>
      <tr><th scope="row">${t(["Human: pass","Humano: pasa"])}</th><td class="good"><b>${n(pp)}</b>${t(["agree","coinciden"])}</td><td class="bad"><b>${n(pf)}</b>${t(["disagree","discrepan"])}</td></tr>
      <tr><th scope="row">${t(["Human: fail","Humano: falla"])}</th><td class="bad"><b>${n(fp)}</b>${t(["disagree","discrepan"])}</td><td class="good"><b>${n(ff)}</b>${t(["agree","coinciden"])}</td></tr>`;
    const ch = Chart({h:120, t:20, b:40, l:16, x:[0,1], y:[0,1], xt:[0,.25,.5,.75,1], xf:v=>pc(v), xl:t(["Share of the 200 answers","Proporción de las 200 respuestas"]), aria:t(["Agreement split into chance, beyond chance, and disagreement","Acuerdo dividido en azar, más allá del azar y desacuerdo"])});
    ch.bar(0, Math.min(pe,po), 1, "b4"); if (po > pe) ch.bar(pe, po, 1, "b2"); ch.bar(po, 1, 1, "b3");
    g("w-ch").innerHTML = ch.end();
    g("w-rd").innerHTML = readsH([[t(["Raw agreement","Acuerdo bruto"]), pc(po,1)], [t(["Agreement expected by chance","Acuerdo esperado por azar"]), pc(pe,1)], [t(["Cohen's kappa","Kappa de Cohen"]), num(k,2)]]);
    if (s.ml && s.mb) c.done();
  };
  g("w-b").oninput = (e) => { s.b = +e.target.value; s.mb = 1; paint(); }; g("w-a").oninput = (e) => { s.a = +e.target.value; paint(); };
  g("w-l").onchange = (e) => { s.lazy = e.target.checked; s.ml = 1; paint(); };
  paint();
};
