# 就活の地図(認知情報科学実験2 グループ13)

就活について何も知らない理系学生のためのサイト。
目玉は「就活16タイプ診断」で、診断結果から「次の一歩」とロードマップにつなげる。

- 締切: 11月30日
- 技術: HTML / CSS / JavaScript だけ(サーバー・データベースなし)
- 公開: GitHub Pages

## 手元で見る

`index.html` をダブルクリックしてブラウザで開くだけで動きます。

## ページ構成

| ファイル | 中身 |
| --- | --- |
| `index.html` | トップ(診断ボタンが主役) |
| `shindan-intro.html` | 診断について(分かること・4つの軸・答え方)。メニューの「16タイプ診断」はここ |
| `shindan.html` | 診断(20問を1問ずつ表示) |
| `result.html` | 診断結果(`?type=TSDP&s=4,-4,0,0` を読んで表示) |
| `types.html` | 16タイプ一覧(4つの軸の説明と全タイプ) |
| `types/XXXX.html` | タイプ別ページ ×16(SNSでシェアされるページ) |
| `touroku.html` | 進路希望登録の案内(CITポータルの進路希望登録でできること・登録のしかた) |
| `sources.html` | 情報源ガイド(就活サイト・スカウト型・口コミサイト・学内説明会の違い) |
| `senkou.html` | 選考対策(ES・Webテスト・面接の基本、先輩の声) |
| `support.html` | 学内支援まとめ(先輩がよく使った学内の就職支援) |
| `jobs.html` | 職種ガイド(職種の一覧。各カードの右に写真) |
| `jobs/<id>.html` | 職種ごとのページ ×25(主な仕事・向いている人・近いタイプ・関係の深い学び・企業の例) |
| `roadmap.html` | 就活ロードマップ |
| `guide.html` | 理系の就活ガイド(院進・推薦・職種) |
| `glossary.html` | 就活用語集 |
| `about.html` | このサイトについて・アンケート結果 |

## フォルダ構成

```
css/style.css            共通スタイル(色は先頭の変数で管理)
js/questions.js          質問20問、4つの軸、集計の関数 calcType
js/types.js              16タイプのデータ(名前・説明・職種・次の一歩)
js/jobs.js               職種ガイドのデータ(仕事内容・向いている人・近いタイプ・企業の例)
js/shindan.js            診断ページの動き
js/result.js             結果ページの表示とシェアボタン
js/common.js             スマホのメニュー開閉
images/ogp/XXXX.png      シェア用画像 ×16(1200×630)
images/jobs/<id>.jpg     職種の写真(置くと職種ガイドと職種ページに出る。ないあいだは点線の枠)
tools/build.js           メニュー、types/ のページ、types.html の一覧、guide.html の表、jobs.html、jobs/ のページを作り直すスクリプト
tools/test-shindan.js    診断ロジックと職種データのテスト
```

## よくある作業

**質問を変える** → `js/questions.js` の `QUESTIONS` を編集。
`axis` は軸の番号(0: ヒト/モノ、1: 安定/挑戦、2: 深く/広く、3: 計画/行動)、
`dir` は「そう思う」で右側に加点するなら `1`、左側なら `-1`。
1軸5問のまま、左右の向きを混ぜてください。

**タイプの説明・職種ガイド・メニューを変える** → `js/types.js`、`js/jobs.js`、または `tools/build.js` の `NAV` を編集したあと、次を実行(Node.js が必要)。
全ページのメニュー、タイプ別ページ、16タイプ一覧、理系の就活ガイドの表、職種ガイドがまとめて更新されます:

```
node tools/build.js
node tools/test-shindan.js
```

**ページを追加する** → 既存のページをコピーして中身を書きかえ、`tools/build.js` の `NAV` にリンクを足して実行すると、全ページのメニューに出ます。

テストで「全部 OK」と出れば大丈夫です。

**色を変える** → `css/style.css` の先頭の `:root { ... }` だけ変えれば全ページに反映されます。

## 公開(GitHub Pages)

1. GitHub のリポジトリで Settings → Pages を開く
2. Source を「Deploy from a branch」、Branch を `main` / `(root)` にして Save
3. 数分後に `https://<ユーザー名>.github.io/cit-cognitive-science-experiment-2-g13/` で見られる

公開URLが上と違う場合は、`tools/build.js` の `SITE_URL` を直して実行し直してください
(シェアしたときの画像はこのURLを使います)。

## まだやること

- [x] アンケート結果を `about.html` に載せる(主な数字は掲載済み。グラフを足すとさらに良い)
- [ ] `touroku.html` `support.html` のチームメモ(メニュー名・受付時期・講座の開催時期)を就職課で確認して直す
- [ ] `roadmap.html` の時期を最新の就活スケジュールで確認する
- [ ] 16タイプの説明・職種を先輩や就職課に確認してもらう
- [ ] 友人テスト(診断結果に納得したか、次に何をするか分かったか)
- [ ] 参考文献を `about.html` に書く
- [ ] 職種の写真を `images/jobs/<id>.jpg` に入れる(横長 4:3 か 16:9、幅800px くらい。フリー素材なら利用規約を確認し、`js/jobs.js` の `photoCredit` に出典を書く)→ `node tools/build.js`
- [ ] `js/jobs.js` の企業の例を、就職課の求人票や先輩の就職先で確認して入れかえる
