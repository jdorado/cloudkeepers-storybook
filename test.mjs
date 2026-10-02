import assert from "node:assert/strict";
import { generateQuestion, normaliseAnswer } from "./questions.js";
import {
  newAdventure,
  restoreAdventure,
  nextQuestion,
  submitAnswer,
  skill,
  unlockTravel,
  rescueAnimal,
  visitIsland,
  changeYear,
  canWin,
  rescuedCount,
  journeyObjective,
} from "./adventure.js";

let seed = 4267;
const random = () => (seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32;

// Independent answers derived from the learner-facing wording/pictures.
function expected(q) {
  const p = q.prompt;
  let m;
  if (p === "How many little stars can you count?")
    return (q.visual.match(/<span>/g) || []).length;
  if ((m = p.match(/one more than (\d+)/))) return +m[1] + 1;
  if ((m = p.match(/Which number is (greater|smaller): (\d+) or (\d+)/)))
    return m[1] === "greater" ? Math.max(+m[2], +m[3]) : Math.min(+m[2], +m[3]);
  if ((m = p.match(/value of the (hundreds|tens|ones) digit in (\d+)/))) {
    const digits = m[2].padStart(3, "0");
    return (
      +digits[{ hundreds: 0, tens: 1, ones: 2 }[m[1]]] *
      { hundreds: 100, tens: 10, ones: 1 }[m[1]]
    );
  }
  if ((m = p.match(/What is (\d+) more than (\d+)/))) return +m[1] + +m[2];
  if ((m = p.match(/Count in (\d+)s: (\d+), (\d+), (\d+)/)))
    return +m[4] + +m[1];
  if ((m = p.match(/(\d+) flowers.* (\d+) more/))) return +m[1] + +m[2];
  if ((m = p.match(/(\d+) \+ (\d+) =/))) return +m[1] + +m[2];
  if ((m = p.match(/(\d+) cloud berries.*ate (\d+)/))) return +m[1] - +m[2];
  if ((m = p.match(/(\d+) × (\d+) =/))) return +m[1] * +m[2];
  if ((m = p.match(/(\d+) baskets with (\d+) berries/))) return +m[1] * +m[2];
  if ((m = p.match(/Share (\d+) berries equally between (\d+)/)))
    return +m[1] / +m[2];
  if ((m = p.match(/(\d+)\/(\d+) of (\d+)/))) return (+m[3] / +m[2]) * +m[1];
  if (p.includes("garden is shaded?") || p.includes("garden are shaded?")) {
    const d = (q.visual.match(/<span class=/g) || []).length;
    return `${(q.visual.match(/class="filled"/g) || []).length}/${d}`;
  }
  if ((m = p.match(/equal to 1\/(\d+)/))) return `1/${m[1]}`;
  if ((m = p.match(/(\d+)\/(\d+) ([+−]) (\d+)\/(\d+)/)))
    return `${m[3] === "+" ? +m[1] + +m[4] : +m[1] - +m[4]}/${m[2]}`;
  if ((m = p.match(/(\d+)p coin and a (\d+)p/))) return +m[1] + +m[2];
  if ((m = p.match(/snack costs (\d+)p and a juice (\d+)p/)))
    return 200 - +m[1] - +m[2];
  if ((m = p.match(/snack costs (\d+) dirhams and a juice costs (\d+)/)))
    return +m[1] + +m[2];
  if ((m = p.match(/pay (\d+) dirhams.*costing (\d+)/))) return +m[1] - +m[2];
  if ((m = p.match(/(\d+) metres and (\d+) centimetres/)))
    return +m[1] * 100 + +m[2];
  if ((m = p.match(/(\d+) (litres|kilograms) and (\d+)/)))
    return +m[1] * 1000 + +m[3];
  if ((m = p.match(/starts at (\d+):(\d+) and ends at (\d+):(\d+)/)))
    return +m[3] * 60 + +m[4] - (+m[1] * 60 + +m[2]);
  if ((m = p.match(/(\d+) cm long and (\d+) cm wide/)))
    return +m[1] * 2 + +m[2] * 2;
  if (q.topic === 11) {
    const values = [...q.visual.matchAll(/<strong>(\d+)<\/strong>/g)].map(
      (x) => +x[1],
    );
    if (p.includes("altogether")) return values.reduce((a, b) => a + b, 0);
    if (p.includes("difference")) return Math.abs(values[0] - values[1]);
    return values[
      ["apples", "berries", "pears"].findIndex((x) => p.includes(x))
    ];
  }
  return undefined; // Clock hands, shape names and ribbon pictures get browser visual QA.
}

let checked = 0,
  independentlyChecked = 0;
for (const year of [1, 3])
  for (let level = 0; level < 3; level++)
    for (let topic = 0; topic < 12; topic++)
      for (const currency of ["GBP", "AED"])
        for (let sample = 0; sample < 100; sample++) {
          const q = generateQuestion(topic, year, level, random, currency);
          const keys = q.options.map((x) => normaliseAnswer(x.value));
          assert.equal(
            new Set(keys).size,
            keys.length,
            "No equivalent or duplicate choices",
          );
          assert.equal(
            keys.filter((x) => x === normaliseAnswer(q.answer)).length,
            1,
          );
          assert.ok(q.prompt && q.hint && q.explanation);
          assert.ok(!/undefined|NaN|Infinity/.test(JSON.stringify(q)));
          if (q.numeric) assert.ok(Number(q.answer) >= 0);
          const oracle = expected(q);
          if (oracle !== undefined) {
            assert.equal(
              normaliseAnswer(q.answer),
              normaliseAnswer(oracle),
              q.prompt,
            );
            independentlyChecked++;
          }
          checked++;
        }

const solve = (state) => {
  const q = nextQuestion(state, random);
  assert.equal(submitAnswer(state, q.id, q.answer).correct, true);
  assert.deepEqual(submitAnswer(state, q.id, q.answer), { ignored: true });
  return q;
};

const adaptivePath = newAdventure(1);
const adaptiveLevels = [];
for (let i = 0; i < 5; i++) {
  const q = nextQuestion(adaptivePath, random);
  adaptiveLevels.push(q.level);
  assert.equal(submitAnswer(adaptivePath, q.id, q.answer).correct, true);
}
assert.deepEqual(
  adaptiveLevels,
  [0, 0, 1, 1, 2],
  "A clean five-star island reaches every difficulty band",
);
assert.equal(journeyObjective(adaptivePath), "rescue");
assert.equal(unlockTravel(adaptivePath), true);
assert.equal(rescueAnimal(adaptivePath), true);
assert.equal(journeyObjective(adaptivePath), "travel-forward");

const homebound = newAdventure(1);
for (const island of homebound.islands) {
  island.unlocked = true;
  island.stars = 5;
  island.rescued = true;
  island.travel = true;
}
homebound.current = 4;
assert.equal(journeyObjective(homebound), "return-haven");
homebound.current = 11;
homebound.islands[3].rescued = false;
assert.equal(journeyObjective(homebound), "find-missing");
homebound.islands[3].rescued = true;
homebound.islands[11].travel = false;
assert.equal(journeyObjective(homebound), "light-beacon");

for (const year of [1, 3]) {
  let state = newAdventure(year);
  assert.equal(visitIsland(state, 1), false);
  assert.equal(unlockTravel(state), false);
  assert.equal(rescueAnimal(state), false);
  for (let island = 0; island < 12; island++) {
    for (let i = 0; i < 3; i++) solve(state);
    assert.equal(state.islands[island].stars, 3);
    assert.equal(rescueAnimal(state), false);
    assert.equal(unlockTravel(state), true);
    if (island < 11) assert.equal(visitIsland(state, island + 1), true);
    state = restoreAdventure(JSON.parse(JSON.stringify(state)), year);
  }
  assert.equal(state.current, 11);
  assert.equal(canWin(state), false, "Arrival alone cannot win");
  assert.equal(rescuedCount(state), 0);
  for (let island = 0; island < 12; island++) {
    assert.equal(visitIsland(state, island), true);
    solve(state);
    solve(state);
    assert.equal(rescueAnimal(state), true);
    assert.equal(rescueAnimal(state), false, "Cannot rescue twice");
    assert.equal(state.won, island === 11);
  }
  assert.equal(rescuedCount(state), 12);
  assert.equal(state.correct, 60);
  assert.equal(canWin(state), true);
  assert.equal(visitIsland(state, 0), true);
  assert.equal(
    canWin(state),
    false,
    "All friends must arrive at the final island",
  );
  assert.equal(visitIsland(state, 11), true);
  assert.equal(state.won, true);
  assert.equal(restoreAdventure(JSON.parse(JSON.stringify(state))).won, true);
}

const practice = newAdventure(3);
for (let i = 0; i < 3; i++) solve(practice);
assert.equal(skill(practice, 0).level, 1);
const q = nextQuestion(practice, random);
assert.deepEqual(submitAnswer(practice, "stale", q.answer), { ignored: true });
submitAnswer(practice, q.id, "wrong");
submitAnswer(practice, q.id, "wrong");
assert.equal(skill(practice, 0).level, 0);
assert.equal(practice.islands[0].stars, 3, "Mistakes never lose stars");
let restored = restoreAdventure(JSON.parse(JSON.stringify(practice)));
assert.equal(restored.session.attempts, 2);
assert.equal(
  nextQuestion(restored).id,
  q.id,
  "Reload resumes the current question",
);
solve(restored);
for (let i = 0; i < 4; i++) {
  nextQuestion(restored, random);
  restored.session.hint = true;
  solve(restored);
}
assert.equal(
  skill(restored, 0).level,
  0,
  "Hint-assisted answers do not force harder questions",
);
assert.equal(
  restored.islands[0].stars,
  5,
  "Practice stars cap at the rescue target",
);
changeYear(restored, 1);
assert.equal(restored.session, null);
assert.equal(
  skill(restored, 0).correct,
  0,
  "Year paths have separate adaptive records",
);
assert.equal(
  restored.islands[0].stars,
  5,
  "Switching year preserves the adventure",
);
const malformed = restoreAdventure({
  version: 1,
  current: 11,
  islands: [
    { unlocked: true, stars: 999 },
    ...Array(11).fill({
      unlocked: true,
      stars: 5,
      travel: true,
      rescued: true,
    }),
  ],
});
assert.equal(malformed.current, 0);
assert.equal(malformed.islands[0].stars, 5);
assert.equal(malformed.won, false);
console.log(
  `Passed ${checked.toLocaleString()} generated questions (${independentlyChecked.toLocaleString()} independent maths checks), two complete journeys, backtracking, save/restore, and adaptive difficulty.`,
);
