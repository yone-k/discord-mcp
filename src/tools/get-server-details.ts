import { z } from 'zod';
import { DiscordClient } from '../discord/client.js';
import { DiscordGuildDetailed } from '../types/discord.js';

/**
 * サーバー詳細情報取得ツールの入力スキーマ
 */
export const GetServerDetailsInputSchema = z.object({
  serverId: z.string().min(1, 'サーバーIDは必須です'),
}).strict();

/**
 * サーバー詳細情報取得ツールの出力スキーマ
 */
export const GetServerDetailsOutputSchema = z.object({
  server: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    iconUrl: z.string().nullable(),
    createdAt: z.string(),
    ownerId: z.string(),
    region: z.string().optional(),
    afkChannelId: z.string().nullable(),
    afkTimeout: z.number(),
    memberCount: z.number().optional(),
    onlineCount: z.number().optional(),
    boostCount: z.number().optional(),
    boostLevel: z.number(),
    channelsCount: z.number().optional(),
    rolesCount: z.number().optional(),
    emojisCount: z.number().optional(),
    stickersCount: z.number().optional(),
    features: z.array(z.string()),
  }),
});

export type GetServerDetailsInput = z.infer<typeof GetServerDetailsInputSchema>;
export type GetServerDetailsOutput = z.infer<typeof GetServerDetailsOutputSchema>;

/**
 * 特定のDiscordサーバーの詳細情報を取得する
 */
export async function getServerDetails(
  discordClient: DiscordClient,
  input: GetServerDetailsInput
): Promise<GetServerDetailsOutput> {
  try {
    const guildDetails = await discordClient.getGuildDetails(input.serverId);
    
    return {
      server: {
        id: guildDetails.id,
        name: guildDetails.name,
        description: guildDetails.description,
        iconUrl: guildDetails.icon
          ? `https://cdn.discordapp.com/icons/${guildDetails.id}/${guildDetails.icon}.png`
          : null,
        createdAt: guildDetails.created_at,
        ownerId: guildDetails.owner_id,
        region: guildDetails.region,
        afkChannelId: guildDetails.afk_channel_id,
        afkTimeout: guildDetails.afk_timeout,
        memberCount: guildDetails.approximate_member_count,
        onlineCount: guildDetails.approximate_presence_count,
        boostCount: guildDetails.premium_subscription_count,
        boostLevel: guildDetails.premium_tier,
        channelsCount: guildDetails.channels_count,
        rolesCount: guildDetails.roles_count,
        emojisCount: guildDetails.emojis_count,
        stickersCount: guildDetails.stickers_count,
        features: guildDetails.features,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'サーバー詳細情報の取得中に不明なエラーが発生しました';
    throw new Error(`サーバー詳細情報の取得に失敗しました: ${errorMessage}`);
  }
}