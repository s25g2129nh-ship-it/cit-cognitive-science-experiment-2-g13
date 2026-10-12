/*
 * 結果ページの表示
 * URL の ?type=TSDP&s=6,-4,-2,-8 を読んで画面を作る
 * (AXES は questions.js、TYPES と pairOf は types.js で定義)
 */
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const code = (params.get("type") || "").toUpperCase();
  const type = TYPES[code];

  // タイプが不正なら診断ページに戻す
  if (!type) {
    location.replace("shindan.html");
    return;
  }

  document.title = `${code} ${type.name} | 就活16タイプ診断`;
  setText("result-code", code);
  setText("result-name", type.name);
  setText("result-catch", type.catch);
  setText("result-desc", type.desc);

  // 向いている職種
  const jobs = document.getElementById("jobs");
  type.jobs.forEach((job) => {
    const li = document.createElement("li");
    li.className = "chip chip--outline";
    li.textContent = job;
    jobs.appendChild(li);
  });

  // 次の一歩
  const steps = document.getElementById("next-steps");
  type.steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    steps.appendChild(li);
  });

  // 4軸のバー(スコアがURLにあるときだけ)
  const scores = (params.get("s") || "").split(",").map(Number);
  const hasScores = scores.length === 4 && scores.every((n) => Number.isFinite(n) && Math.abs(n) <= 10);
  const axesSection = document.getElementById("axes-section");
  if (hasScores) {
    const box = document.getElementById("axes");
    scores.forEach((score, a) => {
      const right = Math.round(((score + 10) / 20) * 100); // 右側の割合(%)
      const left = 100 - right;
      const rightWins = score > 0;
      const row = document.createElement("div");
      row.innerHTML = `
        <div class="axis-labels">
          <span class="${rightWins ? "" : "is-strong"}">${AXES[a].left.label} ${left}%</span>
          <span class="${rightWins ? "is-strong" : ""}">${AXES[a].right.label} ${right}%</span>
        </div>
        <div class="axis-track" role="img" aria-label="${AXES[a].left.label} ${left}%、${AXES[a].right.label} ${right}%">
          <div class="axis-fill ${rightWins ? "is-right" : ""}" style="width: ${rightWins ? right : left}%"></div>
        </div>`;
      box.appendChild(row);
    });
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

  // シェア(共有するのはタイプ別ページ。OGP画像つきで表示される)
  const shareUrl = new URL(`types/${code}.html`, location.href).href;
  const shareText = `私は「${code} ${type.name}」でした!\n#就活16タイプ診断`;
  document.getElementById("share-x").href =
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  document.getElementById("share-line").href =
    `https://social-plugin.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
});

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
