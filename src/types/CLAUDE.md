# Types ディレクトリ

## 概要

Discord MCPサーバー全体で使用される型定義を管理するディレクトリです。Discord APIのデータ構造、MCPプロトコルの型、カスタム型定義を一元管理します。

## 設計方針

### 型の中央集権化

プロジェクト全体で使用される型定義は必ずこのディレクトリで管理し、重複を避ける

### Discord API準拠

Discord APIの公式ドキュメントに準拠した型定義を維持し、APIの変更に迅速に対応

### 拡張性の確保

将来的な機能追加を考慮し、型定義は拡張しやすい構造を維持

## 実装ルール

### 1. 型定義の基本構造

```typescript
// Discord APIの型定義
export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string | null;
  owner_id: string;
  // ... その他のプロパティ
}

// カスタム型定義
export type GuildWithDetails = DiscordGuild & {
  memberCount: number;
  features: string[];
};
```

### 2. 型のエクスポート規則

```typescript
// 個別エクスポート（推奨）
export interface DiscordUser { ... }
export interface DiscordChannel { ... }

// 名前空間でのグループ化（関連する型が多い場合）
export namespace Discord {
  export interface User { ... }
  export interface Channel { ... }
}
```

※ 詳細な実装例やパターンのドキュメントは、プロジェクトが成長し必要に応じて`./docs/`配下に追加予定です。

## アンチパターン

### ❌ any型の使用

```typescript
// 悪い例
export interface APIResponse {
  data: any;
}
```

### ✅ 明示的な型定義

```typescript
// 良い例
export interface APIResponse<T> {
  data: T;
  error?: APIError;
}
```

## パフォーマンス考慮事項

1. **型の複雑性**: 過度に複雑な型定義は型推論のパフォーマンスに影響
2. **循環参照**: 型定義間の循環参照を避ける

## セキュリティ考慮事項

1. **機密情報の型**: トークンやパスワードなどの機密情報は明示的に型付け
2. **Nullable安全性**: null/undefinedの可能性がある場合は明示的に定義

## 新規型追加時のチェックリスト

- [ ] Discord API公式ドキュメントとの整合性を確認
- [ ] 既存の型定義との重複がないか確認
- [ ] 適切な名前空間またはファイルに配置
- [ ] JSDocコメントで型の用途を説明
- [ ] 必要に応じてユニットテストを追加
- [ ] ドキュメントを更新