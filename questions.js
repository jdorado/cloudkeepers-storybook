// Every answer and hint is generated from the same numbers, without an AI service.
export const TOPICS = [
  "Place value",
  "Addition",
  "Subtraction",
  "Multiplication",
  "Division",
  "Fractions of amounts",
  "Fractions",
  "Money",
  "Measurement",
  "Time",
  "Shapes & perimeter",
  "Charts",
];
const int = (min, max, r) => Math.floor(r() * (max - min + 1)) + min;
const pick = (items, r) => items[int(0, items.length - 1, r)];
const shuffle = (items, r) => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = int(0, i, r);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const escapeText = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function normaliseAnswer(value) {
  const s = String(value).trim().toLowerCase();
  if (/^\d+\s*\/\s*\d+$/.test(s)) {
    const [a, b] = s.split("/").map(Number);
    return b ? String(a / b) : s;
  }
  if (s !== "" && Number.isFinite(Number(s))) return String(Number(s));
  return s;
}
function counters(n, glyph = "✦") {
  return `<div class="math-counters" aria-label="${n} objects">${Array.from({ length: n }, () => `<span>${glyph}</span>`).join("")}</div>`;
}
function fraction(n, d) {
  return `<div class="fraction-picture" role="img" aria-label="${n} of ${d} equal parts shaded">${Array.from({ length: d }, (_, i) => `<span class="${i < n ? "filled" : ""}"></span>`).join("")}</div>`;
}
function column(a, b, op) {
  return `<div class="column-maths" aria-label="${a} ${op === "+" ? "plus" : "minus"} ${b}"><span>${a}</span><span>${op} ${b}</span><span class="column-line">?</span></div>`;
}
function clock(hour, minute, roman = false) {
  const romans = [
    "XII",
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
  ];
  const end = (angle, len) => [
    100 + Math.sin((angle * Math.PI) / 180) * len,
    100 - Math.cos((angle * Math.PI) / 180) * len,
  ];
  const h = end((hour % 12) * 30 + minute * 0.5, 45),
    m = end(minute * 6, 65);
  return `<svg class="math-clock" viewBox="0 0 200 200" role="img" aria-label="An analogue clock"><circle cx="100" cy="100" r="94" fill="#fff9e7" stroke="#a3b48b" stroke-width="6"/>${Array.from(
    { length: 12 },
    (_, i) => {
      const p = end(i * 30, 77);
      return `<text x="${p[0]}" y="${p[1] + 5}" text-anchor="middle">${roman ? romans[i] : i || 12}</text>`;
    },
  ).join(
    "",
  )}<path d="M100 100L${h[0]} ${h[1]}" stroke="#456a56" stroke-width="7" stroke-linecap="round"/><path d="M100 100L${m[0]} ${m[1]}" stroke="#c7944f" stroke-width="4" stroke-linecap="round"/><circle cx="100" cy="100" r="6" fill="#456a56"/></svg>`;
}
function chart(values, labels) {
  return `<div class="math-chart" role="img" aria-label="${labels.map((x, i) => `${x}: ${values[i]}`).join(", ")}">${values.map((v, i) => `<div><strong>${v}</strong><span style="height:${v * 9 + 8}px;background:${["#9fb789", "#dab986", "#bea9d0"][i]}"></span><small>${labels[i]}</small></div>`).join("")}</div>`;
}
function shape(kind) {
  const shapes = {
    Triangle: '<path d="M100 20 175 145H25Z"/>',
    Square: '<rect x="40" y="30" width="120" height="120" rx="3"/>',
    Rectangle: '<rect x="15" y="45" width="170" height="90" rx="3"/>',
    Circle: '<circle cx="100" cy="90" r="66"/>',
    Cube: '<path d="m100 15 65 35v75l-65 35-65-35V50Z"/><path d="m35 50 65 35 65-35m-65 35v75"/>',
  };
  return `<svg class="math-shape" viewBox="0 0 200 180" role="img" aria-label="A geometric shape"><g fill="#d6e1b8" stroke="#6d8c64" stroke-width="5" stroke-linejoin="round">${shapes[kind]}</g></svg>`;
}

export function generateQuestion(
  topic,
  year = 1,
  level = 0,
  random = Math.random,
  currency = "GBP",
) {
  const r = random,
    N = (a, b) => int(a, b, r),
    P = (a) => pick(a, r),
    y3 = year === 3,
    d = Math.max(0, Math.min(2, level));
  let prompt = "",
    answer = 0,
    hint = "",
    explanation = "",
    visual = "",
    unit = "",
    choices = null,
    numeric = true;
  let a, b, n, k;
  switch (topic) {
    case 0:
      if (!y3) {
        const mode = N(0, 2);
        n = N(1, [10, 20, 99][d]);
        if (mode === 0 && n <= 20) {
          prompt = "How many little stars can you count?";
          answer = n;
          visual = counters(n);
          hint = "Touch each star once as you count.";
          explanation = `There are ${n} stars.`;
        } else if (mode === 1) {
          prompt = `What is one more than ${n}?`;
          answer = n + 1;
          hint = "Count forward one step.";
          explanation = `${n} + 1 = ${answer}.`;
        } else {
          a = N(1, [10, 20, 100][d]);
          b = N(1, [10, 20, 100][d]);
          if (a === b) b = a === 100 ? 99 : a + 1;
          prompt = `Which number is greater: ${a} or ${b}?`;
          answer = Math.max(a, b);
          choices = [a, b];
          hint = "The greater number is farther along the number line.";
          explanation = `${answer} is the greater number.`;
        }
      } else {
        n = N(100, 999);
        const mode = N(0, 3);
        if (mode === 0) {
          k = P([1, 10, 100]);
          prompt = `What is the value of the ${k === 100 ? "hundreds" : k === 10 ? "tens" : "ones"} digit in ${n}?`;
          answer = (Math.floor(n / k) % 10) * k;
          visual = `<div class="place-value"><span><small>Hundreds</small>${Math.floor(n / 100)}</span><span><small>Tens</small>${Math.floor(n / 10) % 10}</span><span><small>Ones</small>${n % 10}</span></div>`;
          hint = `Each ${k === 100 ? "hundred is 100" : k === 10 ? "ten is 10" : "one is 1"}.`;
          explanation = `The digit is ${Math.floor(n / k) % 10}, so its value is ${answer}.`;
        } else if (mode === 1) {
          k = P([10, 100]);
          n = N(100, 999 - k);
          prompt = `What is ${k} more than ${n}?`;
          answer = n + k;
          hint = `Add ${k === 100 ? "one hundred" : "one ten"} to the number.`;
          explanation = `${n} + ${k} = ${answer}.`;
        } else if (mode === 2) {
          a = N(100, 999);
          b = N(100, 999);
          if (a === b) b = a === 999 ? 998 : a + 1;
          prompt = `Which number is smaller: ${a} or ${b}?`;
          answer = Math.min(a, b);
          choices = [a, b];
          hint = "Compare hundreds first, then tens, then ones.";
          explanation = `${answer} is smaller.`;
        } else {
          k = P([4, 8, 50, 100]);
          n = N(0, Math.floor((1000 - 3 * k) / k)) * k;
          prompt = `Count in ${k}s: ${n}, ${n + k}, ${n + 2 * k}, ?`;
          answer = n + 3 * k;
          hint = `Add ${k} again.`;
          explanation = `${n + 2 * k} + ${k} = ${answer}.`;
        }
      }
      break;
    case 1:
      if (!y3) {
        a = N(0, [5, 10, 15][d]);
        b = N(0, [10, 15, 20][d] - a);
        prompt = `${a} flowers are growing. ${b} more bloom. How many flowers now?`;
        answer = a + b;
        visual =
          a + b <= 16
            ? counters(a, "🌼") +
              `<div class="math-sign">+</div>` +
              counters(b, "🌼")
            : "";
        hint = `Start at ${a} and count on ${b}.`;
        explanation = `${a} + ${b} = ${answer}.`;
      } else {
        a = N(d === 0 ? 20 : 100, d === 0 ? 89 : 649);
        b = N(10, d === 0 ? 99 : 999 - a);
        if (d === 2) {
          // Stretch questions practise exchanging across both columns.
          for (let tries = 0; tries < 40; tries++) {
            a = N(100, 649);
            b = N(100, 999 - a);
            if (
              (a % 10) + (b % 10) >= 10 &&
              (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) + 1 >= 10
            )
              break;
          }
        }
        prompt = `Help build the sky bridge: ${a} + ${b} = ?`;
        answer = a + b;
        visual = column(a, b, "+");
        hint =
          "Add ones first. Exchange 10 ones for 1 ten, then add tens and hundreds.";
        explanation = `${a} + ${b} = ${answer}. You can check by taking ${b} away from ${answer}.`;
      }
      break;
    case 2:
      a = N(
        y3 ? (d === 0 ? 30 : 100) : 5,
        y3 ? (d === 0 ? 99 : 999) : [10, 15, 20][d],
      );
      b = N(0, a - 1);
      if (y3 && d === 2) {
        for (let tries = 0; tries < 40; tries++) {
          a = N(200, 999);
          b = N(100, a - 1);
          if (
            a % 10 < b % 10 &&
            Math.floor(a / 10) % 10 <= Math.floor(b / 10) % 10
          )
            break;
        }
      }
      prompt = `${a} cloud berries grew. The crew ate ${b}. How many are left?`;
      answer = a - b;
      visual = y3 ? column(a, b, "−") : a <= 15 ? counters(a, "🫐") : "";
      hint = y3
        ? "Subtract ones first. If you need more ones, exchange 1 ten for 10 ones."
        : "Count backwards, or cross off one berry at a time.";
      explanation = `${a} − ${b} = ${answer}. Check: ${answer} + ${b} = ${a}.`;
      break;
    case 3:
      k = P(y3 ? (d === 0 ? [2, 3, 4, 5, 10] : [3, 4, 8]) : [2, 5, 10]);
      n = N(y3 && d === 2 ? 10 : 1, y3 ? (d === 2 ? 49 : 12) : [3, 4, 5][d]);
      prompt = y3
        ? `${n} × ${k} = ?`
        : `There are ${n} baskets with ${k} berries each. How many berries altogether?`;
      answer = n * k;
      visual =
        n <= 5 && k <= 5
          ? Array.from(
              { length: n },
              () => `<div class="math-group">${counters(k, "🫐")}</div>`,
            ).join("")
          : "";
      hint =
        y3 && n > 12
          ? `Split ${n} into tens and ones. Multiply both parts by ${k}, then add.`
          : `Count in ${k}s, ${n} times.`;
      explanation = `${n} × ${k} = ${answer}. ${n > 12 ? `${Math.floor(n / 10) * 10} × ${k} + ${n % 10} × ${k} = ${answer}.` : ""}`;
      break;
    case 4:
      k = P(y3 ? (d === 0 ? [2, 3, 5] : [3, 4, 8]) : [2, 5, 10]);
      n = N(1, y3 ? 12 : [2, 3, 4][d]);
      a = k * n;
      prompt = `Share ${a} berries equally between ${k} friends. How many does each friend get?`;
      answer = n;
      visual = a <= 20 ? counters(a, "🫐") : "";
      hint = `Put one berry with each friend and keep sharing equally. What number times ${k} makes ${a}?`;
      explanation = `${a} ÷ ${k} = ${n}, because ${n} × ${k} = ${a}.`;
      break;
    case 5:
      k = P(y3 ? [2, 3, 4, 5, 8] : [2, 4]);
      n = N(1, y3 ? 10 : 4);
      a = k * n;
      b = y3 && d > 0 ? N(1, k - 1) : 1;
      prompt = `What is ${b}/${k} of ${a} cloud berries?`;
      answer = b * n;
      visual = !y3 ? counters(a, "🫐") : "";
      hint = `Share ${a} into ${k} equal groups. ${b === 1 ? "Find one group." : `Find ${b} groups.`}`;
      explanation = `${a} ÷ ${k} = ${n} in each group, so ${b}/${k} of ${a} is ${answer}.`;
      break;
    case 6:
      if (!y3) {
        k = P([2, 4]);
        prompt = "What fraction of this garden is shaded?";
        answer = `1/${k}`;
        visual = fraction(1, k);
        choices = ["1/2", "1/4", "1/3", "1"];
        numeric = false;
        hint = `There are ${k} equal parts and one is shaded.`;
        explanation = `One of ${k} equal parts is shaded: 1/${k}.`;
      } else {
        const mode = N(0, 3);
        if (mode === 0) {
          n = N(1, 9);
          prompt = "How many tenths of this garden are shaded?";
          answer = `${n}/10`;
          visual = fraction(n, 10);
          choices = [
            `${n}/10`,
            `${n}/5`,
            `${n + 1}/10`,
            `${10 - n === n ? n - 1 : 10 - n}/10`,
          ];
          hint = "The garden has ten equal parts. Count the shaded parts.";
          explanation = `${n} of ten equal parts are shaded: ${n}/10.`;
        } else if (mode === 1) {
          k = P([2, 3, 4, 5]);
          prompt = `Which fraction is equal to 1/${k}?`;
          answer = `2/${k * 2}`;
          choices = [answer, `1/${k * 2}`, `2/${k}`, `3/${k * 2}`];
          visual = fraction(1, k);
          hint = "Multiply the top and bottom by the same number.";
          explanation = `1/${k} = 2/${2 * k}. Both numerator and denominator were multiplied by 2.`;
        } else {
          k = P([4, 5, 6, 8, 10]);
          a = N(1, k - 1);
          b = N(1, mode === 2 ? k - a : a);
          const subtract = mode === 3;
          prompt = `${a}/${k} ${subtract ? "−" : "+"} ${b}/${k} = ?`;
          n = subtract ? a - b : a + b;
          answer = `${n}/${k}`;
          choices = [
            answer,
            `${n + 1}/${k}`,
            `${n === 0 ? 2 : n - 1}/${k}`,
            `${n}/${k * 2}`,
          ];
          hint = "Keep the denominator. Add or subtract only the numerators.";
          explanation = `${a}/${k} ${subtract ? "−" : "+"} ${b}/${k} = ${answer}. The equal parts stay the same size.`;
        }
        numeric = false;
      }
      break;
    case 7:
      if (currency === "AED") {
        unit = " AED";
        a = N(1, y3 ? 45 : 8);
        b = N(1, y3 ? 35 : 8);
        if (!y3 || N(0, 1) === 0) {
          prompt = `A snack costs ${a} dirhams and a juice costs ${b} dirhams. What is the total?`;
          answer = a + b;
          hint = "Add the two prices.";
          explanation = `${a} + ${b} = ${answer} dirhams.`;
        } else {
          const paid = Math.ceil((a + b) / 10) * 10 + 10;
          prompt = `You pay ${paid} dirhams for snacks costing ${a + b} dirhams. How much change?`;
          answer = paid - a - b;
          hint = "Subtract the cost from the amount paid.";
          explanation = `${paid} − ${a + b} = ${answer} dirhams.`;
        }
      } else if (!y3) {
        a = P([1, 2, 5, 10]);
        b = P([1, 2, 5, 10]);
        prompt = `You have a ${a}p coin and a ${b}p coin. How many pence altogether?`;
        answer = a + b;
        unit = "p";
        visual = `<div class="coin-row"><span>${a}p</span><span>${b}p</span></div>`;
        hint = "Add the values of the two coins.";
        explanation = `${a}p + ${b}p = ${answer}p.`;
      } else {
        a = N(15, 85);
        b = N(10, 80);
        const paid = 200;
        prompt = `A snack costs ${a}p and a juice ${b}p. You pay £2. What is your change in pence?`;
        answer = paid - a - b;
        unit = "p";
        hint =
          "£2 is 200p. Add the two prices, then take the total away from 200p.";
        explanation = `The cost is ${a + b}p. 200p − ${a + b}p = ${answer}p.`;
      }
      break;
    case 8:
      if (!y3) {
        a = N(2, 10);
        b = N(1, 10);
        if (a === b) b = a === 10 ? 9 : a + 1;
        prompt = "Which ribbon is longer?";
        answer = a > b ? "Green" : "Golden";
        choices = ["Green", "Golden"];
        numeric = false;
        visual = `<div class="ribbons"><div><span style="width:${a * 15}px;background:#8baa79"></span>Green</div><div><span style="width:${b * 15}px;background:#d9b26c"></span>Golden</div></div>`;
        hint = "Compare the two ribbons from the same starting point.";
        explanation = `The ${String(answer).toLowerCase()} ribbon is longer.`;
      } else {
        const mode = N(0, 2);
        if (mode === 0) {
          a = N(1, 8);
          b = N(1, 90);
          prompt = `A ribbon is ${a} metres and ${b} centimetres long. How many centimetres is that?`;
          answer = a * 100 + b;
          unit = " cm";
          hint = "1 metre is 100 centimetres.";
          explanation = `${a} × 100 + ${b} = ${answer} cm.`;
        } else if (mode === 1) {
          a = N(1, 5);
          b = N(50, 900);
          prompt = `A jug holds ${a} litres and ${b} millilitres. How many millilitres?`;
          answer = a * 1000 + b;
          unit = " ml";
          hint = "1 litre is 1,000 millilitres.";
          explanation = `${a} × 1,000 + ${b} = ${answer} ml.`;
        } else {
          a = N(1, 5);
          b = N(50, 900);
          prompt = `A bag weighs ${a} kilograms and ${b} grams. How many grams?`;
          answer = a * 1000 + b;
          unit = " g";
          hint = "1 kilogram is 1,000 grams.";
          explanation = `${a} × 1,000 + ${b} = ${answer} g.`;
        }
      }
      break;
    case 9:
      a = N(1, 12);
      b = y3
        ? P(
            d === 0
              ? [0, 15, 30, 45]
              : Array.from({ length: 12 }, (_, i) => i * 5),
          )
        : P([0, 30]);
      if (y3 && d === 2 && N(0, 1)) {
        const start = N(8, 14) * 60 + P([0, 15, 30, 45]);
        n = P([15, 25, 35, 45, 55, 65, 75, 90]);
        const fmt = (m) =>
          `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
        prompt = `Your sky journey starts at ${fmt(start)} and ends at ${fmt(start + n)}. How many minutes does it take?`;
        answer = n;
        unit = " minutes";
        hint = "Count to the next hour, then count the remaining minutes.";
        explanation = `${fmt(start + n)} is ${n} minutes after ${fmt(start)}.`;
      } else {
        prompt = "What time does this clock show?";
        answer = `${a}:${String(b).padStart(2, "0")}`;
        visual = clock(a, b, y3 && d === 2);
        choices = [
          answer,
          `${a === 12 ? 1 : a + 1}:${String(b).padStart(2, "0")}`,
          `${a}:${String((b + (y3 ? 15 : 30)) % 60).padStart(2, "0")}`,
          `${a === 1 ? 12 : a - 1}:${String(b).padStart(2, "0")}`,
        ];
        numeric = false;
        hint =
          "The short hand shows the hour. The long hand shows the minutes: each number is five minutes.";
        explanation = `It is ${answer}. ${b === 0 ? "The minute hand is at 12: o’clock." : b === 30 ? "The minute hand is at 6: half past." : `The minute hand shows ${b} minutes past the hour.`}`;
      }
      break;
    case 10:
      if (!y3 || N(0, 2) === 0) {
        const kind = P(["Triangle", "Square", "Rectangle", "Circle", "Cube"]);
        prompt = "What is the name of this shape?";
        answer = kind;
        choices = shuffle(
          ["Triangle", "Square", "Rectangle", "Circle", "Cube"].filter(
            (x) => x !== kind,
          ),
          r,
        )
          .slice(0, 3)
          .concat(kind);
        numeric = false;
        visual = shape(kind);
        hint =
          kind === "Cube"
            ? "This solid shape has six square faces."
            : kind === "Circle"
              ? "This round shape has no corners."
              : kind === "Triangle"
                ? "This shape has three straight sides."
                : kind === "Square"
                  ? "This shape has four equal sides."
                  : "This shape has four sides and four right angles. Two sides are longer.";
        explanation = `This shape is a ${kind.toLowerCase()}.`;
      } else {
        a = N(3, 12);
        b = N(2, 9);
        prompt = `A rectangular garden is ${a} cm long and ${b} cm wide. What is its perimeter?`;
        answer = 2 * (a + b);
        unit = " cm";
        visual = `<div class="perimeter-picture"><span>${a} cm</span><div></div><span>${b} cm</span></div>`;
        hint =
          "Perimeter is the distance all the way around. Add all four sides.";
        explanation = `${a} + ${b} + ${a} + ${b} = ${answer} cm.`;
      }
      break;
    case 11:
      {
        const values = [
          N(1, y3 ? 12 : 6),
          N(1, y3 ? 12 : 6),
          N(1, y3 ? 12 : 6),
        ];
        const labels = ["Apples", "Berries", "Pears"];
        visual = chart(values, labels);
        const mode = y3 ? N(0, 2) : 0;
        if (mode === 0) {
          k = N(0, 2);
          prompt = `How many ${labels[k].toLowerCase()} did our friends collect?`;
          answer = values[k];
          hint = "Read the value above that bar.";
          explanation = `The ${labels[k].toLowerCase()} bar shows ${answer}.`;
        } else if (mode === 1) {
          prompt = "How much fruit did our friends collect altogether?";
          answer = values.reduce((sum, x) => sum + x, 0);
          hint = "Add the values of all three bars.";
          explanation = `${values.join(" + ")} = ${answer}.`;
        } else {
          a = 0;
          b = 1;
          prompt = `What is the difference between the numbers of apples and berries?`;
          answer = Math.abs(values[a] - values[b]);
          hint = "Subtract the smaller number from the larger number.";
          explanation = `${Math.max(values[a], values[b])} − ${Math.min(values[a], values[b])} = ${answer}.`;
        }
      }
      break;
    default:
      throw new Error("Unknown maths topic");
  }
  if (!choices) {
    const options = new Set([answer]);
    let tries = 0;
    while (options.size < 4 && tries++ < 100) {
      const delta = P([-10, -5, -2, -1, 1, 2, 3, 5, 10]);
      const candidate = Number(answer) + delta;
      if (candidate >= 0) options.add(candidate);
    }
    choices = [...options];
  }
  // Equivalent fractions are valid input, so never offer two equivalent choices.
  const unique = new Map();
  for (const value of [answer, ...choices]) {
    const key = normaliseAnswer(value);
    if (!unique.has(key)) unique.set(key, value);
  }
  const options = shuffle([...unique.values()], r).map((value) => ({
    value: String(value),
    label: `${value}${unit}`,
  }));
  return {
    topic,
    year,
    level: d,
    prompt,
    answer: String(answer),
    hint,
    explanation,
    visual,
    unit,
    numeric,
    options,
    signature: `${topic}:${prompt}:${visual}`,
  };
}
