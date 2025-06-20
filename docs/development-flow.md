# 機能開発フロー

## TDD（テスト駆動開発）による機能追加手順

### 1. 事前準備

```bash
# 機能別ブランチの作成（命名規則: feature/機能名）
git checkout -b feature/new-tool-name

# 必要な依存関係の追加（必要に応じて）
npm install new-dependency
```

### 2. 型定義とインターフェース設計

- `src/types/` に新機能用の型定義を作成
- Discord API レスポンス型の定義
- 入力・出力スキーマの設計

```typescript
// 例: src/types/new-feature.ts
export interface NewFeatureResponse {
  id: string;
  name: string;
  // ...
}
```

### 3. テストファースト開発

```bash
# テストファイル作成例
touch src/tools/new-tool.test.ts
touch src/discord/new-client.test.ts
```

**テスト作成ガイドライン**:
- 正常系・異常系の網羅
- モック機能を活用した外部API依存の排除
- エッジケースとバリデーションの確認
- 複数のシナリオテスト

### 4. 実装フェーズ

**Discord APIクライアント拡張**:
- `src/discord/client.ts` への新メソッド追加
- エラーハンドリングパターンの統一

**ツール実装**:
- `src/tools/` に新ツール作成
- Zod スキーマによる入力バリデーション
- 適切な戻り値型定義

**MCP統合**:
- `src/index.ts` でのツール登録
- スキーマ定義の追加

### 5. 品質チェック

```bash
# 全テスト実行
npm test

# 型チェック
npm run typecheck

# リント
npm run lint

# ビルド確認
npm run build
```

### 6. 統合テスト

```bash
# ローカル実行テスト
DISCORD_TOKEN=your_token node dist/index.js

# Docker実行テスト
docker build -t discord-mcp .
docker run --rm -i -e DISCORD_TOKEN=your_token discord-mcp
```

### 7. デプロイとドキュメント更新

- Claude Desktop 設定での動作確認
- README や CLAUDE.md の更新（必要に応じて）
- プルリクエスト作成

## トラブルシューティングパターン

### Docker関連問題

**問題**: MCP通信でのstdin/stdout干渉
**解決**: Dockerfile CMD を直接node実行に変更
```dockerfile
CMD ["node", "dist/index.js"]  
# npm start ではなく直接node実行
```

**問題**: 環境変数の未設定
**解決**: Docker実行時の `-e` フラグ確認
```bash
docker run --rm -i -e DISCORD_TOKEN=token discord-mcp
```

### Node.js/TypeScript更新時

**必要な変更箇所**:
1. `Dockerfile` - ベースイメージ更新
2. `tsconfig.json` - target, module, lib設定
3. `package.json` - engines, @types/node更新
4. 依存関係の再インストール

### テスト関連

**モック作成パターン**:
```typescript
// axios のモック
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

// Discord Client のモック
vi.mock('../discord/client');
```

## 開発ベストプラクティス

### コード品質
- TypeScript 厳格モード使用
- Zod による実行時バリデーション
- 包括的なエラーハンドリング
- 適切なログ出力

### テスト戦略
- ユニットテストでビジネスロジック検証
- モックによる外部依存の分離
- 統合テストで実際のAPI接続確認
- エッジケースの網羅

### Git運用
- 機能単位でのブランチ作成
- 日本語コミットメッセージの統一
- プルリクエストでのコードレビュー