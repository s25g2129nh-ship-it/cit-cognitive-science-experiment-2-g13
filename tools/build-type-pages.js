/*
 * タイプ別ページ(types/XXXX.html ×16)を作り直すスクリプト
 *
 * js/types.js の内容を変えたら、リポジトリのフォルダで次を実行:
 *   node tools/build-type-pages.js
 *
 * タイプ別ページは SNS でシェアされたときに表示されるページです。
 * X や LINE は JavaScript で書き換えた内容を読まないので、
 * タイプごとに静的な HTML(OGP タグつき)を用意しています。
 */
const fs = require("fs");
const path = require("path");
const { TYPES, pairOf } = require("../js/types.js");

// GitHub Pages で公開したときの URL(最後の / を忘れずに)
// 公開URLが変わったらここを直して、もう一度実行する
const SITE_URL = "https://s25g2129nh-ship-it.github.io/cit-cognitive-science-experiment-2-g13/";

const outDir = path.join(__dirname, "..", "types");
fs.mkdirSync(outDir, { recursive: true });

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

for (const [code, t] of Object.entries(TYPES)) {
  const pairCode = pairOf(code);
  const pair = TYPES[pairCode];
  const title = `${code} ${t.name} | 就活16タイプ診断`;
  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(t.catch)}。${esc(t.desc)}">
  <meta property="og:title" content="${esc(`${code} ${t.name}`)}">
  <meta property="og:description" content="${esc(t.catch)}。あなたは何タイプ?20問・約3分の就活16タイプ診断">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${SITE_URL}types/${code}.html">
  <meta property="og:image" content="${SITE_URL}images/ogp/${code}.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a class="logo" href="../index.html">就活の地図</a>
    </div>
  </header>

  <main>
    <div class="container">
      <div class="result-card">
        <p class="result-label">就活16タイプ</p>
        <p class="result-code">${code}</p>
        <h1 class="result-name">${esc(t.name)}</h1>
        <p class="result-catch">${esc(t.catch)}</p>
      </div>
      <p class="result-desc">${esc(t.desc)}</p>
    </div>

    <section class="section">
      <div class="container">
        <h2 class="section-title">向いている職種の例</h2>
        <ul class="chips" style="margin-top: 0">
${t.jobs.map((j) => `          <li class="chip chip--outline">${esc(j)}</li>`).join("\n")}
        </ul>
      </div>
    </section>

    <section class="section section--sub">
      <div class="container">
        <h2 class="section-title">あなたは何タイプ?</h2>
        <p class="lead">20の質問に答えるだけで、あなたに合う方向性と「次の一歩」が分かります。</p>
        <a class="button" href="../shindan.html">診断してみる(約3分)</a>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">相性のいいタイプ</h2>
        <a class="pair-card" href="${pairCode}.html">
          <span class="type-code">${pairCode}</span>
          <span>
            <span class="type-name" style="display: block">${esc(pair.name)}</span>
            <span class="type-catch">${esc(pair.catch)}</span>
          </span>
        </a>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container">
      <a href="../about.html">このサイトについて</a><br>
      千葉工業大学 認知情報科学実験2 グループ13
    </div>
  </footer>
</body>
</html>
`;
  fs.writeFileSync(path.join(outDir, `${code}.html`), html);
  console.log(`types/${code}.html`);
}
