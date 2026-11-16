/*
 * 結果ページの表示
 * URL の ?type=TSDP&s=6,-4,-2,-8 を読んで画面を作る
 * (AXES は questions.js、TYPES と pairOf は types.js で定義)
 */
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const code = (params.get("type") || "").toUpperCase();
  const type = TYPES[code];

  // タイプが不正ならタイプチェックページに戻す
  if (!type) {
    location.replace("shindan.html");
    return;
  }

  document.title = `${code} ${type.name} | CIT就活タイプチェック`;
  setText("result-code", code);
  const chara = document.getElementById("result-chara");
  if (chara) { chara.src = `images/chara/${code}.svg`; chara.alt = `${type.name}のキャラクター`; chara.hidden = false; }
  setText("result-name", type.name);
  setText("result-catch", type.catch);
  setText("result-desc", type.desc);

  // 向いている職種
  const jobs = document.getElementById("jobs");
  // js/jobs.js の JOB_LINKS にある職種は、職種ページへのリンクにする
  const links = typeof JOB_LINKS !== "undefined" ? JOB_LINKS : {};
  type.jobs.forEach((job) => {
    const li = document.createElement("li");
    li.className = "chip chip--outline";
    if (links[job]) {
      li.classList.add("chip--link");
      const a = document.createElement("a");
      a.href = `jobs/${links[job]}.html`;
      a.textContent = job;
      li.appendChild(a);
    } else {
      li.textContent = job;
    }
    jobs.appendChild(li);
  });

  // 次の一歩
  const steps = document.getElementById("next-steps");
  // js/steplinks.js で、続きが分かるページがある一歩にはリンクをつける
  type.steps.forEach((step) => {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = step;
    li.appendChild(text);
    const rule = typeof stepLink === "function" ? stepLink(step) : null;
    if (rule) {
      const a = document.createElement("a");
      a.className = "step-link";
      a.href = rule.href;
      a.textContent = rule.label;
      li.appendChild(a);
    }
    steps.appendChild(li);
  });

  // 4軸のバー(スコアがURLにあるときだけ)
  const scores = (params.get("s") || "").split(",").map(Number);
  const NEAR = 2; // スコアの差がこれ以下(40〜60%)なら「どちらにも近い」
  const hasScores = scores.length === 4 && scores.every((n) => Number.isFinite(n) && Math.abs(n) <= 10);
  const axesSection = document.getElementById("axes-section");
  if (hasScores) {
    const box = document.getElementById("axes");
    scores.forEach((score, a) => {
      const right = Math.round(((score + 10) / 20) * 100); // 右側の割合(%)
      const left = 100 - right;
      const near = Math.abs(score) <= NEAR; // 40〜60% は「どちらにも近い」
      const rightWins = score > 0;
      const row = document.createElement("div");
      row.className = near ? "axis-row is-near" : "axis-row";
      row.innerHTML = `
        <div class="axis-labels">
          <span class="${!near && !rightWins ? "is-strong" : ""}">${AXES[a].left.label} ${left}%</span>
          ${near ? `<span class="axis-near">どちらにも近い</span>` : ""}
          <span class="${!near && rightWins ? "is-strong" : ""}">${AXES[a].right.label} ${right}%</span>
        </div>
        <div class="axis-track" role="img" aria-label="${AXES[a].name}:${AXES[a].left.label} ${left}%、${AXES[a].right.label} ${right}%${near ? "(どちらにも近い)" : ""}">
          <div class="axis-fill ${rightWins ? "is-right" : ""}" style="width: ${rightWins ? right : left}%"></div>
        </div>`;
      box.appendChild(row);
    });

    // どちらにも近い軸の説明
    const nearAxes = scores.map((sc, a) => (Math.abs(sc) <= NEAR ? a : -1)).filter((a) => a !== -1);
    const neutral = document.getElementById("axes-neutral");
    if (nearAxes.length === 4) {
      neutral.textContent = "4つの軸すべてが「どちらにも近い」でした。「どちらでもない」が多いと、タイプがはっきり出ません。迷った質問は少しでも近い方を選んで、もう一度チェックしてみてください。";
      neutral.hidden = false;
    } else if (nearAxes.length > 0) {
      neutral.textContent = `「${nearAxes.map((a) => AXES[a].name).join("」「")}」は差が小さく、どちらの面も持っています。タイプの1文字だけで決めつけず、近いタイプも参考にしてください。`;
      neutral.hidden = false;
    }

    // いちばん差が小さい軸を反対にしたタイプ = 近いタイプ(差が小さいときだけ出す)
    let closest = 0;
    scores.forEach((sc, a) => { if (Math.abs(sc) < Math.abs(scores[closest])) closest = a; });
    if (Math.abs(scores[closest]) <= 4 && nearAxes.length < 4) {
      const ax = AXES[closest];
      const nearCode = code.split("").map((c, i) => (i === closest ? (c === ax.left.code ? ax.right.code : ax.left.code) : c)).join("");
      const nearType = TYPES[nearCode];
      if (nearType) {
        document.getElementById("near").href = `types/${nearCode}.html`;
        setText("near-code", nearCode);
        setText("near-name", nearType.name);
        setText("near-catch", nearType.catch);
        setText("near-text", `「${ax.name}」の軸(${ax.left.label} / ${ax.right.label})の差がいちばん小さかったので、そこだけ反対にしたタイプです。`);
        document.getElementById("near-box").hidden = false;
      }
    }
  } else {
    axesSection.hidden = true;
  }

  // 相性のいいタイプ
  const pairCode = pairOf(code);
  const pair = TYPES[pairCode];
  const pairLink = document.getElementById("pair");
  pairLink.href = `types/${pairCode}.html`;
  setText("pair-code", pairCode);
  setText("pair-name", pair.name);
  setText("pair-catch", pair.catch);

  // 前回の結果とくらべる(shindan.js が localStorage に残した履歴)
  try {
    const hist = JSON.parse(localStorage.getItem("cit-shindan-history") || "[]");
    // hist[0] は今回の結果。今回と同じ結果のページを開き直したときだけ比べる
    const now = hist[0];
    const prev = hist[1];
    if (now && prev && now.code === code && params.get("s") === now.s.join(",")) {
      let text;
      if (prev.code === code) {
        text = `前回(${prev.date})も「${code}」でした。結果が安定しています。`;
      } else {
        const changed = AXES.filter((ax, a) => prev.code[a] !== code[a]).map((ax) => ax.name);
        text = `前回(${prev.date})は「${prev.code} ${TYPES[prev.code] ? TYPES[prev.code].name : ""}」でした。変わったのは「${changed.join("」「")}」の軸です。差が小さい軸は、答え方で入れかわることがあります。`;
      }
      setText("history-text", text);
      document.getElementById("history-box").hidden = false;
    }
  } catch (e) { /* 保存できない環境では出さない */ }

  // シェア(共有するのはタイプ別ページ。OGP画像つきで表示される)
  const shareUrl = new URL(`types/${code}.html`, location.href).href;
  const shareText = `私は「${code} ${type.name}」でした!\n#CIT就活タイプチェック`;
  document.getElementById("share-x").href =
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  // LINE:スマホはLINEアプリを直接開くURL、パソコンはLINEの共有ページ
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  document.getElementById("share-line").href = isMobile
    ? `https://line.me/R/share?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`
    : `https://social-plugin.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  // リンクをコピー(LINE・Discordなど、どこにでも貼れる)
  document.getElementById("share-copy").addEventListener("click", async () => {
    const status = document.getElementById("share-status");
    const all = `${shareText}\n${shareUrl}`;
    try {
      await navigator.clipboard.writeText(all);
      status.textContent = "コピーしました。LINEなどに貼りつけて送れます。";
    } catch (e) {
      window.prompt("このリンクをコピーしてください", shareUrl);
    }
  });
});

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
