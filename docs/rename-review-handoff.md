# ARPG改名準備の統合後レビュー引継ぎ

対象は統合済み [PR #6](https://github.com/hane-san/ARPG-01-SkyrimStyle/pull/6) / [Issue #5](https://github.com/hane-san/ARPG-01-SkyrimStyle/issues/5) と、統合済みの参照修正PR #8、現在名へ合わせる [Issue #10](https://github.com/hane-san/ARPG-01-SkyrimStyle/issues/10) の修正PR。
PR #6はmain `5343128a905b8c526c88b595ef42ea3bd96b73ca` へ統合済み。GitHub上で独立レビュー記録は確認できず、外部での実施有無も未確認のため、統合後レビューとして依頼する。
実装担当とは別担当・別セッションで行う。実装者の再確認は独立レビューに数えない。
SRPGのレビューと並行できるが、対象repo・チェックアウト・報告を混ぜない。

次の依頼を、GitHubへアクセスできる別セッションのCodexまたはClaude Code/Sonnetなどへ渡す。

```text
hane-san/ARPG-01-SkyrimStyle の統合済みPR #6/#8と、Issue #10に対応する現在参照の修正PRを独立レビューしてください。まずrepoの現在名・最新main・各PRのhead SHAを取得し、対象SHAを記録してください。
AGENTS.md、docs/DEVELOPMENT.md、docs/DESIGN.md、docs/DECISIONS.md、docs/QA.md、Issue #5/#7/#10、PR本文、docs/rename-preparation.mdを読んでください。PR #6の差分は基盤統合後main 2f27f4617603c1f90e161005328aabfa777b039b から統合後main 5343128a905b8c526c88b595ef42ea3bd96b73ca まで、PR #8の統合後mainは 6c0e59887742978e9a3e89e1cedaf1fba3840af5 です。各修正PRはそれぞれbase/headを分けて確認してください。
表示設定の生成と未同期検出、root→distとstandaloneの配信、両manifestのname/short_nameとstart_url/scope/idの分離、相対アセットと旧/新サブパスを重点確認してください。
現行設定でroot/dist/standalone/manifest/アイコンとゲームソースに差分がなく、nagi-island/window.nagi/window.nagiBoot/nagi-releaseなどの内部IDが維持されることを確認してください。
現行にセーブ機能がないこと、不要なlocalStorage書込みを増やさないこと、実機のPWA識別・ホーム画面の再登録を検証済みと誤記していないことを確認してください。旧 /Koitototsukuru/ と /ARPG/ は404、現在 /ARPG-01-SkyrimStyle/ は公開済み、hane-no-*は旧案です。現在と履歴を区別してください。
可能な範囲でnpm run build、npm run check、既存Python4検査を実行し、環境・成功/失敗/未実行を記録してください。新旧パス検査はbrowser-checkの完全回帰末尾で呼ばれます。準備とコマンドはDEVELOPMENT/QAに従ってください。
加速を待つ既存ブラウザ検査の調整が、要求する速度やゲーム処理を変えずに判定していることも確認してください。将来の長いタイトルのレイアウトは表示名切替PRの未検証事項として扱ってください。
指摘は重要度、ファイル/行、再現条件、期待/実際、修正方針を添えて報告してください。問題が見つからなければ、その範囲と残るリスクを明記してください。
PASS/WARN/BLOCK、対象SHA、実行済み・未検証、人間の試遊項目、Opus重点監査の要否を報告してください。これらの報告語をGitHub必須チェックやマージ承認と混同しないでください。
今回はレビュー結果を報告するところまでです。コード修正、改名、表示名切替、Settings変更、main push、PRマージ、自動マージは行わないでください。
```

指摘は実装側で修正し、CI・レビュー対象SHAを更新する。レビュー中にPRのheadが変わった場合は再確認する。
準備PR #6は統合済みという事実を保持し、レビューをさかのぼって実施済みと記録しない。問題は別の修正ブランチ/PRへ戻す。
iPhone実機・ホーム画面再登録、外部AIの対象選択、将来の表示名切替は [移行手順](rename-preparation.md) の別工程として残す。

人間が確定した現在名を使い、旧案への追加Renameは行わない。
