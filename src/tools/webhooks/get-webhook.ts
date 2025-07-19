import { z } from 'zod';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';

/**
 * Webhook取得ツールの入力スキーマ
 */
export const GetWebhookInputSchema = z.object({
  /** WebhookID（必須） */
  webhookId: z.string().min(1, 'WebhookIDは必須です')
}).strict();

export type GetWebhookInput = z.infer<typeof GetWebhookInputSchema>;

/**
 * MCP ツール定義
 */
export const toolDefinition: ToolDefinition = {
  name: 'get_webhook',
  description: '特定のDiscord Webhookの詳細情報を取得します',
  inputSchema: {
    type: 'object' as const,
    properties: {
      webhookId: {
        type: 'string',
        description: '詳細情報を取得するWebhookのID'
      }
    },
    required: ['webhookId'],
    additionalProperties: false
  }
};

/**
 * Webhook取得ツールの出力スキーマ
 */
export const GetWebhookOutputSchema = z.object({
  /** Webhook情報 */
  webhook: z.object({
    /** WebhookのID */
    id: z.string(),
    /** Webhookのタイプ */
    type: z.number(),
    /** サーバーID */
    guildId: z.string().optional(),
    /** チャンネルID */
    channelId: z.string().nullable(),
    /** ユーザー情報（作成者） */
    user: z.object({
      id: z.string(),
      username: z.string(),
      discriminator: z.string(),
      globalName: z.string().nullable().optional(),
      avatarUrl: z.string().nullable(),
      bot: z.boolean().optional()
    }).optional(),
    /** Webhookの名前 */
    name: z.string().nullable(),
    /** Webhookのアバター */
    avatar: z.string().nullable(),
    /** アプリケーションID */
    applicationId: z.string().nullable(),
    /** ソースサーバー */
    sourceGuild: z.object({
      id: z.string(),
      name: z.string(),
      icon: z.string().nullable()
    }).optional(),
    /** ソースチャンネル */
    sourceChannel: z.object({
      id: z.string(),
      name: z.string()
    }).optional(),
    /** WebhookのURL */
    url: z.string().optional(),
    /** Webhookのトークン（セキュリティ上部分的にマスク） */
    token: z.string().optional()
  })
});

export type GetWebhookOutput = z.infer<typeof GetWebhookOutputSchema>;

/**
 * 特定のDiscord Webhookの詳細情報を取得
 */
export async function getWebhook(
  discordClient: DiscordClient,
  input: GetWebhookInput
): Promise<GetWebhookOutput> {
  try {
    const webhook = await discordClient.getWebhook(input.webhookId);

    const processedWebhook = {
      id: webhook.id,
      type: webhook.type,
      guildId: webhook.guild_id,
      channelId: webhook.channel_id,
      user: webhook.user ? {
        id: webhook.user.id,
        username: webhook.user.username,
        discriminator: webhook.user.discriminator,
        globalName: webhook.user.global_name,
        avatarUrl: webhook.user.avatar
          ? `https://cdn.discordapp.com/avatars/${webhook.user.id}/${webhook.user.avatar}.png`
          : null,
        bot: webhook.user.bot
      } : undefined,
      name: webhook.name,
      avatar: webhook.avatar,
      applicationId: webhook.application_id,
      sourceGuild: webhook.source_guild ? {
        id: webhook.source_guild.id,
        name: webhook.source_guild.name,
        icon: webhook.source_guild.icon
      } : undefined,
      sourceChannel: webhook.source_channel ? {
        id: webhook.source_channel.id,
        name: webhook.source_channel.name
      } : undefined,
      url: webhook.url,
      token: webhook.token
    };

    return {
      webhook: processedWebhook
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Webhookの取得中に不明なエラーが発生しました';
    throw new Error(`Webhookの取得に失敗しました: ${errorMessage}`);
  }
}