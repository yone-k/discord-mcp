import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';
import { getWebhook, GetWebhookInputSchema } from './get-webhook.js';
import { DiscordWebhook } from '../../types/discord.js';

// DiscordClientのモック
vi.mock('../../discord/client.js');

describe('getWebhook', () => {
  let mockDiscordClient: vi.Mocked<DiscordClient>;

  beforeEach(() => {
    mockDiscordClient = {
      getWebhook: vi.fn(),
    } as any;
  });

  const mockWebhook: DiscordWebhook = {
    id: 'webhook123',
    type: 1,
    guild_id: '111222333444555666',
    channel_id: '987654321098765432',
    user: {
      id: '987654321',
      username: 'webhook_creator',
      discriminator: '1234',
      avatar: 'creator_avatar_hash',
      bot: true
    },
    name: 'Test Webhook',
    avatar: 'webhook_avatar_hash',
    token: 'webhook_token_123',
    application_id: null,
    url: 'https://discord.com/api/webhooks/webhook123/webhook_token_123'
  };

  describe('正常系', () => {
    it('Webhookの詳細情報を取得できる', async () => {
      mockDiscordClient.getWebhook.mockResolvedValue(mockWebhook);

      const input = {
        webhookId: 'webhook123'
      };

      const result = await getWebhook(mockDiscordClient, input);

      expect(mockDiscordClient.getWebhook).toHaveBeenCalledWith('webhook123');
      expect(result.webhook.id).toBe('webhook123');
      expect(result.webhook.name).toBe('Test Webhook');
      expect(result.webhook.type).toBe(1);
      expect(result.webhook.guildId).toBe('111222333444555666');
      expect(result.webhook.channelId).toBe('987654321098765432');
      expect(result.webhook.user?.username).toBe('webhook_creator');
      expect(result.webhook.user?.avatarUrl).toBe('https://cdn.discordapp.com/avatars/987654321/creator_avatar_hash.png');
      expect(result.webhook.url).toBe('https://discord.com/api/webhooks/webhook123/webhook_token_123');
    });

    it('アバターがnullのユーザーの場合、avatarUrlもnullになる', async () => {
      const webhookWithNullAvatar: DiscordWebhook = {
        ...mockWebhook,
        user: {
          ...mockWebhook.user!,
          avatar: null
        }
      };
      mockDiscordClient.getWebhook.mockResolvedValue(webhookWithNullAvatar);

      const input = {
        webhookId: 'webhook123'
      };

      const result = await getWebhook(mockDiscordClient, input);

      expect(result.webhook.user?.avatarUrl).toBeNull();
    });

    it('ユーザー情報がないWebhookの場合、userフィールドがundefinedになる', async () => {
      const webhookWithoutUser: DiscordWebhook = {
        ...mockWebhook,
        user: undefined
      };
      mockDiscordClient.getWebhook.mockResolvedValue(webhookWithoutUser);

      const input = {
        webhookId: 'webhook123'
      };

      const result = await getWebhook(mockDiscordClient, input);

      expect(result.webhook.user).toBeUndefined();
    });
  });

  describe('異常系', () => {
    it('Discord APIエラーが発生した場合、適切なエラーメッセージを返す', async () => {
      const apiError = new Error('Discord API Error: 404 Not Found');
      mockDiscordClient.getWebhook.mockRejectedValue(apiError);

      const input = {
        webhookId: 'nonexistent123'
      };

      await expect(getWebhook(mockDiscordClient, input)).rejects.toThrow(
        'Webhookの取得に失敗しました: Discord API Error: 404 Not Found'
      );
    });

    it('不明なエラーが発生した場合、適切なエラーメッセージを返す', async () => {
      const unknownError = 'Unknown error';
      mockDiscordClient.getWebhook.mockRejectedValue(unknownError);

      const input = {
        webhookId: 'webhook123'
      };

      await expect(getWebhook(mockDiscordClient, input)).rejects.toThrow(
        'Webhookの取得に失敗しました: Webhookの取得中に不明なエラーが発生しました'
      );
    });
  });

  describe('入力バリデーション', () => {
    it('有効な入力値を正常に検証する', () => {
      const validInput = {
        webhookId: 'webhook123'
      };

      const result = GetWebhookInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.webhookId).toBe('webhook123');
      }
    });

    it('webhookIdが空文字の場合、バリデーションエラーになる', () => {
      const invalidInput = {
        webhookId: ''
      };

      const result = GetWebhookInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('webhookIdが未定義の場合、バリデーションエラーになる', () => {
      const invalidInput = {};

      const result = GetWebhookInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('余分なプロパティがある場合、バリデーションエラーになる', () => {
      const invalidInput = {
        webhookId: 'webhook123',
        extraProperty: 'not allowed'
      };

      const result = GetWebhookInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});