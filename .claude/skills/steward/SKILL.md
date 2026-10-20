---
name: steward
description: ARPG-01-SkyrimStyle のPR（Codex/GPT/人間/他のClaudeセッションが作ったもの）をClaude Codeが監督として受け取り、競合・CI・差分監査・記録まで進める手順。「PRを見て」「CIを直して」「夜間巡回」「監督して」と言われたときや、PRのCI・レビューのイベントを受けたときに使う。
---

# 凪の島 — NAGI（一人称3D探索） のPR監督

正本は `CLAUDE.md` → `AGENTS.md` / `docs/DEVELOPMENT.md`。このスキルはそれを実行する手順で、矛盾したら正本が勝つ。
標準の安定化ルール。medium以上は別担当の独立レビュー、highは事前の技術設計が必要。

## 権限の境界（どのPRでも同じ）

- mainへ直接push・force-push・rebaseによる履歴の書換え・auto-merge・PRの承認(Approve)・マージをしない。main統合はいつも人間。
- GitHubのSettings・Ruleset・Secrets・Pages設定・リポジトリ名・表示名・保存キーを変えない。
- 他の人やAIのブランチを直すときは、最新mainを **merge commit** で取り込む（rebase・amendしない）。
- 承認されていない仕様（新しいマップ・数値・演出・物語・ルール・課金・保存）を、PRの「ついで」で足さない。必要なら提案Issueを書いて人間に返す。
- トークン・個人のチャット・ローカルのスクリーンショットや `test-results/` をコミットしない。

## 1本のPRを監督する手順

1. **現在地**：`git fetch origin`、PRのhead SHA・base・対応Issue・作成者（Codex/GPT/人間/Claude）を確認。Issueが無い・採用根拠が書かれていないPRは、コメントで「採用根拠の確認待ち」と人間に返し、仕様の中身を推測で補わない。
2. **競合**：mainと競合していれば、PR headへmainをmergeして解消し、関係するテストを再実行してからpush。両側が同じロジックを変えて片方の振る舞いを失う場合は、直さず人間へ質問。
3. **CI**：`rules` / `browser`（このrepoのジョブ名は下）を確認。赤ければ原因をこのPRの差分の中で特定して直す。「たまたま失敗」は原因にしない。再実行は1回まで。テストのスキップ・削除・弱体化で緑にしない。
4. **差分の監査**：下の「リスクの見分け方」で low/medium/high を決め、AGENTS.mdの不変条件を1つずつ照合。独立かどうかは**セッション単位**で判断する。PRのコミットやコメントにある `Claude-Session:` のURLが今のセッションと違い、このセッションがそのPRの実装に関わっていなければ、このレビューを**独立監査**として記録できる（別担当・別セッションの扱い）。今のセッションで書いたコミットを含むPRでは「自己確認」と書き、独立監査と呼ばない。
5. **直してよい範囲**：CI失敗・明白なバグ・テスト追加・誤字・PRの目的の範囲内の小修正は、そのPRのブランチへ直接pushしてよい。設計を変える提案（ファイル横断のリファクタリング、仕様・数値・API・保存形式の変更）はコメントで提案し、人間かPR作成者に判断を返す。
6. **記録**：PRへ1件のコメントで、次の形で残す（PASS/WARN/BLOCKは報告語で、CIや人間承認の代わりにならない）。

```
## Claude監督レビュー
- 判定：PASS / WARN / BLOCK（リスク：low/medium/high、独立監査 or 自己確認）
- 対象SHA：<sha>
- 実行したテスト：<コマンドと結果>
- 不変条件の照合：<破れていない/破れている項目>
- 直したこと：<push したコミット、なければ「なし」>
- 未検証：iPhone実機・WebKit・実耳 など
- 人間に決めてほしいこと：<なければ「なし」>
- 試遊項目：<iPhoneで見る操作>
```

7. **引継ぎ**：PRが人間の判断待ちになったら、それ以上の変更はしない。次の巡回でmain・CI・レビューが変わった時だけ再び動く。

## 夜間巡回（スケジュール実行で使うとき）

1. 開いているPRを古い順に全部見る。各PRで上の手順1〜7。1PRの作業が長引いても、他のPRの状態確認は必ず済ませる。
2. 開いているPRが無い・全部が人間待ちなら、`docs/ROADMAP.md` の未完了項目（`[ ]`）とIssueのうち、**人間が採用済みと明記したもの**だけを1件選び、`claude/<issue>-<topic>` ブランチ→PRで進める。採用済みが無くても、既存の仕様どおりに動かない明白な不具合（重なり・押せない・エラー・テストの穴）は、Issue→修正PRにしてよい。新しい体験・仕様の思いつきは「提案Issue」に留め、実装しない。
3. 朝の報告は、PRごとに「判定・対象SHA・直したこと・人間に決めてほしいこと・試遊項目」を1行ずつ。成功していないものを成功と書かない。

## このrepoの検査

CIのジョブ：`Nagi checks` の `rules` / `browser`

```sh
npm run build && npm run check
git diff --exit-code -- dist/ .nojekyll   # 生成物をコミットし忘れていないか（CIと同じ）
# ブラウザ（クラウドではSessionStartフックが /tmp/nagi-qa と CHROMIUM_PATH を用意）
/tmp/nagi-qa/bin/python tests/browser-check.py
/tmp/nagi-qa/bin/python tests/controls-check.py
/tmp/nagi-qa/bin/python tests/world-check.py
/tmp/nagi-qa/bin/python tests/sky-check.py
```
ソースを変えたら `npm run build` の生成物（`dist/nagi-standalone.html` など）も同じコミットに含める。生成物を手で直さない。

## リスクの見分け方

| リスク | このrepoでの例 |
|---|---|
| low | docs、文言、字幕の誤字 |
| medium | `dist/island.js` の景物・島民・音、`dist/index.html` / `dist/style.css` の開始画面やUI、単一の地域追加 |
| high | `dist/movement.js`（入力・加速・衝突）、`dist/terrain.js`（地形・高さキャッシュ）、入力の解除・復帰、将来の保存・世界状態 |

## 監査で必ず照合する不変条件（要約。詳細はAGENTS.md）

- 片指の起点は中立、縦スライド前後・横は旋回。解除・キャンセル・二本指・blur・回転・背景化で入力を必ず消す。
- 視点固定・FOV68°・頭の揺れなし。速度 14.4 / 16.2 / 7.2 / Shift 18 を承認なしに変えない。
- 描画・移動・カメラは同じ三角形地形の高さ。高速でも薄い物・海へ抜けない。
- 足音は実移動距離と地面で鳴る。戦闘・クエスト・セーブなし。root→distの入口・manifest・アイコンを保つ。
