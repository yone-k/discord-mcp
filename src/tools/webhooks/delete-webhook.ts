import { z } from 'zod';
import { ToolDefinition } from '../../types/mcp';
import { DiscordClient } from '../../discord/client';

/**
 * Webhook削除ツールの入力スキーマ
 */
const DeleteWebhookSchema = z.object({
  /** 削除するWebhookのID（必須） */
  webhookId: z.string().min(1, 'WebhookIDは必須です').describe('削除するWebhookのID'),
  /** 削除理由（最大512文字、監査ログに記録される） */
  reason: z.string().max(512, '削除理由は512文字以内で入力してください').optional().describe('削除理由（最大512文字、監査ログに記録される）')
}).strict();

export type DeleteWebhookInput = z.infer<typeof DeleteWebhookSchema>;
export const DeleteWebhookInputSchema = DeleteWebhookSchema;

/**
 * MCP ツール定義
 */
export const toolDefinition: ToolDefinition = {
  name: 'delete_webhook',
  description: 'Discord Webhookを削除します（自分が作成したWebhookまたは適切な権限がある場合）',
  inputSchema: {
    type: 'object' as const,
    properties: {
      webhookId: {
        type: 'string',
        description: '削除するWebhookのID'
      },
      reason: {
        type: 'string',
        description: '削除理由（最大512文字、監査ログに記録される）'
      }
    },
    required: ['webhookId'],
    additionalProperties: false
  }
};

/**
 * Webhook削除ツールの出力スキーマ
 */
export const DeleteWebhookOutputSchema = z.object({
  /** 削除成功フラグ */
  success: z.literal(true),
  /** 削除されたWebhookのID */
  webhookId: z.string(),
  /** 削除実行日時（ISO 8601形式） */
  deletedAt: z.string(),
  /** 削除理由 */
  reason: z.string().optional()
});

export type DeleteWebhookOutput = z.infer<typeof DeleteWebhookOutputSchema>;

/**
 * 特定のDiscord Webhookを削除
 * 
 * @param client Discord API クライアント
 * @param args 削除パラメータ
 * @returns 削除結果
 * @throws {Error} Discord API エラーまたはバリデーションエラー
 */
export async function deleteWebhook(
  client: DiscordClient,
  args: DeleteWebhookInput
): Promise<DeleteWebhookOutput> {
  // Zodスキーマによる入力検証
  const validatedArgs = DeleteWebhookInputSchema.parse(args);

  try {
    // Discord API経由でWebhookを削除
    await client.deleteWebhook(validatedArgs.webhookId, validatedArgs.reason);

    // 削除成功レスポンス
    const response: DeleteWebhookOutput = {
      success: true,
      webhookId: validatedArgs.webhookId,
      deletedAt: new Date().toISOString(),
      reason: validatedArgs.reason
    };

    return response;
  } catch (error) {
    // エラーハンドリング：Discord APIエラーを適切にフォーマット
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Webhookの削除中に不明なエラーが発生しました';
    
    throw new Error(`Webhookの削除に失敗しました: ${errorMessage}`);
  }
}