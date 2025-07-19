import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toolDefinition, updateWebhook } from './update-webhook';
import { DiscordClient } from '../../discord/client';

describe('update-webhook', () => {
  describe('tool definition', () => {
    it('should export tool definition', () => {
      expect(toolDefinition).toBeDefined();
    });

    it('should have correct name', () => {
      expect(toolDefinition.name).toBe('update_webhook');
    });

    it('should have correct description', () => {
      expect(toolDefinition.description).toBe('既存のDiscord Webhookを更新します');
    });

    it('should have correct input schema', () => {
      expect(toolDefinition.inputSchema).toBeDefined();
      expect(toolDefinition.inputSchema.type).toBe('object');
      expect(toolDefinition.inputSchema.properties).toBeDefined();
      expect(toolDefinition.inputSchema.required).toBeDefined();
    });

    it('should require webhookId', () => {
      expect(toolDefinition.inputSchema.required).toContain('webhookId');
    });

    it('should have webhookId property', () => {
      expect(toolDefinition.inputSchema.properties.webhookId).toBeDefined();
      expect(toolDefinition.inputSchema.properties.webhookId.type).toBe('string');
    });

    it('should have name property as optional', () => {
      expect(toolDefinition.inputSchema.properties.name).toBeDefined();
      expect(toolDefinition.inputSchema.properties.name.type).toBe('string');
      expect(toolDefinition.inputSchema.required).not.toContain('name');
    });

    it('should have avatar property as optional', () => {
      expect(toolDefinition.inputSchema.properties.avatar).toBeDefined();
      expect(toolDefinition.inputSchema.required).not.toContain('avatar');
    });
  });

  describe('handler', () => {
    let mockClient: DiscordClient;
    let mockUpdateWebhook: any;

    beforeEach(() => {
      mockUpdateWebhook = vi.fn();
      mockClient = {
        updateWebhook: mockUpdateWebhook
      } as unknown as DiscordClient;
      vi.clearAllMocks();
    });

    it('should export updateWebhook function', () => {
      expect(updateWebhook).toBeDefined();
      expect(typeof updateWebhook).toBe('function');
    });

    it('should validate required webhookId parameter', async () => {
      const args = { name: 'Updated Webhook' };
      await expect(updateWebhook(mockClient, args)).rejects.toThrow();
    });

    it('should validate that at least name or avatar is provided', async () => {
      const args = { webhookId: '123456789012345678' };
      await expect(updateWebhook(mockClient, args)).rejects.toThrow();
    });

    it('should validate name length limit (80 characters)', async () => {
      const args = {
        webhookId: '123456789012345678',
        name: 'a'.repeat(81) // 81文字
      };
      await expect(updateWebhook(mockClient, args)).rejects.toThrow();
    });

    it('should call DiscordClient.updateWebhook with name parameter', async () => {
      const mockWebhook = {
        id: '123456789012345678',
        name: 'Updated Webhook',
        avatar: 'webhook_avatar_hash',
        channel_id: '987654321098765432',
        guild_id: '111222333444555666',
        token: 'webhook_token_12345',
        url: 'https://discord.com/api/webhooks/123456789012345678/webhook_token_12345'
      };
      mockUpdateWebhook.mockResolvedValue(mockWebhook);

      const args = {
        webhookId: '123456789012345678',
        name: 'Updated Webhook'
      };

      const result = await updateWebhook(mockClient, args);

      expect(mockUpdateWebhook).toHaveBeenCalledWith('123456789012345678', {
        name: 'Updated Webhook'
      });
      expect(result).toEqual({
        success: true,
        webhook: mockWebhook,
        message: 'Webhookを正常に更新しました'
      });
    });

    it('should call DiscordClient.updateWebhook with avatar parameter', async () => {
      const mockWebhook = {
        id: '123456789012345678',
        name: 'Test Webhook',
        avatar: 'new_webhook_avatar_hash',
        channel_id: '987654321098765432',
        guild_id: '111222333444555666',
        token: 'webhook_token_12345',
        url: 'https://discord.com/api/webhooks/123456789012345678/webhook_token_12345'
      };
      mockUpdateWebhook.mockResolvedValue(mockWebhook);

      const args = {
        webhookId: '123456789012345678',
        avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      };

      const result = await updateWebhook(mockClient, args);

      expect(mockUpdateWebhook).toHaveBeenCalledWith('123456789012345678', {
        avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      });
      expect(result).toEqual({
        success: true,
        webhook: mockWebhook,
        message: 'Webhookを正常に更新しました'
      });
    });

    it('should call DiscordClient.updateWebhook with both name and avatar parameters', async () => {
      const mockWebhook = {
        id: '123456789012345678',
        name: 'Updated Webhook',
        avatar: 'new_webhook_avatar_hash',
        channel_id: '987654321098765432',
        guild_id: '111222333444555666',
        token: 'webhook_token_12345',
        url: 'https://discord.com/api/webhooks/123456789012345678/webhook_token_12345'
      };
      mockUpdateWebhook.mockResolvedValue(mockWebhook);

      const args = {
        webhookId: '123456789012345678',
        name: 'Updated Webhook',
        avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      };

      const result = await updateWebhook(mockClient, args);

      expect(mockUpdateWebhook).toHaveBeenCalledWith('123456789012345678', {
        name: 'Updated Webhook',
        avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      });
      expect(result).toEqual({
        success: true,
        webhook: mockWebhook,
        message: 'Webhookを正常に更新しました'
      });
    });

    it('should call DiscordClient.updateWebhook with avatar as null to reset', async () => {
      const mockWebhook = {
        id: '123456789012345678',
        name: 'Test Webhook',
        avatar: null,
        channel_id: '987654321098765432',
        guild_id: '111222333444555666',
        token: 'webhook_token_12345',
        url: 'https://discord.com/api/webhooks/123456789012345678/webhook_token_12345'
      };
      mockUpdateWebhook.mockResolvedValue(mockWebhook);

      const args = {
        webhookId: '123456789012345678',
        avatar: null
      };

      const result = await updateWebhook(mockClient, args);

      expect(mockUpdateWebhook).toHaveBeenCalledWith('123456789012345678', {
        avatar: null
      });
      expect(result).toEqual({
        success: true,
        webhook: mockWebhook,
        message: 'Webhookを正常に更新しました'
      });
    });

    it('should handle Discord API errors appropriately', async () => {
      const error = new Error('Discord APIエラー (404): Unknown Webhook');
      mockUpdateWebhook.mockRejectedValue(error);

      const args = {
        webhookId: '999999999999999999',
        name: 'Updated Webhook'
      };

      await expect(updateWebhook(mockClient, args)).rejects.toThrow('Discord APIエラー (404): Unknown Webhook');
    });

    it('should handle validation errors from DiscordClient', async () => {
      const error = new Error('webhookIdは必須です');
      mockUpdateWebhook.mockRejectedValue(error);

      const args = {
        webhookId: '',
        name: 'Updated Webhook'
      };

      await expect(updateWebhook(mockClient, args)).rejects.toThrow('webhookIdは必須です');
    });

    it('should handle empty name validation', async () => {
      const args = {
        webhookId: '123456789012345678',
        name: ''
      };

      await expect(updateWebhook(mockClient, args)).rejects.toThrow();
    });
  });
});