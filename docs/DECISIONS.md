# 採用判断の記録

採用済み／提案／保留／変更・旧仕様／未検証を分ける。
新しい判断には日付、決裁者、根拠Issue/資料、理由、影響と受入条件を記録し、実装状態はmainと照合する。

## D001 — 共通のAI開発運用（2026-10-18、採用済み・導入PR）

- 決裁：はねさん。提供資料「261018_AIゲーム開発_実行マニュアル」v1.0と、SRPG→Koitototsukuruの順で導入する採用判断。対応：[Issue #3](https://github.com/hane-san/Koitototsukuru/issues/3)。
- 理由：CodexとClaude Code/Sonnetの双方へ、同じ受入条件・検証証拠を渡せるようにする。GitHub Docs/Issue/PRを受渡しの正本にする。
- 採用：Chatの採否→Issue→専用ブランチ→PR→CI→リスク別独立監査→人間の試遊・承認→main。必要時Opusの高度設計・重点監査を使う。モデルの版を固定依存にしない。
- 共通化：開発契約、文書の役割、テンプレート、検証・監査の記録。各作品のエンジン配置・テストコマンドは個別に維持する。
- 受入：既存資料を保持し、PR CIを追加。PASS/WARN/BLOCKとGitHubの必須チェックを区別する。
- 未実施：main保護の管理設定、両実装ラインでの試行、独立監査・実機試遊、夜間Routine。文書追加だけで設定完了としない。
- 先行導入：[SRPG PR #11](https://github.com/hane-san/SRPG/pull/11)（PR CI成功。人間承認・main統合は別途）。

## D002 — 現行の移動設計を参照（既存判断の索引）

- 根拠：[移動基幹](movement-core.md)、[研究記録](movement-research.md)、導入前main `80bfd81bdc4e2ca7259d3a643abbf32d0d8ab93f`（package v1.6.0）。
- 実装済み：一本指の前後移動＋水平旋回、固定視点・画角、継続加速、連続衝突、共用地形高さ、既存の島と島民・音。
- 旧仕様：横スライドを横歩きから旋回へ切替える案、旧速度・旧衝突方式。研究とREADMEの当時の観測を削除せず保持する。
- 未実装：戦闘・クエスト・セーブ・複雑な永続世界状態。これらの採用・実装を今回の運用導入から推論しない。
- 未検証：iPhoneのフレームレート・操作感・酔いの個人差。CPU処理単体の計測を端末性能と同一視しない。

## D003 — 改名は別工程（保留）

- 現行repo：`hane-san/Koitototsukuru`、Pages：`https://hane-san.github.io/Koitototsukuru/`。
- 提供マニュアルの目標repo `hane-no-ARPG01`、表示名「蒼ト凪ノ島ノ旅」は別の移行工程。今回、改名・manifest・表示名・URL・内部IDを変更しない。
- 旧Pages URLの転送を仮定せず、移行時は相対パス、ホーム画面登録、公開入口と保存/設定の有無を別途確認する。
