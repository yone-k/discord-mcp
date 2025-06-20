# Core ディレクトリ

## 概要

MCPサーバーのコア機能を提供するディレクトリです。MCP SDKを利用したサーバーの基本実装、リクエストハンドリング、トランスポート層の管理を担当します。

## 設計方針

### Single Responsibility Principle

各クラスは単一の責務を持つ：
- `MCPServer`: サーバーのライフサイクル管理
- `RequestHandler`: MCPリクエストの処理
- `TransportManager`: stdio/HTTP等のトランスポート管理

### Interface Segregation

機能ごとにインターフェースを分離し、必要な機能のみを公開

## 実装ルール

### 1. サーバーインスタンス管理

```typescript
// 基本的なMCPサーバー実装パターン
export class MCPServer {
  private server: Server;
  private transport: StdioServerTransport;

  constructor(config: ServerConfig) {
    this.server = new Server(config.serverInfo, config.capabilities);
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // ハンドラー登録のパターン
  }
}
```

### 2. エラーハンドリング

```typescript
// 統一されたエラーハンドリングパターン
try {
  await this.server.connect(transport);
} catch (error) {
  logger.error('MCP server connection failed:', error);
  throw new MCPServerError('Failed to start server', error);
}
```

詳細な実装例については以下を参照：
- [サーバー実装例](./docs/examples/server-setup.md)
- [エラーハンドリング例](./docs/examples/error-handling.md)
- [設計パターン](./docs/patterns/core-patterns.md)

## アンチパターン

### ❌ グローバル状態の使用

```typescript
// 悪い例
let globalServer: Server;
export function getServer() {
  return globalServer;
}
```

### ✅ 依存性注入の使用

```typescript
// 良い例
export class RequestHandler {
  constructor(private server: Server) {}
}
```

## パフォーマンス考慮事項

1. **ストリーミング処理**: 大きなペイロードはストリーミングで処理
2. **接続プーリング**: 必要に応じて接続の再利用を検討
3. **メモリ管理**: 長時間実行時のメモリリークを防止

## セキュリティ考慮事項

1. **入力検証**: 全てのMCPリクエストの検証
2. **認証**: 必要に応じてクライアント認証を実装
3. **ログ記録**: セキュリティイベントの適切なログ記録

## 新規コアモジュール追加時のチェックリスト

- [ ] 単一責務の原則に従っているか
- [ ] 適切なインターフェースを定義しているか
- [ ] エラーハンドリングが実装されているか
- [ ] ログ記録が適切に行われているか
- [ ] 型定義が完全に記述されているか
- [ ] ユニットテストが作成されているか
- [ ] ドキュメントを更新