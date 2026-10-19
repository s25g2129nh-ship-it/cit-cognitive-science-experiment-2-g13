/*
 * 診断ロジックのテスト
 *   node tools/test-shindan.js
 * 全部 OK と出れば、質問データとタイプデータの整合がとれています。
 */
const assert = require("assert");
const { AXES, QUESTIONS, CHOICES, calcType } = require("../js/questions.js");
const { TYPES, pairOf } = require("../js/types.js");

// 1. 質問は各軸5問ずつ、左右の向きが混ざっている
for (let a = 0; a < AXES.length; a++) {
  const qs = QUESTIONS.filter((q) => q.axis === a);
  assert.strictEqual(qs.length, 5, `軸${a}の質問が5問ではない`);
  assert.ok(qs.some((q) => q.dir === 1) && qs.some((q) => q.dir === -1), `軸${a}の質問の向きが片寄っている`);
}

// 2. 16タイプすべてにデータがあり、必要な項目がそろっている
assert.strictEqual(Object.keys(TYPES).length, 16);
for (const [code, t] of Object.entries(TYPES)) {
  assert.ok(t.name && t.catch && t.desc, `${code} の文章が足りない`);
  assert.strictEqual(t.steps.length, 3, `${code} の次の一歩が3つではない`);
  assert.ok(t.jobs.length >= 1, `${code} の職種がない`);
  assert.ok(TYPES[pairOf(code)], `${code} の相性タイプがない`);
}

// 3. どのタイプにもたどり着ける(各軸を左右どちらかに全振りした16通り)
const reached = new Set();
for (let mask = 0; mask < 16; mask++) {
  const answers = QUESTIONS.map((q) => {
    const wantRight = (mask >> q.axis) & 1;
    return wantRight ? 2 * q.dir : -2 * q.dir;
  });
  const { code, scores } = calcType(answers);
  assert.ok(TYPES[code], `存在しないタイプ ${code}`);
  scores.forEach((s) => assert.strictEqual(Math.abs(s), 10));
  reached.add(code);
}
assert.strictEqual(reached.size, 16, "たどり着けないタイプがある");

// 4. 全部「どちらでもない」なら左側(HSDP)になる
assert.strictEqual(calcType(new Array(QUESTIONS.length).fill(0)).code, "HSDP");

// 5. 全部「とてもそう思う」でも1つのタイプに片寄りすぎない(黙従傾向の対策)
const allYes = calcType(new Array(QUESTIONS.length).fill(CHOICES[0].value));
allYes.scores.forEach((s) => assert.ok(Math.abs(s) <= 2, "全部そう思うでスコアが片寄りすぎ"));

// 6. 職種ガイドのデータがタイプと合っている
const { JOB_CATEGORIES, JOBS } = require("../js/jobs.js");
const catIds = new Set(JOB_CATEGORIES.map((c) => c.id));
const jobIds = new Set();
for (const j of JOBS) {
  assert.ok(!jobIds.has(j.id), `職種の id「${j.id}」が重複している`);
  jobIds.add(j.id);
  assert.ok(/^[a-z0-9-]+$/.test(j.id), `職種の id「${j.id}」は英小文字・数字・-だけにする`);
  assert.ok(catIds.has(j.category), `${j.name} の分類「${j.category}」がない`);
  assert.ok(j.summary && j.tasks.length && j.companies.length, `${j.name} の内容が足りない`);
  j.types.forEach((c) => assert.ok(TYPES[c], `${j.name} の近いタイプ「${c}」が存在しない`));
}
for (const code of Object.keys(TYPES)) {
  assert.ok(JOBS.some((j) => j.types.includes(code)), `${code} に近い職種が職種ガイドに1つもない`);
}

console.log("全部 OK");
