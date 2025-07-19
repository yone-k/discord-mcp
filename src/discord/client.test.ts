import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios, { AxiosError } from 'axios';
import { DiscordClient } from './client';
import { DiscordGuild, DiscordBotUser } from '../types/discord';

// axios をモック
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('DiscordClient', () => {
  let client: DiscordClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // モックのAxiosインスタンスを作成
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };

    // axios.create をモック
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    client = new DiscordClient('test_bot_token');
  });

  describe('コンストラクタ', () => {
    it('正しい設定でAxiosインスタンスを作成する', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://discord.com/api/v10',
        headers: {
          'Authorization': 'Bot test_bot_token',
          'Content-Type': 'application/json',
          'User-Agent': 'discord-mcp/1.0.0'
        },
        timeout: 10000
      });
    });
  });

  describe('getGuilds', () => {
    it('サーバー一覧を正常に取得できる', async () => {
      // Arrange
      const mockGuilds: DiscordGuild[] = [
        {
          id: '123456789',
          name: 'テストサーバー',
          icon: 'icon_hash',
          description: 'テスト用サーバー',
          features: ['COMMUNITY']
        }
      ];
      mockAxiosInstance.get.mockResolvedValue({ data: mockGuilds });

      // Act
      const result = await client.getGuilds();

      // Assert
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/@me/guilds');
      expect(result).toEqual(mockGuilds);
    });

    it('APIエラーを適切に処理する', async () => {
      // Arrange
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 401,
        data: { message: 'Unauthorized', code: 0 }
      } as any;
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.getGuilds()).rejects.toThrow(
        'Discord API認証エラー: Unauthorized'
      );
    });
  });

  describe('getBotUser', () => {
    it('ボット情報を正常に取得できる', async () => {
      // Arrange
      const mockBotUser: DiscordBotUser = {
        id: '987654321',
        username: 'TestBot',
        discriminator: '0000',
        avatar: 'avatar_hash',
        bot: true
      };
      mockAxiosInstance.get.mockResolvedValue({ data: mockBotUser });

      // Act
      const result = await client.getBotUser();

      // Assert
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/@me');
      expect(result).toEqual(mockBotUser);
    });
  });

  describe('getWebhook', () => {
    it('Webhook情報を正常に取得できる', async () => {
      // Arrange
      const mockWebhook = {
        id: '123456789012345678',
        name: 'Test Webhook',
        avatar: 'webhook_avatar_hash',
        channel_id: '987654321098765432',
        guild_id: '111222333444555666',
        url: 'https://discord.com/api/webhooks/123456789012345678/webhook_token',
        token: 'webhook_token',
        application_id: null,
        user: {
          id: '987654321',
          username: 'TestBot',
          discriminator: '0000',
          avatar: 'avatar_hash',
          bot: true
        }
      };
      mockAxiosInstance.get.mockResolvedValue({ data: mockWebhook });

      // Act
      const result = await client.getWebhook('123456789012345678');

      // Assert
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/webhooks/123456789012345678');
      expect(result).toEqual(mockWebhook);
    });

    it('webhookIdが空文字列の場合エラーをスローする', async () => {
      // Act & Assert
      await expect(client.getWebhook('')).rejects.toThrow('webhookIdは必須です');
    });

    it('webhookIdがundefinedの場合エラーをスローする', async () => {
      // Act & Assert
      await expect(client.getWebhook(undefined as any)).rejects.toThrow('webhookIdは必須です');
    });

    it('存在しないWebhookの場合404エラーを適切に処理する', async () => {
      // Arrange
      const axiosError = new AxiosError('Not Found');
      axiosError.response = {
        status: 404,
        data: { message: 'Unknown Webhook', code: 10015 }
      } as any;
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.getWebhook('999999999999999999')).rejects.toThrow(
        'Discord APIエラー (404): Unknown Webhook'
      );
    });

    it('権限不足でWebhookにアクセスできない場合403エラーを適切に処理する', async () => {
      // Arrange
      const axiosError = new AxiosError('Forbidden');
      axiosError.response = {
        status: 403,
        data: { message: 'Missing Access', code: 50001 }
      } as any;
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.getWebhook('123456789012345678')).rejects.toThrow(
        'Discord API権限エラー: Missing Access'
      );
    });

    it('無効なトークンの場合401エラーを適切に処理する', async () => {
      // Arrange
      const axiosError = new AxiosError('Unauthorized');
      axiosError.response = {
        status: 401,
        data: { message: 'Invalid token', code: 50014 }
      } as any;
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.getWebhook('123456789012345678')).rejects.toThrow(
        'Discord API認証エラー: Invalid token'
      );
    });

    it('レート制限に達した場合429エラーを適切に処理する', async () => {
      // Arrange
      const axiosError = new AxiosError('Too Many Requests');
      axiosError.response = {
        status: 429,
        data: { message: 'Rate limited', code: 0 }
      } as any;
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.getWebhook('123456789012345678')).rejects.toThrow(
        'Discord APIレート制限: Rate limited'
      );
    });

    it('サーバーエラーが発生した場合500エラーを適切に処理する', async () => {
      // Arrange
      const axiosError = new AxiosError('Internal Server Error');
      axiosError.response = {
        status: 500,
        data: { message: 'Internal server error', code: 0 }
      } as any;
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.getWebhook('123456789012345678')).rejects.toThrow(
        'Discord APIサーバーエラー: Internal server error'
      );
    });
  });

  describe('createWebhook', () => {
    it('Webhookを正常に作成できる', async () => {
      // Arrange
      const channelId = '987654321098765432';
      const webhookData = {
        name: 'Test Webhook',
        avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      };
      const mockWebhook = {
        id: '123456789012345678',
        type: 1,
        guild_id: '111222333444555666',
        channel_id: channelId,
        user: {
          id: '987654321',
          username: 'TestBot',
          discriminator: '0000',
          avatar: 'avatar_hash',
          bot: true
        },
        name: 'Test Webhook',
        avatar: 'webhook_avatar_hash',
        token: 'webhook_token_12345',
        application_id: null
      };
      mockAxiosInstance.post.mockResolvedValue({ data: mockWebhook });

      // Act
      const result = await client.createWebhook(channelId, webhookData);

      // Assert
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        `/channels/${channelId}/webhooks`,
        webhookData
      );
      expect(result).toEqual(mockWebhook);
    });

    it('channelIdが空文字列の場合エラーをスローする', async () => {
      // Arrange
      const webhookData = { name: 'Test Webhook' };

      // Act & Assert
      await expect(client.createWebhook('', webhookData)).rejects.toThrow(
        'channelIdは必須です'
      );
    });

    it('channelIdがundefinedの場合エラーをスローする', async () => {
      // Arrange
      const webhookData = { name: 'Test Webhook' };

      // Act & Assert
      await expect(client.createWebhook(undefined as any, webhookData)).rejects.toThrow(
        'channelIdは必須です'
      );
    });

    it('webhookDataがnullの場合エラーをスローする', async () => {
      // Arrange
      const channelId = '987654321098765432';

      // Act & Assert
      await expect(client.createWebhook(channelId, null as any)).rejects.toThrow(
        'webhookDataは必須です'
      );
    });

    it('webhookDataがundefinedの場合エラーをスローする', async () => {
      // Arrange
      const channelId = '987654321098765432';

      // Act & Assert
      await expect(client.createWebhook(channelId, undefined as any)).rejects.toThrow(
        'webhookDataは必須です'
      );
    });

    it('webhook名が空文字列の場合エラーをスローする', async () => {
      // Arrange
      const channelId = '987654321098765432';
      const webhookData = { name: '' };

      // Act & Assert
      await expect(client.createWebhook(channelId, webhookData)).rejects.toThrow(
        'webhook名は必須です'
      );
    });

    it('webhook名がundefinedの場合エラーをスローする', async () => {
      // Arrange
      const channelId = '987654321098765432';
      const webhookData = { name: undefined as any };

      // Act & Assert
      await expect(client.createWebhook(channelId, webhookData)).rejects.toThrow(
        'webhook名は必須です'
      );
    });

    it('webhook名が80文字を超える場合エラーをスローする', async () => {
      // Arrange
      const channelId = '987654321098765432';
      const longName = 'a'.repeat(81); // 81文字
      const webhookData = { name: longName };

      // Act & Assert
      await expect(client.createWebhook(channelId, webhookData)).rejects.toThrow(
        'webhook名は80文字以内である必要があります'
      );
    });

    it('無効なchannelIdの場合404エラーを適切に処理する', async () => {
      // Arrange
      const channelId = '999999999999999999';
      const webhookData = { name: 'Test Webhook' };
      const axiosError = new AxiosError('Not Found');
      axiosError.response = {
        status: 404,
        data: { message: 'Unknown Channel', code: 10003 }
      } as any;
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.createWebhook(channelId, webhookData)).rejects.toThrow(
        'Discord APIエラー (404): Unknown Channel'
      );
    });

    it('権限不足でWebhook作成できない場合403エラーを適切に処理する', async () => {
      // Arrange
      const channelId = '987654321098765432';
      const webhookData = { name: 'Test Webhook' };
      const axiosError = new AxiosError('Forbidden');
      axiosError.response = {
        status: 403,
        data: { message: 'Missing Permissions', code: 50013 }
      } as any;
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.createWebhook(channelId, webhookData)).rejects.toThrow(
        'Discord API権限エラー: Missing Permissions'
      );
    });

    it('無効なトークンの場合401エラーを適切に処理する', async () => {
      // Arrange
      const channelId = '987654321098765432';
      const webhookData = { name: 'Test Webhook' };
      const axiosError = new AxiosError('Unauthorized');
      axiosError.response = {
        status: 401,
        data: { message: 'Invalid token', code: 50014 }
      } as any;
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.createWebhook(channelId, webhookData)).rejects.toThrow(
        'Discord API認証エラー: Invalid token'
      );
    });

    it('レート制限に達した場合429エラーを適切に処理する', async () => {
      // Arrange
      const channelId = '987654321098765432';
      const webhookData = { name: 'Test Webhook' };
      const axiosError = new AxiosError('Too Many Requests');
      axiosError.response = {
        status: 429,
        data: { message: 'Rate limited', code: 0 }
      } as any;
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.createWebhook(channelId, webhookData)).rejects.toThrow(
        'Discord APIレート制限: Rate limited'
      );
    });

    it('サーバーエラーが発生した場合500エラーを適切に処理する', async () => {
      // Arrange
      const channelId = '987654321098765432';
      const webhookData = { name: 'Test Webhook' };
      const axiosError = new AxiosError('Internal Server Error');
      axiosError.response = {
        status: 500,
        data: { message: 'Internal server error', code: 0 }
      } as any;
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.createWebhook(channelId, webhookData)).rejects.toThrow(
        'Discord APIサーバーエラー: Internal server error'
      );
    });

    it('最小限のパラメータでWebhookを作成できる', async () => {
      // Arrange
      const channelId = '987654321098765432';
      const webhookData = { name: 'Test Webhook' };
      const mockWebhook = {
        id: '123456789012345678',
        type: 1,
        guild_id: '111222333444555666',
        channel_id: channelId,
        name: 'Test Webhook',
        avatar: null,
        token: 'webhook_token_12345',
        application_id: null
      };
      mockAxiosInstance.post.mockResolvedValue({ data: mockWebhook });

      // Act
      const result = await client.createWebhook(channelId, webhookData);

      // Assert
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        `/channels/${channelId}/webhooks`,
        webhookData
      );
      expect(result).toEqual(mockWebhook);
    });

    it('アバター付きでWebhookを作成できる', async () => {
      // Arrange
      const channelId = '987654321098765432';
      const webhookData = {
        name: 'Test Webhook',
        avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      };
      const mockWebhook = {
        id: '123456789012345678',
        type: 1,
        guild_id: '111222333444555666',
        channel_id: channelId,
        name: 'Test Webhook',
        avatar: 'webhook_avatar_hash',
        token: 'webhook_token_12345',
        application_id: null
      };
      mockAxiosInstance.post.mockResolvedValue({ data: mockWebhook });

      // Act
      const result = await client.createWebhook(channelId, webhookData);

      // Assert
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        `/channels/${channelId}/webhooks`,
        webhookData
      );
      expect(result).toEqual(mockWebhook);
    });
  });

  describe('deleteWebhook', () => {
    it('Webhookを正常に削除できる', async () => {
      // Arrange
      const webhookId = '123456789012345678';
      mockAxiosInstance.delete.mockResolvedValue({ status: 204, data: undefined });

      // Act
      await client.deleteWebhook(webhookId);

      // Assert
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/webhooks/${webhookId}`);
    });

    it('webhookIdが空文字列の場合エラーをスローする', async () => {
      // Act & Assert
      await expect(client.deleteWebhook('')).rejects.toThrow('webhookIdは必須です');
    });

    it('webhookIdがundefinedの場合エラーをスローする', async () => {
      // Act & Assert
      await expect(client.deleteWebhook(undefined as any)).rejects.toThrow('webhookIdは必須です');
    });

    it('存在しないWebhookの場合404エラーを適切に処理する', async () => {
      // Arrange
      const webhookId = '999999999999999999';
      const axiosError = new AxiosError('Not Found');
      axiosError.response = {
        status: 404,
        data: { message: 'Unknown Webhook', code: 10015 }
      } as any;
      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.deleteWebhook(webhookId)).rejects.toThrow(
        'Discord APIエラー (404): Unknown Webhook'
      );
    });

    it('権限不足でWebhook削除できない場合403エラーを適切に処理する', async () => {
      // Arrange
      const webhookId = '123456789012345678';
      const axiosError = new AxiosError('Forbidden');
      axiosError.response = {
        status: 403,
        data: { message: 'Missing Permissions', code: 50013 }
      } as any;
      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.deleteWebhook(webhookId)).rejects.toThrow(
        'Discord API権限エラー: Missing Permissions'
      );
    });

    it('無効なトークンの場合401エラーを適切に処理する', async () => {
      // Arrange
      const webhookId = '123456789012345678';
      const axiosError = new AxiosError('Unauthorized');
      axiosError.response = {
        status: 401,
        data: { message: 'Invalid token', code: 50014 }
      } as any;
      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.deleteWebhook(webhookId)).rejects.toThrow(
        'Discord API認証エラー: Invalid token'
      );
    });

    it('レート制限に達した場合429エラーを適切に処理する', async () => {
      // Arrange
      const webhookId = '123456789012345678';
      const axiosError = new AxiosError('Too Many Requests');
      axiosError.response = {
        status: 429,
        data: { message: 'Rate limited', code: 0 }
      } as any;
      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.deleteWebhook(webhookId)).rejects.toThrow(
        'Discord APIレート制限: Rate limited'
      );
    });

    it('サーバーエラーが発生した場合500エラーを適切に処理する', async () => {
      // Arrange
      const webhookId = '123456789012345678';
      const axiosError = new AxiosError('Internal Server Error');
      axiosError.response = {
        status: 500,
        data: { message: 'Internal server error', code: 0 }
      } as any;
      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.deleteWebhook(webhookId)).rejects.toThrow(
        'Discord APIサーバーエラー: Internal server error'
      );
    });

    it('理由付きでWebhookを削除できる', async () => {
      // Arrange
      const webhookId = '123456789012345678';
      const reason = 'Webhook cleanup';
      mockAxiosInstance.delete.mockResolvedValue({ status: 204, data: undefined });

      // Act
      await client.deleteWebhook(webhookId, reason);

      // Assert
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
        `/webhooks/${webhookId}`,
        { headers: { 'X-Audit-Log-Reason': encodeURIComponent(reason) } }
      );
    });
  });

  describe('updateWebhook', () => {
    it('Webhook名を正常に更新できる', async () => {
      // Arrange
      const webhookId = '123456789012345678';
      const updateData = { name: 'Updated Webhook Name' };
      const mockUpdatedWebhook = {
        id: webhookId,
        type: 1,
        guild_id: '111222333444555666',
        channel_id: '987654321098765432',
        user: {
          id: '987654321',
          username: 'TestBot',
          discriminator: '0000',
          avatar: 'avatar_hash',
          bot: true
        },
        name: 'Updated Webhook Name',
        avatar: 'webhook_avatar_hash',
        token: 'webhook_token_12345',
        application_id: null
      };
      mockAxiosInstance.patch.mockResolvedValue({ data: mockUpdatedWebhook });

      // Act
      const result = await client.updateWebhook(webhookId, updateData);

      // Assert
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        `/webhooks/${webhookId}`,
        updateData
      );
      expect(result).toEqual(mockUpdatedWebhook);
    });

    it('Webhookアバターを正常に更新できる', async () => {
      // Arrange
      const webhookId = '123456789012345678';
      const updateData = { 
        avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' 
      };
      const mockUpdatedWebhook = {
        id: webhookId,
        type: 1,
        guild_id: '111222333444555666',
        channel_id: '987654321098765432',
        name: 'Test Webhook',
        avatar: 'new_webhook_avatar_hash',
        token: 'webhook_token_12345',
        application_id: null
      };
      mockAxiosInstance.patch.mockResolvedValue({ data: mockUpdatedWebhook });

      // Act
      const result = await client.updateWebhook(webhookId, updateData);

      // Assert
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        `/webhooks/${webhookId}`,
        updateData
      );
      expect(result).toEqual(mockUpdatedWebhook);
    });

    it('Webhook名とアバターを同時に更新できる', async () => {
      // Arrange
      const webhookId = '123456789012345678';
      const updateData = { 
        name: 'Updated Name',
        avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' 
      };
      const mockUpdatedWebhook = {
        id: webhookId,
        type: 1,
        guild_id: '111222333444555666',
        channel_id: '987654321098765432',
        name: 'Updated Name',
        avatar: 'new_webhook_avatar_hash',
        token: 'webhook_token_12345',
        application_id: null
      };
      mockAxiosInstance.patch.mockResolvedValue({ data: mockUpdatedWebhook });

      // Act
      const result = await client.updateWebhook(webhookId, updateData);

      // Assert
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        `/webhooks/${webhookId}`,
        updateData
      );
      expect(result).toEqual(mockUpdatedWebhook);
    });

    it('webhookIdが空文字列の場合エラーをスローする', async () => {
      // Arrange
      const updateData = { name: 'Updated Name' };

      // Act & Assert
      await expect(client.updateWebhook('', updateData)).rejects.toThrow(
        'webhookIdは必須です'
      );
    });

    it('webhookIdがundefinedの場合エラーをスローする', async () => {
      // Arrange
      const updateData = { name: 'Updated Name' };

      // Act & Assert
      await expect(client.updateWebhook(undefined as any, updateData)).rejects.toThrow(
        'webhookIdは必須です'
      );
    });

    it('updateDataがnullの場合エラーをスローする', async () => {
      // Arrange
      const webhookId = '123456789012345678';

      // Act & Assert
      await expect(client.updateWebhook(webhookId, null as any)).rejects.toThrow(
        'updateDataは必須です'
      );
    });

    it('updateDataがundefinedの場合エラーをスローする', async () => {
      // Arrange
      const webhookId = '123456789012345678';

      // Act & Assert
      await expect(client.updateWebhook(webhookId, undefined as any)).rejects.toThrow(
        'updateDataは必須です'
      );
    });

    it('updateDataが空オブジェクトの場合エラーをスローする', async () => {
      // Arrange
      const webhookId = '123456789012345678';
      const updateData = {};

      // Act & Assert
      await expect(client.updateWebhook(webhookId, updateData)).rejects.toThrow(
        'name または avatar のいずれかは必須です'
      );
    });

    it('webhook名が空文字列の場合エラーをスローする', async () => {
      // Arrange
      const webhookId = '123456789012345678';
      const updateData = { name: '' };

      // Act & Assert
      await expect(client.updateWebhook(webhookId, updateData)).rejects.toThrow(
        'webhook名は空文字列にできません'
      );
    });

    it('webhook名が80文字を超える場合エラーをスローする', async () => {
      // Arrange
      const webhookId = '123456789012345678';
      const longName = 'a'.repeat(81); // 81文字
      const updateData = { name: longName };

      // Act & Assert
      await expect(client.updateWebhook(webhookId, updateData)).rejects.toThrow(
        'webhook名は80文字以内である必要があります'
      );
    });

    it('存在しないWebhookの場合404エラーを適切に処理する', async () => {
      // Arrange
      const webhookId = '999999999999999999';
      const updateData = { name: 'Updated Name' };
      const axiosError = new AxiosError('Not Found');
      axiosError.response = {
        status: 404,
        data: { message: 'Unknown Webhook', code: 10015 }
      } as any;
      mockAxiosInstance.patch.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.updateWebhook(webhookId, updateData)).rejects.toThrow(
        'Discord APIエラー (404): Unknown Webhook'
      );
    });

    it('権限不足でWebhook更新できない場合403エラーを適切に処理する', async () => {
      // Arrange
      const webhookId = '123456789012345678';
      const updateData = { name: 'Updated Name' };
      const axiosError = new AxiosError('Forbidden');
      axiosError.response = {
        status: 403,
        data: { message: 'Missing Permissions', code: 50013 }
      } as any;
      mockAxiosInstance.patch.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.updateWebhook(webhookId, updateData)).rejects.toThrow(
        'Discord API権限エラー: Missing Permissions'
      );
    });

    it('無効なトークンの場合401エラーを適切に処理する', async () => {
      // Arrange
      const webhookId = '123456789012345678';
      const updateData = { name: 'Updated Name' };
      const axiosError = new AxiosError('Unauthorized');
      axiosError.response = {
        status: 401,
        data: { message: 'Invalid token', code: 50014 }
      } as any;
      mockAxiosInstance.patch.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.updateWebhook(webhookId, updateData)).rejects.toThrow(
        'Discord API認証エラー: Invalid token'
      );
    });

    it('レート制限に達した場合429エラーを適切に処理する', async () => {
      // Arrange
      const webhookId = '123456789012345678';
      const updateData = { name: 'Updated Name' };
      const axiosError = new AxiosError('Too Many Requests');
      axiosError.response = {
        status: 429,
        data: { message: 'Rate limited', code: 0 }
      } as any;
      mockAxiosInstance.patch.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.updateWebhook(webhookId, updateData)).rejects.toThrow(
        'Discord APIレート制限: Rate limited'
      );
    });

    it('サーバーエラーが発生した場合500エラーを適切に処理する', async () => {
      // Arrange
      const webhookId = '123456789012345678';
      const updateData = { name: 'Updated Name' };
      const axiosError = new AxiosError('Internal Server Error');
      axiosError.response = {
        status: 500,
        data: { message: 'Internal server error', code: 0 }
      } as any;
      mockAxiosInstance.patch.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.updateWebhook(webhookId, updateData)).rejects.toThrow(
        'Discord APIサーバーエラー: Internal server error'
      );
    });

    it('アバターをnullに設定してリセットできる', async () => {
      // Arrange
      const webhookId = '123456789012345678';
      const updateData = { avatar: null };
      const mockUpdatedWebhook = {
        id: webhookId,
        type: 1,
        guild_id: '111222333444555666',
        channel_id: '987654321098765432',
        name: 'Test Webhook',
        avatar: null,
        token: 'webhook_token_12345',
        application_id: null
      };
      mockAxiosInstance.patch.mockResolvedValue({ data: mockUpdatedWebhook });

      // Act
      const result = await client.updateWebhook(webhookId, updateData);

      // Assert
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        `/webhooks/${webhookId}`,
        updateData
      );
      expect(result).toEqual(mockUpdatedWebhook);
    });
  });

  describe('エラーハンドリング', () => {
    it('401エラーを適切に処理する', async () => {
      // Arrange
      const axiosError = new AxiosError('Unauthorized');
      axiosError.response = {
        status: 401,
        data: { message: 'Invalid token', code: 50014 }
      } as any;
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.getGuilds()).rejects.toThrow(
        'Discord API認証エラー: Invalid token'
      );
    });

    it('403エラーを適切に処理する', async () => {
      // Arrange
      const axiosError = new AxiosError('Forbidden');
      axiosError.response = {
        status: 403,
        data: { message: 'Missing Access', code: 50001 }
      } as any;
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.getGuilds()).rejects.toThrow(
        'Discord API権限エラー: Missing Access'
      );
    });

    it('429エラー（レート制限）を適切に処理する', async () => {
      // Arrange
      const axiosError = new AxiosError('Too Many Requests');
      axiosError.response = {
        status: 429,
        data: { message: 'Rate limited', code: 0 }
      } as any;
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.getGuilds()).rejects.toThrow(
        'Discord APIレート制限: Rate limited'
      );
    });

    it('500エラー（サーバーエラー）を適切に処理する', async () => {
      // Arrange
      const axiosError = new AxiosError('Internal Server Error');
      axiosError.response = {
        status: 500,
        data: { message: 'Internal error', code: 0 }
      } as any;
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.getGuilds()).rejects.toThrow(
        'Discord APIサーバーエラー: Internal error'
      );
    });

    it('ネットワークエラーを適切に処理する', async () => {
      // Arrange
      const axiosError = new AxiosError('Network Error');
      axiosError.request = {}; // レスポンスがない場合
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.getGuilds()).rejects.toThrow(
        'Discord APIへの接続に失敗しました。ネットワーク接続を確認してください。'
      );
    });

    it('リクエスト設定エラーを適切に処理する', async () => {
      // Arrange
      const axiosError = new AxiosError('Request setup error');
      axiosError.message = 'Request setup error';
      // request も response も undefined の場合
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.getGuilds()).rejects.toThrow(
        'リクエスト設定エラー: Request setup error'
      );
    });

    it('不明なステータスコードを適切に処理する', async () => {
      // Arrange
      const axiosError = new AxiosError('Unknown Error');
      axiosError.response = {
        status: 418, // I'm a teapot
        data: { message: 'Teapot error', code: 0 }
      } as any;
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.getGuilds()).rejects.toThrow(
        'Discord APIエラー (418): Teapot error'
      );
    });

    it('メッセージがないエラーレスポンスを適切に処理する', async () => {
      // Arrange
      const axiosError = new AxiosError('Error without message');
      axiosError.response = {
        status: 401,
        data: {} // message フィールドがない
      } as any;
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      // Act & Assert
      await expect(client.getGuilds()).rejects.toThrow(
        'Discord API認証エラー: トークンが無効です'
      );
    });
  });
});