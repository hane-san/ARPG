# ARPG改名準備PRの独立レビュー引継ぎ

対象は [PR #6](https://github.com/hane-san/Koitototsukuru/pull/6) / [Issue #5](https://github.com/hane-san/Koitototsukuru/issues/5) だけ。
実装担当とは別担当・別セッションで行う。実装者の再確認は独立レビューに数えない。
SRPGのレビューと並行できるが、対象repo・チェックアウト・報告を混ぜない。

次の依頼を、GitHubへアクセスできる別セッションのCodexまたはClaude Code/Sonnetなどへ渡す。

```text
hane-san/Koitototsukuru のPR #6を独立レビューしてください。まず最新mainとPRの現在のhead SHAを取得し、対象SHAを記録してください。
AGENTS.md、docs/DEVELOPMENT.md、docs/DESIGN.md、docs/DECISIONS.md、docs/QA.md、Issue #5、PR本文、docs/rename-preparation.mdを読み、最新mainとの差分を確認してください。
表示設定の生成と未同期検出、root→distとstandaloneの配信、両manifestのname/short_nameとstart_url/scope/idの分離、相対アセットと旧/新サブパスを重点確認してください。
現行設定でroot/dist/standalone/manifest/アイコンとゲームソースに差分がなく、nagi-island/window.nagi/window.nagiBoot/nagi-releaseなどの内部IDが維持されることを確認してください。
現行にセーブ機能がないこと、不要なlocalStorage書込みを増やさないこと、実機のPWA識別・ホーム画面の再登録を検証済みと誤記していないことを確認してください。旧Pagesの自動転送も仮定しないでください。
可能な範囲でnpm run build、npm run check、既存Python4検査を実行し、環境・成功/失敗/未実行を記録してください。新旧パス検査はbrowser-checkの完全回帰末尾で呼ばれます。準備とコマンドはDEVELOPMENT/QAに従ってください。
加速を待つ既存ブラウザ検査の調整が、要求する速度やゲーム処理を変えずに判定していることも確認してください。将来の長いタイトルのレイアウトは表示名切替PRの未検証事項として扱ってください。
指摘は重要度、ファイル/行、再現条件、期待/実際、修正方針を添えて報告してください。問題が見つからなければ、その範囲と残るリスクを明記してください。
PASS/WARN/BLOCK、対象SHA、実行済み・未検証、人間の試遊項目、Opus重点監査の要否を報告してください。これらの報告語をGitHub必須チェックやマージ承認と混同しないでください。
今回はレビュー結果を報告するところまでです。コード修正、改名、表示名切替、Settings変更、main push、PRマージ、自動マージは行わないでください。
```

指摘は実装側で修正し、CI・レビュー対象SHAを更新する。レビュー中にPRのheadが変わった場合は再確認する。
mediumの独立レビューと人間の試遊・承認が完了するまで準備PRをマージしない。
将来のiPhone実機・実Rename・新Pages・ホーム画面再登録は [移行手順](rename-preparation.md) の別工程として残す。
