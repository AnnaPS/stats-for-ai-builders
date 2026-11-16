"use strict";
/* Checker for Apply steps: compares `answer` with the expected value and with common wrong answers. */
const chk = (exp, alts={}, vars={}, tol="1e-9", pre="") => `import json as _j, numpy as _n
${pre}
_a = globals().get("answer")
_e = float(${exp})
def _k():
    if _a is ... or _a is None: return "dots"
    try: _v = float(_a)
    except Exception: return "type"
    if abs(_v - _e) <= ${tol}: return "ok"
${Object.entries(alts).map(([k,e]) => `    if abs(_v - float(${e})) <= ${tol}: return "${k}"`).join("\n")}
    return "_"
_j.dumps({"k": _k()${Object.entries(vars).map(([k,e]) => `, "${k}": ${e}`).join("")}})`;
const TYPE_MSG = ["<code>answer</code> should be a single number. Right now it is a table, a list or text. Pick out one value.","<code>answer</code> debe ser un único número. Ahora mismo es una tabla, una lista o un texto. Quédate con un solo valor."];
const PCT_MSG = ["That looks like a percentage. Give a share between 0 and 1, so 0.74 instead of 74.","Eso parece un porcentaje. Da una proporción entre 0 y 1: 0.74 en lugar de 74."];

/* ================= Basic 1 ================= */
L({ id:"b1", title:["Randomness and probability","Azar y probabilidad"], q:["Why does the same prompt give different answers?","¿Por qué el mismo prompt da respuestas distintas?"],
  hook:{ at:"p2", answer:1, title:["Same prompt, two different answers","Mismo prompt, dos respuestas distintas"],
    body:[`<p>You send the same prompt to your support bot twice. The first reply starts with "Sure", the second with "Hi". A teammate files a bug: the model is not deterministic.</p><p>It is no bug. The model does not pick one next word. It gives every candidate word a <dfn>probability</dfn>, a number between 0 and 1 that says how often that word comes up in the long run, and then draws one at random.</p>`,
      `<p>Envías el mismo prompt a tu bot de soporte dos veces. La primera respuesta empieza por «Sure» y la segunda por «Hi». Un compañero abre un bug: el modelo no es determinista.</p><p>No es un bug. El modelo no elige una única palabra siguiente. Asigna a cada palabra candidata una <dfn>probabilidad</dfn>, un número entre 0 y 1 que indica con qué frecuencia sale esa palabra a la larga, y después saca una al azar.</p>`],
    legend:["Predict: the model gives \"Sure\" a probability of 45%. You send the prompt 100 times. How many replies start with \"Sure\"?","Predice: el modelo da a «Sure» una probabilidad del 45 %. Envías el prompt 100 veces. ¿Cuántas respuestas empiezan por «Sure»?"],
    opts:[["All 100, because it is the most likely word","Las 100, porque es la palabra más probable"],["Somewhere near 45, and rarely exactly 45","Cerca de 45, y casi nunca exactamente 45"],["Exactly 45 every time","Exactamente 45 todas las veces"]],
    reveal:["At temperature 1 the share you sampled lands near 45% and wobbles each time you resample. A probability describes the long run. It does not fix any single batch of 100.","Con temperatura 1, la proporción que muestreas queda cerca del 45 % y cambia un poco cada vez que vuelves a muestrear. Una probabilidad describe el largo plazo. No fija ningún lote concreto de 100."] },
  plays:[
    { w:"coin", title:["Flip a coin until the share settles","Lanza una moneda hasta que la proporción se asiente"],
      intro:[`<p>Start with the simplest random thing there is. Each flip is unpredictable. Flip at least 200 times and watch the share of heads.</p>`,`<p>Empieza por lo más sencillo que existe en azar. Cada lanzamiento es impredecible. Lanza al menos 200 veces y observa la proporción de caras.</p>`],
      notice:["one flip tells you nothing, yet the share after hundreds of flips hugs the dashed line. That long-run share is what the word probability means.","un lanzamiento no te dice nada, pero la proporción tras cientos de lanzamientos se pega a la línea discontinua. Esa proporción a largo plazo es lo que significa la palabra probabilidad."],
      done:["You cannot predict a flip. You can predict the share. Move the slider and the line settles somewhere new.","No puedes predecir un lanzamiento. Sí puedes predecir la proporción. Mueve el control y la línea se asienta en otro sitio."] },
    { w:"tokens", title:["Sample the model's next token","Muestrea el siguiente token del modelo"],
      intro:[`<p>An LLM does the same thing with a five-sided, unfair coin. <dfn>Sampling</dfn> means drawing one token at random according to the probabilities. <dfn>Temperature</dfn> is a dial that reshapes those probabilities before the draw. Sample 100 tokens, then change the temperature and sample 100 more.</p>`,`<p>Un LLM hace lo mismo con una moneda trucada de cinco caras. <dfn>Muestrear</dfn> es sacar un token al azar según las probabilidades. La <dfn>temperatura</dfn> es un dial que cambia la forma de esas probabilidades antes del sorteo. Muestrea 100 tokens, cambia la temperatura y muestrea otros 100.</p>`],
      notice:["low temperature piles almost all the probability on the top token, so replies repeat. High temperature flattens the bars, so rare tokens show up.","una temperatura baja concentra casi toda la probabilidad en el token más probable y las respuestas se repiten. Una temperatura alta aplana las barras y aparecen tokens raros."],
      done:["Temperature never changes what the model knows. It changes how adventurous the draw is.","La temperatura no cambia lo que el modelo sabe. Cambia lo atrevido que es el sorteo."] } ],
  code:{ title:["Turn scores into probabilities and sample","Convierte puntuaciones en probabilidades y muestrea"],
    intro:[`<p>The model produces a raw score per token, called a <dfn>logit</dfn>. Dividing by the temperature and normalising turns logits into probabilities. Fill the gap so the probabilities add up to 1.</p>`,`<p>El modelo produce una puntuación en bruto por token, llamada <dfn>logit</dfn>. Al dividir por la temperatura y normalizar, los logits se convierten en probabilidades. Rellena el hueco para que las probabilidades sumen 1.</p>`],
    py:`import numpy as np

rng = np.random.default_rng(seed=3)
tokens = ["Sure", "Hi", "Thanks", "Sorry", "Hmm"]
logits = np.array([2.0, 1.5, 1.0, 0.2, -0.5])   #~ raw scores from the model ~~ puntuaciones en bruto del modelo

def probabilities(logits, temperature):
    weights = np.exp(logits / temperature)
    #~ GAP: divide by the total so the probabilities add up to 1 ~~ HUECO: divide por el total para que las probabilidades sumen 1
    return weights / weights.____()

for temperature in [0.2, 1.0, 2.0]:
    p = probabilities(logits, temperature)
    picks = rng.choice(tokens, size=1000, p=p)    #~ 1,000 random draws ~~ 1000 sorteos al azar
    share = (picks == "Sure").mean()
    print(f"T={temperature}: P(Sure)={p[0]:.2f}, sampled share={share:.2f}")
`,
    dart:`import 'dart:math';

final rng = Random(3);
const tokens = ['Sure', 'Hi', 'Thanks', 'Sorry', 'Hmm'];
const logits = [2.0, 1.5, 1.0, 0.2, -0.5]; //~ raw scores from the model ~~ puntuaciones en bruto del modelo

List<double> probabilities(List<double> logits, double temperature) {
  final weights = [for (final z in logits) exp(z / temperature)];
  final total = weights.reduce((a, b) => a + b);
  return [for (final w in weights) w / total]; //~ now they add up to 1 ~~ ahora suman 1
}

int sample(List<double> p) {
  var u = rng.nextDouble();
  for (var i = 0; i < p.length; i++) {
    if (u < p[i]) return i;
    u -= p[i];
  }
  return p.length - 1;
}

void main() {
  for (final temperature in [0.2, 1.0, 2.0]) {
    final p = probabilities(logits, temperature);
    var sure = 0;
    for (var i = 0; i < 1000; i++) {
      if (sample(p) == 0) sure++;
    }
    final share = (sure / 1000).toStringAsFixed(2);
    final p0 = p[0].toStringAsFixed(2);
    print('T=$temperature: P(Sure)=$p0, sampled share=$share');
  }
}
`,
    sol:[["____","sum"]], check:`"ok" if abs(float(probabilities(np.array([1.0, 1.0]), 1.0).sum()) - 1) < 1e-9 else "no"`,
    ok:["At T=0.2 \"Sure\" has probability 0.92, at T=2.0 only 0.32. In every row the sampled share sits close to the probability without matching it exactly.","Con T=0.2 «Sure» tiene probabilidad 0.92; con T=2.0, solo 0.32. En cada fila la proporción muestreada queda cerca de la probabilidad sin coincidir del todo."],
    msgs:{ err:["If the error says the probabilities do not sum to 1, the weights were divided by the wrong thing. Dividing each weight by the total of all weights is what makes them add up to 1.","Si el error dice que las probabilidades no suman 1, has dividido los pesos por algo incorrecto. Dividir cada peso por el total de todos los pesos es lo que hace que sumen 1."] },
    tests:[["max","err"],["mean","err"]] },
  qs:[
    { kind:"mc", title:["Temperature close to zero","Temperatura cerca de cero"], body:[`<p>You set the temperature of your extraction agent to 0.01.</p>`,`<p>Pones la temperatura de tu agente de extracción en 0.01.</p>`], legend:["What changes?","¿Qué cambia?"],
      opts:[ {t:["The model becomes more accurate","El modelo se vuelve más preciso"], why:["Temperature does not add knowledge. If the most likely token is wrong, a low temperature gives you that wrong token every single time.","La temperatura no añade conocimiento. Si el token más probable es incorrecto, una temperatura baja te da ese token incorrecto todas las veces."]},
        {t:["It almost always picks the single most likely token, so replies repeat","Elige casi siempre el token más probable, así que las respuestas se repiten"], ok:true, why:["Dividing the logits by a tiny number stretches the gaps between them, and nearly all the probability lands on the top token.","Dividir los logits por un número diminuto agranda las distancias entre ellos y casi toda la probabilidad cae en el token más probable."]},
        {t:["Every token becomes equally likely","Todos los tokens pasan a ser igual de probables"], why:["That is the opposite end of the dial. A very high temperature flattens the distribution. A very low one sharpens it.","Ese es el otro extremo del dial. Una temperatura muy alta aplana la distribución. Una muy baja la afila."]} ] },
    { kind:"predict", run:true, title:["Four equal logits","Cuatro logits iguales"], code:`import numpy as np
logits = np.array([1.0, 1.0, 1.0, 1.0])
p = np.exp(logits) / np.exp(logits).sum()
print(p[0], round(p.sum(), 2))`,
      opts:[ {t:"0.25 1.0", ok:true, why:["Equal scores mean equal probabilities, and four equal shares of 1 are 0.25 each. Probabilities over all options always sum to 1.","Puntuaciones iguales dan probabilidades iguales, y cuatro partes iguales de 1 son 0.25 cada una. Las probabilidades de todas las opciones siempre suman 1."]},
        {t:"1.0 4.0", why:["Those are the logits and their sum. The code divides by the total, which rescales them into shares of 1.","Esos son los logits y su suma. El código divide por el total, y eso los convierte en partes de 1."]},
        {t:"2.72 1.0", why:["2.72 is <code>np.exp(1.0)</code>, the weight before normalising. After dividing by the total of the four weights, each becomes 0.25.","2.72 es <code>np.exp(1.0)</code>, el peso antes de normalizar. Tras dividir por el total de los cuatro pesos, cada uno queda en 0.25."]},
        {t:"0.25 0.25", why:["The first number is right. The second is the sum of all four probabilities, and 4 × 0.25 is 1.0.","El primer número es correcto. El segundo es la suma de las cuatro probabilidades, y 4 × 0.25 es 1.0."]} ] },
    { kind:"fix", title:["The sampler that never varies","El muestreador que nunca varía"], body:[`<p>This function should draw a token at random according to <code>p</code>. It returns the same token every time.</p>`,`<p>Esta función debería sacar un token al azar según <code>p</code>. Devuelve siempre el mismo token.</p>`],
      code:`def sample(tokens, p, rng):
    return tokens[np.argmax(p)]`, legend:["Which change fixes it?","¿Qué cambio lo arregla?"],
      opts:[ {t:["<code>return rng.choice(tokens, p=p)</code>","<code>return rng.choice(tokens, p=p)</code>"], ok:true, why:["<code>np.argmax(p)</code> is the position of the largest probability, which is the same on every call. <code>rng.choice</code> with <code>p=p</code> draws at random with those probabilities.","<code>np.argmax(p)</code> es la posición de la probabilidad más alta, que es la misma en cada llamada. <code>rng.choice</code> con <code>p=p</code> saca al azar con esas probabilidades."]},
        {t:["<code>return tokens[np.argmin(p)]</code>","<code>return tokens[np.argmin(p)]</code>"], why:["Now it always returns the least likely token. Still no randomness: the same input gives the same output.","Ahora devuelve siempre el token menos probable. Sigue sin haber azar: la misma entrada da la misma salida."]},
        {t:["<code>return rng.choice(tokens)</code>","<code>return rng.choice(tokens)</code>"], why:["This is random, but it ignores <code>p</code>. Every token becomes equally likely, whatever the model said.","Esto es aleatorio, pero ignora <code>p</code>. Todos los tokens pasan a ser igual de probables, diga lo que diga el modelo."]} ] } ],
  apply:{ seed:41, title:["400 runs of one prompt","400 ejecuciones de un mismo prompt"],
    body:[`<p>You logged the same question sent 400 times: half at temperature 0.2, half at 1.0. A grader marked each reply correct or not.</p>`,`<p>Has registrado la misma pregunta enviada 400 veces: la mitad con temperatura 0.2 y la mitad con 1.0. Un evaluador marcó cada respuesta como correcta o no.</p>`],
    cols:["run_id","temperature","first_token","correct"],
    gen:(r) => { const TOK=["Sure","Hi","Thanks","Sorry","Hmm"], LOG=[2,1.5,1,.2,-.5]; return Array.from({length:400}, (_,i) => { const T = i%2 ? 1.0 : 0.2, e = LOG.map(l=>Math.exp(l/T)), z = e.reduce((a,b)=>a+b); return {run_id:"run-"+pad(i+1,3), temperature:T.toFixed(1), first_token:r.pick(TOK, e.map(v=>v/z)), correct: r.u() < (T===1.0 ? 0.74 : 0.90)}; }); },
    task:["Estimate the probability that a reply at temperature 1.0 is correct. Set <code>answer</code> to that share, between 0 and 1.","Estima la probabilidad de que una respuesta con temperatura 1.0 sea correcta. Asigna a <code>answer</code> esa proporción, entre 0 y 1."],
    hint:["<code>hot</code> already holds only the temperature 1.0 rows. The mean of a True/False column is the share of True.","<code>hot</code> ya contiene solo las filas con temperatura 1.0. La media de una columna True/False es la proporción de True."],
    py:`import pandas as pd

#~ How many different first tokens appear at each temperature? ~~ ¿Cuántos primeros tokens distintos aparecen con cada temperatura?
print(df.groupby("temperature")["first_token"].nunique())

hot = df[df["temperature"] == 1.0]
#~ YOUR TURN: share of the temperature 1.0 runs that were correct ~~ TU TURNO: proporción de ejecuciones con temperatura 1.0 que fueron correctas
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...",'answer = hot["correct"].mean()']],
    check: chk(`df[df["temperature"] == 1.0]["correct"].mean()`, {all:`df["correct"].mean()`, cold:`df[df["temperature"] == 0.2]["correct"].mean()`, pct:`df[df["temperature"] == 1.0]["correct"].mean() * 100`}, {e:`round(_e * 100, 1)`, c:`round(float(df[df["temperature"] == 0.2]["correct"].mean()) * 100, 1)`}),
    ok:["{e}% of the temperature 1.0 runs were correct, against {c}% at 0.2. That share is your estimate of the probability. It comes from 200 runs, so it carries noise. Basic 4 shows how much.","El {e} % de las ejecuciones con temperatura 1.0 fueron correctas, frente al {c} % con 0.2. Esa proporción es tu estimación de la probabilidad. Sale de 200 ejecuciones, así que lleva ruido. Básico 4 muestra cuánto."],
    msgs:{ type:TYPE_MSG, pct:PCT_MSG,
      all:["That is the share across all 400 runs, both temperatures mixed. The task asks about temperature 1.0 only, so use <code>hot</code>.","Esa es la proporción de las 400 ejecuciones, con las dos temperaturas mezcladas. La tarea pregunta solo por la temperatura 1.0: usa <code>hot</code>."],
      cold:["That is the share for temperature 0.2. Use the <code>hot</code> rows.","Esa es la proporción para la temperatura 0.2. Usa las filas de <code>hot</code>."] },
    tests:[[[["answer = ...",'answer = df["correct"].mean()']],"all"],[[["answer = ...",'answer = hot["correct"].mean() * 100']],"pct"],[[["answer = ...",'answer = hot']],"type"]] },
  recap:{ takes:[["<b>A probability is a long-run share.</b> It says how often something happens over many tries and nothing certain about one try.","<b>Una probabilidad es una proporción a largo plazo.</b> Dice con qué frecuencia ocurre algo en muchos intentos y nada seguro sobre un intento."],
      ["<b>LLMs sample.</b> The model scores every candidate token and draws one at random, so the same prompt can give different answers.","<b>Los LLM muestrean.</b> El modelo puntúa cada token candidato y saca uno al azar, por eso el mismo prompt puede dar respuestas distintas."],
      ["<b>Temperature reshapes the odds.</b> Low values repeat the top token. High values spread the draws out. Neither makes the model know more.","<b>La temperatura cambia las probabilidades.</b> Los valores bajos repiten el token más probable. Los altos reparten los sorteos. Ninguno hace que el modelo sepa más."]],
    f:`<button class="sym" data-g="p1">P</button>(token i) = e<sup><button class="sym" data-g="p2">z<sub>i</sub></button> / <button class="sym" data-g="p2">T</button></sup> / (e<sup>z<sub>1</sub> / T</sup> + … + e<sup>z<sub>k</sub> / T</sup>)`,
    read:["Read it as: each token's weight is e raised to its score divided by the temperature, and its probability is its weight over the total of all weights.","Léela así: el peso de cada token es e elevado a su puntuación dividida por la temperatura, y su probabilidad es su peso entre el total de todos los pesos."],
    syms:[ {s:"P", g:"p1", d:["A probability: the long-run share you watched settle with the coin.","Una probabilidad: la proporción a largo plazo que viste asentarse con la moneda."]},
      {s:"z<sub>i</sub>", g:"p2", d:["The logit, the model's raw score for token i. Higher score, taller bar.","El logit, la puntuación en bruto del modelo para el token i. A más puntuación, barra más alta."]},
      {s:"T", g:"p2", d:["The temperature slider.","El control de temperatura."]} ],
    next:["Basic 2 measures latency and cost, and shows why the average hides your slowest users.","Básico 2 mide latencia y coste, y muestra por qué el promedio esconde a tus usuarios más lentos."],
    deeper:[SRC.st("basic-probability","Basic Probability","Probabilidad básica"), SRC.rp] },
  gloss:[ [["Probability","Probabilidad"],["A number between 0 and 1 that says how often something happens in the long run.","Un número entre 0 y 1 que indica con qué frecuencia ocurre algo a la larga."],"hook"],
    [["Sampling","Muestreo"],["Drawing one outcome at random according to the probabilities.","Sacar un resultado al azar según las probabilidades."],"p2"],
    [["Token","Token"],["A word or piece of a word. LLMs read and write text one token at a time.","Una palabra o un trozo de palabra. Los LLM leen y escriben el texto token a token."],"p2"],
    [["Temperature","Temperatura"],["A setting that sharpens (low) or flattens (high) the token probabilities before sampling.","Un ajuste que afila (baja) o aplana (alta) las probabilidades de los tokens antes de muestrear."],"p2"],
    [["Logit","Logit"],["The raw score a model gives a token before it is turned into a probability.","La puntuación en bruto que un modelo da a un token antes de convertirla en probabilidad."],"code"] ]
});

/* ================= Basic 2 ================= */
L({ id:"b2", title:["Mean, median, variance, percentiles","Media, mediana, varianza y percentiles"], q:["Why does p95 latency matter more than the average?","¿Por qué importa más la latencia p95 que el promedio?"],
  hook:{ answer:2, title:["The dashboard says 1.4 seconds. Users say it hangs.","El panel dice 1,4 segundos. Los usuarios dicen que se cuelga."],
    body:[`<p>Your agent's dashboard shows an average latency of 1.4 seconds. Support tickets say the product freezes. Both are true.</p><p>Most requests finish in under a second. About 1 request in 12 calls a slow tool and takes 10 seconds or more. <dfn>Latency</dfn> is the time from sending a request to getting the reply.</p>`,
      `<p>El panel de tu agente muestra una latencia media de 1,4 segundos. Los tickets de soporte dicen que el producto se queda congelado. Las dos cosas son ciertas.</p><p>La mayoría de las peticiones termina en menos de un segundo. Más o menos 1 de cada 12 llama a una herramienta lenta y tarda 10 segundos o más. La <dfn>latencia</dfn> es el tiempo desde que envías una petición hasta que recibes la respuesta.</p>`],
    legend:["Predict: which single number on a dashboard would have warned you about those slow requests?","Predice: ¿qué número de un panel te habría avisado de esas peticiones lentas?"],
    opts:[["The mean (the average)","La media (el promedio)"],["The median (the middle request)","La mediana (la petición del medio)"],["The p95 (95% of requests are faster than this)","El p95 (el 95 % de las peticiones es más rápido)"]],
    reveal:["Once more than 5% of requests are slow, the p95 jumps from about 1.7 seconds to many seconds. The median barely moves, and the mean moves only a little.","En cuanto más del 5 % de las peticiones son lentas, el p95 salta de unos 1,7 segundos a muchos segundos. La mediana apenas se mueve y la media se mueve solo un poco."] },
  plays:[ { w:"latency", title:["Add slow requests and watch three numbers","Añade peticiones lentas y observa tres números"],
      intro:[`<p>Here are 300 requests. The <dfn>mean</dfn> is the total divided by the count. The <dfn>median</dfn> is the middle value when you sort them. The <dfn>p95</dfn>, or 95th <dfn>percentile</dfn>, is the value that 95% of requests are faster than. Drag the first slider to at least 6%, then change how slow the slow ones are.</p>`,`<p>Aquí tienes 300 peticiones. La <dfn>media</dfn> es el total dividido por la cantidad. La <dfn>mediana</dfn> es el valor central al ordenarlas. El <dfn>p95</dfn>, o <dfn>percentil</dfn> 95, es el valor que el 95 % de las peticiones mejora. Arrastra el primer control hasta al menos el 6 % y después cambia lo lentas que son las lentas.</p>`],
      notice:["the median stays put, the mean creeps, and the p95 leaps the moment the slow group passes 5% of traffic.","la mediana no se mueve, la media avanza poco a poco y el p95 da un salto en cuanto el grupo lento supera el 5 % del tráfico."],
      done:["The median describes a typical request. The p95 describes your unluckiest regular users. The mean describes nobody.","La mediana describe una petición típica. El p95 describe a tus usuarios habituales con peor suerte. La media no describe a nadie."] } ],
  code:{ title:["Four summary numbers in NumPy","Cuatro números resumen con NumPy"],
    intro:[`<p>This cell builds 1,000 latencies with a few very slow ones and prints the summary numbers. The <dfn>standard deviation</dfn> measures spread: roughly, how far values sit from the mean. Its square is the <dfn>variance</dfn>. Fill the gap to compute the p95.</p>`,`<p>Esta celda genera 1000 latencias con unas pocas muy lentas e imprime los números resumen. La <dfn>desviación estándar</dfn> mide la dispersión: más o menos, lo lejos que quedan los valores de la media. Su cuadrado es la <dfn>varianza</dfn>. Rellena el hueco para calcular el p95.</p>`],
    py:`import numpy as np

rng = np.random.default_rng(seed=11)
#~ 1,000 request latencies in seconds: most are fast ~~ 1000 latencias en segundos: la mayoría son rápidas
latency = rng.lognormal(mean=-0.3, sigma=0.6, size=1000)
latency[:30] = rng.uniform(8, 20, size=30)    #~ 3% hit a slow tool call ~~ el 3 % llama a una herramienta lenta

print(f"mean   : {latency.mean():.2f} s")
print(f"median : {np.median(latency):.2f} s")
#~ GAP: the value that 95% of requests are faster than ~~ HUECO: el valor que el 95 % de las peticiones mejora
p95 = np.percentile(latency, ____)
print(f"p95    : {p95:.2f} s")
print(f"std dev: {latency.std():.2f} s  (variance {latency.var():.2f})")
`,
    dart:`import 'dart:math';

final rng = Random(11);

double gaussian() =>
    sqrt(-2 * log(1 - rng.nextDouble())) * cos(2 * pi * rng.nextDouble());

double percentile(List<double> sorted, double q) {
  final pos = (sorted.length - 1) * q / 100;
  final lo = pos.floor(), hi = pos.ceil();
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

void main() {
  //~ 1,000 latencies in seconds: most are fast ~~ 1000 latencias en segundos: la mayoría son rápidas
  final latency = [for (var i = 0; i < 1000; i++) exp(-0.3 + 0.6 * gaussian())];
  for (var i = 0; i < 30; i++) {
    latency[i] = 8 + 12 * rng.nextDouble(); //~ 3% hit a slow tool call ~~ el 3 % llama a una herramienta lenta
  }
  final sorted = [...latency]..sort();
  final mean = latency.reduce((a, b) => a + b) / latency.length;
  final variance =
      latency.map((x) => (x - mean) * (x - mean)).reduce((a, b) => a + b) /
          latency.length;
  print('mean   : ' + mean.toStringAsFixed(2) + ' s');
  print('median : ' + percentile(sorted, 50).toStringAsFixed(2) + ' s');
  print('p95    : ' + percentile(sorted, 95).toStringAsFixed(2) + ' s');
  print('std dev: ' + sqrt(variance).toStringAsFixed(2) + ' s');
}
`,
    sol:[["____","95"]], check:`"ok" if abs(p95 - np.percentile(latency, 95)) < 1e-9 else ("frac" if p95 < np.median(latency) and abs(p95 - np.percentile(latency, 0.95)) < 1e-9 else ("low" if p95 < np.median(latency) else "no"))`,
    ok:["The mean sits well above the median because 30 slow requests drag it up. The p95 is the number to put on the dashboard, next to the median.","La media queda muy por encima de la mediana porque 30 peticiones lentas la arrastran hacia arriba. El p95 es el número que hay que poner en el panel, junto a la mediana."],
    msgs:{ frac:["<code>np.percentile</code> takes a number from 0 to 100. With 0.95 you asked for the value that only 0.95% of requests are faster than, which is nearly the fastest request.","<code>np.percentile</code> espera un número de 0 a 100. Con 0.95 pediste el valor que solo el 0,95 % de las peticiones mejora: casi la petición más rápida."],
      low:["That percentile sits below the median, so it describes fast requests. The p95 is the value that 95% of requests beat.","Ese percentil queda por debajo de la mediana, así que describe peticiones rápidas. El p95 es el valor que el 95 % de las peticiones mejora."] },
    tests:[["0.95","frac"],["5","low"]] },
  qs:[
    { kind:"mc", title:["Five requests","Cinco peticiones"], body:[`<p>Five requests took 1, 1, 1, 1 and 16 seconds.</p>`,`<p>Cinco peticiones tardaron 1, 1, 1, 1 y 16 segundos.</p>`], legend:["Which statement is right?","¿Qué afirmación es correcta?"],
      opts:[ {t:["A typical request takes about 4 seconds","Una petición típica tarda unos 4 segundos"], why:["4 is the mean: 20 seconds divided by 5 requests. No request took anywhere near 4 seconds. One outlier pulled the mean away from every real value.","4 es la media: 20 segundos entre 5 peticiones. Ninguna petición tardó ni de lejos 4 segundos. Un valor extremo alejó la media de todos los valores reales."]},
        {t:["The median is 1 second and the mean is 4 seconds","La mediana es 1 segundo y la media es 4 segundos"], ok:true, why:["Sorted, the middle value is 1. The total is 20, so the mean is 4. When the two disagree this much, a long tail is at work.","Ordenadas, el valor central es 1. El total es 20, así que la media es 4. Cuando difieren tanto, hay una cola larga detrás."]},
        {t:["The median is 16 because it is the largest","La mediana es 16 porque es el mayor"], why:["The largest value is the maximum. The median is the middle one after sorting: 1, 1, <b>1</b>, 1, 16.","El mayor valor es el máximo. La mediana es el del centro tras ordenar: 1, 1, <b>1</b>, 1, 16."]} ] },
    { kind:"predict", run:true, title:["Mean, median, variance","Media, mediana, varianza"], code:`import numpy as np
x = np.array([2, 4, 4, 4, 6])
print(x.mean(), np.median(x), x.var())`,
      opts:[ {t:"4.0 4.0 1.6", ok:true, why:["The mean and the median are both 4. The distances from the mean are −2, 0, 0, 0, 2. Squared: 4, 0, 0, 0, 4. Their average is 8 / 5 = 1.6, the variance.","La media y la mediana son 4. Las distancias a la media son −2, 0, 0, 0, 2. Al cuadrado: 4, 0, 0, 0, 4. Su promedio es 8 / 5 = 1.6, la varianza."]},
        {t:"4.0 4.0 2.0", why:["2.0 is what you get dividing the squared distances by 4. NumPy's <code>var()</code> divides by the number of values, which is 5, giving 1.6.","2.0 sale de dividir las distancias al cuadrado entre 4. El <code>var()</code> de NumPy divide por el número de valores, que es 5, y da 1.6."]},
        {t:"4.0 4.0 8.0", why:["8 is the sum of the squared distances. Variance is their average, so divide by 5.","8 es la suma de las distancias al cuadrado. La varianza es su promedio: divide entre 5."]},
        {t:"20 4.0 1.6", why:["20 is the sum. The mean divides the sum by the count: 20 / 5 = 4.0.","20 es la suma. La media divide la suma por la cantidad: 20 / 5 = 4.0."]} ] },
    { kind:"fix", title:["A p95 that is far too small","Un p95 demasiado pequeño"], body:[`<p><code>latency</code> holds 2,000 values. This line should give the p95 and returns a tiny number.</p>`,`<p><code>latency</code> contiene 2000 valores. Esta línea debería dar el p95 y devuelve un número diminuto.</p>`], code:`p95 = sorted(latency)[95]`, legend:["Which replacement is correct?","¿Qué sustitución es correcta?"],
      opts:[ {t:["<code>p95 = np.percentile(latency, 95)</code>","<code>p95 = np.percentile(latency, 95)</code>"], ok:true, why:["<code>sorted(latency)[95]</code> is the 96th smallest of 2,000 values, close to the fastest 5%. The percentile function finds the value 95% of the way up, whatever the length.","<code>sorted(latency)[95]</code> es el 96.º valor más pequeño de 2000, cerca del 5 % más rápido. La función de percentiles busca el valor que está al 95 % del recorrido, sea cual sea la longitud."]},
        {t:["<code>p95 = max(latency) * 0.95</code>","<code>p95 = max(latency) * 0.95</code>"], why:["That is 95% of the single slowest request. One freak 60-second request would make it 57 seconds even if every other request took 1 second.","Eso es el 95 % de la petición más lenta. Una sola petición anómala de 60 segundos lo dejaría en 57 segundos aunque todas las demás tardaran 1 segundo."]},
        {t:["<code>p95 = np.mean(latency) * 1.95</code>","<code>p95 = np.mean(latency) * 1.95</code>"], why:["No fixed multiple of the mean gives a percentile. The p95 depends on the shape of the tail, which is why you compute it from the sorted values.","Ningún múltiplo fijo de la media da un percentil. El p95 depende de la forma de la cola, y por eso se calcula a partir de los valores ordenados."]} ] } ],
  apply:{ seed:52, title:["Which model is safe to put behind a 3-second timeout?","¿Qué modelo aguanta un timeout de 3 segundos?"],
    body:[`<p>The log holds 2,000 requests split between a small and a large model. You plan a 3-second timeout and need to know what the large model's slow requests look like.</p>`,`<p>El registro contiene 2000 peticiones repartidas entre un modelo pequeño y uno grande. Quieres poner un timeout de 3 segundos y necesitas saber cómo son las peticiones lentas del modelo grande.</p>`],
    cols:["request_id","model","latency_ms","output_tokens","cost_usd"],
    gen:(r) => Array.from({length:2000}, (_,i) => { const big = r.u() < .5, slow = big && r.u() < .07, tok = Math.round(80+r.u()*420); return {request_id:"req-"+pad(i+1), model: big?"large":"small", latency_ms: Math.round(slow ? 6000+r.u()*9000 : (big?1300:600)*Math.exp(0.35*r.n())), output_tokens: tok, cost_usd: (tok*(big?15:2)/1e6).toFixed(5)}; }),
    task:["Set <code>answer</code> to the p95 latency of the <b>large</b> model, in milliseconds.","Asigna a <code>answer</code> la latencia p95 del modelo <b>large</b>, en milisegundos."],
    hint:["Filter the rows first, then take the 95th percentile of <code>latency_ms</code>: <code>np.percentile(values, 95)</code>.","Filtra primero las filas y después calcula el percentil 95 de <code>latency_ms</code>: <code>np.percentile(valores, 95)</code>."],
    py:`import numpy as np
import pandas as pd

print(df.groupby("model")["latency_ms"].agg(["mean", "median"]).round(0))

large = df[df["model"] == "large"]
#~ YOUR TURN: the p95 of latency_ms for the large model ~~ TU TURNO: el p95 de latency_ms para el modelo large
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...",'answer = np.percentile(large["latency_ms"], 95)']],
    check: chk(`_n.percentile(df[df["model"] == "large"]["latency_ms"], 95)`, {mean:`df[df["model"] == "large"]["latency_ms"].mean()`, median:`df[df["model"] == "large"]["latency_ms"].median()`, all:`_n.percentile(df["latency_ms"], 95)`, frac:`_n.percentile(df[df["model"] == "large"]["latency_ms"], 0.95)`}, {e:`round(_e)`, m:`round(float(df[df["model"] == "large"]["latency_ms"].median()))`}),
    ok:["The large model's median is {m} ms, comfortably under 3 seconds. Its p95 is {e} ms. With a 3-second timeout, more than 1 request in 20 would be cut off, and the median alone would never have told you.","La mediana del modelo grande es {m} ms, muy por debajo de 3 segundos. Su p95 es {e} ms. Con un timeout de 3 segundos se cortaría más de 1 petición de cada 20, y la mediana sola nunca te lo habría dicho."],
    msgs:{ type:TYPE_MSG, mean:["That is the mean. It mixes the fast majority with the slow tail into one number that describes neither. Use the 95th percentile.","Esa es la media. Mezcla la mayoría rápida con la cola lenta en un número que no describe a ninguna de las dos. Usa el percentil 95."],
      median:["That is the median, the typical request. The task asks about the slow end: the 95th percentile.","Esa es la mediana, la petición típica. La tarea pregunta por el extremo lento: el percentil 95."],
      all:["That p95 covers both models. Filter to the large model first.","Ese p95 incluye los dos modelos. Filtra primero el modelo large."],
      frac:["<code>np.percentile</code> expects 95, on a 0 to 100 scale. 0.95 asks for nearly the fastest request.","<code>np.percentile</code> espera 95, en una escala de 0 a 100. Con 0.95 pides casi la petición más rápida."] },
    tests:[[[["answer = ...",'answer = large["latency_ms"].mean()']],"mean"],[[["answer = ...",'answer = np.percentile(df["latency_ms"], 95)']],"all"]] },
  recap:{ takes:[["<b>Mean, median and p95 answer different questions.</b> Total cost uses the mean. A typical request is the median. The pain of your slowest regular users is the p95.","<b>Media, mediana y p95 responden a preguntas distintas.</b> El coste total usa la media. Una petición típica es la mediana. El dolor de tus usuarios habituales más lentos es el p95."],
      ["<b>A long tail pulls the mean away from the median.</b> When they disagree, look at the histogram before quoting either.","<b>Una cola larga separa la media de la mediana.</b> Cuando no coinciden, mira el histograma antes de citar ninguna."],
      ["<b>Variance and standard deviation measure spread.</b> Two systems with the same mean can feel very different.","<b>La varianza y la desviación estándar miden la dispersión.</b> Dos sistemas con la misma media pueden sentirse muy distintos."]],
    f:`<button class="sym" data-g="p1">x̄</button> = (x<sub>1</sub> + … + x<sub>n</sub>) / n &nbsp;&nbsp;·&nbsp;&nbsp; <button class="sym" data-g="code">s²</button> = ((x<sub>1</sub> − x̄)² + … + (x<sub>n</sub> − x̄)²) / n`,
    read:["Read it as: the mean is the total divided by the count, and the variance is the average squared distance from the mean.","Léela así: la media es el total dividido por la cantidad, y la varianza es la distancia media al cuadrado respecto a la media."],
    syms:[ {s:"x̄", g:"p1", d:["Said \"x bar\". The mean: the blue line in the latency chart.","Se lee «x barra». La media: la línea azul del gráfico de latencia."]},
      {s:"x<sub>i</sub>", g:"p1", d:["One request's latency: one of the 300 values in the histogram.","La latencia de una petición: uno de los 300 valores del histograma."]},
      {s:"s²", g:"code", d:["The variance, <code>latency.var()</code> in the code. Its square root is the standard deviation.","La varianza, <code>latency.var()</code> en el código. Su raíz cuadrada es la desviación estándar."]} ],
    next:["Basic 3 looks at whole shapes: bell curves, long tails and token probabilities as distributions.","Básico 3 mira las formas completas: campanas, colas largas y las probabilidades de tokens como distribuciones."],
    deeper:[SRC.st("basic-probability","Basic Probability (expectation and variance)","Probabilidad básica (esperanza y varianza)"), SRC.rp] },
  gloss:[ [["Latency","Latencia"],["The time from sending a request to getting the reply.","El tiempo desde que se envía una petición hasta que llega la respuesta."],"hook"],
    [["Mean","Media"],["The total divided by the count. Also called the average.","El total dividido por la cantidad. También se llama promedio."],"p1"],
    [["Median","Mediana"],["The middle value after sorting. Half the values are below it.","El valor central tras ordenar. La mitad de los valores queda por debajo."],"p1"],
    [["Percentile (p95)","Percentil (p95)"],["The p95 is the value that 95% of the data falls below.","El p95 es el valor por debajo del cual queda el 95 % de los datos."],"p1"],
    [["Variance and standard deviation","Varianza y desviación estándar"],["Measures of spread. Variance is the average squared distance from the mean; the standard deviation is its square root.","Medidas de dispersión. La varianza es la distancia media al cuadrado respecto a la media; la desviación estándar es su raíz cuadrada."],"code"] ]
});

/* ================= Basic 3 ================= */
L({ id:"b3", title:["Distributions and histograms","Distribuciones e histogramas"], q:["What shape do my token costs and latencies have?","¿Qué forma tienen mis costes de tokens y mis latencias?"],
  hook:{ at:"p2", answer:1, title:["Two columns, two very different shapes","Dos columnas, dos formas muy distintas"],
    body:[`<p>From the same 2,000 requests you plot two things: the length of each reply in tokens, and how long each request took.</p><p>A <dfn>distribution</dfn> is the full picture of which values occur and how often. A summary number hides it. A <dfn>histogram</dfn> shows it by counting how many values fall into each interval, called a bin.</p>`,
      `<p>De las mismas 2000 peticiones dibujas dos cosas: la longitud de cada respuesta en tokens y cuánto tardó cada petición.</p><p>Una <dfn>distribución</dfn> es la imagen completa de qué valores aparecen y con qué frecuencia. Un número resumen la esconde. Un <dfn>histograma</dfn> la muestra contando cuántos valores caen en cada intervalo.</p>`],
    legend:["Predict: for which one will the mean sit well above the median?","Predice: ¿en cuál quedará la media muy por encima de la mediana?"],
    opts:[["Reply length","La longitud de la respuesta"],["Latency","La latencia"],["Neither: mean and median always match","En ninguna: media y mediana siempre coinciden"]],
    reveal:["Reply length is bell-shaped and symmetric, so mean and median sit on top of each other. Latency has a long right tail: a few very slow requests pull the mean above the median.","La longitud de la respuesta tiene forma de campana y es simétrica: media y mediana coinciden. La latencia tiene una cola larga a la derecha: unas pocas peticiones muy lentas llevan la media por encima de la mediana."] },
  plays:[
    { w:"drawdist", title:["Shape a distribution with your hands","Dale forma a una distribución con tus manos"],
      intro:[`<p>A model's next-token probabilities are a distribution over a handful of options. Drag the bars up or down to set them, then sample 100 tokens.</p>`,`<p>Las probabilidades del siguiente token de un modelo son una distribución sobre unas pocas opciones. Arrastra las barras arriba o abajo para fijarlas y después muestrea 100 tokens.</p>`],
      notice:["raising one bar lowers the others, because the five probabilities must add up to 100%. The outlined sample follows your bars without matching them exactly.","al subir una barra bajan las demás, porque las cinco probabilidades tienen que sumar 100 %. La muestra (el contorno) sigue tus barras sin coincidir del todo."],
      done:["The bars are the distribution. The outlines are a sample from it.","Las barras son la distribución. Los contornos son una muestra de ella."] },
    { w:"shapes", title:["Bell-shaped or long-tailed?","¿Campana o cola larga?"],
      intro:[`<p>Switch between the two measurements, then change the number of bins. A <dfn>normal</dfn> distribution is the symmetric bell. A <dfn>long-tailed</dfn> one has most values small and a few very large.</p>`,`<p>Cambia entre las dos medidas y después cambia el número de intervalos. Una distribución <dfn>normal</dfn> es la campana simétrica. Una de <dfn>cola larga</dfn> tiene casi todos los valores pequeños y unos pocos muy grandes.</p>`],
      notice:["too few bins hide the shape and too many turn it into noise. In the long-tailed chart the mean line sits to the right of the median line.","con pocos intervalos la forma se pierde y con demasiados se convierte en ruido. En el gráfico de cola larga la línea de la media queda a la derecha de la mediana."],
      done:["Before trusting any average, plot the histogram. The shape tells you which summary number is honest.","Antes de fiarte de un promedio, dibuja el histograma. La forma te dice qué número resumen es honesto."] } ],
  code:{ title:["A histogram in text","Un histograma en texto"],
    intro:[`<p><code>np.histogram</code> counts how many values land in each bin. This cell prints two text histograms. Fill the gap to print the median next to the mean.</p>`,`<p><code>np.histogram</code> cuenta cuántos valores caen en cada intervalo. Esta celda imprime dos histogramas en texto. Rellena el hueco para imprimir la mediana junto a la media.</p>`],
    py:`import numpy as np

rng = np.random.default_rng(seed=5)
tokens_out = rng.normal(loc=300, scale=40, size=2000)     #~ reply length: bell-shaped ~~ longitud de respuesta: campana
latency = rng.lognormal(mean=0.0, sigma=0.8, size=2000)   #~ seconds: long-tailed ~~ segundos: cola larga

def describe(name, values):
    counts, edges = np.histogram(values, bins=8)
    print(name)
    for c, lo, hi in zip(counts, edges[:-1], edges[1:]):
        print(f"  {lo:7.1f} to {hi:7.1f} | {'#' * (c // 25)} {c}")
    #~ GAP: the middle value, which a long tail barely moves ~~ HUECO: el valor central, que una cola larga apenas mueve
    print(f"  mean={values.mean():.2f} median={np.____(values):.2f}")

describe("reply length (tokens)", tokens_out)
describe("latency (seconds)", latency)
`,
    dart:`import 'dart:math';

final rng = Random(5);

double gaussian() =>
    sqrt(-2 * log(1 - rng.nextDouble())) * cos(2 * pi * rng.nextDouble());

void describe(String name, List<double> values) {
  final sorted = [...values]..sort();
  final lo = sorted.first, width = (sorted.last - lo) / 8;
  final counts = List.filled(8, 0);
  for (final v in values) {
    counts[min(7, ((v - lo) / width).floor())]++; //~ which bin? ~~ ¿en qué intervalo cae?
  }
  print(name);
  for (var i = 0; i < 8; i++) {
    final a = (lo + i * width).toStringAsFixed(1);
    final b = (lo + (i + 1) * width).toStringAsFixed(1);
    final bar = '#' * (counts[i] ~/ 25);
    final n = counts[i];
    print('  $a to $b | $bar $n');
  }
  final mean = values.reduce((a, b) => a + b) / values.length;
  final median = (sorted[999] + sorted[1000]) / 2;
  print('  mean=' + mean.toStringAsFixed(2) + ' median=' + median.toStringAsFixed(2));
}

void main() {
  describe('reply length (tokens)', [for (var i = 0; i < 2000; i++) 300 + 40 * gaussian()]);
  describe('latency (seconds)', [for (var i = 0; i < 2000; i++) exp(0.8 * gaussian())]);
}
`,
    sol:[["____","median"]], check:`"ok" if f"median={np.median(latency):.2f}" in _out else ("mean" if f"median={latency.mean():.2f}" in _out else "no")`,
    ok:["For reply length the mean and median agree, and the bars form a bell. For latency the first two bins hold nearly everything, the rest is tail, and the mean is well above the median.","En la longitud de respuesta la media y la mediana coinciden y las barras forman una campana. En la latencia los dos primeros intervalos lo contienen casi todo, el resto es cola, y la media queda muy por encima de la mediana."],
    msgs:{ mean:["You printed the mean twice. The function that returns the middle value has the name of that statistic.","Has impreso la media dos veces. La función que devuelve el valor central se llama como esa estadística."] },
    tests:[["mean","mean"],["max","no"]] },
  qs:[
    { kind:"mc", title:["Choosing the number of bins","Elegir el número de intervalos"], body:[`<p>You plot 200 latencies with 100 bins. The chart looks like a comb: single spikes with gaps between them.</p>`,`<p>Dibujas 200 latencias con 100 intervalos. El gráfico parece un peine: picos sueltos con huecos entre ellos.</p>`], legend:["What is going on?","¿Qué está pasando?"],
      opts:[ {t:["The data is broken","Los datos están mal"], why:["The data is fine. 200 values spread over 100 bins leave about two per bin, so each bar mostly reflects luck.","Los datos están bien. 200 valores repartidos en 100 intervalos dejan unos dos por intervalo, así que cada barra refleja sobre todo el azar."]},
        {t:["Too many bins for this little data. Use fewer","Demasiados intervalos para tan pocos datos. Usa menos"], ok:true, why:["With about two values per bin, the bars show noise. Around 10 to 20 bins would let the real shape appear.","Con unos dos valores por intervalo, las barras muestran ruido. Con entre 10 y 20 intervalos aparecería la forma real."]},
        {t:["Latency really has 100 separate peaks","La latencia tiene de verdad 100 picos distintos"], why:["If that were true, a second sample would show the same peaks. It would show different ones, which is the signature of noise.","Si fuera cierto, una segunda muestra enseñaría los mismos picos. Enseñaría otros distintos, y esa es la firma del ruido."]} ] },
    { kind:"predict", run:true, title:["Counting into bins","Contar por intervalos"], code:`import numpy as np
counts, edges = np.histogram([1, 2, 2, 3, 3, 3, 9], bins=[0, 2, 4, 10])
print(counts)`,
      opts:[ {t:"[1 5 1]", ok:true, why:["Bin 0 to 2 holds the value 1. Bin 2 to 4 holds 2, 2, 3, 3, 3: a value on an edge goes into the bin that starts there. Bin 4 to 10 holds the 9.","El intervalo de 0 a 2 contiene el 1. El de 2 a 4 contiene 2, 2, 3, 3, 3: un valor justo en un borde va al intervalo que empieza ahí. El de 4 a 10 contiene el 9."]},
        {t:"[3 3 1]", why:["This puts the two 2s into the first bin. A value exactly on an edge belongs to the bin that starts at that edge, so the 2s count in the bin from 2 to 4.","Esto mete los dos 2 en el primer intervalo. Un valor justo en un borde pertenece al intervalo que empieza en ese borde: los 2 cuentan en el de 2 a 4."]},
        {t:"[1 2 3 1]", why:["That counts how often each distinct value appears. A histogram counts per bin, and three edges after the first make three bins.","Eso cuenta cuántas veces aparece cada valor distinto. Un histograma cuenta por intervalo, y con cuatro bordes hay tres intervalos."]},
        {t:"[0 2 4 10]", why:["Those are the bin edges, which the function returns as the second value. <code>counts</code> holds how many values fell in each bin.","Esos son los bordes de los intervalos, que la función devuelve como segundo valor. <code>counts</code> contiene cuántos valores cayeron en cada intervalo."]} ] },
    { kind:"fix", title:["Probabilities that add up to 2.5","Probabilidades que suman 2,5"], body:[`<p>You counted which token the model chose in 1,000 runs and want the share of each. The shares add up to far more than 1.</p>`,`<p>Has contado qué token eligió el modelo en 1000 ejecuciones y quieres la proporción de cada uno. Las proporciones suman mucho más que 1.</p>`], code:`counts = np.array([400, 300, 200, 100])
p = counts / counts.max()`, legend:["Which change fixes it?","¿Qué cambio lo arregla?"],
      opts:[ {t:["<code>p = counts / counts.sum()</code>","<code>p = counts / counts.sum()</code>"], ok:true, why:["Dividing by the largest count gives 1.0, 0.75, 0.5, 0.25, which sums to 2.5. A distribution's shares must sum to 1, so divide by the total: 0.4, 0.3, 0.2, 0.1.","Dividir por el recuento mayor da 1.0, 0.75, 0.5, 0.25, que suma 2.5. Las proporciones de una distribución deben sumar 1: divide por el total y obtienes 0.4, 0.3, 0.2, 0.1."]},
        {t:["<code>p = counts / len(counts)</code>","<code>p = counts / len(counts)</code>"], why:["That divides by 4, the number of tokens, and gives 100, 75, 50, 25. Divide by the number of runs, which is the sum of the counts.","Eso divide entre 4, el número de tokens, y da 100, 75, 50, 25. Hay que dividir por el número de ejecuciones, que es la suma de los recuentos."]},
        {t:["<code>p = counts / counts.mean()</code>","<code>p = counts / counts.mean()</code>"], why:["The mean count is 250, so this gives 1.6, 1.2, 0.8, 0.4. They sum to 4. Only dividing by the total makes shares that sum to 1.","El recuento medio es 250, así que esto da 1.6, 1.2, 0.8, 0.4, que suman 4. Solo al dividir por el total salen proporciones que suman 1."]} ] } ],
  apply:{ seed:63, title:["How heavy is the tail of your reply lengths?","¿Cuánto pesa la cola de tus respuestas?"],
    body:[`<p>Output tokens drive your bill. Most replies are short, a few run very long. You want one number that says how heavy that tail is.</p>`,`<p>Los tokens de salida determinan tu factura. La mayoría de las respuestas son cortas y unas pocas se alargan mucho. Quieres un número que diga cuánto pesa esa cola.</p>`],
    cols:["reply_id","output_tokens","finish_reason"],
    gen:(r) => Array.from({length:1500}, (_,i) => { const tok = Math.min(4096, Math.round(Math.exp(5.3+0.75*r.n()))); return {reply_id:"rep-"+pad(i+1), output_tokens:tok, finish_reason: tok >= 4096 ? "length" : "stop"}; }),
    task:["Set <code>answer</code> to the share of replies (between 0 and 1) that are longer than <b>twice the median</b> length.","Asigna a <code>answer</code> la proporción de respuestas (entre 0 y 1) que superan <b>el doble de la mediana</b> de longitud."],
    hint:["A comparison such as <code>tokens &gt; limit</code> gives True/False values. Their mean is the share that is True.","Una comparación como <code>tokens &gt; limite</code> da valores True/False. Su media es la proporción de True."],
    py:`import numpy as np

tokens = df["output_tokens"].to_numpy()
counts, edges = np.histogram(tokens, bins=8)
for c, lo, hi in zip(counts, edges[:-1], edges[1:]):
    print(f"{lo:6.0f} to {hi:6.0f} | {'#' * (c // 30)} {c}")
print("mean:", round(tokens.mean()), "median:", np.median(tokens))

#~ YOUR TURN: share of replies longer than twice the median ~~ TU TURNO: proporción de respuestas más largas que el doble de la mediana
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...","answer = (tokens > 2 * np.median(tokens)).mean()"]],
    check: chk(`(df["output_tokens"] > 2 * df["output_tokens"].median()).mean()`, {mean:`(df["output_tokens"] > 2 * df["output_tokens"].mean()).mean()`, count:`(df["output_tokens"] > 2 * df["output_tokens"].median()).sum()`, half:`(df["output_tokens"] > df["output_tokens"].median()).mean()`, pct:`(df["output_tokens"] > 2 * df["output_tokens"].median()).mean() * 100`}, {e:`round(_e * 100, 1)`}),
    ok:["{e}% of replies are more than twice as long as the typical one. In a bell-shaped distribution that share would be close to zero. This is what a long tail means for your bill.","El {e} % de las respuestas dura más del doble que la típica. En una distribución con forma de campana esa proporción sería casi cero. Esto es lo que significa una cola larga para tu factura."],
    msgs:{ type:TYPE_MSG, pct:PCT_MSG, mean:["You compared against twice the mean. The tail has already pulled the mean up, so fewer replies clear it. Use twice the median.","Has comparado con el doble de la media. La cola ya ha subido la media, así que menos respuestas la superan. Usa el doble de la mediana."],
      count:["That is how many replies clear the limit. Divide by the number of replies, or take the mean of the True/False values, to get a share.","Eso es cuántas respuestas superan el límite. Divide por el número de respuestas, o toma la media de los valores True/False, para obtener una proporción."],
      half:["That is the share above the median itself, which is always about one half. The limit is twice the median.","Esa es la proporción por encima de la propia mediana, que siempre ronda la mitad. El límite es el doble de la mediana."] },
    tests:[[[["answer = ...","answer = (tokens > 2 * tokens.mean()).mean()"]],"mean"],[[["answer = ...","answer = (tokens > 2 * np.median(tokens)).sum()"]],"count"]] },
  recap:{ takes:[["<b>A distribution is the whole picture.</b> It says which values occur and how often. A histogram draws it by counting per bin.","<b>Una distribución es la imagen completa.</b> Dice qué valores aparecen y con qué frecuencia. Un histograma la dibuja contando por intervalos."],
      ["<b>Shapes differ.</b> Bell-shaped data is symmetric and summarised well by its mean. Long-tailed data, like latency and cost, needs the median and a high percentile.","<b>Las formas cambian.</b> Los datos en campana son simétricos y la media los resume bien. Los de cola larga, como la latencia y el coste, necesitan la mediana y un percentil alto."],
      ["<b>Token probabilities are a distribution too.</b> Their shares always sum to 1.","<b>Las probabilidades de tokens también son una distribución.</b> Sus proporciones siempre suman 1."]],
    f:`<button class="sym" data-g="p1">p<sub>i</sub></button> = <button class="sym" data-g="p2">n<sub>i</sub></button> / n &nbsp;&nbsp;·&nbsp;&nbsp; p<sub>1</sub> + p<sub>2</sub> + … + p<sub>k</sub> = 1`,
    read:["Read it as: the share in bin i is the count in that bin divided by the total, and all the shares together make 1.","Léela así: la proporción del intervalo i es su recuento dividido por el total, y todas las proporciones juntas suman 1."],
    syms:[ {s:"p<sub>i</sub>", g:"p1", d:["The share or probability of option i: the height of one bar you dragged.","La proporción o probabilidad de la opción i: la altura de una de las barras que arrastraste."]},
      {s:"n<sub>i</sub>", g:"p2", d:["How many values fell in bin i: the height of one histogram bar.","Cuántos valores cayeron en el intervalo i: la altura de una barra del histograma."]} ],
    next:["Basic 4 asks how far a score from a small sample can sit from the truth.","Básico 4 pregunta cuánto puede alejarse de la verdad la puntuación de una muestra pequeña."],
    deeper:[SRC.st("probability-distributions","Probability Distributions","Distribuciones de probabilidad"), SRC.rp] },
  gloss:[ [["Distribution","Distribución"],["The full picture of which values occur and how often.","La imagen completa de qué valores aparecen y con qué frecuencia."],"hook"],
    [["Histogram","Histograma"],["A chart that counts how many values fall into each interval (bin).","Un gráfico que cuenta cuántos valores caen en cada intervalo."],"hook"],
    [["Normal distribution","Distribución normal"],["The symmetric bell shape: most values near the middle, few far away on either side.","La forma de campana simétrica: casi todos los valores cerca del centro y pocos lejos a cada lado."],"p2"],
    [["Long tail","Cola larga"],["A shape where most values are small and a few are very large, as with latency and cost.","Una forma en la que casi todos los valores son pequeños y unos pocos son muy grandes, como en la latencia y el coste."],"p2"] ]
});

/* ================= Basic 4 ================= */
L({ id:"b4", title:["Samples and the law of large numbers","Muestras y la ley de los grandes números"], q:["Why is a 20-case eval so noisy?","¿Por qué una eval de 20 casos tiene tanto ruido?"],
  hook:{ at:"p2", answer:2, title:["Monday 80%. Tuesday 60%. Nothing changed.","Lunes 80 %. Martes 60 %. No ha cambiado nada."],
    body:[`<p>You built a support agent and an <dfn>eval</dfn>: a set of test cases, each graded pass or fail. Your eval has 20 cases.</p><p>On Monday the agent passes 16 of 20, so the score is 80%. On Tuesday you rerun it without touching the prompt and get 12 of 20, or 60%. The team channel asks what broke.</p><p>Those 20 cases are a <dfn>sample</dfn>: a small handful standing in for every request the agent will ever see. Suppose the agent would pass exactly 70% of all possible requests.</p>`,
      `<p>Has construido un agente de soporte y una <dfn>eval</dfn>: un conjunto de casos de prueba, cada uno corregido como pasa o falla. Tu eval tiene 20 casos.</p><p>El lunes el agente pasa 16 de 20, así que la puntuación es 80 %. El martes la repites sin tocar el prompt y obtienes 12 de 20, un 60 %. En el canal del equipo preguntan qué se ha roto.</p><p>Esos 20 casos son una <dfn>muestra</dfn>: un puñado pequeño que representa todas las peticiones que verá el agente. Supón que el agente pasaría exactamente el 70 % de todas las peticiones posibles.</p>`],
    legend:["Predict: you run a fresh 20-case eval 1,000 times with nothing changed. Where do the scores land?","Predice: ejecutas una eval nueva de 20 casos 1000 veces sin cambiar nada. ¿Dónde caen las puntuaciones?"],
    opts:[["Almost every run lands on 68% to 72%","Casi todas caen entre 68 % y 72 %"],["Almost every run lands between 60% and 80%","Casi todas caen entre 60 % y 80 %"],["Runs spread across roughly 50% to 90%","Se reparten más o menos entre 50 % y 90 %"]],
    reveal:["With 20 cases the scores run from about 50% to 90%. About 1 run in 5 lands outside 60% to 80%, so Monday's 80% and Tuesday's 60% are both ordinary results for a 70% agent.","Con 20 casos las puntuaciones van de más o menos 50 % a 90 %. Alrededor de 1 de cada 5 cae fuera de 60 %–80 %, así que el 80 % del lunes y el 60 % del martes son resultados normales para un agente del 70 %."] },
  plays:[
    { w:"grid20", doneTitle:["Seen it.","Visto."], title:["Run the same eval again and again","Ejecuta la misma eval una y otra vez"],
      intro:[`<p>This agent's <dfn>true pass rate</dfn> is 70%: the share of all possible cases it would pass. In real life you never see that number. You only see an <dfn>eval score</dfn>, which is passes divided by cases graded.</p><p>Each square is one case. The number of squares is the <dfn>sample size</dfn>, here 20. Press the button at least five times.</p>`,`<p>La <dfn>tasa real de aciertos</dfn> de este agente es 70 %: la proporción de todos los casos posibles que pasaría. En la vida real nunca ves ese número. Solo ves una <dfn>puntuación de la eval</dfn>: los casos que pasan divididos por los casos corregidos.</p><p>Cada cuadro es un caso. El número de cuadros es el <dfn>tamaño de la muestra</dfn>, aquí 20. Pulsa el botón al menos cinco veces.</p>`],
      notice:["the agent never changes, yet the score does. Only the luck of which cases pass changes.","el agente no cambia nunca y la puntuación sí. Solo cambia la suerte de qué casos pasan."],
      done:["Same agent, same prompt, different scores. That run-to-run wobble has a name: <dfn>noise</dfn>.","Mismo agente, mismo prompt, puntuaciones distintas. Ese vaivén entre ejecuciones tiene nombre: <dfn>ruido</dfn>."] },
    { w:"hist", doneTitle:["Two sample sizes compared.","Dos tamaños de muestra comparados."], title:["Pile up the scores and look at the spread","Apila las puntuaciones y mira la dispersión"],
      intro:[`<p>Each eval you run drops one block onto the chart at its score. Run 100 evals at 20 cases, then drag <b>cases per eval</b> up and run 100 more.</p>`,`<p>Cada eval que ejecutas deja caer un bloque en el gráfico, sobre su puntuación. Ejecuta 100 evals de 20 casos, después sube <b>casos por eval</b> y ejecuta otras 100.</p>`],
      notice:["with few cases the pile sprawls far from the dashed line. With many cases it squeezes in around it. Moving a slider clears the chart.","con pocos casos la pila se desparrama lejos de la línea discontinua. Con muchos casos se aprieta alrededor de ella. Al mover un control se borra el gráfico."],
      done:["The agent did not get better when you added cases. Your measurement of it did. Watch the <dfn>typical miss</dfn>: how far a score usually lands from the truth.","El agente no mejoró al añadir casos. Mejoró tu medición. Fíjate en el <dfn>error típico</dfn>: lo lejos que suele caer una puntuación de la verdad."] },
    { w:"running", doneTitle:["That funnel is the law of large numbers.","Ese embudo es la ley de los grandes números."], title:["Grade one case at a time and track the score so far","Corrige caso a caso y sigue la puntuación acumulada"],
      intro:[`<p>A <dfn>running average</dfn> is the score so far, recomputed after every new case. Start a run and watch the line. Then add two more runs on top.</p>`,`<p>Un <dfn>promedio acumulado</dfn> es la puntuación hasta el momento, recalculada tras cada caso nuevo. Empieza una tanda y observa la línea. Después añade dos tandas más encima.</p>`],
      notice:["every line thrashes around at the start and every line ends up hugging the dashed one. No run gets there by the same path.","todas las líneas dan bandazos al principio y todas acaban pegadas a la discontinua. Ninguna tanda llega por el mismo camino."],
      done:["The <dfn>law of large numbers</dfn> says: the more cases you average over, the closer the average gets to the true value. It promises nothing about a small sample.","La <dfn>ley de los grandes números</dfn> dice: cuantos más casos promedias, más se acerca el promedio al valor real. No promete nada sobre una muestra pequeña."] } ],
  code:{ title:["Simulate the eval yourself","Simula la eval tú mismo"],
    intro:[`<p>This cell repeats what you just did by hand: run an eval 1,000 times at each sample size and print the lowest and highest score. The <dfn>seed</dfn> fixes the random generator so you get the same draws every run.</p><p>Replace <code>____</code> with the NumPy method that averages an array. In NumPy, <code>True</code> counts as 1 and <code>False</code> as 0.</p>`,`<p>Esta celda repite lo que acabas de hacer a mano: ejecuta una eval 1000 veces con cada tamaño de muestra e imprime la puntuación más baja y la más alta. La <dfn>semilla</dfn> fija el generador aleatorio para que salgan los mismos sorteos en cada ejecución.</p><p>Sustituye <code>____</code> por el método de NumPy que promedia un array. En NumPy, <code>True</code> cuenta como 1 y <code>False</code> como 0.</p>`],
    py:`import numpy as np

rng = np.random.default_rng(seed=7)   #~ seed = same "random" numbers every run ~~ semilla = los mismos números «aleatorios» en cada ejecución
true_pass_rate = 0.70                 #~ hidden in real life; we set it here ~~ oculta en la vida real; aquí la fijamos

def run_eval(n_cases):
    #~ One True/False per case: True means the agent passed that case ~~ Un True/False por caso: True significa que el agente pasó ese caso
    passed = rng.random(n_cases) < true_pass_rate
    #~ GAP: turn the True/False list into a pass rate between 0 and 1 ~~ HUECO: convierte la lista de True/False en una tasa de aciertos entre 0 y 1
    return passed.____()

for n in [20, 200, 2000, 20000]:
    scores = [run_eval(n) for _ in range(1000)]   #~ repeat the eval 1,000 times ~~ repite la eval 1000 veces
    print(f"{n:>6} cases: scores from {min(scores):.0%} to {max(scores):.0%}")
`,
    dart:`import 'dart:math';

final rng = Random(7); //~ seed = same "random" numbers every run ~~ semilla = los mismos números «aleatorios» en cada ejecución
const truePassRate = 0.70; //~ hidden in real life; we set it here ~~ oculta en la vida real; aquí la fijamos

double runEval(int nCases) {
  var passes = 0;
  for (var i = 0; i < nCases; i++) {
    if (rng.nextDouble() < truePassRate) passes++;
  }
  return passes / nCases; //~ pass rate between 0 and 1 ~~ tasa de aciertos entre 0 y 1
}

void main() {
  for (final n in [20, 200, 2000, 20000]) {
    final scores = [for (var i = 0; i < 1000; i++) runEval(n)];
    final lo = (scores.reduce(min) * 100).round();
    final hi = (scores.reduce(max) * 100).round();
    print(n.toString().padLeft(6) + ' cases: scores from $lo% to $hi%');
  }
}
`,
    sol:[["____","mean"]], check:`_v = float(sum(run_eval(20000) for _ in range(5)) / 5)
"ok" if abs(_v - 0.7) < 0.01 else ("count" if _v > 1 else "no")`,
    ok:["At 20 cases the scores run from 35% to 95%. At 20,000 they sit between 69% and 71%. Same agent every time. Averaging pass/fail values gives the pass rate, and more values give a steadier one.","Con 20 casos las puntuaciones van de 35 % a 95 %. Con 20 000 quedan entre 69 % y 71 %. Siempre el mismo agente. Promediar los valores pasa/falla da la tasa de aciertos, y con más valores sale más estable."],
    msgs:{ count:["<code>run_eval</code> now returns a count of passes. A pass rate is passes divided by cases, so it sits between 0 and 1. The method that adds up and divides is the average.","<code>run_eval</code> devuelve ahora un recuento de aciertos. Una tasa de aciertos son los aciertos divididos por los casos, así que queda entre 0 y 1. El método que suma y divide es el promedio."],
      err:["Read the last line of the error. If it says an attribute does not exist, the method name is misspelled.","Lee la última línea del error. Si dice que un atributo no existe, el nombre del método está mal escrito."] },
    tests:[["sum","count"],["meen","err"]] },
  qs:[
    { kind:"mc", title:["Two prompts, 20 cases each","Dos prompts, 20 casos cada uno"], body:[`<p>Prompt A passes 15 of 20 cases (75%). Prompt B passes 17 of 20 (85%). A teammate wants to ship B today.</p>`,`<p>El prompt A pasa 15 de 20 casos (75 %). El prompt B pasa 17 de 20 (85 %). Un compañero quiere desplegar B hoy.</p>`], legend:["What is the best reading of this result?","¿Cuál es la mejor lectura de este resultado?"],
      opts:[ {t:["B is better by 10 points, so ship it","B es 10 puntos mejor: a producción"], why:["This treats a score as the truth. On 20 cases, 10 points is a gap of only two cases. Two identical prompts end up at least two cases apart more often than not.","Esto trata una puntuación como si fuera la verdad. Con 20 casos, 10 puntos son solo dos casos de diferencia. Dos prompts idénticos acaban a dos casos o más de distancia la mayoría de las veces."]},
        {t:["The gap is two cases, well inside the noise for 20 cases. Run more cases before deciding","La diferencia son dos casos, dentro del ruido de 20 casos. Ejecuta más casos antes de decidir"], ok:true, why:["If both prompts had the same true pass rate of 80%, they would still land two or more cases apart about 55% of the time. A gap that luck produces more often than not is no evidence.","Si los dos prompts tuvieran la misma tasa real del 80 %, quedarían a dos o más casos de distancia alrededor del 55 % de las veces. Una diferencia que el azar produce más de la mitad de las veces no es una prueba."]},
        {t:["A and B are equally good","A y B son igual de buenos"], why:["That swings too far. Noise means you cannot tell yet. B may well be better; 20 cases are too few to show it either way.","Eso es pasarse al otro lado. El ruido significa que aún no puedes saberlo. Puede que B sea mejor; 20 casos son muy pocos para verlo en un sentido u otro."]},
        {t:["Rerun the same 20 cases a few times and keep the best score","Repite los mismos 20 casos varias veces y quédate con la mejor puntuación"], why:["Keeping the best of several noisy runs picks out the luckiest run. The score goes up while the agent stays the same. More different cases reduce noise; cherry-picking reruns hides it.","Quedarse con la mejor de varias ejecuciones ruidosas es elegir la más afortunada. La puntuación sube y el agente sigue igual. Más casos distintos reducen el ruido; escoger la mejor repetición lo esconde."]} ] },
    { kind:"predict", run:true, title:["A million coin flips","Un millón de lanzamientos"], code:`import numpy as np
rng = np.random.default_rng(0)
flips = rng.random(1_000_000) < 0.25
print(round(flips.mean(), 2))`,
      opts:[ {t:"0.25", ok:true, why:["Each value is True with probability 0.25, and the mean of a million of them sits within a small fraction of a point of 0.25. With a large sample, a random result becomes predictable.","Cada valor es True con probabilidad 0.25, y la media de un millón queda a una pequeña fracción de punto de 0.25. Con una muestra grande, un resultado aleatorio se vuelve predecible."]},
        {t:"0.5", why:["<code>rng.random()</code> gives numbers spread evenly between 0 and 1, and their plain average is about 0.5. Here the code first asks <code>&lt; 0.25</code>, which is True only a quarter of the time.","<code>rng.random()</code> da números repartidos por igual entre 0 y 1, y su promedio es más o menos 0.5. Aquí el código pregunta antes <code>&lt; 0.25</code>, que solo es True una cuarta parte de las veces."]},
        {t:"0.75", why:["That is the share that is False. <code>.mean()</code> gives the share that is True.","Esa es la proporción de False. <code>.mean()</code> da la proporción de True."]},
        {t:["It cannot be predicted, because the numbers are random","No se puede predecir, porque los números son aleatorios"], why:["Single draws are unpredictable. The average of a million draws is not. That is the law of large numbers at work.","Los sorteos sueltos son impredecibles. El promedio de un millón de sorteos no lo es. Es la ley de los grandes números en acción."]} ] },
    { kind:"mc", title:["Five fails in a row","Cinco fallos seguidos"], body:[`<p>Your agent's true pass rate is 70%. You grade cases one at a time, and the last five all failed.</p>`,`<p>La tasa real de aciertos de tu agente es 70 %. Corriges los casos de uno en uno y los cinco últimos han fallado.</p>`], legend:["What is the chance the next case passes?","¿Qué probabilidad hay de que pase el siguiente caso?"],
      opts:[ {t:["More than 70%. A pass is due, so the average can get back to 70%","Más del 70 %. Ya toca un acierto para que el promedio vuelva al 70 %"], why:["This is the <dfn>gambler's fallacy</dfn>. Cases have no memory. The running average returns to 70% because thousands of later cases outweigh the streak. Nothing makes up for it.","Esta es la <dfn>falacia del jugador</dfn>. Los casos no tienen memoria. El promedio acumulado vuelve al 70 % porque miles de casos posteriores pesan más que la racha. Nada la compensa."]},
        {t:["70%, the same as always","70 %, como siempre"], ok:true, why:["Each case is a fresh draw. The law of large numbers works by swamping: five fails matter a lot in a sample of 10 and almost nothing in a sample of 5,000.","Cada caso es un sorteo nuevo. La ley de los grandes números funciona por dilución: cinco fallos pesan mucho en una muestra de 10 y casi nada en una de 5000."]},
        {t:["Less than 70%. The agent is on a bad streak","Menos del 70 %. El agente está en mala racha"], why:["If the true pass rate really is 70%, a streak tells you nothing about the next case. Five fails in a row happens about once in every 400 stretches of five cases, purely by chance.","Si la tasa real es de verdad 70 %, una racha no te dice nada del siguiente caso. Cinco fallos seguidos ocurren más o menos una vez cada 400 tramos de cinco casos, solo por azar."]} ] },
    { kind:"fix", title:["The running average that starts at zero","El promedio acumulado que empieza en cero"], body:[`<p>This should print the pass rate so far after 10 cases. It prints <code>0.014</code>, even though 7 of the first 10 cases passed.</p>`,`<p>Esto debería imprimir la tasa de aciertos acumulada tras 10 casos. Imprime <code>0.014</code>, aunque 7 de los 10 primeros casos pasaron.</p>`],
      code:`rng = np.random.default_rng(1)
passed = rng.random(500) < 0.7
running = np.cumsum(passed) / len(passed)
print(running[9])`, legend:["Which change fixes it?","¿Qué cambio lo arregla?"],
      opts:[ {t:["Use <code>running[10]</code> instead of <code>running[9]</code>","Usar <code>running[10]</code> en lugar de <code>running[9]</code>"], why:["Position 9 is correct: positions start at 0, so <code>running[9]</code> is the value after 10 cases. The bug is in what each count is divided by.","La posición 9 es correcta: las posiciones empiezan en 0, así que <code>running[9]</code> es el valor tras 10 casos. El error está en por qué se divide cada recuento."]},
        {t:["Divide by <code>np.arange(1, len(passed) + 1)</code> instead of <code>len(passed)</code>","Dividir por <code>np.arange(1, len(passed) + 1)</code> en lugar de <code>len(passed)</code>"], ok:true, why:["<code>np.cumsum(passed)</code> is the number of passes so far: 7 after ten cases. The buggy line divides every entry by 500, giving 7 / 500 = 0.014. Dividing by the number of cases so far gives 7 / 10 = 0.7.","<code>np.cumsum(passed)</code> es el número de aciertos hasta el momento: 7 tras diez casos. La línea con el error divide cada entrada entre 500 y da 7 / 500 = 0.014. Al dividir por los casos corregidos hasta ese punto sale 7 / 10 = 0.7."]},
        {t:["Replace <code>np.cumsum(passed)</code> with <code>np.mean(passed)</code>","Sustituir <code>np.cumsum(passed)</code> por <code>np.mean(passed)</code>"], why:["<code>np.mean(passed)</code> is one number: the final score over all 500 cases. You would lose the case-by-case history that a running average exists to show.","<code>np.mean(passed)</code> es un solo número: la puntuación final de los 500 casos. Perderías la historia caso a caso que un promedio acumulado sirve para mostrar."]},
        {t:["Change the seed. This seed happened to give an unlucky sample","Cambiar la semilla. Esta semilla ha dado una muestra con mala suerte"], why:["A different seed gives different draws and the same bug. After 10 cases the value would still be passes ÷ 500, far too small.","Otra semilla da otros sorteos y el mismo error. Tras 10 casos el valor seguiría siendo aciertos ÷ 500, demasiado pequeño."]} ] } ],
  apply:{ seed:112, title:["\"The new agent scores 90%!\"","«¡El nuevo agente saca un 90 %!»"],
    body:[`<p>A teammate posts that number in the channel. You open the log and see they stopped after the first 20 cases. The full eval has 3,000 graded cases.</p>`,`<p>Un compañero publica ese número en el canal. Abres el registro y ves que paró tras los 20 primeros casos. La eval completa tiene 3000 casos corregidos.</p>`],
    cols:["case_id","category","passed","latency_ms","output_tokens"],
    gen:(r) => { const cats=[["billing",0.30,0.78],["refund",0.25,0.62],["login",0.20,0.81],["shipping",0.25,0.66]], rows=[]; for (let i=1;i<=3000;i++){ let u=r.u(), c=cats[3]; for (const k of cats){ if (u<k[1]) { c=k; break; } u-=k[1]; } const passed=r.u()<c[2]; const gz=Math.sqrt(-2*Math.log(1-r.u()))*Math.cos(2*Math.PI*r.u()); rows.push({case_id:"case-"+pad(i), category:c[0], passed, latency_ms:Math.round(Math.exp(7.1+0.55*gz)), output_tokens:Math.round(120+r.u()*380)}); } return rows; },
    task:["Find how long the score kept misleading. Set <code>answer</code> to the number of cases that had been graded the <em>last</em> time the running score was more than 2 points away from the final score.","Averigua cuánto tiempo siguió engañando la puntuación. Asigna a <code>answer</code> el número de casos corregidos la <em>última</em> vez que la puntuación acumulada estuvo a más de 2 puntos de la puntuación final."],
    hint:["<code>np.flatnonzero(off)</code> returns every position where <code>off</code> is True. The last one is at <code>[-1]</code>. Positions start at 0 and case counts start at 1, so <code>cases_so_far</code> at that position gives the count directly.","<code>np.flatnonzero(off)</code> devuelve todas las posiciones donde <code>off</code> es True. La última está en <code>[-1]</code>. Las posiciones empiezan en 0 y los casos se cuentan desde 1, así que <code>cases_so_far</code> en esa posición da el número directamente."],
    py:`import numpy as np

passed = df["passed"].to_numpy()
print(f"First 20 cases: {passed[:20].mean():.0%}")
print(f"All {len(passed)} cases: {passed.mean():.1%}")

#~ Running pass rate after 1 case, 2 cases, 3 cases, ... ~~ Tasa de aciertos acumulada tras 1 caso, 2 casos, 3 casos...
cases_so_far = np.arange(1, len(passed) + 1)
running = np.cumsum(passed) / cases_so_far

#~ True wherever the running score is more than 2 points from the final score ~~ True donde la puntuación acumulada está a más de 2 puntos de la final
off = np.abs(running - passed.mean()) > 0.02

#~ YOUR TURN: how many cases had been graded the LAST time off was True? ~~ TU TURNO: ¿cuántos casos se habían corregido la ÚLTIMA vez que off fue True?
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...","answer = cases_so_far[off][-1]"]],
    check:`import json as _j, numpy as _n
_p = df["passed"].to_numpy(); _r = _n.cumsum(_p) / _n.arange(1, len(_p) + 1)
_o = _n.abs(_r - _p.mean()) > 0.02; _w = _n.flatnonzero(_o); _e = int(_w[-1]) + 1
_a = globals().get("answer")
def _k():
    if _a is ... or _a is None: return "dots"
    if isinstance(_a, bool) or _n.ndim(_a) != 0: return "type"
    try: _v = float(_a)
    except Exception: return "type"
    if _v in (_e, _e + 1): return "ok"
    if _v == _e - 1: return "short"
    if _v == int(_w[0]) + 1: return "first"
    if _v == int(_o.sum()): return "count"
    if 0 < _v < 1: return "rate"
    return "_"
_j.dumps({"k": _k(), "e": _e, "s": _e - 1, "c": int(_o.sum()), "f": round(float(_p.mean()) * 100, 1), "x": round(_e / 20)})`,
    ok:["After the first 20 cases the score read 90%. The full 3,000 cases give {f}%. The running score was still more than 2 points off after {e} cases, about {x} times the size of your teammate's sample.","Tras los 20 primeros casos la puntuación marcaba 90 %. Los 3000 casos completos dan {f} %. La puntuación acumulada seguía a más de 2 puntos tras {e} casos, unas {x} veces el tamaño de la muestra de tu compañero."],
    msgs:{ type:["<code>answer</code> should be one whole number: a count of cases. Right now it is an array or another type. Pick out a single value.","<code>answer</code> debe ser un número entero: una cantidad de casos. Ahora es un array u otro tipo. Quédate con un solo valor."],
      short:["You are one short. {s} is the position in the array, and positions start at 0. The number of cases graded at that position is one more.","Te falta uno. {s} es la posición en el array, y las posiciones empiezan en 0. El número de casos corregidos en esa posición es uno más."],
      first:["That is the first time the running score was off. With one case graded the score is 0% or 100%, so it is always off at the start. The task asks for the last time.","Esa es la primera vez que la puntuación acumulada se desvió. Con un solo caso corregido la puntuación es 0 % o 100 %, así que al principio siempre se desvía. La tarea pide la última vez."],
      count:["{c} is how many times <code>off</code> was True in total. The task asks when it was True for the last time, which is a position, not a tally.","{c} es cuántas veces fue True <code>off</code> en total. La tarea pregunta cuándo fue True por última vez: una posición, no un recuento."],
      rate:["That looks like a pass rate. The answer is a count of cases, a whole number between 1 and 3,000.","Eso parece una tasa de aciertos. La respuesta es una cantidad de casos, un número entero entre 1 y 3000."] },
    tests:[[[["answer = ...","answer = np.flatnonzero(off)[-1]"]],"short"],[[["answer = ...","answer = np.flatnonzero(off)[0] + 1"]],"first"],[[["answer = ...","answer = off.sum()"]],"count"],[[["answer = ...","answer = np.flatnonzero(off)"]],"type"],[[["answer = ...","answer = passed.mean()"]],"rate"],[[["answer = ...","answer = oops"]],"err"]] },
  recap:{ takes:[["<b>An eval score is an estimate.</b> Your cases are a sample, and a different sample gives a different score even when the agent is unchanged.","<b>Una puntuación de eval es una estimación.</b> Tus casos son una muestra, y otra muestra da otra puntuación aunque el agente no cambie."],
      ["<b>Small samples are noisy.</b> A 70% agent on a 20-case eval lands anywhere from about 50% to 90%. A 10-point swing between two runs of 20 cases is ordinary.","<b>Las muestras pequeñas tienen ruido.</b> Un agente del 70 % en una eval de 20 casos cae en cualquier punto entre 50 % y 90 %. Un salto de 10 puntos entre dos ejecuciones de 20 casos es normal."],
      ["<b>More cases, steadier score.</b> The law of large numbers pulls the average toward the truth by outweighing early luck. It never pays back a streak.","<b>Más casos, puntuación más estable.</b> La ley de los grandes números acerca el promedio a la verdad porque diluye la suerte inicial. Nunca compensa una racha."]],
    f:[`<button class="sym" data-g="p3">x̄<sub>n</sub></button> = (<button class="sym" data-g="p1">x<sub>1</sub> + x<sub>2</sub> + … + x<sub>n</sub></button>) / <button class="sym" data-g="p2">n</button> &nbsp;→&nbsp; <button class="sym" data-g="p2">μ</button> &nbsp;as n grows`, `<button class="sym" data-g="p3">x̄<sub>n</sub></button> = (<button class="sym" data-g="p1">x<sub>1</sub> + x<sub>2</sub> + … + x<sub>n</sub></button>) / <button class="sym" data-g="p2">n</button> &nbsp;→&nbsp; <button class="sym" data-g="p2">μ</button> &nbsp;cuando n crece`],
    read:["Read it as: the score after n cases equals passes divided by cases, and it approaches the true pass rate as n grows.","Léela así: la puntuación tras n casos son los aciertos divididos por los casos, y se acerca a la tasa real a medida que n crece."],
    syms:[ {s:"x<sub>i</sub>", g:"p1", d:["One graded case: 1 for a pass, 0 for a fail. One square in the 20-case grid.","Un caso corregido: 1 si pasa, 0 si falla. Un cuadro de la cuadrícula de 20 casos."]},
      {s:"n", g:"p2", d:["The sample size. The \"cases per eval\" slider.","El tamaño de la muestra. El control «casos por eval»."]},
      {s:"x̄<sub>n</sub>", g:"p3", d:["Said \"x bar\". The eval score after n cases: the moving line in the running-average chart, and <code>passed.mean()</code> in the code.","Se lee «x barra». La puntuación tras n casos: la línea que se mueve en el gráfico del promedio acumulado, y <code>passed.mean()</code> en el código."]},
      {s:"μ", g:"p2", d:["Said \"mew\". The true pass rate: the dashed line in both charts.","Se lee «mu». La tasa real de aciertos: la línea discontinua de los dos gráficos."]} ],
    next:["Intermediate 1 gives the exact rule you saw here: four times the cases gives half the typical miss. That rule puts error bars on any eval score.","Intermedio 1 da la regla exacta que viste aquí: cuatro veces más casos dan la mitad de error típico. Esa regla pone barras de error a cualquier puntuación."],
    deeper:[SRC.st("basic-probability","Basic Probability","Probabilidad básica"), SRC.rp] },
  gloss:[ [["Eval","Eval"],["A fixed set of test cases you run your AI system on, each graded pass or fail.","Un conjunto fijo de casos de prueba sobre el que ejecutas tu sistema de IA, cada uno corregido como pasa o falla."],"hook"],
    [["Sample","Muestra"],["The cases you actually graded. They stand in for all the cases your system will ever meet.","Los casos que has corregido de verdad. Representan todos los casos que verá tu sistema."],"hook"],
    [["Sample size (n)","Tamaño de la muestra (n)"],["How many cases are in your sample.","Cuántos casos hay en tu muestra."],"p1"],
    [["True pass rate","Tasa real de aciertos"],["The share of all possible cases your system would pass. You estimate it from a sample.","La proporción de todos los casos posibles que pasaría tu sistema. La estimas a partir de una muestra."],"p1"],
    [["Noise","Ruido"],["The run-to-run wobble in a score that comes only from which cases happened to land in the sample.","El vaivén de una puntuación entre ejecuciones que se debe solo a qué casos cayeron en la muestra."],"p1"],
    [["Law of large numbers","Ley de los grandes números"],["The more cases you average over, the closer the average gets to the true value.","Cuantos más casos promedias, más se acerca el promedio al valor real."],"p3"],
    [["Seed","Semilla"],["A number that fixes a random generator so the same code produces the same random draws every time.","Un número que fija un generador aleatorio para que el mismo código produzca siempre los mismos sorteos."],"code"],
    [["Gambler's fallacy","Falacia del jugador"],["The mistaken belief that after a streak of fails, a pass is due. Each case is a fresh draw.","La creencia errónea de que tras una racha de fallos ya toca un acierto. Cada caso es un sorteo nuevo."],"q3"] ]
});

/* ================= Basic 5 ================= */
L({ id:"b5", title:["Conditional probability and Bayes' rule","Probabilidad condicional y regla de Bayes"], q:["Why does a 95%-accurate guardrail raise mostly false alarms?","¿Por qué un filtro con 95 % de acierto da sobre todo falsas alarmas?"],
  hook:{ answer:2, title:["The guardrail is 95% accurate. The review queue is full of innocent messages.","El filtro acierta el 95 %. La cola de revisión está llena de mensajes inocentes."],
    body:[`<p>You ship a guardrail: a classifier that flags harmful messages before they reach your agent. In testing it caught 95% of harmful messages and wrongly flagged only 5% of safe ones.</p><p>In production about 1 message in 100 is truly harmful. That share is the <dfn>base rate</dfn>: how common the thing is before you look at any evidence.</p>`,
      `<p>Despliegas un filtro: un clasificador que marca los mensajes dañinos antes de que lleguen a tu agente. En las pruebas detectó el 95 % de los mensajes dañinos y marcó por error solo el 5 % de los seguros.</p><p>En producción, más o menos 1 mensaje de cada 100 es realmente dañino. Esa proporción es la <dfn>tasa base</dfn>: lo frecuente que es algo antes de mirar ninguna evidencia.</p>`],
    legend:["Predict: the guardrail flags a message. How likely is it that the message is truly harmful?","Predice: el filtro marca un mensaje. ¿Qué probabilidad hay de que sea realmente dañino?"],
    opts:[["About 95 in 100","Unas 95 de cada 100"],["About 1 in 2","Más o menos 1 de cada 2"],["About 1 in 6","Más o menos 1 de cada 6"]],
    reveal:["With a 1% base rate, about 1 flag in 6 is a true alarm. Safe messages are so much more common that 5% of them outnumber 95% of the harmful ones.","Con una tasa base del 1 %, más o menos 1 marca de cada 6 es una alarma real. Los mensajes seguros son tantos que el 5 % de ellos supera al 95 % de los dañinos."] },
  plays:[ { w:"bayes", title:["1,000 messages, one square each","1000 mensajes, un cuadro cada uno"],
      intro:[`<p>Each square is one message. Solid orange squares are harmful messages the guardrail caught. Blue squares are safe messages it flagged by mistake. A <dfn>conditional probability</dfn> is a probability inside a subgroup: here, among flagged messages only. Start at a 1% base rate, then drag it to 10% or more.</p>`,`<p>Cada cuadro es un mensaje. Los cuadros naranjas rellenos son mensajes dañinos que el filtro detectó. Los azules son mensajes seguros que marcó por error. Una <dfn>probabilidad condicional</dfn> es una probabilidad dentro de un subgrupo: aquí, solo entre los mensajes marcados. Empieza con una tasa base del 1 % y luego súbela al 10 % o más.</p>`],
      notice:["the guardrail itself never changes when you drag the base rate. Only the mix of messages does, and the big number swings from under 20% to over 70%.","el filtro no cambia al mover la tasa base. Solo cambia la mezcla de mensajes, y el número grande pasa de menos del 20 % a más del 70 %."],
      done:["The same classifier is useless in one product and excellent in another. Always ask how common the thing is.","El mismo clasificador es inútil en un producto y excelente en otro. Pregunta siempre cómo de frecuente es lo que buscas."] } ],
  code:{ title:["Count instead of reasoning","Cuenta en lugar de razonar"],
    intro:[`<p>You do not need a formula to get the answer. Simulate 100,000 messages and count. Fill the gap so the code looks only at flagged messages.</p>`,`<p>No hace falta una fórmula para obtener la respuesta. Simula 100 000 mensajes y cuenta. Rellena el hueco para que el código mire solo los mensajes marcados.</p>`],
    py:`import numpy as np

rng = np.random.default_rng(seed=21)
n = 100_000                       #~ messages ~~ mensajes
base_rate = 0.01                  #~ 1% are truly harmful ~~ el 1 % es realmente dañino
harmful = rng.random(n) < base_rate
#~ "95% accurate": flags 95% of harmful and 5% of safe messages ~~ «95 % de acierto»: marca el 95 % de los dañinos y el 5 % de los seguros
flagged = np.where(harmful, rng.random(n) < 0.95, rng.random(n) < 0.05)

print("flagged:", flagged.sum(), "| harmful:", harmful.sum())
#~ GAP: among FLAGGED messages only, what share is truly harmful? ~~ HUECO: solo entre los mensajes MARCADOS, ¿qué proporción es realmente dañina?
share = harmful[____].mean()
print(f"P(harmful | flagged) = {share:.1%}")
`,
    dart:`import 'dart:math';

void main() {
  final rng = Random(21);
  const n = 100000; //~ messages ~~ mensajes
  const baseRate = 0.01; //~ 1% are truly harmful ~~ el 1 % es realmente dañino
  var flagged = 0, flaggedAndHarmful = 0;
  for (var i = 0; i < n; i++) {
    final harmful = rng.nextDouble() < baseRate;
    //~ flags 95% of harmful and 5% of safe messages ~~ marca el 95 % de los dañinos y el 5 % de los seguros
    final isFlagged = rng.nextDouble() < (harmful ? 0.95 : 0.05);
    if (isFlagged) {
      flagged++;
      if (harmful) flaggedAndHarmful++;
    }
  }
  //~ among flagged messages only ~~ solo entre los mensajes marcados
  final share = (100 * flaggedAndHarmful / flagged).toStringAsFixed(1);
  print('flagged: $flagged');
  print('P(harmful | flagged) = $share%');
}
`,
    sol:[["____","flagged"]], check:`"ok" if abs(share - harmful[flagged].mean()) < 1e-12 else ("self" if share == 1.0 else ("neg" if share < 0.01 else "no"))`,
    ok:["About 16% of flagged messages are harmful. The vertical bar in P(harmful | flagged) reads \"given\": the probability of harmful, counting only flagged messages.","Alrededor del 16 % de los mensajes marcados son dañinos. La barra vertical de P(dañino | marcado) se lee «dado»: la probabilidad de dañino contando solo los mensajes marcados."],
    msgs:{ self:["You selected the harmful messages and asked what share of them is harmful, which is always 100%. Select the flagged ones.","Has seleccionado los mensajes dañinos y preguntado qué proporción de ellos es dañina: siempre el 100 %. Selecciona los marcados."],
      neg:["That is the share of harmful messages among the ones that were not flagged. Remove the negation.","Esa es la proporción de mensajes dañinos entre los que no se marcaron. Quita la negación."] },
    tests:[["harmful","self"],["~flagged","neg"]] },
  qs:[
    { kind:"mc", title:["Two probabilities that sound alike","Dos probabilidades que suenan igual"], body:[`<p>The vendor's page says: "Our guardrail flags 95% of harmful messages."</p>`,`<p>La página del proveedor dice: «Nuestro filtro marca el 95 % de los mensajes dañinos».</p>`], legend:["Which statement follows?","¿Qué afirmación se deduce?"],
      opts:[ {t:["95% of flagged messages are harmful","El 95 % de los mensajes marcados son dañinos"], why:["This flips the condition. \"Of harmful, 95% are flagged\" and \"of flagged, 95% are harmful\" are different numbers. The second depends on the base rate, which the vendor does not know.","Esto invierte la condición. «De los dañinos, el 95 % se marca» y «de los marcados, el 95 % es dañino» son números distintos. El segundo depende de la tasa base, que el proveedor no conoce."]},
        {t:["Of 100 harmful messages, about 95 get flagged. How many flags are right depends on your traffic","De 100 mensajes dañinos, se marcan unos 95. Cuántas marcas son correctas depende de tu tráfico"], ok:true, why:["The claim is P(flagged | harmful). What your reviewers experience is P(harmful | flagged), and that needs the base rate and the false alarm rate too.","La afirmación es P(marcado | dañino). Lo que viven tus revisores es P(dañino | marcado), y para eso hacen falta también la tasa base y la tasa de falsas alarmas."]},
        {t:["5% of all messages will be flagged","Se marcará el 5 % de todos los mensajes"], why:["The share of all messages that get flagged mixes true alarms and false alarms, and depends on how many messages are harmful. The 95% says nothing about safe messages.","La proporción de mensajes marcados mezcla alarmas reales y falsas, y depende de cuántos mensajes son dañinos. El 95 % no dice nada sobre los mensajes seguros."]} ] },
    { kind:"predict", run:true, title:["Bayes by counting","Bayes contando"], code:`harmful, safe = 20, 980
true_alarms = harmful * 0.9
false_alarms = safe * 0.1
print(round(true_alarms / (true_alarms + false_alarms), 2))`,
      opts:[ {t:"0.16", ok:true, why:["18 true alarms and 98 false alarms make 116 flags. 18 / 116 is about 0.16. Counting people or messages is the easiest way to do Bayes' rule.","18 alarmas reales y 98 falsas hacen 116 marcas. 18 / 116 es más o menos 0.16. Contar personas o mensajes es la forma más fácil de aplicar la regla de Bayes."]},
        {t:"0.9", why:["0.9 is the share of harmful messages that get flagged. The code divides true alarms by all alarms, and the 98 false alarms dominate.","0.9 es la proporción de mensajes dañinos que se marcan. El código divide las alarmas reales entre todas las alarmas, y las 98 falsas dominan."]},
        {t:"0.18", why:["18 is the number of true alarms. The code divides it by the total number of alarms, 18 + 98 = 116.","18 es el número de alarmas reales. El código lo divide por el total de alarmas, 18 + 98 = 116."]},
        {t:"0.02", why:["0.02 is the base rate: 20 harmful out of 1,000. A flag raises the probability from 2% to about 16%, which is a real update, just far from certainty.","0.02 es la tasa base: 20 dañinos de 1000. Una marca sube la probabilidad del 2 % a alrededor del 16 %: es una actualización real, pero queda lejos de la certeza."]} ] },
    { kind:"fix", title:["The report says precision is 95%","El informe dice que la precisión es 95 %"], body:[`<p><code>harmful</code> and <code>flagged</code> are True/False arrays. This line is meant to print the share of flags that are correct.</p>`,`<p><code>harmful</code> y <code>flagged</code> son arrays de True/False. Esta línea pretende imprimir la proporción de marcas que son correctas.</p>`], code:`print(flagged[harmful].mean())`, legend:["Which replacement prints what the report claims?","¿Qué sustitución imprime lo que afirma el informe?"],
      opts:[ {t:["<code>print(harmful[flagged].mean())</code>","<code>print(harmful[flagged].mean())</code>"], ok:true, why:["The brackets choose the subgroup. <code>flagged[harmful]</code> looks at harmful messages and asks how many were flagged. <code>harmful[flagged]</code> looks at flagged messages and asks how many are harmful.","Los corchetes eligen el subgrupo. <code>flagged[harmful]</code> mira los mensajes dañinos y pregunta cuántos se marcaron. <code>harmful[flagged]</code> mira los marcados y pregunta cuántos son dañinos."]},
        {t:["<code>print((flagged &amp; harmful).mean())</code>","<code>print((flagged &amp; harmful).mean())</code>"], why:["That is the share of all messages that are both flagged and harmful, about 1%. To get a share among flags, divide by the number of flags.","Esa es la proporción de todos los mensajes que están marcados y además son dañinos, alrededor del 1 %. Para obtener una proporción entre las marcas, divide por el número de marcas."]},
        {t:["<code>print(flagged.mean())</code>","<code>print(flagged.mean())</code>"], why:["That is the share of all messages that get flagged. It says nothing about whether the flags are right.","Esa es la proporción de todos los mensajes que se marcan. No dice nada sobre si las marcas son correctas."]} ] } ],
  apply:{ seed:74, title:["Is the review queue worth the reviewers' time?","¿Merece la cola de revisión el tiempo de los revisores?"],
    body:[`<p>Human reviewers have labelled 5,000 production messages. For each one you know whether the guardrail flagged it and whether it was truly harmful.</p>`,`<p>Revisores humanos han etiquetado 5000 mensajes de producción. De cada uno sabes si el filtro lo marcó y si era realmente dañino.</p>`],
    cols:["msg_id","channel","flagged","truly_harmful"],
    gen:(r) => Array.from({length:5000}, (_,i) => { const h = r.u() < 0.03; return {msg_id:"msg-"+pad(i+1), channel:r.pick(["chat","email","api"],[.6,.25,.15]), flagged: r.u() < (h ? 0.9 : 0.06), truly_harmful:h}; }),
    task:["Set <code>answer</code> to the share of <b>flagged</b> messages that are truly harmful, between 0 and 1.","Asigna a <code>answer</code> la proporción de mensajes <b>marcados</b> que son realmente dañinos, entre 0 y 1."],
    hint:["First keep only the flagged rows: <code>df[df[\"flagged\"]]</code>. Then take the mean of <code>truly_harmful</code> in those rows.","Quédate primero con las filas marcadas: <code>df[df[\"flagged\"]]</code>. Después toma la media de <code>truly_harmful</code> en esas filas.",],
    py:`import pandas as pd

print("base rate:", df["truly_harmful"].mean())
print(pd.crosstab(df["truly_harmful"], df["flagged"]))

#~ YOUR TURN: of the flagged messages, what share is truly harmful? ~~ TU TURNO: de los mensajes marcados, ¿qué proporción es realmente dañina?
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...",'answer = df[df["flagged"]]["truly_harmful"].mean()']],
    check: chk(`df[df["flagged"]]["truly_harmful"].mean()`, {flip:`df[df["truly_harmful"]]["flagged"].mean()`, base:`df["truly_harmful"].mean()`, joint:`(df["flagged"] & df["truly_harmful"]).mean()`, pct:`df[df["flagged"]]["truly_harmful"].mean() * 100`}, {e:`round(_e * 100, 1)`, r:`round(float(df[df["truly_harmful"]]["flagged"].mean()) * 100, 1)`, n:`int(df["flagged"].sum())`}),
    ok:["Of {n} flagged messages, {e}% are truly harmful. The guardrail catches {r}% of harmful messages, yet most of what it sends to review is safe. Both numbers belong in the report.","De {n} mensajes marcados, el {e} % es realmente dañino. El filtro detecta el {r} % de los mensajes dañinos, y aun así la mayor parte de lo que manda a revisión es seguro. Los dos números tienen que estar en el informe."],
    msgs:{ type:TYPE_MSG, pct:PCT_MSG, flip:["That is the share of harmful messages that got flagged ({r}%). The task asks the reverse: among flagged messages, how many are harmful.","Esa es la proporción de mensajes dañinos que se marcaron ({r} %). La tarea pide lo contrario: entre los mensajes marcados, cuántos son dañinos."],
      base:["That is the base rate: the share of all messages that are harmful. Restrict to flagged rows first.","Esa es la tasa base: la proporción de todos los mensajes que son dañinos. Quédate antes con las filas marcadas."],
      joint:["That is the share of all 5,000 messages that are flagged and harmful. Divide by the number of flagged messages, or filter first.","Esa es la proporción de los 5000 mensajes que están marcados y son dañinos. Divide por el número de mensajes marcados, o filtra primero."] },
    tests:[[[["answer = ...",'answer = df[df["truly_harmful"]]["flagged"].mean()']],"flip"],[[["answer = ...",'answer = df["truly_harmful"].mean()']],"base"]] },
  recap:{ takes:[["<b>A conditional probability lives inside a subgroup.</b> P(harmful | flagged) counts only flagged messages.","<b>Una probabilidad condicional vive dentro de un subgrupo.</b> P(dañino | marcado) cuenta solo los mensajes marcados."],
      ["<b>Flipping the condition changes the number.</b> P(flagged | harmful) can be 95% while P(harmful | flagged) is 16%.","<b>Invertir la condición cambia el número.</b> P(marcado | dañino) puede ser 95 % mientras P(dañino | marcado) es 16 %."],
      ["<b>Base rates decide.</b> When the thing you look for is rare, most alarms are false, however good the classifier.","<b>La tasa base manda.</b> Cuando lo que buscas es raro, casi todas las alarmas son falsas, por bueno que sea el clasificador."]],
    f:`<button class="sym" data-g="p1">P(H | F)</button> = <button class="sym" data-g="p1">P(F | H)</button> × <button class="sym" data-g="p1">P(H)</button> / <button class="sym" data-g="p1">P(F)</button>`,
    read:["Read it as: the chance a flagged message is harmful equals the catch rate times the base rate, divided by the share of all messages that get flagged.","Léela así: la probabilidad de que un mensaje marcado sea dañino es la tasa de detección por la tasa base, dividida por la proporción de todos los mensajes que se marcan."],
    syms:[ {s:"P(H | F)", g:"p1", d:["Harmful given flagged: the big number above the grid.","Dañino dado marcado: el número grande sobre la cuadrícula."]},
      {s:"P(F | H)", g:"p1", d:["Flagged given harmful: the \"catches\" slider.","Marcado dado dañino: el control de «detecta»."]},
      {s:"P(H)", g:"p1", d:["The base rate slider.","El control de la tasa base."]},
      {s:"P(F)", g:"p1", d:["The share of all squares that are flagged: solid orange plus blue.","La proporción de cuadros marcados: los naranjas rellenos más los azules."]} ],
    next:["Basic 6 gives you the pandas moves to compute these subgroup shares on any eval table.","Básico 6 te da los movimientos de pandas para calcular estas proporciones por subgrupo en cualquier tabla de evals."],
    deeper:[SRC.st("compound-probability","Compound Probability (conditional probability)","Probabilidad compuesta (probabilidad condicional)"), SRC.st("bayesian-inference","Bayesian Inference (Bayes' theorem)","Inferencia bayesiana (teorema de Bayes)")] },
  gloss:[ [["Base rate","Tasa base"],["How common something is before you look at any evidence.","Lo frecuente que es algo antes de mirar ninguna evidencia."],"hook"],
    [["Guardrail","Filtro de seguridad (guardrail)"],["A classifier that checks inputs or outputs of an AI system and flags the ones it judges harmful.","Un clasificador que revisa las entradas o salidas de un sistema de IA y marca las que considera dañinas."],"hook"],
    [["Conditional probability","Probabilidad condicional"],["A probability computed inside a subgroup. P(A | B) is the chance of A counting only the cases where B holds.","Una probabilidad calculada dentro de un subgrupo. P(A | B) es la probabilidad de A contando solo los casos en que se cumple B."],"p1"],
    [["Bayes' rule","Regla de Bayes"],["The rule that turns P(evidence | cause) into P(cause | evidence) using the base rate.","La regla que convierte P(evidencia | causa) en P(causa | evidencia) usando la tasa base."],"recap"] ]
});

/* ================= Basic 6 ================= */
L({ id:"b6", title:["NumPy and pandas essentials","Lo esencial de NumPy y pandas"], q:["How do I load, filter, group and summarise an eval table?","¿Cómo cargo, filtro, agrupo y resumo una tabla de evals?"],
  hook:{ answer:1, title:["\"Which model is better on refund questions?\"","«¿Qué modelo es mejor en preguntas de reembolsos?»"],
    body:[`<p>Your PM asks that in standup. You have a CSV with one row per eval case: the model, the category, whether it passed, and the latency.</p><p>Every statistic in this course starts from a table like this one. In pandas a table is called a <dfn>DataFrame</dfn>, and three moves answer most questions: <dfn>filter</dfn> rows, <dfn>group</dfn> them, and summarise each group.</p>`,
      `<p>Tu PM lo pregunta en la reunión diaria. Tienes un CSV con una fila por caso de eval: el modelo, la categoría, si pasó y la latencia.</p><p>Toda la estadística de este curso parte de una tabla como esta. En pandas una tabla se llama <dfn>DataFrame</dfn>, y tres movimientos responden casi todas las preguntas: <dfn>filtrar</dfn> filas, <dfn>agruparlas</dfn> y resumir cada grupo.</p>`],
    legend:["Predict: what does <code>df.groupby(\"model\")[\"passed\"].mean()</code> give you?","Predice: ¿qué devuelve <code>df.groupby(\"model\")[\"passed\"].mean()</code>?"],
    opts:[["One number: the overall pass rate","Un número: la tasa de aciertos global"],["One pass rate per model","Una tasa de aciertos por modelo"],["The table with failed rows removed","La tabla sin las filas que fallan"]],
    reveal:["Grouping splits the rows by model, and the mean of the True/False column inside each group is that group's pass rate. One line of code, one number per model.","Agrupar reparte las filas por modelo, y la media de la columna True/False dentro de cada grupo es la tasa de aciertos de ese grupo. Una línea de código, un número por modelo."] },
  plays:[ { w:"table", title:["Build the query with menus, read the code it writes","Construye la consulta con menús y lee el código que escribe"],
      intro:[`<p>This table has 240 eval rows. Use the menus to filter and group. The grey line shows the pandas code for exactly what you selected, and the chart shows its result. Try at least one filter and one group-by.</p>`,`<p>Esta tabla tiene 240 filas de eval. Usa los menús para filtrar y agrupar. La línea gris muestra el código de pandas de lo que has seleccionado y el gráfico muestra su resultado. Prueba al menos un filtro y una agrupación.</p>`],
      notice:["a filter goes inside square brackets, a group-by comes after it, and the summary comes last. The code reads left to right in the order you think.","un filtro va dentro de los corchetes, la agrupación viene después y el resumen al final. El código se lee de izquierda a derecha, en el orden en que piensas."],
      done:["Filter, group, summarise. Nearly every analysis in the next lessons is some combination of these three.","Filtrar, agrupar, resumir. Casi todos los análisis de las próximas lecciones combinan estos tres pasos."] } ],
  code:{ title:["Your first eval table","Tu primera tabla de evals"], pkgs:["numpy","pandas"],
    intro:[`<p>This cell builds a 600-row table, looks at the first rows, counts with a filter and computes a pass rate per group. Fill the gap with the column to group by so you get one pass rate per model.</p>`,`<p>Esta celda crea una tabla de 600 filas, mira las primeras, cuenta con un filtro y calcula una tasa de aciertos por grupo. Rellena el hueco con la columna por la que agrupar para obtener una tasa por modelo.</p>`],
    py:`import numpy as np
import pandas as pd

rng = np.random.default_rng(seed=8)
n = 600
df = pd.DataFrame({
    "model": rng.choice(["small", "large"], size=n),
    "category": rng.choice(["billing", "refund", "login"], size=n),
    "latency_ms": rng.lognormal(6.8, 0.5, size=n).round(),
})
df["passed"] = rng.random(n) < np.where(df["model"] == "large", 0.82, 0.68)

print(df.head(3))                                   #~ first rows ~~ primeras filas
print("rows:", len(df), "| refund rows:", (df["category"] == "refund").sum())
#~ GAP: one pass rate per model ~~ HUECO: una tasa de aciertos por modelo
by_model = df.groupby("____")["passed"].mean()
print(by_model.round(3))
`,
    dart:`import 'dart:math';

void main() {
  final rng = Random(8);
  //~ A table as a list of maps: one map per row ~~ Una tabla como lista de mapas: un mapa por fila
  final rows = [
    for (var i = 0; i < 600; i++)
      {
        'model': rng.nextBool() ? 'small' : 'large',
        'category': ['billing', 'refund', 'login'][rng.nextInt(3)],
      }
  ];
  for (final row in rows) {
    row['passed'] = (rng.nextDouble() < (row['model'] == 'large' ? 0.82 : 0.68)).toString();
  }

  final refunds = rows.where((r) => r['category'] == 'refund').length; //~ filter ~~ filtrar
  print('rows: 600 | refund rows: $refunds');

  //~ group by model, then average ~~ agrupar por modelo y después promediar
  for (final model in ['large', 'small']) {
    final group = rows.where((r) => r['model'] == model).toList();
    final passed = group.where((r) => r['passed'] == 'true').length;
    final rate = (passed / group.length).toStringAsFixed(3);
    print('$model $rate');
  }
}
`,
    sol:[["____","model"]], check:`"ok" if list(by_model.index) == ["large", "small"] else ("cat" if "billing" in by_model.index else "no")`,
    ok:["One row per model, with the large model near 0.82 and the small one near 0.68. <code>groupby</code> split the rows, and <code>.mean()</code> of a True/False column gave each group's pass rate.","Una fila por modelo, con el modelo grande cerca de 0.82 y el pequeño cerca de 0.68. <code>groupby</code> repartió las filas y el <code>.mean()</code> de una columna True/False dio la tasa de aciertos de cada grupo."],
    msgs:{ cat:["You grouped by category, so you got one pass rate per category. The question is about models.","Has agrupado por categoría y has obtenido una tasa por categoría. La pregunta es sobre los modelos."],
      err:["A KeyError means that column name does not exist. The columns are model, category, latency_ms and passed.","Un KeyError significa que no existe una columna con ese nombre. Las columnas son model, category, latency_ms y passed."] },
    tests:[["category","cat"],["modelo","err"]] },
  qs:[
    { kind:"mc", title:["What a filter really is","Qué es de verdad un filtro"], body:[`<p>You write <code>df[df["passed"]]</code>, where <code>passed</code> is a True/False column.</p>`,`<p>Escribes <code>df[df["passed"]]</code>, donde <code>passed</code> es una columna True/False.</p>`], legend:["What comes back?","¿Qué devuelve?"],
      opts:[ {t:["Only the rows where passed is True, with all columns","Solo las filas donde passed es True, con todas las columnas"], ok:true, why:["The inner <code>df[\"passed\"]</code> is a column of True/False, called a mask. Putting it in the outer brackets keeps the rows where the mask is True.","El <code>df[\"passed\"]</code> interior es una columna de True/False, llamada máscara. Al ponerla en los corchetes exteriores se conservan las filas donde la máscara es True."]},
        {t:["Only the passed column","Solo la columna passed"], why:["That would be <code>df[\"passed\"]</code>, with a column name in the brackets. Here the brackets hold True/False values, which select rows.","Eso sería <code>df[\"passed\"]</code>, con el nombre de una columna en los corchetes. Aquí los corchetes contienen valores True/False, que seleccionan filas."]},
        {t:["The pass rate","La tasa de aciertos"], why:["A filter returns rows. To get the pass rate, take <code>df[\"passed\"].mean()</code>.","Un filtro devuelve filas. Para la tasa de aciertos, usa <code>df[\"passed\"].mean()</code>."]} ] },
    { kind:"predict", run:true, title:["Filter, then count","Filtra y cuenta"], code:`import pandas as pd
df = pd.DataFrame({"model": ["a", "a", "b", "b", "b"],
                   "passed": [True, False, True, True, False]})
print(df[df["model"] == "b"]["passed"].sum(), len(df))`,
      opts:[ {t:"2 5", ok:true, why:["Three rows have model b, and two of those passed, so the sum of True values is 2. <code>len(df)</code> is the unfiltered table: 5 rows. Filtering returns a new table and leaves <code>df</code> alone.","Tres filas tienen el modelo b y dos de ellas pasan, así que la suma de True es 2. <code>len(df)</code> es la tabla sin filtrar: 5 filas. Filtrar devuelve una tabla nueva y no modifica <code>df</code>."]},
        {t:"3 5", why:["3 is the number of rows with model b. <code>.sum()</code> on the passed column counts only the True ones among them: 2.","3 es el número de filas con el modelo b. <code>.sum()</code> sobre la columna passed cuenta solo las True entre ellas: 2."]},
        {t:"2 3", why:["The first number is right. <code>len(df)</code> still measures the original table, because a filter never changes it.","El primer número es correcto. <code>len(df)</code> sigue midiendo la tabla original, porque un filtro nunca la cambia."]},
        {t:"0.67 5", why:["0.67 would be the mean, the pass rate of model b. The code calls <code>.sum()</code>, which counts the passes.","0.67 sería la media, la tasa de aciertos del modelo b. El código llama a <code>.sum()</code>, que cuenta los aciertos."]} ] },
    { kind:"fix", title:["Two conditions, one error","Dos condiciones, un error"], body:[`<p>This line should keep rows of the large model that passed. It raises <code>ValueError: The truth value of a Series is ambiguous</code>.</p>`,`<p>Esta línea debería quedarse con las filas del modelo large que pasan. Lanza <code>ValueError: The truth value of a Series is ambiguous</code>.</p>`], code:`good = df[df["model"] == "large" and df["passed"]]`, legend:["Which version works?","¿Qué versión funciona?"],
      opts:[ {t:["<code>df[(df[\"model\"] == \"large\") &amp; df[\"passed\"]]</code>","<code>df[(df[\"model\"] == \"large\") &amp; df[\"passed\"]]</code>"], ok:true, why:["Python's <code>and</code> wants one True or False, and a column holds many. <code>&amp;</code> combines two columns row by row. The parentheses are needed because <code>&amp;</code> binds tighter than <code>==</code>.","El <code>and</code> de Python espera un único True o False, y una columna contiene muchos. <code>&amp;</code> combina dos columnas fila a fila. Los paréntesis hacen falta porque <code>&amp;</code> tiene más prioridad que <code>==</code>."]},
        {t:["<code>df[df[\"model\"] == \"large\" &amp; df[\"passed\"]]</code>","<code>df[df[\"model\"] == \"large\" &amp; df[\"passed\"]]</code>"], why:["Right operator, missing parentheses. Without them Python evaluates <code>\"large\" &amp; df[\"passed\"]</code> first, which fails.","El operador es el correcto, pero faltan los paréntesis. Sin ellos Python evalúa primero <code>\"large\" &amp; df[\"passed\"]</code>, y eso falla."]},
        {t:["<code>df[df[\"model\"] == \"large\"] and df[df[\"passed\"]]</code>","<code>df[df[\"model\"] == \"large\"] and df[df[\"passed\"]]</code>"], why:["This builds two separate tables and joins them with <code>and</code>, which raises the same error. Combine the conditions inside one pair of brackets.","Esto crea dos tablas separadas y las une con <code>and</code>, que lanza el mismo error. Combina las condiciones dentro de un solo par de corchetes."]} ] } ],
  apply:{ seed:85, title:["Answer the PM","Responde a tu PM"],
    body:[`<p>Here is the eval table: 1,200 cases across two models and four categories. The PM asked about the large model on refund questions.</p>`,`<p>Esta es la tabla de evals: 1200 casos, dos modelos y cuatro categorías. Tu PM preguntó por el modelo grande en preguntas de reembolsos.</p>`],
    cols:["case_id","model","category","passed","latency_ms"],
    gen:(r) => Array.from({length:1200}, (_,i) => { const model = r.pick(["small","large"]), category = r.pick(["billing","refund","login","shipping"]); const p = {billing:.8,refund:.58,login:.86,shipping:.72}[category] + (model==="large" ? (category==="refund" ? .2 : .05) : -.04); return {case_id:"case-"+pad(i+1), model, category, passed:r.u()<p, latency_ms:Math.round((model==="large"?1400:650)*Math.exp(.4*r.n()))}; }),
    task:["Set <code>answer</code> to the pass rate (between 0 and 1) of the <b>large</b> model on <b>refund</b> cases.","Asigna a <code>answer</code> la tasa de aciertos (entre 0 y 1) del modelo <b>large</b> en los casos de <b>refund</b>."],
    hint:["Combine two conditions with <code>&amp;</code> and parentheses: <code>df[(cond1) &amp; (cond2)]</code>. Then take the mean of <code>passed</code>.","Combina dos condiciones con <code>&amp;</code> y paréntesis: <code>df[(cond1) &amp; (cond2)]</code>. Después toma la media de <code>passed</code>."],
    py:`import pandas as pd

#~ The overview: pass rate for every model and category ~~ La vista general: tasa de aciertos por modelo y categoría
print(df.groupby(["category", "model"])["passed"].mean().round(3))

#~ YOUR TURN: pass rate of the large model on refund cases ~~ TU TURNO: tasa de aciertos del modelo large en los casos refund
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...",'answer = df[(df["model"] == "large") & (df["category"] == "refund")]["passed"].mean()']],
    check: chk(`df[(df["model"] == "large") & (df["category"] == "refund")]["passed"].mean()`, {model:`df[df["model"] == "large"]["passed"].mean()`, cat:`df[df["category"] == "refund"]["passed"].mean()`, small:`df[(df["model"] == "small") & (df["category"] == "refund")]["passed"].mean()`, pct:`df[(df["model"] == "large") & (df["category"] == "refund")]["passed"].mean() * 100`}, {e:`round(_e * 100, 1)`, s:`round(float(df[(df["model"] == "small") & (df["category"] == "refund")]["passed"].mean()) * 100, 1)`, n:`int(((df["model"] == "large") & (df["category"] == "refund")).sum())`}),
    ok:["The large model passes {e}% of refund cases, against {s}% for the small one. That answer rests on {n} rows. Intermediate 1 shows how to put error bars on it.","El modelo grande pasa el {e} % de los casos de reembolsos, frente al {s} % del pequeño. Esa respuesta se apoya en {n} filas. Intermedio 1 enseña a ponerle barras de error."],
    msgs:{ type:TYPE_MSG, pct:PCT_MSG, model:["That is the large model across all categories. Add the second condition for refund cases.","Ese es el modelo large en todas las categorías. Añade la segunda condición para los casos refund."],
      cat:["That is the refund pass rate for both models together. Add the condition for the large model.","Esa es la tasa de refund para los dos modelos juntos. Añade la condición del modelo large."],
      small:["That is the small model on refund cases. The question is about the large one.","Ese es el modelo small en los casos refund. La pregunta es sobre el large."] },
    tests:[[[["answer = ...",'answer = df[df["model"] == "large"]["passed"].mean()']],"model"],[[["answer = ...",'answer = df[df["category"] == "refund"]["passed"].mean()']],"cat"]] },
  recap:{ takes:[["<b>A DataFrame is a table.</b> One row per case, one column per thing you recorded.","<b>Un DataFrame es una tabla.</b> Una fila por caso, una columna por cada cosa que registraste."],
      ["<b>Filter with a True/False mask.</b> <code>df[condition]</code> keeps rows; combine conditions with <code>&amp;</code> and parentheses.","<b>Filtra con una máscara True/False.</b> <code>df[condición]</code> conserva filas; combina condiciones con <code>&amp;</code> y paréntesis."],
      ["<b>Group, then summarise.</b> The mean of a True/False column is a pass rate, overall or per group.","<b>Agrupa y después resume.</b> La media de una columna True/False es una tasa de aciertos, global o por grupo."]],
    f:[`pass rate of <button class="sym" data-g="p1">group g</button> = <button class="sym" data-g="p1">passes in g</button> / <button class="sym" data-g="p1">rows in g</button>`, `tasa de aciertos del <button class="sym" data-g="p1">grupo g</button> = <button class="sym" data-g="p1">aciertos en g</button> / <button class="sym" data-g="p1">filas en g</button>`],
    read:["Read it as: inside each group, count the passes and divide by the number of rows. That is all <code>groupby(...).mean()</code> does.","Léela así: dentro de cada grupo, cuenta los aciertos y divide por el número de filas. Eso es todo lo que hace <code>groupby(...).mean()</code>."],
    syms:[ {s:"g", g:"p1", d:["One group: one bar in the chart after you pick a group-by.","Un grupo: una barra del gráfico cuando eliges una agrupación."]},
      {s:"passes", g:"p1", d:["The True values in the passed column of that group.","Los valores True de la columna passed en ese grupo."]},
      {s:"rows", g:"p1", d:["How many rows the filter and group left: the \"number of rows\" summary.","Cuántas filas dejan el filtro y el grupo: el resumen «número de filas»."]} ],
    next:["The Intermediate track starts using these tables to make decisions: error bars, confidence intervals and tests.","La ruta Intermedio empieza a usar estas tablas para decidir: barras de error, intervalos de confianza y contrastes."],
    deeper:[SRC.rp] },
  gloss:[ [["DataFrame","DataFrame"],["A pandas table: rows are cases, columns are the things you recorded about each case.","Una tabla de pandas: las filas son casos y las columnas son lo que registraste de cada caso."],"hook"],
    [["Filter (mask)","Filtro (máscara)"],["Keeping only the rows where a condition is True.","Quedarse solo con las filas donde una condición es True."],"p1"],
    [["Group by","Agrupar (group by)"],["Splitting rows into groups that share a value, then summarising each group.","Repartir las filas en grupos que comparten un valor y después resumir cada grupo."],"p1"] ]
});
