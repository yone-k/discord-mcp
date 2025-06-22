# Tools ディレクトリ

## 概要

MCP (Model Context Protocol) ツールの実装を管理するディレクトリです。各ツールはDiscord APIの特定の機能をMCPプロトコル経由で提供します。

## 設計方針

### 単一責任原則

各ツールファイルは1つのMCP toolのみを実装し、関連する機能を完結させる

### 入力検証の徹底

すべての入力パラメータはZodスキーマで厳密に検証し、型安全性を保証

### エラーハンドリングの統一

Discord APIエラーは適切にキャッチし、MCPクライアントに理解しやすいエラーメッセージを返す

## 実装ルール

### 1. ツールファイルの構造

```typescript
// ツール定義のエクスポート
export const getServerListTool: Tool = {
  name: "get_guild_list",
  description: "Botが参加しているDiscordサーバーの一覧を取得します",
  inputSchema: zodToJsonSchema(GetServerListArgsSchema) as ToolInputSchema,
};

// ハンドラー関数のエクスポート
export async function handleGetServerList(
  args: unknown,
  client: DiscordClient
): Promise<McpToolResponse> {
  // 実装
}
```

### 2. Zodスキーマの定義

```typescript
const GetServerListArgsSchema = z.object({
  includeDetails: z
    .boolean()
    .optional()
    .default(false)
    .describe("詳細情報を含めるかどうか"),
});
```

※ 詳細な実装例やパターンのドキュメントは、プロジェクトが成長し必要に応じて`./docs/`配下に追加予定です。

## アンチパターン

### ❌ 複数ツールの混在

```typescript
// 悪い例: 1ファイルに複数のツール
export const tool1 = { ... };
export const tool2 = { ... };
```

### ✅ 単一ツールの実装

```typescript
// 良い例: 1ファイルに1ツール
export const getServerListTool = { ... };
```

## パフォーマンス考慮事項

1. **ページネーション**: 大量のデータを扱う場合は必ずページネーションを実装
2. **キャッシュ**: 頻繁にアクセスされるデータは適切にキャッシュを検討

## セキュリティ考慮事項

1. **権限チェック**: Discord APIの権限要件を事前に検証
2. **レート制限**: Discord APIのレート制限を考慮した実装

## 新規ツール追加時のチェックリスト

- [ ] ツール定義とハンドラー関数を実装
- [ ] Zodスキーマで入力検証を定義
- [ ] エラーハンドリングを実装
- [ ] ユニットテストを作成
- [ ] TOOLLIST.md（日本語版・英語版）を更新
- [ ] ドキュメントを更新