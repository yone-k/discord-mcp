import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';
import { getChannelWebhooks, GetChannelWebhooksInputSchema } from './get-channel-webhooks.js';
import { DiscordWebhook } from '../../types/discord.js';

// DiscordClientのモック
vi.mock('../../discord/client.js');

describe('getChannelWebhooks', () => {
  let mockDiscordClient: vi.Mocked<DiscordClient>;

  beforeEach(() => {
    mockDiscordClient = {
      getChannelWebhooks: vi.fn(),
    } as any;
  });

  const mockWebhooks: DiscordWebhook[] = [
    {
      id: 'channel_webhook123',
      type: 1,
      channel_id: '987654321',
      user: {
        id: '111222333',
        username: 'channel_webhook_creator',
        discriminator: '5678',
        avatar: 'avatar_hash'
      },
      name: 'Channel Test Webhook',
      avatar: 'webhook_avatar',
      token: 'webhook_token_456',
      application_id: null,
      url: 'https://discord.com/api/webhooks/channel_webhook123/webhook_token_456'
    }
  ];

  describe('正常系', () => {
    it('チャンネルのWebhook一覧を取得できる', async () => {
      mockDiscordClient.getChannelWebhooks.mockResolvedValue(mockWebhooks);

      const input = {
        channelId: '987654321'
      };

      const result = await getChannelWebhooks(mockDiscordClient, input);

      expect(mockDiscordClient.getChannelWebhooks).toHaveBeenCalledWith('987654321');
      expect(result.webhooks).toHaveLength(1);
      expect(result.webhooks[0].id).toBe('channel_webhook123');
      expect(result.webhooks[0].name).toBe('Channel Test Webhook');
      expect(result.webhooks[0].user?.username).toBe('channel_webhook_creator');
      expect(result.totalCount).toBe(1);
    });

    it('空のWebhookリストを取得できる', async () => {
      mockDiscordClient.getChannelWebhooks.mockResolvedValue([]);

      const input = {
        channelId: '987654321'
      };

      const result = await getChannelWebhooks(mockDiscordClient, input);

      expect(result.webhooks).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('異常系', () => {
    it('Discord APIエラーが発生した場合、適切なエラーメッセージを返す', async () => {
      const apiError = new Error('Discord API Error: 403 Forbidden');
      mockDiscordClient.getChannelWebhooks.mockRejectedValue(apiError);

      const input = {
        channelId: '987654321'
      };

      await expect(getChannelWebhooks(mockDiscordClient, input)).rejects.toThrow(
        'チャンネルのWebhookの取得に失敗しました: Discord API Error: 403 Forbidden'
      );
    });
  });

  describe('入力バリデーション', () => {
    it('有効な入力値を正常に検証する', () => {
      const validInput = {
        channelId: '987654321'
      };

      const result = GetChannelWebhooksInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.channelId).toBe('987654321');
      }
    });

    it('channelIdが空文字の場合、バリデーションエラーになる', () => {
      const invalidInput = {
        channelId: ''
      };

      const result = GetChannelWebhooksInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});