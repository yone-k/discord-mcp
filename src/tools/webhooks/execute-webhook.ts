import { z } from 'zod';
import { ToolDefinition } from '../../types/mcp';
import { DiscordClient } from '../../discord/client';

const ExecuteWebhookSchema = z.object({
  webhookId: z.string().describe('WebhookのID'),
  webhookToken: z.string().describe('Webhookのトークン'),
  content: z.string().max(2000).optional().describe('送信するメッセージの内容（最大2000文字）')
});

export type ExecuteWebhookInput = z.infer<typeof ExecuteWebhookSchema>;
export const ExecuteWebhookInputSchema = ExecuteWebhookSchema;

export const toolDefinition: ToolDefinition = {
  name: 'execute_webhook',
  description: 'Discord Webhookを実行してメッセージを送信します',
  inputSchema: {
    type: 'object',
    properties: {
      webhookId: {
        type: 'string',
        description: 'WebhookのID'
      },
      webhookToken: {
        type: 'string',
        description: 'Webhookのトークン'
      },
      content: {
        type: 'string',
        description: '送信するメッセージの内容（最大2000文字）'
      }
    },
    required: ['webhookId', 'webhookToken'],
    additionalProperties: false
  }
};

export async function executeWebhook(
  client: DiscordClient,
  args: ExecuteWebhookInput
): Promise<any> {
  if (!args.content) {
    throw new Error('contentパラメータが必要です');
  }

  const url = `https://discord.com/api/v10/webhooks/${args.webhookId}/${args.webhookToken}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: args.content
    })
  });

  if (!response.ok) {
    const error = await response.json() as { message?: string };
    throw new Error(`Discord APIエラー: ${error.message || response.statusText}`);
  }

  return {
    success: true,
    message: 'Webhookを実行してメッセージを送信しました'
  };
}