import { z } from 'zod';
import { ToolDefinition } from '../../types/mcp';
import { DiscordClient } from '../../discord/client';

const UpdateWebhookSchema = z.object({
  webhookId: z.string().describe('更新するWebhookのID'),
  name: z.string().max(80).optional().describe('Webhookの新しい名前（最大80文字、オプション）'),
  avatar: z.union([z.string(), z.null()]).optional().describe('Webhookの新しいアバター（data URI形式またはnull、オプション）')
}).refine(
  (data) => data.name !== undefined || data.avatar !== undefined,
  {
    message: 'name または avatar のいずれかは必須です',
    path: ['name', 'avatar']
  }
).refine(
  (data) => data.name === undefined || data.name.trim().length > 0,
  {
    message: 'webhook名は空文字列にできません',
    path: ['name']
  }
);

export type UpdateWebhookInput = z.infer<typeof UpdateWebhookSchema>;
export const UpdateWebhookInputSchema = UpdateWebhookSchema;

export const toolDefinition: ToolDefinition = {
  name: 'update_webhook',
  description: '既存のDiscord Webhookを更新します',
  inputSchema: {
    type: 'object',
    properties: {
      webhookId: {
        type: 'string',
        description: '更新するWebhookのID'
      },
      name: {
        type: 'string',
        description: 'Webhookの新しい名前（最大80文字、オプション）'
      },
      avatar: {
        type: 'string',
        description: 'Webhookの新しいアバター（data URI形式またはnull、オプション）'
      }
    },
    required: ['webhookId'],
    additionalProperties: false
  }
};

export async function updateWebhook(
  client: DiscordClient,
  args: UpdateWebhookInput
): Promise<any> {
  // Zodスキーマによる入力検証
  const validatedArgs = UpdateWebhookSchema.parse(args);

  // Discord Client の updateWebhook メソッドを呼び出し
  const updateData: { name?: string; avatar?: string | null } = {};

  if (validatedArgs.name !== undefined) {
    updateData.name = validatedArgs.name;
  }

  if (validatedArgs.avatar !== undefined) {
    updateData.avatar = validatedArgs.avatar;
  }

  try {
    const webhook = await client.updateWebhook(validatedArgs.webhookId, updateData);

    return {
      success: true,
      webhook: webhook,
      message: 'Webhookを正常に更新しました'
    };
  } catch (error) {
    // Discord APIエラーをそのまま再スロー
    throw error;
  }
}