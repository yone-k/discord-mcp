import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserList, GetUserListInputSchema } from './get-user-list.js';
import { DiscordGuildMember } from '../types/discord.js';

// DiscordClient のモック
vi.mock('../discord/client.js');

describe('getUserList', () => {
  let mockDiscordClient: any;

  beforeEach(() => {
    mockDiscordClient = {
      getGuildMembers: vi.fn(),
    } as any;
  });

  it('有効なサーバーIDでユーザー一覧を取得できる', async () => {
    const mockMembers: DiscordGuildMember[] = [
      {
        user: {
          id: '123456789012345678',
          username: 'TestUser',
          discriminator: '0001',
          global_name: 'Test User',
          avatar: 'abc123',
          bot: false
        },
        nick: 'TestNick',
        avatar: null,
        roles: ['987654321098765432'],
        joined_at: '2023-01-01T00:00:00.000Z',
        premium_since: null,
        deaf: false,
        mute: false,
        flags: 0
      },
      {
        user: {
          id: '234567890123456789',
          username: 'BotUser',
          discriminator: '0002',
          avatar: null,
          bot: true
        },
        nick: null,
        avatar: null,
        roles: [],
        joined_at: '2023-01-02T00:00:00.000Z',
        premium_since: null,
        deaf: false,
        mute: false,
        flags: 0
      }
    ];

    mockDiscordClient.getGuildMembers.mockResolvedValue(mockMembers);

    const result = await getUserList(mockDiscordClient, {
      serverId: '987654321098765432',
      limit: 100,
      includeDetails: false
    });

    expect(result.users).toHaveLength(2);
    expect(result.users[0]).toEqual({
      id: '123456789012345678',
      username: 'TestUser',
      discriminator: '0001',
      globalName: 'Test User',
      nickname: 'TestNick',
      avatarUrl: 'https://cdn.discordapp.com/avatars/123456789012345678/abc123.png',
      isBot: false
    });
    expect(result.users[1].isBot).toBe(true);
    expect(result.totalCount).toBe(2);
    expect(mockDiscordClient.getGuildMembers).toHaveBeenCalledWith('987654321098765432', {
      limit: 100,
      after: undefined
    });
  });

  it('詳細情報付きでユーザー一覧を取得できる', async () => {
    const mockMembers: DiscordGuildMember[] = [
      {
        user: {
          id: '123456789012345678',
          username: 'TestUser',
          discriminator: '0001',
          avatar: 'abc123'
        },
        nick: null,
        avatar: null,
        roles: ['987654321098765432', '876543210987654321'],
        joined_at: '2023-01-01T00:00:00.000Z',
        premium_since: '2023-06-01T00:00:00.000Z',
        deaf: false,
        mute: false,
        flags: 0
      }
    ];

    mockDiscordClient.getGuildMembers.mockResolvedValue(mockMembers);

    const result = await getUserList(mockDiscordClient, {
      serverId: '987654321098765432',
      includeDetails: true
    });

    expect(result.users[0]).toEqual({
      id: '123456789012345678',
      username: 'TestUser',
      discriminator: '0001',
      globalName: null,
      nickname: null,
      avatarUrl: 'https://cdn.discordapp.com/avatars/123456789012345678/abc123.png',
      isBot: false,
      roles: ['987654321098765432', '876543210987654321'],
      joinedAt: '2023-01-01T00:00:00.000Z',
      premiumSince: '2023-06-01T00:00:00.000Z'
    });
  });

  it('ロールIDでフィルタリングできる', async () => {
    const mockMembers: DiscordGuildMember[] = [
      {
        user: {
          id: '123456789012345678',
          username: 'UserWithRole',
          discriminator: '0001',
          avatar: null
        },
        nick: null,
        avatar: null,
        roles: ['987654321098765432'],
        joined_at: '2023-01-01T00:00:00.000Z',
        premium_since: null,
        deaf: false,
        mute: false,
        flags: 0
      },
      {
        user: {
          id: '234567890123456789',
          username: 'UserWithoutRole',
          discriminator: '0002',
          avatar: null
        },
        nick: null,
        avatar: null,
        roles: ['876543210987654321'],
        joined_at: '2023-01-02T00:00:00.000Z',
        premium_since: null,
        deaf: false,
        mute: false,
        flags: 0
      }
    ];

    mockDiscordClient.getGuildMembers.mockResolvedValue(mockMembers);

    const result = await getUserList(mockDiscordClient, {
      serverId: '987654321098765432',
      roleId: '987654321098765432'
    });

    expect(result.users).toHaveLength(1);
    expect(result.users[0].username).toBe('UserWithRole');
  });

  it('ページネーションが正しく動作する', async () => {
    // 100件のメンバーを生成（limitと同じ数）
    const mockMembers: DiscordGuildMember[] = Array.from({ length: 100 }, (_, i) => ({
      user: {
        id: `${i + 1}`.padStart(18, '0'),
        username: `User${i + 1}`,
        discriminator: `${i + 1}`.padStart(4, '0'),
        avatar: null
      },
      nick: null,
      avatar: null,
      roles: [],
      joined_at: '2023-01-01T00:00:00.000Z',
      premium_since: null,
      deaf: false,
      mute: false,
      flags: 0
    }));

    mockDiscordClient.getGuildMembers.mockResolvedValue(mockMembers);

    const result = await getUserList(mockDiscordClient, {
      serverId: '987654321098765432',
      limit: 100
    });

    expect(result.hasMore).toBe(true);
    expect(result.nextUserId).toBe('000000000000000100');
  });

  it('ユーザー情報が不完全な場合でもエラーにならない', async () => {
    const mockMembers: DiscordGuildMember[] = [
      {
        // user フィールドが undefined
        nick: 'SomeNick',
        avatar: null,
        roles: [],
        joined_at: '2023-01-01T00:00:00.000Z',
        premium_since: null,
        deaf: false,
        mute: false,
        flags: 0
      }
    ];

    mockDiscordClient.getGuildMembers.mockResolvedValue(mockMembers);

    const result = await getUserList(mockDiscordClient, {
      serverId: '987654321098765432'
    });

    expect(result.users).toHaveLength(1);
    expect(result.users[0].username).toBe('Unknown User');
    expect(result.users[0].id).toBe('unknown');
  });

  it('Discord APIエラーが発生した場合、適切なエラーメッセージを投げる', async () => {
    const discordError = new Error('サーバーが見つかりません');
    mockDiscordClient.getGuildMembers.mockRejectedValue(discordError);

    await expect(
      getUserList(mockDiscordClient, { serverId: '987654321098765432' })
    ).rejects.toThrow('ユーザー一覧の取得に失敗しました: サーバーが見つかりません');
  });

  it('不明なエラーが発生した場合、汎用エラーメッセージを投げる', async () => {
    mockDiscordClient.getGuildMembers.mockRejectedValue('不明なエラー');

    await expect(
      getUserList(mockDiscordClient, { serverId: '987654321098765432' })
    ).rejects.toThrow('ユーザー一覧の取得に失敗しました: ユーザー一覧の取得中に不明なエラーが発生しました');
  });

  describe('入力バリデーション', () => {
    it('有効なサーバーIDが正常にパースされる', () => {
      const result = GetUserListInputSchema.parse({
        serverId: '987654321098765432'
      });

      expect(result).toEqual({
        serverId: '987654321098765432',
        limit: 100,
        includeDetails: false
      });
    });

    it('カスタムlimitが正常にパースされる', () => {
      const result = GetUserListInputSchema.parse({
        serverId: '987654321098765432',
        limit: 50
      });

      expect(result.limit).toBe(50);
    });

    it('afterパラメータが正常にパースされる', () => {
      const result = GetUserListInputSchema.parse({
        serverId: '987654321098765432',
        after: '123456789012345678'
      });

      expect(result.after).toBe('123456789012345678');
    });

    it('空のサーバーIDでバリデーションエラーが発生する', () => {
      expect(() => {
        GetUserListInputSchema.parse({ serverId: '' });
      }).toThrow();
    });

    it('limitが範囲外でバリデーションエラーが発生する', () => {
      expect(() => {
        GetUserListInputSchema.parse({
          serverId: '987654321098765432',
          limit: 1001
        });
      }).toThrow();

      expect(() => {
        GetUserListInputSchema.parse({
          serverId: '987654321098765432',
          limit: 0
        });
      }).toThrow();
    });

    it('追加のプロパティがあるとバリデーションエラーが発生する', () => {
      expect(() => {
        GetUserListInputSchema.parse({
          serverId: '987654321098765432',
          extraProperty: 'should not be allowed'
        });
      }).toThrow();
    });
  });
});