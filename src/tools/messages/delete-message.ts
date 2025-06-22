import { z } from 'zod';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';

/**
 * メッセージ削除ツールの入力スキーマ
 */
export const DeleteMessageInputSchema = z.object({
  /** チャンネルID（必須） */
  channelId: z.string().min(1, 'チャンネルIDは必須です'),
  /** メッセージID（必須） */
  messageId: z.string().min(1, 'メッセージIDは必須です'),
  /** 削除理由（オプション、監査ログに記録される） */
  reason: z.string().max(512, '削除理由は512文字以下である必要があります').optional()
}).strict();

export type DeleteMessageInput = z.infer<typeof DeleteMessageInputSchema>;

/**
 * MCP ツール定義
 */
export const toolDefinition: ToolDefinition = {
  name: 'delete_message',
  description: 'Discordメッセージを削除します（自分が送信したメッセージまたは適切な権限がある場合）',
  inputSchema: {
    type: 'object' as const,
    properties: {
      channelId: {
        type: 'string',
        description: 'メッセージが存在するチャンネルのID'
      },
      messageId: {
        type: 'string',
        description: '削除するメッセージのID'
      },
      reason: {
        type: 'string',
        description: '削除理由（最大512文字、監査ログに記録される）'
      }
    },
    required: ['channelId', 'messageId'],
    additionalProperties: false
  }
};

/**
 * メッセージ削除ツールの出力スキーマ
 */
export const DeleteMessageOutputSchema = z.object({
  /** 削除成功フラグ */
  success: z.boolean(),
  /** 削除されたメッセージID */
  messageId: z.string(),
  /** チャンネルID */
  channelId: z.string(),
  /** 削除実行日時 */
  deletedAt: z.string(),
  /** 削除理由 */
  reason: z.string().optional()
});

export type DeleteMessageOutput = z.infer<typeof DeleteMessageOutputSchema>;

/**
 * Discordメッセージを削除
 */
export async function deleteMessage(
  discordClient: DiscordClient,
  input: DeleteMessageInput
): Promise<DeleteMessageOutput> {
  try {
    await discordClient.deleteMessage(input.channelId, input.messageId, input.reason);

    return {
      success: true,
      messageId: input.messageId,
      channelId: input.channelId,
      deletedAt: new Date().toISOString(),
      reason: input.reason
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'メッセージの削除中に不明なエラーが発生しました';
    throw new Error(`メッセージの削除に失敗しました: ${errorMessage}`);
  }
}