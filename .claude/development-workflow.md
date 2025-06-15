# 開発ワークフロー規則

## 基本ルール

### 1. 開発開始時の必須手順
1. **最初に必ず `.claude/todo.md` を確認する**
2. **作業用 `temp/current-task.md` ファイルを作成**
3. **Claude Code の TodoWrite ツールでタスクを管理**

### 2. ファイル構成

#### プロジェクト管理ファイル
- `.claude/todo.md` - プロジェクト全体の開発ToDo（番号付きチェックリスト）
- `.claude/development-workflow.md` - 本ワークフロー規則（このファイル）

#### 一時作業ファイル（コミット対象外）
- `temp/current-task.md` - 現在作業中のタスク詳細
- `temp/notes.md` - 開発メモ・調査結果
- `temp/research.md` - 技術調査・実装案検討

### 3. 開発フロー

#### ステップ1: タスク確認・選択
```bash
# 1. プロジェクト全体TODO確認
cat .claude/todo.md

# 2. 現在のgitステータス確認
git status

# 3. developブランチに移動・最新化
git checkout develop
git pull origin develop
```

#### ステップ2: 作業準備 🚨 CRITICAL STEP
```bash
# 1. 新しいfeatureブランチ作成（必須！）
git checkout -b feature/[タスク名]

# 2. tempディレクトリ作成（存在しない場合）
mkdir -p temp

# 3. 現在作業タスクファイル作成
echo "# 現在の作業タスク

## 選択したタスク
- [ ] [タスク名]

## 実装計画
1. 
2. 
3. 

## 進捗メモ
- 

## 問題・課題
- 

" > temp/current-task.md
```

#### ステップ3: 実装・テスト
1. `temp/current-task.md` を参照しながら実装
2. Claude Code の TodoWrite で進捗管理
3. `npm run lint` で品質チェック
4. 動作確認

#### ステップ4: 完了・更新 🚨 CRITICAL STEP
1. `.claude/todo.md` のステータス更新
2. tempファイルのクリーンアップ（必要に応じて）
3. **必須**: コミット・プッシュ・PR作成まで完了
4. developブランチにマージ
```bash
# 作業完了後
git add .
git commit -m "feat: [実装内容]"
git push origin feature/[タスク名]

# PRを作成（日本語で記述、必ずdevelopベース）
gh pr create --base develop --title "機能追加: [実装内容]" --body "## 概要\n[変更内容を日本語で記述]"

# developにマージ（PRまたは直接マージ）
git checkout develop
git merge feature/[タスク名]
git push origin develop

# 作業ブランチ削除（任意）
git branch -d feature/[タスク名]
```

### 4. ファイル管理ルール

#### コミット対象
- ✅ `.claude/todo.md`
- ✅ `.claude/development-workflow.md`
- ✅ 実装したソースコード

#### コミット対象外（.gitignoreで除外）
- ❌ `temp/` ディレクトリ全体
- ❌ 一時的なメモ・調査ファイル

### 5. Claude Code 使用時の注意

1. **必ず TodoWrite ツールを使用**してタスク管理
2. **開発開始時に .claude/todo.md を確認**
3. **temp/current-task.md で作業内容を明確化**
4. **完了時は必ずステータス更新**
5. **🚨 CRITICAL: 実装作業前に必ずブランチ作成・切り替え**
6. **🚨 CRITICAL: 実装完了後は必ずコミット・プッシュ・PR作成まで完了**
7. **🚨 CRITICAL: PR作成時は必ず--base developを指定**（masterではなくdevelop）
8. **PR作成時は必ず日本語でタイトル・本文を記述**（プロジェクト規約）

### 6. Git ブランチ運用ルール

#### ブランチ構成
- **develop**: 開発ベースブランチ（`.claude/context.md`記載の通り）
- **feature/[機能名]**: 機能開発ブランチ
- **fix/[修正内容]**: バグ修正ブランチ
- **master**: 本番リリースブランチ

#### 命名規則
```bash
# 機能追加
feature/model-selection
feature/export-functionality

# バグ修正
fix/streaming-error-handling
fix/responsive-layout

# 改善・リファクタリング
improve/code-quality
refactor/component-structure
```

#### マージ戦略
- **基本**: feature/* → develop
- **リリース**: develop → master
- **ホットフィックス**: fix/* → develop + master

### 7. 緊急時・問題発生時

1. `temp/debug.md` に問題詳細記録
2. `.claude/debug-log.md` に永続的な解決策記録
3. 必要に応じて `.claude/project-improvements.md` に改善案追加

---

## このワークフローの目的

- **AIが現状を把握しやすくする**
- **タスクの優先度・進捗を明確化**
- **一時ファイルでの柔軟な作業管理**
- **プロジェクト全体の開発効率向上**