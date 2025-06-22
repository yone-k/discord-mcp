import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';
import { getGuildWebhooks, GetGuildWebhooksInputSchema } from './get-guild-webhooks.js';
import { DiscordWebhook } from '../../types/discord.js';

// DiscordClientのモック
vi.mock('../../discord/client.js');

describe('getGuildWebhooks', () => {
  let mockDiscordClient: vi.Mocked<DiscordClient>;

  beforeEach(() => {
    mockDiscordClient = {
      getGuildWebhooks: vi.fn(),
    } as any;
  });

  const mockWebhooks: DiscordWebhook[] = [
    {
      id: 'webhook123',
      type: 1,
      guild_id: '123456789',
      channel_id: '987654321',
      user: {
        id: '111222333',
        username: 'webhook_creator',
        discriminator: '1234',
        avatar: 'avatar_hash'
      },
      name: 'Test Webhook',
      avatar: 'webhook_avatar',
      token: 'webhook_token_123',
      application_id: null,
      url: 'https://discord.com/api/webhooks/webhook123/webhook_token_123'
    },
    {
      id: 'webhook456',
      type: 2,
      guild_id: '123456789',
      channel_id: '987654322',
      name: 'Bot Webhook',
      avatar: null,
      application_id: 'app123',
      url: 'https://discord.com/api/webhooks/webhook456'
    }
  ];

  describe('正常系', () => {
    it('サーバーのWebhook一覧を取得できる', async () => {
      mockDiscordClient.getGuildWebhooks.mockResolvedValue(mockWebhooks);

      const input = {
        guildId: '123456789'
      };

      const result = await getGuildWebhooks(mockDiscordClient, input);

      expect(mockDiscordClient.getGuildWebhooks).toHaveBeenCalledWith('123456789');
      expect(result.webhooks).toHaveLength(2);
      expect(result.webhooks[0].id).toBe('webhook123');
      expect(result.webhooks[0].name).toBe('Test Webhook');
      expect(result.webhooks[0].type).toBe(1);
      expect(result.webhooks[0].user?.username).toBe('webhook_creator');
      expect(result.totalCount).toBe(2);
    });

    it('空のWebhookリストを取得できる', async () => {
      mockDiscordClient.getGuildWebhooks.mockResolvedValue([]);

      const input = {
        guildId: '123456789'
      };

      const result = await getGuildWebhooks(mockDiscordClient, input);

      expect(result.webhooks).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('アプリケーションWebhookを正しく識別できる', async () => {
      mockDiscordClient.getGuildWebhooks.mockResolvedValue(mockWebhooks);

      const input = {
        guildId: '123456789'
      };

      const result = await getGuildWebhooks(mockDiscordClient, input);

      const appWebhooks = result.webhooks.filter(webhook => webhook.applicationId);
      expect(appWebhooks).toHaveLength(1);
      expect(appWebhooks[0].id).toBe('webhook456');
    });
  });

  describe('異常系', () => {
    it('Discord APIエラーが発生した場合、適切なエラーメッセージを返す', async () => {
      const apiError = new Error('Discord API Error: 403 Forbidden');
      mockDiscordClient.getGuildWebhooks.mockRejectedValue(apiError);

      const input = {
        guildId: '123456789'
      };

      await expect(getGuildWebhooks(mockDiscordClient, input)).rejects.toThrow(
        'サーバーのWebhookの取得に失敗しました: Discord API Error: 403 Forbidden'
      );
    });
  });

  describe('入力バリデーション', () => {
    it('有効な入力値を正常に検証する', () => {
      const validInput = {
        guildId: '123456789'
      };

      const result = GetGuildWebhooksInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.guildId).toBe('123456789');
      }
    });

    it('guildIdが空文字の場合、バリデーションエラーになる', () => {
      const invalidInput = {
        guildId: ''
      };

      const result = GetGuildWebhooksInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});