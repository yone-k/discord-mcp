import { z } from 'zod';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';

/**
 * ピン留めメッセージ取得ツールの入力スキーマ
 */
export const GetPinnedMessagesInputSchema = z.object({
  /** チャンネルID（必須） */
  channelId: z.string().min(1, 'チャンネルIDは必須です')
}).strict();

export type GetPinnedMessagesInput = z.infer<typeof GetPinnedMessagesInputSchema>;

/**
 * MCP ツール定義
 */
export const toolDefinition: ToolDefinition = {
  name: 'get_pinned_messages',
  description: '特定のDiscordチャンネルのピン留めメッセージ一覧を取得します',
  inputSchema: {
    type: 'object' as const,
    properties: {
      channelId: {
        type: 'string',
        description: 'ピン留めメッセージを取得するチャンネルのID'
      }
    },
    required: ['channelId'],
    additionalProperties: false
  }
};

/**
 * ピン留めメッセージ取得ツールの出力スキーマ
 */
export const GetPinnedMessagesOutputSchema = z.object({
  /** ピン留めメッセージ一覧 */
  messages: z.array(z.object({
    /** メッセージID */
    id: z.string(),
    /** チャンネルID */
    channelId: z.string(),
    /** サーバーID */
    guildId: z.string().optional(),
    /** 送信者情報 */
    author: z.object({
      /** ユーザーID */
      id: z.string(),
      /** ユーザー名 */
      username: z.string(),
      /** ディスクリミネーター */
      discriminator: z.string(),
      /** グローバル名 */
      globalName: z.string().nullable().optional(),
      /** アバターURL */
      avatarUrl: z.string().nullable(),
      /** ボットかどうか */
      isBot: z.boolean()
    }),
    /** メンバー情報（サーバー内の場合） */
    member: z.object({
      /** ニックネーム */
      nickname: z.string().nullable().optional(),
      /** ロールID一覧 */
      roles: z.array(z.string())
    }).optional(),
    /** メッセージ内容 */
    content: z.string(),
    /** 送信日時 */
    timestamp: z.string(),
    /** 編集日時 */
    editedTimestamp: z.string().nullable().optional(),
    /** TTS（読み上げ）かどうか */
    tts: z.boolean(),
    /** @everyone または @here が含まれるか */
    mentionEveryone: z.boolean(),
    /** メンション対象ユーザー一覧 */
    mentions: z.array(z.object({
      id: z.string(),
      username: z.string(),
      discriminator: z.string(),
      globalName: z.string().nullable().optional()
    })),
    /** メンション対象ロール一覧 */
    mentionRoles: z.array(z.string()),
    /** 添付ファイル一覧 */
    attachments: z.array(z.object({
      id: z.string(),
      filename: z.string(),
      size: z.number(),
      url: z.string(),
      contentType: z.string().optional(),
      height: z.number().nullable().optional(),
      width: z.number().nullable().optional()
    })),
    /** 埋め込みコンテンツ数 */
    embedCount: z.number(),
    /** リアクション一覧 */
    reactions: z.array(z.object({
      emoji: z.object({
        id: z.string().nullable().optional(),
        name: z.string().nullable().optional(),
        animated: z.boolean().optional()
      }),
      count: z.number(),
      me: z.boolean()
    })).optional(),
    /** メッセージタイプ */
    type: z.number(),
    /** ピン留めされているか（常にtrue） */
    pinned: z.boolean(),
    /** Webhook送信かどうか */
    isWebhook: z.boolean()
  })),
  /** 総ピン留めメッセージ数 */
  totalCount: z.number(),
  /** 最も古いピン留めメッセージID */
  oldestMessageId: z.string().nullable(),
  /** 最も新しいピン留めメッセージID */
  newestMessageId: z.string().nullable()
});

export type GetPinnedMessagesOutput = z.infer<typeof GetPinnedMessagesOutputSchema>;

/**
 * 特定のDiscordチャンネルのピン留めメッセージ一覧を取得
 */
export async function getPinnedMessages(
  discordClient: DiscordClient,
  input: GetPinnedMessagesInput
): Promise<GetPinnedMessagesOutput> {
  try {
    const messages = await discordClient.getPinnedMessages(input.channelId);

    const processedMessages = messages.map(message => {
      const author = {
        id: message.author.id,
        username: message.author.username,
        discriminator: message.author.discriminator,
        globalName: message.author.global_name || null,
        avatarUrl: message.author.avatar
          ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`
          : null,
        isBot: message.author.bot || false
      };

      const member = message.member ? {
        nickname: message.member.nick || null,
        roles: message.member.roles
      } : undefined;

      const mentions = message.mentions.map(user => ({
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        globalName: user.global_name || null
      }));

      const attachments = message.attachments.map(attachment => ({
        id: attachment.id,
        filename: attachment.filename,
        size: attachment.size,
        url: attachment.url,
        height: attachment.height,
        width: attachment.width
      }));

      const reactions = message.reactions?.map(reaction => ({
        emoji: {
          id: reaction.emoji.id,
          name: reaction.emoji.name,
          animated: reaction.emoji.animated
        },
        count: reaction.count,
        me: reaction.me
      })) || [];

      return {
        id: message.id,
        channelId: message.channel_id,
        guildId: message.guild_id,
        author,
        member,
        content: message.content,
        timestamp: message.timestamp,
        editedTimestamp: message.edited_timestamp,
        tts: message.tts,
        mentionEveryone: message.mention_everyone,
        mentions,
        mentionRoles: message.mention_roles,
        attachments,
        embedCount: message.embeds.length,
        reactions,
        type: message.type,
        pinned: message.pinned,
        isWebhook: !!message.webhook_id
      };
    });

    // ピン留めメッセージは新しい順で返されるため、最古・最新のIDを取得
    const oldestMessageId = processedMessages.length > 0 
      ? processedMessages[processedMessages.length - 1].id 
      : null;
    const newestMessageId = processedMessages.length > 0 
      ? processedMessages[0].id 
      : null;

    return {
      messages: processedMessages,
      totalCount: processedMessages.length,
      oldestMessageId,
      newestMessageId
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'ピン留めメッセージの取得中に不明なエラーが発生しました';
    throw new Error(`ピン留めメッセージの取得に失敗しました: ${errorMessage}`);
  }
}