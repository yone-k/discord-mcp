import { z } from 'zod';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';

/**
 * チャンネルWebhook取得ツールの入力スキーマ
 */
export const GetChannelWebhooksInputSchema = z.object({
  /** チャンネルID（必須） */
  channelId: z.string().min(1, 'チャンネルIDは必須です')
}).strict();

export type GetChannelWebhooksInput = z.infer<typeof GetChannelWebhooksInputSchema>;

/**
 * MCP ツール定義
 */
export const toolDefinition: ToolDefinition = {
  name: 'get_channel_webhooks',
  description: '特定のDiscordチャンネルのWebhook一覧を取得します',
  inputSchema: {
    type: 'object' as const,
    properties: {
      channelId: {
        type: 'string',
        description: 'Webhook一覧を取得するチャンネルのID'
      }
    },
    required: ['channelId'],
    additionalProperties: false
  }
};

/**
 * チャンネルWebhook取得ツールの出力スキーマ
 */
export const GetChannelWebhooksOutputSchema = z.object({
  /** Webhook一覧 */
  webhooks: z.array(z.object({
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
      avatarUrl: z.string().nullable()
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
    url: z.string().optional()
  })),
  /** 総Webhook数 */
  totalCount: z.number()
});

export type GetChannelWebhooksOutput = z.infer<typeof GetChannelWebhooksOutputSchema>;

/**
 * 特定のDiscordチャンネルのWebhook一覧を取得
 */
export async function getChannelWebhooks(
  discordClient: DiscordClient,
  input: GetChannelWebhooksInput
): Promise<GetChannelWebhooksOutput> {
  try {
    const webhooks = await discordClient.getChannelWebhooks(input.channelId);

    const processedWebhooks = webhooks.map(webhook => ({
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
          : null
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
      url: webhook.url
    }));

    return {
      webhooks: processedWebhooks,
      totalCount: processedWebhooks.length
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'チャンネルのWebhookの取得中に不明なエラーが発生しました';
    throw new Error(`チャンネルのWebhookの取得に失敗しました: ${errorMessage}`);
  }
}