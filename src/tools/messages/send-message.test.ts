import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../../discord/client.js';
import { sendMessage, SendMessageInputSchema, SendMessageOutputSchema } from './send-message.js';

describe('sendMessage', () => {
  let mockDiscordClient: DiscordClient;

  beforeEach(() => {
    mockDiscordClient = {
      sendMessage: vi.fn(),
    } as any;
  });

  describe('入力検証', () => {
    it('channelIdが空文字列の場合はエラーが発生する', () => {
      const input = { channelId: '', content: 'test message' };
      const result = SendMessageInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('チャンネルIDは必須です');
      }
    });

    it('contentが空文字列の場合はエラーが発生する', () => {
      const input = { channelId: '123456789', content: '' };
      const result = SendMessageInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('メッセージ内容は必須です');
      }
    });

    it('contentが2000文字を超える場合はエラーが発生する', () => {
      const input = { 
        channelId: '123456789', 
        content: 'a'.repeat(2001) 
      };
      const result = SendMessageInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('メッセージ内容は2000文字以下である必要があります');
      }
    });

    it('有効な入力の場合は検証が通る', () => {
      const input = { 
        channelId: '123456789', 
        content: 'test message' 
      };
      const result = SendMessageInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('ttl（読み上げ）オプションが指定できる', () => {
      const input = { 
        channelId: '123456789', 
        content: 'test message',
        tts: true
      };
      const result = SendMessageInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tts).toBe(true);
      }
    });

    it('embedsが指定できる', () => {
      const input = { 
        channelId: '123456789', 
        content: 'test message',
        embeds: [{
          title: 'Test Embed',
          description: 'Test description',
          color: 0x00ff00
        }]
      };
      const result = SendMessageInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('embedsが10個を超える場合はエラーが発生する', () => {
      const input = { 
        channelId: '123456789', 
        content: 'test message',
        embeds: Array(11).fill({ title: 'Test' })
      };
      const result = SendMessageInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('メッセージ送信', () => {
    it('基本的なメッセージ送信が成功する', async () => {
      const mockMessage = {
        id: '987654321',
        channel_id: '123456789',
        guild_id: '111222333',
        author: {
          id: '555666777',
          username: 'testbot',
          discriminator: '0000',
          bot: true,
          avatar: 'avatar123'
        },
        content: 'test message',
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
        pinned: false,
        webhook_id: null
      };

      mockDiscordClient.sendMessage = vi.fn().mockResolvedValue(mockMessage);

      const input = {
        channelId: '123456789',
        content: 'test message'
      };

      const result = await sendMessage(mockDiscordClient, input);

      expect(mockDiscordClient.sendMessage).toHaveBeenCalledWith('123456789', {
        content: 'test message',
        tts: false,
        embeds: undefined
      });

      expect(result.message.id).toBe('987654321');
      expect(result.message.content).toBe('test message');
      expect(result.message.author.username).toBe('testbot');
      expect(result.success).toBe(true);
    });

    it('TTSありメッセージ送信が成功する', async () => {
      const mockMessage = {
        id: '987654321',
        channel_id: '123456789',
        guild_id: '111222333',
        author: {
          id: '555666777',
          username: 'testbot',
          discriminator: '0000',
          bot: true,
          avatar: 'avatar123'
        },
        content: 'test tts message',
        timestamp: '2023-01-01T00:00:00.000Z',
        edited_timestamp: null,
        tts: true,
        mention_everyone: false,
        mentions: [],
        mention_roles: [],
        attachments: [],
        embeds: [],
        reactions: [],
        type: 0,
        pinned: false,
        webhook_id: null
      };

      mockDiscordClient.sendMessage = vi.fn().mockResolvedValue(mockMessage);

      const input = {
        channelId: '123456789',
        content: 'test tts message',
        tts: true
      };

      const result = await sendMessage(mockDiscordClient, input);

      expect(mockDiscordClient.sendMessage).toHaveBeenCalledWith('123456789', {
        content: 'test tts message',
        tts: true,
        embeds: undefined
      });

      expect(result.message.tts).toBe(true);
      expect(result.success).toBe(true);
    });

    it('Embedありメッセージ送信が成功する', async () => {
      const mockMessage = {
        id: '987654321',
        channel_id: '123456789',
        guild_id: '111222333',
        author: {
          id: '555666777',
          username: 'testbot',
          discriminator: '0000',
          bot: true,
          avatar: 'avatar123'
        },
        content: 'test message with embed',
        timestamp: '2023-01-01T00:00:00.000Z',
        edited_timestamp: null,
        tts: false,
        mention_everyone: false,
        mentions: [],
        mention_roles: [],
        attachments: [],
        embeds: [{
          title: 'Test Embed',
          description: 'Test description',
          color: 0x00ff00
        }],
        reactions: [],
        type: 0,
        pinned: false,
        webhook_id: null
      };

      mockDiscordClient.sendMessage = vi.fn().mockResolvedValue(mockMessage);

      const input = {
        channelId: '123456789',
        content: 'test message with embed',
        embeds: [{
          title: 'Test Embed',
          description: 'Test description',
          color: 0x00ff00
        }]
      };

      const result = await sendMessage(mockDiscordClient, input);

      expect(mockDiscordClient.sendMessage).toHaveBeenCalledWith('123456789', {
        content: 'test message with embed',
        tts: false,
        embeds: [{
          title: 'Test Embed',
          description: 'Test description',
          color: 0x00ff00
        }]
      });

      expect(result.message.embedCount).toBe(1);
      expect(result.success).toBe(true);
    });

    it('Discord APIエラーが適切に処理される', async () => {
      const apiError = new Error('Missing Access');
      mockDiscordClient.sendMessage = vi.fn().mockRejectedValue(apiError);

      const input = {
        channelId: '123456789',
        content: 'test message'
      };

      await expect(sendMessage(mockDiscordClient, input))
        .rejects.toThrow('メッセージの送信に失敗しました: Missing Access');
    });

    it('不明なエラーが適切に処理される', async () => {
      mockDiscordClient.sendMessage = vi.fn().mockRejectedValue('Unknown error');

      const input = {
        channelId: '123456789',
        content: 'test message'
      };

      await expect(sendMessage(mockDiscordClient, input))
        .rejects.toThrow('メッセージの送信に失敗しました: メッセージの送信中に不明なエラーが発生しました');
    });
  });

  describe('出力検証', () => {
    it('正常な出力が検証される', () => {
      const output = {
        message: {
          id: '987654321',
          channelId: '123456789',
          guildId: '111222333',
          author: {
            id: '555666777',
            username: 'testbot',
            discriminator: '0000',
            globalName: null,
            avatarUrl: 'https://cdn.discordapp.com/avatars/555666777/avatar123.png',
            isBot: true
          },
          content: 'test message',
          timestamp: '2023-01-01T00:00:00.000Z',
          editedTimestamp: null,
          tts: false,
          mentionEveryone: false,
          mentions: [],
          mentionRoles: [],
          attachments: [],
          embedCount: 0,
          reactions: [],
          type: 0,
          pinned: false,
          isWebhook: false
        },
        success: true
      };

      const result = SendMessageOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });
  });
});