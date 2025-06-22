import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';
import { getMemberRoles, GetMemberRolesInputSchema } from './get-member-roles.js';
import { DiscordGuildMember, DiscordRole } from '../../types/discord.js';

// DiscordClientのモック
vi.mock('../../discord/client.js');

describe('getMemberRoles', () => {
  let mockDiscordClient: vi.Mocked<DiscordClient>;

  beforeEach(() => {
    mockDiscordClient = {
      getGuildMember: vi.fn(),
      getGuildRoles: vi.fn(),
    } as any;
  });

  const mockMember: DiscordGuildMember = {
    user: {
      id: '111222333',
      username: 'testuser',
      discriminator: '1234',
      avatar: 'avatar_hash',
      bot: false
    },
    nick: 'Test User',
    avatar: null,
    roles: ['123456789', '987654321'],
    joined_at: '2023-01-01T00:00:00.000Z',
    premium_since: null,
    deaf: false,
    mute: false,
    flags: 0
  };

  const mockRoles: DiscordRole[] = [
    {
      id: '123456789',
      name: 'Admin',
      color: 0xff0000,
      hoist: true,
      icon: null,
      unicode_emoji: null,
      position: 5,
      permissions: '8',
      managed: false,
      mentionable: true
    },
    {
      id: '987654321',
      name: 'Member',
      color: 0x00ff00,
      hoist: false,
      icon: null,
      unicode_emoji: null,
      position: 1,
      permissions: '104324673',
      managed: false,
      mentionable: true
    },
    {
      id: '555666777',
      name: '@everyone',
      color: 0,
      hoist: false,
      icon: null,
      unicode_emoji: null,
      position: 0,
      permissions: '104324673',
      managed: false,
      mentionable: false
    }
  ];

  describe('正常系', () => {
    it('メンバーのロール一覧を取得できる', async () => {
      mockDiscordClient.getGuildMember.mockResolvedValue(mockMember);
      mockDiscordClient.getGuildRoles.mockResolvedValue(mockRoles);

      const input = {
        guildId: '555666777',
        userId: '111222333'
      };

      const result = await getMemberRoles(mockDiscordClient, input);

      expect(mockDiscordClient.getGuildMember).toHaveBeenCalledWith('555666777', '111222333');
      expect(mockDiscordClient.getGuildRoles).toHaveBeenCalledWith('555666777');
      expect(result.member.id).toBe('111222333');
      expect(result.member.username).toBe('testuser');
      expect(result.roles).toHaveLength(2);
      expect(result.roles[0].name).toBe('Admin');
      expect(result.roles[1].name).toBe('Member');
    });

    it('管理者権限を持つロールのみフィルタリングできる', async () => {
      mockDiscordClient.getGuildMember.mockResolvedValue(mockMember);
      mockDiscordClient.getGuildRoles.mockResolvedValue(mockRoles);

      const input = {
        guildId: '555666777',
        userId: '111222333',
        adminOnly: true
      };

      const result = await getMemberRoles(mockDiscordClient, input);

      expect(result.roles).toHaveLength(1);
      expect(result.roles[0].name).toBe('Admin');
      expect(result.roles[0].isAdmin).toBe(true);
    });

    it('管理ロールを除外してフィルタリングできる', async () => {
      const managedRole: DiscordRole = {
        ...mockRoles[0],
        id: '444555666',
        name: 'Bot Role',
        managed: true,
        tags: {
          bot_id: '999888777'
        }
      };

      const memberWithManagedRole: DiscordGuildMember = {
        ...mockMember,
        roles: ['123456789', '444555666', '987654321']
      };

      mockDiscordClient.getGuildMember.mockResolvedValue(memberWithManagedRole);
      mockDiscordClient.getGuildRoles.mockResolvedValue([...mockRoles, managedRole]);

      const input = {
        guildId: '555666777',
        userId: '111222333',
        excludeManaged: true
      };

      const result = await getMemberRoles(mockDiscordClient, input);

      expect(result.roles).toHaveLength(2);
      expect(result.roles.find(r => r.name === 'Bot Role')).toBeUndefined();
    });

    it('詳細情報を含めてロールを取得できる', async () => {
      const roleWithDetails: DiscordRole = {
        ...mockRoles[0],
        icon: 'icon_hash',
        unicode_emoji: '👑',
        tags: {
          premium_subscriber: null
        }
      };

      mockDiscordClient.getGuildMember.mockResolvedValue(mockMember);
      mockDiscordClient.getGuildRoles.mockResolvedValue([roleWithDetails, ...mockRoles.slice(1)]);

      const input = {
        guildId: '555666777',
        userId: '111222333',
        includeDetails: true
      };

      const result = await getMemberRoles(mockDiscordClient, input);

      expect(result.roles[0].iconUrl).toBeDefined();
      expect(result.roles[0].unicodeEmoji).toBe('👑');
      expect(result.roles[0].tags).toBeDefined();
    });

    it('ニックネーム付きメンバーの情報を正しく処理できる', async () => {
      mockDiscordClient.getGuildMember.mockResolvedValue(mockMember);
      mockDiscordClient.getGuildRoles.mockResolvedValue(mockRoles);

      const input = {
        guildId: '555666777',
        userId: '111222333'
      };

      const result = await getMemberRoles(mockDiscordClient, input);

      expect(result.member.nickname).toBe('Test User');
    });

    it('ニックネームなしメンバーの情報を正しく処理できる', async () => {
      const memberWithoutNick: DiscordGuildMember = {
        ...mockMember,
        nick: null
      };

      mockDiscordClient.getGuildMember.mockResolvedValue(memberWithoutNick);
      mockDiscordClient.getGuildRoles.mockResolvedValue(mockRoles);

      const input = {
        guildId: '555666777',
        userId: '111222333'
      };

      const result = await getMemberRoles(mockDiscordClient, input);

      expect(result.member.nickname).toBeNull();
    });

    it('ロールを持たないメンバーの場合空配列を返す', async () => {
      const memberWithoutRoles: DiscordGuildMember = {
        ...mockMember,
        roles: []
      };

      mockDiscordClient.getGuildMember.mockResolvedValue(memberWithoutRoles);
      mockDiscordClient.getGuildRoles.mockResolvedValue(mockRoles);

      const input = {
        guildId: '555666777',
        userId: '111222333'
      };

      const result = await getMemberRoles(mockDiscordClient, input);

      expect(result.roles).toHaveLength(0);
      expect(result.totalRoleCount).toBe(0);
    });

    it('プレミアムメンバーの情報を正しく処理できる', async () => {
      const premiumMember: DiscordGuildMember = {
        ...mockMember,
        premium_since: '2023-06-01T00:00:00.000Z'
      };

      mockDiscordClient.getGuildMember.mockResolvedValue(premiumMember);
      mockDiscordClient.getGuildRoles.mockResolvedValue(mockRoles);

      const input = {
        guildId: '555666777',
        userId: '111222333'
      };

      const result = await getMemberRoles(mockDiscordClient, input);

      expect(result.member.premiumSince).toBe('2023-06-01T00:00:00.000Z');
    });
  });

  describe('異常系', () => {
    it('メンバーが見つからない場合、適切なエラーメッセージを返す', async () => {
      const notFoundError = new Error('Discord API Error: 404 Not Found');
      mockDiscordClient.getGuildMember.mockRejectedValue(notFoundError);

      const input = {
        guildId: '555666777',
        userId: '111222333'
      };

      await expect(getMemberRoles(mockDiscordClient, input)).rejects.toThrow(
        'メンバーロールの取得に失敗しました: Discord API Error: 404 Not Found'
      );
    });

    it('サーバーロール取得でエラーが発生した場合、適切なエラーメッセージを返す', async () => {
      mockDiscordClient.getGuildMember.mockResolvedValue(mockMember);
      const rolesError = new Error('Discord API Error: 403 Forbidden');
      mockDiscordClient.getGuildRoles.mockRejectedValue(rolesError);

      const input = {
        guildId: '555666777',
        userId: '111222333'
      };

      await expect(getMemberRoles(mockDiscordClient, input)).rejects.toThrow(
        'メンバーロールの取得に失敗しました: Discord API Error: 403 Forbidden'
      );
    });

    it('不明なエラーが発生した場合、汎用エラーメッセージを返す', async () => {
      mockDiscordClient.getGuildMember.mockRejectedValue(null);

      const input = {
        guildId: '555666777',
        userId: '111222333'
      };

      await expect(getMemberRoles(mockDiscordClient, input)).rejects.toThrow(
        'メンバーロールの取得に失敗しました: メンバーロールの取得中に不明なエラーが発生しました'
      );
    });
  });

  describe('入力バリデーション', () => {
    it('有効な入力値を正常に検証する', () => {
      const validInput = {
        guildId: '555666777',
        userId: '111222333',
        adminOnly: false,
        excludeManaged: true,
        includeDetails: false
      };

      const result = GetMemberRolesInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.guildId).toBe('555666777');
        expect(result.data.userId).toBe('111222333');
      }
    });

    it('guildIdが空文字の場合、バリデーションエラーになる', () => {
      const invalidInput = {
        guildId: '',
        userId: '111222333'
      };

      const result = GetMemberRolesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('userIdが空文字の場合、バリデーションエラーになる', () => {
      const invalidInput = {
        guildId: '555666777',
        userId: ''
      };

      const result = GetMemberRolesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('必須パラメータが不足している場合、バリデーションエラーになる', () => {
      const invalidInput = {
        guildId: '555666777'
        // userId が不足
      };

      const result = GetMemberRolesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });
  });
});