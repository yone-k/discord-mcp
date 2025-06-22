import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../../discord/client.js';
import { editMessage, EditMessageInputSchema, EditMessageOutputSchema } from './edit-message.js';

describe('editMessage', () => {
  let mockDiscordClient: DiscordClient;

  beforeEach(() => {
    mockDiscordClient = {
      editMessage: vi.fn(),
    } as any;
  });

  describe('入力検証', () => {
    it('channelIdが空文字列の場合はエラーが発生する', () => {
      const input = { 
        channelId: '', 
        messageId: '123456789',
        content: 'edited message' 
      };
      const result = EditMessageInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('チャンネルIDは必須です');
      }
    });

    it('messageIdが空文字列の場合はエラーが発生する', () => {
      const input = { 
        channelId: '123456789', 
        messageId: '',
        content: 'edited message' 
      };
      const result = EditMessageInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('メッセージIDは必須です');
      }
    });

    it('contentが空文字列の場合はエラーが発生する', () => {
      const input = { 
        channelId: '123456789', 
        messageId: '987654321',
        content: '' 
      };
      const result = EditMessageInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('メッセージ内容は必須です');
      }
    });

    it('contentが2000文字を超える場合はエラーが発生する', () => {
      const input = { 
        channelId: '123456789', 
        messageId: '987654321',
        content: 'a'.repeat(2001) 
      };
      const result = EditMessageInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('メッセージ内容は2000文字以下である必要があります');
      }
    });

    it('有効な入力の場合は検証が通る', () => {
      const input = { 
        channelId: '123456789', 
        messageId: '987654321',
        content: 'edited message' 
      };
      const result = EditMessageInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('embedsが指定できる', () => {
      const input = { 
        channelId: '123456789', 
        messageId: '987654321',
        content: 'edited message',
        embeds: [{
          title: 'Edited Embed',
          description: 'Edited description',
          color: 0x00ff00
        }]
      };
      const result = EditMessageInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('embedsが10個を超える場合はエラーが発生する', () => {
      const input = { 
        channelId: '123456789', 
        messageId: '987654321',
        content: 'edited message',
        embeds: Array(11).fill({ title: 'Test' })
      };
      const result = EditMessageInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('メッセージ編集', () => {
    it('基本的なメッセージ編集が成功する', async () => {
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
        content: 'edited message',
        timestamp: '2023-01-01T00:00:00.000Z',
        edited_timestamp: '2023-01-01T00:05:00.000Z',
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

      mockDiscordClient.editMessage = vi.fn().mockResolvedValue(mockMessage);

      const input = {
        channelId: '123456789',
        messageId: '987654321',
        content: 'edited message'
      };

      const result = await editMessage(mockDiscordClient, input);

      expect(mockDiscordClient.editMessage).toHaveBeenCalledWith('123456789', '987654321', {
        content: 'edited message',
        embeds: undefined
      });

      expect(result.message.id).toBe('987654321');
      expect(result.message.content).toBe('edited message');
      expect(result.message.editedTimestamp).toBe('2023-01-01T00:05:00.000Z');
      expect(result.success).toBe(true);
    });

    it('Embedありメッセージ編集が成功する', async () => {
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
        content: 'edited message with embed',
        timestamp: '2023-01-01T00:00:00.000Z',
        edited_timestamp: '2023-01-01T00:05:00.000Z',
        tts: false,
        mention_everyone: false,
        mentions: [],
        mention_roles: [],
        attachments: [],
        embeds: [{
          title: 'Edited Embed',
          description: 'Edited description',
          color: 0x00ff00
        }],
        reactions: [],
        type: 0,
        pinned: false,
        webhook_id: null
      };

      mockDiscordClient.editMessage = vi.fn().mockResolvedValue(mockMessage);

      const input = {
        channelId: '123456789',
        messageId: '987654321',
        content: 'edited message with embed',
        embeds: [{
          title: 'Edited Embed',
          description: 'Edited description',
          color: 0x00ff00
        }]
      };

      const result = await editMessage(mockDiscordClient, input);

      expect(mockDiscordClient.editMessage).toHaveBeenCalledWith('123456789', '987654321', {
        content: 'edited message with embed',
        embeds: [{
          title: 'Edited Embed',
          description: 'Edited description',
          color: 0x00ff00
        }]
      });

      expect(result.message.embedCount).toBe(1);
      expect(result.success).toBe(true);
    });

    it('権限エラーが適切に処理される', async () => {
      const apiError = new Error('Missing Permissions');
      mockDiscordClient.editMessage = vi.fn().mockRejectedValue(apiError);

      const input = {
        channelId: '123456789',
        messageId: '987654321',
        content: 'edited message'
      };

      await expect(editMessage(mockDiscordClient, input))
        .rejects.toThrow('メッセージの編集に失敗しました: Missing Permissions');
    });

    it('メッセージが見つからない場合のエラーが適切に処理される', async () => {
      const apiError = new Error('Unknown Message');
      mockDiscordClient.editMessage = vi.fn().mockRejectedValue(apiError);

      const input = {
        channelId: '123456789',
        messageId: '987654321',
        content: 'edited message'
      };

      await expect(editMessage(mockDiscordClient, input))
        .rejects.toThrow('メッセージの編集に失敗しました: Unknown Message');
    });

    it('不明なエラーが適切に処理される', async () => {
      mockDiscordClient.editMessage = vi.fn().mockRejectedValue('Unknown error');

      const input = {
        channelId: '123456789',
        messageId: '987654321',
        content: 'edited message'
      };

      await expect(editMessage(mockDiscordClient, input))
        .rejects.toThrow('メッセージの編集に失敗しました: メッセージの編集中に不明なエラーが発生しました');
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
          content: 'edited message',
          timestamp: '2023-01-01T00:00:00.000Z',
          editedTimestamp: '2023-01-01T00:05:00.000Z',
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

      const result = EditMessageOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });
  });
});