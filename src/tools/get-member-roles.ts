import { z } from 'zod';
import { DiscordClient } from '../discord/client.js';

/**
 * メンバーロール取得ツールの入力スキーマ
 */
export const GetMemberRolesInputSchema = z.object({
  /** サーバーID（必須） */
  guildId: z.string().min(1, 'サーバーIDは必須です'),
  /** ユーザーID（必須） */
  userId: z.string().min(1, 'ユーザーIDは必須です'),
  /** 管理者権限を持つロールのみ取得 */
  adminOnly: z.boolean().optional().default(false),
  /** 管理ロール（Bot、統合など）を除外 */
  excludeManaged: z.boolean().optional().default(false),
  /** 詳細情報を含めるかどうか */
  includeDetails: z.boolean().optional().default(false)
}).strict();

export type GetMemberRolesInput = z.infer<typeof GetMemberRolesInputSchema>;

/**
 * メンバーロール取得ツールの出力スキーマ
 */
export const GetMemberRolesOutputSchema = z.object({
  /** メンバー情報 */
  member: z.object({
    /** ユーザーID */
    id: z.string(),
    /** ユーザー名 */
    username: z.string(),
    /** ディスクリミネーター */
    discriminator: z.string(),
    /** グローバル名 */
    globalName: z.string().nullable().optional(),
    /** ニックネーム */
    nickname: z.string().nullable(),
    /** アバターURL */
    avatarUrl: z.string().nullable(),
    /** ボットかどうか */
    isBot: z.boolean(),
    /** サーバー参加日時 */
    joinedAt: z.string(),
    /** ブースト開始日時 */
    premiumSince: z.string().nullable().optional()
  }),
  /** ロール一覧 */
  roles: z.array(z.object({
    /** ロールID */
    id: z.string(),
    /** ロール名 */
    name: z.string(),
    /** ロールの色（16進数） */
    color: z.string(),
    /** ロールの色（数値） */
    colorValue: z.number(),
    /** ホイスト（別表示）されるか */
    hoist: z.boolean(),
    /** 表示順序の位置 */
    position: z.number(),
    /** ロールの権限（ビットフラグ） */
    permissions: z.string(),
    /** 管理者権限を持つか */
    isAdmin: z.boolean(),
    /** 管理ロールか（Bot、統合など） */
    managed: z.boolean(),
    /** メンション可能か */
    mentionable: z.boolean(),
    /** ロールタグ（詳細情報が有効な場合） */
    tags: z.object({
      /** ボット専用ロールか */
      isBot: z.boolean(),
      /** 統合ロールか */
      isIntegration: z.boolean(),
      /** プレミアムサブスクライバー専用か */
      isPremiumSubscriber: z.boolean(),
      /** ギルドコネクション専用か */
      isGuildConnections: z.boolean(),
      /** 購入可能か */
      isAvailableForPurchase: z.boolean()
    }).optional(),
    /** アイコンURL（詳細情報が有効な場合） */
    iconUrl: z.string().nullable().optional(),
    /** Unicode絵文字（詳細情報が有効な場合） */
    unicodeEmoji: z.string().nullable().optional()
  })),
  /** 総ロール数 */
  totalRoleCount: z.number(),
  /** フィルター適用後のロール数 */
  filteredRoleCount: z.number(),
  /** 管理者ロール数 */
  adminRoleCount: z.number(),
  /** 管理ロール数 */
  managedRoleCount: z.number()
});

export type GetMemberRolesOutput = z.infer<typeof GetMemberRolesOutputSchema>;

/**
 * 特定のDiscordサーバーメンバーのロール一覧を取得
 */
export async function getMemberRoles(
  discordClient: DiscordClient,
  input: GetMemberRolesInput
): Promise<GetMemberRolesOutput> {
  try {
    // メンバー情報とサーバーロール一覧を並行取得
    const [member, allRoles] = await Promise.all([
      discordClient.getGuildMember(input.guildId, input.userId),
      discordClient.getGuildRoles(input.guildId)
    ]);

    // メンバーが持っているロールのみをフィルタリング
    let memberRoles = allRoles.filter(role => member.roles.includes(role.id));

    // フィルター処理
    if (input.adminOnly) {
      memberRoles = memberRoles.filter(role => {
        const permissions = BigInt(role.permissions);
        const adminPermission = BigInt('8'); // ADMINISTRATOR permission
        return (permissions & adminPermission) === adminPermission;
      });
    }

    if (input.excludeManaged) {
      memberRoles = memberRoles.filter(role => !role.managed);
    }

    // メンバー情報を処理
    const user = member.user || {
      id: input.userId,
      username: 'Unknown User',
      discriminator: '0000',
      avatar: null
    };

    const memberInfo = {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      globalName: user.global_name || null,
      nickname: member.nick || null,
      avatarUrl: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : null,
      isBot: user.bot || false,
      joinedAt: member.joined_at,
      premiumSince: member.premium_since || null
    };

    // ロール情報を処理
    const processedRoles = memberRoles.map(role => {
      // 色を16進数に変換
      const colorHex = role.color.toString(16).padStart(6, '0');
      const color = role.color === 0 ? '#000000' : `#${colorHex}`;

      // 管理者権限チェック
      const permissions = BigInt(role.permissions);
      const adminPermission = BigInt('8');
      const isAdmin = (permissions & adminPermission) === adminPermission;

      const roleInfo: any = {
        id: role.id,
        name: role.name,
        color,
        colorValue: role.color,
        hoist: role.hoist,
        position: role.position,
        permissions: role.permissions,
        isAdmin,
        managed: role.managed,
        mentionable: role.mentionable
      };

      // 詳細情報が要求された場合
      if (input.includeDetails) {
        if (role.tags) {
          roleInfo.tags = {
            isBot: !!role.tags.bot_id,
            isIntegration: !!role.tags.integration_id,
            isPremiumSubscriber: role.tags.premium_subscriber !== undefined,
            isGuildConnections: role.tags.guild_connections !== undefined,
            isAvailableForPurchase: role.tags.available_for_purchase !== undefined
          };
        }

        if (role.icon) {
          roleInfo.iconUrl = `https://cdn.discordapp.com/role-icons/${role.id}/${role.icon}.png`;
        } else {
          roleInfo.iconUrl = null;
        }

        roleInfo.unicodeEmoji = role.unicode_emoji || null;
      }

      return roleInfo;
    });

    // 統計情報を計算
    const adminRoleCount = memberRoles.filter(role => {
      const permissions = BigInt(role.permissions);
      const adminPermission = BigInt('8');
      return (permissions & adminPermission) === adminPermission;
    }).length;

    const managedRoleCount = memberRoles.filter(role => role.managed).length;

    return {
      member: memberInfo,
      roles: processedRoles,
      totalRoleCount: member.roles.length,
      filteredRoleCount: processedRoles.length,
      adminRoleCount,
      managedRoleCount
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'メンバーロールの取得中に不明なエラーが発生しました';
    throw new Error(`メンバーロールの取得に失敗しました: ${errorMessage}`);
  }
}