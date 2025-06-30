import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toolDefinition, executeWebhook } from './execute-webhook';
import { DiscordClient } from '../../discord/client';

// Mock fetch globally
global.fetch = vi.fn();

describe('execute-webhook', () => {
  describe('tool definition', () => {
    it('should export tool definition', () => {
      expect(toolDefinition).toBeDefined();
    });

    it('should have correct name', () => {
      expect(toolDefinition.name).toBe('execute_webhook');
    });

    it('should have correct description', () => {
      expect(toolDefinition.description).toBe('Discord Webhookを実行してメッセージを送信します');
    });

    it('should have correct input schema', () => {
      expect(toolDefinition.inputSchema).toBeDefined();
      expect(toolDefinition.inputSchema.type).toBe('object');
      expect(toolDefinition.inputSchema.properties).toBeDefined();
      expect(toolDefinition.inputSchema.required).toBeDefined();
    });

    it('should require webhookId and webhookToken', () => {
      expect(toolDefinition.inputSchema.required).toContain('webhookId');
      expect(toolDefinition.inputSchema.required).toContain('webhookToken');
    });

    it('should have content property', () => {
      expect(toolDefinition.inputSchema.properties.content).toBeDefined();
      expect(toolDefinition.inputSchema.properties.content.type).toBe('string');
    });
  });

  describe('handler', () => {
    let mockClient: DiscordClient;

    beforeEach(() => {
      mockClient = {} as DiscordClient;
      vi.clearAllMocks();
    });

    it('should export executeWebhook function', () => {
      expect(executeWebhook).toBeDefined();
      expect(typeof executeWebhook).toBe('function');
    });

    it('should validate required parameters', async () => {
      const args = { webhookId: '123', webhookToken: 'abc' };
      await expect(executeWebhook(mockClient, args)).rejects.toThrow('contentパラメータが必要です');
    });

    it('should call Discord webhook API with correct parameters', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: '123456789' })
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const args = {
        webhookId: '1234567890',
        webhookToken: 'abcdefghijklmnop',
        content: 'Test message'
      };

      const result = await executeWebhook(mockClient, args);
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://discord.com/api/v10/webhooks/1234567890/abcdefghijklmnop',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ content: 'Test message' })
        })
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Webhookを実行してメッセージを送信しました');
    });
  });
});