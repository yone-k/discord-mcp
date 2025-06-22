import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../../discord/client.js';
import { sendFile, SendFileInputSchema, SendFileOutputSchema } from './send-file.js';

describe('sendFile', () => {
  let mockDiscordClient: DiscordClient;

  beforeEach(() => {
    mockDiscordClient = {
      sendMessageWithFile: vi.fn(),
    } as any;
  });

  describe('入力検証', () => {
    it('channelIdが空文字列の場合はエラーが発生する', () => {
      const input = { 
        channelId: '', 
        file: {
          name: 'test.txt',
          content: 'dGVzdA==', // base64 encoded "test"
          contentType: 'text/plain'
        }
      };
      const result = SendFileInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('チャンネルIDは必須です');
      }
    });

    it('ファイル名が空文字列の場合はエラーが発生する', () => {
      const input = { 
        channelId: '123456789', 
        file: {
          name: '',
          content: 'dGVzdA==',
          contentType: 'text/plain'
        }
      };
      const result = SendFileInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('ファイル名は必須です');
      }
    });

    it('ファイル名が256文字を超える場合はエラーが発生する', () => {
      const input = { 
        channelId: '123456789', 
        file: {
          name: 'a'.repeat(257) + '.txt',
          content: 'dGVzdA==',
          contentType: 'text/plain'
        }
      };
      const result = SendFileInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('ファイル名は256文字以下である必要があります');
      }
    });

    it('ファイル内容（base64）が空文字列の場合はエラーが発生する', () => {
      const input = { 
        channelId: '123456789', 
        file: {
          name: 'test.txt',
          content: '',
          contentType: 'text/plain'
        }
      };
      const result = SendFileInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('ファイル内容（base64）は必須です');
      }
    });

    it('無効なbase64文字列の場合はエラーが発生する', () => {
      const input = { 
        channelId: '123456789', 
        file: {
          name: 'test.txt',
          content: 'invalid-base64!!!',
          contentType: 'text/plain'
        }
      };
      const result = SendFileInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('有効なbase64エンコードされた文字列が必要です');
      }
    });

    it('有効な入力の場合は検証が通る', () => {
      const input = { 
        channelId: '123456789',
        file: {
          name: 'test.txt',
          content: 'dGVzdA==',
          contentType: 'text/plain'
        }
      };
      const result = SendFileInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('メッセージ内容も同時に指定できる', () => {
      const input = { 
        channelId: '123456789',
        content: 'ファイルを送信します',
        file: {
          name: 'test.txt',
          content: 'dGVzdA==',
          contentType: 'text/plain'
        }
      };
      const result = SendFileInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe('ファイルを送信します');
      }
    });

    it('contentTypeがオプショナルである', () => {
      const input = { 
        channelId: '123456789',
        file: {
          name: 'test.txt',
          content: 'dGVzdA=='
        }
      };
      const result = SendFileInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('spoilerフラグが指定できる', () => {
      const input = { 
        channelId: '123456789',
        file: {
          name: 'secret.txt',
          content: 'dGVzdA==',
          contentType: 'text/plain'
        },
        spoiler: true
      };
      const result = SendFileInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.spoiler).toBe(true);
      }
    });
  });

  describe('ファイル送信', () => {
    it('基本的なファイル送信が成功する', async () => {
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
        content: '',
        timestamp: '2023-01-01T00:00:00.000Z',
        edited_timestamp: null,
        tts: false,
        mention_everyone: false,
        mentions: [],
        mention_roles: [],
        attachments: [{
          id: '888999000',
          filename: 'test.txt',
          size: 4,
          url: 'https://cdn.discordapp.com/attachments/123456789/888999000/test.txt',
          content_type: 'text/plain',
          height: null,
          width: null
        }],
        embeds: [],
        reactions: [],
        type: 0,
        pinned: false,
        webhook_id: null
      };

      mockDiscordClient.sendMessageWithFile = vi.fn().mockResolvedValue(mockMessage);

      const input = {
        channelId: '123456789',
        file: {
          name: 'test.txt',
          content: 'dGVzdA==', // base64 encoded "test"
          contentType: 'text/plain'
        }
      };

      const result = await sendFile(mockDiscordClient, input);

      expect(mockDiscordClient.sendMessageWithFile).toHaveBeenCalledWith('123456789', {
        content: undefined,
        file: {
          name: 'test.txt',
          data: Buffer.from('test'),
          contentType: 'text/plain'
        },
        spoiler: false
      });

      expect(result.message.id).toBe('987654321');
      expect(result.message.attachments).toHaveLength(1);
      expect(result.message.attachments[0].filename).toBe('test.txt');
      expect(result.success).toBe(true);
    });

    it('メッセージ付きファイル送信が成功する', async () => {
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
        content: 'ファイルを送信しました',
        timestamp: '2023-01-01T00:00:00.000Z',
        edited_timestamp: null,
        tts: false,
        mention_everyone: false,
        mentions: [],
        mention_roles: [],
        attachments: [{
          id: '888999000',
          filename: 'test.txt',
          size: 4,
          url: 'https://cdn.discordapp.com/attachments/123456789/888999000/test.txt',
          content_type: 'text/plain',
          height: null,
          width: null
        }],
        embeds: [],
        reactions: [],
        type: 0,
        pinned: false,
        webhook_id: null
      };

      mockDiscordClient.sendMessageWithFile = vi.fn().mockResolvedValue(mockMessage);

      const input = {
        channelId: '123456789',
        content: 'ファイルを送信しました',
        file: {
          name: 'test.txt',
          content: 'dGVzdA==',
          contentType: 'text/plain'
        }
      };

      const result = await sendFile(mockDiscordClient, input);

      expect(mockDiscordClient.sendMessageWithFile).toHaveBeenCalledWith('123456789', {
        content: 'ファイルを送信しました',
        file: {
          name: 'test.txt',
          data: Buffer.from('test'),
          contentType: 'text/plain'
        },
        spoiler: false
      });

      expect(result.message.content).toBe('ファイルを送信しました');
      expect(result.success).toBe(true);
    });

    it('spoilerファイル送信が成功する', async () => {
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
        content: '',
        timestamp: '2023-01-01T00:00:00.000Z',
        edited_timestamp: null,
        tts: false,
        mention_everyone: false,
        mentions: [],
        mention_roles: [],
        attachments: [{
          id: '888999000',
          filename: 'SPOILER_secret.txt',
          size: 4,
          url: 'https://cdn.discordapp.com/attachments/123456789/888999000/SPOILER_secret.txt',
          content_type: 'text/plain',
          height: null,
          width: null
        }],
        embeds: [],
        reactions: [],
        type: 0,
        pinned: false,
        webhook_id: null
      };

      mockDiscordClient.sendMessageWithFile = vi.fn().mockResolvedValue(mockMessage);

      const input = {
        channelId: '123456789',
        file: {
          name: 'secret.txt',
          content: 'dGVzdA==',
          contentType: 'text/plain'
        },
        spoiler: true
      };

      const result = await sendFile(mockDiscordClient, input);

      expect(mockDiscordClient.sendMessageWithFile).toHaveBeenCalledWith('123456789', {
        content: undefined,
        file: {
          name: 'secret.txt',
          data: Buffer.from('test'),
          contentType: 'text/plain'
        },
        spoiler: true
      });

      expect(result.message.attachments[0].filename).toBe('SPOILER_secret.txt');
      expect(result.success).toBe(true);
    });

    it('Discord APIエラーが適切に処理される', async () => {
      const apiError = new Error('File too large');
      mockDiscordClient.sendMessageWithFile = vi.fn().mockRejectedValue(apiError);

      const input = {
        channelId: '123456789',
        file: {
          name: 'test.txt',
          content: 'dGVzdA==',
          contentType: 'text/plain'
        }
      };

      await expect(sendFile(mockDiscordClient, input))
        .rejects.toThrow('ファイルの送信に失敗しました: File too large');
    });

    it('不明なエラーが適切に処理される', async () => {
      mockDiscordClient.sendMessageWithFile = vi.fn().mockRejectedValue('Unknown error');

      const input = {
        channelId: '123456789',
        file: {
          name: 'test.txt',
          content: 'dGVzdA==',
          contentType: 'text/plain'
        }
      };

      await expect(sendFile(mockDiscordClient, input))
        .rejects.toThrow('ファイルの送信に失敗しました: ファイルの送信中に不明なエラーが発生しました');
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
          content: '',
          timestamp: '2023-01-01T00:00:00.000Z',
          editedTimestamp: null,
          tts: false,
          mentionEveryone: false,
          mentions: [],
          mentionRoles: [],
          attachments: [{
            id: '888999000',
            filename: 'test.txt',
            size: 4,
            url: 'https://cdn.discordapp.com/attachments/123456789/888999000/test.txt',
            contentType: 'text/plain',
            height: null,
            width: null
          }],
          embedCount: 0,
          reactions: [],
          type: 0,
          pinned: false,
          isWebhook: false
        },
        success: true
      };

      const result = SendFileOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });
  });
});