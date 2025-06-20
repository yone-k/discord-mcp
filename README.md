# Discord MCP Server

[English README](README.en.md)

Discord API MCP (Model Context Protocol) Server - Discord機能をMCP対応クライアントと統合するためのTypeScript実装です。

## 機能

- Zodバリデーションを使用したTypeScript実装
- 簡単なデプロイのためのDockerサポート
- MCPプロトコル準拠
- Discord API統合（近日公開予定）

## 要件

- Docker
- Docker Compose（オプション）

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/discord-mcp.git
cd discord-mcp

# Dockerイメージをビルド
docker build -t discord-mcp .
```

## MCP設定

### Claude Desktop

1. Claude Desktopの設定ファイルを編集します：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. 以下の設定を追加します：

#### Dockerを使用する場合（推奨）

```json
{
  "mcpServers": {
    "discord-mcp": {
      "command": "docker",
      "args": [
        "run", 
        "--rm", 
        "-e", "DISCORD_TOKEN=your_discord_bot_token",
        "discord-mcp"
      ]
    }
  }
}
```

#### ローカルビルドを使用する場合

```json
{
  "mcpServers": {
    "discord-mcp": {
      "command": "node",
      "args": ["/path/to/discord-mcp/dist/index.js"],
      "env": {
        "DISCORD_TOKEN": "your_discord_bot_token"
      }
    }
  }
}
```

#### 開発環境での設定

```json
{
  "mcpServers": {
    "discord-mcp-dev": {
      "command": "npx",
      "args": ["ts-node", "/path/to/discord-mcp/src/index.ts"],
      "cwd": "/path/to/discord-mcp",
      "env": {
        "DISCORD_TOKEN": "your_discord_bot_token",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

### その他のMCPクライアント

stdio方式で接続できる任意のMCPクライアントから利用できます：

```bash
# Dockerで直接実行
docker run --rm -e DISCORD_TOKEN=your_discord_bot_token discord-mcp
```

## 使用方法

### Docker（推奨）

```bash
# 基本実行
docker run --rm -e DISCORD_TOKEN=your_discord_bot_token discord-mcp

# Docker Composeを使用
docker-compose up --build
```

### 開発環境（ローカル開発用）

```bash
# 依存関係をインストール
npm install

# 開発モードで開始
npm run dev
```

## スクリプト

- `npm run build` - TypeScriptをJavaScriptにコンパイル
- `npm run start` - 本番サーバーを開始
- `npm run dev` - ts-nodeを使用して開発モードで開始
- `npm run lint` - ESLintを実行
- `npm run typecheck` - TypeScriptの型チェックを実行

## プロジェクト構造

```
discord-mcp/
├── src/
│   └── index.ts          # メインサーバー実装
├── dist/                 # コンパイル済みJavaScript出力
├── Dockerfile            # Docker設定
├── docker-compose.yml    # Docker Compose設定
├── package.json          # プロジェクト依存関係とスクリプト
├── tsconfig.json         # TypeScript設定
└── README.md             # このファイル
```

## 設定ガイド

### Discord Bot の設定

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. 新しいApplicationを作成
3. Bot タブでBot トークンを取得
4. OAuth2 → URL Generatorで以下の権限を設定：
   - `bot` スコープ
   - `Send Messages` 権限
   - `Read Message History` 権限
5. 生成されたURLでDiscordサーバーに招待

### 環境変数の設定

```bash
# Discord Bot トークンを設定
export DISCORD_TOKEN="your_discord_bot_token_here"

# ログレベルの設定（オプション）
export LOG_LEVEL="info"  # debug, info, warn, error
```

### 設定確認のコマンド

```bash
# Claude Desktop設定ファイルの確認 (macOS)
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# JSON形式の検証
python -m json.tool ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Dockerイメージの確認
docker images | grep discord-mcp
```

## トラブルシューティング

### よくある問題

**Docker起動エラー**: 
- Dockerデーモンが起動していることを確認
- イメージが正しくビルドされているか確認: `docker images | grep discord-mcp`

**Discord API認証エラー**:
- DISCORD_TOKENが正しく設定されているか確認
- Bot トークンの権限スコープを確認
- Discord Developer Portalでトークンが有効か確認

**MCP接続エラー**:
- Claude Desktopの設定ファイル形式を確認（JSONの構文エラーなど）
- ファイルパスが正しく設定されているか確認
- stdioプロトコルでの接続が正常に動作するか確認

**Claude Desktopで認識されない**:
- Claude Desktopを再起動
- 設定ファイルのパスが正しいか確認
- コマンドが実行可能か確認: `which docker` または `which node`

## ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照してください。