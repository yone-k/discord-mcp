# デプロイメントガイド

## 概要

Discord MCP Server の本番環境デプロイ手順を記載します。

## Docker デプロイ

```bash
docker build -t discord-mcp .
docker run --rm -e DISCORD_TOKEN=your_token discord-mcp
```

## Claude Desktop 設定

```json
{
  "mcpServers": {
    "discord-mcp": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "-e", "DISCORD_TOKEN=your_token", "discord-mcp"]
    }
  }
}
```

## 詳細手順

（今後追加予定）