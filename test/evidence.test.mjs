import test from 'node:test';
import assert from 'node:assert/strict';
import { restoreEvidence, recordEvidence, evidenceContext, startEvidenceClock } from '../evidence.js';
test('evidence retains exact error examples and trims private history safely', () => {
  const log = restoreEvidence();
  const context = evidenceContext({ id: 'q-1', prompt: '7 + 8?', answer: '15', options: ['15', '14'], visual: { a: 7, b: 8 } }, 3, 2, 'addition', 1250);
  recordEvidence(log, context, 'answer', { submittedAnswer: '14', attempt: 1, correct: false, independent: false, helpUsed: false });
  assert.equal(log.events[0].question.prompt, '7 + 8?');
  assert.equal(log.events[0].submittedAnswer, '14');
  assert.equal(log.events[0].activeMs, 1250);
  assert.deepEqual(restoreEvidence(JSON.parse(JSON.stringify(log))), log);
  for (let i = 0; i < 400; i++) recordEvidence(log, context, 'hint');
  assert.ok(log.events.length <= 300); assert.ok(JSON.stringify(log).length <= 90000); assert.ok(log.dropped > 0);
  assert.equal(restoreEvidence({ version: 1, events: [{ ...log.events[0], activeMs: -1 }] }).events.length, 0);
  assert.equal(restoreEvidence().events.length, 0);
});
test('active time excludes closed, hidden, unfocused and idle questions', () => {
  const originals = Object.fromEntries(['document', 'window', 'performance', 'setInterval', 'clearInterval'].map(k => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
  let now = 0, interval; const listeners = new Map();
  const doc = { hidden: false, hasFocus: () => true, addEventListener: (k, fn) => listeners.set(k, fn), removeEventListener: () => {} };
  const win = { addEventListener: () => {}, removeEventListener: () => {} };
  const q = { activeMs: 0 }; let open = true;
  try {
    for (const [k, value] of Object.entries({ document: doc, window: win, performance: { now: () => now }, setInterval: fn => { interval = fn; return 1 }, clearInterval: () => {} })) Object.defineProperty(globalThis, k, { configurable: true, value });
    const stop = startEvidenceClock(() => open ? q : null, () => {});
    now = 250; interval(); assert.equal(q.activeMs, 250);
    doc.hidden = true; now = 500; interval(); assert.equal(q.activeMs, 250);
    doc.hidden = false; doc.hasFocus = () => false; now = 750; interval(); assert.equal(q.activeMs, 250);
    doc.hasFocus = () => true; open = false; now = 1000; interval(); assert.equal(q.activeMs, 250);
    open = true; now = 92000; interval(); assert.equal(q.activeMs, 250);
    listeners.get('pointerdown')(); now = 92250; interval(); assert.equal(q.activeMs, 500);
    stop();
  } finally { for (const [k, descriptor] of Object.entries(originals)) { if (descriptor) Object.defineProperty(globalThis, k, descriptor); else delete globalThis[k]; } }
});

import { createLibrary } from '../library.js';
import { nextQuestion, submitAnswer, recordHelp, skipQuestion } from '../adventure.js';
import { normalizeSave } from '../server/save-service.js';
test('automatic hints, explicit skips and private profile evidence survive normalization', () => {
 const library = createLibrary(), adventure = library.profiles['explorer-one'].data.adventure;
 const q = nextQuestion(adventure); adventure.session.activeMs = 2000;
 submitAnswer(adventure, q.id, '99999'); submitAnswer(adventure, q.id, q.answer);
 assert.equal(adventure.evidence.events.find(e => e.type === 'hint').questionId, q.id);
 const answer = adventure.evidence.events.filter(e => e.type === 'answer').at(-1);
 assert.equal(answer.independent, false); assert.equal(answer.helpUsed, true); assert.equal(answer.attempt, 2);
 adventure.session = null; nextQuestion(adventure); recordHelp(adventure, 'read'); skipQuestion(adventure);
 const restored = normalizeSave(JSON.parse(JSON.stringify(library)));
 assert.equal(restored.profiles['explorer-one'].data.adventure.evidence.events.at(-1).type, 'skip');
 assert.equal(restored.profiles['explorer-two'].data.adventure.evidence.events.length, 0);
});
