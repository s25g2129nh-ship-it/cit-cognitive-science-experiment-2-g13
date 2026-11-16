/*
 * タイプチェックページの動き
 * 1問ずつ表示 → 回答を記録 → 最後に「結果を見る」で calcType で集計 → 結果ページへ
 * (QUESTIONS, CHOICES, calcType は questions.js で定義)
 */
document.addEventListener("DOMContentLoaded", () => {
  const total = QUESTIONS.length;
  const KEY = "cit-shindan-progress";
  let answers = new Array(total).fill(null);
  let current = 0;

  // 途中の回答を sessionStorage に残す(ブラウザの戻る・再読み込みで消えないように)
  // 「もう一度チェックする」(shindan.html?new=1)のときは最初から
  const params = new URLSearchParams(location.search);
  try {
    if (params.has("new")) {
      sessionStorage.removeItem(KEY);
      history.replaceState(null, "", "shindan.html");
    } else {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
      if (saved && Array.isArray(saved.answers) && saved.answers.length === total) {
        answers = saved.answers;
        current = Math.min(Math.max(0, saved.current | 0), total - 1);
      }
    }
  } catch (e) { /* 保存できない環境では何もしない */ }

  function save() {
    try { sessionStorage.setItem(KEY, JSON.stringify({ answers, current })); } catch (e) { /* 無視 */ }
  }

  const elNo = document.getElementById("quiz-no");
  const elQuestion = document.getElementById("quiz-question");
  const elCount = document.getElementById("quiz-count");
  const elProgress = document.getElementById("progress");
  const elFill = document.getElementById("progress-fill");
  const elAnswers = document.getElementById("answers");
  const elBack = document.getElementById("back-button");
  const elFinish = document.getElementById("finish");
  const elFinishButton = document.getElementById("finish-button");

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
    const done = answers.filter((a) => a !== null).length;
    // 上の数字とバーは、どちらも「答えた数」を表す
    elCount.textContent = `${done}/${total}`;
    elFill.style.width = `${(done / total) * 100}%`;
    elProgress.setAttribute("aria-valuenow", String(done));
    buttons.forEach((btn, i) => {
      btn.setAttribute("aria-pressed", String(answers[current] === CHOICES[i].value));
    });
    elBack.disabled = current === 0;
    // 最後の質問に答えたら「結果を見る」を出す(すぐには移動しないので、答えを直せる)
    const isLast = current === total - 1 && answers[current] !== null;
    elFinish.hidden = !isLast;
  }

  function choose(value) {
    if (locked) return;
    answers[current] = value;
    save();
    render();
    locked = true;
    // 選んだのが見えるように少し待ってから次へ
    setTimeout(() => {
      locked = false;
      if (current < total - 1) {
        current += 1;
        save();
        render();
        elQuestion.focus();
      } else {
        elFinishButton.focus();
      }
    }, 250);
  }

  function finish() {
    // 答えていない質問があれば、そこに戻る
    const empty = answers.indexOf(null);
    if (empty !== -1) {
      current = empty;
      save();
      render();
      elQuestion.focus();
      return;
    }
    const { code, scores } = calcType(answers);
    // 結果の履歴を残す(結果ページで前回と比べるため。新しい順に最大10件)
    try {
      const hist = JSON.parse(localStorage.getItem("cit-shindan-history") || "[]");
      hist.unshift({ code, s: scores, date: new Date().toISOString().slice(0, 10) });
      localStorage.setItem("cit-shindan-history", JSON.stringify(hist.slice(0, 10)));
    } catch (e) { /* 保存できない環境では何もしない */ }
    location.href = `result.html?type=${code}&s=${scores.join(",")}`;
  }

  elBack.addEventListener("click", () => {
    if (current > 0) {
      current -= 1;
      save();
      render();
    }
  });

  elFinishButton.addEventListener("click", finish);

  // キーボードの 1〜5 でも答えられるようにする
  document.addEventListener("keydown", (e) => {
    const n = Number(e.key);
    if (n >= 1 && n <= CHOICES.length && !e.ctrlKey && !e.metaKey && !e.altKey) {
      choose(CHOICES[n - 1].value);
    }
  });

  render();
});
