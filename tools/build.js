/*
 * サイトの自動生成スクリプト
 *
 * 次のものを js/types.js と js/jobs.js から作り直します。
 *   - 全ページのメニュー(下の NAV を編集すると全ページに反映)
 *   - types/XXXX.html ×16(タイプ別ページ。SNSでシェアされるページ)
 *   - types.html の「16タイプ一覧」部分
 *   - guide.html の「16タイプ別 向いている職種」の表
 *   - jobs.html の職種一覧
 *   - jobs/<id>.html(職種ごとのページ)
 *
 * データやメニューを変えたら、リポジトリのフォルダで次を実行:
 *   node tools/build.js
 *
 * タイプ別ページは SNS でシェアされたときに表示されるページです。
 * X や LINE は JavaScript で書き換えた内容を読まないので、
 * タイプごとに静的な HTML(OGP タグつき)を用意しています。
 */
const fs = require("fs");
const path = require("path");
const { TYPES, pairOf } = require("../js/types.js");
const { JOB_CATEGORIES, JOBS } = require("../js/jobs.js");

// GitHub Pages で公開したときの URL(最後の / を忘れずに)
const SITE_URL = "https://s25g2129nh-ship-it.github.io/cit-cognitive-science-experiment-2-g13/";

const ROOT = path.join(__dirname, "..");

// ---------- メニュー ----------
// children があると、その下に小さなメニューが出る
// group に入っているページを開いているときは、親のメニューが強調される
const NAV = [
  {
    href: "shindan-intro.html", label: "16タイプ診断",
    group: ["shindan-intro.html", "types.html", "result.html", "types/"],
    children: [
      { href: "shindan.html", label: "診断をはじめる" },
      { href: "types.html", label: "16タイプ一覧" },
    ],
  },
  { href: "jobs.html", label: "職種ガイド", group: ["jobs/"] },
  { href: "roadmap.html", label: "ロードマップ" },
  { href: "guide.html", label: "理系の就活ガイド" },
  { href: "glossary.html", label: "用語集" },
  { href: "about.html", label: "このサイトについて" },
];

// 一覧で使うタイプのグループ(最初の2文字)
const GROUPS = [
  { prefix: "TS", name: "モノ・技術 × 安定", text: "技術と向き合いながら、安定した環境で力を発揮するタイプ。" },
  { prefix: "TV", name: "モノ・技術 × 挑戦", text: "技術を武器に、新しいことや変化のある環境に挑むタイプ。" },
  { prefix: "HS", name: "ヒト × 安定", text: "人と関わりながら、安定した組織の中で信頼を積み上げるタイプ。" },
  { prefix: "HV", name: "ヒト × 挑戦", text: "人を巻き込みながら、新しいことを動かしていくタイプ。" },
];

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const codesOf = (prefix) => Object.keys(TYPES).filter((c) => c.startsWith(prefix));
const jobsOfType = (code) => JOBS.filter((j) => j.types.includes(code));

// 職種の写真:images/jobs/<id>.jpg / .png / .webp があれば使う
function jobPhoto(j) {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const rel = `images/jobs/${j.id}.${ext}`;
    if (fs.existsSync(path.join(ROOT, rel))) return rel;
  }
  return null;
}
// prefix: リンクの前につける "../" など、size: "card" か "hero"
function photoHtml(j, prefix, size) {
  const src = jobPhoto(j);
  const credit = j.photoCredit ? `<figcaption class="job-photo-credit">写真:${esc(j.photoCredit)}</figcaption>` : "";
  if (src) {
    return `<figure class="job-photo job-photo--${size}"><img src="${prefix}${src}" alt="${esc(j.name)}の仕事のようす" loading="lazy" width="800" height="600">${credit}</figure>`;
  }
  return `<figure class="job-photo job-photo--${size} job-photo--empty" aria-hidden="true"><span>写真を入れる場所<br><code>images/jobs/${j.id}.jpg</code></span></figure>`;
}

// page: そのページのファイル名(types/ の下は "types/TSDP.html")、prefix: リンクの前につける "../" など
function navHtml(page, prefix = "") {
  const link = (item, extra = "") =>
    `<a href="${prefix}${item.href}"${item.href === page ? ' aria-current="page"' : ""}${extra}>${esc(item.label)}</a>`;
  const items = NAV.map((item) => {
    const active = item.href === page || (item.group || []).some((g) => (g.endsWith("/") ? page.startsWith(g) : g === page));
    if (!item.children) return `          <li>${link(item)}</li>`;
    const subs = item.children.map((c) => `              <li>${link(c)}</li>`).join("\n");
    return `          <li class="has-sub${active ? " is-active" : ""}">
            ${link(item)}
            <ul class="sub-nav">
${subs}
            </ul>
          </li>`;
  }).join("\n");
  return `<nav class="site-nav" id="site-nav" aria-label="メインメニュー">
        <ul>
${items}
        </ul>
      </nav>`;
}

// <!-- NAME:START ... --> と <!-- NAME:END --> のあいだを差し替える
function replaceBetween(file, name, html) {
  const full = path.join(ROOT, file);
  const src = fs.readFileSync(full, "utf8");
  const re = new RegExp(`(<!-- ${name}:START[^>]*-->)[\\s\\S]*?(\\s*<!-- ${name}:END -->)`);
  if (!re.test(src)) throw new Error(`${file} に ${name} の目印が見つかりません`);
  fs.writeFileSync(full, src.replace(re, `$1\n${html}$2`));
  console.log(`${file}(${name})`);
}

// ---------- 1. 全ページのメニュー ----------
const NAV_RE = /<nav class="site-nav"[^>]*>[\s\S]*?<\/nav>/;
for (const file of fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"))) {
  const full = path.join(ROOT, file);
  const src = fs.readFileSync(full, "utf8");
  if (!NAV_RE.test(src)) continue; // 診断ページなどメニューのないページ
  fs.writeFileSync(full, src.replace(NAV_RE, navHtml(file)));
}
console.log("メニュー(全ページ)");

// ---------- 2. タイプ別ページ ----------
const outDir = path.join(ROOT, "types");
fs.mkdirSync(outDir, { recursive: true });

for (const [code, t] of Object.entries(TYPES)) {
  const pairCode = pairOf(code);
  const pair = TYPES[pairCode];
  const related = jobsOfType(code);
  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(`${code} ${t.name} | 就活16タイプ診断`)}</title>
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
      <button class="menu-button" type="button" aria-label="メニューを開く" aria-expanded="false" aria-controls="site-nav">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      ${navHtml(`types/${code}.html`, "../")}
    </div>
  </header>

  <main>
    <div class="container">
      <nav class="breadcrumb" aria-label="現在の位置"><a href="../shindan-intro.html">16タイプ診断</a> › <a href="../types.html">16タイプ一覧</a> › <span aria-current="page">${code}</span></nav>
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
${related.length ? `        <p class="note" style="margin: 16px 0 8px">職種ガイドで仕事内容を見る</p>
        <ul class="link-list">
${related.map((j) => `          <li><a class="link-card" href="../jobs/${j.id}.html"><div><div class="link-card-title">${esc(j.name)}</div><div class="link-card-text">${esc(j.summary)}</div></div></a></li>`).join("\n")}
        </ul>` : ""}
      </div>
    </section>

    <section class="section section--sub">
      <div class="container">
        <h2 class="section-title">このタイプの次の一歩</h2>
        <ol class="next-steps">
${t.steps.map((s) => `          <li>${esc(s)}</li>`).join("\n")}
        </ol>
        <p class="lead">自分のタイプが分からない人は、診断してみましょう。</p>
        <a class="button" href="../shindan-intro.html">就活16タイプ診断へ(約3分)</a>
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
        <p class="center" style="margin-top: 32px"><a href="../types.html">16タイプ一覧に戻る</a></p>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container">
      <a href="../about.html">このサイトについて</a><br>
      千葉工業大学 認知情報科学実験2 グループ13
    </div>
  </footer>
  <script src="../js/common.js"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(outDir, `${code}.html`), html);
}
console.log("types/XXXX.html ×16");

// ---------- 3. types.html の一覧 ----------
replaceBetween("types.html", "TYPE-LIST", GROUPS.map((g) => {
  const cards = codesOf(g.prefix).map((code) => {
    const t = TYPES[code];
    return `          <a class="type-card" href="types/${code}.html">
            <span class="type-code">${code}</span>
            <span class="type-name">${esc(t.name)}</span>
            <span class="type-catch">${esc(t.catch)}</span>
            <span class="type-jobs">${esc(t.jobs.join("、"))}</span>
          </a>`;
  }).join("\n");
  return `    <section class="type-group">
      <div class="type-group-head">
        <h2>${esc(g.name)}</h2>
        <span class="type-group-code">${g.prefix}○○</span>
      </div>
      <p>${esc(g.text)}</p>
      <div class="type-grid">
${cards}
      </div>
    </section>`;
}).join("\n"));

// ---------- 4. guide.html の表 ----------
const guideRows = GROUPS.flatMap((g) => codesOf(g.prefix)).map((code) => {
  const t = TYPES[code];
  return `          <tr><td><a href="types/${code}.html">${code}</a></td><td>${esc(t.name)}</td><td>${esc(t.jobs.join("、"))}</td></tr>`;
}).join("\n");
replaceBetween("guide.html", "GUIDE-TYPES", `    <div class="table-wrap">
      <table class="table--fit">
        <thead>
          <tr><th>タイプ</th><th>タイプ名</th><th>向いている職種の例</th></tr>
        </thead>
        <tbody>
${guideRows}
        </tbody>
      </table>
    </div>`);

// ---------- 5. jobs.html の職種一覧 ----------
const jobIndex = `    <ul class="chips job-index" aria-label="職種の分類">
${JOB_CATEGORIES.map((c) => `      <li><a class="chip" href="#cat-${c.id}">${esc(c.name)}</a></li>`).join("\n")}
    </ul>`;
const typeLinks = (j, prefix) => j.types.map((code) =>
  `            <li><a href="${prefix}types/${code}.html"><span class="job-type-code">${code}</span>${esc(TYPES[code].name)}</a></li>`).join("\n");
const jobSections = JOB_CATEGORIES.map((c) => {
  const cards = JOBS.filter((j) => j.category === c.id).map((j) => `      <article class="job-card" id="${j.id}">
        <div class="job-card-body">
          <h3><a href="jobs/${j.id}.html">${esc(j.name)}</a></h3>
          <p class="job-summary">${esc(j.summary)}</p>
          <dl class="job-meta">
            <dt>近いタイプ</dt>
            <dd><ul class="job-types">
${typeLinks(j, "")}
            </ul></dd>
            <dt>企業の例</dt>
            <dd>${esc(j.companies.join("、"))}</dd>
          </dl>
          <a class="job-more" href="jobs/${j.id}.html">仕事内容・向いている人を見る<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
        </div>
        <a class="job-card-photo" href="jobs/${j.id}.html" tabindex="-1">${photoHtml(j, "", "card")}</a>
      </article>`).join("\n");
  return `    <section class="job-group" id="cat-${c.id}">
      <h2>${esc(c.name)}</h2>
${cards}
    </section>`;
}).join("\n");
replaceBetween("jobs.html", "JOB-LIST", `${jobIndex}\n${jobSections}`);

// ---------- 6. 職種ごとのページ jobs/<id>.html ----------
const jobDir = path.join(ROOT, "jobs");
fs.mkdirSync(jobDir, { recursive: true });
for (const j of JOBS) {
  const cat = JOB_CATEGORIES.find((c) => c.id === j.category);
  const others = JOBS.filter((o) => o.category === j.category && o.id !== j.id);
  const photo = jobPhoto(j);
  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(j.name)} | 職種ガイド | 就活の地図</title>
  <meta name="description" content="${esc(j.summary)}">
  <meta property="og:title" content="${esc(`${j.name} | 理系の職種ガイド`)}">
  <meta property="og:description" content="${esc(j.summary)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${SITE_URL}jobs/${j.id}.html">
${photo ? `  <meta property="og:image" content="${SITE_URL}${photo}">\n  <meta name="twitter:card" content="summary_large_image">\n` : ""}  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a class="logo" href="../index.html">就活の地図</a>
      <button class="menu-button" type="button" aria-label="メニューを開く" aria-expanded="false" aria-controls="site-nav">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      ${navHtml(`jobs/${j.id}.html`, "../")}
    </div>
  </header>

  <main class="container article">
    <nav class="breadcrumb" aria-label="現在の位置"><a href="../jobs.html">職種ガイド</a> › <a href="../jobs.html#cat-${cat.id}">${esc(cat.name)}</a> › <span aria-current="page">${esc(j.name)}</span></nav>
    <div class="page-head job-head">
      <p class="job-head-cat">${esc(cat.name)}</p>
      <h1>${esc(j.name)}</h1>
      <p class="lead">${esc(j.summary)}</p>
    </div>
    ${photoHtml(j, "../", "hero")}

    <h2>主な仕事</h2>
    <ul>
${j.tasks.map((t) => `      <li>${esc(t)}</li>`).join("\n")}
    </ul>

    <h2>こんな人に向いている</h2>
    <ul class="check-list">
${(j.fit || []).map((t) => `      <li>${esc(t)}</li>`).join("\n")}
    </ul>

    <h2>近いタイプ</h2>
    <p>就活16タイプ診断で、この職種に近いタイプです。</p>
    <div class="type-grid">
${j.types.map((code) => `      <a class="type-card" href="../types/${code}.html">
        <span class="type-code">${code}</span>
        <span class="type-name">${esc(TYPES[code].name)}</span>
        <span class="type-catch">${esc(TYPES[code].catch)}</span>
      </a>`).join("\n")}
    </div>

    <h2>関係の深い学び</h2>
    <ul class="chips">
${(j.fields || []).map((f) => `      <li class="chip chip--outline">${esc(f)}</li>`).join("\n")}
    </ul>
    <p class="note">学科が違っても目指せる職種がほとんどです。あくまで目安にしてください。</p>

    <h2>この職種がある企業の例</h2>
    <ul class="chips">
${j.companies.map((co) => `      <li class="chip">${esc(co)}</li>`).join("\n")}
    </ul>
    <p class="note">採用の有無や学校推薦の枠は年度によって変わります。就職課の求人票や各社の採用ページで確認してください。</p>
${others.length ? `
    <h2>${esc(cat.name)}のほかの職種</h2>
    <ul class="link-list">
${others.map((o) => `      <li><a class="link-card" href="${o.id}.html"><div><div class="link-card-title">${esc(o.name)}</div><div class="link-card-text">${esc(o.summary)}</div></div></a></li>`).join("\n")}
    </ul>
` : ""}
    <div class="cta-box">
      <p>自分に近いタイプが分からない人は、診断してみましょう。20問・約3分です。</p>
      <a class="button" href="../shindan-intro.html">就活16タイプ診断へ</a>
    </div>
    <p class="center" style="margin-top: 32px"><a href="../jobs.html">職種ガイドに戻る</a></p>
  </main>

  <footer class="site-footer">
    <div class="container">
      <a href="../about.html">このサイトについて</a><br>
      千葉工業大学 認知情報科学実験2 グループ13
    </div>
  </footer>
  <script src="../js/common.js"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(jobDir, `${j.id}.html`), html);
}
console.log(`jobs/<id>.html ×${JOBS.length}`);
