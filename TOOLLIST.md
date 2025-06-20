# Discord MCP Server - ツール一覧

[English Version](TOOLLIST.en.md)

Discord MCP Serverで利用可能なツールの一覧と詳細説明です。

## 利用可能なツール

### get_server_list

Botが参加しているDiscordサーバーの一覧を取得します。

**パラメータ:**
- `includeDetails` (boolean, optional): 詳細情報（メンバー数、オンライン数、機能一覧）を含めるかどうか
  - デフォルト: `false`

**戻り値:**
```json
{
  "servers": [
    {
      "id": "string",
      "name": "string", 
      "iconUrl": "string | null",
      "memberCount": "number (includeDetails=trueの場合)",
      "onlineCount": "number (includeDetails=trueの場合)",
      "features": "string[] (includeDetails=trueの場合)"
    }
  ],
  "totalCount": "number"
}
```

**使用例:**
```javascript
// 基本的な一覧取得
await getServerList({ includeDetails: false });

// 詳細情報付きで取得
await getServerList({ includeDetails: true });
```

### get_server_details

特定のDiscordサーバーの詳細情報を取得します。

**パラメータ:**
- `serverId` (string, required): 詳細情報を取得するサーバーのID

**戻り値:**
```json
{
  "server": {
    "id": "string",
    "name": "string",
    "description": "string | null",
    "iconUrl": "string | null",
    "createdAt": "string (ISO 8601)",
    "ownerId": "string",
    "region": "string",
    "afkChannelId": "string | null",
    "afkTimeout": "number",
    "memberCount": "number",
    "onlineCount": "number", 
    "boostCount": "number",
    "boostLevel": "number",
    "channelsCount": "number",
    "rolesCount": "number",
    "emojisCount": "number",
    "stickersCount": "number",
    "features": "string[]"
  }
}
```

**使用例:**
```javascript
// 特定サーバーの詳細情報を取得
await getServerDetails({ serverId: "123456789012345678" });
```

## エラーハンドリング

すべてのツールは以下の形式でエラーを返します：

```json
{
  "error": "エラーメッセージ"
}
```

### 一般的なエラー

- **認証エラー**: Discord Bot トークンが無効または設定されていない
- **権限エラー**: Botが必要な権限を持っていない
- **サーバーアクセスエラー**: 指定されたサーバーIDが見つからない、またはBotが参加していない
- **API制限エラー**: Discord APIのレート制限に達した

## 必要な権限

これらのツールを使用するには、Discord Botに以下の権限が必要です：

- **サーバー情報の表示**: サーバー一覧と基本情報の取得に必要
- **Botスコープ**: Discord サーバーへの参加に必要

## 設定について

ツールを使用する前に、以下の設定が必要です：

1. **Discord Bot Token**: 環境変数 `DISCORD_TOKEN` に設定
2. **MCP設定**: Claude Desktopまたはその他のMCPクライアントでの設定

詳細な設定方法については[README.md](README.md)を参照してください。