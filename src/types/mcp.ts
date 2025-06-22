/**
 * MCP (Model Context Protocol) 関連の型定義
 */

/**
 * JSON Schema プロパティの型
 */
export interface JSONSchemaProperty {
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  default?: string | number | boolean;
  minimum?: number;
  maximum?: number;
}

/**
 * ツール定義の型
 */
export interface ToolDefinition {
  /** ツール名 */
  name: string;
  /** ツールの説明 */
  description: string;
  /** 入力スキーマ */
  inputSchema: {
    type: "object";
    properties?: Record<string, JSONSchemaProperty>;
    required?: string[];
    additionalProperties?: boolean;
  };
}

/**
 * ツール実行結果の型
 */
export interface ToolResult {
  content: Array<{
    type: "text";
    text: string;
  }>;
}

/**
 * ツールハンドラー関数の型
 */
export type ToolHandler<T = any> = (args: T) => Promise<ToolResult>;