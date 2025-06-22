import { z } from 'zod';
import { DiscordClient } from '../discord/client.js';
import { ToolInputSchema } from '@modelcontextprotocol/sdk/types.js';

/**
 * チャンネル一覧取得ツールの入力スキーマ
 */
export const GetChannelListInputSchema = z.object({
  /** サーバーID（必須） */
  serverId: z.string().min(1, 'サーバーIDは必須です'),
  /** 詳細情報を含めるかどうか（オプション） */
  includeDetails: z.boolean().optional().default(false),
  /** フィルタリングするチャンネルタイプ（オプション） */
  channelType: z.number().min(0).optional()
}).strict();

export type GetChannelListInput = z.infer<typeof GetChannelListInputSchema>;

/**
 * MCP ツール定義
 */
export const toolDefinition = {
  name: 'get_channel_list',
  description: '特定のDiscordサーバーのチャンネル一覧を取得します',
  inputSchema: {
    type: 'object',
    properties: {
      serverId: {
        type: 'string',
        description: 'チャンネル一覧を取得するサーバーのID'
      },
      includeDetails: {
        type: 'boolean',
        description: '詳細情報（トピック、NSFW、権限など）を含めるかどうか',
        default: false
      },
      channelType: {
        type: 'number',
        description: 'フィルタリングするチャンネルタイプ（0: テキスト, 2: ボイス, 4: カテゴリ）',
        minimum: 0
      }
    },
    required: ['serverId'],
    additionalProperties: false
  } as ToolInputSchema
};

/**
 * チャンネル一覧取得ツールの出力スキーマ
 */
export const GetChannelListOutputSchema = z.object({
  /** チャンネル一覧 */
  channels: z.array(z.object({
    /** チャンネルID */
    id: z.string(),
    /** チャンネル名 */
    name: z.string(),
    /** チャンネルタイプ */
    type: z.number(),
    /** チャンネルの位置 */
    position: z.number(),
    /** チャンネルの説明（詳細情報が有効な場合） */
    topic: z.string().nullable().optional(),
    /** NSFWかどうか（詳細情報が有効な場合） */
    nsfw: z.boolean().optional(),
    /** 親カテゴリのID（詳細情報が有効な場合） */
    parentId: z.string().nullable().optional(),
    /** 権限上書き設定（詳細情報が有効な場合） */
    permissionOverwrites: z.array(z.object({
      id: z.string(),
      type: z.number(),
      allow: z.string(),
      deny: z.string()
    })).optional()
  })),
  /** 総チャンネル数 */
  totalCount: z.number()
});

export type GetChannelListOutput = z.infer<typeof GetChannelListOutputSchema>;

/**
 * 特定のDiscordサーバーのチャンネル一覧を取得
 */
export async function getChannelList(
  discordClient: DiscordClient,
  input: GetChannelListInput
): Promise<GetChannelListOutput> {
  try {
    const channels = await discordClient.getGuildChannels(input.serverId);

    // チャンネルタイプでフィルタリング
    let filteredChannels = channels;
    if (input.channelType !== undefined) {
      filteredChannels = channels.filter(channel => channel.type === input.channelType);
    }

    const result = filteredChannels.map(channel => {
      const channelInfo: any = {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        position: channel.position
      };

      // 詳細情報が要求された場合
      if (input.includeDetails) {
        if (channel.topic !== undefined) {
          channelInfo.topic = channel.topic;
        }
        if (channel.nsfw !== undefined) {
          channelInfo.nsfw = channel.nsfw;
        }
        if (channel.parent_id !== undefined) {
          channelInfo.parentId = channel.parent_id;
        }
        if (channel.permission_overwrites !== undefined) {
          channelInfo.permissionOverwrites = channel.permission_overwrites.map(overwrite => ({
            id: overwrite.id,
            type: overwrite.type,
            allow: overwrite.allow,
            deny: overwrite.deny
          }));
        }
      }

      return channelInfo;
    });

    return {
      channels: result,
      totalCount: result.length
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'チャンネル一覧の取得中に不明なエラーが発生しました';
    throw new Error(`チャンネル一覧の取得に失敗しました: ${errorMessage}`);
  }
}