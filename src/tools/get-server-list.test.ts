import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getServerList, GetServerListInputSchema } from './get-server-list';
import { DiscordClient } from '../discord/client';
import { ToolDefinition } from '../types/mcp.js';import { DiscordGuild } from '../types/discord';

// Discord Client をモック
vi.mock('../discord/client');

describe('getServerList', () => {
  let mockClient: DiscordClient;
  let mockGuilds: DiscordGuild[];

  beforeEach(() => {
    // モッククライアントを作成
    mockClient = {
      getGuilds: vi.fn()
    } as any;

    // テスト用のギルドデータ
    mockGuilds = [
      {
        id: '123456789',
        name: 'テストサーバー1',
        icon: 'icon_hash_1',
        description: 'テスト用のサーバーです',
        approximate_member_count: 150,
        approximate_presence_count: 50,
        features: ['COMMUNITY', 'NEWS']
      },
      {
        id: '987654321',
        name: 'テストサーバー2',
        icon: null,
        description: null,
        approximate_member_count: 25,
        approximate_presence_count: 10,
        features: []
      }
    ];
  });

  describe('基本機能', () => {
    it('サーバー一覧を正常に取得できる', async () => {
      // Arrange
      vi.mocked(mockClient.getGuilds).mockResolvedValue(mockGuilds);
      const input = { includeDetails: false };

      // Act
      const result = await getServerList(mockClient, input);

      // Assert
      expect(result).toEqual({
        servers: [
          {
            id: '123456789',
            name: 'テストサーバー1',
            iconUrl: 'https://cdn.discordapp.com/icons/123456789/icon_hash_1.png'
          },
          {
            id: '987654321',
            name: 'テストサーバー2',
            iconUrl: null
          }
        ],
        totalCount: 2
      });
      expect(mockClient.getGuilds).toHaveBeenCalledOnce();
    });

    it('空のサーバー一覧を正常に処理できる', async () => {
      // Arrange
      vi.mocked(mockClient.getGuilds).mockResolvedValue([]);
      const input = { includeDetails: false };

      // Act
      const result = await getServerList(mockClient, input);

      // Assert
      expect(result).toEqual({
        servers: [],
        totalCount: 0
      });
    });
  });

  describe('詳細情報の取得', () => {
    it('詳細情報を含むサーバー一覧を取得できる', async () => {
      // Arrange
      vi.mocked(mockClient.getGuilds).mockResolvedValue(mockGuilds);
      const input = { includeDetails: true };

      // Act
      const result = await getServerList(mockClient, input);

      // Assert
      expect(result).toEqual({
        servers: [
          {
            id: '123456789',
            name: 'テストサーバー1',
            iconUrl: 'https://cdn.discordapp.com/icons/123456789/icon_hash_1.png',
            memberCount: 150,
            onlineCount: 50,
            features: ['COMMUNITY', 'NEWS']
          },
          {
            id: '987654321',
            name: 'テストサーバー2',
            iconUrl: null,
            memberCount: 25,
            onlineCount: 10,
            features: []
          }
        ],
        totalCount: 2
      });
    });

    it('部分的な詳細情報でも正常に処理できる', async () => {
      // Arrange
      const partialGuilds: DiscordGuild[] = [
        {
          id: '111111111',
          name: 'パーシャルサーバー',
          icon: null,
          description: null,
          features: ['INVITE_SPLASH']
          // approximate_member_count と approximate_presence_count が未定義
        }
      ];
      vi.mocked(mockClient.getGuilds).mockResolvedValue(partialGuilds);
      const input = { includeDetails: true };

      // Act
      const result = await getServerList(mockClient, input);

      // Assert
      expect(result.servers[0]).toEqual({
        id: '111111111',
        name: 'パーシャルサーバー',
        iconUrl: null,
        features: ['INVITE_SPLASH']
        // memberCount と onlineCount は含まれない
      });
    });
  });

  describe('入力バリデーション', () => {
    it('有効な入力を正常に検証する', () => {
      // Valid inputs
      expect(() => GetServerListInputSchema.parse({})).not.toThrow();
      expect(() => GetServerListInputSchema.parse({ includeDetails: true })).not.toThrow();
      expect(() => GetServerListInputSchema.parse({ includeDetails: false })).not.toThrow();
    });

    it('無効な入力を拒否する', () => {
      // Invalid inputs
      expect(() => GetServerListInputSchema.parse({ includeDetails: 'true' })).toThrow();
      expect(() => GetServerListInputSchema.parse({ includeDetails: 1 })).toThrow();
      expect(() => GetServerListInputSchema.parse({ invalidField: true })).toThrow();
    });

    it('デフォルト値が正しく設定される', () => {
      const result = GetServerListInputSchema.parse({});
      expect(result.includeDetails).toBe(false);
    });
  });

  describe('エラーハンドリング', () => {
    it('Discord APIエラーを適切に処理する', async () => {
      // Arrange
      const apiError = new Error('Discord API認証エラー: トークンが無効です');
      vi.mocked(mockClient.getGuilds).mockRejectedValue(apiError);
      const input = { includeDetails: false };

      // Act & Assert
      await expect(getServerList(mockClient, input)).rejects.toThrow(
        'サーバー一覧の取得に失敗しました: Discord API認証エラー: トークンが無効です'
      );
    });

    it('予期しないエラーを適切に処理する', async () => {
      // Arrange
      vi.mocked(mockClient.getGuilds).mockRejectedValue('予期しないエラー');
      const input = { includeDetails: false };

      // Act & Assert
      await expect(getServerList(mockClient, input)).rejects.toThrow(
        'サーバー一覧の取得に失敗しました: 予期しないエラー'
      );
    });
  });

  describe('アイコンURL生成', () => {
    it('アイコンがある場合は正しいURLを生成する', async () => {
      // Arrange
      const guildsWithIcon: DiscordGuild[] = [
        {
          id: '123456',
          name: 'Icon Test',
          icon: 'abc123def456',
          description: null,
          features: []
        }
      ];
      vi.mocked(mockClient.getGuilds).mockResolvedValue(guildsWithIcon);
      const input = { includeDetails: false };

      // Act
      const result = await getServerList(mockClient, input);

      // Assert
      expect(result.servers[0].iconUrl).toBe(
        'https://cdn.discordapp.com/icons/123456/abc123def456.png'
      );
    });

    it('アイコンがない場合はnullを返す', async () => {
      // Arrange
      const guildsWithoutIcon: DiscordGuild[] = [
        {
          id: '123456',
          name: 'No Icon Test',
          icon: null,
          description: null,
          features: []
        }
      ];
      vi.mocked(mockClient.getGuilds).mockResolvedValue(guildsWithoutIcon);
      const input = { includeDetails: false };

      // Act
      const result = await getServerList(mockClient, input);

      // Assert
      expect(result.servers[0].iconUrl).toBe(null);
    });
  });
});