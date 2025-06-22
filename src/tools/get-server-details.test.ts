import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../discord/client.js';
import { ToolDefinition } from '../types/mcp.js';import { getServerDetails, GetServerDetailsInputSchema } from './get-server-details.js';
import { DiscordGuildDetailed } from '../types/discord.js';

// DiscordClient のモック
vi.mock('../discord/client.js');

describe('getServerDetails', () => {
  let mockDiscordClient: any;

  beforeEach(() => {
    mockDiscordClient = {
      getGuildDetails: vi.fn(),
    } as any;
  });

  it('有効なサーバーIDでサーバー詳細情報を取得できる', async () => {
    const mockGuildDetails: DiscordGuildDetailed = {
      id: '233208902815186945',
      name: 'テストサーバー',
      description: 'テスト用のサーバーです',
      icon: 'test-icon-hash',
      approximate_member_count: 100,
      approximate_presence_count: 50,
      permissions: '8',
      features: ['COMMUNITY', 'NEWS'],
      created_at: '2023-01-01T00:00:00.000Z',
      owner_id: '123456789012345678',
      region: 'japan',
      afk_channel_id: null,
      afk_timeout: 300,
      premium_subscription_count: 5,
      premium_tier: 1,
      channels_count: 10,
      roles_count: 5,
      emojis_count: 20,
      stickers_count: 3,
    };

    mockDiscordClient.getGuildDetails.mockResolvedValue(mockGuildDetails);

    const result = await getServerDetails(mockDiscordClient, {
      serverId: '233208902815186945'
    });

    expect(result.server).toEqual({
      id: '233208902815186945',
      name: 'テストサーバー',
      description: 'テスト用のサーバーです',
      iconUrl: 'https://cdn.discordapp.com/icons/233208902815186945/test-icon-hash.png',
      createdAt: '2023-01-01T00:00:00.000Z',
      ownerId: '123456789012345678',
      region: 'japan',
      afkChannelId: null,
      afkTimeout: 300,
      memberCount: 100,
      onlineCount: 50,
      boostCount: 5,
      boostLevel: 1,
      channelsCount: 10,
      rolesCount: 5,
      emojisCount: 20,
      stickersCount: 3,
      features: ['COMMUNITY', 'NEWS'],
    });

    expect(mockDiscordClient.getGuildDetails).toHaveBeenCalledWith('233208902815186945');
  });

  it('アイコンがnullの場合、iconUrlもnullになる', async () => {
    const mockGuildDetails: DiscordGuildDetailed = {
      id: '233208902815186945',
      name: 'テストサーバー',
      description: null,
      icon: null,
      approximate_member_count: 100,
      approximate_presence_count: 50,
      features: [],
      created_at: '2023-01-01T00:00:00.000Z',
      owner_id: '123456789012345678',
      afk_channel_id: null,
      afk_timeout: 300,
      premium_tier: 0,
    };

    mockDiscordClient.getGuildDetails.mockResolvedValue(mockGuildDetails);

    const result = await getServerDetails(mockDiscordClient, {
      serverId: '233208902815186945'
    });

    expect(result.server.iconUrl).toBeNull();
  });

  it('Discord APIエラーが発生した場合、適切なエラーメッセージを投げる', async () => {
    const discordError = new Error('Discord API認証エラー: トークンが無効です');
    mockDiscordClient.getGuildDetails.mockRejectedValue(discordError);

    await expect(
      getServerDetails(mockDiscordClient, { serverId: '233208902815186945' })
    ).rejects.toThrow('サーバー詳細情報の取得に失敗しました: Discord API認証エラー: トークンが無効です');
  });

  it('不明なエラーが発生した場合、汎用エラーメッセージを投げる', async () => {
    mockDiscordClient.getGuildDetails.mockRejectedValue('不明なエラー');

    await expect(
      getServerDetails(mockDiscordClient, { serverId: '233208902815186945' })
    ).rejects.toThrow('サーバー詳細情報の取得に失敗しました: サーバー詳細情報の取得中に不明なエラーが発生しました');
  });

  describe('入力バリデーション', () => {
    it('有効なサーバーIDが正常にパースされる', () => {
      const result = GetServerDetailsInputSchema.parse({
        serverId: '233208902815186945'
      });

      expect(result).toEqual({
        serverId: '233208902815186945'
      });
    });

    it('空のサーバーIDでバリデーションエラーが発生する', () => {
      expect(() => {
        GetServerDetailsInputSchema.parse({ serverId: '' });
      }).toThrow();
    });

    it('サーバーIDが未定義でバリデーションエラーが発生する', () => {
      expect(() => {
        GetServerDetailsInputSchema.parse({});
      }).toThrow();
    });

    it('追加のプロパティがあるとバリデーションエラーが発生する', () => {
      expect(() => {
        GetServerDetailsInputSchema.parse({
          serverId: '233208902815186945',
          extraProperty: 'should not be allowed'
        });
      }).toThrow();
    });
  });
});