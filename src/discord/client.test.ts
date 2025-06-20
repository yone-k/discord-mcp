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