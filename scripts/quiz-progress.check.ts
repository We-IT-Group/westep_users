// Self-check (test runner yo'q): node scripts/quiz-progress.check.ts -> ok
import assert from "node:assert/strict";
import { clearProgress, loadProgress, saveProgress, sectionOf } from "../src/pages/kasblar/qiziqish/quizProgress.ts";
import type { QuizQuestionDto } from "../src/api/professions/types.ts";

const mem = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
};

const ids = ["q1", "q2", "q3"];
saveProgress("u1", { tier: 50, answers: { q1: "o1" }, index: 1, questionIds: ids });
assert.deepEqual(loadProgress("u1", ids, 50)?.answers, { q1: "o1" });
// savollar to'plami o'zgargan -> eski holat tashlanadi
assert.equal(loadProgress("u1", ["q1", "q2", "q9"], 50), null);
// boshqa daraja -> null
assert.equal(loadProgress("u1", ids, 100), null);
// buzilgan JSON -> null
mem.set("westep.quiz.v2.u1", "{buzuq");
assert.equal(loadProgress("u1", ids, 50), null);
clearProgress("u1");
assert.equal(loadProgress("u1", ids, 50), null);

// localStorage throw qilsa jim o'tadi
(globalThis as { localStorage?: unknown }).localStorage = {
    getItem: () => { throw new Error("blocked"); },
    setItem: () => { throw new Error("blocked"); },
    removeItem: () => { throw new Error("blocked"); },
};
saveProgress("u1", { tier: 50, answers: {}, index: 0, questionIds: ids });
assert.equal(loadProgress("u1", ids, 50), null);
clearProgress("u1");

const qs = [
    { id: "a", text: "", dimension: "RIASEC", options: [] },
    { id: "b", text: "", dimension: "RIASEC", options: [] },
    { id: "c", text: "", dimension: "MOOD", options: [] },
] as QuizQuestionDto[];
assert.deepEqual(sectionOf(qs, 0), { dimension: "RIASEC", startsHere: true, index: 0, total: 2 });
assert.deepEqual(sectionOf(qs, 1), { dimension: "RIASEC", startsHere: false, index: 1, total: 2 });
assert.deepEqual(sectionOf(qs, 2), { dimension: "MOOD", startsHere: true, index: 0, total: 1 });
console.log("ok");
