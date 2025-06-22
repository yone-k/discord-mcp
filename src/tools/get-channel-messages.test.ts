import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../discord/client.js';
import { getChannelMessages, GetChannelMessagesInputSchema } from './get-channel-messages.js';
import { DiscordMessage } from '../types/discord.js';

// DiscordClientのモック
vi.mock('../discord/client.js');

describe('getChannelMessages', () => {
  let mockDiscordClient: vi.Mocked<DiscordClient>;

  beforeEach(() => {
    mockDiscordClient = {
      getChannelMessages: vi.fn(),
    } as any;
  });

  const mockMessage: DiscordMessage = {
    id: '123456789',
    channel_id: '987654321',
    guild_id: '555666777',
    author: {
      id: '111222333',
      username: 'testuser',
      discriminator: '1234',
      avatar: 'avatar_hash',
      bot: false
    },
    content: 'Hello, world!',
    timestamp: '2023-01-01T00:00:00.000Z',
    edited_timestamp: null,
    tts: false,
    mention_everyone: false,
    mentions: [],
    mention_roles: [],
    attachments: [],
    embeds: [],
    reactions: [],
    type: 0,
    flags: 0,
    pinned: false
  };

  describe('正常系', () => {
    it('チャンネルのメッセージ一覧を取得できる', async () => {
      mockDiscordClient.getChannelMessages.mockResolvedValue([mockMessage]);

      const input = {
        channelId: '987654321',
        limit: 50
      };

      const result = await getChannelMessages(mockDiscordClient, input);

      expect(mockDiscordClient.getChannelMessages).toHaveBeenCalledWith('987654321', {
        limit: 50
      });
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].id).toBe('123456789');
      expect(result.messages[0].content).toBe('Hello, world!');
      expect(result.totalCount).toBe(1);
    });

    it('limitパラメータなしでデフォルト値が使用される', async () => {
      mockDiscordClient.getChannelMessages.mockResolvedValue([mockMessage]);

      const input = {
        channelId: '987654321'
      };

      const result = await getChannelMessages(mockDiscordClient, input);

      expect(mockDiscordClient.getChannelMessages).toHaveBeenCalledWith('987654321', {
        limit: 50
      });
      expect(result.messages).toHaveLength(1);
    });

    it('beforeパラメータを指定してメッセージを取得できる', async () => {
      mockDiscordClient.getChannelMessages.mockResolvedValue([mockMessage]);

      const input = {
        channelId: '987654321',
        limit: 25,
        before: '999888777'
      };

      const result = await getChannelMessages(mockDiscordClient, input);

      expect(mockDiscordClient.getChannelMessages).toHaveBeenCalledWith('987654321', {
        limit: 25,
        before: '999888777'
      });
    });

    it('afterパラメータを指定してメッセージを取得できる', async () => {
      mockDiscordClient.getChannelMessages.mockResolvedValue([mockMessage]);

      const input = {
        channelId: '987654321',
        limit: 25,
        after: '111222333'
      };

      const result = await getChannelMessages(mockDiscordClient, input);

      expect(mockDiscordClient.getChannelMessages).toHaveBeenCalledWith('987654321', {
        limit: 25,
        after: '111222333'
      });
    });

    it('aroundパラメータを指定してメッセージを取得できる', async () => {
      mockDiscordClient.getChannelMessages.mockResolvedValue([mockMessage]);

      const input = {
        channelId: '987654321',
        limit: 25,
        around: '444555666'
      };

      const result = await getChannelMessages(mockDiscordClient, input);

      expect(mockDiscordClient.getChannelMessages).toHaveBeenCalledWith('987654321', {
        limit: 25,
        around: '444555666'
      });
    });

    it('空のメッセージリストを取得できる', async () => {
      mockDiscordClient.getChannelMessages.mockResolvedValue([]);

      const input = {
        channelId: '987654321'
      };

      const result = await getChannelMessages(mockDiscordClient, input);

      expect(result.messages).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('異常系', () => {
    it('Discord APIエラーが発生した場合、適切なエラーメッセージを返す', async () => {
      const apiError = new Error('Discord API Error: 403 Forbidden');
      mockDiscordClient.getChannelMessages.mockRejectedValue(apiError);

      const input = {
        channelId: '987654321'
      };

      await expect(getChannelMessages(mockDiscordClient, input)).rejects.toThrow(
        'チャンネルメッセージの取得に失敗しました: Discord API Error: 403 Forbidden'
      );
    });

    it('不明なエラーが発生した場合、汎用エラーメッセージを返す', async () => {
      mockDiscordClient.getChannelMessages.mockRejectedValue(null);

      const input = {
        channelId: '987654321'
      };

      await expect(getChannelMessages(mockDiscordClient, input)).rejects.toThrow(
        'チャンネルメッセージの取得に失敗しました: チャンネルメッセージの取得中に不明なエラーが発生しました'
      );
    });
  });

  describe('入力バリデーション', () => {
    it('有効な入力値を正常に検証する', () => {
      const validInput = {
        channelId: '123456789',
        limit: 25,
        before: '987654321'
      };

      const result = GetChannelMessagesInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.channelId).toBe('123456789');
      }
    });

    it('channelIdが空文字の場合、バリデーションエラーになる', () => {
      const invalidInput = {
        channelId: '',
        limit: 25
      };

      const result = GetChannelMessagesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('limitが範囲外の場合、バリデーションエラーになる', () => {
      const invalidInput = {
        channelId: '123456789',
        limit: 101
      };

      const result = GetChannelMessagesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('limitが0以下の場合、バリデーションエラーになる', () => {
      const invalidInput = {
        channelId: '123456789',
        limit: 0
      };

      const result = GetChannelMessagesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('複数のページネーションパラメータが指定された場合、バリデーションエラーになる', () => {
      const invalidInput = {
        channelId: '123456789',
        before: '111',
        after: '222'
      };

      const result = GetChannelMessagesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });
  });
});