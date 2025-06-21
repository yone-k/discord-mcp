import { z } from 'zod';
import { DiscordClient } from '../discord/client.js';

/**
 * ユーザー一覧取得ツールの入力スキーマ
 */
export const GetUserListInputSchema = z.object({
  /** サーバーID（必須） */
  serverId: z.string().min(1, 'サーバーIDは必須です'),
  /** 取得する最大数（オプション、デフォルト: 100、最大: 1000） */
  limit: z.number().min(1).max(1000).optional().default(100),
  /** ページネーション用のユーザーID（オプション） */
  after: z.string().optional(),
  /** 詳細情報を含めるかどうか（オプション） */
  includeDetails: z.boolean().optional().default(false),
  /** ロール別にフィルタリング（オプション） */
  roleId: z.string().optional()
}).strict();

export type GetUserListInput = z.infer<typeof GetUserListInputSchema>;

/**
 * ユーザー一覧取得ツールの出力スキーマ
 */
export const GetUserListOutputSchema = z.object({
  /** ユーザー一覧 */
  users: z.array(z.object({
    /** ユーザーID */
    id: z.string(),
    /** ユーザー名 */
    username: z.string(),
    /** ディスクリミネーター */
    discriminator: z.string(),
    /** グローバル名 */
    globalName: z.string().nullable().optional(),
    /** ニックネーム（サーバー内での表示名） */
    nickname: z.string().nullable().optional(),
    /** アバターURL */
    avatarUrl: z.string().nullable(),
    /** ボットかどうか */
    isBot: z.boolean(),
    /** ロールID一覧（詳細情報が有効な場合） */
    roles: z.array(z.string()).optional(),
    /** サーバー参加日時（詳細情報が有効な場合） */
    joinedAt: z.string().optional(),
    /** ブースト開始日時（詳細情報が有効な場合） */
    premiumSince: z.string().nullable().optional()
  })),
  /** 総ユーザー数（取得できた分） */
  totalCount: z.number(),
  /** 次のページがあるかどうか */
  hasMore: z.boolean(),
  /** 次のページ取得用のユーザーID */
  nextUserId: z.string().nullable().optional()
});

export type GetUserListOutput = z.infer<typeof GetUserListOutputSchema>;

/**
 * 特定のDiscordサーバーのユーザー一覧を取得
 */
export async function getUserList(
  discordClient: DiscordClient,
  input: GetUserListInput
): Promise<GetUserListOutput> {
  try {
    const members = await discordClient.getGuildMembers(input.serverId, {
      limit: input.limit,
      after: input.after
    });

    // ロールIDでフィルタリング
    let filteredMembers = members;
    if (input.roleId) {
      filteredMembers = members.filter(member => member.roles.includes(input.roleId!));
    }

    const users = filteredMembers.map(member => {
      const user = member.user || {
        id: 'unknown',
        username: 'Unknown User',
        discriminator: '0000',
        avatar: null
      };

      const userInfo: any = {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        globalName: user.global_name || null,
        nickname: member.nick || null,
        avatarUrl: user.avatar
          ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
          : null,
        isBot: user.bot || false
      };

      // 詳細情報が要求された場合
      if (input.includeDetails) {
        userInfo.roles = member.roles;
        userInfo.joinedAt = member.joined_at;
        if (member.premium_since) {
          userInfo.premiumSince = member.premium_since;
        }
      }

      return userInfo;
    });

    // 次のページがあるかどうかを判定
    const hasMore = members.length === input.limit;
    const lastUserId = hasMore && users.length > 0 ? users[users.length - 1].id : null;

    return {
      users,
      totalCount: users.length,
      hasMore,
      nextUserId: lastUserId
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'ユーザー一覧の取得中に不明なエラーが発生しました';
    throw new Error(`ユーザー一覧の取得に失敗しました: ${errorMessage}`);
  }
}