# Utils ディレクトリ

## 概要

Discord MCPサーバー全体で使用される汎用的なユーティリティ関数を管理するディレクトリです。共通処理、ヘルパー関数、定数定義などを配置します。

## 設計方針

### 純粋関数の原則

ユーティリティ関数は可能な限り副作用を持たない純粋関数として実装

### 単一責任の原則

各関数は1つの明確な責任のみを持ち、再利用性を最大化

### テスタビリティの確保

すべてのユーティリティ関数は単体でテスト可能な設計

## 実装ルール

### 1. ユーティリティ関数の基本構造

```typescript
/**
 * 文字列を安全にトリムする
 * @param str - トリムする文字列
 * @param maxLength - 最大長（オプション）
 * @returns トリムされた文字列
 */
export function safeTrim(str: string, maxLength?: number): string {
  const trimmed = str.trim();
  return maxLength ? trimmed.slice(0, maxLength) : trimmed;
}
```

### 2. エラーハンドリング

```typescript
/**
 * 安全にJSONをパースする
 * @param json - パースするJSON文字列
 * @param fallback - パース失敗時のフォールバック値
 * @returns パースされたオブジェクトまたはフォールバック値
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}
```

※ 詳細な実装例やパターンのドキュメントは、プロジェクトが成長し必要に応じて`./docs/`配下に追加予定です。

## アンチパターン

### ❌ 副作用を持つ関数

```typescript
// 悪い例: グローバル状態を変更
let counter = 0;
export function incrementCounter() {
  return ++counter;
}
```

### ✅ 純粋関数

```typescript
// 良い例: 引数と戻り値のみで完結
export function increment(value: number): number {
  return value + 1;
}
```

## パフォーマンス考慮事項

1. **メモ化**: 計算コストの高い処理は適切にメモ化を検討
2. **遅延評価**: 必要になるまで計算を遅延させる設計

## セキュリティ考慮事項

1. **入力検証**: すべての外部入力は適切に検証
2. **型安全性**: TypeScriptの型システムを最大限活用

## 新規ユーティリティ追加時のチェックリスト

- [ ] 既存のユーティリティとの重複がないか確認
- [ ] 関数名は明確で理解しやすいか
- [ ] JSDocコメントで関数の用途を説明
- [ ] 単体テストを作成
- [ ] エラーケースを適切に処理
- [ ] ドキュメントを更新