import { z } from 'zod';
import { ToolDefinition } from '../../types/mcp';
import { DiscordClient } from '../../discord/client';

const CreateWebhookSchema = z.object({
  channelId: z.string().describe('Webhookを作成するチャンネルのID'),
  name: z.string().max(80).describe('Webhookの名前（最大80文字）'),
  avatar: z.string().optional().describe('Webhookのアバター（data URI形式、オプション）')
});

export type CreateWebhookInput = z.infer<typeof CreateWebhookSchema>;
export const CreateWebhookInputSchema = CreateWebhookSchema;

export const toolDefinition: ToolDefinition = {
  name: 'create_webhook',
  description: 'Discordチャンネルに新しいWebhookを作成します',
  inputSchema: {
    type: 'object',
    properties: {
      channelId: {
        type: 'string',
        description: 'Webhookを作成するチャンネルのID'
      },
      name: {
        type: 'string',
        description: 'Webhookの名前（最大80文字）'
      },
      avatar: {
        type: 'string',
        description: 'Webhookのアバター（data URI形式、オプション）'
      }
    },
    required: ['channelId', 'name'],
    additionalProperties: false
  }
};

export async function createWebhook(
  client: DiscordClient,
  args: CreateWebhookInput
): Promise<any> {
  // Zodスキーマによる入力検証
  const validatedArgs = CreateWebhookSchema.parse(args);

  // Discord Client の createWebhook メソッドを呼び出し
  const webhookData: { name: string; avatar?: string } = {
    name: validatedArgs.name
  };

  if (validatedArgs.avatar) {
    webhookData.avatar = validatedArgs.avatar;
  }

  try {
    const webhook = await client.createWebhook(validatedArgs.channelId, webhookData);

    return {
      success: true,
      webhook: webhook,
      message: 'Webhookを正常に作成しました'
    };
  } catch (error) {
    // Discord APIエラーをそのまま再スロー
    throw error;
  }
}