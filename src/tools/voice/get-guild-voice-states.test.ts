import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';
import { getGuildVoiceStates, GetGuildVoiceStatesInputSchema } from './get-guild-voice-states.js';
import { DiscordVoiceState } from '../../types/discord.js';

// DiscordClientのモック
vi.mock('../../discord/client.js');

describe('getGuildVoiceStates', () => {
  let mockDiscordClient: vi.Mocked<DiscordClient>;

  beforeEach(() => {
    mockDiscordClient = {
      getGuildVoiceStates: vi.fn(),
    } as any;
  });

  const mockVoiceStates: DiscordVoiceState[] = [
    {
      guild_id: '123456789',
      channel_id: '987654321',
      user_id: '111222333',
      session_id: 'session123',
      deaf: false,
      mute: false,
      self_deaf: false,
      self_mute: true,
      self_video: false,
      suppress: false,
      request_to_speak_timestamp: null
    },
    {
      guild_id: '123456789',
      channel_id: '987654322',
      user_id: '444555666',
      session_id: 'session456',
      deaf: true,
      mute: true,
      self_deaf: false,
      self_mute: false,
      self_video: true,
      suppress: false,
      request_to_speak_timestamp: '2023-01-01T12:00:00.000Z'
    }
  ];

  describe('正常系', () => {
    it('サーバーのボイスステート一覧を取得できる', async () => {
      mockDiscordClient.getGuildVoiceStates.mockResolvedValue(mockVoiceStates);

      const input = {
        guildId: '123456789'
      };

      const result = await getGuildVoiceStates(mockDiscordClient, input);

      expect(mockDiscordClient.getGuildVoiceStates).toHaveBeenCalledWith('123456789');
      expect(result.voiceStates).toHaveLength(2);
      expect(result.voiceStates[0].guildId).toBe('123456789');
      expect(result.voiceStates[0].channelId).toBe('987654321');
      expect(result.voiceStates[0].userId).toBe('111222333');
      expect(result.voiceStates[0].selfMute).toBe(true);
      expect(result.totalCount).toBe(2);
    });

    it('空のボイスステートリストを取得できる', async () => {
      mockDiscordClient.getGuildVoiceStates.mockResolvedValue([]);

      const input = {
        guildId: '123456789'
      };

      const result = await getGuildVoiceStates(mockDiscordClient, input);

      expect(result.voiceStates).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('ミュート状態のユーザーを正しく識別できる', async () => {
      mockDiscordClient.getGuildVoiceStates.mockResolvedValue(mockVoiceStates);

      const input = {
        guildId: '123456789'
      };

      const result = await getGuildVoiceStates(mockDiscordClient, input);

      const mutedUsers = result.voiceStates.filter(state => state.mute);
      expect(mutedUsers).toHaveLength(1);
      expect(mutedUsers[0].userId).toBe('444555666');
    });

    it('ビデオ有効なユーザーを正しく識別できる', async () => {
      mockDiscordClient.getGuildVoiceStates.mockResolvedValue(mockVoiceStates);

      const input = {
        guildId: '123456789'
      };

      const result = await getGuildVoiceStates(mockDiscordClient, input);

      const videoUsers = result.voiceStates.filter(state => state.selfVideo);
      expect(videoUsers).toHaveLength(1);
      expect(videoUsers[0].userId).toBe('444555666');
    });
  });

  describe('異常系', () => {
    it('Discord APIエラーが発生した場合、適切なエラーメッセージを返す', async () => {
      const apiError = new Error('Discord API Error: 403 Forbidden');
      mockDiscordClient.getGuildVoiceStates.mockRejectedValue(apiError);

      const input = {
        guildId: '123456789'
      };

      await expect(getGuildVoiceStates(mockDiscordClient, input)).rejects.toThrow(
        'サーバーのボイスステートの取得に失敗しました: Discord API Error: 403 Forbidden'
      );
    });

    it('不明なエラーが発生した場合、汎用エラーメッセージを返す', async () => {
      mockDiscordClient.getGuildVoiceStates.mockRejectedValue(null);

      const input = {
        guildId: '123456789'
      };

      await expect(getGuildVoiceStates(mockDiscordClient, input)).rejects.toThrow(
        'サーバーのボイスステートの取得に失敗しました: サーバーのボイスステートの取得中に不明なエラーが発生しました'
      );
    });
  });

  describe('入力バリデーション', () => {
    it('有効な入力値を正常に検証する', () => {
      const validInput = {
        guildId: '123456789'
      };

      const result = GetGuildVoiceStatesInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.guildId).toBe('123456789');
      }
    });

    it('guildIdが空文字の場合、バリデーションエラーになる', () => {
      const invalidInput = {
        guildId: ''
      };

      const result = GetGuildVoiceStatesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('guildIdが欠けている場合、バリデーションエラーになる', () => {
      const invalidInput = {};

      const result = GetGuildVoiceStatesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('追加のプロパティがある場合、バリデーションエラーになる', () => {
      const invalidInput = {
        guildId: '123456789',
        invalidProperty: 'test'
      };

      const result = GetGuildVoiceStatesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });
  });
});