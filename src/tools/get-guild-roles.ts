import { z } from 'zod';
import { DiscordClient } from '../discord/client.js';
import { ToolInputSchema } from '@modelcontextprotocol/sdk/types.js';

/**
 * サーバーロール取得ツールの入力スキーマ
 */
export const GetGuildRolesInputSchema = z.object({
  /** サーバーID（必須） */
  guildId: z.string().min(1, 'サーバーIDは必須です'),
  /** 管理者権限を持つロールのみ取得 */
  adminOnly: z.boolean().optional().default(false),
  /** 管理ロール（Bot、統合など）を除外 */
  excludeManaged: z.boolean().optional().default(false),
  /** 詳細情報を含めるかどうか */
  includeDetails: z.boolean().optional().default(false)
}).strict();

export type GetGuildRolesInput = z.infer<typeof GetGuildRolesInputSchema>;

/**
 * MCP ツール定義
 */
export const toolDefinition = {
  name: 'get_guild_roles',
  description: '特定のDiscordサーバーのロール一覧を取得します',
  inputSchema: {
    type: 'object',
    properties: {
      guildId: {
        type: 'string',
        description: 'ロール一覧を取得するサーバーのID'
      },
      adminOnly: {
        type: 'boolean',
        description: '管理者権限を持つロールのみ取得',
        default: false
      },
      excludeManaged: {
        type: 'boolean',
        description: '管理ロール（Bot、統合など）を除外',
        default: false
      },
      includeDetails: {
        type: 'boolean',
        description: '詳細情報（タグ、アイコンなど）を含めるかどうか',
        default: false
      }
    },
    required: ['guildId'],
    additionalProperties: false
  } as ToolInputSchema
};

/**
 * サーバーロール取得ツールの出力スキーマ
 */
export const GetGuildRolesOutputSchema = z.object({
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
    /** メンバー数（詳細情報が有効な場合） */
    memberCount: z.number().optional(),
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
  totalCount: z.number(),
  /** フィルター適用後のロール数 */
  filteredCount: z.number(),
  /** 管理者ロール数 */
  adminRoleCount: z.number(),
  /** 管理ロール数 */
  managedRoleCount: z.number()
});

export type GetGuildRolesOutput = z.infer<typeof GetGuildRolesOutputSchema>;

/**
 * 特定のDiscordサーバーのロール一覧を取得
 */
export async function getGuildRoles(
  discordClient: DiscordClient,
  input: GetGuildRolesInput
): Promise<GetGuildRolesOutput> {
  try {
    const roles = await discordClient.getGuildRoles(input.guildId);

    // フィルター処理
    let filteredRoles = roles;

    if (input.adminOnly) {
      filteredRoles = filteredRoles.filter(role => {
        const permissions = BigInt(role.permissions);
        const adminPermission = BigInt('8'); // ADMINISTRATOR permission
        return (permissions & adminPermission) === adminPermission;
      });
    }

    if (input.excludeManaged) {
      filteredRoles = filteredRoles.filter(role => !role.managed);
    }

    const processedRoles = filteredRoles.map(role => {
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
    const adminRoleCount = roles.filter(role => {
      const permissions = BigInt(role.permissions);
      const adminPermission = BigInt('8');
      return (permissions & adminPermission) === adminPermission;
    }).length;

    const managedRoleCount = roles.filter(role => role.managed).length;

    return {
      roles: processedRoles,
      totalCount: roles.length,
      filteredCount: processedRoles.length,
      adminRoleCount,
      managedRoleCount
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'サーバーロールの取得中に不明なエラーが発生しました';
    throw new Error(`サーバーロールの取得に失敗しました: ${errorMessage}`);
  }
}