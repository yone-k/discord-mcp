# Discord ディレクトリ

## 概要

Discord APIとの統合機能を提供するディレクトリです。Discord REST APIを直接呼び出すHTTPクライアントの実装、レート制限対応、認証管理を担当します。

## 設計方針

### API First Design

Discord APIの公式仕様に厳密に準拠し、将来的な変更に対応可能な設計

### Rate Limiting Compliance

Discord APIのレート制限を遵守し、429エラーを適切に処理

## 実装ルール

### 1. Discord REST Client管理

```typescript
// Discord REST APIクライアントの基本パターン
export class DiscordRESTClient {
  private readonly baseURL = 'https://discord.com/api/v10';
  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  private get headers() {
    return {
      'Authorization': `Bot ${this.token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'DiscordBot (discord-mcp, 1.0.0)'
    };
  }
}
```

### 2. API呼び出しパターン

```typescript
// レート制限を考慮したHTTP呼び出し
async sendMessage(channelId: string, content: string): Promise<DiscordMessage> {
  const url = `${this.baseURL}/channels/${channelId}/messages`;
  
  try {
    const response = await axios.post(url, 
      { content }, 
      { headers: this.headers }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      // Rate limit handling
      const retryAfter = error.response.headers['retry-after'];
      await this.delay(retryAfter * 1000);
      return this.sendMessage(channelId, content);
    }
    throw error;
  }
}
```

詳細な実装例については以下を参照：
- [Discord REST Client実装例](./docs/examples/discord-rest-client.md)
- [レート制限対応例](./docs/examples/rate-limiting.md)
- [Discord REST APIパターン](./docs/patterns/discord-patterns.md)

## アンチパターン

### ❌ レート制限を考慮しない直接呼び出し

```typescript
// 悪い例
const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
  headers: { Authorization: `Bot ${token}` }
});
// レート制限やエラーハンドリングなし
```

### ✅ 適切なRESTクライアントを通じた呼び出し

```typescript
// 良い例
const discordClient = new DiscordRESTClient(token);
await discordClient.sendMessage(channelId, content);
// レート制限、エラーハンドリング、型安全性を確保
```

## パフォーマンス考慮事項

1. **レート制限**: Global/Per-routeレート制限の適切な管理
2. **HTTPクライアント最適化**: Keep-Alive、コネクションプーリングの活用
3. **リクエスト最適化**: 不要なAPI呼び出しの削減、バッチ処理の活用

## セキュリティ考慮事項

1. **トークン管理**: Bot トークンの安全な保存と利用
2. **権限制御**: 必要最小限の権限スコープの設定
3. **入力サニタイゼーション**: ユーザー入力の適切な検証

## 新規Discord機能追加時のチェックリスト

- [ ] Discord REST APIの公式ドキュメントを確認
- [ ] レート制限対応が実装されているか
- [ ] 適切なHTTPヘッダーが設定されているか
- [ ] エラーハンドリング（4xx, 5xx, レート制限）が完全か
- [ ] 型定義が最新のDiscord APIに準拠しているか
- [ ] HTTPクライアントの設定が適切か
- [ ] セキュリティリスクが評価されているか
- [ ] ドキュメントを更新