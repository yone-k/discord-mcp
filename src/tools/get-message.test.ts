import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../discord/client.js';
import { getMessage, GetMessageInputSchema } from './get-message.js';
import { DiscordMessage } from '../types/discord.js';

// DiscordClientのモック
vi.mock('../discord/client.js');

describe('getMessage', () => {
  let mockDiscordClient: vi.Mocked<DiscordClient>;

  beforeEach(() => {
    mockDiscordClient = {
      getMessage: vi.fn(),
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
    it('特定のメッセージを取得できる', async () => {
      mockDiscordClient.getMessage.mockResolvedValue(mockMessage);

      const input = {
        channelId: '987654321',
        messageId: '123456789'
      };

      const result = await getMessage(mockDiscordClient, input);

      expect(mockDiscordClient.getMessage).toHaveBeenCalledWith('987654321', '123456789');
      expect(result.message.id).toBe('123456789');
      expect(result.message.content).toBe('Hello, world!');
      expect(result.message.channelId).toBe('987654321');
    });

    it('編集されたメッセージを取得できる', async () => {
      const editedMessage: DiscordMessage = {
        ...mockMessage,
        content: 'Edited message',
        edited_timestamp: '2023-01-01T01:00:00.000Z'
      };
      
      mockDiscordClient.getMessage.mockResolvedValue(editedMessage);

      const input = {
        channelId: '987654321',
        messageId: '123456789'
      };

      const result = await getMessage(mockDiscordClient, input);

      expect(result.message.content).toBe('Edited message');
      expect(result.message.editedTimestamp).toBe('2023-01-01T01:00:00.000Z');
    });

    it('添付ファイル付きメッセージを取得できる', async () => {
      const messageWithAttachment: DiscordMessage = {
        ...mockMessage,
        attachments: [{
          id: 'attachment_123',
          filename: 'image.png',
          size: 1024,
          url: 'https://cdn.discordapp.com/attachments/123/456/image.png',
          proxy_url: 'https://media.discordapp.net/attachments/123/456/image.png',
          height: 200,
          width: 300
        }]
      };
      
      mockDiscordClient.getMessage.mockResolvedValue(messageWithAttachment);

      const input = {
        channelId: '987654321',
        messageId: '123456789'
      };

      const result = await getMessage(mockDiscordClient, input);

      expect(result.message.attachments).toHaveLength(1);
      expect(result.message.attachments[0].filename).toBe('image.png');
      expect(result.message.attachments[0].size).toBe(1024);
    });

    it('リアクション付きメッセージを取得できる', async () => {
      const messageWithReactions: DiscordMessage = {
        ...mockMessage,
        reactions: [{
          count: 5,
          me: true,
          emoji: {
            id: null,
            name: '👍',
            animated: false
          }
        }]
      };
      
      mockDiscordClient.getMessage.mockResolvedValue(messageWithReactions);

      const input = {
        channelId: '987654321',
        messageId: '123456789'
      };

      const result = await getMessage(mockDiscordClient, input);

      expect(result.message.reactions).toHaveLength(1);
      expect(result.message.reactions[0].count).toBe(5);
      expect(result.message.reactions[0].me).toBe(true);
      expect(result.message.reactions[0].emoji.name).toBe('👍');
    });

    it('埋め込み付きメッセージを取得できる', async () => {
      const messageWithEmbeds: DiscordMessage = {
        ...mockMessage,
        embeds: [{
          title: 'Test Embed',
          description: 'This is a test embed',
          color: 0x00ff00,
          fields: [{
            name: 'Field 1',
            value: 'Value 1',
            inline: true
          }]
        }]
      };
      
      mockDiscordClient.getMessage.mockResolvedValue(messageWithEmbeds);

      const input = {
        channelId: '987654321',
        messageId: '123456789'
      };

      const result = await getMessage(mockDiscordClient, input);

      expect(result.message.embedCount).toBe(1);
    });
  });

  describe('異常系', () => {
    it('Discord APIエラーが発生した場合、適切なエラーメッセージを返す', async () => {
      const apiError = new Error('Discord API Error: 404 Not Found');
      mockDiscordClient.getMessage.mockRejectedValue(apiError);

      const input = {
        channelId: '987654321',
        messageId: '123456789'
      };

      await expect(getMessage(mockDiscordClient, input)).rejects.toThrow(
        'メッセージの取得に失敗しました: Discord API Error: 404 Not Found'
      );
    });

    it('不明なエラーが発生した場合、汎用エラーメッセージを返す', async () => {
      mockDiscordClient.getMessage.mockRejectedValue(null);

      const input = {
        channelId: '987654321',
        messageId: '123456789'
      };

      await expect(getMessage(mockDiscordClient, input)).rejects.toThrow(
        'メッセージの取得に失敗しました: メッセージの取得中に不明なエラーが発生しました'
      );
    });
  });

  describe('入力バリデーション', () => {
    it('有効な入力値を正常に検証する', () => {
      const validInput = {
        channelId: '123456789',
        messageId: '987654321'
      };

      const result = GetMessageInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.channelId).toBe('123456789');
        expect(result.data.messageId).toBe('987654321');
      }
    });

    it('channelIdが空文字の場合、バリデーションエラーになる', () => {
      const invalidInput = {
        channelId: '',
        messageId: '987654321'
      };

      const result = GetMessageInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('messageIdが空文字の場合、バリデーションエラーになる', () => {
      const invalidInput = {
        channelId: '123456789',
        messageId: ''
      };

      const result = GetMessageInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('必須パラメータが不足している場合、バリデーションエラーになる', () => {
      const invalidInput = {
        channelId: '123456789'
        // messageId が不足
      };

      const result = GetMessageInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });
  });
});