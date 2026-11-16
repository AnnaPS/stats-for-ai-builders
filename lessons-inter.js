"use strict";
/* ================= Intermediate 1 ================= */
L({ id:"i1", title:["Central limit theorem and standard error","Teorema central del límite y error estándar"], q:["How do I put error bars on an eval score?","¿Cómo pongo barras de error a una puntuación?"],
  hook:{ answer:1, title:["\"74%. Plus or minus what?\"","«74 %. ¿Más o menos cuánto?»"],
    body:[`<p>You report an eval score of 74% on 200 cases. Your PM asks the only question that matters: how far off could that be?</p><p>Basic 4 showed that scores wobble from sample to sample. This lesson gives the wobble a size. The <dfn>standard error</dfn> is the typical distance between a sample's average and the true value.</p>`,
      `<p>Presentas una puntuación del 74 % con 200 casos. Tu PM hace la única pregunta que importa: ¿cuánto puede desviarse ese número?</p><p>Básico 4 mostró que las puntuaciones bailan de una muestra a otra. Esta lección le pone tamaño a ese baile. El <dfn>error estándar</dfn> es la distancia típica entre el promedio de una muestra y el valor real.</p>`],
    legend:["Predict: you grow the eval from 200 to 800 cases, four times as many. What happens to the standard error?","Predice: amplías la eval de 200 a 800 casos, cuatro veces más. ¿Qué le pasa al error estándar?"],
    opts:[["It drops to a quarter","Baja a la cuarta parte"],["It drops to half","Baja a la mitad"],["It stays the same","Se queda igual"]],
    reveal:["Each step of the slider multiplies n by four, and the predicted standard error halves each time. The error shrinks with the square root of n: four times the data halves it, and halving it again takes sixteen times the data.","Cada paso del control multiplica n por cuatro y el error estándar predicho se reduce a la mitad cada vez. El error baja con la raíz cuadrada de n: cuatro veces más datos lo dejan en la mitad, y reducirlo otra vez a la mitad exige dieciséis veces más datos."] },
  plays:[ { w:"clt", title:["Average a lopsided thing and get a bell","Promedia algo asimétrico y sale una campana"],
      intro:[`<p>The grey chart shows single request latencies: lopsided, with a long tail. Below, each block is the <em>mean</em> of one sample of n requests. Draw 500 sample means at n = 1, then raise n one step at a time and draw 500 more.</p>`,`<p>El gráfico gris muestra latencias de peticiones sueltas: asimétricas, con cola larga. Debajo, cada bloque es la <em>media</em> de una muestra de n peticiones. Saca 500 medias con n = 1, después sube n y saca otras 500.</p>`],
      notice:["two things happen as n grows. The pile of means turns into a symmetric bell, even though single latencies are lopsided. And the pile narrows, matching the predicted standard error.","al crecer n pasan dos cosas. La pila de medias se convierte en una campana simétrica, aunque las latencias sueltas son asimétricas. Y la pila se estrecha, igual que el error estándar predicho."],
      done:["That is the <dfn>central limit theorem</dfn>: averages of many independent values pile up in a bell around the true mean, whatever the shape of the single values.","Ese es el <dfn>teorema central del límite</dfn>: los promedios de muchos valores independientes se apilan en una campana alrededor de la media real, sea cual sea la forma de los valores sueltos."] } ],
  code:{ title:["Error bars from one eval","Barras de error con una sola eval"],
    intro:[`<p>You only ever run one eval, so you cannot watch its score wobble. The formula estimates the wobble from that single sample: the spread of the cases divided by the square root of how many there are. The cell then checks the formula against 5,000 simulated evals. Fill the gap.</p>`,`<p>Solo ejecutas una eval, así que no puedes ver cómo baila su puntuación. La fórmula estima ese baile a partir de esa única muestra: la dispersión de los casos dividida por la raíz cuadrada de cuántos hay. Después la celda compara la fórmula con 5000 evals simuladas. Rellena el hueco.</p>`],
    py:`import numpy as np

rng = np.random.default_rng(seed=2)
true_rate = 0.70
n = 200
passed = rng.random(n) < true_rate          #~ one eval of 200 cases ~~ una eval de 200 casos
score = passed.mean()
#~ GAP: standard error = spread of the cases / square root of the number of cases ~~ HUECO: error estándar = dispersión de los casos / raíz cuadrada del número de casos
se = passed.std() / np.sqrt(____)
print(f"score = {score:.1%} +/- {2 * se:.1%}")

#~ Check against brute force: 5,000 fresh evals ~~ Comprobación por fuerza bruta: 5000 evals nuevas
scores = (rng.random((5000, n)) < true_rate).mean(axis=1)
print(f"formula SE = {se:.4f} | spread of 5,000 real scores = {scores.std():.4f}")
inside = np.abs(scores - true_rate) < 2 * se
print(f"evals within 2 SE of the truth: {inside.mean():.0%}")
`,
    dart:`import 'dart:math';

void main() {
  final rng = Random(2);
  const trueRate = 0.70, n = 200;
  double runEval() {
    var passes = 0;
    for (var i = 0; i < n; i++) {
      if (rng.nextDouble() < trueRate) passes++;
    }
    return passes / n;
  }

  final score = runEval(); //~ one eval of 200 cases ~~ una eval de 200 casos
  //~ for pass/fail data the spread is sqrt(p * (1 - p)) ~~ con datos pasa/falla la dispersión es sqrt(p * (1 - p))
  final se = sqrt(score * (1 - score)) / sqrt(n);
  print('score = ' + (100 * score).toStringAsFixed(1) + '% +/- ' + (200 * se).toStringAsFixed(1) + '%');

  //~ check against 5,000 fresh evals ~~ comprobación con 5000 evals nuevas
  final scores = [for (var i = 0; i < 5000; i++) runEval()];
  final mean = scores.reduce((a, b) => a + b) / scores.length;
  final spread = sqrt(scores.map((s) => (s - mean) * (s - mean)).reduce((a, b) => a + b) / scores.length);
  print('formula SE = ' + se.toStringAsFixed(4) + ' | spread of real scores = ' + spread.toStringAsFixed(4));
}
`,
    sol:[["____","n"]], check:`"ok" if abs(se - passed.std() / np.sqrt(n)) < 1e-12 else ("one" if abs(se - passed.std()) < 1e-12 else "no")`,
    ok:["The formula's standard error, computed from one eval, matches the spread of 5,000 real evals. About 95% of evals land within 2 standard errors of the truth, which is why \"score ± 2 SE\" is the usual error bar.","El error estándar de la fórmula, calculado con una sola eval, coincide con la dispersión de 5000 evals reales. Alrededor del 95 % de las evals cae a menos de 2 errores estándar de la verdad, y por eso «puntuación ± 2 EE» es la barra de error habitual."],
    msgs:{ one:["Dividing by the square root of 1 leaves the spread of single cases, about 0.46. That describes how different one case is from another. The score of 200 cases wobbles far less.","Dividir por la raíz cuadrada de 1 deja la dispersión de los casos sueltos, alrededor de 0.46. Eso describe cuánto se diferencia un caso de otro. La puntuación de 200 casos baila mucho menos."] },
    tests:[["1","one"],["score","no"]] },
  qs:[
    { kind:"mc", title:["Tighter error bars","Barras de error más estrechas"], body:[`<p>Your eval has 400 cases and the score is 80% ± 4%. The team wants ± 2%.</p>`,`<p>Tu eval tiene 400 casos y la puntuación es 80 % ± 4 %. El equipo quiere ± 2 %.</p>`], legend:["How many cases do you need?","¿Cuántos casos necesitas?"],
      opts:[ {t:["800","800"], why:["Doubling the cases divides the error by the square root of 2, about 1.4. You would get roughly ± 2.8%.","Duplicar los casos divide el error por la raíz cuadrada de 2, más o menos 1,4. Te quedarías en torno a ± 2,8 %."]},
        {t:["1,600","1600"], ok:true, why:["Halving the error takes four times the data, because the error shrinks with the square root of n. 4 × 400 = 1,600.","Reducir el error a la mitad exige cuatro veces más datos, porque el error baja con la raíz cuadrada de n. 4 × 400 = 1600."]},
        {t:["It cannot be reduced; 4% is a property of the model","No se puede reducir; el 4 % es una propiedad del modelo"], why:["The ± is a property of the measurement. It reflects how few cases you looked at, and more cases shrink it.","El ± es una propiedad de la medición. Refleja los pocos casos que has mirado, y con más casos se reduce."]} ] },
    { kind:"predict", run:true, title:["A score and its error bar","Una puntuación y su barra de error"], code:`import numpy as np
passed = np.array([1, 1, 1, 0] * 100)      # 400 cases, 300 passes
se = passed.std() / np.sqrt(len(passed))
print(round(passed.mean(), 2), round(2 * se, 3))`,
      opts:[ {t:"0.75 0.043", ok:true, why:["300 of 400 passes is 0.75. The spread of pass/fail values at 75% is about 0.433. Divided by the square root of 400, which is 20, it gives 0.0217. Twice that is 0.043: the score is 75% ± 4.3%.","300 de 400 aciertos son 0.75. La dispersión de los valores pasa/falla con un 75 % es de unos 0.433. Dividida por la raíz de 400, que es 20, da 0.0217. El doble es 0.043: la puntuación es 75 % ± 4,3 %."]},
        {t:"0.75 0.866", why:["0.866 is twice the spread of single cases, without dividing by the square root of n. Single cases differ a lot; an average of 400 differs little.","0.866 es el doble de la dispersión de los casos sueltos, sin dividir por la raíz de n. Los casos sueltos varían mucho; un promedio de 400 varía poco."]},
        {t:"0.75 0.002", why:["That divides the spread by n itself, 400. The standard error divides by the square root of n, which is 20.","Eso divide la dispersión por n, 400. El error estándar divide por la raíz cuadrada de n, que es 20."]},
        {t:"300 0.043", why:["300 is the sum of the array. <code>.mean()</code> divides by the 400 cases and gives 0.75.","300 es la suma del array. <code>.mean()</code> divide por los 400 casos y da 0.75."]} ] },
    { kind:"fix", title:["Error bars wider than the chart","Barras de error más anchas que el gráfico"], body:[`<p>A notebook reports "score 72% ± 90%" for a 500-case eval. The line that computes the ± is:</p>`,`<p>Un notebook informa de «puntuación 72 % ± 90 %» para una eval de 500 casos. La línea que calcula el ± es:</p>`], code:`margin = 2 * passed.std()`, legend:["Which replacement is right?","¿Qué sustitución es correcta?"],
      opts:[ {t:["<code>margin = 2 * passed.std() / np.sqrt(len(passed))</code>","<code>margin = 2 * passed.std() / np.sqrt(len(passed))</code>"], ok:true, why:["<code>passed.std()</code> is the spread between single cases, about 0.45. The score is an average of 500 cases, so its wobble is that spread divided by the square root of 500: about ± 4%.","<code>passed.std()</code> es la dispersión entre casos sueltos, alrededor de 0.45. La puntuación es un promedio de 500 casos, así que su baile es esa dispersión dividida por la raíz de 500: en torno a ± 4 %."]},
        {t:["<code>margin = 2 * passed.var()</code>","<code>margin = 2 * passed.var()</code>"], why:["The variance is the squared spread of single cases. It still ignores how many cases you averaged.","La varianza es la dispersión de los casos sueltos al cuadrado. Sigue ignorando cuántos casos has promediado."]},
        {t:["<code>margin = 2 * passed.std() / len(passed)</code>","<code>margin = 2 * passed.std() / len(passed)</code>"], why:["Dividing by n gives ± 0.2%, far too confident. The error shrinks with the square root of n.","Dividir por n da ± 0,2 %, demasiada confianza. El error se reduce con la raíz cuadrada de n."]} ] } ],
  apply:{ seed:91, title:["Put an error bar on a judge score","Ponle barra de error a la nota de un juez"],
    body:[`<p>An LLM judge rated 500 answers from 1 to 5. You will report the mean rating and need the ± to go with it.</p>`,`<p>Un juez LLM ha puntuado 500 respuestas de 1 a 5. Vas a informar de la nota media y necesitas el ± que la acompaña.</p>`],
    cols:["case_id","judge_score","passed"],
    gen:(r) => Array.from({length:500}, (_,i) => { const s = r.pick([1,2,3,4,5],[.05,.1,.2,.4,.25]); return {case_id:"case-"+pad(i+1), judge_score:s, passed:s>=4}; }),
    task:["Set <code>answer</code> to the standard error of the mean <code>judge_score</code>.","Asigna a <code>answer</code> el error estándar de la media de <code>judge_score</code>."],
    hint:["Standard error = spread of the values divided by the square root of how many values there are: <code>scores.std() / np.sqrt(len(scores))</code>.","Error estándar = dispersión de los valores dividida por la raíz cuadrada de cuántos valores hay: <code>scores.std() / np.sqrt(len(scores))</code>."],
    py:`import numpy as np

scores = df["judge_score"].to_numpy()
print("mean rating:", scores.mean(), "| spread of single ratings:", round(scores.std(), 3))

#~ YOUR TURN: the standard error of the mean rating ~~ TU TURNO: el error estándar de la nota media
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...","answer = scores.std() / np.sqrt(len(scores))"]],
    check: chk(`df["judge_score"].std(ddof=0) / len(df) ** 0.5`, {std:`df["judge_score"].std(ddof=0)`, two:`2 * df["judge_score"].std(ddof=0) / len(df) ** 0.5`, n:`df["judge_score"].std(ddof=0) / len(df)`}, {m:`round(float(df["judge_score"].mean()), 2)`, lo:`round(float(df["judge_score"].mean() - 2 * _e), 2)`, hi:`round(float(df["judge_score"].mean() + 2 * _e), 2)`, e:`round(_e, 3)`}, "1e-4"),
    ok:["The standard error is {e}. Report the mean rating as {m}, plausibly between {lo} and {hi}. Single ratings spread over a full point; the mean of 500 of them is pinned down to a few hundredths.","El error estándar es {e}. Informa de la nota media como {m}, con un rango plausible entre {lo} y {hi}. Las notas sueltas se dispersan más de un punto; la media de 500 queda fijada en unas pocas centésimas."],
    msgs:{ type:TYPE_MSG, std:["That is the spread of single ratings. The mean of 500 ratings wobbles much less: divide by the square root of 500.","Esa es la dispersión de las notas sueltas. La media de 500 notas baila mucho menos: divide por la raíz cuadrada de 500."],
      two:["That is the full ± margin, two standard errors. The task asks for one standard error.","Ese es el margen ± completo, dos errores estándar. La tarea pide un error estándar."],
      n:["You divided by n. The standard error divides by the square root of n.","Has dividido por n. El error estándar divide por la raíz cuadrada de n."] },
    tests:[[[["answer = ...","answer = scores.std()"]],"std"],[[["answer = ...","answer = scores.std() / len(scores)"]],"n"]] },
  recap:{ takes:[["<b>Averages form a bell.</b> Whatever the shape of single values, the means of large samples pile up symmetrically around the true mean.","<b>Los promedios forman una campana.</b> Sea cual sea la forma de los valores sueltos, las medias de muestras grandes se apilan de forma simétrica alrededor de la media real."],
      ["<b>The standard error is the size of the wobble.</b> Score ± 2 standard errors covers the truth about 95% of the time.","<b>El error estándar es el tamaño del baile.</b> Puntuación ± 2 errores estándar cubre la verdad alrededor del 95 % de las veces."],
      ["<b>Precision is expensive.</b> Halving the error bar takes four times the cases.","<b>La precisión sale cara.</b> Reducir la barra de error a la mitad exige cuatro veces más casos."]],
    f:`<button class="sym" data-g="p1">SE</button> = <button class="sym" data-g="p1">s</button> / √<button class="sym" data-g="p1">n</button>`,
    read:["Read it as: the standard error equals the spread of single values divided by the square root of the sample size.","Léela así: el error estándar es la dispersión de los valores sueltos dividida por la raíz cuadrada del tamaño de la muestra."],
    syms:[ {s:"SE", g:"p1", d:["The standard error: the width of the pile of sample means.","El error estándar: la anchura de la pila de medias muestrales."]},
      {s:"s", g:"p1", d:["The spread (standard deviation) of single values: the width of the grey chart.","La dispersión (desviación estándar) de los valores sueltos: la anchura del gráfico gris."]},
      {s:"n", g:"p1", d:["The sample size slider.","El control del tamaño de la muestra."]} ],
    next:["Intermediate 2 gets the same error bars without any formula, by resampling your own data.","Intermedio 2 consigue las mismas barras de error sin ninguna fórmula, remuestreando tus propios datos."],
    deeper:[SRC.st("probability-distributions","Probability Distributions (central limit theorem)","Distribuciones de probabilidad (teorema central del límite)"), SRC.rp] },
  gloss:[ [["Standard error","Error estándar"],["The typical distance between a sample's average and the true value. It shrinks with the square root of the sample size.","La distancia típica entre el promedio de una muestra y el valor real. Se reduce con la raíz cuadrada del tamaño de la muestra."],"hook"],
    [["Central limit theorem","Teorema central del límite"],["Averages of many independent values form a bell shape around the true mean, whatever the shape of the single values.","Los promedios de muchos valores independientes forman una campana alrededor de la media real, sea cual sea la forma de los valores sueltos."],"p1"],
    [["Error bar","Barra de error"],["A range around a number that shows how far off it could plausibly be, usually ± 2 standard errors.","Un rango alrededor de un número que muestra cuánto podría desviarse, normalmente ± 2 errores estándar."],"code"] ]
});

/* ================= Intermediate 2 ================= */
L({ id:"i2", title:["Confidence intervals and the bootstrap","Intervalos de confianza y bootstrap"], q:["How sure am I, without a formula?","¿Cómo de seguro estoy, sin usar una fórmula?"],
  hook:{ answer:2, title:["29 of 40 passed. What could the true pass rate be?","Pasan 29 de 40. ¿Cuál puede ser la tasa real?"],
    body:[`<p>Your new retrieval pipeline passes 29 of 40 eval cases: 72.5%. You cannot rerun the world to see how that number wobbles. You have one sample.</p><p>A <dfn>confidence interval</dfn> is a range of values for the true pass rate that are consistent with your data. This lesson builds one with nothing but resampling.</p>`,
      `<p>Tu nuevo pipeline de recuperación pasa 29 de 40 casos: 72,5 %. No puedes repetir el mundo para ver cómo baila ese número. Tienes una muestra.</p><p>Un <dfn>intervalo de confianza</dfn> es un rango de valores de la tasa real compatibles con tus datos. Esta lección construye uno solo con remuestreo.</p>`],
    legend:["Predict: which range would you report for the true pass rate?","Predice: ¿qué rango darías para la tasa real de aciertos?"],
    opts:[["70% to 75%","70 % a 75 %"],["65% to 80%","65 % a 80 %"],["Roughly 58% to 86%","Más o menos 58 % a 86 %"]],
    reveal:["The middle 95% of your resampled scores runs from about 58% to 86%. Forty cases pin the pass rate down to within 14 points either way, no better.","El 95 % central de tus puntuaciones remuestreadas va de más o menos 58 % a 86 %. Cuarenta casos fijan la tasa de aciertos con un margen de 14 puntos a cada lado, no más."] },
  plays:[ { w:"boot", title:["Resample your own eval","Remuestrea tu propia eval"],
      intro:[`<p>The <dfn>bootstrap</dfn> treats your 40 cases as a stand-in for the world. Draw 40 cases from them at random, <dfn>with replacement</dfn>: a case can be picked twice or left out. Score that resample. Repeat. Resample once to see the mechanics, then 1,000 times.</p>`,`<p>El <dfn>bootstrap</dfn> trata tus 40 casos como un sustituto del mundo. Saca 40 casos de ellos al azar, <dfn>con reemplazo</dfn>: un caso puede salir dos veces o no salir. Puntúa ese remuestreo. Repite. Remuestrea una vez para ver la mecánica y después 1000 veces.</p>`],
      notice:["every resample has 40 cases, yet the scores differ, because each one over-counts some cases and skips others. The shaded band holds the middle 95% of them.","cada remuestreo tiene 40 casos y aun así las puntuaciones cambian, porque cada uno repite unos casos y se salta otros. La franja sombreada contiene el 95 % central."],
      done:["The spread of resampled scores imitates the spread you would see across fresh evals. Its middle 95% is a 95% confidence interval.","La dispersión de las puntuaciones remuestreadas imita la que verías con evals nuevas. Su 95 % central es un intervalo de confianza del 95 %."] } ],
  code:{ title:["A confidence interval in six lines","Un intervalo de confianza en seis líneas"],
    intro:[`<p>The whole method is a loop: resample, score, collect, then read off two percentiles. Fill the gap so each resample draws with repeats allowed.</p>`,`<p>Todo el método es un bucle: remuestrear, puntuar, guardar y, al final, leer dos percentiles. Rellena el hueco para que cada remuestreo permita repeticiones.</p>`],
    py:`import numpy as np

rng = np.random.default_rng(seed=4)
passed = np.array([1] * 58 + [0] * 22)      #~ one eval: 58 of 80 cases passed ~~ una eval: pasan 58 de 80 casos
print(f"score: {passed.mean():.1%}")

boot = []
for _ in range(5000):
    #~ GAP: draw 80 cases from the eval, with repeats allowed (True or False) ~~ HUECO: saca 80 casos de la eval, permitiendo repeticiones (True o False)
    resample = rng.choice(passed, size=len(passed), replace=____)
    boot.append(resample.mean())

low, high = np.percentile(boot, [2.5, 97.5])
print(f"95% confidence interval: {low:.1%} to {high:.1%}")
`,
    dart:`import 'dart:math';

void main() {
  final rng = Random(4);
  final passed = [...List.filled(58, 1), ...List.filled(22, 0)]; //~ 58 of 80 passed ~~ pasan 58 de 80
  final n = passed.length;

  final boot = <double>[];
  for (var b = 0; b < 5000; b++) {
    var sum = 0;
    for (var i = 0; i < n; i++) {
      sum += passed[rng.nextInt(n)]; //~ repeats allowed ~~ se permiten repeticiones
    }
    boot.add(sum / n);
  }
  boot.sort();
  //~ the middle 95% of the resampled scores ~~ el 95 % central de las puntuaciones remuestreadas
  final low = (100 * boot[(0.025 * 5000).round()]).toStringAsFixed(1);
  final high = (100 * boot[(0.975 * 5000).round() - 1]).toStringAsFixed(1);
  print('score: 72.5%');
  print('95% confidence interval: $low% to $high%');
}
`,
    sol:[["____","True"]], check:`"ok" if high - low > 0.1 else "same"`,
    ok:["With 80 cases the interval runs from about 62% to 82%: ten points either side of the score. No formula was needed, which means the same loop works for medians, p95 latency or any other number.","Con 80 casos el intervalo va de más o menos 62 % a 82 %: diez puntos a cada lado de la puntuación. No hizo falta ninguna fórmula, así que el mismo bucle sirve para medianas, latencia p95 o cualquier otro número."],
    msgs:{ same:["Without replacement, drawing 80 cases from 80 gives back the same 80 cases in a different order. Every resample scores 72.5% and the interval has zero width. Allow repeats.","Sin reemplazo, sacar 80 casos de 80 devuelve los mismos 80 casos en otro orden. Todos los remuestreos puntúan 72,5 % y el intervalo tiene anchura cero. Permite repeticiones."] },
    tests:[["False","same"]] },
  qs:[
    { kind:"mc", title:["Why with replacement?","¿Por qué con reemplazo?"], body:[`<p>A colleague says: "Picking the same case twice is cheating. Resample without replacement."</p>`,`<p>Un colega dice: «Elegir el mismo caso dos veces es hacer trampa. Remuestrea sin reemplazo».</p>`], legend:["What is the right reply?","¿Cuál es la respuesta correcta?"],
      opts:[ {t:["Agreed, repeats distort the score","De acuerdo, las repeticiones distorsionan la puntuación"], why:["Repeats are the point. A fresh eval from the world would contain more cases of some kinds and fewer of others than yours did. Repeats and omissions imitate that.","Las repeticiones son la clave. Una eval nueva sacada del mundo tendría más casos de un tipo y menos de otro que la tuya. Las repeticiones y las omisiones lo imitan."]},
        {t:["Without replacement every resample is the same 40 cases, so nothing varies","Sin reemplazo cada remuestreo son los mismos 40 casos y nada varía"], ok:true, why:["Drawing 40 from 40 without repeats just shuffles the eval. The score never changes and you learn nothing about its uncertainty.","Sacar 40 de 40 sin repetir solo baraja la eval. La puntuación nunca cambia y no aprendes nada sobre su incertidumbre."]},
        {t:["It does not matter, both give the same interval","Da igual, las dos formas dan el mismo intervalo"], why:["Without replacement the interval collapses to a single point, which claims certainty you do not have.","Sin reemplazo el intervalo se reduce a un punto, y eso afirma una certeza que no tienes."]} ] },
    { kind:"predict", run:true, title:["Reading off the middle 95%","Leer el 95 % central"], code:`import numpy as np
boot = np.arange(1, 101)      # pretend these are 100 resample scores: 1, 2, ..., 100
low, high = np.percentile(boot, [2.5, 97.5])
print(round(low, 3), round(high, 3))`,
      opts:[ {t:"3.475 97.525", ok:true, why:["The middle 95% leaves 2.5% out at each end. Of the values 1 to 100, that cuts just above 3 at the bottom and just below 98 at the top.","El 95 % central deja fuera un 2,5 % en cada extremo. De los valores 1 a 100, eso corta justo por encima de 3 por abajo y justo por debajo de 98 por arriba."]},
        {t:"5.95 95.05", why:["Cutting 5% at each end keeps the middle 90%. A 95% interval cuts 2.5% at each end.","Cortar un 5 % en cada extremo deja el 90 % central. Un intervalo del 95 % corta un 2,5 % en cada extremo."]},
        {t:"1.0 100.0", why:["Those are the minimum and maximum: the full range, which grows with every extra resample. Percentiles stay stable.","Esos son el mínimo y el máximo: el rango completo, que crece con cada remuestreo adicional. Los percentiles se mantienen estables."]},
        {t:"2.5 97.5", why:["Those are the percentile positions you asked for. The function returns the values found at those positions.","Esas son las posiciones de los percentiles que pediste. La función devuelve los valores que hay en esas posiciones."]} ] },
    { kind:"fix", title:["An interval that is far too wide","Un intervalo demasiado ancho"], body:[`<p>The eval has 400 cases, yet this bootstrap reports "50% to 90%".</p>`,`<p>La eval tiene 400 casos y aun así este bootstrap informa de «50 % a 90 %».</p>`], code:`resample = rng.choice(passed, size=20, replace=True)`, legend:["Which change fixes it?","¿Qué cambio lo arregla?"],
      opts:[ {t:["<code>size=len(passed)</code>","<code>size=len(passed)</code>"], ok:true, why:["Each resample must be as large as the real eval. Resamples of 20 cases wobble like a 20-case eval, so the interval describes a much smaller experiment than the one you ran.","Cada remuestreo tiene que ser tan grande como la eval real. Los remuestreos de 20 casos bailan como una eval de 20 casos, así que el intervalo describe un experimento mucho más pequeño que el tuyo."]},
        {t:["<code>replace=False</code>","<code>replace=False</code>"], why:["That draws 20 different cases, which is still a 20-case eval. The size is the problem.","Eso saca 20 casos distintos, que sigue siendo una eval de 20 casos. El problema es el tamaño."]},
        {t:["Run more resamples","Hacer más remuestreos"], why:["More resamples make the two percentiles more exact. They do not make the interval narrower.","Con más remuestreos los dos percentiles salen más exactos. El intervalo no se estrecha."]} ] } ],
  apply:{ seed:102, title:["Report an interval, not a point","Informa de un intervalo, no de un punto"],
    body:[`<p>The table holds 300 graded cases from your latest agent. The bootstrap loop is written. You finish it by reading off the interval.</p>`,`<p>La tabla contiene 300 casos corregidos de tu último agente. El bucle de bootstrap ya está escrito. Tú lo terminas leyendo el intervalo.</p>`],
    cols:["case_id","passed","latency_ms"],
    gen:(r) => Array.from({length:300}, (_,i) => ({case_id:"case-"+pad(i+1), passed:r.u()<0.78, latency_ms:Math.round(900*Math.exp(.5*r.n()))})),
    task:["Set <code>low</code> and <code>high</code> to the two ends of the 95% confidence interval.","Asigna a <code>low</code> y <code>high</code> los dos extremos del intervalo de confianza del 95 %."],
    hint:["<code>np.percentile(boot, 2.5)</code> is the lower end. The upper end leaves 2.5% above it.","<code>np.percentile(boot, 2.5)</code> es el extremo inferior. El superior deja un 2,5 % por encima."],
    py:`import numpy as np

passed = df["passed"].to_numpy()
rng = np.random.default_rng(seed=1)
boot = np.array([rng.choice(passed, size=len(passed), replace=True).mean() for _ in range(4000)])
print(f"score: {passed.mean():.1%} on {len(passed)} cases")

#~ YOUR TURN: the two ends of the middle 95% of boot ~~ TU TURNO: los dos extremos del 95 % central de boot
low = ...
high = ...
answer = (low, high)
print("95% confidence interval:", answer)
`,
    sol:[["low = ...","low = np.percentile(boot, 2.5)"],["high = ...","high = np.percentile(boot, 97.5)"]],
    check:`import json as _j, numpy as _n
_lo = globals().get("low"); _hi = globals().get("high"); _e = _n.percentile(boot, [2.5, 97.5])
def _k():
    if _lo is ... or _hi is ... or _lo is None or _hi is None: return "dots"
    try: _a, _b = float(_lo), float(_hi)
    except Exception: return "type"
    _c = lambda q: bool(_n.allclose([_a, _b], _n.percentile(boot, q), atol=1e-9))
    if _c([2.5, 97.5]): return "ok"
    if _c([5, 95]): return "ninety"
    if _c([0, 100]): return "minmax"
    if _c([0.025, 0.975]): return "frac"
    if _c([97.5, 2.5]): return "swap"
    return "_"
_j.dumps({"k": _k(), "lo": round(float(_e[0]) * 100, 1), "hi": round(float(_e[1]) * 100, 1), "s": round(float(passed.mean()) * 100, 1)})`,
    ok:["Report it as: pass rate {s}%, 95% confidence interval {lo}% to {hi}%. A reader now knows both your best estimate and how far to trust it.","Infórmalo así: tasa de aciertos {s} %, intervalo de confianza del 95 % de {lo} % a {hi} %. Quien lo lea conoce tu mejor estimación y hasta dónde fiarse de ella."],
    msgs:{ type:["<code>low</code> and <code>high</code> should each be one number.","<code>low</code> y <code>high</code> deben ser un número cada uno."],
      ninety:["The 5th and 95th percentiles hold the middle 90%. For 95%, leave 2.5% out at each end.","Los percentiles 5 y 95 contienen el 90 % central. Para el 95 %, deja fuera un 2,5 % en cada extremo."],
      minmax:["Those are the smallest and largest resample scores. That range keeps growing as you add resamples. Use percentiles.","Esas son la puntuación más baja y la más alta de los remuestreos. Ese rango sigue creciendo al añadir remuestreos. Usa percentiles."],
      frac:["<code>np.percentile</code> works on a 0 to 100 scale. Use 2.5 and 97.5.","<code>np.percentile</code> trabaja en una escala de 0 a 100. Usa 2.5 y 97.5."],
      swap:["The values are right and in the wrong order: <code>low</code> is the 2.5th percentile.","Los valores son correctos pero están al revés: <code>low</code> es el percentil 2,5."] },
    tests:[[[["low = ...","low = np.percentile(boot, 5)"],["high = ...","high = np.percentile(boot, 95)"]],"ninety"],[[["low = ...","low = boot.min()"],["high = ...","high = boot.max()"]],"minmax"]] },
  recap:{ takes:[["<b>A confidence interval is a range of plausible truths.</b> It turns \"72.5%\" into \"72.5%, somewhere between 58% and 86%\".","<b>Un intervalo de confianza es un rango de verdades plausibles.</b> Convierte «72,5 %» en «72,5 %, entre 58 % y 86 %»."],
      ["<b>The bootstrap builds it by resampling.</b> Draw from your own data with replacement, recompute, repeat, and take the middle 95%.","<b>El bootstrap lo construye remuestreando.</b> Saca de tus propios datos con reemplazo, recalcula, repite y quédate con el 95 % central."],
      ["<b>It works for any statistic.</b> Mean, median, p95, a difference between two prompts: the loop is the same.","<b>Sirve para cualquier estadística.</b> Media, mediana, p95, la diferencia entre dos prompts: el bucle es el mismo."]],
    f:[`95% CI = [ <button class="sym" data-g="p1">2.5th percentile</button> , <button class="sym" data-g="p1">97.5th percentile</button> ] of the <button class="sym" data-g="p1">resampled scores</button>`, `IC 95 % = [ <button class="sym" data-g="p1">percentil 2,5</button> , <button class="sym" data-g="p1">percentil 97,5</button> ] de las <button class="sym" data-g="p1">puntuaciones remuestreadas</button>`],
    read:["Read it as: sort the resampled scores and cut off the lowest 2.5% and the highest 2.5%. What remains is the interval.","Léela así: ordena las puntuaciones remuestreadas y corta el 2,5 % más bajo y el 2,5 % más alto. Lo que queda es el intervalo."],
    syms:[ {s:"2.5 – 97.5", g:"p1", d:["The two edges of the shaded band in the histogram.","Los dos bordes de la franja sombreada del histograma."]},
      {s:"scores", g:"p1", d:["One block per resample: the histogram you built.","Un bloque por remuestreo: el histograma que construiste."]} ],
    next:["Intermediate 3 uses the same shuffling idea to compare two prompts and get a p-value.","Intermedio 3 usa la misma idea de barajar para comparar dos prompts y obtener un valor p."],
    deeper:[SRC.st("frequentist-inference","Frequentist Inference (confidence intervals and the bootstrap)","Inferencia frecuentista (intervalos de confianza y bootstrap)"), SRC.rp] },
  gloss:[ [["Confidence interval","Intervalo de confianza"],["A range of values for the true quantity that are consistent with your data.","Un rango de valores de la cantidad real que son compatibles con tus datos."],"hook"],
    [["Bootstrap","Bootstrap"],["Estimating uncertainty by resampling your own data with replacement many times.","Estimar la incertidumbre remuestreando tus propios datos con reemplazo muchas veces."],"p1"],
    [["With replacement","Con reemplazo"],["Drawing so that the same item can be picked more than once.","Sacar de forma que el mismo elemento pueda salir más de una vez."],"p1"] ]
});

/* ================= Intermediate 3 ================= */
L({ id:"i3", title:["Hypothesis tests and p-values","Contrastes de hipótesis y valores p"], q:["Is prompt B really better than prompt A, or was that luck?","¿El prompt B es mejor de verdad que el A, o fue suerte?"],
  hook:{ answer:1, title:["B beat A by 15 points. Ship it?","B gana a A por 15 puntos. ¿A producción?"],
    body:[`<p>You ran prompts A and B on the same 60 test cases. A passed 34 (56.7%), B passed 43 (71.7%). Fifteen points looks decisive, but you now know small samples wobble.</p><p>A <dfn>hypothesis test</dfn> asks one question: if the two prompts were equally good, how often would luck alone produce a gap this large? That "equally good" assumption is the <dfn>null hypothesis</dfn>.</p>`,
      `<p>Has ejecutado los prompts A y B sobre los mismos 60 casos de prueba. A pasa 34 (56,7 %) y B pasa 43 (71,7 %). Quince puntos parecen decisivos, pero ya sabes que las muestras pequeñas bailan.</p><p>Un <dfn>contraste de hipótesis</dfn> hace una sola pregunta: si los dos prompts fueran igual de buenos, ¿con qué frecuencia produciría el azar una diferencia así de grande? Esa suposición de «igual de buenos» es la <dfn>hipótesis nula</dfn>.</p>`],
    legend:["Predict: you analyse this same data two ways, once ignoring that the cases were shared and once using it. Do the two tests agree?","Predice: analizas estos mismos datos de dos formas, una ignorando que los casos eran compartidos y otra usándolo. ¿Coinciden los dos contrastes?"],
    opts:[["Yes. Same data, same answer","Sí. Mismos datos, misma respuesta"],["No. The test that uses the pairing finds stronger evidence","No. El contraste que usa el emparejamiento encuentra evidencia más fuerte"],["No. The test that ignores the pairing finds stronger evidence","No. El contraste que ignora el emparejamiento encuentra evidencia más fuerte"]],
    reveal:["The unpaired shuffle gives a p-value near 0.1. The paired shuffle gives about 0.01. Same numbers, a tenfold difference, because pairing removes the noise of some cases being hard for every prompt.","Barajar sin emparejar da un valor p cercano a 0,1. Barajar emparejado da alrededor de 0,01. Los mismos números y una diferencia de diez veces, porque el emparejamiento elimina el ruido de los casos que son difíciles para cualquier prompt."] },
  plays:[ { w:"perm", title:["Shuffle the labels and see what luck can do","Baraja las etiquetas y mira lo que puede hacer el azar"],
      intro:[`<p>If the prompts were equally good, the labels "A" and "B" would be meaningless, so you may shuffle them. Each shuffle gives one gap that pure luck produced. The <dfn>p-value</dfn> is the share of shuffles with a gap at least as large as the real one. Shuffle 1,000 times in each mode.</p>`,`<p>Si los prompts fueran igual de buenos, las etiquetas «A» y «B» no significarían nada, así que puedes barajarlas. Cada barajada da una diferencia producida solo por el azar. El <dfn>valor p</dfn> es la proporción de barajadas con una diferencia al menos tan grande como la real. Baraja 1000 veces en cada modo.</p>`],
      notice:["the orange bars are shuffles as extreme as your real result. In unpaired mode there are plenty. In paired mode the pile is narrower, and the same 15 points sits far out in its tail.","las barras naranjas son barajadas tan extremas como tu resultado real. En el modo sin emparejar hay muchas. En el modo emparejado la pila es más estrecha y los mismos 15 puntos quedan muy lejos, en la cola."],
      done:["When both prompts run on the same cases, use a <dfn>paired test</dfn>. Choosing the unpaired one here would have hidden a real improvement.","Cuando los dos prompts se ejecutan sobre los mismos casos, usa un <dfn>contraste emparejado</dfn>. Elegir aquí el no emparejado habría escondido una mejora real."] } ],
  code:{ title:["A paired test by shuffling","Un contraste emparejado barajando"],
    intro:[`<p>This is the paired shuffle from the widget, written out. Fill the gap so the p-value counts shuffles at least as extreme as the real gap.</p>`,`<p>Esta es la barajada emparejada del widget, escrita en código. Rellena el hueco para que el valor p cuente las barajadas al menos tan extremas como la diferencia real.</p>`],
    py:`import numpy as np

rng = np.random.default_rng(seed=6)
#~ 60 cases, each run with prompt A and prompt B (1 = pass) ~~ 60 casos, cada uno ejecutado con el prompt A y con el B (1 = pasa)
a = np.array([1] * 33 + [0] * 16 + [0] * 10 + [1] * 1)
b = np.array([1] * 33 + [0] * 16 + [1] * 10 + [0] * 1)
observed = b.mean() - a.mean()
print(f"A {a.mean():.1%}, B {b.mean():.1%}, difference {observed:+.1%}")

#~ If the prompts were equally good, each case's two results could be swapped ~~ Si los prompts fueran igual de buenos, los dos resultados de cada caso se podrían intercambiar
diffs = []
for _ in range(10000):
    swap = rng.random(len(a)) < 0.5
    a2 = np.where(swap, b, a)
    b2 = np.where(swap, a, b)
    diffs.append(b2.mean() - a2.mean())
diffs = np.array(diffs)

#~ GAP: share of shuffles at least as extreme as what we observed ~~ HUECO: proporción de barajadas al menos tan extremas como lo observado
p_value = (np.abs(diffs) >= np.abs(____)).mean()
print(f"p-value = {p_value:.3f}")
`,
    dart:`import 'dart:math';

void main() {
  final rng = Random(6);
  //~ 60 cases, each run with prompt A and prompt B (1 = pass) ~~ 60 casos, cada uno con el prompt A y con el B (1 = pasa)
  final a = [...List.filled(33, 1), ...List.filled(16, 0), ...List.filled(10, 0), 1];
  final b = [...List.filled(33, 1), ...List.filled(16, 0), ...List.filled(10, 1), 0];
  final n = a.length;
  int sum(List<int> xs) => xs.reduce((x, y) => x + y);
  final observed = (sum(b) - sum(a)) / n;

  var extreme = 0;
  const shuffles = 10000;
  for (var s = 0; s < shuffles; s++) {
    var diff = 0;
    for (var i = 0; i < n; i++) {
      //~ swap this case's two results half the time ~~ intercambia los dos resultados de este caso la mitad de las veces
      diff += rng.nextBool() ? b[i] - a[i] : a[i] - b[i];
    }
    if ((diff / n).abs() >= observed.abs() - 1e-12) extreme++;
  }
  final diffPct = (100 * observed).toStringAsFixed(1);
  final p = (extreme / shuffles).toStringAsFixed(3);
  print('difference +$diffPct%');
  print('p-value = $p');
}
`,
    sol:[["____","observed"]], check:`"ok" if abs(p_value - (np.abs(diffs) >= abs(observed)).mean()) < 1e-12 else ("one" if p_value == 1.0 else "no")`,
    ok:["The p-value is about 0.012. If the prompts were equally good, a 15-point gap would show up in roughly 1 shuffle in 80. That is strong evidence that B is better on cases like these.","El valor p es alrededor de 0.012. Si los prompts fueran igual de buenos, una diferencia de 15 puntos aparecería en más o menos 1 barajada de cada 80. Es una evidencia fuerte de que B es mejor en casos como estos."],
    msgs:{ one:["Every shuffle is at least as extreme as zero, so the p-value came out as 1. Compare against the gap you observed.","Todas las barajadas son al menos tan extremas como cero, así que el valor p ha salido 1. Compara con la diferencia que observaste."] },
    tests:[["0","one"],["0.05","no"]] },
  qs:[
    { kind:"mc", title:["What p = 0.03 says","Qué dice p = 0,03"], body:[`<p>Your A/B comparison returns a p-value of 0.03.</p>`,`<p>Tu comparación A/B devuelve un valor p de 0,03.</p>`], legend:["Which reading is correct?","¿Qué lectura es correcta?"],
      opts:[ {t:["There is a 3% chance that B is no better than A","Hay un 3 % de probabilidad de que B no sea mejor que A"], why:["A p-value is computed assuming B is no better. It cannot also be the probability of that assumption. Intermediate tests tell you how surprising the data is; Advanced 1 shows how to get a probability for the claim itself.","Un valor p se calcula suponiendo que B no es mejor. No puede ser a la vez la probabilidad de esa suposición. Los contrastes te dicen cuánto sorprenden los datos; Avanzado 1 enseña a obtener una probabilidad para la afirmación en sí."]},
        {t:["If the prompts were equally good, a gap this large would appear about 3% of the time","Si los prompts fueran igual de buenos, una diferencia así de grande aparecería alrededor del 3 % de las veces"], ok:true, why:["It measures how surprising your data would be under the null hypothesis. Small means: luck alone rarely does this.","Mide cuánto sorprenderían tus datos bajo la hipótesis nula. Pequeño significa: el azar solo rara vez produce esto."]},
        {t:["B is 97% better than A","B es un 97 % mejor que A"], why:["The p-value says nothing about how big the improvement is. A tiny gain measured on a huge eval can have a tiny p-value. Effect size is the subject of the next lesson.","El valor p no dice nada sobre el tamaño de la mejora. Una mejora minúscula medida con una eval enorme puede tener un valor p minúsculo. El tamaño del efecto es el tema de la próxima lección."]} ] },
    { kind:"predict", run:true, title:["Counting extreme shuffles","Contar barajadas extremas"], code:`import numpy as np
diffs = np.array([-3, -1, 0, 1, 2, 4, -4, 0, 1, -2])   # gaps from 10 shuffles
observed = 3
print((np.abs(diffs) >= observed).mean())`,
      opts:[ {t:"0.3", ok:true, why:["Three shuffles have a gap of 3 or more in either direction: −3, 4 and −4. Three out of ten is 0.3. Counting both directions makes this a two-sided test.","Tres barajadas tienen una diferencia de 3 o más en cualquier sentido: −3, 4 y −4. Tres de diez son 0.3. Contar los dos sentidos hace que el contraste sea bilateral."]},
        {t:"0.1", why:["That counts only gaps of +3 or more. <code>np.abs</code> also counts −3 and −4, because a gap that large in B's disfavour would have been just as surprising.","Eso cuenta solo las diferencias de +3 o más. <code>np.abs</code> cuenta también −3 y −4, porque una diferencia igual de grande en contra de B habría sorprendido lo mismo."]},
        {t:"0.2", why:["That counts gaps strictly larger than 3. The comparison is <code>&gt;=</code>, so the −3 counts too.","Eso cuenta las diferencias estrictamente mayores que 3. La comparación es <code>&gt;=</code>, así que el −3 también cuenta."]},
        {t:"3", why:["3 is the number of extreme shuffles. <code>.mean()</code> turns the count into a share of the 10 shuffles.","3 es el número de barajadas extremas. <code>.mean()</code> convierte el recuento en una proporción de las 10 barajadas."]} ] },
    { kind:"fix", title:["The wrong shuffle for shared cases","La barajada equivocada para casos compartidos"], body:[`<p><code>a[i]</code> and <code>b[i]</code> are the results of the same test case under each prompt. This shuffle gives p = 0.10 where the right test gives p = 0.01.</p>`,`<p><code>a[i]</code> y <code>b[i]</code> son los resultados del mismo caso de prueba con cada prompt. Esta barajada da p = 0,10 donde el contraste correcto da p = 0,01.</p>`],
      code:`pooled = np.concatenate([a, b])
rng.shuffle(pooled)
diff = pooled[60:].mean() - pooled[:60].mean()`, legend:["Which replacement respects the design?","¿Qué sustitución respeta el diseño?"],
      opts:[ {t:["<code>swap = rng.random(60) &lt; 0.5</code><br><code>diff = np.where(swap, a, b).mean() - np.where(swap, b, a).mean()</code>","<code>swap = rng.random(60) &lt; 0.5</code><br><code>diff = np.where(swap, a, b).mean() - np.where(swap, b, a).mean()</code>"], ok:true, why:["Pooling mixes results from different cases, so an easy case's pass can be dealt to either group. Swapping inside each case keeps every case's difficulty in both groups and leaves only the prompt effect to vary.","Juntarlo todo mezcla resultados de casos distintos, y el acierto de un caso fácil puede caer en cualquier grupo. Intercambiar dentro de cada caso mantiene la dificultad de cada caso en los dos grupos y deja variar solo el efecto del prompt."]},
        {t:["Shuffle only <code>b</code> and compare with <code>a</code>","Barajar solo <code>b</code> y compararlo con <code>a</code>"], why:["Shuffling the order of <code>b</code> does not change its mean, so every shuffle gives the same gap and the p-value is always 1.","Barajar el orden de <code>b</code> no cambia su media, así que todas las barajadas dan la misma diferencia y el valor p siempre es 1."]},
        {t:["Keep the code and run ten times more shuffles","Dejar el código y hacer diez veces más barajadas"], why:["More shuffles make the wrong p-value more precise. The design is ignored either way.","Más barajadas hacen más preciso el valor p equivocado. El diseño se sigue ignorando."]} ] } ],
  apply:{ seed:113, title:["Pick the test that fits the design","Elige el contraste que encaja con el diseño"],
    body:[`<p>200 test cases, each run with prompt A and with prompt B. Both test functions are written for you. Your job is the decision.</p>`,`<p>200 casos de prueba, cada uno ejecutado con el prompt A y con el B. Las dos funciones de contraste ya están escritas. Tu trabajo es la decisión.</p>`],
    cols:["case_id","pass_a","pass_b"],
    gen:(r) => r.shuffle([...Array(120).fill([true,true]), ...Array(50).fill([false,false]), ...Array(22).fill([false,true]), ...Array(8).fill([true,false])]).map((v,i) => ({case_id:"case-"+pad(i+1), pass_a:v[0], pass_b:v[1]})),
    task:["Set <code>answer</code> to the p-value from the test that matches how this data was collected.","Asigna a <code>answer</code> el valor p del contraste que corresponde a cómo se recogieron estos datos."],
    hint:["Each row is one case with two results, so the results come in pairs. Call <code>paired_p(a, b)</code>.","Cada fila es un caso con dos resultados, así que los resultados van por parejas. Llama a <code>paired_p(a, b)</code>."],
    py:`import numpy as np

a = df["pass_a"].to_numpy()
b = df["pass_b"].to_numpy()
print(f"A {a.mean():.1%} | B {b.mean():.1%} | cases where they differ: {(a != b).sum()}")

def unpaired_p(a, b, shuffles=4000):
    #~ pools all results and deals them out again ~~ junta todos los resultados y los reparte de nuevo
    rng = np.random.default_rng(0); pooled = np.concatenate([a, b]); obs = abs(b.mean() - a.mean()); hits = 0
    for _ in range(shuffles):
        rng.shuffle(pooled)
        hits += abs(pooled[len(a):].mean() - pooled[:len(a)].mean()) >= obs - 1e-12
    return hits / shuffles

def paired_p(a, b, shuffles=4000):
    #~ swaps the two results inside each case ~~ intercambia los dos resultados dentro de cada caso
    rng = np.random.default_rng(0); obs = abs(b.mean() - a.mean()); hits = 0
    for _ in range(shuffles):
        swap = rng.random(len(a)) < 0.5
        hits += abs(np.where(swap, a, b).mean() - np.where(swap, b, a).mean()) >= obs - 1e-12
    return hits / shuffles

#~ YOUR TURN: call the test that fits this design ~~ TU TURNO: llama al contraste que encaja con este diseño
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...","answer = paired_p(a, b)"]],
    check: chk(`paired_p(a, b)`, {unpaired:`unpaired_p(a, b)`}, {p:`round(float(paired_p(a, b)), 3)`, u:`round(float(unpaired_p(a, b)), 3)`}),
    ok:["The paired p-value is {p}; the unpaired one would have been {u}. Same data. With the conventional 0.05 cut-off, the wrong test says \"no evidence\" and the right one says \"B is better\".","El valor p emparejado es {p}; el no emparejado habría sido {u}. Los mismos datos. Con el umbral habitual de 0,05, el contraste equivocado dice «sin evidencia» y el correcto dice «B es mejor»."],
    msgs:{ type:TYPE_MSG, unpaired:["That is the unpaired p-value ({u}). Each case was run with both prompts, so the results come in pairs. The unpaired test throws that information away and loses most of its sensitivity.","Ese es el valor p no emparejado ({u}). Cada caso se ejecutó con los dos prompts, así que los resultados van por parejas. El contraste no emparejado tira esa información y pierde casi toda su sensibilidad."] },
    tests:[[[["answer = ...","answer = unpaired_p(a, b)"]],"unpaired"]] },
  recap:{ takes:[["<b>A test asks what luck could do.</b> Assume no real difference, then see how often chance produces a gap as large as yours.","<b>Un contraste pregunta qué podría hacer el azar.</b> Supón que no hay diferencia real y mira con qué frecuencia el azar produce una diferencia como la tuya."],
      ["<b>The p-value is that frequency.</b> Small p-values mean luck is a poor explanation. They say nothing about how big the improvement is.","<b>El valor p es esa frecuencia.</b> Un valor p pequeño significa que el azar es una mala explicación. No dice nada sobre el tamaño de la mejora."],
      ["<b>Match the test to the design.</b> Same cases for both prompts means a paired test. The wrong test can hide a real effect.","<b>Ajusta el contraste al diseño.</b> Los mismos casos para los dos prompts piden un contraste emparejado. El contraste equivocado puede esconder un efecto real."]],
    f:[`<button class="sym" data-g="p1">p</button> = <button class="sym" data-g="p1">shuffles with |gap| ≥ |observed gap|</button> / <button class="sym" data-g="p1">all shuffles</button>`, `<button class="sym" data-g="p1">p</button> = <button class="sym" data-g="p1">barajadas con |diferencia| ≥ |diferencia observada|</button> / <button class="sym" data-g="p1">todas las barajadas</button>`],
    read:["Read it as: the p-value is the share of label shuffles whose gap is at least as large, in either direction, as the gap you really saw.","Léela así: el valor p es la proporción de barajadas cuya diferencia es al menos tan grande, en cualquier sentido, como la que viste de verdad."],
    syms:[ {s:"p", g:"p1", d:["The p-value readout under the chart.","El valor p que aparece bajo el gráfico."]},
      {s:"|gap| ≥", g:"p1", d:["The orange bars: shuffles as extreme as your result.","Las barras naranjas: barajadas tan extremas como tu resultado."]},
      {s:"shuffles", g:"p1", d:["Every bar in the histogram, blue and orange together.","Todas las barras del histograma, azules y naranjas."]} ],
    next:["Intermediate 4 turns this around: before running anything, how many cases do you need for the test to notice a real improvement?","Intermedio 4 le da la vuelta: antes de ejecutar nada, ¿cuántos casos necesitas para que el contraste note una mejora real?"],
    deeper:[SRC.st("frequentist-inference","Frequentist Inference","Inferencia frecuentista"), SRC.rp] },
  gloss:[ [["Null hypothesis","Hipótesis nula"],["The assumption that there is no real difference, used as the starting point of a test.","La suposición de que no hay diferencia real, usada como punto de partida de un contraste."],"hook"],
    [["p-value","Valor p"],["How often luck alone would produce a result at least as extreme as yours, if the null hypothesis were true.","Con qué frecuencia el azar produciría un resultado al menos tan extremo como el tuyo si la hipótesis nula fuera cierta."],"p1"],
    [["Paired test","Contraste emparejado"],["A test for data where each case was measured under both conditions. It compares within cases.","Un contraste para datos en los que cada caso se midió en las dos condiciones. Compara dentro de cada caso."],"p1"],
    [["Permutation test","Contraste de permutación"],["A test that gets its p-value by shuffling labels many times.","Un contraste que obtiene su valor p barajando las etiquetas muchas veces."],"code"] ]
});

/* ================= Intermediate 4 ================= */
L({ id:"i4", title:["A/B tests, effect size, power","Pruebas A/B, tamaño del efecto y potencia"], q:["How many eval cases do I need?","¿Cuántos casos de eval necesito?"],
  hook:{ answer:2, title:["Plan the eval before you run it","Planifica la eval antes de ejecutarla"],
    body:[`<p>Prompt A passes about 70% of cases. You believe prompt B lifts that to 75%. That gap is the <dfn>effect size</dfn>: how big the improvement really is.</p><p>You want an eval large enough that, if the 5-point gain is real, your test will notice it. The chance that it notices is called <dfn>power</dfn>.</p>`,
      `<p>El prompt A pasa alrededor del 70 % de los casos. Crees que el prompt B lo sube al 75 %. Esa diferencia es el <dfn>tamaño del efecto</dfn>: lo grande que es de verdad la mejora.</p><p>Quieres una eval lo bastante grande para que, si la mejora de 5 puntos es real, tu contraste la note. La probabilidad de que la note se llama <dfn>potencia</dfn>.</p>`],
    legend:["Predict: how many cases per prompt give you an 80% chance of detecting that 5-point gain?","Predice: ¿cuántos casos por prompt te dan un 80 % de probabilidad de detectar esa mejora de 5 puntos?"],
    opts:[["About 100","Unos 100"],["About 400","Unos 400"],["About 1,250","Unos 1250"]],
    reveal:["A 5-point gain from 70% needs about 1,250 cases per prompt for 80% power. With 100 cases per prompt you would detect it roughly 1 time in 8.","Una mejora de 5 puntos desde el 70 % necesita unos 1250 casos por prompt para una potencia del 80 %. Con 100 casos por prompt la detectarías más o menos 1 vez de cada 8."] },
  plays:[ { w:"power", title:["Trade effect size against sample size","Intercambia tamaño del efecto por tamaño de la muestra"],
      intro:[`<p>The dashed curve shows gaps you would see if B were no better: pure noise. The solid curve shows gaps you would see with the real improvement. You call B a winner only when the gap clears the orange line. Set the improvement to 5 points, then move both sliders and run the 200 tests.</p>`,`<p>La curva discontinua muestra las diferencias que verías si B no fuera mejor: puro ruido. La curva continua muestra las que verías con la mejora real. Solo declaras ganador a B cuando la diferencia supera la línea naranja. Pon la mejora en 5 puntos, mueve los dos controles y ejecuta las 200 pruebas.</p>`],
      notice:["more cases squeeze both curves, so they overlap less and more of the solid curve clears the line. A bigger real improvement slides the solid curve to the right. Either one raises power.","más casos estrechan las dos curvas, que se solapan menos, y una parte mayor de la curva continua supera la línea. Una mejora real mayor desplaza la curva continua hacia la derecha. Las dos cosas aumentan la potencia."],
      done:["Small improvements need big evals. Halving the effect you want to detect takes four times the cases.","Las mejoras pequeñas necesitan evals grandes. Detectar un efecto la mitad de grande exige cuatro veces más casos."] } ],
  code:{ title:["Measure power by simulation","Mide la potencia simulando"],
    intro:[`<p>Power needs no formula either. Simulate thousands of A/B tests where B truly is 5 points better and count how often the test notices. Fill the gap with the usual threshold: a gap of more than 1.96 standard errors.</p>`,`<p>La potencia tampoco necesita fórmula. Simula miles de pruebas A/B en las que B es de verdad 5 puntos mejor y cuenta cuántas veces lo nota el contraste. Rellena el hueco con el umbral habitual: una diferencia de más de 1.96 errores estándar.</p>`],
    py:`import numpy as np

rng = np.random.default_rng(seed=9)

def power(n, rate_a=0.70, rate_b=0.75, experiments=4000):
    #~ Many A/B tests where B really is better ~~ Muchas pruebas A/B en las que B es mejor de verdad
    a = rng.binomial(n, rate_a, size=experiments) / n
    b = rng.binomial(n, rate_b, size=experiments) / n
    #~ noise in the gap between two scores ~~ ruido de la diferencia entre dos puntuaciones
    se = np.sqrt(a * (1 - a) / n + b * (1 - b) / n)
    #~ GAP: we "detect" B when the gap exceeds this many standard errors ~~ HUECO: «detectamos» B cuando la diferencia supera este número de errores estándar
    detected = (b - a) > ____ * se
    return detected.mean()

for n in [100, 400, 1250, 3200]:
    print(f"{n:>5} cases per prompt: real 5-point gain detected {power(n):.0%} of the time")
`,
    dart:`import 'dart:math';

final rng = Random(9);

double score(int n, double rate) {
  var passes = 0;
  for (var i = 0; i < n; i++) {
    if (rng.nextDouble() < rate) passes++;
  }
  return passes / n;
}

double power(int n, {double rateA = 0.70, double rateB = 0.75, int experiments = 1000}) {
  var detected = 0;
  for (var e = 0; e < experiments; e++) {
    final a = score(n, rateA), b = score(n, rateB);
    //~ noise in the gap between two scores ~~ ruido de la diferencia entre dos puntuaciones
    final se = sqrt(a * (1 - a) / n + b * (1 - b) / n);
    if (b - a > 1.96 * se) detected++;
  }
  return detected / experiments;
}

void main() {
  for (final n in [100, 400, 1250, 3200]) {
    final pct = (100 * power(n)).round();
    print(n.toString().padLeft(5) + ' cases per prompt: real 5-point gain detected $pct% of the time');
  }
}
`,
    sol:[["____","1.96"]], check:`_p = power(1250)
"ok" if 0.72 < _p < 0.88 else ("zero" if _p > 0.95 else "no")`,
    ok:["With 100 cases per prompt you catch a real 5-point gain about 1 time in 8. Around 1,250 you reach 80%. An eval that is too small fails to see real improvements most of the time, and you would wrongly discard good prompts.","Con 100 casos por prompt detectas una mejora real de 5 puntos más o menos 1 vez de cada 8. En torno a 1250 llegas al 80 %. Una eval demasiado pequeña no ve las mejoras reales la mayoría de las veces, y descartarías prompts buenos por error."],
    msgs:{ zero:["With a threshold near zero, any positive gap counts as a detection. That looks like high power, but the same rule would declare a winner half the time when B is no better at all.","Con un umbral cercano a cero, cualquier diferencia positiva cuenta como detección. Parece mucha potencia, pero la misma regla declararía un ganador la mitad de las veces aunque B no fuera mejor."] },
    tests:[["0","zero"]] },
  qs:[
    { kind:"mc", title:["\"No significant difference\"","«Sin diferencia significativa»"], body:[`<p>You compare two prompts on 50 cases each. The p-value is 0.4, and the report concludes: "B is no better than A."</p>`,`<p>Comparas dos prompts con 50 casos cada uno. El valor p es 0,4 y el informe concluye: «B no es mejor que A».</p>`], legend:["What is wrong with that conclusion?","¿Qué falla en esa conclusión?"],
      opts:[ {t:["Nothing. A high p-value proves the prompts are equal","Nada. Un valor p alto demuestra que los prompts son iguales"], why:["A high p-value means the data fits \"no difference\". It fits a 5-point improvement about as well, because 50 cases cannot tell those two apart.","Un valor p alto significa que los datos encajan con «sin diferencia». Encajan casi igual de bien con una mejora de 5 puntos, porque 50 casos no distinguen entre las dos."]},
        {t:["With 50 cases the test had almost no power, so it would miss a real improvement most of the time","Con 50 casos el contraste casi no tenía potencia y pasaría por alto una mejora real la mayoría de las veces"], ok:true, why:["Not finding something with a tool that could not have found it tells you nothing. The honest summary is \"inconclusive: the eval was too small\".","No encontrar algo con una herramienta que no podía encontrarlo no te dice nada. El resumen honesto es «no concluyente: la eval era demasiado pequeña»."]},
        {t:["The p-value should be compared with 0.5","El valor p debería compararse con 0,5"], why:["The threshold is not the issue. Whatever cut-off you use, a 50-case comparison is too noisy to settle a small difference.","El umbral no es el problema. Uses el corte que uses, una comparación con 50 casos tiene demasiado ruido para resolver una diferencia pequeña."]} ] },
    { kind:"predict", run:true, title:["Half the effect","La mitad del efecto"], code:`def cases_needed(delta):
    return (1.96 + 0.84) ** 2 * 0.4 / delta ** 2

print(round(cases_needed(0.05) / cases_needed(0.10)))`,
      opts:[ {t:"4", ok:true, why:["The number of cases grows with 1 over the effect squared. Halving the effect, from 10 points to 5, multiplies the cases by 2 squared.","El número de casos crece con 1 partido por el efecto al cuadrado. Reducir el efecto a la mitad, de 10 puntos a 5, multiplica los casos por 2 al cuadrado."]},
        {t:"2", why:["That would be true if cases grew in step with 1 over the effect. They grow with 1 over the effect squared, so halving the effect quadruples the eval.","Eso sería cierto si los casos crecieran con 1 partido por el efecto. Crecen con 1 partido por el efecto al cuadrado, así que la mitad de efecto cuadruplica la eval."]},
        {t:"0", why:["A smaller effect is harder to see and needs more cases. The ratio is above 1.","Un efecto más pequeño es más difícil de ver y necesita más casos. La proporción es mayor que 1."]},
        {t:"1", why:["The number of cases depends strongly on the effect you want to detect. The same eval cannot be right for both a 10-point and a 5-point gain.","El número de casos depende mucho del efecto que quieres detectar. La misma eval no puede servir igual para una mejora de 10 puntos y para una de 5."]} ] },
    { kind:"fix", title:["Peeking until it is significant","Mirar hasta que salga significativo"], body:[`<p>This loop checks the test after every 10 cases and stops at the first significant result. It declares a winner far too often, even when the prompts are identical.</p>`,`<p>Este bucle revisa el contraste cada 10 casos y para en el primer resultado significativo. Declara un ganador demasiadas veces, incluso cuando los prompts son idénticos.</p>`],
      code:`for n in range(10, 2001, 10):
    if is_significant(a[:n], b[:n]):
        print("B wins after", n, "cases")
        break`, legend:["Which change fixes the procedure?","¿Qué cambio arregla el procedimiento?"],
      opts:[ {t:["Decide the number of cases in advance from a power calculation, and test once at the end","Decidir de antemano el número de casos con un cálculo de potencia y contrastar una sola vez al final"], ok:true, why:["Each look is another chance for noise to cross the line. With 200 looks, some run of luck almost always does. One planned look keeps the false alarm rate at the level you chose.","Cada mirada es otra oportunidad de que el ruido cruce la línea. Con 200 miradas, alguna racha de suerte casi siempre lo hace. Una sola mirada planificada mantiene la tasa de falsas alarmas en el nivel que elegiste."]},
        {t:["Check after every single case instead of every 10","Revisar después de cada caso en lugar de cada 10"], why:["More looks mean more chances for luck to cross the line. That makes the problem worse.","Más miradas significan más oportunidades de que el azar cruce la línea. Eso empeora el problema."]},
        {t:["Keep the loop and use p &lt; 0.10 as the cut-off","Dejar el bucle y usar p &lt; 0,10 como umbral"], why:["A looser cut-off is easier for noise to cross at every look, so false winners become even more common.","Un umbral más laxo es más fácil de cruzar para el ruido en cada mirada, y los falsos ganadores serían aún más frecuentes."]} ] } ],
  apply:{ seed:124, title:["Size the next eval","Dimensiona la próxima eval"],
    body:[`<p>You ran a pilot: 300 cases for prompt A and 300 for prompt B. Before the next round your lead asks how many cases it takes to detect a 3-point improvement over A reliably.</p>`,`<p>Has hecho un piloto: 300 casos para el prompt A y 300 para el B. Antes de la siguiente ronda, tu responsable pregunta cuántos casos hacen falta para detectar con fiabilidad una mejora de 3 puntos sobre A.</p>`],
    cols:["case_id","prompt","passed"],
    gen:(r) => Array.from({length:600}, (_,i) => ({case_id:"case-"+pad(i+1), prompt:i%2?"B":"A", passed:r.u()<(i%2?0.78:0.74)})),
    task:["Set <code>answer</code> to the number of cases per prompt needed for an 80% chance of detecting a <b>3-point</b> improvement over prompt A's pass rate.","Asigna a <code>answer</code> el número de casos por prompt necesario para tener un 80 % de probabilidad de detectar una mejora de <b>3 puntos</b> sobre la tasa de aciertos del prompt A."],
    hint:["Three points is 0.03 on the 0 to 1 scale. Call <code>cases_needed(rate_a, rate_a + 0.03)</code>.","Tres puntos son 0.03 en la escala de 0 a 1. Llama a <code>cases_needed(rate_a, rate_a + 0.03)</code>."],
    py:`import numpy as np

def cases_needed(rate_a, rate_b):
    #~ cases per prompt for an 80% chance of detecting the gap ~~ casos por prompt para un 80 % de probabilidad de detectar la diferencia
    spread = rate_a * (1 - rate_a) + rate_b * (1 - rate_b)
    return int(np.ceil((1.96 + 0.84) ** 2 * spread / (rate_b - rate_a) ** 2))

rates = df.groupby("prompt")["passed"].mean()
print(rates.round(3))
rate_a = rates["A"]

#~ YOUR TURN: cases per prompt to detect a 3-point improvement over A ~~ TU TURNO: casos por prompt para detectar una mejora de 3 puntos sobre A
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...","answer = cases_needed(rate_a, rate_a + 0.03)"]],
    check: chk(`cases_needed(_ra, _ra + 0.03)`, {usedb:`cases_needed(_ra, _rb)`, big:`cases_needed(_ra, _ra + 0.3)`, three:`cases_needed(_ra, _ra + 3) if _ra + 3 != _ra else 0`}, {e:`int(_e)`, ob:`cases_needed(_ra, _rb)`, pa:`round(_ra * 100, 1)`}, "0.5", `_ra = float(df[df["prompt"] == "A"]["passed"].mean()); _rb = float(df[df["prompt"] == "B"]["passed"].mean())`),
    ok:["You need about {e} cases per prompt. The pilot had 300, far too few to see a 3-point gain. Now you can either fund a bigger eval or decide that only larger improvements are worth chasing.","Necesitas unos {e} casos por prompt. El piloto tenía 300, muy pocos para ver una mejora de 3 puntos. Ahora puedes financiar una eval mayor o decidir que solo merece la pena perseguir mejoras más grandes."],
    msgs:{ type:TYPE_MSG, usedb:["You plugged in prompt B's pilot score. That sizes the eval for whatever gap the noisy pilot happened to show. The question fixes the gap at 3 points above A.","Has usado la puntuación de B en el piloto. Eso dimensiona la eval para la diferencia que el piloto, con su ruido, mostró por casualidad. La pregunta fija la diferencia en 3 puntos por encima de A."],
      big:["0.3 is 30 points. Three points is 0.03.","0.3 son 30 puntos. Tres puntos son 0.03."],
      three:["Rates run from 0 to 1, so adding 3 leaves the scale. Three points is 0.03.","Las tasas van de 0 a 1, así que sumar 3 se sale de la escala. Tres puntos son 0.03."] },
    tests:[[[["answer = ...",'answer = cases_needed(rate_a, rates["B"])']],"usedb"],[[["answer = ...","answer = cases_needed(rate_a, rate_a + 0.3)"]],"big"]] },
  recap:{ takes:[["<b>Effect size is how big the improvement is.</b> A p-value alone never tells you that.","<b>El tamaño del efecto es lo grande que es la mejora.</b> Un valor p solo nunca te lo dice."],
      ["<b>Power is the chance of noticing a real effect.</b> Small evals have little, so their \"no difference\" results are inconclusive.","<b>La potencia es la probabilidad de notar un efecto real.</b> Las evals pequeñas tienen poca, y sus resultados de «sin diferencia» no son concluyentes."],
      ["<b>Plan the size first.</b> Half the effect needs four times the cases. Decide n in advance and test once.","<b>Planifica primero el tamaño.</b> La mitad de efecto necesita cuatro veces más casos. Decide n de antemano y contrasta una sola vez."]],
    f:`<button class="sym" data-g="p1">n</button> ≈ (1.96 + <button class="sym" data-g="p1">0.84</button>)² × (p<sub>A</sub>(1 − p<sub>A</sub>) + p<sub>B</sub>(1 − p<sub>B</sub>)) / <button class="sym" data-g="p1">δ</button>²`,
    read:["Read it as: cases per prompt grow with the noise of pass/fail data and shrink with the square of the gap you want to detect.","Léela así: los casos por prompt crecen con el ruido de los datos pasa/falla y disminuyen con el cuadrado de la diferencia que quieres detectar."],
    syms:[ {s:"n", g:"p1", d:["Cases per prompt: the second slider and the \"cases for 80% power\" readout.","Casos por prompt: el segundo control y el dato «casos para 80 % de potencia»."]},
      {s:"δ", g:"p1", d:["Said \"delta\". The effect size: the improvement slider.","Se lee «delta». El tamaño del efecto: el control de la mejora."]},
      {s:"0.84", g:"p1", d:["The number that sets power to 80%: enough of the solid curve clears the orange line.","El número que fija la potencia en el 80 %: una parte suficiente de la curva continua supera la línea naranja."]},
      {s:"1.96", g:"p1", d:["The orange line: a gap of 1.96 standard errors, crossed by pure noise only 5% of the time.","La línea naranja: una diferencia de 1.96 errores estándar, que el puro ruido cruza solo el 5 % de las veces."]} ],
    next:["Intermediate 5 moves from comparing two groups to relating two measurements: correlation and regression.","Intermedio 5 pasa de comparar dos grupos a relacionar dos medidas: correlación y regresión."],
    deeper:[SRC.st("frequentist-inference","Frequentist Inference","Inferencia frecuentista"), SRC.rp] },
  gloss:[ [["Effect size","Tamaño del efecto"],["How big a difference really is, for example a 5-point gain in pass rate.","Lo grande que es de verdad una diferencia, por ejemplo una mejora de 5 puntos en la tasa de aciertos."],"hook"],
    [["Power","Potencia"],["The chance that a test detects an effect that really exists.","La probabilidad de que un contraste detecte un efecto que existe de verdad."],"hook"],
    [["A/B test","Prueba A/B"],["A comparison of two versions on comparable cases to see which performs better.","Una comparación de dos versiones sobre casos comparables para ver cuál rinde mejor."],"p1"] ]
});

/* ================= Intermediate 5 ================= */
L({ id:"i5", title:["Correlation and regression","Correlación y regresión"], q:["Does context length predict failures?","¿La longitud del contexto predice los fallos?"],
  hook:{ at:"p2", answer:1, title:["Long contexts, more failures","Contextos largos, más fallos"],
    body:[`<p>You plot failure rate against context length for your RAG agent, and the cloud of points slopes upward. Someone proposes truncating every context to 8k tokens.</p><p><dfn>Correlation</dfn> measures how closely two quantities move together. It is a number called r, between −1 and 1.</p>`,
      `<p>Dibujas la tasa de fallos frente a la longitud del contexto de tu agente RAG y la nube de puntos sube. Alguien propone truncar todos los contextos a 8k tokens.</p><p>La <dfn>correlación</dfn> mide lo estrechamente que se mueven juntas dos cantidades. Es un número llamado r, entre −1 y 1.</p>`],
    legend:["Predict: r is 0.8. Will truncating contexts reduce failures?","Predice: r vale 0,8. ¿Truncar los contextos reducirá los fallos?"],
    opts:[["Yes. A correlation that strong means context length causes failures","Sí. Una correlación tan fuerte significa que la longitud del contexto causa los fallos"],["You cannot tell from the correlation alone","No se puede saber solo con la correlación"],["No. Correlations are never causal","No. Las correlaciones nunca son causales"]],
    reveal:["Colouring by task type shows two flat clouds. Complex tasks have long contexts and fail more, for reasons of their own. Inside each task type, context length predicts almost nothing, so truncation would cut information and fix nothing.","Al colorear por tipo de tarea aparecen dos nubes planas. Las tareas complejas tienen contextos largos y fallan más, por razones propias. Dentro de cada tipo de tarea, la longitud del contexto no predice casi nada: truncar quitaría información y no arreglaría nada."] },
  plays:[
    { w:"scatter", title:["Bend the cloud, then break it with one point","Dobla la nube y después rómpela con un punto"],
      intro:[`<p>Each dot is a batch of answers. The green line is the <dfn>regression line</dfn>: the straight line that fits the dots best. Change the noise, then click the chart to drop a point far from the others.</p>`,`<p>Cada punto es un lote de respuestas. La línea verde es la <dfn>recta de regresión</dfn>: la recta que mejor se ajusta a los puntos. Cambia el ruido y después haz clic en el gráfico para soltar un punto lejos de los demás.</p>`],
      notice:["noise lowers r without changing the slope much: the relationship is the same, only blurrier. One extreme point can tilt the line on its own.","el ruido baja r sin cambiar mucho la pendiente: la relación es la misma, solo que más borrosa. Un único punto extremo puede inclinar la recta por sí solo."],
      done:["r says how tightly the dots hug a line. The slope says how much y changes per unit of x. They are different questions.","r dice lo pegados que están los puntos a una recta. La pendiente dice cuánto cambia y por cada unidad de x. Son preguntas distintas."] },
    { w:"confound", title:["Find the hidden third variable","Encuentra la tercera variable oculta"],
      intro:[`<p>Here is a strong correlation between context length and failures. Before acting on it, colour the points by task type.</p>`,`<p>Aquí hay una correlación fuerte entre longitud del contexto y fallos. Antes de actuar, colorea los puntos por tipo de tarea.</p>`],
      notice:["the overall line slopes up steeply, and each coloured group is nearly flat. Task type drives both context length and failures.","la recta global sube con fuerza y cada grupo de color es casi plano. El tipo de tarea determina tanto la longitud del contexto como los fallos."],
      done:["A hidden factor that drives both variables is called a <dfn>confounder</dfn>. Correlation shows that two things move together. It never shows why.","Un factor oculto que mueve las dos variables se llama <dfn>variable de confusión</dfn>. La correlación muestra que dos cosas se mueven juntas. Nunca muestra por qué."] } ],
  code:{ title:["Correlation and a fitted line","Correlación y una recta ajustada"],
    intro:[`<p>Two NumPy calls do the work: <code>np.corrcoef</code> for r and <code>np.polyfit</code> for the line. Fill the gap with the degree of the polynomial that is a straight line.</p>`,`<p>Dos llamadas de NumPy hacen el trabajo: <code>np.corrcoef</code> para r y <code>np.polyfit</code> para la recta. Rellena el hueco con el grado del polinomio que es una línea recta.</p>`],
    py:`import numpy as np

rng = np.random.default_rng(seed=12)
n = 300
context_k = rng.uniform(1, 32, size=n)                 #~ context length, thousands of tokens ~~ longitud del contexto, en miles de tokens
fail_rate = 5 + 0.6 * context_k + rng.normal(0, 6, n)  #~ failures per 100 answers ~~ fallos por cada 100 respuestas

r = np.corrcoef(context_k, fail_rate)[0, 1]
#~ GAP: fit a straight line (a polynomial of what degree?) ~~ HUECO: ajusta una línea recta (¿un polinomio de qué grado?)
slope, intercept = np.polyfit(context_k, fail_rate, ____)
print(f"correlation r = {r:.2f}")
print(f"line: fail_rate = {intercept:.1f} + {slope:.2f} * context_k")
print(f"prediction at 20k tokens: {intercept + slope * 20:.1f} failures per 100")
`,
    dart:`import 'dart:math';

void main() {
  final rng = Random(12);
  double gaussian() => sqrt(-2 * log(1 - rng.nextDouble())) * cos(2 * pi * rng.nextDouble());
  const n = 300;
  final x = [for (var i = 0; i < n; i++) 1 + 31 * rng.nextDouble()]; //~ context length (k tokens) ~~ longitud del contexto (k tokens)
  final y = [for (final v in x) 5 + 0.6 * v + 6 * gaussian()]; //~ failures per 100 ~~ fallos por cada 100

  final mx = x.reduce((a, b) => a + b) / n, my = y.reduce((a, b) => a + b) / n;
  var sxy = 0.0, sxx = 0.0, syy = 0.0;
  for (var i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) * (x[i] - mx);
    syy += (y[i] - my) * (y[i] - my);
  }
  final r = sxy / sqrt(sxx * syy);
  final slope = sxy / sxx, intercept = my - slope * mx;
  print('correlation r = ' + r.toStringAsFixed(2));
  print('line: fail_rate = ' + intercept.toStringAsFixed(1) + ' + ' + slope.toStringAsFixed(2) + ' * context_k');
}
`,
    sol:[["____","1"]], check:`"ok" if abs(slope - np.polyfit(context_k, fail_rate, 1)[0]) < 1e-9 else "no"`,
    ok:["r is about 0.68 and the slope about 0.6: each extra thousand tokens goes with 0.6 more failures per 100. The line predicts; it does not explain. This data was built so that context length truly matters, which real data never guarantees.","r es alrededor de 0.68 y la pendiente alrededor de 0.6: cada mil tokens adicionales van con 0.6 fallos más por cada 100. La recta predice; no explica. Estos datos se construyeron para que la longitud del contexto importe de verdad, cosa que los datos reales nunca garantizan."],
    msgs:{ err:["The error says the number of returned values does not match <code>slope, intercept</code>. A straight line has exactly two numbers, a slope and an intercept, and that is a polynomial of degree 1.","El error dice que el número de valores devueltos no cuadra con <code>slope, intercept</code>. Una recta tiene exactamente dos números, pendiente y término independiente, y eso es un polinomio de grado 1."] },
    tests:[["2","err"],["0","err"]] },
  qs:[
    { kind:"mc", title:["Tool calls and success","Llamadas a herramientas y éxito"], body:[`<p>Across 500 agent runs, the number of tool calls and task success have a correlation of 0.7.</p>`,`<p>En 500 ejecuciones de un agente, el número de llamadas a herramientas y el éxito de la tarea tienen una correlación de 0,7.</p>`], legend:["Which statement is safe?","¿Qué afirmación es segura?"],
      opts:[ {t:["Forcing the agent to make more tool calls will raise success","Obligar al agente a hacer más llamadas subirá el éxito"], why:["That is a causal claim. Perhaps easy tasks are both solvable and allow many clean tool calls. Only an experiment that changes tool calls and nothing else can show cause.","Esa es una afirmación causal. Quizá las tareas fáciles son resolubles y además permiten muchas llamadas limpias. Solo un experimento que cambie las llamadas y nada más puede demostrar la causa."]},
        {t:["Runs with more tool calls tend to succeed more often","Las ejecuciones con más llamadas tienden a tener más éxito"], ok:true, why:["That describes what the data shows and stops there. A correlation supports \"tend to go together\" and nothing stronger.","Eso describe lo que muestran los datos y se detiene ahí. Una correlación respalda «tienden a ir juntas» y nada más fuerte."]},
        {t:["70% of runs with many tool calls succeed","El 70 % de las ejecuciones con muchas llamadas tiene éxito"], why:["r is not a percentage of anything. It is a unit-free number from −1 to 1 describing how tightly the points follow a line.","r no es un porcentaje de nada. Es un número sin unidades, de −1 a 1, que describe lo pegados que están los puntos a una recta."]} ] },
    { kind:"predict", run:true, title:["A perfect downhill line","Una recta perfecta cuesta abajo"], code:`import numpy as np
x = np.array([1, 2, 3, 4, 5])
y = 10 - 2 * x
print(round(np.corrcoef(x, y)[0, 1], 2))`,
      opts:[ {t:"-1.0", ok:true, why:["Every point sits exactly on a line that goes down, so the correlation is as strong as it can be and negative. r measures how well a line fits, with the sign of its direction.","Todos los puntos están exactamente sobre una recta que baja, así que la correlación es tan fuerte como puede ser y negativa. r mide lo bien que encaja una recta, con el signo de su dirección."]},
        {t:"-2.0", why:["−2 is the slope. r never leaves the range −1 to 1, however steep the line.","−2 es la pendiente. r nunca sale del rango de −1 a 1, por muy inclinada que sea la recta."]},
        {t:"1.0", why:["The fit is perfect, but y falls as x rises, so the sign is negative.","El ajuste es perfecto, pero y baja cuando x sube, así que el signo es negativo."]},
        {t:"0.0", why:["Zero would mean no straight-line relationship. Here the relationship is exact.","Cero significaría que no hay relación lineal. Aquí la relación es exacta."]} ] },
    { kind:"fix", title:["A prediction of 400 failures per 100","Una predicción de 400 fallos por cada 100"], body:[`<p>This should predict the failure rate for a 20k-token context. It prints an absurd number.</p>`,`<p>Esto debería predecir la tasa de fallos para un contexto de 20k tokens. Imprime un número absurdo.</p>`],
      code:`slope, intercept = np.polyfit(fail_rate, context_k, 1)
print(intercept + slope * 20)`, legend:["Which change fixes it?","¿Qué cambio lo arregla?"],
      opts:[ {t:["<code>np.polyfit(context_k, fail_rate, 1)</code>","<code>np.polyfit(context_k, fail_rate, 1)</code>"], ok:true, why:["<code>polyfit(x, y, 1)</code> predicts y from x. The buggy call fitted context length as a function of failure rate, and then plugged a context length in where a failure rate belongs.","<code>polyfit(x, y, 1)</code> predice y a partir de x. La llamada con el error ajustó la longitud del contexto en función de la tasa de fallos y después metió una longitud de contexto donde va una tasa de fallos."]},
        {t:["<code>print(slope + intercept * 20)</code>","<code>print(slope + intercept * 20)</code>"], why:["That swaps the roles of slope and intercept in the formula. The line is still fitted the wrong way round.","Eso intercambia los papeles de la pendiente y el término independiente en la fórmula. La recta sigue ajustada al revés."]},
        {t:["Use degree 2 instead of 1","Usar grado 2 en lugar de 1"], why:["A curve fitted with x and y swapped is still answering the wrong question.","Una curva ajustada con x e y intercambiadas sigue respondiendo a la pregunta equivocada."]} ] } ],
  apply:{ seed:135, title:["Should you truncate contexts?","¿Deberías truncar los contextos?"],
    body:[`<p>800 logged cases, each with its context length, an error score from your grader, and the task type. The overall correlation is strong. Check whether it survives inside one task type.</p>`,`<p>800 casos registrados, cada uno con su longitud de contexto, una puntuación de error de tu evaluador y el tipo de tarea. La correlación global es fuerte. Comprueba si sobrevive dentro de un tipo de tarea.</p>`],
    cols:["case_id","task_type","context_k","error_score"],
    gen:(r) => r.shuffle(Array.from({length:800}, (_,i) => { const cx = i%2===1; return {task_type:cx?"complex":"simple", context_k:(cx ? 14+18*r.u() : 1+11*r.u()).toFixed(1), error_score:Math.max(0, (cx?26:8)+(cx?5:3.5)*r.n()).toFixed(1)}; })).map((o,i) => Object.assign({case_id:"case-"+pad(i+1)}, o)),
    task:["Set <code>answer</code> to the correlation between <code>context_k</code> and <code>error_score</code> among <b>complex</b> tasks only.","Asigna a <code>answer</code> la correlación entre <code>context_k</code> y <code>error_score</code> solo en las tareas <b>complex</b>."],
    hint:["Filter first: <code>cx = df[df[\"task_type\"] == \"complex\"]</code>. Then <code>np.corrcoef(cx[\"context_k\"], cx[\"error_score\"])[0, 1]</code>.","Filtra primero: <code>cx = df[df[\"task_type\"] == \"complex\"]</code>. Después <code>np.corrcoef(cx[\"context_k\"], cx[\"error_score\"])[0, 1]</code>."],
    py:`import numpy as np

r_all = np.corrcoef(df["context_k"], df["error_score"])[0, 1]
print(f"correlation across all cases: {r_all:.2f}")
print(df.groupby("task_type")[["context_k", "error_score"]].mean().round(1))

#~ YOUR TURN: the same correlation, among complex tasks only ~~ TU TURNO: la misma correlación, solo entre las tareas complex
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...",'cx = df[df["task_type"] == "complex"]\nanswer = np.corrcoef(cx["context_k"], cx["error_score"])[0, 1]']],
    check: chk(`_n.corrcoef(_cx["context_k"], _cx["error_score"])[0, 1]`, {overall:`_n.corrcoef(df["context_k"], df["error_score"])[0, 1]`, simple:`_n.corrcoef(_sx["context_k"], _sx["error_score"])[0, 1]`}, {e:`round(_e, 2)`, a:`round(float(_n.corrcoef(df["context_k"], df["error_score"])[0, 1]), 2)`}, "1e-9", `_cx = df[df["task_type"] == "complex"]; _sx = df[df["task_type"] == "simple"]`),
    ok:["Across all cases r is {a}. Among complex tasks it is {e}, close to zero. Context length was standing in for task difficulty. Truncating contexts would not reduce failures, and you just avoided shipping a harmful change.","En todos los casos r es {a}. Entre las tareas complejas es {e}, cerca de cero. La longitud del contexto estaba sustituyendo a la dificultad de la tarea. Truncar los contextos no reduciría los fallos, y acabas de evitar un cambio dañino."],
    msgs:{ type:TYPE_MSG, overall:["That is the correlation across all cases, which mixes the two task types. Filter to complex tasks first.","Esa es la correlación de todos los casos, que mezcla los dos tipos de tarea. Filtra primero las tareas complex."],
      simple:["That is the correlation among simple tasks. The task asks about complex ones.","Esa es la correlación entre las tareas simple. La tarea pregunta por las complex."] },
    tests:[[[["answer = ...","answer = r_all"]],"overall"]] },
  recap:{ takes:[["<b>r measures how tightly two things move together.</b> It runs from −1 to 1 and has no units.","<b>r mide lo pegadas que se mueven dos cosas.</b> Va de −1 a 1 y no tiene unidades."],
      ["<b>The regression line predicts.</b> Its slope says how much y changes per unit of x, on average.","<b>La recta de regresión predice.</b> Su pendiente dice cuánto cambia y por cada unidad de x, en promedio."],
      ["<b>Correlation is not causation.</b> A hidden factor can drive both variables. Split by plausible confounders before acting.","<b>Correlación no es causalidad.</b> Un factor oculto puede mover las dos variables. Separa por posibles variables de confusión antes de actuar."]],
    f:`<button class="sym" data-g="p1">ŷ</button> = <button class="sym" data-g="p1">a</button> + <button class="sym" data-g="p1">b</button> · x &nbsp;&nbsp;·&nbsp;&nbsp; −1 ≤ <button class="sym" data-g="p1">r</button> ≤ 1`,
    read:["Read it as: the predicted y is a starting value plus the slope times x. Separately, r says how well any such line fits.","Léela así: la y predicha es un valor de partida más la pendiente por x. Aparte, r dice lo bien que encaja una recta así."],
    syms:[ {s:"ŷ", g:"p1", d:["Said \"y hat\". The prediction: the height of the green line at a given x.","Se lee «y con sombrero». La predicción: la altura de la línea verde para una x dada."]},
      {s:"a", g:"p1", d:["The intercept: where the line starts at x = 0.","El término independiente: donde empieza la recta en x = 0."]},
      {s:"b", g:"p1", d:["The slope readout: failures added per extra thousand tokens.","La pendiente: fallos añadidos por cada mil tokens adicionales."]},
      {s:"r", g:"p1", d:["The correlation readout.","El dato de la correlación."]} ],
    next:["Intermediate 6 measures yes/no classifiers: confusion matrix, precision, recall and what to do when one class is rare.","Intermedio 6 mide clasificadores de sí/no: matriz de confusión, precisión, recall y qué hacer cuando una clase es rara."],
    deeper:[SRC.st("regression-analysis","Regression Analysis","Análisis de regresión"), SRC.rp] },
  gloss:[ [["Correlation (r)","Correlación (r)"],["A number from −1 to 1 that says how closely two quantities follow a straight-line relationship.","Un número de −1 a 1 que indica lo cerca que están dos cantidades de una relación lineal."],"hook"],
    [["Regression line","Recta de regresión"],["The straight line that best fits a cloud of points, used to predict one quantity from another.","La recta que mejor se ajusta a una nube de puntos, usada para predecir una cantidad a partir de otra."],"p1"],
    [["Confounder","Variable de confusión"],["A hidden factor that influences both variables and creates a correlation between them.","Un factor oculto que influye en las dos variables y crea una correlación entre ellas."],"p2"] ]
});

/* ================= Intermediate 6 ================= */
L({ id:"i6", title:["Classification metrics","Métricas de clasificación"], q:["Precision, recall, F1, ROC: which one do I report?","Precisión, recall, F1, ROC: ¿cuál presento?"],
  hook:{ answer:2, title:["\"Our guardrail is 96% accurate\"","«Nuestro filtro tiene un 96 % de exactitud»"],
    body:[`<p>That is the headline of a vendor report. In your traffic 4% of messages are harmful. <dfn>Accuracy</dfn> is the share of all decisions that are right, flagged or not.</p>`,
      `<p>Ese es el titular del informe de un proveedor. En tu tráfico, el 4 % de los mensajes es dañino. La <dfn>exactitud</dfn> (accuracy) es la proporción de decisiones correctas, marque o no marque.</p>`],
    legend:["Predict: a \"guardrail\" that never flags anything gets what accuracy on your traffic?","Predice: un «filtro» que nunca marca nada, ¿qué exactitud obtiene con tu tráfico?"],
    opts:[["4%","4 %"],["50%","50 %"],["96%","96 %"]],
    reveal:["Drag the threshold to 1.00: nothing is flagged, accuracy reads 96%, recall is 0% and balanced accuracy is 50%. With rare classes, accuracy rewards doing nothing.","Arrastra el umbral hasta 1,00: no se marca nada, la exactitud marca 96 %, el recall es 0 % y la exactitud balanceada es 50 %. Con clases raras, la exactitud premia no hacer nada."] },
  plays:[ { w:"threshold", title:["Drag the threshold, watch every metric move","Arrastra el umbral y mira cómo se mueven las métricas"],
      intro:[`<p>A classifier gives each message a score. You choose a <dfn>threshold</dfn>: flag everything above it. The four boxes are the <dfn>confusion matrix</dfn>: every message lands in exactly one. Drag the threshold line, then change how many messages are harmful.</p>`,`<p>Un clasificador da una puntuación a cada mensaje. Tú eliges un <dfn>umbral</dfn>: se marca todo lo que lo supera. Las cuatro casillas son la <dfn>matriz de confusión</dfn>: cada mensaje cae en una sola. Arrastra la línea del umbral y después cambia cuántos mensajes son dañinos.</p>`],
      notice:["lowering the threshold raises recall and lowers precision: you catch more and cry wolf more. The point slides along the ROC curve, which shows every trade-off this classifier can offer. Changing the harmful share moves precision and accuracy but leaves recall and the ROC curve alone.","bajar el umbral sube el recall y baja la precisión: detectas más y das más falsas alarmas. El punto se desliza por la curva ROC, que muestra todos los equilibrios que ofrece este clasificador. Cambiar la proporción de dañinos mueve la precisión y la exactitud, pero deja igual el recall y la curva ROC."],
      done:["No threshold is correct in general. You pick one by deciding which mistake costs more: a missed harmful message or a false alarm.","Ningún umbral es correcto en general. Lo eliges decidiendo qué error cuesta más: un mensaje dañino que se escapa o una falsa alarma."] } ],
  code:{ title:["From four counts to four metrics","De cuatro recuentos a cuatro métricas"],
    intro:[`<p><dfn>Precision</dfn> is the share of flags that are right. <dfn>Recall</dfn> is the share of harmful messages that get flagged. Both come from the four counts. Fill the gap to finish recall.</p>`,`<p>La <dfn>precisión</dfn> es la proporción de marcas correctas. El <dfn>recall</dfn> es la proporción de mensajes dañinos que se marcan. Las dos salen de los cuatro recuentos. Rellena el hueco para completar el recall.</p>`],
    py:`import numpy as np

rng = np.random.default_rng(seed=14)
n = 5000
harmful = rng.random(n) < 0.04                      #~ 4% of messages are harmful ~~ el 4 % de los mensajes es dañino
score = np.where(harmful, rng.normal(0.68, 0.14, n), rng.normal(0.38, 0.14, n))
flagged = score > 0.5                               #~ the threshold ~~ el umbral

tp = (flagged & harmful).sum();  fp = (flagged & ~harmful).sum()
fn = (~flagged & harmful).sum(); tn = (~flagged & ~harmful).sum()
precision = tp / (tp + fp)
#~ GAP: recall = flagged harmful / all harmful. Which count completes "all harmful"? ~~ HUECO: recall = dañinos marcados / todos los dañinos. ¿Qué recuento completa «todos los dañinos»?
recall = tp / (tp + ____)
print(f"TP={tp} FP={fp} FN={fn} TN={tn}")
print(f"accuracy  = {(tp + tn) / n:.1%}")
print(f"precision = {precision:.1%}")
print(f"recall    = {recall:.1%}")
print(f"F1        = {2 * precision * recall / (precision + recall):.1%}")
`,
    dart:`import 'dart:math';

void main() {
  final rng = Random(14);
  double gaussian() => sqrt(-2 * log(1 - rng.nextDouble())) * cos(2 * pi * rng.nextDouble());
  var tp = 0, fp = 0, fn = 0, tn = 0;
  for (var i = 0; i < 5000; i++) {
    final harmful = rng.nextDouble() < 0.04; //~ 4% are harmful ~~ el 4 % es dañino
    final score = (harmful ? 0.68 : 0.38) + 0.14 * gaussian();
    final flagged = score > 0.5; //~ the threshold ~~ el umbral
    if (flagged && harmful) tp++;
    if (flagged && !harmful) fp++;
    if (!flagged && harmful) fn++;
    if (!flagged && !harmful) tn++;
  }
  final precision = tp / (tp + fp);
  final recall = tp / (tp + fn);
  final f1 = 2 * precision * recall / (precision + recall);
  print('TP=$tp FP=$fp FN=$fn TN=$tn');
  print('precision = ' + (100 * precision).toStringAsFixed(1) + '%');
  print('recall    = ' + (100 * recall).toStringAsFixed(1) + '%');
  print('F1        = ' + (100 * f1).toStringAsFixed(1) + '%');
}
`,
    sol:[["____","fn"]], check:`"ok" if abs(recall - tp / (tp + fn)) < 1e-12 else ("fp" if abs(recall - precision) < 1e-12 else ("tn" if abs(recall - tp / (tp + tn)) < 1e-12 else "no"))`,
    ok:["Accuracy is about 80% and recall is above 90%, yet precision is under 20%: more than four flags in five are false alarms. <dfn>F1</dfn> combines precision and recall into one number and is pulled toward the weaker of the two.","La exactitud ronda el 80 % y el recall supera el 90 %, pero la precisión no llega al 20 %: más de cuatro marcas de cada cinco son falsas alarmas. <dfn>F1</dfn> combina precisión y recall en un número y se acerca a la más débil de las dos."],
    msgs:{ fp:["TP + FP is everything that was flagged, which makes this precision again. Recall divides by everything that is truly harmful: the caught ones plus the missed ones.","TP + FP es todo lo que se marcó, y eso vuelve a ser la precisión. El recall divide por todo lo realmente dañino: los detectados más los que se escaparon."],
      tn:["True negatives are safe messages left alone. They are not harmful, so they do not belong in recall's denominator.","Los verdaderos negativos son mensajes seguros que no se tocaron. No son dañinos, así que no pertenecen al denominador del recall."] },
    tests:[["fp","fp"],["tn","tn"]] },
  qs:[
    { kind:"mc", title:["Which metric for which fear","Qué métrica para qué miedo"], body:[`<p>Your guardrail screens for instructions on self-harm. Missing one is far worse than sending a safe message to human review.</p>`,`<p>Tu filtro busca instrucciones de autolesión. Dejar pasar una es mucho peor que mandar un mensaje seguro a revisión humana.</p>`], legend:["Which metric should you push up first?","¿Qué métrica deberías subir primero?"],
      opts:[ {t:["Precision","La precisión"], why:["Precision guards against false alarms. Here false alarms are the cheap mistake.","La precisión protege contra las falsas alarmas. Aquí las falsas alarmas son el error barato."]},
        {t:["Recall","El recall"], ok:true, why:["Recall is the share of harmful messages you catch. When a miss is the expensive mistake, set a recall target first and then get the best precision you can at that level.","El recall es la proporción de mensajes dañinos que detectas. Cuando lo caro es que se escape uno, fija primero un objetivo de recall y después consigue la mejor precisión posible a ese nivel."]},
        {t:["Accuracy","La exactitud"], why:["With a rare class, accuracy is dominated by the many safe messages and barely notices missed harmful ones.","Con una clase rara, la exactitud está dominada por los muchos mensajes seguros y apenas nota los dañinos que se escapan."]} ] },
    { kind:"predict", run:true, title:["Precision and recall by hand","Precisión y recall a mano"], code:`tp, fp, fn, tn = 30, 10, 20, 940
precision = tp / (tp + fp)
recall = tp / (tp + fn)
print(precision, recall)`,
      opts:[ {t:"0.75 0.6", ok:true, why:["40 messages were flagged and 30 of them were harmful: 0.75. 50 messages were harmful and 30 of them were flagged: 0.6.","Se marcaron 40 mensajes y 30 eran dañinos: 0.75. Había 50 mensajes dañinos y se marcaron 30: 0.6."]},
        {t:"0.6 0.75", why:["The two are swapped. Precision looks down the flagged column (30 of 40). Recall looks along the harmful row (30 of 50).","Están intercambiadas. La precisión mira la columna de marcados (30 de 40). El recall mira la fila de dañinos (30 de 50)."]},
        {t:"0.97 0.6", why:["0.97 is the accuracy: (30 + 940) / 1000. Precision ignores the 940 true negatives.","0.97 es la exactitud: (30 + 940) / 1000. La precisión ignora los 940 verdaderos negativos."]},
        {t:"0.75 0.03", why:["0.03 is 30 divided by all 1,000 messages. Recall divides by the 50 harmful ones only.","0.03 es 30 dividido entre los 1000 mensajes. El recall divide solo entre los 50 dañinos."]} ] },
    { kind:"fix", title:["Balanced accuracy that is not balanced","Una exactitud balanceada que no lo es"], body:[`<p><dfn>Balanced accuracy</dfn> should average how well you do on each class separately. This line reports 47% for a classifier that is clearly useful.</p>`,`<p>La <dfn>exactitud balanceada</dfn> debería promediar lo bien que lo haces en cada clase por separado. Esta línea da un 47 % para un clasificador que claramente es útil.</p>`],
      code:`balanced = (precision + recall) / 2`, legend:["Which replacement is right?","¿Qué sustitución es correcta?"],
      opts:[ {t:["<code>balanced = (tp / (tp + fn) + tn / (tn + fp)) / 2</code>","<code>balanced = (tp / (tp + fn) + tn / (tn + fp)) / 2</code>"], ok:true, why:["Balanced accuracy averages recall on harmful messages with recall on safe messages. Each class counts equally, however rare it is. Precision is not a per-class recall.","La exactitud balanceada promedia el recall en los mensajes dañinos con el recall en los seguros. Cada clase cuenta lo mismo, por rara que sea. La precisión no es un recall por clase."]},
        {t:["<code>balanced = (tp + tn) / n</code>","<code>balanced = (tp + tn) / n</code>"], why:["That is plain accuracy, which the common class dominates.","Esa es la exactitud normal, dominada por la clase frecuente."]},
        {t:["<code>balanced = 2 * precision * recall / (precision + recall)</code>","<code>balanced = 2 * precision * recall / (precision + recall)</code>"], why:["That is F1. It is a useful number, but it ignores true negatives entirely and is a different metric.","Eso es F1. Es un número útil, pero ignora por completo los verdaderos negativos y es otra métrica."]} ] } ],
  apply:{ seed:146, title:["Pick a threshold for a recall target","Elige un umbral para un objetivo de recall"],
    body:[`<p>Trust and safety has set a rule: the guardrail must catch at least 90% of harmful messages. Within that rule you want as few false alarms as possible, so you want the highest threshold that still meets the target.</p>`,`<p>El equipo de seguridad ha fijado una regla: el filtro debe detectar al menos el 90 % de los mensajes dañinos. Dentro de esa regla quieres las menos falsas alarmas posibles, así que buscas el umbral más alto que aún cumple el objetivo.</p>`],
    cols:["msg_id","score","harmful"],
    gen:(r) => Array.from({length:4000}, (_,i) => { const h = r.u() < 0.05; return {msg_id:"msg-"+pad(i+1), score:Math.min(.999, Math.max(.001, (h?.68:.38)+.14*r.n())).toFixed(3), harmful:h}; }),
    task:["Complete the <code>if</code> so that <code>answer</code> ends up as the highest threshold whose recall is still at least 0.90.","Completa el <code>if</code> para que <code>answer</code> acabe siendo el umbral más alto cuyo recall siga siendo al menos 0.90."],
    hint:["The loop goes from low thresholds to high ones. Keep updating <code>best</code> while the target holds: <code>if recall &gt;= 0.90:</code>.","El bucle va de umbrales bajos a altos. Sigue actualizando <code>best</code> mientras se cumpla el objetivo: <code>if recall &gt;= 0.90:</code>."],
    py:`import numpy as np

score = df["score"].to_numpy()
harmful = df["harmful"].to_numpy()

best = None
for t in np.arange(0.00, 1.01, 0.01):
    flagged = score > t
    recall = (flagged & harmful).sum() / harmful.sum()
    #~ YOUR TURN: keep this threshold when recall still meets the target ~~ TU TURNO: quédate con este umbral cuando el recall aún cumple el objetivo
    if ...:
        best = t

answer = best
print("answer =", answer)
`,
    sol:[["if ...:","if recall >= 0.90:"]],
    check:`import json as _j, numpy as _n
_s = df["score"].to_numpy(); _h = df["harmful"].to_numpy(); _e = None
for _t in _n.arange(0.00, 1.01, 0.01):
    if ((_s > _t) & _h).sum() / _h.sum() >= 0.90: _e = float(_t)
_f = _s > _e; _a = globals().get("answer")
def _k():
    if _a is ... or _a is None: return "dots"
    try: _v = float(_a)
    except Exception: return "type"
    if abs(_v - _e) < 1e-6: return "ok"
    if abs(_v - 1.0) < 1e-6: return "dots"
    if _v > _e: return "high"
    return "lowt"
_j.dumps({"k": _k(), "e": round(_e, 2), "p": round(float((_f & _h).sum() / _f.sum()) * 100, 1), "r": round(float((_f & _h).sum() / _h.sum()) * 100, 1)})`,
    ok:["A threshold of {e} keeps recall at {r}%. Precision there is {p}%. That is the honest summary for the review team: the target is met, and this is the false alarm load that comes with it.","Un umbral de {e} mantiene el recall en {r} %. La precisión ahí es {p} %. Ese es el resumen honesto para el equipo de revisión: el objetivo se cumple y esta es la carga de falsas alarmas que conlleva."],
    msgs:{ type:TYPE_MSG, high:["That threshold is too high: recall has already dropped below 0.90 there. Keep a threshold only while recall is at least 0.90.","Ese umbral es demasiado alto: ahí el recall ya ha bajado de 0.90. Quédate con un umbral solo mientras el recall sea al menos 0.90."],
      lowt:["That threshold meets the target but is not the highest one that does. A higher one gives fewer false alarms. Check the condition: it should hold exactly while recall is at least 0.90.","Ese umbral cumple el objetivo, pero no es el más alto que lo hace. Uno más alto da menos falsas alarmas. Revisa la condición: debe cumplirse justo mientras el recall sea al menos 0.90."] },
    tests:[[[["if ...:","if recall >= 0.50:"]],"high"],[[["if ...:","if recall >= 0.99:"]],"lowt"]] },
  recap:{ takes:[["<b>Every decision lands in one of four boxes.</b> True and false positives, true and false negatives. All metrics are ratios of those counts.","<b>Cada decisión cae en una de cuatro casillas.</b> Verdaderos y falsos positivos, verdaderos y falsos negativos. Todas las métricas son cocientes de esos recuentos."],
      ["<b>Precision and recall pull against each other.</b> The threshold picks the trade-off; the ROC curve shows all of them.","<b>Precisión y recall tiran en sentidos opuestos.</b> El umbral elige el equilibrio; la curva ROC los muestra todos."],
      ["<b>With rare classes, skip plain accuracy.</b> Report recall, precision, and balanced accuracy.","<b>Con clases raras, evita la exactitud a secas.</b> Presenta recall, precisión y exactitud balanceada."]],
    f:[`<button class="sym" data-g="p1">precision</button> = TP / (TP + FP) &nbsp;&nbsp;·&nbsp;&nbsp; <button class="sym" data-g="p1">recall</button> = TP / (TP + FN)`, `<button class="sym" data-g="p1">precisión</button> = TP / (TP + FP) &nbsp;&nbsp;·&nbsp;&nbsp; <button class="sym" data-g="p1">recall</button> = TP / (TP + FN)`],
    read:["Read it as: precision divides the true alarms by everything flagged. Recall divides the true alarms by everything truly harmful.","Léela así: la precisión divide las alarmas reales por todo lo marcado. El recall divide las alarmas reales por todo lo realmente dañino."],
    syms:[ {s:"TP, FP", g:"p1", d:["The left column of the confusion matrix: everything flagged.","La columna izquierda de la matriz de confusión: todo lo marcado."]},
      {s:"TP, FN", g:"p1", d:["The top row of the confusion matrix: everything truly harmful.","La fila superior de la matriz de confusión: todo lo realmente dañino."]},
      {s:"precision", g:"p1", d:["The share of flags that are right.","La proporción de marcas correctas."]},
      {s:"recall", g:"p1", d:["The share of harmful messages caught: the height of the point on the ROC curve.","La proporción de mensajes dañinos detectados: la altura del punto en la curva ROC."]} ],
    next:["Intermediate 7 asks whether an LLM judge can replace human graders, and why raw agreement misleads.","Intermedio 7 pregunta si un juez LLM puede sustituir a los evaluadores humanos y por qué el acuerdo bruto engaña."],
    deeper:[SRC.ax, SRC.rp] },
  gloss:[ [["Accuracy","Exactitud (accuracy)"],["The share of all decisions that are right.","La proporción de todas las decisiones que son correctas."],"hook"],
    [["Confusion matrix","Matriz de confusión"],["A 2×2 table counting true positives, false positives, false negatives and true negatives.","Una tabla 2×2 que cuenta verdaderos positivos, falsos positivos, falsos negativos y verdaderos negativos."],"p1"],
    [["Precision","Precisión"],["Of everything flagged, the share that was truly positive.","De todo lo marcado, la proporción que era realmente positiva."],"code"],
    [["Recall","Recall (sensibilidad)"],["Of everything truly positive, the share that was flagged.","De todo lo realmente positivo, la proporción que se marcó."],"code"],
    [["F1 score","Puntuación F1"],["One number combining precision and recall, pulled toward the weaker of the two.","Un número que combina precisión y recall y se acerca al más débil de los dos."],"code"],
    [["ROC curve","Curva ROC"],["A curve showing recall against the false positive rate for every possible threshold.","Una curva que muestra el recall frente a la tasa de falsos positivos para todos los umbrales posibles."],"p1"],
    [["Balanced accuracy","Exactitud balanceada"],["The average of the recall on each class, so a rare class counts as much as a common one.","El promedio del recall en cada clase, de modo que una clase rara cuenta tanto como una frecuente."],"q3"] ]
});

/* ================= Intermediate 7 ================= */
L({ id:"i7", title:["Agreement","Acuerdo entre evaluadores"], q:["Does my LLM judge agree with human graders?","¿Coincide mi juez LLM con los evaluadores humanos?"],
  hook:{ answer:1, title:["\"The LLM judge agrees with humans 90% of the time\"","«El juez LLM coincide con los humanos el 90 % de las veces»"],
    body:[`<p>Human grading is slow, so you want an <dfn>LLM-as-judge</dfn>: a model that grades answers for you. To trust it, you compare its verdicts with human verdicts on the same answers. The pilot reports 90% agreement.</p><p>Your human graders pass 90% of answers.</p>`,
      `<p>La corrección humana es lenta, así que quieres un <dfn>LLM como juez</dfn>: un modelo que corrija las respuestas por ti. Para fiarte de él, comparas sus veredictos con los humanos sobre las mismas respuestas. El piloto informa de un 90 % de acuerdo.</p><p>Tus evaluadores humanos aprueban el 90 % de las respuestas.</p>`],
    legend:["Predict: a judge that says \"pass\" to everything, without reading, agrees with the humans how often?","Predice: un juez que dice «pasa» a todo, sin leer, ¿cuántas veces coincide con los humanos?"],
    opts:[["About 50%","Alrededor del 50 %"],["90%","90 %"],["0%","0 %"]],
    reveal:["Tick the lazy judge with humans passing 90%: raw agreement is 90% and kappa is 0. Raw agreement cannot tell a careful judge from one that never reads.","Marca el juez perezoso con los humanos aprobando el 90 %: el acuerdo bruto es 90 % y kappa es 0. El acuerdo bruto no distingue a un juez cuidadoso de uno que nunca lee."] },
  plays:[ { w:"kappa", title:["How much agreement is just luck?","¿Cuánto acuerdo es solo suerte?"],
      intro:[`<p>Two graders who both say "pass" most of the time will agree often by coincidence. <dfn>Cohen's kappa</dfn> asks how much of the agreement goes beyond that coincidence. Move the first slider, then switch the lazy judge on and off.</p>`,`<p>Dos evaluadores que dicen «pasa» casi siempre coincidirán a menudo por casualidad. La <dfn>kappa de Cohen</dfn> pregunta cuánto del acuerdo va más allá de esa casualidad. Mueve el primer control y después activa y desactiva el juez perezoso.</p>`],
      notice:["the grey part of the bar is agreement that chance alone would give. As passes become more common the grey part grows, and the same raw agreement is worth less. Kappa measures the green part.","la parte gris de la barra es el acuerdo que daría el azar. Cuando los aprobados son más frecuentes la parte gris crece, y el mismo acuerdo bruto vale menos. Kappa mide la parte verde."],
      done:["Kappa is 1 for perfect agreement and 0 for agreement no better than chance. Report it next to raw agreement whenever one verdict is much more common than the other.","Kappa vale 1 con acuerdo perfecto y 0 con un acuerdo que no supera al azar. Preséntala junto al acuerdo bruto siempre que un veredicto sea mucho más frecuente que el otro."] } ],
  code:{ title:["Kappa in three lines","Kappa en tres líneas"],
    intro:[`<p>Compute raw agreement, then the agreement expected by chance from how often each grader says "pass", then kappa. Fill the gap.</p>`,`<p>Calcula el acuerdo bruto, después el acuerdo esperado por azar según la frecuencia con que cada evaluador dice «pasa» y, por último, kappa. Rellena el hueco.</p>`],
    py:`import numpy as np

rng = np.random.default_rng(seed=16)
n = 400
human = rng.random(n) < 0.85                            #~ humans pass 85% of answers ~~ los humanos aprueban el 85 % de las respuestas
judge = np.where(rng.random(n) < 0.90, human, ~human)   #~ the judge copies the human 90% of the time ~~ el juez copia al humano el 90 % de las veces

agree = (human == judge).mean()
#~ Agreement two graders reach by luck, given how often each says "pass" ~~ Acuerdo que alcanzan dos evaluadores por azar, según cuántas veces dice «pasa» cada uno
chance = human.mean() * judge.mean() + (1 - human.mean()) * (1 - judge.mean())
#~ GAP: kappa = agreement beyond chance, as a share of the room above chance ~~ HUECO: kappa = acuerdo más allá del azar, como parte del margen por encima del azar
kappa = (agree - chance) / (1 - ____)
print(f"raw agreement = {agree:.1%}, by chance = {chance:.1%}, kappa = {kappa:.2f}")

lazy = np.ones(n, dtype=bool)                           #~ a judge that always says "pass" ~~ un juez que siempre dice «pasa»
print(f"lazy judge raw agreement = {(human == lazy).mean():.1%}")
`,
    dart:`import 'dart:math';

void main() {
  final rng = Random(16);
  const n = 400;
  var agree = 0, humanPass = 0, judgePass = 0;
  for (var i = 0; i < n; i++) {
    final human = rng.nextDouble() < 0.85; //~ humans pass 85% ~~ los humanos aprueban el 85 %
    final judge = rng.nextDouble() < 0.90 ? human : !human; //~ judge copies the human 90% of the time ~~ el juez copia al humano el 90 % de las veces
    if (human == judge) agree++;
    if (human) humanPass++;
    if (judge) judgePass++;
  }
  final po = agree / n, h = humanPass / n, j = judgePass / n;
  final chance = h * j + (1 - h) * (1 - j); //~ agreement by luck ~~ acuerdo por azar
  final kappa = (po - chance) / (1 - chance);
  print('raw agreement = ' + (100 * po).toStringAsFixed(1) + '%, by chance = ' +
      (100 * chance).toStringAsFixed(1) + '%, kappa = ' + kappa.toStringAsFixed(2));
}
`,
    sol:[["____","chance"]], check:`"ok" if abs(kappa - (agree - chance) / (1 - chance)) < 1e-12 else ("agree" if abs(kappa - (agree - chance) / (1 - agree)) < 1e-12 else "no")`,
    ok:["Raw agreement is about 89% and kappa only 0.66, because roughly three quarters of that agreement would happen by chance. The lazy judge reaches 85% raw agreement without reading a word.","El acuerdo bruto ronda el 89 % y kappa se queda en 0.66, porque unas tres cuartas partes de ese acuerdo ocurrirían por azar. El juez perezoso alcanza un 85 % de acuerdo bruto sin leer una palabra."],
    msgs:{ agree:["Dividing by 1 − agree compares the gain with the remaining disagreement. Kappa divides by the room above chance: 1 − chance.","Dividir por 1 − agree compara la ganancia con el desacuerdo restante. Kappa divide por el margen por encima del azar: 1 − chance."] },
    tests:[["agree","agree"]] },
  qs:[
    { kind:"mc", title:["Kappa of zero","Kappa igual a cero"], body:[`<p>Your judge and your human graders agree on 88% of answers. Kappa is 0.02.</p>`,`<p>Tu juez y tus evaluadores humanos coinciden en el 88 % de las respuestas. Kappa vale 0,02.</p>`], legend:["What does that tell you?","¿Qué te dice eso?"],
      opts:[ {t:["The judge is right 88% of the time, which is good enough","El juez acierta el 88 % de las veces, y eso es suficiente"], why:["88% is what two graders with these pass rates would reach by coincidence. The judge adds no information beyond \"most answers pass\".","El 88 % es lo que alcanzarían por casualidad dos evaluadores con estas tasas de aprobado. El juez no aporta información más allá de «casi todas las respuestas pasan»."]},
        {t:["The agreement is about what chance alone would produce, so the judge is not tracking quality","El acuerdo es más o menos el que daría el azar, así que el juez no sigue la calidad"], ok:true, why:["Kappa near 0 means agreement no better than luck. Look at the answers humans failed: the judge probably passed nearly all of them.","Una kappa cercana a 0 significa un acuerdo que no supera al azar. Mira las respuestas que los humanos suspendieron: probablemente el juez aprobó casi todas."]},
        {t:["The judge disagrees with humans on almost every answer","El juez discrepa de los humanos en casi todas las respuestas"], why:["They agree on 88% of answers. Systematic disagreement would give a negative kappa. Zero means no relationship.","Coinciden en el 88 % de las respuestas. Un desacuerdo sistemático daría una kappa negativa. Cero significa que no hay relación."]} ] },
    { kind:"predict", run:true, title:["Kappa by hand","Kappa a mano"], code:`agree, chance = 0.90, 0.80
print(round((agree - chance) / (1 - chance), 2))`,
      opts:[ {t:"0.5", ok:true, why:["Chance already delivers 80%. The room above chance is 20 points, and the judge claims 10 of them: half.","El azar ya da un 80 %. El margen por encima del azar son 20 puntos y el juez consigue 10: la mitad."]},
        {t:"0.9", why:["0.9 is the raw agreement. Kappa subtracts what chance would give and rescales.","0.9 es el acuerdo bruto. Kappa resta lo que daría el azar y reescala."]},
        {t:"0.1", why:["0.1 is the agreement beyond chance. Kappa divides it by the room available above chance, 0.2.","0.1 es el acuerdo más allá del azar. Kappa lo divide por el margen disponible por encima del azar, 0.2."]},
        {t:"1.0", why:["Kappa is 1 only when agreement is perfect. Here 10% of answers still get different verdicts.","Kappa vale 1 solo con acuerdo perfecto. Aquí el 10 % de las respuestas sigue recibiendo veredictos distintos."]} ] },
    { kind:"fix", title:["Chance agreement is not always 50%","El acuerdo por azar no siempre es 50 %"], body:[`<p>This kappa looks impressive: 0.8 for a judge that passes everything.</p>`,`<p>Esta kappa impresiona: 0,8 para un juez que lo aprueba todo.</p>`],
      code:`chance = 0.5
kappa = (agree - chance) / (1 - chance)`, legend:["Which replacement computes chance agreement correctly?","¿Qué sustitución calcula bien el acuerdo por azar?"],
      opts:[ {t:["<code>chance = human.mean() * judge.mean() + (1 - human.mean()) * (1 - judge.mean())</code>","<code>chance = human.mean() * judge.mean() + (1 - human.mean()) * (1 - judge.mean())</code>"], ok:true, why:["Two graders agree by luck when both say pass or both say fail. How often that happens depends on how often each says pass. It is 50% only when both pass half the answers.","Dos evaluadores coinciden por azar cuando los dos dicen pasa o los dos dicen falla. Con qué frecuencia ocurre depende de cuántas veces dice pasa cada uno. Solo es 50 % cuando ambos aprueban la mitad."]},
        {t:["<code>chance = human.mean()</code>","<code>chance = human.mean()</code>"], why:["That is the right value only for a judge that always says pass. In general the judge's own pass rate matters too.","Ese valor solo es correcto para un juez que siempre dice pasa. En general también importa la tasa de aprobado del propio juez."]},
        {t:["<code>chance = agree / 2</code>","<code>chance = agree / 2</code>"], why:["Chance agreement comes from how often each grader says pass. It does not depend on how often they happen to agree.","El acuerdo por azar sale de cuántas veces dice pasa cada evaluador. No depende de cuántas veces coinciden."]} ] } ],
  apply:{ seed:157, title:["Where can you trust the judge?","¿Dónde puedes fiarte del juez?"],
    body:[`<p>600 answers were graded by a human and by your LLM judge, across three topics. You plan to drop human grading wherever the judge is reliable.</p>`,`<p>600 respuestas han sido corregidas por una persona y por tu juez LLM, en tres temas. Quieres eliminar la corrección humana donde el juez sea fiable.</p>`],
    cols:["answer_id","topic","human_pass","judge_pass"],
    gen:(r) => { const mk = (topic, pp, pf, fp, ff) => [...Array(pp).fill([true,true]), ...Array(pf).fill([true,false]), ...Array(fp).fill([false,true]), ...Array(ff).fill([false,false])].map(v => ({topic, human_pass:v[0], judge_pass:v[1]})); return r.shuffle([...mk("billing",85,15,15,85), ...mk("refund",123,17,7,53), ...mk("login",182,10,4,4)]).map((o,i) => Object.assign({answer_id:"ans-"+pad(i+1)}, o)); },
    task:["Set <code>answer</code> to the name of the topic where the judge is <b>least</b> trustworthy: the one with the lowest kappa. Give it as text, for example <code>\"refund\"</code>.","Asigna a <code>answer</code> el nombre del tema donde el juez es <b>menos</b> fiable: el de kappa más baja. Escríbelo como texto, por ejemplo <code>\"refund\"</code>."],
    hint:["Print kappa per topic inside the loop: <code>kappa(g[\"human_pass\"], g[\"judge_pass\"])</code>. Then type the topic name with the lowest value.","Imprime la kappa de cada tema dentro del bucle: <code>kappa(g[\"human_pass\"], g[\"judge_pass\"])</code>. Después escribe el nombre del tema con el valor más bajo."],
    py:`import pandas as pd

def kappa(human, judge):
    agree = (human == judge).mean()
    chance = human.mean() * judge.mean() + (1 - human.mean()) * (1 - judge.mean())
    return (agree - chance) / (1 - chance)

for topic, g in df.groupby("topic"):
    raw = (g["human_pass"] == g["judge_pass"]).mean()
    print(f"{topic:8} raw agreement {raw:.1%} | humans pass {g['human_pass'].mean():.0%}")

#~ YOUR TURN: the topic with the lowest kappa, as text ~~ TU TURNO: el tema con la kappa más baja, como texto
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...",'answer = min(df["topic"].unique(), key=lambda t: kappa(df[df["topic"] == t]["human_pass"], df[df["topic"] == t]["judge_pass"]))']],
    check:`import json as _j
_a = globals().get("answer")
def _kp(h, j):
    _ag = (h == j).mean(); _ch = h.mean() * j.mean() + (1 - h.mean()) * (1 - j.mean()); return float((_ag - _ch) / (1 - _ch))
_ks = {t: _kp(g["human_pass"], g["judge_pass"]) for t, g in df.groupby("topic")}
_rs = {t: float((g["human_pass"] == g["judge_pass"]).mean()) for t, g in df.groupby("topic")}
_e = min(_ks, key=_ks.get); _r = min(_rs, key=_rs.get)
_k = "dots" if _a is ... or _a is None else ("type" if not isinstance(_a, str) else ("ok" if _a.strip().lower() == _e else ("raw" if _a.strip().lower() == _r else "_")))
_j.dumps({"k": _k, "e": _e, "ke": round(_ks[_e], 2), "re": round(_rs[_e] * 100, 1), "r": _r, "kr": round(_ks[_r], 2), "rr": round(_rs[_r] * 100, 1)})`,
    ok:["On {e} the judge has the highest raw agreement, {re}%, and the lowest kappa, {ke}. Humans pass almost everything there, so agreeing is easy, and the judge passes half of the few answers humans fail. Keep human review on {e}.","En {e} el juez tiene el acuerdo bruto más alto, {re} %, y la kappa más baja, {ke}. Ahí los humanos lo aprueban casi todo, así que coincidir es fácil, y el juez aprueba la mitad de las pocas respuestas que los humanos suspenden. Mantén la revisión humana en {e}."],
    msgs:{ type:["<code>answer</code> should be text: the topic name in quotes.","<code>answer</code> debe ser un texto: el nombre del tema entre comillas."],
      raw:["{r} has the lowest raw agreement ({rr}%), yet its kappa is {kr}, which is solid. The task asks for the lowest kappa. Print kappa per topic and compare.","{r} tiene el acuerdo bruto más bajo ({rr} %), pero su kappa es {kr}, que es sólida. La tarea pide la kappa más baja. Imprime la kappa de cada tema y compara."],
      _:["That is not the topic with the lowest kappa. Print <code>kappa(g[\"human_pass\"], g[\"judge_pass\"])</code> for each topic inside the loop.","Ese no es el tema con la kappa más baja. Imprime <code>kappa(g[\"human_pass\"], g[\"judge_pass\"])</code> para cada tema dentro del bucle."] },
    tests:[[[["answer = ...",'answer = "billing"']],"raw"],[[["answer = ...",'answer = "refund"']],"_"],[[["answer = ...",'answer = "login"']],"ok"]] },
  recap:{ takes:[["<b>Raw agreement flatters.</b> When one verdict is common, two graders agree often by coincidence.","<b>El acuerdo bruto halaga.</b> Cuando un veredicto es frecuente, dos evaluadores coinciden a menudo por casualidad."],
      ["<b>Kappa removes the coincidence.</b> 0 means no better than chance, 1 means perfect.","<b>Kappa elimina la casualidad.</b> 0 significa que no supera al azar; 1, acuerdo perfecto."],
      ["<b>Validate an LLM judge per slice.</b> A judge can look excellent overall and be useless on the slice where failures are rare.","<b>Valida un juez LLM por segmentos.</b> Un juez puede parecer excelente en conjunto y ser inútil en el segmento donde los fallos son raros."]],
    f:`<button class="sym" data-g="p1">κ</button> = (<button class="sym" data-g="p1">p<sub>o</sub></button> − <button class="sym" data-g="p1">p<sub>e</sub></button>) / (1 − p<sub>e</sub>)`,
    read:["Read it as: kappa is the agreement beyond chance, divided by the most agreement beyond chance that was possible.","Léela así: kappa es el acuerdo más allá del azar dividido por el máximo acuerdo más allá del azar que era posible."],
    syms:[ {s:"κ", g:"p1", d:["Said \"kappa\". The last readout under the bar.","Se lee «kappa». El último dato bajo la barra."]},
      {s:"p<sub>o</sub>", g:"p1", d:["Observed agreement: grey plus green in the bar.","Acuerdo observado: gris más verde en la barra."]},
      {s:"p<sub>e</sub>", g:"p1", d:["Agreement expected by chance: the grey part.","Acuerdo esperado por azar: la parte gris."]} ],
    next:["The Advanced track starts with Bayesian inference: updating a belief about a pass rate as cases come in.","La ruta Avanzado empieza con inferencia bayesiana: actualizar una creencia sobre una tasa de aciertos a medida que llegan casos."],
    deeper:[SRC.ax, SRC.rp] },
  gloss:[ [["LLM-as-judge","LLM como juez"],["Using a language model to grade the outputs of another model.","Usar un modelo de lenguaje para corregir las salidas de otro modelo."],"hook"],
    [["Raw agreement","Acuerdo bruto"],["The share of items on which two graders give the same verdict.","La proporción de elementos en los que dos evaluadores dan el mismo veredicto."],"p1"],
    [["Cohen's kappa","Kappa de Cohen"],["Agreement between two graders after removing the agreement expected by chance. 0 is chance level, 1 is perfect.","El acuerdo entre dos evaluadores tras quitar el acuerdo esperado por azar. 0 es el nivel del azar; 1, perfecto."],"p1"] ]
});
