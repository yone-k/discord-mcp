import { z } from 'zod';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';

/**
 * Discord Embed の型定義
 */
const EmbedSchema = z.object({
  /** タイトル */
  title: z.string().max(256).optional(),
  /** 説明 */
  description: z.string().max(4096).optional(),
  /** URL */
  url: z.string().url().optional(),
  /** 色（16進数） */
  color: z.number().int().min(0).max(16777215).optional(),
  /** フッター */
  footer: z.object({
    text: z.string().max(2048),
    icon_url: z.string().url().optional()
  }).optional(),
  /** 画像 */
  image: z.object({
    url: z.string().url()
  }).optional(),
  /** サムネイル */
  thumbnail: z.object({
    url: z.string().url()
  }).optional(),
  /** 作成者 */
  author: z.object({
    name: z.string().max(256),
    url: z.string().url().optional(),
    icon_url: z.string().url().optional()
  }).optional(),
  /** フィールド */
  fields: z.array(z.object({
    name: z.string().max(256),
    value: z.string().max(1024),
    inline: z.boolean().optional()
  })).max(25).optional(),
  /** タイムスタンプ */
  timestamp: z.string().datetime().optional()
}).strict();

/**
 * メッセージ送信ツールの入力スキーマ
 */
export const SendMessageInputSchema = z.object({
  /** チャンネルID（必須） */
  channelId: z.string().min(1, 'チャンネルIDは必須です'),
  /** メッセージ内容（必須） */
  content: z.string().min(1, 'メッセージ内容は必須です').max(2000, 'メッセージ内容は2000文字以下である必要があります'),
  /** TTS（読み上げ）設定 */
  tts: z.boolean().optional().default(false),
  /** 埋め込みコンテンツ */
  embeds: z.array(EmbedSchema).max(10, 'Embedは最大10個まで指定できます').optional()
}).strict();

export type SendMessageInput = z.infer<typeof SendMessageInputSchema>;

/**
 * MCP ツール定義
 */
export const toolDefinition: ToolDefinition = {
  name: 'send_message',
  description: 'Discordチャンネルにメッセージを送信します',
  inputSchema: {
    type: 'object' as const,
    properties: {
      channelId: {
        type: 'string',
        description: 'メッセージを送信するチャンネルのID'
      },
      content: {
        type: 'string',
        description: '送信するメッセージの内容（最大2000文字）'
      },
      tts: {
        type: 'boolean',
        description: 'TTS（読み上げ）でメッセージを送信するかどうか（デフォルト: false）',
        default: false
      },
      embeds: {
        type: 'array',
        description: '埋め込みコンテンツ（最大10個）',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'タイトル（最大256文字）' },
            description: { type: 'string', description: '説明（最大4096文字）' },
            url: { type: 'string', description: 'URL' },
            color: { type: 'number', description: '色（16進数、0-16777215）' },
            footer: {
              type: 'object',
              properties: {
                text: { type: 'string', description: 'フッターテキスト（最大2048文字）' },
                icon_url: { type: 'string', description: 'フッターアイコンURL' }
              }
            },
            image: {
              type: 'object',
              properties: {
                url: { type: 'string', description: '画像URL' }
              }
            },
            thumbnail: {
              type: 'object',
              properties: {
                url: { type: 'string', description: 'サムネイルURL' }
              }
            },
            author: {
              type: 'object',
              properties: {
                name: { type: 'string', description: '作成者名（最大256文字）' },
                url: { type: 'string', description: '作成者URL' },
                icon_url: { type: 'string', description: '作成者アイコンURL' }
              }
            },
            fields: {
              type: 'array',
              description: 'フィールド（最大25個）',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'フィールド名（最大256文字）' },
                  value: { type: 'string', description: 'フィールド値（最大1024文字）' },
                  inline: { type: 'boolean', description: 'インライン表示するかどうか' }
                }
              }
            },
            timestamp: { type: 'string', description: 'タイムスタンプ（ISO 8601形式）' }
          }
        }
      }
    },
    required: ['channelId', 'content'],
    additionalProperties: false
  }
};

/**
 * メッセージ送信ツールの出力スキーマ
 */
export const SendMessageOutputSchema = z.object({
  /** 送信されたメッセージ情報 */
  message: z.object({
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
    /** ピン留めされているか */
    pinned: z.boolean(),
    /** Webhook送信かどうか */
    isWebhook: z.boolean()
  }),
  /** 送信成功フラグ */
  success: z.boolean()
});

export type SendMessageOutput = z.infer<typeof SendMessageOutputSchema>;

/**
 * Discordチャンネルにメッセージを送信
 */
export async function sendMessage(
  discordClient: DiscordClient,
  input: SendMessageInput
): Promise<SendMessageOutput> {
  try {
    const messageData = {
      content: input.content,
      tts: input.tts || false,
      embeds: input.embeds
    };

    const message = await discordClient.sendMessage(input.channelId, messageData);

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
      contentType: attachment.content_type,
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

    const processedMessage = {
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

    return {
      message: processedMessage,
      success: true
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'メッセージの送信中に不明なエラーが発生しました';
    throw new Error(`メッセージの送信に失敗しました: ${errorMessage}`);
  }
}