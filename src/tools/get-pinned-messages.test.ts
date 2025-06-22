import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../discord/client.js';
import { ToolDefinition } from '../types/mcp.js';import { getPinnedMessages, GetPinnedMessagesInputSchema } from './get-pinned-messages.js';
import { DiscordMessage } from '../types/discord.js';

// DiscordClientのモック
vi.mock('../discord/client.js');

describe('getPinnedMessages', () => {
  let mockDiscordClient: vi.Mocked<DiscordClient>;

  beforeEach(() => {
    mockDiscordClient = {
      getPinnedMessages: vi.fn(),
    } as any;
  });

  const mockPinnedMessage: DiscordMessage = {
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
    content: 'This is a pinned message!',
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
    pinned: true
  };

  describe('正常系', () => {
    it('チャンネルのピン留めメッセージ一覧を取得できる', async () => {
      mockDiscordClient.getPinnedMessages.mockResolvedValue([mockPinnedMessage]);

      const input = {
        channelId: '987654321'
      };

      const result = await getPinnedMessages(mockDiscordClient, input);

      expect(mockDiscordClient.getPinnedMessages).toHaveBeenCalledWith('987654321');
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].id).toBe('123456789');
      expect(result.messages[0].content).toBe('This is a pinned message!');
      expect(result.messages[0].pinned).toBe(true);
      expect(result.totalCount).toBe(1);
    });

    it('複数のピン留めメッセージを取得できる', async () => {
      const messages: DiscordMessage[] = [
        mockPinnedMessage,
        {
          ...mockPinnedMessage,
          id: '987654321',
          content: 'Second pinned message',
          timestamp: '2023-01-02T00:00:00.000Z'
        }
      ];
      
      mockDiscordClient.getPinnedMessages.mockResolvedValue(messages);

      const input = {
        channelId: '987654321'
      };

      const result = await getPinnedMessages(mockDiscordClient, input);

      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].id).toBe('123456789');
      expect(result.messages[1].id).toBe('987654321');
      expect(result.totalCount).toBe(2);
    });

    it('空のピン留めメッセージリストを取得できる', async () => {
      mockDiscordClient.getPinnedMessages.mockResolvedValue([]);

      const input = {
        channelId: '987654321'
      };

      const result = await getPinnedMessages(mockDiscordClient, input);

      expect(result.messages).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('添付ファイル付きピン留めメッセージを取得できる', async () => {
      const messageWithAttachment: DiscordMessage = {
        ...mockPinnedMessage,
        attachments: [{
          id: 'attachment_123',
          filename: 'important.pdf',
          size: 2048,
          url: 'https://cdn.discordapp.com/attachments/123/456/important.pdf',
          proxy_url: 'https://media.discordapp.net/attachments/123/456/important.pdf',
          height: null,
          width: null
        }]
      };
      
      mockDiscordClient.getPinnedMessages.mockResolvedValue([messageWithAttachment]);

      const input = {
        channelId: '987654321'
      };

      const result = await getPinnedMessages(mockDiscordClient, input);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].attachments).toHaveLength(1);
      expect(result.messages[0].attachments[0].filename).toBe('important.pdf');
      expect(result.messages[0].attachments[0].size).toBe(2048);
    });

    it('埋め込み付きピン留めメッセージを取得できる', async () => {
      const messageWithEmbeds: DiscordMessage = {
        ...mockPinnedMessage,
        embeds: [{
          title: 'Important Announcement',
          description: 'This is an important announcement',
          color: 0xff0000,
          fields: [{
            name: 'Details',
            value: 'Important details here',
            inline: false
          }]
        }]
      };
      
      mockDiscordClient.getPinnedMessages.mockResolvedValue([messageWithEmbeds]);

      const input = {
        channelId: '987654321'
      };

      const result = await getPinnedMessages(mockDiscordClient, input);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].embedCount).toBe(1);
    });

    it('リアクション付きピン留めメッセージを取得できる', async () => {
      const messageWithReactions: DiscordMessage = {
        ...mockPinnedMessage,
        reactions: [{
          count: 10,
          me: false,
          emoji: {
            id: null,
            name: '📌',
            animated: false
          }
        }]
      };
      
      mockDiscordClient.getPinnedMessages.mockResolvedValue([messageWithReactions]);

      const input = {
        channelId: '987654321'
      };

      const result = await getPinnedMessages(mockDiscordClient, input);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].reactions).toHaveLength(1);
      expect(result.messages[0].reactions[0].count).toBe(10);
      expect(result.messages[0].reactions[0].emoji.name).toBe('📌');
    });
  });

  describe('異常系', () => {
    it('Discord APIエラーが発生した場合、適切なエラーメッセージを返す', async () => {
      const apiError = new Error('Discord API Error: 403 Forbidden');
      mockDiscordClient.getPinnedMessages.mockRejectedValue(apiError);

      const input = {
        channelId: '987654321'
      };

      await expect(getPinnedMessages(mockDiscordClient, input)).rejects.toThrow(
        'ピン留めメッセージの取得に失敗しました: Discord API Error: 403 Forbidden'
      );
    });

    it('不明なエラーが発生した場合、汎用エラーメッセージを返す', async () => {
      mockDiscordClient.getPinnedMessages.mockRejectedValue(null);

      const input = {
        channelId: '987654321'
      };

      await expect(getPinnedMessages(mockDiscordClient, input)).rejects.toThrow(
        'ピン留めメッセージの取得に失敗しました: ピン留めメッセージの取得中に不明なエラーが発生しました'
      );
    });
  });

  describe('入力バリデーション', () => {
    it('有効な入力値を正常に検証する', () => {
      const validInput = {
        channelId: '123456789'
      };

      const result = GetPinnedMessagesInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.channelId).toBe('123456789');
      }
    });

    it('channelIdが空文字の場合、バリデーションエラーになる', () => {
      const invalidInput = {
        channelId: ''
      };

      const result = GetPinnedMessagesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('必須パラメータが不足している場合、バリデーションエラーになる', () => {
      const invalidInput = {};

      const result = GetPinnedMessagesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });
  });
});