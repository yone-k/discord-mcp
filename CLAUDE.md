# Discord MCP Server

## プロジェクト概要

Discord APIとの統合機能を提供するMCP (Model Context Protocol) サーバーの実装です。MCPプロトコルを通じてClaude DesktopなどのAIクライアントがDiscord APIを安全に利用できるようにします。

### 技術スタック

- **言語**: TypeScript
- **フレームワーク**: MCP SDK (@modelcontextprotocol/sdk)
- **バリデーション**: Zod
- **コンテナ**: Docker
- **実行環境**: Node.js 22+
- **テストフレームワーク**: Vitest
- **主要ライブラリ**: MCP SDK, axios (HTTP クライアント)

## アーキテクチャ

### 設計方針

**MCPプロトコル準拠**: Model Context Protocolの仕様に完全準拠し、標準的なMCPクライアントとの互換性を保つ
**ドメイン分離**: Discord API機能、MCPサーバーコア、ツール実装を明確に分離
**型安全性**: TypeScriptとZodを活用した厳密な型チェック
**セキュリティファースト**: Discord Bot トークンの安全な管理と適切な権限制御

### ディレクトリ構造

```
discord-mcp/
├── src/
│   ├── core/              # MCPサーバーのコア機能
│   ├── discord/           # Discord API統合機能
│   ├── tools/             # MCPツール実装
│   ├── types/             # 型定義
│   ├── utils/             # ユーティリティ関数
│   └── index.ts           # エントリーポイント
├── docs/                  # プロジェクト全体のドキュメント
│   ├── architecture/      # アーキテクチャ設計書
│   ├── api/               # Discord API仕様書
│   └── deployment/        # デプロイ手順
└── CLAUDE.md              # このファイル
```

## 開発ガイドライン

### コーディング規約

- **ファイル命名**: kebab-case (例: discord-client.ts)
- **クラス命名**: PascalCase (例: DiscordMCPServer)
- **関数・変数命名**: camelCase (例: setupToolHandlers)
- **定数命名**: UPPER_SNAKE_CASE (例: DEFAULT_TIMEOUT)
- **型命名**: PascalCase with suffix (例: DiscordMessageType)

### 開発フロー

- **Git フロー**: GitHub Flow (main ブランチからfeatureブランチを作成)
- **レビュープロセス**: Pull Request必須、1名以上のレビュー
- **テスト戦略**: ユニットテスト + 統合テスト (Jest使用予定)
- **ツール追加時**: 新しいMCPツールを追加した場合は、必ずTOOLLIST.md（日本語版・英語版）を更新

### 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# テスト実行
npm test
npm run test:watch      # 監視モード
npm run test:coverage   # カバレッジ付き

# ビルド
npm run build

# lint/typecheck
npm run lint
npm run typecheck

# Docker実行
docker run --rm -e DISCORD_TOKEN=your_token discord-mcp
```

## コミットガイドライン

### コミットメッセージの基本形式

```
<type>: <subject>

<body>

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### タイプ分類

- **feat**: 新機能の追加
- **fix**: バグ修正
- **docs**: ドキュメントのみの変更
- **style**: コードの動作に影響しない変更（空白、フォーマット、セミコロンの欠落など）
- **refactor**: バグ修正や機能追加を行わないコードの変更
- **test**: テストの追加や既存テストの修正
- **chore**: ビルドプロセスや補助ツールの変更

### 日本語コミットメッセージの原則

**言語統一**: すべてのコミットメッセージは日本語で記載する
**簡潔性**: 50文字以内の簡潔な件名を心がける
**具体性**: 何を変更したかを具体的に記述する
**理由の明示**: 必要に応じて変更理由をボディに記載する

### コミットメッセージの例

```bash
feat: Discord メッセージ送信機能を追加

- sendMessage ツールの実装
- Zodによる入力バリデーション
- エラーハンドリングとレスポンス処理を含む

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```bash
fix: Discord API認証エラーのハンドリングを修正

- 401エラー時の適切なエラーメッセージ表示
- トークン無効時のリトライロジックを改善

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```bash
docs: README.mdにトラブルシューティングセクションを追加

- よくある問題と解決方法を整理
- Docker関連の問題解決手順を詳細化
- MCP接続エラーの対処法を追加

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 禁止事項

- **英語の混在**: コミットメッセージ内で英語と日本語を混在させない
- **曖昧な表現**: 「修正」「更新」など具体性に欠ける表現の単独使用
- **冗長な説明**: 不必要に長いコミットメッセージ

## クイックスタート

```bash
# 1. ビルド
docker build -t discord-mcp .

# 2. Claude Desktop設定
# ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "discord-mcp": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "-e", "DISCORD_TOKEN=your_token", "discord-mcp"]
    }
  }
}
```

## ドキュメント管理方針

### CLAUDE.mdの更新ルール

プロジェクト内のコードを変更した場合、以下の観点でCLAUDE.mdの更新が必要か検討し、必要に応じて更新を行う：

1. **アーキテクチャの変更**
- 新しいディレクトリやモジュールの追加
- 既存の構造の大幅な変更
- 新しい設計パターンの採用

2. **開発プロセスの変更**
- 新しい開発コマンドの追加
- ビルドプロセスの変更
- テスト戦略の更新

3. **依存関係の変更**
- 新しいライブラリの追加
- メジャーバージョンアップデート
- 技術スタックの変更

### CLAUDE.md肥大化の防止

各CLAUDE.mdファイルは**200-300行以内**を目安に簡潔に保つ：

- **概要とルール**: 必要最小限の情報のみ記載
- **詳細な例**: `docs/examples/`に分離
- **パターンとベストプラクティス**: `docs/patterns/`に分離
- **定期的な見直し**: 古い情報の削除と重複の排除

## 関連ドキュメント

### 開発者向けガイド

- **[機能開発フロー](docs/development-flow.md)**: TDD による新機能追加手順とベストプラクティス
- **[アーキテクチャ設計書](docs/architecture/README.md)**: 詳細な設計原則と構造説明
- **[API仕様書](docs/api/README.md)**: Discord API との統合仕様
- **[デプロイ手順](docs/deployment/README.md)**: 本番環境へのデプロイガイド