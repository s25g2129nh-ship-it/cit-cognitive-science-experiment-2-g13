/*
 * 診断の質問データ(20問)
 *
 * axis: どの軸の質問か(0〜3、下の AXES の順番)
 * dir : 「そう思う」と答えたときにどちらに加点するか
 *        1 = 右側(T / V / B / A)、-1 = 左側(H / S / D / P)
 *
 * 1軸5問ずつ。左右どちらの向きの質問も混ぜて、
 * 「全部そう思う」と答える癖(黙従傾向)で結果が偏らないようにしている。
 */

// 4つの軸。[左側, 右側] の順
const AXES = [
  { left: { code: "H", label: "ヒト" }, right: { code: "T", label: "モノ・技術" }, name: "関わる対象" },
  { left: { code: "S", label: "安定" }, right: { code: "V", label: "挑戦" }, name: "働く環境" },
  { left: { code: "D", label: "深く" }, right: { code: "B", label: "広く" }, name: "専門性" },
  { left: { code: "P", label: "計画" }, right: { code: "A", label: "行動" }, name: "進め方" },
];

const QUESTIONS = [
  // 関わる対象(H ⇔ T)
  { text: "新しい家電を買ったら、使い方より仕組みが気になる", axis: 0, dir: 1 },
  { text: "人に何かを教えて「分かった」と言われるのが嬉しい", axis: 0, dir: -1 },
  { text: "一人で黙々とプログラムや実験に取り組む時間が好き", axis: 0, dir: 1 },
  { text: "初対面の人とでも会話を続けるのは苦にならない", axis: 0, dir: -1 },
  { text: "技術の面白さより、「ありがとう」と言われることにやりがいを感じる", axis: 0, dir: -1 },

  // 働く環境(S ⇔ V)
  { text: "名前の知られた大きな組織で働く方が安心できる", axis: 1, dir: -1 },
  { text: "失敗するかもしれなくても新しいことに挑戦したい", axis: 1, dir: 1 },
  { text: "給料が多少低くても、長く安定して働ける方がいい", axis: 1, dir: -1 },
  { text: "決まったルールに従うより、自分で仕組みを作る方がワクワクする", axis: 1, dir: 1 },
  { text: "転職や起業も将来の選択肢として考えている", axis: 1, dir: 1 },

  // 専門性(D ⇔ B)
  { text: "一つの分野をとことん極めたい", axis: 2, dir: -1 },
  { text: "いろいろな部署や仕事を経験してみたい", axis: 2, dir: 1 },
  { text: "「〇〇の専門家」と呼ばれたい", axis: 2, dir: -1 },
  { text: "興味があることが次々に変わるタイプだ", axis: 2, dir: 1 },
  { text: "研究や趣味で、人より詳しい分野がある", axis: 2, dir: -1 },

  // 進め方(P ⇔ A)
  { text: "旅行は事前に予定をしっかり立てたい", axis: 3, dir: -1 },
  { text: "新しいことは、計画を立てるより先に、とりあえずやってみる方だ", axis: 3, dir: 1 },
  { text: "締め切りから逆算してスケジュールを組む", axis: 3, dir: -1 },
  { text: "予定が変わっても臨機応変に対応するのは得意だ", axis: 3, dir: 1 },
  { text: "説明書は最初に読む方だ", axis: 3, dir: -1 },
];

// 回答の選択肢(上から順に表示)
const CHOICES = [
  { label: "とてもそう思う", value: 2 },
  { label: "そう思う", value: 1 },
  { label: "どちらでもない", value: 0 },
  { label: "そう思わない", value: -1 },
  { label: "まったくそう思わない", value: -2 },
];

/*
 * 回答からタイプを計算する
 * answers[i] は i 番目の質問への回答(-2〜+2)
 * 戻り値: { code: "TSDP", scores: [-10〜+10 ×4] }
 * スコアが正なら右側、0以下なら左側の文字になる
 */
function calcType(answers) {
  const scores = [0, 0, 0, 0];
  QUESTIONS.forEach((q, i) => {
    scores[q.axis] += (answers[i] || 0) * q.dir;
  });
  const code = scores
    .map((s, a) => (s > 0 ? AXES[a].right.code : AXES[a].left.code))
    .join("");
  return { code, scores };
}

// Node.js(テストや tools/ のスクリプト)からも読めるようにする
if (typeof module !== "undefined") {
  module.exports = { AXES, QUESTIONS, CHOICES, calcType };
}
