import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';
import { deleteWebhook, DeleteWebhookInputSchema } from './delete-webhook.js';

// DiscordClientのモック
vi.mock('../../discord/client.js');

describe('deleteWebhook', () => {
  let mockDiscordClient: vi.Mocked<DiscordClient>;

  beforeEach(() => {
    mockDiscordClient = {
      deleteWebhook: vi.fn(),
    } as any;
  });

  describe('正常系', () => {
    it('Webhookを正常に削除できる', async () => {
      mockDiscordClient.deleteWebhook.mockResolvedValue(undefined);

      const input = {
        webhookId: 'webhook123'
      };

      const result = await deleteWebhook(mockDiscordClient, input);

      expect(mockDiscordClient.deleteWebhook).toHaveBeenCalledWith('webhook123', undefined);
      expect(result.success).toBe(true);
      expect(result.webhookId).toBe('webhook123');
      expect(result.deletedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result.reason).toBeUndefined();
    });

    it('理由付きでWebhookを削除できる', async () => {
      mockDiscordClient.deleteWebhook.mockResolvedValue(undefined);

      const input = {
        webhookId: 'webhook123',
        reason: 'Webhook cleanup for security'
      };

      const result = await deleteWebhook(mockDiscordClient, input);

      expect(mockDiscordClient.deleteWebhook).toHaveBeenCalledWith('webhook123', 'Webhook cleanup for security');
      expect(result.success).toBe(true);
      expect(result.webhookId).toBe('webhook123');
      expect(result.deletedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result.reason).toBe('Webhook cleanup for security');
    });

    it('空文字列の理由でWebhookを削除できる', async () => {
      mockDiscordClient.deleteWebhook.mockResolvedValue(undefined);

      const input = {
        webhookId: 'webhook123',
        reason: ''
      };

      const result = await deleteWebhook(mockDiscordClient, input);

      expect(mockDiscordClient.deleteWebhook).toHaveBeenCalledWith('webhook123', '');
      expect(result.success).toBe(true);
      expect(result.reason).toBe('');
    });
  });

  describe('異常系', () => {
    it('Discord APIエラーが発生した場合、適切なエラーメッセージを返す', async () => {
      const apiError = new Error('Discord API Error: 404 Not Found');
      mockDiscordClient.deleteWebhook.mockRejectedValue(apiError);

      const input = {
        webhookId: 'nonexistent123'
      };

      await expect(deleteWebhook(mockDiscordClient, input)).rejects.toThrow(
        'Webhookの削除に失敗しました: Discord API Error: 404 Not Found'
      );
    });

    it('権限不足エラーが発生した場合、適切なエラーメッセージを返す', async () => {
      const permissionError = new Error('Discord API権限エラー: Missing Permissions');
      mockDiscordClient.deleteWebhook.mockRejectedValue(permissionError);

      const input = {
        webhookId: 'webhook123'
      };

      await expect(deleteWebhook(mockDiscordClient, input)).rejects.toThrow(
        'Webhookの削除に失敗しました: Discord API権限エラー: Missing Permissions'
      );
    });

    it('不明なエラーが発生した場合、適切なエラーメッセージを返す', async () => {
      const unknownError = 'Unknown error';
      mockDiscordClient.deleteWebhook.mockRejectedValue(unknownError);

      const input = {
        webhookId: 'webhook123'
      };

      await expect(deleteWebhook(mockDiscordClient, input)).rejects.toThrow(
        'Webhookの削除に失敗しました: Webhookの削除中に不明なエラーが発生しました'
      );
    });
  });

  describe('入力バリデーション', () => {
    it('有効な入力値を正常に検証する', () => {
      const validInput = {
        webhookId: 'webhook123'
      };

      const result = DeleteWebhookInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.webhookId).toBe('webhook123');
      }
    });

    it('理由付きの有効な入力値を正常に検証する', () => {
      const validInput = {
        webhookId: 'webhook123',
        reason: 'Security cleanup'
      };

      const result = DeleteWebhookInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.webhookId).toBe('webhook123');
        expect(result.data.reason).toBe('Security cleanup');
      }
    });

    it('webhookIdが空文字の場合、バリデーションエラーになる', () => {
      const invalidInput = {
        webhookId: ''
      };

      const result = DeleteWebhookInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('webhookIdが未定義の場合、バリデーションエラーになる', () => {
      const invalidInput = {};

      const result = DeleteWebhookInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('reasonが512文字を超える場合、バリデーションエラーになる', () => {
      const longReason = 'a'.repeat(513); // 513文字
      const invalidInput = {
        webhookId: 'webhook123',
        reason: longReason
      };

      const result = DeleteWebhookInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('余分なプロパティがある場合、バリデーションエラーになる', () => {
      const invalidInput = {
        webhookId: 'webhook123',
        extraProperty: 'not allowed'
      };

      const result = DeleteWebhookInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});