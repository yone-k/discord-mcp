import { z } from 'zod';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';

/**
 * サーバー一覧取得ツールの入力スキーマ
 */
export const GetServerListInputSchema = z.object({
  /** 詳細情報を含めるかどうか（オプション） */
  includeDetails: z.boolean().optional().default(false)
}).strict();

export type GetServerListInput = z.infer<typeof GetServerListInputSchema>;

/**
 * MCP ツール定義
 */
export const toolDefinition: ToolDefinition = {
  name: 'get_server_list',
  description: 'Botが参加しているDiscordサーバーの一覧を取得します',
  inputSchema: {
    type: 'object' as const,
    properties: {
      includeDetails: {
        type: 'boolean',
        description: '詳細情報（メンバー数、機能など）を含めるかどうか',
        default: false
      }
    },
    additionalProperties: false
  }
};

/**
 * サーバー一覧取得ツールの出力スキーマ
 */
export const GetServerListOutputSchema = z.object({
  /** サーバー一覧 */
  servers: z.array(z.object({
    /** サーバーID */
    id: z.string(),
    /** サーバー名 */
    name: z.string(),
    /** アイコンURL（存在する場合） */
    iconUrl: z.string().nullable(),
    /** メンバー数（詳細情報が有効な場合） */
    memberCount: z.number().optional(),
    /** オンラインメンバー数（詳細情報が有効な場合） */
    onlineCount: z.number().optional(),
    /** サーバーの機能一覧 */
    features: z.array(z.string()).optional()
  })),
  /** 総サーバー数 */
  totalCount: z.number()
});

export type GetServerListOutput = z.infer<typeof GetServerListOutputSchema>;

/**
 * ボットが参加しているDiscordサーバー一覧を取得
 */
export async function getServerList(
  client: DiscordClient,
  input: GetServerListInput
): Promise<GetServerListOutput> {
  try {
    const guilds = await client.getGuilds();

    const servers = guilds.map(guild => {
      // アイコンURLを生成
      const iconUrl = guild.icon 
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
        : null;

      const serverInfo: any = {
        id: guild.id,
        name: guild.name,
        iconUrl
      };

      // 詳細情報が要求された場合
      if (input.includeDetails) {
        if (guild.approximate_member_count !== undefined) {
          serverInfo.memberCount = guild.approximate_member_count;
        }
        if (guild.approximate_presence_count !== undefined) {
          serverInfo.onlineCount = guild.approximate_presence_count;
        }
        if (guild.features) {
          serverInfo.features = guild.features;
        }
      }

      return serverInfo;
    });

    return {
      servers,
      totalCount: servers.length
    };
  } catch (error) {
    throw new Error(`サーバー一覧の取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}