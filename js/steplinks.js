/*
 * 「次の一歩」から、サイトの中で続きが分かるページへのリンクを決める
 * 上から順に見て、最初に当てはまった行き先を使う(当てはまらなければリンクなし)
 * href は サイトのトップから見た場所。types/ のページでは "../" を前につける
 */
const STEP_LINKS = [
  { words: ["経験を書き出す", "課題を3つ書き出す", "技術を3つ書き出す"], href: "senkou.html#jikobunseki", label: "自己分析のやり方を見る" },
  { words: ["ケース面接", "説明する練習"], href: "senkou.html#mensetsu", label: "面接の基本を見る" },
  { words: ["合同説明会"], href: "support.html#shien", label: "学内の説明会を見る" },
  { words: ["学校推薦", "就職課"], href: "guide.html#suisen", label: "学校推薦のしくみを見る" },
  { words: ["院進"], href: "guide.html#inshin", label: "院進と学部就職の違いを見る" },
  { words: ["先輩", "交流会"], href: "sources.html#hito", label: "先輩と話せる場所を見る" },
  { words: ["逆求人"], href: "sources.html#shurui", label: "スカウト型サイトを見る" },
  { words: ["インターン", "オープンカンパニー", "工場見学"], href: "sources.html#itsu", label: "インターンの探し方を見る" },
  { words: ["公務員試験", "教員採用試験"], href: "jobs.html#cat-pro", label: "専門職・公務員の仕事を見る" },
  { words: ["資格", "試験"], href: "guide.html#shikaku", label: "資格の考え方を見る" },
  { words: ["違いを調べる", "仕事内容を調べる", "という仕事を調べて"], href: "jobs.html", label: "職種ガイドで調べる" },
];

function stepLink(step) {
  for (const rule of STEP_LINKS) {
    if (rule.words.some((w) => step.includes(w))) return rule;
  }
  return null;
}

if (typeof module !== "undefined") module.exports = { STEP_LINKS, stepLink };
