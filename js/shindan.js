/*
 * 診断ページの動き
 * 1問ずつ表示 → 回答を記録 → 最後に calcType で集計 → 結果ページへ
 * (QUESTIONS, CHOICES, calcType は questions.js で定義)
 */
document.addEventListener("DOMContentLoaded", () => {
  const total = QUESTIONS.length;
  const answers = new Array(total).fill(null);
  let current = 0;

  const elNo = document.getElementById("quiz-no");
  const elQuestion = document.getElementById("quiz-question");
  const elCount = document.getElementById("quiz-count");
  const elProgress = document.getElementById("progress");
  const elFill = document.getElementById("progress-fill");
  const elAnswers = document.getElementById("answers");
  const elBack = document.getElementById("back-button");

  // 選択肢のボタンを作る(1回だけ)
  const buttons = CHOICES.map((choice) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "answer";
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML =
      `<span>${choice.label}</span>` +
      `<svg class="answer-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>`;
    btn.addEventListener("click", () => choose(choice.value));
    elAnswers.appendChild(btn);
    return btn;
  });

  let locked = false; // 連打で2問進むのを防ぐ

  function render() {
    const q = QUESTIONS[current];
    elNo.textContent = `Q${current + 1}`;
    elQuestion.textContent = q.text;
    elCount.textContent = `${current + 1}/${total}`;
    const done = answers.filter((a) => a !== null).length;
    elFill.style.width = `${(done / total) * 100}%`;
    elProgress.setAttribute("aria-valuenow", String(done));
    buttons.forEach((btn, i) => {
      btn.setAttribute("aria-pressed", String(answers[current] === CHOICES[i].value));
    });
    elBack.disabled = current === 0;
  }

  function choose(value) {
    if (locked) return;
    answers[current] = value;
    render();
    locked = true;
    // 選んだのが見えるように少し待ってから次へ
    setTimeout(() => {
      locked = false;
      if (current < total - 1) {
        current += 1;
        render();
        elQuestion.focus();
      } else {
        finish();
      }
    }, 250);
  }

  function finish() {
    const { code, scores } = calcType(answers);
    location.href = `result.html?type=${code}&s=${scores.join(",")}`;
  }

  elBack.addEventListener("click", () => {
    if (current > 0) {
      current -= 1;
      render();
    }
  });

  // キーボードの 1〜5 でも答えられるようにする
  document.addEventListener("keydown", (e) => {
    const n = Number(e.key);
    if (n >= 1 && n <= CHOICES.length && !e.ctrlKey && !e.metaKey && !e.altKey) {
      choose(CHOICES[n - 1].value);
    }
  });

  render();
});
