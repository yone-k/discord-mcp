import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../../discord/client.js';
import { deleteMessage, DeleteMessageInputSchema, DeleteMessageOutputSchema } from './delete-message.js';

describe('deleteMessage', () => {
  let mockDiscordClient: DiscordClient;

  beforeEach(() => {
    mockDiscordClient = {
      deleteMessage: vi.fn(),
    } as any;
  });

  describe('入力検証', () => {
    it('channelIdが空文字列の場合はエラーが発生する', () => {
      const input = { 
        channelId: '', 
        messageId: '123456789'
      };
      const result = DeleteMessageInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('チャンネルIDは必須です');
      }
    });

    it('messageIdが空文字列の場合はエラーが発生する', () => {
      const input = { 
        channelId: '123456789', 
        messageId: ''
      };
      const result = DeleteMessageInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('メッセージIDは必須です');
      }
    });

    it('有効な入力の場合は検証が通る', () => {
      const input = { 
        channelId: '123456789', 
        messageId: '987654321'
      };
      const result = DeleteMessageInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('reasonが指定できる', () => {
      const input = { 
        channelId: '123456789', 
        messageId: '987654321',
        reason: '不適切な内容のため'
      };
      const result = DeleteMessageInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reason).toBe('不適切な内容のため');
      }
    });

    it('reasonが512文字を超える場合はエラーが発生する', () => {
      const input = { 
        channelId: '123456789', 
        messageId: '987654321',
        reason: 'a'.repeat(513)
      };
      const result = DeleteMessageInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('削除理由は512文字以下である必要があります');
      }
    });
  });

  describe('メッセージ削除', () => {
    it('基本的なメッセージ削除が成功する', async () => {
      mockDiscordClient.deleteMessage = vi.fn().mockResolvedValue(undefined);

      const input = {
        channelId: '123456789',
        messageId: '987654321'
      };

      const result = await deleteMessage(mockDiscordClient, input);

      expect(mockDiscordClient.deleteMessage).toHaveBeenCalledWith('123456789', '987654321', undefined);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('987654321');
      expect(result.channelId).toBe('123456789');
      expect(result.deletedAt).toBeDefined();
    });

    it('理由付きメッセージ削除が成功する', async () => {
      mockDiscordClient.deleteMessage = vi.fn().mockResolvedValue(undefined);

      const input = {
        channelId: '123456789',
        messageId: '987654321',
        reason: '不適切な内容のため'
      };

      const result = await deleteMessage(mockDiscordClient, input);

      expect(mockDiscordClient.deleteMessage).toHaveBeenCalledWith('123456789', '987654321', '不適切な内容のため');

      expect(result.success).toBe(true);
      expect(result.reason).toBe('不適切な内容のため');
    });

    it('権限エラーが適切に処理される', async () => {
      const apiError = new Error('Missing Permissions');
      mockDiscordClient.deleteMessage = vi.fn().mockRejectedValue(apiError);

      const input = {
        channelId: '123456789',
        messageId: '987654321'
      };

      await expect(deleteMessage(mockDiscordClient, input))
        .rejects.toThrow('メッセージの削除に失敗しました: Missing Permissions');
    });

    it('メッセージが見つからない場合のエラーが適切に処理される', async () => {
      const apiError = new Error('Unknown Message');
      mockDiscordClient.deleteMessage = vi.fn().mockRejectedValue(apiError);

      const input = {
        channelId: '123456789',
        messageId: '987654321'
      };

      await expect(deleteMessage(mockDiscordClient, input))
        .rejects.toThrow('メッセージの削除に失敗しました: Unknown Message');
    });

    it('既に削除されたメッセージの場合のエラーが適切に処理される', async () => {
      const apiError = new Error('Message already deleted');
      mockDiscordClient.deleteMessage = vi.fn().mockRejectedValue(apiError);

      const input = {
        channelId: '123456789',
        messageId: '987654321'
      };

      await expect(deleteMessage(mockDiscordClient, input))
        .rejects.toThrow('メッセージの削除に失敗しました: Message already deleted');
    });

    it('不明なエラーが適切に処理される', async () => {
      mockDiscordClient.deleteMessage = vi.fn().mockRejectedValue('Unknown error');

      const input = {
        channelId: '123456789',
        messageId: '987654321'
      };

      await expect(deleteMessage(mockDiscordClient, input))
        .rejects.toThrow('メッセージの削除に失敗しました: メッセージの削除中に不明なエラーが発生しました');
    });
  });

  describe('出力検証', () => {
    it('正常な出力が検証される', () => {
      const output = {
        success: true,
        messageId: '987654321',
        channelId: '123456789',
        deletedAt: '2023-01-01T00:00:00.000Z',
        reason: '不適切な内容のため'
      };

      const result = DeleteMessageOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });

    it('理由なしの出力も検証される', () => {
      const output = {
        success: true,
        messageId: '987654321',
        channelId: '123456789',
        deletedAt: '2023-01-01T00:00:00.000Z'
      };

      const result = DeleteMessageOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });
  });
});