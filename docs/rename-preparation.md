# ARPG改名・表示名移行の事前監査と手順

2026-10-18。対象は **hane-san/ARPG（旧Koitototsukuru）だけ**。初期監査の基準main：`80bfd81bdc4e2ca7259d3a643abbf32d0d8ab93f`。
packageはv1.6.0、公開診断値は `2026-10-18-movement-core`。対応：[Issue #5](https://github.com/hane-san/Koitototsukuru/issues/5)。
今回の参照修正では、追加のGitHub Rename、表示名切替、main統合、Settings操作は行わない。SRPGやcyber-punkを変更・統合しない。

## 確定した現在地（2026-10-19）

- 人間がrepo名を `hane-san/ARPG-01-SkyrimStyle` に変更し、この名前へ合わせて進めるよう指示。repo IDは同じ `1419112929`。旧案 `hane-no-ARPG01` へ追加Renameしない。
- 準備PR #6と参照修正PR #8は人間が承認・統合済み。今回の基準mainは `6c0e59887742978e9a3e89e1cedaf1fba3840af5`。
- 現在のPagesは `https://hane-san.github.io/ARPG-01-SkyrimStyle/`。root/distは200、旧 `/ARPG/` と `/Koitototsukuru/` は404。originは現在のGit URLへ更新済み。
- 表示名「凪の島 — NAGI」、release、技術ID、全配布物、両manifestの起動パス・scope/idは維持する。表示名「蒼ト凪ノ島ノ旅」への切替は別の小PR。
- main保護は同一repoのActiveなRulesetを維持。PR #6の独立レビュー記録はGitHub上で未確認であり、承認・統合と分けて[統合後レビュー](rename-review-handoff.md)へ引き継ぐ。iPhone実機・ホーム画面・他環境のAI対象選択は人間が確認する。
- 対応：[Issue #10](https://github.com/hane-san/ARPG-01-SkyrimStyle/issues/10)。以下の2026-10-18の記録とhane-no-*への操作例は旧計画の履歴で、現在の改名指示ではない。現在名から旧案へ変更しない。

## 実際の改名後の現在地（2026-10-18追記）

- repo ID `1419112929` は現在 `hane-san/ARPG`。準備PR #6は人間が統合済みで、main `5343128a905b8c526c88b595ef42ea3bd96b73ca` のCI・Pages配信も成功している。
- `https://hane-san.github.io/ARPG/` と配下のdistは200。旧 `/Koitototsukuru/` は404で自動転送されない。予定 `/hane-no-ARPG01/` も404で、目標候補の名前への改名は未実施。
- 表示名は「凪の島 — NAGI」のまま。表示正本・技術ID・両manifestの起動パスとscope/idは維持する。
- この環境のoriginは `https://github.com/hane-san/ARPG.git` へ更新済み。worktreeはremote設定を共有する。別環境のclone、Codex/Claude/Routineの対象選択、iPhoneホーム画面は人間が確認する。
- GitHub上でPR #6の独立レビュー記録は確認できない。外部での実施有無は未確認。[統合後レビュー](rename-review-handoff.md) を依頼し、実機・外部AI接続は未検証として残す。
- main保護は [検証専用PR #9](https://github.com/hane-san/ARPG/pull/9) で実地確認済み。最新mainが直接の親・競合なし・draftでないPRでrules=failure / browser=successとGitHubのmergeable_state=blockedを確認し、PRを閉じた。マージ操作は試みずmain SHAも不変。独立コード監査の代わりにはしない。
- 対応：[Issue #7](https://github.com/hane-san/ARPG/issues/7)。以下の初期監査・基盤統合時の記録も保持する。

## 基盤統合後の現在地（2026-10-18追記）

この節は準備PR #6を更新した時点の記録。人間による統合・実Rename後の現在地は上の追記を参照。

- 人間が基盤PR #4をマージ。最新main `2f27f4617603c1f90e161005328aabfa777b039b` を本準備ブランチへ通常のmergeで取り込み、共通契約・テンプレート・既存の記録を保持した。
- 人間が設定した [main-protection](https://github.com/hane-san/Koitototsukuru/rules/25345749) をAPIで確認。対象はmainのみ、Active、PR必須・承認人数0、GitHub Actionsの `rules` / `browser` 必須・最新mainへの追随あり、削除・force push禁止、bypassなし。
- 統合済みmainの [CI](https://github.com/hane-san/Koitototsukuru/actions/runs/39135984319) と [Pages配信](https://github.com/hane-san/Koitototsukuru/actions/runs/39135984256) は成功。準備PR自体の最新SHA・再検証結果はPR本文に記録する。
- 失敗CIでマージが止まる実地テスト、独立レビュー、人間の試遊、iPhone実機、実Renameは未実施。設定確認をこれらの完了と扱わない。
- 両作品の準備は並行して進めるが、本PRの差分・検証・独立レビューはARPGだけを対象とする。[独立レビューへの引継ぎ](rename-review-handoff.md)。実RenameはSRPGの移行安定後とする。

## 過去の対応（旧案の履歴）

| 項目 | 初期監査時 | 2026-10-18時点 | 当初の旧案 |
|---|---|---|---|
| Repository | `hane-san/Koitototsukuru` | `hane-san/ARPG` | `hane-san/hane-no-ARPG01` |
| git remote | `https://github.com/hane-san/Koitototsukuru.git` | `https://github.com/hane-san/ARPG.git` | `https://github.com/hane-san/hane-no-ARPG01.git` |
| Pages入口 | `https://hane-san.github.io/Koitototsukuru/`（現在404） | `https://hane-san.github.io/ARPG/` | `https://hane-san.github.io/hane-no-ARPG01/` |
| 実ゲーム | `…/Koitototsukuru/dist/index.html` | `…/ARPG/dist/index.html` | `…/hane-no-ARPG01/dist/index.html` |
| 単体HTML | `…/Koitototsukuru/dist/nagi-standalone.html` | `…/ARPG/dist/nagi-standalone.html` | `…/hane-no-ARPG01/dist/nagi-standalone.html` |
| 表示名 | `凪の島 — NAGI` / `凪の島` | 同じ | `蒼ト凪ノ島ノ旅`（後日の小PR） |

GitHubの旧repo URLの転送と、旧PagesのプロジェクトサイトURLは別。
**旧Pagesは自動転送されない前提**で、新URLを案内し、ブックマークとホーム画面を再登録する。
現在の `/ARPG/` は実公開を確認済み。目標候補 `/hane-no-ARPG01/` の公開と改名先の利用可否は未確認で、追加の実Rename工程として扱う。

## 改名の影響一覧

以下は初期監査で収集した記録。現在のrepo・配信先・統合状態は上の追記を優先する。

| 対象・根拠 | 初期監査時の現状・影響 | 準備時 / 改名後の扱い |
|---|---|---|
| [README](../README.md) | 旧表示名と旧Pagesリンク。版別の更新・操作記録を含む | 今回は手順へのリンクを追加。実改名後に現在の公開リンク・見出しを更新し、歴史記録は保持 |
| [root index](../index.html) | title、Apple名称、h1、説明文に旧名。meta refreshとJSで `./dist/index.html` へ移動 | 名前だけ表示正本から同期。二つの相対redirectとフォールバックリンクは維持 |
| [dist index](../dist/index.html) | title、Apple名称、開始画面h1/欧字、canvasのaria-label、folioに旧名 | 表示正本から同期。開始処理・操作説明・WebGL実装は維持 |
| [単体HTML](../dist/nagi-standalone.html) | CSSと地形・移動・ゲームJSを既存buildがインライン化 | 同じビルドで名称も追随。`nagi-standalone.html` の技術的なファイル名を変えない |
| [表示正本](../display-name.js) | 今回追加。日本語名・副題・欧字・folioだけを持つ | Nodeの生成処理だけで使い、実行時依存やゲームエンジンを追加しない |
| [build](../scripts/build.mjs) | 既存の単体HTML・dist manifest・アイコン生成 | 冒頭で表示同期を行う。現行設定での全配布物は変更前と同一 |
| [root manifest](../manifest.webmanifest) | name=`凪の島 — NAGI`、short_name=`凪の島`、start_url=`./dist/index.html`、scope=`./`、idなし | name/short_nameのみ同期。起動パス・scope・idを変えない |
| [dist manifest](../dist/manifest.webmanifest) | 同じ名称。start_url=`./index.html`、scope=`./`、idなし | rootを基に既存buildが生成。両manifestの開始URL解決結果は同じdist/index.html、scopeはroot/distで異なる |
| PWA識別子 | id未指定ではstart_url由来。repoパス変更は実効識別に影響し得る | 明示id追加やscope統一を推測で実施しない。ホーム画面アプリの同一性は実機で確認 |
| Apple touch / favicon | root/distとも `assets/nagi-icon-120.png` の120×120PNG。AppleタイトルはHTMLに指定 | 画像・ファイル名・サイズを維持。実際の追加先・名前・アイコンは実機で確認 |
| manifest icons | rootとdistそれぞれの相対 `./assets/nagi-icon-120.png`、120×120、purpose=any | 新URLで両方の取得と表示を確認。今回は画像やサイズを増やさない |
| JS/CSSとキャッシュ | HTMLは `nagiBoot=Date.now()` のqueryでCSS/islandを読込。islandはqueryをterrain/movementへ伝搬 | 相対経路と既存更新方法を維持。表示名はHTMLへ生成し、新しい名前モジュールをブラウザからfetchしない |
| ソース・診断ID | `window.nagi`、`window.nagiBoot`、`nagi-release`、package `nagi-island` | 表示名と分離した技術IDとして維持。package version / releaseも今回変更しない |
| 世界内の名称 | 地形データに `凪見の港町` / `NAGIMI HARBOUR` 等がある | 作品表示名の一括置換対象にしない。地形・島民・音・世界設定は変更しない |
| 保存APIとキー | ゲームソースにlocalStorage/sessionStorage/IndexedDBの保存処理なし。セーブ・永続設定機能なし | 引継ぎ対象の保存キーはない。新しい保存・移送機能を作らず、進行継続を保証しない |
| サービスワーカー | 登録コード・配布ファイルなし | 新しい固定キャッシュを導入しない。OS/ブラウザの表示キャッシュは実機で別確認 |
| Pages（API確認） | legacy、main / root、旧URL、status=built | 実Rename後に設定・再配信・新URLを確認。配信先をdistへ勝手に変更しない |
| git remote（取得済み） | origin fetch/pushとも旧Git URL | 今回変更なし。実改名後に各cloneで更新。worktreeはremote設定を共有するため調整 |
| CI / 基盤PR #4 | 初期監査時はmain未配置だったが、現在は基盤PR #4を統合済み。`Nagi checks`、rules/browser、contents:read | 最新mainと同じworkflow・Chromium選択を維持し、既存browser-checkの完全回帰へ新旧パス検査を接続。workflow自体に本PRの差分はない |
| 現在参照と過去資料 | READMEの旧Pagesリンク、基盤PR #4のAGENTS/DEVELOPMENT等のrepo参照、研究記録の旧名 | 実改名後の修復PRで現在参照を更新。過去の判断・URL・SHA・run記録は無差別置換しない |
| 外部AI・Routine・共有先 | Codex/Claude/ChatGPTの対象repo、Routine、ショートカット等の管理状態は未確認 | 実改名後に人間が対象・権限・ブランチを再確認し、実際のIssue→PR受渡しを試す |

旧公開URLのroot / dist HTML / 両manifest / rootアイコンは実HTTPで200を確認し、名称・起動パスは上表と一致した。
初期監査時のGitHubのhomepageは未設定、main protected=falseだった。基盤統合後の保護設定は上の追記を参照。
外部URLは主にPagesの現在参照と、操作研究の参考資料。ゲームの配信コードに旧repoの絶対アセットURLはない。

## 表示名の変更方法

後日の小PRで、`display-name.js` の表示用オブジェクトを変更する。未採用のローマ字名は創作しない。

```js
const display=Object.freeze({name:'蒼ト凪ノ島ノ旅',subtitle:'',wordmark:'',folio:null});
```

```sh
npm run build
npm run check
# npm run sync:display-name も既存buildの別名
```

同期対象はroot/distのtitle・Apple名称・h1、root説明文、distのcanvas名称・folio、root manifest名称。
同じbuildがdist manifestと単体HTMLへ反映する。未同期はcheckで失敗し、生成物もコミットする。
名称を技術ID・パス・releaseに連動させず、root→distの配信構造も維持する。
現行設定でビルドした配布物の差分はない。将来名の試験は隔離したコピーだけで行う。

目標名は長いため、**タイトルの折返し、欧字を省いた余白、開始ボタン・説明の位置、安全領域**は表示名切替PRの受入条件。
今回のNode試験は名称・生成・技術IDの検証であり、将来名のレイアウト検証ではない。
CSSの調整が必要なら表示名切替の小PRで扱い、既存の全画面幅テストと実機確認を行う。
READMEはその小PRで現在の見出しを編集し、研究資料の歴史的な名前は残す。

## 初期計画時の順番（現在の改名指示ではない）

### 改名前

1. 基盤PR #4は統合済みで、main保護もAPIで適用を確認した。本準備ブランチにも最新mainを取り込み、同じCI定義を維持する。新パス検査は既存ブラウザ入口から呼び出す接続を保持する。
2. 準備PR #6は人間が統合済み。リスクmedium。GitHub上で独立レビュー記録を確認できないため統合後レビューを残す。自己検証を独立監査として数えない。
3. `ARPG` への改名・現在URLへの配信は済んでいる。追加で目標候補 `hane-no-ARPG01` へ移す場合は、残るレビュー・移行検証とSRPG側の安定確認後に別工程として扱う。
4. 旧URL、main SHA、package/release、root→dist、開始・一本指移動・停止、ホーム画面の現状を記録する。セーブは未実装なので「進行を復元できた」とは報告しない。
5. 改名先の空き、進行中PR/CI、main Rulesetの適用、Pages設定を確認。ブラウザデータや旧ホーム画面アイコンを先に消去しない。

### Renameと直後

1. さらに目標候補へ改名する場合に限り、**人間が** GitHub Settings → General → Repository nameで現在の `ARPG` を `hane-no-ARPG01` へRename。現在の公開を確認せずに追加改名しない。新repoを作成してコードを複製する工程ではない。
2. clone/worktreeの担当と調整し、`git remote set-url origin https://github.com/hane-san/hane-no-ARPG01.git`。新repoのmain・Issue・PR・Actionsへアクセスできることを確認する。
3. 改名後の修復専用PRでREADMEと基盤PR #4の現在参照、外部AI接続を新repoへ更新。歴史的な観測・run/Issue/PRリンクは保持する。
4. Pagesをmain / rootで確認・再配信。`https://hane-san.github.io/hane-no-ARPG01/` からdistへ入ることを検証。旧Pagesの自動転送は期待しない。
5. 表示名は上記の小PRで切り替え、長い名前のレイアウトも確認する。repo改名と同時でなくてもよい。main直接push・自動マージは行わない。
6. iPhone Safariとホーム画面から起動し、名前・アイコン・縦横・開始・移動/停止・音・背景復帰を確認。新URLで再登録後に旧アイコン・共有リンク・ブックマークを整理する。
7. Codex / Claude Code / Routine / ChatGPTの対象repo・権限・mainブランチと指示を更新。未共有のチャットを参照できると仮定しない。

## 移行後の受入テスト

| 確認 | 期待値 | 事前準備での検証・限界 |
|---|---|---|
| 名称同期 | root/dist/単体HTML/両manifest/Apple名称が表示正本へ追随 | Nodeの一時コピーで将来名と特殊文字、未同期検出/無書込み、build後の同期を検証 |
| root→dist | 新URLから相対redirectで新パス配下のdist/index.htmlへ入る | ローカル旧/新サブパスで検査。本番新URLは実Rename後 |
| JS/CSS・単体HTML | WebGL初期化と島への入場が成功し、404/JS例外なし | 新旧パスで通常起動とstandaloneを検査。実機性能の証明ではない |
| manifest・アイコン | 両manifestのname/short_name、start_url/scopeの相対解決、root/distアイコン取得が正常 | ローカル両パスで検査。OSが選ぶmanifest/インストール識別は未検証 |
| 保存 | 現行に保存機能を追加せず、不要なlocalStorageを書き込まない | 起動と移動でlocalStorageが増えないことを確認。進行復元の検証とはしない |
| 既存操作・地形・描画 | 一本指、加速・停止/capture解除、周回・近道、月の投影が維持される | checkと既存Python4検査。iPhoneの感触・FPS・酔いは未検証 |
| 将来名のレイアウト | 長い題名でも開始ボタン・説明を遮らず、縦横画面と安全領域に収まる | 今回は未検証。表示名切替PRで全画面幅と実機を確認 |
| Pages / CI / 外部AI | 新repoのPR/mainでrules/browser成功、対象SHAを配信し、新repoへIssue/PRを渡せる | 実Rename後の公開・管理画面・接続は未実施 |

実行環境・対象SHA・最終CI結果は準備PR本文へ記録する。
ローカルのURL模擬をGitHubのRename・本番配信・iPhone実機と混同しない。
失敗時は配信設定・修復PR・実機の入口を確認し、人間が延期/再公開を判断する。安易な再改名やデータ消去を復旧策にしない。

参考：[GitHubの改名とPagesの例外](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)、[manifest idの既定値](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/id)。
