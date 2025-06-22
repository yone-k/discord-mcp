import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getChannelList, GetChannelListInputSchema } from './get-channel-list.js';
import { DiscordChannel } from '../../types/discord.js';

// DiscordClient のモック
vi.mock('../../discord/client.js');

describe('getChannelList', () => {
  let mockDiscordClient: any;

  beforeEach(() => {
    mockDiscordClient = {
      getGuildChannels: vi.fn(),
    } as any;
  });

  it('有効なサーバーIDでチャンネル一覧を取得できる', async () => {
    const mockChannels: DiscordChannel[] = [
      {
        id: '123456789012345678',
        name: 'general',
        type: 0,
        position: 0,
        guild_id: '987654321098765432'
      },
      {
        id: '234567890123456789',
        name: 'random',
        type: 0,
        position: 1,
        guild_id: '987654321098765432'
      },
      {
        id: '345678901234567890',
        name: 'Voice Channel',
        type: 2,
        position: 2,
        guild_id: '987654321098765432'
      }
    ];

    mockDiscordClient.getGuildChannels.mockResolvedValue(mockChannels);

    const result = await getChannelList(mockDiscordClient, {
      serverId: '987654321098765432',
      includeDetails: false
    });

    expect(result.channels).toHaveLength(3);
    expect(result.channels[0]).toEqual({
      id: '123456789012345678',
      name: 'general',
      type: 0,
      position: 0
    });
    expect(result.totalCount).toBe(3);
    expect(mockDiscordClient.getGuildChannels).toHaveBeenCalledWith('987654321098765432');
  });

  it('詳細情報付きでチャンネル一覧を取得できる', async () => {
    const mockChannels: DiscordChannel[] = [
      {
        id: '123456789012345678',
        name: 'general',
        type: 0,
        position: 0,
        guild_id: '987654321098765432',
        topic: 'General discussion',
        nsfw: false,
        parent_id: null,
        permission_overwrites: []
      }
    ];

    mockDiscordClient.getGuildChannels.mockResolvedValue(mockChannels);

    const result = await getChannelList(mockDiscordClient, {
      serverId: '987654321098765432',
      includeDetails: true
    });

    expect(result.channels[0]).toEqual({
      id: '123456789012345678',
      name: 'general',
      type: 0,
      position: 0,
      topic: 'General discussion',
      nsfw: false,
      parentId: null,
      permissionOverwrites: []
    });
  });

  it('チャンネルタイプのフィルタリングができる', async () => {
    const mockChannels: DiscordChannel[] = [
      {
        id: '123456789012345678',
        name: 'general',
        type: 0,
        position: 0,
        guild_id: '987654321098765432'
      },
      {
        id: '234567890123456789',
        name: 'Voice Channel',
        type: 2,
        position: 1,
        guild_id: '987654321098765432'
      },
      {
        id: '345678901234567890',
        name: 'Category',
        type: 4,
        position: 2,
        guild_id: '987654321098765432'
      }
    ];

    mockDiscordClient.getGuildChannels.mockResolvedValue(mockChannels);

    const result = await getChannelList(mockDiscordClient, {
      serverId: '987654321098765432',
      channelType: 0
    });

    expect(result.channels).toHaveLength(1);
    expect(result.channels[0].type).toBe(0);
  });

  it('Discord APIエラーが発生した場合、適切なエラーメッセージを投げる', async () => {
    const discordError = new Error('サーバーが見つかりません');
    mockDiscordClient.getGuildChannels.mockRejectedValue(discordError);

    await expect(
      getChannelList(mockDiscordClient, { serverId: '987654321098765432' })
    ).rejects.toThrow('チャンネル一覧の取得に失敗しました: サーバーが見つかりません');
  });

  it('不明なエラーが発生した場合、汎用エラーメッセージを投げる', async () => {
    mockDiscordClient.getGuildChannels.mockRejectedValue('不明なエラー');

    await expect(
      getChannelList(mockDiscordClient, { serverId: '987654321098765432' })
    ).rejects.toThrow('チャンネル一覧の取得に失敗しました: チャンネル一覧の取得中に不明なエラーが発生しました');
  });

  describe('入力バリデーション', () => {
    it('有効なサーバーIDが正常にパースされる', () => {
      const result = GetChannelListInputSchema.parse({
        serverId: '987654321098765432'
      });

      expect(result).toEqual({
        serverId: '987654321098765432',
        includeDetails: false
      });
    });

    it('詳細情報フラグが正常にパースされる', () => {
      const result = GetChannelListInputSchema.parse({
        serverId: '987654321098765432',
        includeDetails: true
      });

      expect(result.includeDetails).toBe(true);
    });

    it('チャンネルタイプフィルタが正常にパースされる', () => {
      const result = GetChannelListInputSchema.parse({
        serverId: '987654321098765432',
        channelType: 0
      });

      expect(result.channelType).toBe(0);
    });

    it('空のサーバーIDでバリデーションエラーが発生する', () => {
      expect(() => {
        GetChannelListInputSchema.parse({ serverId: '' });
      }).toThrow();
    });

    it('サーバーIDが未定義でバリデーションエラーが発生する', () => {
      expect(() => {
        GetChannelListInputSchema.parse({});
      }).toThrow();
    });

    it('無効なチャンネルタイプでバリデーションエラーが発生する', () => {
      expect(() => {
        GetChannelListInputSchema.parse({
          serverId: '987654321098765432',
          channelType: -1
        });
      }).toThrow();
    });

    it('追加のプロパティがあるとバリデーションエラーが発生する', () => {
      expect(() => {
        GetChannelListInputSchema.parse({
          serverId: '987654321098765432',
          extraProperty: 'should not be allowed'
        });
      }).toThrow();
    });
  });
});