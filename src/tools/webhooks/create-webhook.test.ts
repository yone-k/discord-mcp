import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toolDefinition, createWebhook } from './create-webhook';
import { DiscordClient } from '../../discord/client';

describe('create-webhook', () => {
  describe('tool definition', () => {
    it('should export tool definition', () => {
      expect(toolDefinition).toBeDefined();
    });

    it('should have correct name', () => {
      expect(toolDefinition.name).toBe('create_webhook');
    });

    it('should have correct description', () => {
      expect(toolDefinition.description).toBe('Discordチャンネルに新しいWebhookを作成します');
    });

    it('should have correct input schema', () => {
      expect(toolDefinition.inputSchema).toBeDefined();
      expect(toolDefinition.inputSchema.type).toBe('object');
      expect(toolDefinition.inputSchema.properties).toBeDefined();
      expect(toolDefinition.inputSchema.required).toBeDefined();
    });

    it('should require channelId and name', () => {
      expect(toolDefinition.inputSchema.required).toContain('channelId');
      expect(toolDefinition.inputSchema.required).toContain('name');
    });

    it('should have channelId property', () => {
      expect(toolDefinition.inputSchema.properties.channelId).toBeDefined();
      expect(toolDefinition.inputSchema.properties.channelId.type).toBe('string');
    });

    it('should have name property', () => {
      expect(toolDefinition.inputSchema.properties.name).toBeDefined();
      expect(toolDefinition.inputSchema.properties.name.type).toBe('string');
    });

    it('should have avatar property as optional', () => {
      expect(toolDefinition.inputSchema.properties.avatar).toBeDefined();
      expect(toolDefinition.inputSchema.properties.avatar.type).toBe('string');
      expect(toolDefinition.inputSchema.required).not.toContain('avatar');
    });
  });

  describe('handler', () => {
    let mockClient: DiscordClient;
    let mockCreateWebhook: any;

    beforeEach(() => {
      mockCreateWebhook = vi.fn();
      mockClient = {
        createWebhook: mockCreateWebhook
      } as unknown as DiscordClient;
      vi.clearAllMocks();
    });

    it('should export createWebhook function', () => {
      expect(createWebhook).toBeDefined();
      expect(typeof createWebhook).toBe('function');
    });

    it('should validate required channelId parameter', async () => {
      const args = { name: 'Test Webhook' };
      await expect(createWebhook(mockClient, args)).rejects.toThrow();
    });

    it('should validate required name parameter', async () => {
      const args = { channelId: '123456789012345678' };
      await expect(createWebhook(mockClient, args)).rejects.toThrow();
    });

    it('should validate name length limit (80 characters)', async () => {
      const args = {
        channelId: '123456789012345678',
        name: 'a'.repeat(81) // 81文字
      };
      await expect(createWebhook(mockClient, args)).rejects.toThrow();
    });

    it('should call DiscordClient.createWebhook with correct parameters', async () => {
      const mockWebhook = {
        id: '123456789012345678',
        name: 'Test Webhook',
        avatar: null,
        channel_id: '987654321098765432',
        guild_id: '111222333444555666',
        token: 'webhook_token_12345',
        url: 'https://discord.com/api/webhooks/123456789012345678/webhook_token_12345'
      };
      mockCreateWebhook.mockResolvedValue(mockWebhook);

      const args = {
        channelId: '987654321098765432',
        name: 'Test Webhook'
      };

      const result = await createWebhook(mockClient, args);

      expect(mockCreateWebhook).toHaveBeenCalledWith('987654321098765432', {
        name: 'Test Webhook'
      });
      expect(result).toEqual({
        success: true,
        webhook: mockWebhook,
        message: 'Webhookを正常に作成しました'
      });
    });

    it('should call DiscordClient.createWebhook with avatar parameter', async () => {
      const mockWebhook = {
        id: '123456789012345678',
        name: 'Test Webhook',
        avatar: 'webhook_avatar_hash',
        channel_id: '987654321098765432',
        guild_id: '111222333444555666',
        token: 'webhook_token_12345',
        url: 'https://discord.com/api/webhooks/123456789012345678/webhook_token_12345'
      };
      mockCreateWebhook.mockResolvedValue(mockWebhook);

      const args = {
        channelId: '987654321098765432',
        name: 'Test Webhook',
        avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      };

      const result = await createWebhook(mockClient, args);

      expect(mockCreateWebhook).toHaveBeenCalledWith('987654321098765432', {
        name: 'Test Webhook',
        avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      });
      expect(result).toEqual({
        success: true,
        webhook: mockWebhook,
        message: 'Webhookを正常に作成しました'
      });
    });

    it('should handle Discord API errors appropriately', async () => {
      const error = new Error('Discord API権限エラー: Missing Permissions');
      mockCreateWebhook.mockRejectedValue(error);

      const args = {
        channelId: '987654321098765432',
        name: 'Test Webhook'
      };

      await expect(createWebhook(mockClient, args)).rejects.toThrow('Discord API権限エラー: Missing Permissions');
    });

    it('should handle validation errors from DiscordClient', async () => {
      const error = new Error('channelIdは必須です');
      mockCreateWebhook.mockRejectedValue(error);

      const args = {
        channelId: '',
        name: 'Test Webhook'
      };

      await expect(createWebhook(mockClient, args)).rejects.toThrow('channelIdは必須です');
    });
  });
});