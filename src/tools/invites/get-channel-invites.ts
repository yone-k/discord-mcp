import { z } from 'zod';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';

/**
 * チャンネル招待リンク取得ツールの入力スキーマ
 */
export const GetChannelInvitesInputSchema = z.object({
  /** チャンネルID（必須） */
  channelId: z.string().min(1, 'チャンネルIDは必須です')
}).strict();

export type GetChannelInvitesInput = z.infer<typeof GetChannelInvitesInputSchema>;

/**
 * MCP ツール定義
 */
export const toolDefinition: ToolDefinition = {
  name: 'get_channel_invites',
  description: '特定のDiscordチャンネルの招待リンク一覧を取得します',
  inputSchema: {
    type: 'object' as const,
    properties: {
      channelId: {
        type: 'string',
        description: '招待リンク一覧を取得するチャンネルのID'
      }
    },
    required: ['channelId'],
    additionalProperties: false
  }
};

/**
 * チャンネル招待リンク取得ツールの出力スキーマ
 */
export const GetChannelInvitesOutputSchema = z.object({
  /** 招待リンク一覧 */
  invites: z.array(z.object({
    /** 招待コード */
    code: z.string(),
    /** サーバー情報 */
    guild: z.object({
      id: z.string(),
      name: z.string(),
      icon: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      features: z.array(z.string()),
      verificationLevel: z.number(),
      nsfwLevel: z.number(),
      premiumSubscriptionCount: z.number().optional()
    }).nullable().optional(),
    /** チャンネル情報 */
    channel: z.object({
      id: z.string(),
      name: z.string(),
      type: z.number()
    }),
    /** 招待者情報 */
    inviter: z.object({
      id: z.string(),
      username: z.string(),
      discriminator: z.string(),
      globalName: z.string().nullable().optional(),
      avatarUrl: z.string().nullable()
    }).optional(),
    /** 近似メンバー数 */
    approximateMemberCount: z.number().optional(),
    /** 近似オンラインメンバー数 */
    approximatePresenceCount: z.number().optional(),
    /** 有効期限日時 */
    expiresAt: z.string().nullable().optional(),
    /** 招待タイプ */
    type: z.number(),
    /** 使用回数 */
    uses: z.number().optional(),
    /** 最大使用回数 */
    maxUses: z.number().optional(),
    /** 最大有効期間（秒） */
    maxAge: z.number().optional(),
    /** 一時的メンバーシップか */
    temporary: z.boolean().optional(),
    /** 作成日時 */
    createdAt: z.string().optional()
  })),
  /** 総招待リンク数 */
  totalCount: z.number()
});

export type GetChannelInvitesOutput = z.infer<typeof GetChannelInvitesOutputSchema>;

/**
 * 特定のDiscordチャンネルの招待リンク一覧を取得
 */
export async function getChannelInvites(
  discordClient: DiscordClient,
  input: GetChannelInvitesInput
): Promise<GetChannelInvitesOutput> {
  try {
    const invites = await discordClient.getChannelInvites(input.channelId);

    const processedInvites = invites.map(invite => ({
      code: invite.code,
      guild: invite.guild ? {
        id: invite.guild.id,
        name: invite.guild.name,
        icon: invite.guild.icon,
        description: invite.guild.description,
        features: invite.guild.features,
        verificationLevel: invite.guild.verification_level,
        nsfwLevel: invite.guild.nsfw_level,
        premiumSubscriptionCount: invite.guild.premium_subscription_count
      } : undefined,
      channel: {
        id: invite.channel.id,
        name: invite.channel.name,
        type: invite.channel.type
      },
      inviter: invite.inviter ? {
        id: invite.inviter.id,
        username: invite.inviter.username,
        discriminator: invite.inviter.discriminator,
        globalName: invite.inviter.global_name,
        avatarUrl: invite.inviter.avatar
          ? `https://cdn.discordapp.com/avatars/${invite.inviter.id}/${invite.inviter.avatar}.png`
          : null
      } : undefined,
      approximateMemberCount: invite.approximate_member_count,
      approximatePresenceCount: invite.approximate_presence_count,
      expiresAt: invite.expires_at,
      type: invite.type,
      uses: invite.uses,
      maxUses: invite.max_uses,
      maxAge: invite.max_age,
      temporary: invite.temporary,
      createdAt: invite.created_at
    }));

    return {
      invites: processedInvites,
      totalCount: processedInvites.length
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'チャンネルの招待リンクの取得中に不明なエラーが発生しました';
    throw new Error(`チャンネルの招待リンクの取得に失敗しました: ${errorMessage}`);
  }
}