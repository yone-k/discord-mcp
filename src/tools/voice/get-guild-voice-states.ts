import { z } from 'zod';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';

/**
 * サーバーボイスステート取得ツールの入力スキーマ
 */
export const GetGuildVoiceStatesInputSchema = z.object({
  /** サーバーID（必須） */
  guildId: z.string().min(1, 'サーバーIDは必須です')
}).strict();

export type GetGuildVoiceStatesInput = z.infer<typeof GetGuildVoiceStatesInputSchema>;

/**
 * MCP ツール定義
 */
export const toolDefinition: ToolDefinition = {
  name: 'get_guild_voice_states',
  description: '特定のDiscordサーバーのボイスステート一覧を取得します',
  inputSchema: {
    type: 'object' as const,
    properties: {
      guildId: {
        type: 'string',
        description: 'ボイスステートを取得するサーバーのID'
      }
    },
    required: ['guildId'],
    additionalProperties: false
  }
};

/**
 * サーバーボイスステート取得ツールの出力スキーマ
 */
export const GetGuildVoiceStatesOutputSchema = z.object({
  /** ボイスステート一覧 */
  voiceStates: z.array(z.object({
    /** サーバーID */
    guildId: z.string().optional(),
    /** チャンネルID */
    channelId: z.string().nullable(),
    /** ユーザーID */
    userId: z.string(),
    /** セッションID */
    sessionId: z.string(),
    /** 聴覚障害があるかどうか */
    deaf: z.boolean(),
    /** ミュートされているかどうか */
    mute: z.boolean(),
    /** 自分で聴覚障害にしているか */
    selfDeaf: z.boolean(),
    /** 自分でミュートしているか */
    selfMute: z.boolean(),
    /** ストリーミングしているか */
    selfStream: z.boolean().optional(),
    /** ビデオを有効にしているか */
    selfVideo: z.boolean(),
    /** マイクを抑制しているか */
    suppress: z.boolean(),
    /** リクエスト発言時刻 */
    requestToSpeakTimestamp: z.string().nullable()
  })),
  /** 総ボイスステート数 */
  totalCount: z.number()
});

export type GetGuildVoiceStatesOutput = z.infer<typeof GetGuildVoiceStatesOutputSchema>;

/**
 * 特定のDiscordサーバーのボイスステート一覧を取得
 */
export async function getGuildVoiceStates(
  discordClient: DiscordClient,
  input: GetGuildVoiceStatesInput
): Promise<GetGuildVoiceStatesOutput> {
  try {
    const voiceStates = await discordClient.getGuildVoiceStates(input.guildId);

    const processedVoiceStates = voiceStates.map(voiceState => ({
      guildId: voiceState.guild_id,
      channelId: voiceState.channel_id,
      userId: voiceState.user_id,
      sessionId: voiceState.session_id,
      deaf: voiceState.deaf,
      mute: voiceState.mute,
      selfDeaf: voiceState.self_deaf,
      selfMute: voiceState.self_mute,
      selfStream: voiceState.self_stream,
      selfVideo: voiceState.self_video,
      suppress: voiceState.suppress,
      requestToSpeakTimestamp: voiceState.request_to_speak_timestamp
    }));

    return {
      voiceStates: processedVoiceStates,
      totalCount: processedVoiceStates.length
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'サーバーのボイスステートの取得中に不明なエラーが発生しました';
    throw new Error(`サーバーのボイスステートの取得に失敗しました: ${errorMessage}`);
  }
}