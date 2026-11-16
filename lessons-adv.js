"use strict";
/* ================= Advanced 1 ================= */
L({ id:"a1", title:["Bayesian inference","Inferencia bayesiana"], q:["How do I update my belief about a pass rate?","¿Cómo actualizo mi creencia sobre una tasa de aciertos?"],
  hook:{ answer:1, title:["16 of 20 passed. You already had a hunch.","Pasan 16 de 20. Y tú ya tenías una corazonada."],
    body:[`<p>A new model lands. Similar models have passed about 70% of your eval, so before running anything you expect something near 70%. Then you run 20 cases and 16 pass: 80%.</p><p><dfn>Bayesian inference</dfn> is a rule for combining what you believed before, called the <dfn>prior</dfn>, with the data, to get what you should believe now, called the <dfn>posterior</dfn>.</p>`,
      `<p>Llega un modelo nuevo. Los modelos parecidos han pasado alrededor del 70 % de tu eval, así que antes de ejecutar nada esperas algo cercano al 70 %. Ejecutas 20 casos y pasan 16: 80 %.</p><p>La <dfn>inferencia bayesiana</dfn> es una regla para combinar lo que creías antes, el <dfn>prior</dfn>, con los datos, y obtener lo que deberías creer ahora, el <dfn>posterior</dfn>.</p>`],
    legend:["Predict: where should your best estimate of the true pass rate sit now?","Predice: ¿dónde debería quedar ahora tu mejor estimación de la tasa real?"],
    opts:[["At 80%. Data replaces hunches","En el 80 %. Los datos sustituyen a las corazonadas"],["Between 70% and 80%, closer to 80%","Entre el 70 % y el 80 %, más cerca del 80 %"],["At 70%. Twenty cases prove nothing","En el 70 %. Veinte casos no demuestran nada"]],
    reveal:["Set the hunch to 70% worth 10 cases and enter 16 passes and 4 fails: the estimate lands near 77%. The data pulls the belief toward 80%, and the prior holds it back a little. With more data the prior's pull fades.","Pon la corazonada en 70 % con un peso de 10 casos e introduce 16 aciertos y 4 fallos: la estimación queda cerca del 77 %. Los datos tiran de la creencia hacia el 80 % y el prior la frena un poco. Con más datos, el tirón del prior se desvanece."] },
  plays:[ { w:"beta", title:["Watch a belief sharpen as cases arrive","Mira cómo se afina una creencia al llegar casos"],
      intro:[`<p>The curve shows how plausible each possible pass rate is. Tall means plausible. Set your hunch with the two sliders, then add cases one at a time or 20 at a time. The agent behind the button has a hidden true pass rate.</p>`,`<p>La curva muestra lo plausible que es cada tasa de aciertos posible. Alta significa plausible. Fija tu corazonada con los dos controles y después añade casos de uno en uno o de 20 en 20. El agente que hay tras el botón tiene una tasa real oculta.</p>`],
      notice:["every case nudges the curve: a pass pushes it right, a fail pushes it left, and each one makes it narrower. After a hundred cases, very different priors end up with nearly the same curve.","cada caso empuja la curva: un acierto la lleva a la derecha, un fallo a la izquierda, y cada uno la estrecha. Tras cien casos, priors muy distintos acaban casi con la misma curva."],
      done:["The shaded region is a <dfn>credible interval</dfn>: given your prior and the data, the true rate lies inside it with 95% probability. That is the direct statement people wish a p-value made.","La zona sombreada es un <dfn>intervalo creíble</dfn>: dados tu prior y los datos, la tasa real está dentro con un 95 % de probabilidad. Es la afirmación directa que la gente querría que hiciera un valor p."] } ],
  code:{ title:["Updating is addition","Actualizar es sumar"],
    intro:[`<p>For pass/fail data the belief is a <dfn>Beta distribution</dfn>, written Beta(a, b). Read it as: "as if I had already seen a passes and b fails". Updating means adding the new passes to a and the new fails to b. Fill the gap.</p>`,`<p>Con datos pasa/falla la creencia es una <dfn>distribución Beta</dfn>, escrita Beta(a, b). Léela así: «como si ya hubiera visto a aciertos y b fallos». Actualizar es sumar los aciertos nuevos a a y los fallos nuevos a b. Rellena el hueco.</p>`],
    py:`import numpy as np

rng = np.random.default_rng(seed=18)
prior_a, prior_b = 7, 3                   #~ hunch: about 70%, worth 10 cases ~~ corazonada: alrededor del 70 %, con peso de 10 casos
passes, fails = 16, 4                     #~ new eval: 16 of 20 passed ~~ nueva eval: pasan 16 de 20

#~ GAP: add what you saw to what you believed ~~ HUECO: suma lo que has visto a lo que creías
post_a = prior_a + ____
post_b = prior_b + fails
mean = post_a / (post_a + post_b)
draws = rng.beta(post_a, post_b, size=100_000)     #~ 100,000 plausible pass rates ~~ 100 000 tasas de aciertos plausibles
low, high = np.percentile(draws, [2.5, 97.5])
print(f"posterior: Beta({post_a}, {post_b})")
print(f"best estimate {mean:.1%}, 95% credible interval {low:.1%} to {high:.1%}")
print(f"P(pass rate > 75%) = {(draws > 0.75).mean():.1%}")
`,
    dart:`import 'dart:math';

final rng = Random(18);

double gaussian() => sqrt(-2 * log(1 - rng.nextDouble())) * cos(2 * pi * rng.nextDouble());

//~ Draw from a Gamma distribution (Marsaglia and Tsang), used to build Beta draws ~~ Sorteo de una distribución Gamma (Marsaglia y Tsang), usada para construir sorteos Beta
double gamma(double k) {
  final d = k - 1 / 3, c = 1 / sqrt(9 * d);
  while (true) {
    final x = gaussian();
    var v = 1 + c * x;
    if (v <= 0) continue;
    v = v * v * v;
    if (log(rng.nextDouble()) < 0.5 * x * x + d - d * v + d * log(v)) return d * v;
  }
}

double beta(double a, double b) {
  final x = gamma(a), y = gamma(b);
  return x / (x + y);
}

void main() {
  const priorA = 7.0, priorB = 3.0; //~ hunch: about 70%, worth 10 cases ~~ corazonada: alrededor del 70 %, con peso de 10 casos
  const passes = 16, fails = 4; //~ new eval ~~ nueva eval
  final postA = priorA + passes, postB = priorB + fails; //~ updating is addition ~~ actualizar es sumar
  final draws = [for (var i = 0; i < 100000; i++) beta(postA, postB)]..sort();
  final mean = (100 * postA / (postA + postB)).toStringAsFixed(1);
  final low = (100 * draws[2500]).toStringAsFixed(1);
  final high = (100 * draws[97500]).toStringAsFixed(1);
  print('best estimate $mean%, 95% credible interval $low% to $high%');
}
`,
    sol:[["____","passes"]], check:`"ok" if post_a == 23 else ("fails" if post_a == 11 else ("total" if post_a == 27 else "no"))`,
    ok:["Beta(7, 3) plus 16 passes and 4 fails gives Beta(23, 7): a best estimate near 77%, between your 70% hunch and the 80% you observed. The last line answers a product question directly: how likely is it that the true rate beats 75%?","Beta(7, 3) más 16 aciertos y 4 fallos da Beta(23, 7): una mejor estimación cercana al 77 %, entre tu corazonada del 70 % y el 80 % observado. La última línea responde directamente a una pregunta de producto: ¿qué probabilidad hay de que la tasa real supere el 75 %?"],
    msgs:{ fails:["You added the fails to the pass count. a counts passes, b counts fails.","Has sumado los fallos al recuento de aciertos. a cuenta aciertos y b cuenta fallos."],
      total:["You added all 20 cases to a. Only the 16 passes go there; the 4 fails go to b.","Has sumado los 20 casos a a. Ahí solo van los 16 aciertos; los 4 fallos van a b."] },
    tests:[["fails","fails"],["20","total"]] },
  qs:[
    { kind:"mc", title:["Two analysts, two priors","Dos analistas, dos priors"], body:[`<p>One analyst starts from "about 50%", another from "about 80%". Each prior is worth 10 cases. They then share the same 2,000 graded cases.</p>`,`<p>Una analista parte de «alrededor del 50 %» y otro de «alrededor del 80 %». Cada prior pesa como 10 casos. Después comparten los mismos 2000 casos corregidos.</p>`], legend:["How do their conclusions compare?","¿Cómo quedan sus conclusiones?"],
      opts:[ {t:["They stay about 30 points apart","Siguen a unos 30 puntos de distancia"], why:["Each prior weighs as much as 10 cases. Against 2,000 real cases that is half a percent of the evidence, so it shifts the estimate by a fraction of a point.","Cada prior pesa como 10 casos. Frente a 2000 casos reales es medio punto porcentual de la evidencia, así que mueve la estimación una fracción de punto."]},
        {t:["They end up almost identical, because the data outweighs both priors","Acaban casi idénticas, porque los datos pesan más que los dos priors"], ok:true, why:["Priors matter when data is scarce and fade as it accumulates. That is why a reasonable prior is safe: enough data corrects it.","Los priors importan cuando hay pocos datos y se diluyen cuando se acumulan. Por eso un prior razonable es seguro: con datos suficientes se corrige."]},
        {t:["They cannot be compared, because priors are subjective","No se pueden comparar, porque los priors son subjetivos"], why:["Both posteriors are distributions over the same quantity and can be compared directly. Here they nearly coincide.","Los dos posteriors son distribuciones sobre la misma cantidad y se pueden comparar directamente. Aquí casi coinciden."]} ] },
    { kind:"predict", run:true, title:["One update","Una actualización"], code:`prior_a, prior_b = 2, 2
passes, fails = 8, 2
post_a, post_b = prior_a + passes, prior_b + fails
print(post_a, post_b, round(post_a / (post_a + post_b), 2))`,
      opts:[ {t:"10 4 0.71", ok:true, why:["2 + 8 passes and 2 + 2 fails give Beta(10, 4). Its mean is 10 / 14, about 0.71: pulled from the observed 0.8 toward the prior's 0.5.","2 + 8 aciertos y 2 + 2 fallos dan Beta(10, 4). Su media es 10 / 14, alrededor de 0.71: desplazada desde el 0.8 observado hacia el 0.5 del prior."]},
        {t:"8 2 0.8", why:["That ignores the prior and reports the raw data. The update adds the prior counts to the data counts.","Eso ignora el prior y da los datos en bruto. La actualización suma los recuentos del prior a los de los datos."]},
        {t:"10 4 0.8", why:["The counts are right. The mean of Beta(10, 4) is 10 / 14, about 0.71. 0.8 is the raw pass rate before combining with the prior.","Los recuentos son correctos. La media de Beta(10, 4) es 10 / 14, alrededor de 0.71. 0.8 es la tasa en bruto antes de combinarla con el prior."]},
        {t:"4 10 0.29", why:["The two counts are swapped. Passes add to a, the first number, and fails add to b.","Los dos recuentos están intercambiados. Los aciertos se suman a a, el primer número, y los fallos a b."]} ] },
    { kind:"fix", title:["An interval that ignores the eval","Un intervalo que ignora la eval"], body:[`<p>After 500 graded cases this still prints a credible interval 50 points wide.</p>`,`<p>Tras 500 casos corregidos, esto sigue imprimiendo un intervalo creíble de 50 puntos de ancho.</p>`],
      code:`post_a, post_b = prior_a + passes, prior_b + fails
draws = rng.beta(prior_a, prior_b, size=100_000)
print(np.percentile(draws, [2.5, 97.5]))`, legend:["Which change fixes it?","¿Qué cambio lo arregla?"],
      opts:[ {t:["<code>draws = rng.beta(post_a, post_b, size=100_000)</code>","<code>draws = rng.beta(post_a, post_b, size=100_000)</code>"], ok:true, why:["The draws came from the prior, the belief before seeing data, so the 500 cases were never used. Draw from the posterior.","Los sorteos salían del prior, la creencia antes de ver los datos, así que los 500 casos no se usaron. Hay que sortear del posterior."]},
        {t:["Increase <code>size</code> to 10 million","Subir <code>size</code> a 10 millones"], why:["More draws describe the same wide prior more precisely. The interval stays wide.","Más sorteos describen con más precisión el mismo prior ancho. El intervalo sigue igual de ancho."]},
        {t:["Use percentiles 25 and 75","Usar los percentiles 25 y 75"], why:["That prints a narrower interval that holds only 50% of the belief, and it still describes the prior.","Eso imprime un intervalo más estrecho que solo contiene el 50 % de la creencia, y sigue describiendo el prior."]} ] } ],
  apply:{ seed:168, title:["Ship or wait?","¿Desplegar o esperar?"],
    body:[`<p>Your team's rule: ship a new agent only when you are at least 90% sure its true pass rate is above 80%. You have 60 graded cases.</p>`,`<p>La regla de tu equipo: desplegar un agente nuevo solo cuando haya al menos un 90 % de seguridad de que su tasa real supera el 80 %. Tienes 60 casos corregidos.</p>`],
    cols:["case_id","passed"],
    gen:(r) => r.shuffle(Array.from({length:60}, (_,i) => i < 52)).map((p,i) => ({case_id:"case-"+pad(i+1,3), passed:p})),
    task:["Set <code>answer</code> to the probability (between 0 and 1) that the true pass rate is above 0.80.","Asigna a <code>answer</code> la probabilidad (entre 0 y 1) de que la tasa real de aciertos supere 0.80."],
    hint:["<code>draws</code> holds plausible pass rates. The share of them above 0.80 is the probability: <code>(draws &gt; 0.80).mean()</code>.","<code>draws</code> contiene tasas de aciertos plausibles. La proporción de ellas por encima de 0.80 es la probabilidad: <code>(draws &gt; 0.80).mean()</code>."],
    py:`import numpy as np

rng = np.random.default_rng(seed=5)
passes = int(df["passed"].sum())
fails = len(df) - passes
print(passes, "passes,", fails, "fails")

#~ Start from "no idea", Beta(1, 1), and add what you saw ~~ Parte de «ni idea», Beta(1, 1), y suma lo que has visto
draws = rng.beta(1 + passes, 1 + fails, size=200_000)   #~ plausible true pass rates ~~ tasas reales plausibles
print(f"best estimate {draws.mean():.1%}")

#~ YOUR TURN: probability that the true pass rate is above 0.80 ~~ TU TURNO: probabilidad de que la tasa real supere 0.80
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...","answer = (draws > 0.80).mean()"]],
    check: chk(`(draws > 0.80).mean()`, {mean:`draws.mean()`, below:`(draws < 0.80).mean()`, raw:`passes / (passes + fails)`, pct:`(draws > 0.80).mean() * 100`}, {e:`round(_e * 100, 1)`, m:`round(float(draws.mean()) * 100, 1)`}),
    ok:["There is a {e}% probability that the true pass rate is above 80%. The best estimate is {m}%, and you can now state the decision in plain terms: the rule asks for 90%, and you have {e}%.","Hay un {e} % de probabilidad de que la tasa real supere el 80 %. La mejor estimación es {m} %, y ya puedes enunciar la decisión con claridad: la regla pide un 90 % y tienes un {e} %."],
    msgs:{ type:TYPE_MSG, pct:PCT_MSG, mean:["That is the best estimate of the pass rate itself. The task asks how sure you are that it is above 0.80: the share of draws above that line.","Esa es la mejor estimación de la tasa. La tarea pregunta cuánta seguridad tienes de que supera 0.80: la proporción de sorteos por encima de esa línea."],
      below:["That is the probability that the rate is below 0.80. Flip the comparison.","Esa es la probabilidad de que la tasa esté por debajo de 0.80. Invierte la comparación."],
      raw:["That is the raw pass rate of the 60 cases. The question is about your certainty, which comes from the spread of <code>draws</code>.","Esa es la tasa en bruto de los 60 casos. La pregunta es sobre tu certeza, que sale de la dispersión de <code>draws</code>."] },
    tests:[[[["answer = ...","answer = draws.mean()"]],"mean"],[[["answer = ...","answer = (draws < 0.80).mean()"]],"below"]] },
  recap:{ takes:[["<b>Belief is a distribution.</b> Each possible pass rate gets a plausibility. A prior is that distribution before the data.","<b>Una creencia es una distribución.</b> Cada tasa posible recibe una plausibilidad. Un prior es esa distribución antes de los datos."],
      ["<b>Updating is addition.</b> For pass/fail data, add passes to a and fails to b. Each case sharpens the curve.","<b>Actualizar es sumar.</b> Con datos pasa/falla, suma los aciertos a a y los fallos a b. Cada caso afina la curva."],
      ["<b>The posterior answers direct questions.</b> \"How likely is it that the rate is above 80%?\" has a number.","<b>El posterior responde a preguntas directas.</b> «¿Qué probabilidad hay de que la tasa supere el 80 %?» tiene un número."]],
    f:[`Beta(<button class="sym" data-g="p1">a</button>, <button class="sym" data-g="p1">b</button>) + <button class="sym" data-g="p1">data</button> &nbsp;→&nbsp; Beta(a + passes, b + fails)`, `Beta(<button class="sym" data-g="p1">a</button>, <button class="sym" data-g="p1">b</button>) + <button class="sym" data-g="p1">datos</button> &nbsp;→&nbsp; Beta(a + aciertos, b + fallos)`],
    read:["Read it as: the belief after the data is the belief before it, with the new passes and fails added to its two counts.","Léela así: la creencia tras los datos es la creencia anterior, con los aciertos y fallos nuevos sumados a sus dos recuentos."],
    syms:[ {s:"a, b", g:"p1", d:["The prior, set by the two sliders: hunch times strength, and the rest.","El prior, fijado con los dos controles: la corazonada por su peso, y el resto."]},
      {s:"data", g:"p1", d:["The passes and fails you added with the buttons.","Los aciertos y fallos que añadiste con los botones."]},
      {s:"Beta(…)", g:"p1", d:["The solid curve: the posterior.","La curva continua: el posterior."]} ],
    next:["Advanced 2 shows what happens when you run many comparisons and keep the best one.","Avanzado 2 muestra qué pasa cuando haces muchas comparaciones y te quedas con la mejor."],
    deeper:[SRC.st("bayesian-inference","Bayesian Inference","Inferencia bayesiana"), SRC.ax] },
  gloss:[ [["Prior","Prior (creencia previa)"],["Your belief about a quantity before seeing the new data, expressed as a distribution.","Tu creencia sobre una cantidad antes de ver los datos nuevos, expresada como distribución."],"hook"],
    [["Posterior","Posterior (creencia actualizada)"],["Your belief after combining the prior with the data.","Tu creencia tras combinar el prior con los datos."],"hook"],
    [["Beta distribution","Distribución Beta"],["A distribution over a rate between 0 and 1. Beta(a, b) acts like having seen a passes and b fails.","Una distribución sobre una tasa entre 0 y 1. Beta(a, b) equivale a haber visto a aciertos y b fallos."],"code"],
    [["Credible interval","Intervalo creíble"],["A range that contains the true value with a stated probability, given the prior and the data.","Un rango que contiene el valor real con una probabilidad dada, según el prior y los datos."],"p1"] ]
});

/* ================= Advanced 2 ================= */
L({ id:"a2", title:["Multiple comparisons","Comparaciones múltiples"], q:["Why does testing 20 prompts guarantee a \"winner\"?","¿Por qué probar 20 prompts garantiza un «ganador»?"],
  hook:{ answer:2, title:["Twenty variants, one champion","Veinte variantes, una campeona"],
    body:[`<p>You wrote 20 variants of a prompt and scored each on 100 eval cases. The baseline scores 70%. The best variant scores 79%, and the PR description says "+9 points".</p><p>Suppose, unknown to you, every variant is exactly as good as the baseline.</p>`,
      `<p>Has escrito 20 variantes de un prompt y has puntuado cada una con 100 casos. La referencia saca un 70 %. La mejor variante saca un 79 % y la descripción del PR dice «+9 puntos».</p><p>Supón que, sin que tú lo sepas, todas las variantes son exactamente igual de buenas que la referencia.</p>`],
    legend:["Predict: with 20 identical variants at a true 70%, what does the best of them typically score on 100 cases?","Predice: con 20 variantes idénticas y una tasa real del 70 %, ¿cuánto suele sacar la mejor con 100 casos?"],
    opts:[["About 70%","Alrededor del 70 %"],["About 74%","Alrededor del 74 %"],["About 78% to 79%","Entre el 78 % y el 79 %"]],
    reveal:["The average winner scores close to 79%. Retested on fresh cases it scores 70%, because it never was better. Picking the maximum of many noisy scores manufactures an improvement.","La ganadora media saca cerca de un 79 %. Reevaluada con casos nuevos saca un 70 %, porque nunca fue mejor. Elegir el máximo de muchas puntuaciones ruidosas fabrica una mejora."] },
  plays:[ { w:"multi", title:["Run a bake-off where nobody is better","Haz una comparativa en la que nadie es mejor"],
      intro:[`<p>Every bar is a prompt variant with a true pass rate of 70%. Run the bake-off, look at the orange winner, and then at the green dot: the same winner scored again on cases it has never seen. Run it 100 times and read the averages.</p>`,`<p>Cada barra es una variante de prompt con una tasa real del 70 %. Ejecuta la comparativa, mira la ganadora en naranja y después el punto verde: la misma ganadora puntuada otra vez con casos que nunca ha visto. Ejecútala 100 veces y lee los promedios.</p>`],
      notice:["the winner always beats 70%, and the green dot falls back to about 70%. More variants push the winner higher. More cases per variant shrink the illusion.","la ganadora siempre supera el 70 % y el punto verde vuelve a caer en torno al 70 %. Con más variantes, la ganadora sube más. Con más casos por variante, la ilusión se reduce."],
      done:["The score you select on is biased upward. A <dfn>held-out set</dfn>, cases kept aside and used once at the end, gives the honest number.","La puntuación con la que seleccionas está sesgada al alza. Un <dfn>conjunto reservado</dfn>, casos apartados y usados una sola vez al final, da el número honesto."] } ],
  code:{ title:["Measure the winner's curse","Mide la maldición del ganador"],
    intro:[`<p>This cell repeats the bake-off 2,000 times. Fill the gap to record the best-looking score each time, and compare it with the same winner on fresh cases. The last line shows the same trap for p-values.</p>`,`<p>Esta celda repite la comparativa 2000 veces. Rellena el hueco para guardar cada vez la mejor puntuación y compárala con la misma ganadora en casos nuevos. La última línea muestra la misma trampa con los valores p.</p>`],
    py:`import numpy as np

rng = np.random.default_rng(seed=20)
true_rate, n_cases, n_prompts = 0.70, 100, 20     #~ 20 prompts, all equally good ~~ 20 prompts, todos igual de buenos

wins = []
holdout = []
for _ in range(2000):                              #~ repeat the whole bake-off ~~ repite toda la comparativa
    scores = rng.binomial(n_cases, true_rate, size=n_prompts) / n_cases
    #~ GAP: the score of the best-looking prompt ~~ HUECO: la puntuación del prompt que mejor queda
    wins.append(scores.____())
    #~ retest that winner on fresh cases ~~ reevalúa esa ganadora con casos nuevos
    holdout.append(rng.binomial(n_cases, true_rate) / n_cases)

print(f"true pass rate of every prompt: {true_rate:.0%}")
print(f"average 'winner' score:        {np.mean(wins):.1%}")
print(f"winner on held-out cases:      {np.mean(holdout):.1%}")
print(f"chance at least 1 of 20 passes a p<0.05 test by luck: {1 - 0.95 ** 20:.0%}")
`,
    dart:`import 'dart:math';

void main() {
  final rng = Random(20);
  const trueRate = 0.70, nCases = 100, nPrompts = 20; //~ all equally good ~~ todos igual de buenos
  double score() {
    var passes = 0;
    for (var i = 0; i < nCases; i++) {
      if (rng.nextDouble() < trueRate) passes++;
    }
    return passes / nCases;
  }

  var sumWin = 0.0, sumHoldout = 0.0;
  const repeats = 2000;
  for (var r = 0; r < repeats; r++) {
    var best = 0.0;
    for (var p = 0; p < nPrompts; p++) {
      best = max(best, score()); //~ keep the best-looking score ~~ quédate con la mejor puntuación
    }
    sumWin += best;
    sumHoldout += score(); //~ the winner again, on fresh cases ~~ la ganadora otra vez, con casos nuevos
  }
  print('average winner score: ' + (100 * sumWin / repeats).toStringAsFixed(1) + '%');
  print('winner on held-out cases: ' + (100 * sumHoldout / repeats).toStringAsFixed(1) + '%');
  final luck = (100 * (1 - pow(0.95, 20))).round();
  print('chance at least 1 of 20 passes a p<0.05 test by luck: $luck%');
}
`,
    sol:[["____","max"]], check:`"ok" if np.mean(wins) > 0.76 else ("mean" if abs(np.mean(wins) - 0.70) < 0.01 else "no")`,
    ok:["The winner averages close to 79% while every prompt is truly at 70%. On held-out cases it is back at 70%. And with 20 tests at the 0.05 level, at least one false alarm turns up 64% of the time.","La ganadora ronda el 79 % de media aunque todos los prompts están de verdad en el 70 %. Con casos reservados vuelve al 70 %. Y con 20 contrastes al nivel 0,05, al menos una falsa alarma aparece el 64 % de las veces."],
    msgs:{ mean:["You recorded the average of the 20 scores, which sits at 70% as expected. The trap appears when you keep only the best one.","Has guardado el promedio de las 20 puntuaciones, que queda en el 70 % como cabía esperar. La trampa aparece cuando te quedas solo con la mejor."] },
    tests:[["mean","mean"],["min","no"]] },
  qs:[
    { kind:"mc", title:["One significant result out of twenty","Un resultado significativo entre veinte"], body:[`<p>You compare 20 prompt variants with the baseline. One of them reaches p = 0.03. The others are far from significant.</p>`,`<p>Comparas 20 variantes de prompt con la referencia. Una alcanza p = 0,03. Las demás quedan lejos de ser significativas.</p>`], legend:["How should you treat that one result?","¿Cómo deberías tratar ese resultado?"],
      opts:[ {t:["It is significant, so that variant is better","Es significativo, así que esa variante es mejor"], why:["A p-value of 0.03 is rare for one planned test. Among 20 tests of useless variants, at least one p-value below 0.05 shows up about 64% of the time.","Un valor p de 0,03 es raro en un único contraste planificado. Entre 20 contrastes de variantes inútiles, al menos un valor p por debajo de 0,05 aparece alrededor del 64 % de las veces."]},
        {t:["As a candidate. Confirm it on held-out cases or use a stricter threshold such as 0.05 / 20","Como candidata. Confírmala con casos reservados o usa un umbral más estricto, como 0,05 / 20"], ok:true, why:["Dividing the threshold by the number of tests is the <dfn>Bonferroni correction</dfn>. It keeps the chance of any false alarm near 5%. A fresh confirmation run does the same job.","Dividir el umbral por el número de contrastes es la <dfn>corrección de Bonferroni</dfn>. Mantiene cerca del 5 % la probabilidad de cualquier falsa alarma. Una ejecución de confirmación nueva cumple la misma función."]},
        {t:["Discard it. With 20 tests nothing can be concluded","Descartarla. Con 20 contrastes no se puede concluir nada"], why:["The result might be real. Multiple testing means it needs confirmation, which is cheap: one more run on new cases.","El resultado podría ser real. Hacer muchos contrastes significa que necesita confirmación, y es barata: una ejecución más con casos nuevos."]} ] },
    { kind:"predict", run:true, title:["False alarms add up","Las falsas alarmas se acumulan"], code:`alpha = 0.05
tests = 10
print(round(1 - (1 - alpha) ** tests, 2), alpha / tests)`,
      opts:[ {t:"0.4 0.005", ok:true, why:["Each test avoids a false alarm 95% of the time. Ten in a row all avoid one only 0.95 to the power 10, about 60% of the time, so the chance of at least one is 0.4. The second number is the corrected threshold for each test.","Cada contraste evita una falsa alarma el 95 % de las veces. Diez seguidos la evitan todos solo 0.95 elevado a 10, alrededor del 60 % de las veces, así que la probabilidad de al menos una es 0.4. El segundo número es el umbral corregido para cada contraste."]},
        {t:"0.5 0.005", why:["0.5 would be 10 times 0.05, which adds the risks as if they could never overlap. The exact value multiplies the chances of avoiding a false alarm and gives 0.4.","0.5 sería 10 por 0.05, que suma los riesgos como si nunca pudieran coincidir. El valor exacto multiplica las probabilidades de evitar una falsa alarma y da 0.4."]},
        {t:"0.05 0.005", why:["0.05 is the risk for one test. Across ten tests the chance that at least one misfires is much larger.","0.05 es el riesgo de un contraste. En diez contrastes, la probabilidad de que al menos uno falle es mucho mayor."]},
        {t:"0.4 0.5", why:["The first number is right. The second divides 0.05 by 10, giving 0.005.","El primer número es correcto. El segundo divide 0.05 entre 10 y da 0.005."]} ] },
    { kind:"fix", title:["Selected and reported on the same cases","Seleccionada y presentada con los mismos casos"], body:[`<p>This picks the best of 30 prompts and reports its score. The reported number never holds up in production.</p>`,`<p>Esto elige el mejor de 30 prompts e informa de su puntuación. El número presentado nunca se sostiene en producción.</p>`],
      code:`best = max(prompts, key=lambda p: score(p, test_cases))
print("final score:", score(best, test_cases))`, legend:["Which version reports an honest number?","¿Qué versión presenta un número honesto?"],
      opts:[ {t:["<code>best = max(prompts, key=lambda p: score(p, dev_cases))</code><br><code>print(\"final score:\", score(best, holdout_cases))</code>","<code>best = max(prompts, key=lambda p: score(p, dev_cases))</code><br><code>print(\"final score:\", score(best, holdout_cases))</code>"], ok:true, why:["Select on one set, report on another that played no part in the choice. The held-out score has no selection luck baked in.","Selecciona con un conjunto y presenta con otro que no ha intervenido en la elección. La puntuación reservada no lleva dentro la suerte de la selección."]},
        {t:["Score each prompt on the test cases three times and average","Puntuar cada prompt con los casos de prueba tres veces y promediar"], why:["Averaging reruns reduces sampling noise from the model, but the selection still happens on the cases you report on. The winner still looks better there than it is.","Promediar repeticiones reduce el ruido de muestreo del modelo, pero la selección sigue haciéndose con los casos que presentas. La ganadora sigue pareciendo ahí mejor de lo que es."]},
        {t:["Report the average score of the top three prompts","Presentar la puntuación media de los tres mejores prompts"], why:["The top three were also chosen for scoring high on these cases, so their average is inflated too.","Los tres mejores también se eligieron por puntuar alto con estos casos, así que su promedio también está inflado."]} ] } ],
  apply:{ seed:20, title:["Report the winner's honest score","Presenta la puntuación honesta de la ganadora"],
    body:[`<p>Twelve prompt variants were each scored on 150 development cases and on 150 held-out cases. The table has one row per prompt and case.</p>`,`<p>Doce variantes de prompt se puntuaron cada una con 150 casos de desarrollo y 150 casos reservados. La tabla tiene una fila por prompt y caso.</p>`],
    cols:["prompt","split","case_id","passed"],
    gen:(r) => { const rows = []; for (let p=1;p<=12;p++) for (const split of ["dev","holdout"]) for (let i=1;i<=150;i++) rows.push({prompt:"v"+pad(p,2), split, case_id:split[0]+pad(i,3), passed:r.u()<0.70}); return rows; },
    task:["The winner is chosen on the dev split. Set <code>answer</code> to that winner's pass rate on the <b>holdout</b> split.","La ganadora se elige con el conjunto dev. Asigna a <code>answer</code> la tasa de aciertos de esa ganadora en el conjunto <b>holdout</b>."],
    hint:["<code>scores.loc[winner, \"holdout\"]</code> reads one cell: the winner's row, the holdout column.","<code>scores.loc[winner, \"holdout\"]</code> lee una celda: la fila de la ganadora y la columna holdout."],
    py:`import pandas as pd

#~ one row per prompt, one column per split ~~ una fila por prompt, una columna por conjunto
scores = df.groupby(["prompt", "split"])["passed"].mean().unstack()
print(scores.round(3))

winner = scores["dev"].idxmax()
print("winner on dev:", winner, "with", round(scores.loc[winner, "dev"], 3))

#~ YOUR TURN: the winner's score on cases it was not selected on ~~ TU TURNO: la puntuación de la ganadora en casos con los que no se seleccionó
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...",'answer = scores.loc[winner, "holdout"]']],
    check: chk(`_sc.loc[_w, "holdout"]`, {dev:`_sc.loc[_w, "dev"]`, peek:`_sc["holdout"].max()`, avg:`_sc["holdout"].mean()`}, {e:`round(_e * 100, 1)`, d:`round(float(_sc.loc[_w, "dev"]) * 100, 1)`, w:`str(_w)`}, "1e-9", `_sc = df.groupby(["prompt", "split"])["passed"].mean().unstack(); _w = _sc["dev"].idxmax()`),
    ok:["{w} won on dev with {d}% and scores {e}% on held-out cases. All twelve variants were generated with the same 70% pass rate, so the gap between those two numbers is pure selection luck.","{w} ganó en dev con un {d} % y saca un {e} % con los casos reservados. Las doce variantes se generaron con la misma tasa del 70 %, así que la diferencia entre esos dos números es pura suerte de selección."],
    msgs:{ type:TYPE_MSG, dev:["That is the score the winner was selected on. It is the highest of twelve noisy numbers and is biased upward. Read the holdout column.","Esa es la puntuación con la que se seleccionó la ganadora. Es la más alta de doce números ruidosos y está sesgada al alza. Lee la columna holdout."],
      peek:["That is the best holdout score of any prompt. Choosing by holdout turns the holdout into a second selection set. The winner was fixed on dev.","Esa es la mejor puntuación holdout de cualquier prompt. Elegir con holdout lo convierte en un segundo conjunto de selección. La ganadora quedó fijada con dev."],
      avg:["That is the average holdout score of all prompts. The task asks for the dev winner's holdout score.","Esa es la puntuación holdout media de todos los prompts. La tarea pide la puntuación holdout de la ganadora de dev."] },
    tests:[[[["answer = ...",'answer = scores.loc[winner, "dev"]']],"dev"],[[["answer = ...",'answer = scores["holdout"].max()']],"peek"]] },
  recap:{ takes:[["<b>The best of many is biased.</b> Choose the top score among noisy candidates and you select for luck as well as quality.","<b>El mejor de muchos está sesgado.</b> Si eliges la puntuación más alta entre candidatos ruidosos, seleccionas suerte además de calidad."],
      ["<b>False alarms add up.</b> Twenty tests at 0.05 give a 64% chance of at least one false positive.","<b>Las falsas alarmas se acumulan.</b> Veinte contrastes a 0,05 dan un 64 % de probabilidad de al menos un falso positivo."],
      ["<b>Hold cases out.</b> Select on one set, report on another, or tighten the threshold to α / m.","<b>Reserva casos.</b> Selecciona con un conjunto y presenta con otro, o endurece el umbral a α / m."]],
    f:[`P(at least one false alarm) = 1 − (1 − <button class="sym" data-g="q2">α</button>)<sup><button class="sym" data-g="p1">m</button></sup>`, `P(al menos una falsa alarma) = 1 − (1 − <button class="sym" data-g="q2">α</button>)<sup><button class="sym" data-g="p1">m</button></sup>`],
    read:["Read it as: one test avoids a false alarm with probability 1 − α, and m tests all avoid one only if every single one does.","Léela así: un contraste evita una falsa alarma con probabilidad 1 − α, y m contrastes la evitan todos solo si lo hace cada uno de ellos."],
    syms:[ {s:"α", g:"q2", d:["Said \"alpha\". The false alarm rate you accept for one test, usually 0.05.","Se lee «alfa». La tasa de falsas alarmas que aceptas para un contraste, normalmente 0,05."]},
      {s:"m", g:"p1", d:["How many things you compared: the number of variants slider.","Cuántas cosas has comparado: el control del número de variantes."]} ],
    next:["Advanced 3 asks whether a model's stated confidence can be trusted.","Avanzado 3 pregunta si se puede confiar en la confianza que declara un modelo."],
    deeper:[SRC.ax, SRC.st("frequentist-inference","Frequentist Inference","Inferencia frecuentista")] },
  gloss:[ [["Multiple comparisons","Comparaciones múltiples"],["Running many tests or comparing many candidates, which raises the chance that at least one looks good by luck.","Hacer muchos contrastes o comparar muchos candidatos, lo que aumenta la probabilidad de que al menos uno parezca bueno por azar."],"hook"],
    [["Held-out set","Conjunto reservado (holdout)"],["Cases kept aside during development and used once at the end for an honest score.","Casos apartados durante el desarrollo y usados una sola vez al final para obtener una puntuación honesta."],"p1"],
    [["Bonferroni correction","Corrección de Bonferroni"],["Dividing the significance threshold by the number of tests to keep the overall false alarm rate low.","Dividir el umbral de significación por el número de contrastes para mantener baja la tasa global de falsas alarmas."],"q1"] ]
});

/* ================= Advanced 3 ================= */
L({ id:"a3", title:["Uncertainty and calibration","Incertidumbre y calibración"], q:["When my model says 90% sure, is it right 90% of the time?","Cuando mi modelo dice 90 % seguro, ¿acierta el 90 % de las veces?"],
  hook:{ answer:1, title:["\"I am 90% confident\"","«Estoy seguro al 90 %»"],
    body:[`<p>Your agent attaches a confidence to each answer, and you plan to auto-approve anything above 90%. Two kinds of uncertainty hide behind that number.</p><p><dfn>Aleatoric uncertainty</dfn> is randomness in the world: an ambiguous question has no single right answer, and more training would not change that. <dfn>Epistemic uncertainty</dfn> is the model not knowing: a question outside what it learned. More data or better retrieval can reduce it.</p>`,
      `<p>Tu agente adjunta una confianza a cada respuesta y quieres aprobar automáticamente todo lo que supere el 90 %. Detrás de ese número se esconden dos tipos de incertidumbre.</p><p>La <dfn>incertidumbre aleatoria</dfn> es el azar del mundo: una pregunta ambigua no tiene una única respuesta correcta, y más entrenamiento no lo cambiaría. La <dfn>incertidumbre epistémica</dfn> es que el modelo no sabe: una pregunta fuera de lo que aprendió. Más datos o una mejor recuperación pueden reducirla.</p>`],
    legend:["Predict: on 1,000 answers the model states 90% confidence. 720 are right. What is this model?","Predice: en 1000 respuestas el modelo declara un 90 % de confianza. 720 son correctas. ¿Cómo es este modelo?"],
    opts:[["Well calibrated","Bien calibrado"],["Overconfident","Demasiado confiado"],["Underconfident","Poco confiado"]],
    reveal:["It claims 90% and delivers 72%, so it is overconfident. Turn the dial to the right and the bars drop below the dashed line in the same way.","Dice 90 % y entrega 72 %, así que confía demasiado. Gira el dial a la derecha y las barras caen por debajo de la línea discontinua del mismo modo."] },
  plays:[ { w:"calib", title:["Turn the confidence dial","Gira el dial de confianza"],
      intro:[`<p>A model is <dfn>calibrated</dfn> when its stated confidence matches how often it is right. This chart groups 3,000 answers by stated confidence and shows the real accuracy of each group. Turn the dial fully both ways.</p>`,`<p>Un modelo está <dfn>calibrado</dfn> cuando la confianza que declara coincide con las veces que acierta. Este gráfico agrupa 3000 respuestas por confianza declarada y muestra el acierto real de cada grupo. Gira el dial del todo en los dos sentidos.</p>`],
      notice:["the answers and their correctness never change. Only the stated confidence does. Bars below the dashed line mean overconfidence, bars above mean underconfidence, and both raise the Brier score.","las respuestas y su corrección no cambian nunca. Solo cambia la confianza declarada. Barras por debajo de la línea discontinua significan exceso de confianza; por encima, falta de confianza; y las dos cosas suben la puntuación de Brier."],
      done:["Accuracy and calibration are separate qualities. A model can be right often and still lie about how sure it is.","Acierto y calibración son cualidades distintas. Un modelo puede acertar a menudo y aun así mentir sobre lo seguro que está."] } ],
  code:{ title:["From logprobs to a calibration table","De los logprobs a una tabla de calibración"],
    intro:[`<p>Many APIs return a <dfn>logprob</dfn> for each token: the logarithm of its probability. <code>np.exp</code> turns it back into a probability you can use as confidence. The <dfn>Brier score</dfn> then measures how far confidences sit from outcomes. Fill the gap.</p>`,`<p>Muchas API devuelven un <dfn>logprob</dfn> por token: el logaritmo de su probabilidad. <code>np.exp</code> lo convierte de nuevo en una probabilidad que puedes usar como confianza. La <dfn>puntuación de Brier</dfn> mide después lo lejos que quedan las confianzas de los resultados. Rellena el hueco.</p>`],
    py:`import numpy as np

rng = np.random.default_rng(seed=22)
n = 4000
logprob = np.log(rng.uniform(0.5, 1.0, size=n))    #~ what the API returns for the answer token ~~ lo que devuelve la API para el token de la respuesta
confidence = np.exp(logprob)                       #~ logprob -> probability ~~ logprob -> probabilidad
#~ This model is overconfident: right less often than it claims ~~ Este modelo confía demasiado: acierta menos de lo que dice
correct = rng.random(n) < (0.5 + (confidence - 0.5) * 0.6)

#~ GAP: Brier score = average of (confidence - outcome) raised to what power? ~~ HUECO: Brier = promedio de (confianza - resultado) elevado a qué potencia
brier = ((confidence - correct) ** ____).mean()
print(f"Brier score: {brier:.3f}  (0 is perfect; always saying 50% scores 0.25)")

print("stated     -> actually right")
for lo in [0.5, 0.6, 0.7, 0.8, 0.9]:
    in_bin = (confidence >= lo) & (confidence < lo + 0.1)
    print(f"  {lo:.0%} to {lo + 0.1:.0%} -> {correct[in_bin].mean():.0%}  ({in_bin.sum()} answers)")
`,
    dart:`import 'dart:math';

void main() {
  final rng = Random(22);
  const n = 4000;
  var brier = 0.0;
  final right = List.filled(5, 0), count = List.filled(5, 0);
  for (var i = 0; i < n; i++) {
    final logprob = log(0.5 + 0.5 * rng.nextDouble()); //~ what the API returns ~~ lo que devuelve la API
    final confidence = exp(logprob); //~ logprob -> probability ~~ logprob -> probabilidad
    //~ overconfident model ~~ modelo demasiado confiado
    final correct = rng.nextDouble() < 0.5 + (confidence - 0.5) * 0.6;
    final outcome = correct ? 1.0 : 0.0;
    brier += (confidence - outcome) * (confidence - outcome);
    final bin = min(4, ((confidence - 0.5) / 0.1).floor());
    count[bin]++;
    if (correct) right[bin]++;
  }
  print('Brier score: ' + (brier / n).toStringAsFixed(3));
  for (var b = 0; b < 5; b++) {
    final lo = 50 + 10 * b, hi = lo + 10;
    final acc = (100 * right[b] / count[b]).round();
    print('  $lo% to $hi% -> $acc%');
  }
}
`,
    sol:[["____","2"]], check:`"ok" if abs(brier - ((confidence - correct) ** 2).mean()) < 1e-12 else ("one" if abs(brier - (confidence - correct).mean()) < 1e-12 else "no")`,
    ok:["The table shows the gap: answers stated at 90% to 100% are right only about 78% of the time. Auto-approving above 90% would let far more errors through than the number suggests.","La tabla muestra la brecha: las respuestas declaradas entre el 90 % y el 100 % aciertan solo alrededor del 78 % de las veces. Aprobar automáticamente por encima del 90 % dejaría pasar muchos más errores de los que sugiere el número."],
    msgs:{ one:["With power 1, positive and negative gaps cancel out and a badly calibrated model can score near zero. Squaring makes every miss count.","Con potencia 1, las diferencias positivas y negativas se cancelan y un modelo mal calibrado puede puntuar cerca de cero. Elevar al cuadrado hace que cuente cada fallo."] },
    tests:[["1","one"],["3","no"]] },
  qs:[
    { kind:"mc", title:["Which uncertainty is it?","¿Qué incertidumbre es?"], body:[`<p>A user asks your support agent: "Will my package arrive tomorrow?" The tracking data says it left the depot, and delivery times from there vary between one and three days.</p>`,`<p>Un usuario pregunta a tu agente de soporte: «¿Llegará mi paquete mañana?». Los datos de seguimiento dicen que ha salido del almacén, y desde ahí la entrega tarda entre uno y tres días.</p>`], legend:["What kind of uncertainty dominates, and what follows?","¿Qué tipo de incertidumbre domina y qué se deduce?"],
      opts:[ {t:["Epistemic. Fine-tune the model on more delivery conversations","Epistémica. Hay que ajustar el modelo con más conversaciones de entregas"], why:["The model already has all the information that exists. The outcome itself is still open, and no amount of training fixes tomorrow's traffic.","El modelo ya tiene toda la información que existe. El resultado en sí sigue abierto, y ningún entrenamiento arregla el tráfico de mañana."]},
        {t:["Aleatoric. The honest answer states the odds, because no extra knowledge would settle it","Aleatoria. La respuesta honesta da las probabilidades, porque ningún conocimiento adicional lo resolvería"], ok:true, why:["The randomness is in the world. A good system says \"probably, about 60%\" and a calibrated one is right 60% of the times it says that.","El azar está en el mundo. Un buen sistema dice «probablemente, alrededor del 60 %», y uno calibrado acierta el 60 % de las veces que lo dice."]},
        {t:["Neither. The agent should answer yes or no","Ninguna. El agente debería responder sí o no"], why:["A flat yes or no hides real uncertainty from the user, who then cannot plan around it.","Un sí o un no a secas esconde una incertidumbre real al usuario, que no puede planificar teniéndola en cuenta."]} ] },
    { kind:"predict", run:true, title:["A Brier score by hand","Una puntuación de Brier a mano"], code:`import numpy as np
confidence = np.array([0.9, 0.9, 0.6, 0.6])
correct = np.array([1, 0, 1, 0])
print(round(((confidence - correct) ** 2).mean(), 3))`,
      opts:[ {t:"0.335", ok:true, why:["The squared gaps are 0.01, 0.81, 0.16 and 0.36. Their average is 1.34 / 4. The confident miss, 0.81, costs the most: being sure and wrong is what the score punishes.","Las diferencias al cuadrado son 0.01, 0.81, 0.16 y 0.36. Su promedio es 1.34 / 4. El fallo con confianza alta, 0.81, es el que más cuesta: la puntuación castiga estar seguro y equivocarse."]},
        {t:"0.25", why:["0.25 is what a model scores by always saying 50%. This model does worse than that because of its confident wrong answer.","0.25 es lo que saca un modelo que siempre dice 50 %. Este modelo lo hace peor por su respuesta equivocada con mucha confianza."]},
        {t:"0.5", why:["0.5 is the accuracy: two of four correct. The Brier score compares each confidence with its own outcome.","0.5 es el acierto: dos de cuatro correctas. La puntuación de Brier compara cada confianza con su propio resultado."]},
        {t:"0.25 0.335", why:["The code prints one number. It is the average of the four squared gaps.","El código imprime un solo número. Es el promedio de las cuatro diferencias al cuadrado."]} ] },
    { kind:"fix", title:["A calibration check that always passes","Una comprobación de calibración que siempre pasa"], body:[`<p>This reports a calibration gap near zero for a model that is overconfident on hard questions and underconfident on easy ones.</p>`,`<p>Esto da una brecha de calibración casi nula para un modelo que confía demasiado en las preguntas difíciles y demasiado poco en las fáciles.</p>`],
      code:`gap = abs(confidence.mean() - correct.mean())`, legend:["Which approach measures calibration properly?","¿Qué enfoque mide bien la calibración?"],
      opts:[ {t:["Group answers into confidence bins, compute the gap inside each bin, and average the gaps weighted by bin size","Agrupar las respuestas por franjas de confianza, calcular la brecha dentro de cada franja y promediar las brechas ponderadas por tamaño"], ok:true, why:["Overall averages let overconfidence in one region cancel underconfidence in another. Comparing inside bins exposes both. This weighted average is the expected calibration error, ECE.","Los promedios globales dejan que el exceso de confianza en una zona cancele la falta en otra. Comparar dentro de las franjas destapa las dos cosas. Ese promedio ponderado es el error de calibración esperado, ECE."]},
        {t:["Use the median instead of the mean","Usar la mediana en lugar de la media"], why:["That still compares one overall number with another, so opposite errors still cancel.","Eso sigue comparando un número global con otro, así que los errores opuestos se siguen cancelando."]},
        {t:["Compute it on more answers","Calcularlo con más respuestas"], why:["More answers make the two overall averages more exact. The cancelling stays.","Con más respuestas, los dos promedios globales salen más exactos. La cancelación sigue ahí."]} ] } ],
  apply:{ seed:179, title:["Can you auto-approve above 90%?","¿Puedes aprobar automáticamente por encima del 90 %?"],
    body:[`<p>3,000 logged answers, each with the confidence the model stated and whether a human marked it correct.</p>`,`<p>3000 respuestas registradas, cada una con la confianza que declaró el modelo y si una persona la marcó como correcta.</p>`],
    cols:["answer_id","confidence","correct"],
    gen:(r) => Array.from({length:3000}, (_,i) => { const c = 0.5+0.5*Math.pow(r.u(), 0.7); return {answer_id:"ans-"+pad(i+1), confidence:c.toFixed(2), correct:r.u() < 0.5+(c-0.5)*0.62}; }),
    task:["Set <code>answer</code> to the actual accuracy (between 0 and 1) of the answers whose stated confidence is <b>0.90 or higher</b>.","Asigna a <code>answer</code> el acierto real (entre 0 y 1) de las respuestas cuya confianza declarada es <b>0.90 o más</b>."],
    hint:["Filter with <code>df[df[\"confidence\"] &gt;= 0.90]</code>, then take the mean of <code>correct</code>.","Filtra con <code>df[df[\"confidence\"] &gt;= 0.90]</code> y después toma la media de <code>correct</code>."],
    py:`import numpy as np

print("overall accuracy:", round(df["correct"].mean(), 3))
print("mean stated confidence:", round(df["confidence"].mean(), 3))

sure = df[df["confidence"] >= 0.90]
print(len(sure), "answers at 0.90 or higher")
#~ YOUR TURN: how often are those answers actually right? ~~ TU TURNO: ¿cuántas veces aciertan de verdad esas respuestas?
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...",'answer = sure["correct"].mean()']],
    check: chk(`df[df["confidence"] >= 0.90]["correct"].mean()`, {conf:`df[df["confidence"] >= 0.90]["confidence"].mean()`, all:`df["correct"].mean()`, pct:`df[df["confidence"] >= 0.90]["correct"].mean() * 100`}, {e:`round(_e * 100, 1)`, c:`round(float(df[df["confidence"] >= 0.90]["confidence"].mean()) * 100, 1)`, n:`int((df["confidence"] >= 0.90).sum())`}),
    ok:["The {n} answers in that group state {c}% confidence on average and are right {e}% of the time. Auto-approving them would pass roughly one error in four. Recalibrate the confidence, or set the threshold from this table.","Las {n} respuestas de ese grupo declaran un {c} % de confianza de media y aciertan el {e} % de las veces. Aprobarlas automáticamente dejaría pasar más o menos un error de cada cuatro. Recalibra la confianza o fija el umbral a partir de esta tabla."],
    msgs:{ type:TYPE_MSG, pct:PCT_MSG, conf:["That is what the model claims: the mean stated confidence in the group. The task asks what it delivers: the mean of <code>correct</code>.","Eso es lo que dice el modelo: la confianza media declarada en el grupo. La tarea pide lo que entrega: la media de <code>correct</code>."],
      all:["That is the accuracy over all answers. Restrict to the high-confidence group first.","Ese es el acierto de todas las respuestas. Quédate antes con el grupo de confianza alta."] },
    tests:[[[["answer = ...",'answer = sure["confidence"].mean()']],"conf"],[[["answer = ...",'answer = df["correct"].mean()']],"all"]] },
  recap:{ takes:[["<b>Two kinds of uncertainty.</b> Aleatoric is randomness in the world. Epistemic is the model not knowing, and more knowledge can reduce it.","<b>Dos tipos de incertidumbre.</b> La aleatoria es el azar del mundo. La epistémica es que el modelo no sabe, y más conocimiento puede reducirla."],
      ["<b>Calibration is honesty about confidence.</b> Among answers stated at 80%, 80% should be right.","<b>La calibración es honestidad sobre la confianza.</b> Entre las respuestas declaradas al 80 %, debería acertar el 80 %."],
      ["<b>Measure it per confidence bin.</b> A calibration curve and the Brier score tell you whether a threshold on confidence means what you think.","<b>Mídela por franjas de confianza.</b> Una curva de calibración y la puntuación de Brier te dicen si un umbral de confianza significa lo que crees."]],
    f:[`<button class="sym" data-g="p1">Brier</button> = average of (<button class="sym" data-g="p1">confidence</button> − <button class="sym" data-g="p1">outcome</button>)²`, `<button class="sym" data-g="p1">Brier</button> = promedio de (<button class="sym" data-g="p1">confianza</button> − <button class="sym" data-g="p1">resultado</button>)²`],
    read:["Read it as: for each answer take the gap between the stated confidence and what happened, 1 for right and 0 for wrong. Square it and average over all answers.","Léela así: para cada respuesta toma la diferencia entre la confianza declarada y lo que pasó, 1 si acierta y 0 si falla. Elévala al cuadrado y promedia todas las respuestas."],
    syms:[ {s:"confidence", g:"p1", d:["The horizontal position of each bar: what the model states.","La posición horizontal de cada barra: lo que declara el modelo."]},
      {s:"outcome", g:"p1", d:["1 if the answer was right, 0 if not. The bar heights are averages of these.","1 si la respuesta acertó, 0 si no. Las alturas de las barras son promedios de estos valores."]},
      {s:"Brier", g:"p1", d:["The last readout under the chart. Lower is better.","El último dato bajo el gráfico. Cuanto más bajo, mejor."]} ],
    next:["Advanced 4 follows uncertainty through a multi-step agent, where small error rates compound.","Avanzado 4 sigue la incertidumbre a través de un agente de varios pasos, donde las tasas pequeñas de error se acumulan."],
    deeper:[SRC.ax, SRC.st("bayesian-inference","Bayesian Inference","Inferencia bayesiana")] },
  gloss:[ [["Aleatoric uncertainty","Incertidumbre aleatoria"],["Uncertainty from randomness in the world itself. More data does not remove it.","Incertidumbre que viene del azar del propio mundo. Más datos no la eliminan."],"hook"],
    [["Epistemic uncertainty","Incertidumbre epistémica"],["Uncertainty from the model's lack of knowledge. More data or context can reduce it.","Incertidumbre que viene de la falta de conocimiento del modelo. Más datos o más contexto pueden reducirla."],"hook"],
    [["Calibration","Calibración"],["How well stated confidence matches actual accuracy.","Lo bien que la confianza declarada coincide con el acierto real."],"p1"],
    [["Logprob","Logprob"],["The logarithm of a token's probability, as returned by many model APIs.","El logaritmo de la probabilidad de un token, tal como lo devuelven muchas API de modelos."],"code"],
    [["Brier score","Puntuación de Brier"],["The average squared gap between stated confidence and the outcome. 0 is perfect.","La diferencia media al cuadrado entre la confianza declarada y el resultado. 0 es perfecto."],"code"] ]
});

/* ================= Advanced 4 ================= */
L({ id:"a4", title:["Agent reliability","Fiabilidad de agentes"], q:["Why does a 95%-reliable step fail over 20 steps?","¿Por qué un paso fiable al 95 % falla en 20 pasos?"],
  hook:{ answer:2, title:["Every step works 95% of the time","Cada paso funciona el 95 % de las veces"],
    body:[`<p>Your research agent completes a task in 20 steps: plan, search, fetch, extract, and so on. You tested the steps one by one, and each works 95% of the time.</p><p>A task succeeds only when every step does.</p>`,
      `<p>Tu agente de investigación completa una tarea en 20 pasos: planificar, buscar, descargar, extraer, etcétera. Has probado los pasos uno a uno y cada uno funciona el 95 % de las veces.</p><p>Una tarea solo sale bien cuando salen bien todos los pasos.</p>`],
    legend:["Predict: how many of 100 tasks finish successfully?","Predice: ¿cuántas tareas de cada 100 terminan con éxito?"],
    opts:[["About 95","Unas 95"],["About 75","Unas 75"],["About 36","Unas 36"]],
    reveal:["0.95 multiplied by itself 20 times is about 0.36. Almost two tasks in three fail somewhere, even though every individual step looks fine in isolation.","0,95 multiplicado por sí mismo 20 veces es alrededor de 0,36. Casi dos de cada tres tareas fallan en algún punto, aunque cada paso por separado parezca ir bien."] },
  plays:[
    { w:"chain", title:["Watch agents drop out step by step","Mira cómo los agentes se caen paso a paso"],
      intro:[`<p>The curve shows the share of agents still on track after each step. Set 95% and 20 steps, run 200 agents, then allow one retry per step and run them again.</p>`,`<p>La curva muestra la proporción de agentes que siguen en pie tras cada paso. Pon 95 % y 20 pasos, ejecuta 200 agentes, después permite un reintento por paso y ejecútalos otra vez.</p>`],
      notice:["small per-step losses multiply. Moving one step from 95% to 99% lifts a 20-step task from 36% to 82%. One retry per step does even more, as long as failures are detected and are independent.","las pequeñas pérdidas por paso se multiplican. Subir un paso del 95 % al 99 % lleva una tarea de 20 pasos del 36 % al 82 %. Un reintento por paso consigue aún más, siempre que los fallos se detecten y sean independientes."],
      done:["For long tasks, per-step reliability matters more than anything else. Shorter chains and retries are your two levers.","En tareas largas, la fiabilidad por paso importa más que cualquier otra cosa. Cadenas más cortas y reintentos son tus dos palancas."] },
    { w:"vote", title:["Ask several times and take the majority","Pregunta varias veces y quédate con la mayoría"],
      intro:[`<p><dfn>Self-consistency voting</dfn> calls the model several times and keeps the most common answer. Move the number of calls, then raise the share of mistakes that all calls make together.</p>`,`<p>La <dfn>votación por autoconsistencia</dfn> llama al modelo varias veces y se queda con la respuesta más frecuente. Mueve el número de llamadas y después sube la proporción de errores que cometen todas las llamadas a la vez.</p>`],
      notice:["voting helps when a single call is right more than half the time and the calls err independently. Below 50% it makes things worse. Shared mistakes, such as a misleading prompt, cannot be voted away.","votar ayuda cuando una sola llamada acierta más de la mitad de las veces y las llamadas se equivocan de forma independiente. Por debajo del 50 % empeora las cosas. Los errores compartidos, como un prompt engañoso, no se eliminan votando."],
      done:["Voting buys reliability with cost and latency, and only against independent errors.","Votar compra fiabilidad a cambio de coste y latencia, y solo frente a errores independientes."] } ],
  code:{ title:["Compound a success rate","Acumula una tasa de éxito"],
    intro:[`<p>The formula is one multiplication repeated. The cell checks it against 100,000 simulated agent runs and then adds one retry per step. Fill the gap.</p>`,`<p>La fórmula es una multiplicación repetida. La celda la comprueba con 100 000 ejecuciones simuladas y después añade un reintento por paso. Rellena el hueco.</p>`],
    py:`import numpy as np

rng = np.random.default_rng(seed=24)
step_ok = 0.95
steps = 20

#~ GAP: every step must succeed: step_ok multiplied by itself how many times? ~~ HUECO: todos los pasos deben salir bien: step_ok multiplicado por sí mismo ¿cuántas veces?
formula = step_ok ** ____
#~ Check: 100,000 agent runs with 20 independent steps each ~~ Comprobación: 100 000 ejecuciones con 20 pasos independientes cada una
runs = rng.random((100_000, steps)) < step_ok
simulated = runs.all(axis=1).mean()
print(f"formula {formula:.1%} | simulated {simulated:.1%}")

#~ One retry: a step fails only if both attempts fail ~~ Un reintento: un paso falla solo si fallan los dos intentos
with_retry = (1 - (1 - step_ok) ** 2) ** steps
print(f"with one retry per step: {with_retry:.1%}")
print(f"tool-call success rate in the simulation: {runs.mean():.1%}")
`,
    dart:`import 'dart:math';

void main() {
  final rng = Random(24);
  const stepOk = 0.95, steps = 20;

  final formula = pow(stepOk, steps); //~ every step must succeed ~~ todos los pasos deben salir bien
  var finished = 0;
  const runs = 100000;
  for (var r = 0; r < runs; r++) {
    var ok = true;
    for (var s = 0; s < steps && ok; s++) {
      ok = rng.nextDouble() < stepOk;
    }
    if (ok) finished++;
  }
  print('formula ' + (100 * formula).toStringAsFixed(1) + '% | simulated ' +
      (100 * finished / runs).toStringAsFixed(1) + '%');

  //~ one retry: a step fails only if both attempts fail ~~ un reintento: un paso falla solo si fallan los dos intentos
  final withRetry = pow(1 - pow(1 - stepOk, 2), steps);
  print('with one retry per step: ' + (100 * withRetry).toStringAsFixed(1) + '%');
}
`,
    sol:[["____","steps"]], check:`"ok" if abs(formula - 0.95 ** 20) < 1e-12 else ("two" if abs(formula - 0.95 ** 2) < 1e-12 else "no")`,
    ok:["Formula and simulation agree at about 36%. With one retry per step the same agent finishes 95% of tasks. Note the last line: the tool-call success rate reads 95% while the task success rate is 36%. They are different metrics.","La fórmula y la simulación coinciden en torno al 36 %. Con un reintento por paso, el mismo agente termina el 95 % de las tareas. Fíjate en la última línea: la tasa de éxito de las llamadas marca 95 % mientras la tasa de éxito de la tarea es 36 %. Son métricas distintas."],
    msgs:{ two:["That is two steps in a row. The task has 20 of them, and all must succeed.","Eso son dos pasos seguidos. La tarea tiene 20 y todos deben salir bien."] },
    tests:[["2","two"],["1","no"]] },
  qs:[
    { kind:"mc", title:["Where to spend the engineering week","Dónde invertir la semana de ingeniería"], body:[`<p>Your agent has 20 steps at 95% each, so 36% of tasks succeed. You can either raise every step to 99%, or redesign the task to need 15 steps at 95%.</p>`,`<p>Tu agente tiene 20 pasos al 95 % cada uno, así que el 36 % de las tareas sale bien. Puedes subir cada paso al 99 % o rediseñar la tarea para que necesite 15 pasos al 95 %.</p>`], legend:["Which helps more?","¿Qué ayuda más?"],
      opts:[ {t:["Raising each step to 99%: task success goes to about 82%","Subir cada paso al 99 %: el éxito de la tarea sube a alrededor del 82 %"], ok:true, why:["0.99 to the power 20 is about 0.82. Cutting to 15 steps gives 0.95 to the power 15, about 0.46. Reliability per step is the stronger lever because it is applied at every step.","0,99 elevado a 20 es alrededor de 0,82. Reducir a 15 pasos da 0,95 elevado a 15, alrededor de 0,46. La fiabilidad por paso es la palanca más fuerte porque se aplica en cada paso."]},
        {t:["Cutting to 15 steps: fewer chances to fail","Reducir a 15 pasos: menos oportunidades de fallar"], why:["Fewer steps help, to about 46%. Raising per-step reliability to 99% reaches about 82%.","Menos pasos ayudan, hasta alrededor del 46 %. Subir la fiabilidad por paso al 99 % llega a alrededor del 82 %."]},
        {t:["They are about equal","Son más o menos iguales"], why:["The two options give about 46% and 82%. Compute both: 0.95 to the power 15, and 0.99 to the power 20.","Las dos opciones dan alrededor del 46 % y del 82 %. Calcula las dos: 0,95 elevado a 15 y 0,99 elevado a 20."]} ] },
    { kind:"predict", run:true, title:["Two in a row, or two tries","Dos seguidos o dos intentos"], code:`p = 0.9
print(round(p ** 2, 2), round(1 - (1 - p) ** 2, 2))`,
      opts:[ {t:"0.81 0.99", ok:true, why:["Two steps that must both work: 0.9 × 0.9 = 0.81. One step with a retry fails only when both tries fail: 0.1 × 0.1 = 0.01, so it succeeds 0.99 of the time. Chaining multiplies successes; retrying multiplies failures.","Dos pasos que deben funcionar los dos: 0.9 × 0.9 = 0.81. Un paso con reintento falla solo cuando fallan los dos intentos: 0.1 × 0.1 = 0.01, así que funciona 0.99 de las veces. Encadenar multiplica los éxitos; reintentar multiplica los fallos."]},
        {t:"0.99 0.81", why:["The two are swapped. <code>p ** 2</code> is both succeeding in a row: 0.81.","Están intercambiados. <code>p ** 2</code> es que los dos salgan bien seguidos: 0.81."]},
        {t:"1.8 0.2", why:["Probabilities of events that must both happen are multiplied. Adding them can exceed 1, which no probability can.","Las probabilidades de sucesos que deben ocurrir los dos se multiplican. Sumarlas puede pasar de 1, y ninguna probabilidad puede."]},
        {t:"0.81 0.81", why:["The second expression is one minus the chance that both tries fail: 1 − 0.01 = 0.99.","La segunda expresión es uno menos la probabilidad de que fallen los dos intentos: 1 − 0.01 = 0.99."]} ] },
    { kind:"fix", title:["A dashboard that says 95%","Un panel que dice 95 %"], body:[`<p><code>runs</code> has one row per agent run and one column per step, True where the step succeeded. The dashboard shows "task success: 0.95" while users report that most tasks fail.</p>`,`<p><code>runs</code> tiene una fila por ejecución del agente y una columna por paso, con True donde el paso salió bien. El panel muestra «task success: 0.95» mientras los usuarios dicen que casi todas las tareas fallan.</p>`],
      code:`runs = rng.random((1000, 20)) < 0.95
print("task success:", runs.mean())`, legend:["Which line reports task success?","¿Qué línea informa del éxito de la tarea?"],
      opts:[ {t:["<code>print(\"task success:\", runs.all(axis=1).mean())</code>","<code>print(\"task success:\", runs.all(axis=1).mean())</code>"], ok:true, why:["<code>runs.mean()</code> averages over all 20,000 steps: the tool-call success rate. <code>.all(axis=1)</code> first asks, per run, whether every step succeeded.","<code>runs.mean()</code> promedia los 20 000 pasos: es la tasa de éxito de las llamadas. <code>.all(axis=1)</code> pregunta antes, por ejecución, si todos los pasos salieron bien."]},
        {t:["<code>print(\"task success:\", runs.any(axis=1).mean())</code>","<code>print(\"task success:\", runs.any(axis=1).mean())</code>"], why:["<code>.any</code> asks whether at least one step succeeded, which is true for practically every run.","<code>.any</code> pregunta si al menos un paso salió bien, y eso es cierto en prácticamente todas las ejecuciones."]},
        {t:["<code>print(\"task success:\", runs.mean(axis=0))</code>","<code>print(\"task success:\", runs.mean(axis=0))</code>"], why:["That gives the success rate of each of the 20 steps separately. All are near 0.95, and none describes a whole task.","Eso da la tasa de éxito de cada uno de los 20 pasos por separado. Todas rondan 0.95 y ninguna describe una tarea completa."]} ] } ],
  apply:{ seed:181, show:9, title:["Task success from agent traces","Éxito de la tarea a partir de trazas"],
    body:[`<p>These are traces of 1,500 agent runs. Each run has up to 8 steps, one row per step, and stops at its first failed step.</p>`,`<p>Estas son las trazas de 1500 ejecuciones de un agente. Cada ejecución tiene hasta 8 pasos, una fila por paso, y se detiene en el primer paso que falla.</p>`],
    cols:["run_id","step","tool","ok"],
    gen:(r) => { const plan = [["plan",.995],["search",.93],["search",.93],["fetch",.97],["extract",.98],["search",.93],["write",.99],["verify",.97]], rows = []; for (let i=1;i<=1500;i++) for (let s=0;s<8;s++){ const ok = r.u() < plan[s][1]; rows.push({run_id:"run-"+pad(i), step:s+1, tool:plan[s][0], ok}); if (!ok) break; } return rows; },
    task:["Set <code>answer</code> to the task success rate: the share of runs (between 0 and 1) in which all 8 steps were ok.","Asigna a <code>answer</code> la tasa de éxito de la tarea: la proporción de ejecuciones (entre 0 y 1) en las que los 8 pasos salieron bien."],
    hint:["<code>runs[\"sum\"]</code> is the number of ok steps in each run. A run completed when that number is 8: <code>(runs[\"sum\"] == 8).mean()</code>.","<code>runs[\"sum\"]</code> es el número de pasos correctos de cada ejecución. Una ejecución se completó cuando ese número es 8: <code>(runs[\"sum\"] == 8).mean()</code>."],
    py:`import pandas as pd

print("tool-call success rate:", round(df["ok"].mean(), 3))
print(df.groupby("tool")["ok"].mean().round(3))

#~ per run: number of ok steps and number of steps attempted ~~ por ejecución: pasos correctos y pasos intentados
runs = df.groupby("run_id")["ok"].agg(["sum", "count"])

#~ YOUR TURN: share of runs where all 8 steps were ok ~~ TU TURNO: proporción de ejecuciones con los 8 pasos correctos
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...",'answer = (runs["sum"] == 8).mean()']],
    check: chk(`(_r["sum"] == 8).mean()`, {rows:`df["ok"].mean()`, reached:`(_r["count"] == 8).mean()`, pct:`(_r["sum"] == 8).mean() * 100`}, {e:`round(_e * 100, 1)`, t:`round(float(df["ok"].mean()) * 100, 1)`, w:`str(df.groupby("tool")["ok"].mean().idxmin())`}, "1e-9", `_r = df.groupby("run_id")["ok"].agg(["sum", "count"])`),
    ok:["Tool calls succeed {t}% of the time, and only {e}% of tasks finish. The weakest tool is {w}, which is used three times per task. That is where a retry pays off first.","Las llamadas a herramientas salen bien el {t} % de las veces y solo termina el {e} % de las tareas. La herramienta más débil es {w}, que se usa tres veces por tarea. Ahí es donde antes compensa un reintento."],
    msgs:{ type:TYPE_MSG, pct:PCT_MSG, rows:["That is the tool-call success rate: ok rows divided by all rows. A task needs all 8 of its steps to be ok.","Esa es la tasa de éxito de las llamadas: filas correctas divididas por todas las filas. Una tarea necesita que sus 8 pasos salgan bien."],
      reached:["That counts runs that reached step 8. Some of them failed on that last step. Count runs with 8 ok steps.","Eso cuenta las ejecuciones que llegaron al paso 8. Algunas fallaron en ese último paso. Cuenta las ejecuciones con 8 pasos correctos."] },
    tests:[[[["answer = ...",'answer = df["ok"].mean()']],"rows"],[[["answer = ...",'answer = (runs["count"] == 8).mean()']],"reached"]] },
  recap:{ takes:[["<b>Errors compound.</b> A chain succeeds only if every link does, so success rates multiply.","<b>Los errores se acumulan.</b> Una cadena solo sale bien si lo hace cada eslabón, así que las tasas de éxito se multiplican."],
      ["<b>Tool-call success is not task success.</b> Report both, and optimise the second.","<b>El éxito de las llamadas no es el éxito de la tarea.</b> Presenta las dos y optimiza la segunda."],
      ["<b>Retries and votes help against independent errors only.</b> Shared mistakes survive both.","<b>Los reintentos y los votos solo ayudan frente a errores independientes.</b> Los errores compartidos sobreviven a ambos."]],
    f:[`P(<button class="sym" data-g="p1">task</button>) = <button class="sym" data-g="p1">p</button><sup><button class="sym" data-g="p1">k</button></sup> &nbsp;&nbsp;·&nbsp;&nbsp; with <button class="sym" data-g="p1">r</button> retries: p becomes 1 − (1 − p)<sup>r + 1</sup>`, `P(<button class="sym" data-g="p1">tarea</button>) = <button class="sym" data-g="p1">p</button><sup><button class="sym" data-g="p1">k</button></sup> &nbsp;&nbsp;·&nbsp;&nbsp; con <button class="sym" data-g="p1">r</button> reintentos: p pasa a ser 1 − (1 − p)<sup>r + 1</sup>`],
    read:["Read it as: task success is the step success multiplied by itself once per step. A step with retries fails only when every attempt fails.","Léela así: el éxito de la tarea es el éxito del paso multiplicado por sí mismo una vez por paso. Un paso con reintentos falla solo cuando fallan todos los intentos."],
    syms:[ {s:"p", g:"p1", d:["Success rate of one step: the first slider.","Tasa de éxito de un paso: el primer control."]},
      {s:"k", g:"p1", d:["Number of steps: the second slider.","Número de pasos: el segundo control."]},
      {s:"r", g:"p1", d:["Retries per step: the third slider.","Reintentos por paso: el tercer control."]} ],
    next:["Advanced 5 routes traffic between prompts while it is still learning which one is best.","Avanzado 5 reparte el tráfico entre prompts mientras todavía aprende cuál es el mejor."],
    deeper:[SRC.ax, SRC.st("compound-probability","Compound Probability","Probabilidad compuesta")] },
  gloss:[ [["Compounding error","Error acumulado"],["The way small failure rates multiply across the steps of a chain.","La forma en que las tasas pequeñas de fallo se multiplican a lo largo de los pasos de una cadena."],"hook"],
    [["Task success rate","Tasa de éxito de la tarea"],["The share of whole tasks that finish correctly, as opposed to the share of single steps.","La proporción de tareas completas que terminan bien, frente a la proporción de pasos sueltos."],"code"],
    [["Self-consistency voting","Votación por autoconsistencia"],["Calling a model several times and keeping the most common answer.","Llamar a un modelo varias veces y quedarse con la respuesta más frecuente."],"p2"] ]
});

/* ================= Advanced 5 ================= */
L({ id:"a5", title:["Sequential testing and bandits","Pruebas secuenciales y bandits"], q:["How do I route between models while still learning?","¿Cómo reparto el tráfico entre modelos mientras sigo aprendiendo?"],
  hook:{ answer:1, title:["A fair A/B/C test sends most users to worse prompts","Una prueba A/B/C justa manda a la mayoría de usuarios a prompts peores"],
    body:[`<p>You have three candidate prompts. A classic test splits traffic evenly for two weeks and then picks a winner. During those weeks, two thirds of your users get a prompt that is not the best. And Intermediate 4 showed that stopping early whenever things look good inflates false wins.</p><p>A <dfn>bandit</dfn> algorithm does both jobs at once: it learns which option is best and shifts traffic toward it as evidence arrives.</p>`,
      `<p>Tienes tres prompts candidatos. Una prueba clásica reparte el tráfico a partes iguales durante dos semanas y después elige un ganador. Durante esas semanas, dos tercios de tus usuarios reciben un prompt que no es el mejor. E Intermedio 4 mostró que parar antes de tiempo cuando algo pinta bien infla las falsas victorias.</p><p>Un algoritmo <dfn>bandit</dfn> hace las dos cosas a la vez: aprende qué opción es la mejor y desplaza el tráfico hacia ella a medida que llega la evidencia.</p>`],
    legend:["Predict: a bandit routes 400 requests across three prompts with true pass rates of 62%, 70% and 78%. How much traffic does the worst one get?","Predice: un bandit reparte 400 peticiones entre tres prompts con tasas reales del 62 %, 70 % y 78 %. ¿Cuánto tráfico recibe el peor?"],
    opts:[["About a third, like the others","Alrededor de un tercio, como los demás"],["Clearly less than a third","Claramente menos de un tercio"],["None at all","Nada en absoluto"]],
    reveal:["The worst prompt gets some traffic early, while its curve is still wide, and less and less as the evidence accumulates. It never drops to exactly zero, because the router keeps a small chance of being wrong about it.","El peor prompt recibe algo de tráfico al principio, cuando su curva aún es ancha, y cada vez menos a medida que se acumula la evidencia. Nunca cae exactamente a cero, porque el enrutador mantiene una pequeña probabilidad de estar equivocado con él."] },
  plays:[ { w:"bandit", title:["Let the router learn","Deja que el enrutador aprenda"],
      intro:[`<p>Each curve is the router's belief about one prompt's pass rate, as in Advanced 1. For every request, <dfn>Thompson sampling</dfn> draws one plausible pass rate from each curve and sends the request to the highest draw. Route requests one at a time, then by the hundred.</p>`,`<p>Cada curva es la creencia del enrutador sobre la tasa de aciertos de un prompt, como en Avanzado 1. Para cada petición, el <dfn>muestreo de Thompson</dfn> saca una tasa plausible de cada curva y manda la petición al sorteo más alto. Enruta peticiones de una en una y después de cien en cien.</p>`],
      notice:["wide curves overlap, so every prompt gets tried: that is exploring. As curves narrow and separate, almost all traffic goes to the best one: that is exploiting. Nobody set a schedule; the uncertainty did it.","las curvas anchas se solapan y se prueban todos los prompts: eso es explorar. Cuando las curvas se estrechan y se separan, casi todo el tráfico va al mejor: eso es explotar. Nadie fijó un calendario; lo hizo la incertidumbre."],
      done:["The overall pass rate ends above the 70% an even split would give, because fewer users were sent to weak prompts while the system learned.","La tasa global de aciertos acaba por encima del 70 % que daría un reparto a partes iguales, porque se enviaron menos usuarios a prompts flojos mientras el sistema aprendía."] } ],
  code:{ title:["Thompson sampling in ten lines","Muestreo de Thompson en diez líneas"],
    intro:[`<p>The whole router: keep passes and fails per prompt, draw from each Beta belief, pick the largest draw, record the outcome. Fill the gap with the NumPy function that returns the position of the largest value.</p>`,`<p>Todo el enrutador: guarda aciertos y fallos por prompt, sortea de cada creencia Beta, elige el sorteo más alto y registra el resultado. Rellena el hueco con la función de NumPy que devuelve la posición del valor más grande.</p>`],
    py:`import numpy as np

rng = np.random.default_rng(seed=26)
true_rates = np.array([0.62, 0.70, 0.78])     #~ hidden quality of three prompts ~~ calidad oculta de tres prompts
passes = np.zeros(3)
fails = np.zeros(3)

for request in range(3000):
    #~ one plausible pass rate per prompt, drawn from its current belief ~~ una tasa plausible por prompt, sorteada de su creencia actual
    guess = rng.beta(1 + passes, 1 + fails)
    #~ GAP: send the request to the prompt whose draw is highest ~~ HUECO: manda la petición al prompt con el sorteo más alto
    arm = np.____(guess)
    if rng.random() < true_rates[arm]:
        passes[arm] += 1
    else:
        fails[arm] += 1

traffic = passes + fails
print("requests per prompt:", traffic.astype(int))
print(f"overall pass rate: {passes.sum() / 3000:.1%} (an even split would give {true_rates.mean():.1%})")
`,
    dart:`import 'dart:math';

final rng = Random(26);

double gaussian() => sqrt(-2 * log(1 - rng.nextDouble())) * cos(2 * pi * rng.nextDouble());

double gamma(double k) {
  final d = k - 1 / 3, c = 1 / sqrt(9 * d);
  while (true) {
    final x = gaussian();
    var v = 1 + c * x;
    if (v <= 0) continue;
    v = v * v * v;
    if (log(rng.nextDouble()) < 0.5 * x * x + d - d * v + d * log(v)) return d * v;
  }
}

double beta(double a, double b) {
  final x = gamma(a), y = gamma(b);
  return x / (x + y);
}

void main() {
  const trueRates = [0.62, 0.70, 0.78]; //~ hidden quality of three prompts ~~ calidad oculta de tres prompts
  final passes = [0, 0, 0], fails = [0, 0, 0];
  for (var request = 0; request < 3000; request++) {
    var arm = 0;
    var best = -1.0;
    for (var i = 0; i < 3; i++) {
      final guess = beta(1.0 + passes[i], 1.0 + fails[i]); //~ one plausible pass rate ~~ una tasa plausible
      if (guess > best) {
        best = guess;
        arm = i; //~ highest draw wins the request ~~ el sorteo más alto se lleva la petición
      }
    }
    if (rng.nextDouble() < trueRates[arm]) {
      passes[arm]++;
    } else {
      fails[arm]++;
    }
  }
  final traffic = [for (var i = 0; i < 3; i++) passes[i] + fails[i]];
  final total = passes.reduce((a, b) => a + b);
  print('requests per prompt: $traffic');
  print('overall pass rate: ' + (100 * total / 3000).toStringAsFixed(1) + '%');
}
`,
    sol:[["____","argmax"]], check:`"ok" if traffic[2] > 1500 else ("min" if traffic[0] > 1500 else "no")`,
    ok:["The best prompt receives the large majority of the 3,000 requests and the overall pass rate lands near 77%, well above the 70% of an even split. The weak prompts got just enough traffic to be ruled out.","El mejor prompt recibe la gran mayoría de las 3000 peticiones y la tasa global queda cerca del 77 %, muy por encima del 70 % de un reparto a partes iguales. Los prompts flojos recibieron el tráfico justo para descartarlos."],
    msgs:{ min:["That sends each request to the lowest draw, so the router learned to favour the worst prompt. Pick the position of the largest draw.","Eso manda cada petición al sorteo más bajo, y el enrutador ha aprendido a favorecer al peor prompt. Elige la posición del sorteo más alto."],
      err:["An IndexError means <code>arm</code> is not a position 0, 1 or 2. <code>np.max</code> returns the largest value itself. You need the function that returns where it is.","Un IndexError significa que <code>arm</code> no es una posición 0, 1 o 2. <code>np.max</code> devuelve el valor más grande. Necesitas la función que devuelve dónde está."] },
    tests:[["argmin","min"],["max","err"]] },
  qs:[
    { kind:"mc", title:["Why not just pick the best so far?","¿Por qué no elegir siempre el mejor hasta ahora?"], body:[`<p>A simpler router always sends traffic to the prompt with the highest observed pass rate so far.</p>`,`<p>Un enrutador más simple manda siempre el tráfico al prompt con la tasa observada más alta hasta el momento.</p>`], legend:["What goes wrong?","¿Qué sale mal?"],
      opts:[ {t:["Nothing. That is the fastest way to the best prompt","Nada. Es la forma más rápida de llegar al mejor prompt"], why:["After the first few requests the leader is mostly decided by luck. A greedy router then stops trying the others and can never find out it was wrong.","Tras las primeras peticiones, el líder lo decide sobre todo la suerte. Un enrutador codicioso deja de probar los demás y nunca puede descubrir que se equivocó."]},
        {t:["It can lock onto a prompt that got lucky early and never test the others again","Puede quedarse con un prompt que tuvo suerte al principio y no volver a probar los demás"], ok:true, why:["Three passes in the first three requests look like 100%. Thompson sampling keeps exploring exactly as long as the beliefs still overlap.","Tres aciertos en las tres primeras peticiones parecen un 100 %. El muestreo de Thompson sigue explorando exactamente mientras las creencias se solapan."]},
        {t:["It explores too much","Explora demasiado"], why:["It is the opposite: a greedy router stops exploring almost immediately.","Es lo contrario: un enrutador codicioso deja de explorar casi de inmediato."]} ] },
    { kind:"predict", run:true, title:["Higher mean, less evidence","Media más alta, menos evidencia"], code:`import numpy as np
passes = np.array([3, 30])
fails = np.array([1, 20])
means = (1 + passes) / (2 + passes + fails)
print(means.round(2), means.argmax())`,
      opts:[ {t:"[0.67 0.6 ] 0", ok:true, why:["Prompt 0 has the higher estimate, 4 / 6 against 31 / 52. It also rests on 4 requests. Thompson sampling would still send plenty of traffic to prompt 1, because prompt 0's belief is wide enough to produce low draws.","El prompt 0 tiene la estimación más alta, 4 / 6 frente a 31 / 52. También se apoya en 4 peticiones. El muestreo de Thompson seguiría mandando bastante tráfico al prompt 1, porque la creencia sobre el prompt 0 es tan ancha que produce sorteos bajos."]},
        {t:"[0.75 0.6 ] 0", why:["0.75 is the raw 3 / 4. The code adds the Beta(1, 1) prior first: (1 + 3) / (2 + 4) = 0.67.","0.75 es el 3 / 4 en bruto. El código suma antes el prior Beta(1, 1): (1 + 3) / (2 + 4) = 0.67."]},
        {t:"[0.67 0.6 ] 1", why:["The means are right. <code>argmax</code> returns the position of the largest one, and 0.67 sits at position 0.","Las medias son correctas. <code>argmax</code> devuelve la posición de la mayor, y 0.67 está en la posición 0."]},
        {t:"[0.6  0.67] 1", why:["The two prompts are swapped. The first entry belongs to 3 passes and 1 fail.","Los dos prompts están intercambiados. La primera entrada corresponde a 3 aciertos y 1 fallo."]} ] },
    { kind:"fix", title:["A router that crashes on the first request","Un enrutador que falla en la primera petición"], body:[`<p>This router divides by zero on the first request, and once patched it gets stuck on one prompt.</p>`,`<p>Este enrutador divide entre cero en la primera petición y, una vez parcheado, se queda atascado en un prompt.</p>`],
      code:`guess = passes / (passes + fails)
arm = np.argmax(guess)`, legend:["Which replacement fixes both problems?","¿Qué sustitución arregla los dos problemas?"],
      opts:[ {t:["<code>guess = rng.beta(1 + passes, 1 + fails)</code>","<code>guess = rng.beta(1 + passes, 1 + fails)</code>"], ok:true, why:["Drawing from the Beta belief works with zero data, because the prior adds 1 to each count. The randomness of the draw is also what keeps the router exploring.","Sortear de la creencia Beta funciona sin datos, porque el prior suma 1 a cada recuento. El azar del sorteo es además lo que mantiene al enrutador explorando."]},
        {t:["<code>guess = passes / (passes + fails + 1)</code>","<code>guess = passes / (passes + fails + 1)</code>"], why:["That removes the division by zero. The router is still greedy: it follows the current best estimate and can lock onto an early lucky prompt.","Eso elimina la división entre cero. El enrutador sigue siendo codicioso: sigue la mejor estimación actual y puede quedarse con un prompt afortunado al principio."]},
        {t:["<code>guess = rng.random(3)</code>","<code>guess = rng.random(3)</code>"], why:["That picks a prompt completely at random forever. It explores and never uses what it has learned.","Eso elige un prompt totalmente al azar para siempre. Explora y nunca usa lo que ha aprendido."]} ] } ],
  apply:{ seed:192, title:["Is C really the best?","¿De verdad C es el mejor?"],
    body:[`<p>An even three-way test routed 4,000 requests across prompts A, B and C. C has the highest pass rate. Before switching all traffic, you want to know how sure you can be.</p>`,`<p>Una prueba a tres bandas repartió 4000 peticiones a partes iguales entre los prompts A, B y C. C tiene la tasa de aciertos más alta. Antes de pasar todo el tráfico, quieres saber cuánta seguridad puedes tener.</p>`],
    cols:["request_id","prompt","passed"],
    gen:(r) => Array.from({length:4000}, (_,i) => { const p = r.pick(["A","B","C"]); return {request_id:"req-"+pad(i+1), prompt:p, passed:r.u()<{A:.70,B:.72,C:.735}[p]}; }),
    task:["Set <code>answer</code> to the probability (between 0 and 1) that prompt C has the highest true pass rate of the three.","Asigna a <code>answer</code> la probabilidad (entre 0 y 1) de que el prompt C tenga la tasa real más alta de los tres."],
    hint:["Each row of <code>draws</code> is one plausible world. <code>draws.argmax(axis=1)</code> gives the best prompt in each world, and C is column 2.","Cada fila de <code>draws</code> es un mundo plausible. <code>draws.argmax(axis=1)</code> da el mejor prompt de cada mundo, y C es la columna 2."],
    py:`import numpy as np

counts = df.groupby("prompt")["passed"].agg(["sum", "count"])
print(counts.assign(rate=(counts["sum"] / counts["count"]).round(3)))
passes = counts["sum"].to_numpy()
fails = (counts["count"] - counts["sum"]).to_numpy()

rng = np.random.default_rng(seed=3)
#~ 20,000 plausible worlds: one true pass rate per prompt in each (columns A, B, C) ~~ 20 000 mundos plausibles: una tasa real por prompt en cada uno (columnas A, B, C)
draws = rng.beta(1 + passes, 1 + fails, size=(20_000, 3))

#~ YOUR TURN: in what share of those worlds is C (column 2) the best? ~~ TU TURNO: ¿en qué proporción de esos mundos C (columna 2) es el mejor?
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...","answer = (draws.argmax(axis=1) == 2).mean()"]],
    check: chk(`(draws.argmax(axis=1) == 2).mean()`, {rate:`passes[2] / (passes[2] + fails[2])`, beats:`(draws[:, 2] > draws[:, 0]).mean()`, mean:`draws[:, 2].mean()`, pct:`(draws.argmax(axis=1) == 2).mean() * 100`}, {e:`round(_e * 100, 1)`, b:`round(float((draws.argmax(axis=1) == 1).mean()) * 100, 1)`}),
    ok:["C is the best prompt with {e}% probability; B still has {b}%. That is a statement you can act on: decide what certainty a full switch needs, and keep routing with Thompson sampling until you reach it.","C es el mejor prompt con un {e} % de probabilidad; a B aún le queda un {b} %. Es una afirmación sobre la que puedes actuar: decide cuánta certeza exige el cambio completo y sigue enrutando con muestreo de Thompson hasta alcanzarla."],
    msgs:{ type:TYPE_MSG, pct:PCT_MSG, rate:["That is C's observed pass rate. The task asks how likely it is that C is the best of the three, which compares the columns of <code>draws</code> row by row.","Esa es la tasa observada de C. La tarea pregunta por la probabilidad de que C sea el mejor de los tres, y eso compara las columnas de <code>draws</code> fila a fila."],
      beats:["That is the probability that C beats A. C must also beat B in the same world.","Esa es la probabilidad de que C supere a A. C también tiene que superar a B en el mismo mundo."],
      mean:["That is the average plausible pass rate of C. Compare C with the other two columns in every row.","Esa es la tasa plausible media de C. Compara C con las otras dos columnas en cada fila."] },
    tests:[[[["answer = ...","answer = passes[2] / (passes[2] + fails[2])"]],"rate"],[[["answer = ...","answer = (draws[:, 2] > draws[:, 0]).mean()"]],"beats"]] },
  recap:{ takes:[["<b>Fixed tests waste traffic and punish peeking.</b> An even split keeps sending users to weak options until the end.","<b>Las pruebas fijas desperdician tráfico y castigan mirar antes de tiempo.</b> Un reparto a partes iguales sigue mandando usuarios a opciones flojas hasta el final."],
      ["<b>A bandit learns while it serves.</b> Thompson sampling draws from each belief and follows the highest draw.","<b>Un bandit aprende mientras sirve.</b> El muestreo de Thompson sortea de cada creencia y sigue el sorteo más alto."],
      ["<b>Uncertainty drives exploration.</b> Wide beliefs get tried; once they narrow, traffic settles on the best option.","<b>La incertidumbre impulsa la exploración.</b> Las creencias anchas se prueban; cuando se estrechan, el tráfico se asienta en la mejor opción."]],
    f:[`<button class="sym" data-g="p1">θ<sub>i</sub></button> drawn from Beta(1 + <button class="sym" data-g="p1">passes<sub>i</sub></button>, 1 + <button class="sym" data-g="p1">fails<sub>i</sub></button>) &nbsp;→&nbsp; route to the largest θ<sub>i</sub>`, `<button class="sym" data-g="p1">θ<sub>i</sub></button> sorteado de Beta(1 + <button class="sym" data-g="p1">aciertos<sub>i</sub></button>, 1 + <button class="sym" data-g="p1">fallos<sub>i</sub></button>) &nbsp;→&nbsp; se enruta al θ<sub>i</sub> más alto`],
    read:["Read it as: for each prompt draw one plausible pass rate from its belief, then send the request to the prompt with the highest draw.","Léela así: para cada prompt saca una tasa plausible de su creencia y manda la petición al prompt con el sorteo más alto."],
    syms:[ {s:"θ<sub>i</sub>", g:"p1", d:["Said \"theta\". One random draw from the curve of prompt i.","Se lee «theta». Un sorteo al azar de la curva del prompt i."]},
      {s:"passes, fails", g:"p1", d:["The counts in the table under the chart. They shape each curve.","Los recuentos de la tabla bajo el gráfico. Dan forma a cada curva."]} ],
    next:["Advanced 6 turns to embeddings: measuring similarity and noticing when production traffic drifts.","Avanzado 6 pasa a los embeddings: medir la similitud y notar cuándo se desplaza el tráfico de producción."],
    deeper:[SRC.ax, SRC.st("bayesian-inference","Bayesian Inference","Inferencia bayesiana")] },
  gloss:[ [["Bandit","Bandit (bandido multibrazo)"],["An algorithm that chooses between options repeatedly, learning which is best while limiting the cost of trying the others.","Un algoritmo que elige entre opciones una y otra vez, aprende cuál es la mejor y limita el coste de probar las demás."],"hook"],
    [["Thompson sampling","Muestreo de Thompson"],["A bandit method: draw one value from each option's belief and choose the option with the highest draw.","Un método bandit: saca un valor de la creencia de cada opción y elige la opción con el sorteo más alto."],"p1"],
    [["Explore and exploit","Explorar y explotar"],["Exploring is trying uncertain options to learn. Exploiting is using the option that currently looks best.","Explorar es probar opciones inciertas para aprender. Explotar es usar la opción que ahora parece mejor."],"p1"] ]
});

/* ================= Advanced 6 ================= */
L({ id:"a6", title:["Embeddings and drift","Embeddings y deriva"], q:["Has my production traffic shifted?","¿Ha cambiado mi tráfico de producción?"],
  hook:{ answer:1, title:["The retriever started returning odd documents","El recuperador empezó a devolver documentos raros"],
    body:[`<p>Your RAG system turns every text into an <dfn>embedding</dfn>: a list of numbers, a vector, placed so that texts with similar meaning point in similar directions. Retrieval ranks documents by how similar their vectors are to the query's vector.</p><p>One long document keeps ranking first for unrelated queries. Its vector happens to be ten times longer than the others.</p>`,
      `<p>Tu sistema RAG convierte cada texto en un <dfn>embedding</dfn>: una lista de números, un vector, colocado de forma que los textos de significado parecido apunten en direcciones parecidas. La recuperación ordena los documentos según lo similares que son sus vectores al vector de la consulta.</p><p>Un documento largo sigue saliendo primero para consultas que no tienen que ver. Su vector resulta ser diez veces más largo que los demás.</p>`],
    legend:["Predict: you multiply a document's vector by 10. What happens to its cosine similarity with the query?","Predice: multiplicas por 10 el vector de un documento. ¿Qué le pasa a su similitud coseno con la consulta?"],
    opts:[["It becomes 10 times larger","Se hace 10 veces mayor"],["It stays exactly the same","Se queda exactamente igual"],["It gets smaller","Se hace más pequeña"]],
    reveal:["Change only the length slider: the cosine similarity does not move, and the dot product does. Cosine looks at direction alone, which is why it is the usual choice for ranking.","Cambia solo el control de longitud: la similitud coseno no se mueve y el producto escalar sí. El coseno mira solo la dirección, y por eso es la opción habitual para ordenar."] },
  plays:[
    { w:"cosine", title:["Point two vectors at each other","Apunta dos vectores uno hacia el otro"],
      intro:[`<p>Real embeddings have hundreds of dimensions. Two are enough to see the idea. <dfn>Cosine similarity</dfn> is 1 when two vectors point the same way, 0 when they are at right angles, and −1 when they point in opposite directions. Drag the arrow tips, then change the document's length.</p>`,`<p>Los embeddings reales tienen cientos de dimensiones. Dos bastan para ver la idea. La <dfn>similitud coseno</dfn> vale 1 cuando dos vectores apuntan en la misma dirección, 0 cuando forman un ángulo recto y −1 cuando apuntan en sentidos opuestos. Arrastra las puntas de las flechas y después cambia la longitud del documento.</p>`],
      notice:["the cosine depends only on the angle between the arrows. The dot product also grows with length, so a long vector can outrank a better-aligned short one.","el coseno depende solo del ángulo entre las flechas. El producto escalar crece además con la longitud, así que un vector largo puede quedar por delante de uno corto mejor alineado."],
      done:["Similarity of meaning is similarity of direction.","La similitud de significado es similitud de dirección."] },
    { w:"drift", title:["Compare this week with last month","Compara esta semana con el mes pasado"],
      intro:[`<p>For every request, measure how similar it is to the nearest topic your system knows. Last month's values form the grey baseline. <dfn>Drift</dfn> means this week's distribution has moved away from it. Push either slider until the alert fires.</p>`,`<p>Para cada petición, mide lo similar que es al tema más cercano que conoce tu sistema. Los valores del mes pasado forman la referencia gris. <dfn>Deriva</dfn> significa que la distribución de esta semana se ha alejado de ella. Empuja cualquiera de los dos controles hasta que salte la alerta.</p>`],
      notice:["two different things move the score. A small shift of everything is gradual drift. A second hump on the left is a new topic: requests unlike anything seen before, called <dfn>out-of-distribution</dfn>.","dos cosas distintas mueven el indicador. Un pequeño desplazamiento de todo es deriva gradual. Una segunda joroba a la izquierda es un tema nuevo: peticiones que no se parecen a nada visto antes, llamadas <dfn>fuera de distribución</dfn>."],
      done:["Monitoring distributions catches a change in your users before your eval scores show it. Your eval set still describes last month's traffic.","Vigilar las distribuciones detecta un cambio en tus usuarios antes de que lo muestren tus puntuaciones. Tu conjunto de eval sigue describiendo el tráfico del mes pasado."] } ],
  code:{ title:["Cosine similarity from scratch","Similitud coseno desde cero"],
    intro:[`<p>The dot product multiplies matching entries and adds them up. Dividing by both lengths removes the effect of length. <code>np.linalg.norm</code> gives a vector's length. Fill the gap.</p>`,`<p>El producto escalar multiplica las entradas correspondientes y las suma. Dividir por las dos longitudes elimina el efecto de la longitud. <code>np.linalg.norm</code> da la longitud de un vector. Rellena el hueco.</p>`],
    py:`import numpy as np

def cosine(u, v):
    #~ GAP: dot product divided by the length of u times the length of v ~~ HUECO: producto escalar dividido por la longitud de u por la longitud de v
    return np.dot(u, v) / (np.linalg.norm(u) * np.linalg.____(v))

query = np.array([0.9, 0.1, 0.3])
docs = {
    "refund policy": np.array([0.8, 0.2, 0.4]),
    "refund policy, vector 10x longer": np.array([8.0, 2.0, 4.0]),
    "pasta recipe": np.array([0.1, 0.9, 0.2]),
}
for name, vec in docs.items():
    print(f"cosine {cosine(query, vec):.3f} | dot product {np.dot(query, vec):5.2f} | {name}")
`,
    dart:`import 'dart:math';

double dot(List<double> u, List<double> v) {
  var s = 0.0;
  for (var i = 0; i < u.length; i++) {
    s += u[i] * v[i];
  }
  return s;
}

double norm(List<double> u) => sqrt(dot(u, u)); //~ the length of a vector ~~ la longitud de un vector

//~ direction only: divide by both lengths ~~ solo la dirección: divide por las dos longitudes
double cosine(List<double> u, List<double> v) => dot(u, v) / (norm(u) * norm(v));

void main() {
  final query = [0.9, 0.1, 0.3];
  final docs = {
    'refund policy': [0.8, 0.2, 0.4],
    'refund policy, vector 10x longer': [8.0, 2.0, 4.0],
    'pasta recipe': [0.1, 0.9, 0.2],
  };
  docs.forEach((name, vec) {
    final c = cosine(query, vec).toStringAsFixed(3);
    final d = dot(query, vec).toStringAsFixed(2);
    print('cosine $c | dot product $d | $name');
  });
}
`,
    sol:[["____","norm"]], check:`"ok" if abs(cosine(np.array([1.0, 0.0]), np.array([2.0, 0.0])) - 1) < 1e-9 and abs(cosine(np.array([1.0, 0.0]), np.array([0.0, 3.0]))) < 1e-9 else "no"`,
    ok:["The two refund vectors get the same cosine, 0.98, although one is ten times longer. Their dot products differ by a factor of ten. The pasta recipe points elsewhere and scores about 0.27.","Los dos vectores de reembolsos obtienen el mismo coseno, 0.98, aunque uno es diez veces más largo. Sus productos escalares difieren en un factor de diez. La receta de pasta apunta a otro sitio y saca alrededor de 0.27."],
    msgs:{ err:["The error names an attribute that does not exist in <code>np.linalg</code>. The function for a vector's length is the same one used for <code>u</code> on that line.","El error nombra un atributo que no existe en <code>np.linalg</code>. La función que da la longitud de un vector es la misma que se usa con <code>u</code> en esa línea."] },
    tests:[["length","err"]] },
  qs:[
    { kind:"mc", title:["A request unlike the others","Una petición distinta a las demás"], body:[`<p>Typical requests have a similarity of about 0.7 to their nearest known topic. A new request scores 0.31.</p>`,`<p>Las peticiones típicas tienen una similitud de alrededor de 0,7 con su tema conocido más cercano. Una petición nueva saca 0,31.</p>`], legend:["What is the sensible way to handle it?","¿Cuál es la forma sensata de tratarla?"],
      opts:[ {t:["Answer as usual. The model is generally capable","Responder como siempre. El modelo es capaz en general"], why:["Your evals measured quality on requests like the old ones. This one is unlike them, so those scores say nothing about it. That is epistemic uncertainty, from Advanced 3.","Tus evals midieron la calidad en peticiones como las antiguas. Esta no se les parece, así que esas puntuaciones no dicen nada sobre ella. Es incertidumbre epistémica, la de Avanzado 3."]},
        {t:["Treat it as out-of-distribution: route it to a fallback or a human, and log it","Tratarla como fuera de distribución: mandarla a una alternativa o a una persona, y registrarla"], ok:true, why:["A low similarity to everything known is a cheap signal that the system is outside tested territory. Logged cases also become next month's eval cases.","Una similitud baja con todo lo conocido es una señal barata de que el sistema está fuera del territorio probado. Los casos registrados se convierten además en los casos de eval del mes siguiente."]},
        {t:["Reject it as spam","Rechazarla como spam"], why:["Unfamiliar is not the same as malicious. New topics often come from real users with new needs.","Desconocida no es lo mismo que maliciosa. Los temas nuevos suelen venir de usuarios reales con necesidades nuevas."]} ] },
    { kind:"predict", run:true, title:["Right angles and same direction","Ángulo recto y misma dirección"], code:`import numpy as np
u = np.array([1.0, 0.0])
v = np.array([0.0, 5.0])
w = np.array([3.0, 0.0])
cos = lambda a, b: np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
print(cos(u, v), cos(u, w))`,
      opts:[ {t:"0.0 1.0", ok:true, why:["u and v are at right angles, so their cosine is 0 whatever their lengths. u and w point the same way, so the cosine is 1 even though w is three times longer.","u y v forman un ángulo recto, así que su coseno es 0 sean cuales sean sus longitudes. u y w apuntan en la misma dirección, así que el coseno es 1 aunque w sea tres veces más largo."]},
        {t:"0.0 3.0", why:["3.0 is the dot product of u and w. Dividing by the two lengths, 1 and 3, brings it to 1.0. A cosine never exceeds 1.","3.0 es el producto escalar de u y w. Al dividir por las dos longitudes, 1 y 3, queda en 1.0. Un coseno nunca supera 1."]},
        {t:"5.0 3.0", why:["Those are the lengths of v and w. The cosine compares directions.","Esas son las longitudes de v y w. El coseno compara direcciones."]},
        {t:"1.0 0.0", why:["The two are swapped. u and v share no direction at all; u and w share it completely.","Están intercambiados. u y v no comparten ninguna dirección; u y w la comparten por completo."]} ] },
    { kind:"fix", title:["The long document always wins","El documento largo siempre gana"], body:[`<p><code>docs</code> has one embedding per row. This ranking keeps returning the same few long documents.</p>`,`<p><code>docs</code> tiene un embedding por fila. Esta ordenación sigue devolviendo los mismos pocos documentos largos.</p>`],
      code:`scores = docs @ query          # one score per document
best = scores.argmax()`, legend:["Which change ranks by meaning?","¿Qué cambio ordena por significado?"],
      opts:[ {t:["<code>scores = (docs @ query) / (np.linalg.norm(docs, axis=1) * np.linalg.norm(query))</code>","<code>scores = (docs @ query) / (np.linalg.norm(docs, axis=1) * np.linalg.norm(query))</code>"], ok:true, why:["<code>docs @ query</code> is a dot product per document, which grows with the length of each vector. Dividing by the lengths turns it into cosine similarity.","<code>docs @ query</code> es un producto escalar por documento, que crece con la longitud de cada vector. Dividir por las longitudes lo convierte en similitud coseno."]},
        {t:["<code>best = scores.argmin()</code>","<code>best = scores.argmin()</code>"], why:["That returns the least similar document by the same length-biased score.","Eso devuelve el documento menos similar según la misma puntuación sesgada por la longitud."]},
        {t:["<code>scores = docs.sum(axis=1)</code>","<code>scores = docs.sum(axis=1)</code>"], why:["That ignores the query entirely and ranks documents by the sum of their own numbers.","Eso ignora por completo la consulta y ordena los documentos por la suma de sus propios números."]} ] } ],
  apply:{ seed:203, title:["How much of this week is unfamiliar?","¿Cuánto de esta semana es desconocido?"],
    body:[`<p>Each row is one request with its similarity to the nearest known topic: 1,000 from last month, the baseline, and 500 from this week.</p>`,`<p>Cada fila es una petición con su similitud al tema conocido más cercano: 1000 del mes pasado, la referencia, y 500 de esta semana.</p>`],
    cols:["request_id","week","sim_to_known"],
    gen:(r) => Array.from({length:1500}, (_,i) => { const base = i < 1000, nw = !base && r.u() < 0.25; return {request_id:"req-"+pad(i+1), week:base?"baseline":"this_week", sim_to_known:Math.min(.99, Math.max(.05, (nw?.42:base?.70:.69)+(nw?.07:.08)*r.n())).toFixed(3)}; }),
    task:["The threshold is the 5th percentile of the <b>baseline</b> similarities. Set <code>answer</code> to the share (between 0 and 1) of <b>this week's</b> requests below it.","El umbral es el percentil 5 de las similitudes de <b>baseline</b>. Asigna a <code>answer</code> la proporción (entre 0 y 1) de las peticiones de <b>esta semana</b> que quedan por debajo."],
    hint:["<code>threshold</code> is already computed from the baseline. Compare this week's values with it: <code>(now &lt; threshold).mean()</code>.","<code>threshold</code> ya está calculado con la referencia. Compara con él los valores de esta semana: <code>(now &lt; threshold).mean()</code>."],
    py:`import numpy as np

base = df[df["week"] == "baseline"]["sim_to_known"].to_numpy()
now = df[df["week"] == "this_week"]["sim_to_known"].to_numpy()
print(f"mean similarity: baseline {base.mean():.3f}, this week {now.mean():.3f}")

#~ Out-of-distribution line: only 5% of baseline requests fall below it ~~ Línea de fuera de distribución: solo el 5 % de las peticiones de referencia queda por debajo
threshold = np.percentile(base, 5)
print("threshold:", round(threshold, 3))

#~ YOUR TURN: share of this week's requests below the threshold ~~ TU TURNO: proporción de peticiones de esta semana por debajo del umbral
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...","answer = (now < threshold).mean()"]],
    check: chk(`(_now < _n.percentile(_base, 5)).mean()`, {base:`(_base < _n.percentile(_base, 5)).mean()`, all:`(_now < _n.percentile(df["sim_to_known"], 5)).mean()`, count:`(_now < _n.percentile(_base, 5)).sum()`, pct:`(_now < _n.percentile(_base, 5)).mean() * 100`}, {e:`round(_e * 100, 1)`}, "1e-9", `_base = df[df["week"] == "baseline"]["sim_to_known"].to_numpy(); _now = df[df["week"] == "this_week"]["sim_to_known"].to_numpy()`),
    ok:["{e}% of this week's requests are out-of-distribution, against 5% in the baseline. The mean similarity dropped by less than 0.1, which is easy to wave away, so look at the distribution. More than a quarter of this week's users are asking about something your evals have never covered.","El {e} % de las peticiones de esta semana está fuera de distribución, frente al 5 % de la referencia. La similitud media bajó menos de 0,1, algo fácil de pasar por alto, así que mira la distribución. Más de una cuarta parte de los usuarios de esta semana pregunta por algo que tus evals nunca han cubierto."],
    msgs:{ type:TYPE_MSG, pct:PCT_MSG, base:["That is the share of baseline requests below the threshold, which is 5% by construction. Apply the threshold to this week's values.","Esa es la proporción de peticiones de referencia por debajo del umbral, que es el 5 % por construcción. Aplica el umbral a los valores de esta semana."],
      all:["You computed the threshold from all rows, this week's included. The reference must come from the baseline only, or the new traffic moves its own alarm line.","Has calculado el umbral con todas las filas, incluidas las de esta semana. La referencia debe salir solo de baseline; si no, el tráfico nuevo mueve su propia línea de alarma."],
      count:["That is how many requests are below the threshold. Divide by the number of requests this week, or take the mean of the True/False values.","Eso es cuántas peticiones quedan por debajo del umbral. Divide por el número de peticiones de esta semana, o toma la media de los valores True/False."] },
    tests:[[[["answer = ...","answer = (base < threshold).mean()"]],"base"],[[["answer = ...","answer = (now < threshold).sum()"]],"count"]] },
  recap:{ takes:[["<b>Embeddings turn meaning into direction.</b> Cosine similarity compares directions and ignores length.","<b>Los embeddings convierten el significado en dirección.</b> La similitud coseno compara direcciones e ignora la longitud."],
      ["<b>Low similarity to everything known flags the unfamiliar.</b> Out-of-distribution requests are where your evals say least.","<b>Una similitud baja con todo lo conocido señala lo desconocido.</b> Las peticiones fuera de distribución son donde menos dicen tus evals."],
      ["<b>Monitor distributions over time.</b> Compare this week's histogram with a baseline, and alert on a drift score such as PSI.","<b>Vigila las distribuciones en el tiempo.</b> Compara el histograma de esta semana con una referencia y alerta con un indicador de deriva como el PSI."]],
    f:`cos(<button class="sym" data-g="p1">u</button>, <button class="sym" data-g="p1">v</button>) = <button class="sym" data-g="p1">u · v</button> / (<button class="sym" data-g="p1">|u|</button> × |v|)`,
    read:["Read it as: multiply matching entries and add them up, then divide by the length of each vector.","Léela así: multiplica las entradas correspondientes y súmalas, y después divide por la longitud de cada vector."],
    syms:[ {s:"u, v", g:"p1", d:["The two arrows: the query and the document embeddings.","Las dos flechas: los embeddings de la consulta y del documento."]},
      {s:"u · v", g:"p1", d:["The dot product readout, which changes with length.","El dato del producto escalar, que cambia con la longitud."]},
      {s:"|u|", g:"p1", d:["The length of a vector: the length slider for the document.","La longitud de un vector: el control de longitud del documento."]} ],
    next:["The capstone puts the whole course to work: audit an eval report against its raw data.","El proyecto final pone en práctica todo el curso: audita un informe de evaluación con sus datos en bruto."],
    deeper:[SRC.ax, SRC.rp] },
  gloss:[ [["Embedding","Embedding"],["A list of numbers (a vector) representing a text, placed so that similar meanings point in similar directions.","Una lista de números (un vector) que representa un texto, colocada de forma que los significados parecidos apunten en direcciones parecidas."],"hook"],
    [["Cosine similarity","Similitud coseno"],["A measure from −1 to 1 of how closely two vectors point in the same direction, ignoring their lengths.","Una medida de −1 a 1 de lo parecida que es la dirección de dos vectores, sin tener en cuenta sus longitudes."],"p1"],
    [["Drift (distribution shift)","Deriva (cambio de distribución)"],["A change over time in the data a system receives, compared with the data it was built and tested on.","Un cambio con el tiempo en los datos que recibe un sistema, respecto a los datos con los que se construyó y se probó."],"p2"],
    [["Out-of-distribution","Fuera de distribución"],["An input unlike the data a system was built and tested on.","Una entrada que no se parece a los datos con los que se construyó y se probó un sistema."],"p2"] ]
});

/* ================= Advanced 7: capstone ================= */
const A7_FACTS = (rows) => { const A = rows.filter(r => r.prompt === "A"), B = rows.filter(r => r.prompt === "B"), ids = new Set(B.map(r => r.case_id)), As = A.filter(r => ids.has(r.case_id));
  const rate = (a) => Math.round(a.filter(r => r.passed).length / a.length * 1000) / 10, med = (a) => { const s = a.map(r => r.output_tokens).sort((x,y) => x-y); return s[Math.floor(s.length/2)]; };
  return {nA:A.length, nB:B.length, miss:A.length-B.length, aAll:rate(A), bAll:rate(B), aSh:rate(As), gap:Math.round((rate(B)-rate(A))*10)/10, gapSh:Math.round((rate(B)-rate(As))*10)/10, medA:med(A), medB:med(B)}; };
L({ id:"a7", title:["Capstone: audit an eval report","Proyecto final: audita un informe de evaluación"], q:["Can I recompute every number in this write-up?","¿Puedo recalcular cada número de este informe?"],
  hook:{ answer:2, title:["A write-up lands in your inbox","Te llega un informe"],
    body:[`<p>A teammate proposes shipping prompt B. The write-up says: both prompts were evaluated on 400 cases, B improves the pass rate by a wide margin, the improvement is significant with p = 0.02, and B was the best of 12 variants tried. The raw results are attached.</p><p>An audit recomputes every claimed number from the raw data and checks that the method fits the design. You have every tool you need from this course.</p>`,
      `<p>Un compañero propone desplegar el prompt B. El informe dice: los dos prompts se evaluaron con 400 casos, B mejora la tasa de aciertos con mucho margen, la mejora es significativa con p = 0,02 y B fue la mejor de 12 variantes probadas. Los resultados en bruto van adjuntos.</p><p>Una auditoría recalcula cada número afirmado a partir de los datos en bruto y comprueba que el método encaja con el diseño. Tienes todas las herramientas que necesitas de este curso.</p>`],
    legend:["Predict: what do you check first?","Predice: ¿qué compruebas primero?"],
    opts:[["Whether the p-value was computed correctly","Si el valor p está bien calculado"],["Whether the improvement is large enough to matter","Si la mejora es lo bastante grande para importar"],["Whether the sample sizes in the data match the ones in the text","Si los tamaños de muestra de los datos coinciden con los del texto"]],
    reveal:["Start with the counts. Here prompt B has far fewer rows than the text claims, and everything downstream, the rates, the gap and the test, was computed on mismatched sets of cases.","Empieza por los recuentos. Aquí el prompt B tiene muchas menos filas de las que dice el texto, y todo lo que viene después, las tasas, la diferencia y el contraste, se calculó con conjuntos de casos que no coinciden."] },
  plays:[ { w:"audit", doneTitle:["Audit complete.","Auditoría completa."], title:["Check the write-up claim by claim","Revisa el informe afirmación por afirmación"],
      a:{ facts:A7_FACTS, claims:[
        { bad:true, q:["“We evaluated both prompts on 400 cases.”","«Evaluamos los dos prompts con 400 casos.»"], f:["prompt A has {nA} rows, prompt B has {nB} rows.","el prompt A tiene {nA} filas y el prompt B tiene {nB}."],
          why:["{miss} cases have no result for B. They were dropped, and the text does not say so. Mismatched sample sizes are the first thing an audit looks for.","{miss} casos no tienen resultado para B. Se descartaron y el texto no lo dice. Los tamaños de muestra que no coinciden son lo primero que busca una auditoría."],
          hint:["Compare the row counts with the number in the sentence.","Compara los recuentos de filas con el número de la frase."] },
        { bad:true, q:["“Pass rate improved from {aAll}% to {bAll}%.”","«La tasa de aciertos mejoró del {aAll} % al {bAll} %.»"], f:["A on all {nA} cases: {aAll}%. B on its {nB} cases: {bAll}%. A on those same {nB} cases: {aSh}%.","A en los {nA} casos: {aAll} %. B en sus {nB} casos: {bAll} %. A en esos mismos {nB} casos: {aSh} %."],
          why:["Both numbers are computed correctly and compared unfairly. The cases B skipped were the hard ones. On the cases both prompts ran, the gap is {gapSh} points, not {gap}.","Los dos números están bien calculados y mal comparados. Los casos que B se saltó eran los difíciles. En los casos que ejecutaron los dos prompts, la diferencia es de {gapSh} puntos, no de {gap}."],
          hint:["The two rates come from different sets of cases. Look at A on the cases B actually ran.","Las dos tasas salen de conjuntos de casos distintos. Mira A en los casos que B sí ejecutó."] },
        { bad:false, q:["“B's replies are shorter: median {medB} output tokens against {medA}.”","«Las respuestas de B son más cortas: mediana de {medB} tokens de salida frente a {medA}.»"], f:["median output_tokens is {medA} for A and {medB} for B.","la mediana de output_tokens es {medA} para A y {medB} para B."],
          why:["The recomputed medians match the text. Not every claim in a flawed report is wrong, and an audit says so.","Las medianas recalculadas coinciden con el texto. No todas las afirmaciones de un informe con fallos son falsas, y una auditoría lo dice."],
          hint:["Compare the recomputed medians with the sentence. Do they differ?","Compara las medianas recalculadas con la frase. ¿Hay diferencia?"] },
        { bad:true, q:["“The improvement is significant (two-sample test, p = 0.02).”","«La mejora es significativa (contraste de dos muestras, p = 0,02).»"], f:["the same case_id values appear under both prompts. {nB} cases have results for both.","los mismos valores de case_id aparecen con los dos prompts. {nB} casos tienen resultado con ambos."],
          why:["The design is paired, so a two-sample test is the wrong tool, and it was run on mismatched sets. You will recompute the right test in the Apply step.","El diseño es emparejado, así que un contraste de dos muestras es la herramienta equivocada, y además se ejecutó con conjuntos que no coinciden. Recalcularás el contraste correcto en el paso Aplica."],
          hint:["Each case was run with both prompts. Which kind of test fits that design?","Cada caso se ejecutó con los dos prompts. ¿Qué tipo de contraste encaja con ese diseño?"] },
        { bad:true, q:["“B was the best of the 12 variants we tried on these cases.”","«B fue la mejor de las 12 variantes que probamos con estos casos.»"], f:["12 variants were scored on the same cases, and the highest scorer was reported on those cases.","se puntuaron 12 variantes con los mismos casos y se presentó la de mayor puntuación con esos mismos casos."],
          why:["The best of 12 looks better than it is on the cases it was selected on. The claim needs a held-out set or a corrected threshold.","La mejor de 12 parece mejor de lo que es en los casos con los que se seleccionó. La afirmación necesita un conjunto reservado o un umbral corregido."],
          hint:["Think of Advanced 2: what happens to the best of many noisy scores?","Piensa en Avanzado 2: ¿qué le pasa a la mejor de muchas puntuaciones ruidosas?"] } ] },
      intro:[`<p>Each card holds one sentence from the write-up and what the raw data shows. Mark each claim as holding up or as a problem.</p>`,`<p>Cada tarjeta contiene una frase del informe y lo que muestran los datos en bruto. Marca cada afirmación como que se sostiene o como problema.</p>`],
      notice:["no number in the write-up was invented. Each problem comes from what was compared with what, and from which method was applied to which design.","ningún número del informe es inventado. Cada problema viene de qué se comparó con qué y de qué método se aplicó a qué diseño."],
      done:["Four problems and one sound claim. Next you recompute the comparison properly.","Cuatro problemas y una afirmación sólida. Ahora recalcularás la comparación como es debido."] } ],
  code:{ data:true, pkgs:["numpy","pandas"], title:["Recompute on the cases both prompts ran","Recalcula con los casos que ejecutaron los dos prompts"],
    intro:[`<p>The raw results are loaded as <code>df</code>. Count rows per prompt, then restrict both prompts to the cases they share. Fill the gap with the index method that keeps what two indexes have in common.</p>`,`<p>Los resultados en bruto están cargados como <code>df</code>. Cuenta las filas por prompt y después limita los dos prompts a los casos que comparten. Rellena el hueco con el método de índices que conserva lo que dos índices tienen en común.</p>`],
    py:`import pandas as pd

#~ df: the raw results behind the write-up ~~ df: los resultados en bruto que hay detrás del informe
print(df.groupby("prompt")["passed"].agg(["mean", "count"]).round(3))

a = df[df["prompt"] == "A"].set_index("case_id")
b = df[df["prompt"] == "B"].set_index("case_id")
#~ GAP: the cases that BOTH prompts actually ran ~~ HUECO: los casos que ejecutaron de verdad LOS DOS prompts
shared = a.index.____(b.index)
print("cases both prompts ran:", len(shared))
print(f"A on shared cases: {a.loc[shared, 'passed'].mean():.1%}")
print(f"B on shared cases: {b.loc[shared, 'passed'].mean():.1%}")
`,
    dart:`void main() {
  //~ results keyed by case id (a small stand-in for the raw data) ~~ resultados por id de caso (una versión reducida de los datos en bruto)
  final a = {'c1': true, 'c2': true, 'c3': false, 'c4': false, 'c5': true};
  final b = {'c1': true, 'c2': true, 'c5': true};

  double rate(Iterable<bool> xs) => xs.where((x) => x).length / xs.length;
  print('A on all its cases: ' + rate(a.values).toStringAsFixed(2));
  print('B on all its cases: ' + rate(b.values).toStringAsFixed(2));

  //~ the cases that BOTH prompts actually ran ~~ los casos que ejecutaron de verdad LOS DOS prompts
  final shared = a.keys.toSet().intersection(b.keys.toSet());
  final n = shared.length;
  print('cases both prompts ran: $n');
  print('A on shared cases: ' + rate(shared.map((id) => a[id]!)).toStringAsFixed(2));
  print('B on shared cases: ' + rate(shared.map((id) => b[id]!)).toStringAsFixed(2));
}
`,
    sol:[["____","intersection"]], check:`"ok" if len(shared) == len(b) and set(shared) == set(b.index) else "no"`,
    ok:["On the cases both prompts ran, A scores far higher than its overall rate, and the gap to B shrinks to a couple of points. The headline improvement came mostly from B skipping the hard cases.","En los casos que ejecutaron los dos prompts, A puntúa muy por encima de su tasa global y la diferencia con B se reduce a un par de puntos. La mejora del titular venía sobre todo de que B se saltó los casos difíciles."],
    msgs:{ err:["A KeyError here means <code>shared</code> contains cases that prompt B never ran. You need the cases present in both indexes, not in either one.","Un KeyError aquí significa que <code>shared</code> contiene casos que el prompt B nunca ejecutó. Necesitas los casos presentes en los dos índices, no en cualquiera de ellos."] },
    tests:[["union","err"],["difference","err"]] },
  qs:[
    { kind:"mc", title:["Dropped rows","Filas descartadas"], body:[`<p>You ask why B has fewer rows. The answer: "B timed out on some long cases, so we left those out."</p>`,`<p>Preguntas por qué B tiene menos filas. La respuesta: «B dio timeout en algunos casos largos, así que los dejamos fuera».</p>`], legend:["How should those cases be treated?","¿Cómo hay que tratar esos casos?"],
      opts:[ {t:["Leaving them out is fine. No result means no data","Dejarlos fuera está bien. Sin resultado no hay datos"], why:["A timeout is a result: the user got no answer. Dropping it removes exactly the cases where B does worst and inflates its score.","Un timeout es un resultado: el usuario se quedó sin respuesta. Descartarlo elimina justo los casos donde B lo hace peor e infla su puntuación."]},
        {t:["Count them as failures for B, or compare both prompts on the shared cases and report how many were dropped","Contarlos como fallos de B, o comparar los dos prompts con los casos compartidos e informar de cuántos se descartaron"], ok:true, why:["Either choice is honest when stated. What misleads is comparing B on easy cases with A on all cases without saying so.","Las dos opciones son honestas si se declaran. Lo que engaña es comparar B en los casos fáciles con A en todos los casos sin decirlo."]},
        {t:["Fill them in with B's average pass rate","Rellenarlos con la tasa media de aciertos de B"], why:["That assumes B would do as well on the hard cases as on the easy ones, which is the question the eval was meant to answer.","Eso supone que B lo haría igual de bien en los casos difíciles que en los fáciles, que es justo la pregunta que la eval debía responder."]} ] },
    { kind:"predict", run:true, title:["Same prompt, two different scores","Mismo prompt, dos puntuaciones distintas"], code:`import pandas as pd
a = pd.Series([1, 1, 0, 0], index=["c1", "c2", "c3", "c4"])
b = pd.Series([1, 1], index=["c1", "c2"])
shared = a.index.intersection(b.index)
print(a.mean(), b.mean(), a[shared].mean())`,
      opts:[ {t:"0.5 1.0 1.0", ok:true, why:["A passes 2 of its 4 cases. B passes both of its 2 cases. On those same 2 cases A also passes both. B looks twice as good overall and is identical on the cases they share.","A pasa 2 de sus 4 casos. B pasa sus 2 casos. En esos mismos 2 casos, A también pasa los dos. B parece el doble de bueno en conjunto y es idéntico en los casos que comparten."]},
        {t:"0.5 1.0 0.5", why:["The last number restricts A to cases c1 and c2, and A passed both of them.","El último número limita A a los casos c1 y c2, y A pasó los dos."]},
        {t:"0.5 0.5 1.0", why:["B has two results, both passes, so its mean is 1.0.","B tiene dos resultados, los dos aciertos, así que su media es 1.0."]},
        {t:"2 2 2", why:["Those are counts of passes. <code>.mean()</code> divides by the number of cases.","Esos son recuentos de aciertos. <code>.mean()</code> divide por el número de casos."]} ] },
    { kind:"fix", title:["The test behind p = 0.02","El contraste que hay detrás de p = 0,02"], body:[`<p><code>a</code> holds 400 results and <code>b</code> holds 238, both indexed by case id. This is the line that produced the write-up's p-value.</p>`,`<p><code>a</code> contiene 400 resultados y <code>b</code> contiene 238, los dos indexados por id de caso. Esta es la línea que produjo el valor p del informe.</p>`],
      code:`p = unpaired_p(a["passed"], b["passed"])`, legend:["Which call fits the data?","¿Qué llamada encaja con los datos?"],
      opts:[ {t:["<code>p = paired_p(a.loc[shared, \"passed\"], b.loc[shared, \"passed\"])</code>","<code>p = paired_p(a.loc[shared, \"passed\"], b.loc[shared, \"passed\"])</code>"], ok:true, why:["Two fixes at once: compare the same cases, and use the test that respects the pairing. Selecting both with <code>shared</code> also lines the rows up case by case.","Dos arreglos a la vez: comparar los mismos casos y usar el contraste que respeta el emparejamiento. Seleccionar los dos con <code>shared</code> alinea además las filas caso a caso."]},
        {t:["<code>p = unpaired_p(a[\"passed\"].sample(238), b[\"passed\"])</code>","<code>p = unpaired_p(a[\"passed\"].sample(238), b[\"passed\"])</code>"], why:["Equal sizes do not make equal cases. A random 238 of A's cases still includes hard ones that B never ran.","Tamaños iguales no significan casos iguales. 238 casos de A al azar siguen incluyendo los difíciles que B nunca ejecutó."]},
        {t:["<code>p = paired_p(a[\"passed\"][:238], b[\"passed\"])</code>","<code>p = paired_p(a[\"passed\"][:238], b[\"passed\"])</code>"], why:["The first 238 rows of A are not the 238 cases B ran, so each pair would compare two different cases.","Las 238 primeras filas de A no son los 238 casos que ejecutó B, así que cada pareja compararía dos casos distintos."]} ] } ],
  apply:{ seed:77, title:["Recompute the p-value and write your findings","Recalcula el valor p y escribe tus conclusiones"],
    body:[`<p>The write-up claims p = 0.02. Run the right test on the right cases and see what the data supports.</p>`,`<p>El informe afirma p = 0,02. Ejecuta el contraste correcto con los casos correctos y mira qué respaldan los datos.</p>`],
    cols:["case_id","prompt","passed","latency_ms","output_tokens"],
    gen:(r) => { const cases = Array.from({length:400}, (_,i) => ({id:"case-"+pad(i+1,3), d:r.u(), u:r.u()})), rows = [];
      cases.forEach(c => rows.push({case_id:c.id, prompt:"A", passed:c.u < 0.95-0.5*c.d, latency_ms:Math.round(1100*Math.exp(.4*r.n())), output_tokens:Math.round(240*Math.exp(.3*r.n()))}));
      cases.forEach(c => { if (c.d > 0.6) return; const u = r.u() < 0.8 ? c.u : r.u(); rows.push({case_id:c.id, prompt:"B", passed:u < 0.97-0.5*c.d, latency_ms:Math.round(1150*Math.exp(.4*r.n())), output_tokens:Math.round(180*Math.exp(.3*r.n()))}); });
      return rows; },
    task:["Set <code>answer</code> to the p-value of a <b>paired</b> test on the <b>shared</b> cases only.","Asigna a <code>answer</code> el valor p de un contraste <b>emparejado</b> solo con los casos <b>compartidos</b>."],
    hint:["Select the same cases from both: <code>paired_p(a[shared].to_numpy(), b[shared].to_numpy())</code>.","Selecciona los mismos casos en los dos: <code>paired_p(a[shared].to_numpy(), b[shared].to_numpy())</code>."],
    py:`import numpy as np

a = df[df["prompt"] == "A"].set_index("case_id")["passed"]
b = df[df["prompt"] == "B"].set_index("case_id")["passed"]
shared = a.index.intersection(b.index)
print(f"A: {len(a)} cases | B: {len(b)} cases | shared: {len(shared)}")

def paired_p(x, y, shuffles=4000):
    #~ swaps the two results inside each case ~~ intercambia los dos resultados dentro de cada caso
    rng = np.random.default_rng(0); obs = abs(y.mean() - x.mean()); hits = 0
    for _ in range(shuffles):
        swap = rng.random(len(x)) < 0.5
        hits += abs(np.where(swap, x, y).mean() - np.where(swap, y, x).mean()) >= obs - 1e-12
    return hits / shuffles

#~ YOUR TURN: a paired test on the shared cases only ~~ TU TURNO: un contraste emparejado solo con los casos compartidos
answer = ...
print("answer =", answer)
`,
    sol:[["answer = ...","answer = paired_p(a[shared].to_numpy(), b[shared].to_numpy())"]],
    check: chk(`paired_p(_as, _bs)`, {mis:`paired_p(a.to_numpy()[:len(b)], b.to_numpy())`}, {p:`round(float(paired_p(_as, _bs)), 3)`, ga:`round(float(_as.mean()) * 100, 1)`, gb:`round(float(_bs.mean()) * 100, 1)`, n:`int(len(_as))`}, "1e-9", `_sh = a.index.intersection(b.index); _as = a[_sh].to_numpy(); _bs = b[_sh].to_numpy()`),
    ok:["On the {n} shared cases A scores {ga}% and B scores {gb}%, and the paired p-value is {p}, nowhere near the claimed 0.02. The data does not show that B is better. Now write that up below.","En los {n} casos compartidos, A saca un {ga} % y B un {gb} %, y el valor p emparejado es {p}, muy lejos del 0,02 afirmado. Los datos no muestran que B sea mejor. Ahora escríbelo abajo."],
    msgs:{ type:TYPE_MSG, mis:["You paired the first rows of A with B's rows. Those are different cases, so each pair compares unrelated results. Select both with <code>shared</code>.","Has emparejado las primeras filas de A con las filas de B. Son casos distintos, así que cada pareja compara resultados sin relación. Selecciona los dos con <code>shared</code>."],
      err:["If the error mentions shapes that cannot be broadcast, the two arrays have different lengths: 400 against 238. A paired test needs the same cases on both sides.","Si el error habla de formas que no se pueden combinar (broadcast), los dos arrays tienen longitudes distintas: 400 frente a 238. Un contraste emparejado necesita los mismos casos en los dos lados."] },
    tests:[[[["answer = ...","answer = paired_p(a.to_numpy(), b.to_numpy())"]],"err"],[[["answer = ...","answer = paired_p(a.to_numpy()[:len(b)], b.to_numpy())"]],"mis"]],
    extra:(root, l) => {
      const f = A7_FACTS(dataOf(l));
      root.innerHTML = `<h3 style="margin-top:8px">${t(["Write up your findings","Escribe tus conclusiones"])}</h3>
        <p class="caption" style="margin:6px 0">${t(["Three or four sentences for the author: what holds, what does not, and what to do next. Your notes are saved in this browser.","Tres o cuatro frases para quien escribió el informe: qué se sostiene, qué no y qué hacer ahora. Tus notas se guardan en este navegador."])}</p>
        <label class="sr" for="notes">${t(["Findings","Conclusiones"])}</label><textarea class="notes" id="notes" placeholder="${t(["1. Sample sizes: ...\n2. Pass rates: ...\n3. Test: ...\n4. Recommendation: ...","1. Tamaños de muestra: ...\n2. Tasas de aciertos: ...\n3. Contraste: ...\n4. Recomendación: ..."])}"></textarea>
        <details style="margin-top:10px"><summary>${t(["Compare with a model write-up","Comparar con un informe modelo"])}</summary><div class="prose" style="margin-top:10px">${fill(t([
          `<p><b>Sample sizes.</b> The text says 400 cases for both prompts. The data has {nA} rows for A and {nB} for B. {miss} cases are missing for B and the write-up does not mention them.</p><p><b>Pass rates.</b> {aAll}% for A is measured on all cases and {bAll}% for B on its {nB} cases. On those same {nB} cases A scores {aSh}%, so the comparable gap is {gapSh} points.</p><p><b>Test.</b> The design is paired and the reported test was a two-sample test on mismatched sets. A paired test on the shared cases does not support a difference. B was also the best of 12 variants, so its score needs confirmation on held-out cases.</p><p><b>What holds.</b> B's replies are shorter, median {medB} tokens against {medA}.</p><p><b>Recommendation.</b> Do not ship on this evidence. Rerun B on all {nA} cases with timeouts counted as failures, or report both prompts on shared cases, and confirm on a held-out set.</p>`,
          `<p><b>Tamaños de muestra.</b> El texto dice 400 casos para los dos prompts. Los datos tienen {nA} filas para A y {nB} para B. Faltan {miss} casos de B y el informe no los menciona.</p><p><b>Tasas de aciertos.</b> El {aAll} % de A se mide con todos los casos y el {bAll} % de B con sus {nB} casos. En esos mismos {nB} casos, A saca un {aSh} %, así que la diferencia comparable es de {gapSh} puntos.</p><p><b>Contraste.</b> El diseño es emparejado y el contraste presentado fue de dos muestras con conjuntos que no coinciden. Un contraste emparejado con los casos compartidos no respalda una diferencia. Además, B fue la mejor de 12 variantes, así que su puntuación necesita confirmación con casos reservados.</p><p><b>Lo que se sostiene.</b> Las respuestas de B son más cortas: mediana de {medB} tokens frente a {medA}.</p><p><b>Recomendación.</b> No desplegar con esta evidencia. Volver a ejecutar B con los {nA} casos contando los timeouts como fallos, o presentar los dos prompts con los casos compartidos, y confirmar con un conjunto reservado.</p>`]), f)}</div></details>`;
      const ta = $("#notes"); ta.value = S.ans["a7:notes"] || ""; ta.addEventListener("input", () => { S.ans["a7:notes"] = ta.value; save(); });
    } },
  recap:{ takes:[["<b>Recompute before you believe.</b> Start with counts, then rates, then the test. Each step can only be as sound as the one before it.","<b>Recalcula antes de creer.</b> Empieza por los recuentos, sigue con las tasas y acaba con el contraste. Cada paso solo puede ser tan sólido como el anterior."],
      ["<b>Compare like with like.</b> Same cases, same definition of failure, and a test that matches the design.","<b>Compara lo comparable.</b> Los mismos casos, la misma definición de fallo y un contraste que encaje con el diseño."],
      ["<b>Report what holds as well as what does not.</b> An audit that only lists faults is as selective as the write-up it reviews.","<b>Informa de lo que se sostiene y de lo que no.</b> Una auditoría que solo enumera fallos es tan selectiva como el informe que revisa."]],
    f:[`<button class="sym" data-g="p1">claimed number</button> = <button class="sym" data-g="code">recomputed number</button> ? &nbsp;→&nbsp; <button class="sym" data-g="apply">does the method fit the design</button> ?`, `¿<button class="sym" data-g="p1">número afirmado</button> = <button class="sym" data-g="code">número recalculado</button>? &nbsp;→&nbsp; ¿<button class="sym" data-g="apply">encaja el método con el diseño</button>?`],
    read:["Read it as: for every claim, recompute the number from raw data and compare. Then ask whether the method that produced it suits how the data was collected.","Léela así: para cada afirmación, recalcula el número con los datos en bruto y compara. Después pregunta si el método que lo produjo se ajusta a cómo se recogieron los datos."],
    syms:[ {s:"claimed", g:"p1", d:["A sentence from the write-up: one card in the audit.","Una frase del informe: una tarjeta de la auditoría."]},
      {s:"recomputed", g:"code", d:["What your own code prints from <code>df</code>.","Lo que imprime tu propio código a partir de <code>df</code>."]},
      {s:"method", g:"apply", d:["The test and the cases it ran on: paired, on shared cases.","El contraste y los casos con los que se ejecutó: emparejado, con los casos compartidos."]} ],
    deeper:[SRC.ca, SRC.ax, SRC.rp] },
  gloss:[ [["Audit","Auditoría"],["Recomputing every claimed number from the raw data and checking that the method fits the design.","Recalcular cada número afirmado a partir de los datos en bruto y comprobar que el método encaja con el diseño."],"hook"],
    [["Mismatched sample sizes","Tamaños de muestra que no coinciden"],["When the groups being compared contain different numbers of cases, or different cases, than the text states.","Cuando los grupos que se comparan contienen un número de casos, o unos casos, distintos de los que dice el texto."],"p1"] ]
});
