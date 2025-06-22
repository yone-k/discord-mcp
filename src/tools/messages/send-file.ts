import { z } from 'zod';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';

/**
 * Base64文字列の検証
 */
const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;

const Base64Schema = z.string()
  .min(1, 'ファイル内容（base64）は必須です')
  .refine(
    (val) => {
      try {
        // 基本的な文字チェック
        if (!base64Regex.test(val)) {
          return false;
        }
        // 実際にデコードしてみる
        Buffer.from(val, 'base64');
        return true;
      } catch {
        return false;
      }
    },
    {
      message: '有効なbase64エンコードされた文字列が必要です'
    }
  );

/**
 * ファイル送信ツールの入力スキーマ
 */
export const SendFileInputSchema = z.object({
  /** チャンネルID（必須） */
  channelId: z.string().min(1, 'チャンネルIDは必須です'),
  /** メッセージ内容（オプション） */
  content: z.string().max(2000, 'メッセージ内容は2000文字以下である必要があります').optional(),
  /** ファイル情報 */
  file: z.object({
    /** ファイル名 */
    name: z.string().min(1, 'ファイル名は必須です').max(256, 'ファイル名は256文字以下である必要があります'),
    /** ファイル内容（base64エンコード） */
    content: Base64Schema,
    /** MIMEタイプ */
    contentType: z.string().optional()
  }).strict(),
  /** スポイラーとして送信するかどうか */
  spoiler: z.boolean().optional().default(false)
}).strict();

export type SendFileInput = z.infer<typeof SendFileInputSchema>;

/**
 * MCP ツール定義
 */
export const toolDefinition: ToolDefinition = {
  name: 'send_file',
  description: 'Discordチャンネルにファイルを送信します',
  inputSchema: {
    type: 'object' as const,
    properties: {
      channelId: {
        type: 'string',
        description: 'ファイルを送信するチャンネルのID'
      },
      content: {
        type: 'string',
        description: 'ファイルと一緒に送信するメッセージ内容（最大2000文字、オプション）'
      },
      file: {
        type: 'object',
        description: '送信するファイルの情報',
        properties: {
          name: {
            type: 'string',
            description: 'ファイル名（最大256文字）'
          },
          content: {
            type: 'string',
            description: 'ファイルの内容（base64エンコード）'
          },
          contentType: {
            type: 'string',
            description: 'ファイルのMIMEタイプ（オプション）'
          }
        },
        required: ['name', 'content'],
        additionalProperties: false
      },
      spoiler: {
        type: 'boolean',
        description: 'スポイラーとして送信するかどうか（デフォルト: false）',
        default: false
      }
    },
    required: ['channelId', 'file'],
    additionalProperties: false
  }
};

/**
 * ファイル送信ツールの出力スキーマ
 */
export const SendFileOutputSchema = z.object({
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

export type SendFileOutput = z.infer<typeof SendFileOutputSchema>;

/**
 * Discordチャンネルにファイルを送信
 */
export async function sendFile(
  discordClient: DiscordClient,
  input: SendFileInput
): Promise<SendFileOutput> {
  try {
    // base64デコード
    const fileData = Buffer.from(input.file.content, 'base64');
    
    const messageData = {
      content: input.content,
      file: {
        name: input.file.name,
        data: fileData,
        contentType: input.file.contentType
      },
      spoiler: input.spoiler || false
    };

    const message = await discordClient.sendMessageWithFile(input.channelId, messageData);

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
    const errorMessage = error instanceof Error ? error.message : 'ファイルの送信中に不明なエラーが発生しました';
    throw new Error(`ファイルの送信に失敗しました: ${errorMessage}`);
  }
}