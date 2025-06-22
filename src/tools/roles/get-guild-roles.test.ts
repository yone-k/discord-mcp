import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';
import { getGuildRoles, GetGuildRolesInputSchema } from './get-guild-roles.js';
import { DiscordRole } from '../../types/discord.js';

// DiscordClientのモック
vi.mock('../../discord/client.js');

describe('getGuildRoles', () => {
  let mockDiscordClient: vi.Mocked<DiscordClient>;

  beforeEach(() => {
    mockDiscordClient = {
      getGuildRoles: vi.fn(),
    } as any;
  });

  const mockRole: DiscordRole = {
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
  };

  const mockEveryoneRole: DiscordRole = {
    id: '987654321',
    name: '@everyone',
    color: 0,
    hoist: false,
    icon: null,
    unicode_emoji: null,
    position: 0,
    permissions: '104324673',
    managed: false,
    mentionable: false
  };

  describe('正常系', () => {
    it('サーバーのロール一覧を取得できる', async () => {
      mockDiscordClient.getGuildRoles.mockResolvedValue([mockRole, mockEveryoneRole]);

      const input = {
        guildId: '555666777'
      };

      const result = await getGuildRoles(mockDiscordClient, input);

      expect(mockDiscordClient.getGuildRoles).toHaveBeenCalledWith('555666777');
      expect(result.roles).toHaveLength(2);
      expect(result.roles[0].id).toBe('123456789');
      expect(result.roles[0].name).toBe('Admin');
      expect(result.roles[1].name).toBe('@everyone');
      expect(result.totalCount).toBe(2);
    });

    it('管理者権限フィルターを適用してロールを取得できる', async () => {
      const adminRole: DiscordRole = {
        ...mockRole,
        permissions: '8' // ADMINISTRATOR権限
      };
      const normalRole: DiscordRole = {
        ...mockRole,
        id: '111222333',
        name: 'Member',
        permissions: '104324673'
      };

      mockDiscordClient.getGuildRoles.mockResolvedValue([adminRole, normalRole, mockEveryoneRole]);

      const input = {
        guildId: '555666777',
        adminOnly: true
      };

      const result = await getGuildRoles(mockDiscordClient, input);

      expect(result.roles).toHaveLength(1);
      expect(result.roles[0].name).toBe('Admin');
      expect(result.roles[0].isAdmin).toBe(true);
    });

    it('管理ロールを除外してロールを取得できる', async () => {
      const managedRole: DiscordRole = {
        ...mockRole,
        id: '111222333',
        name: 'Bot Role',
        managed: true,
        tags: {
          bot_id: '444555666'
        }
      };

      mockDiscordClient.getGuildRoles.mockResolvedValue([mockRole, managedRole, mockEveryoneRole]);

      const input = {
        guildId: '555666777',
        excludeManaged: true
      };

      const result = await getGuildRoles(mockDiscordClient, input);

      expect(result.roles).toHaveLength(2);
      expect(result.roles.find(r => r.name === 'Bot Role')).toBeUndefined();
    });

    it('詳細情報を含めてロールを取得できる', async () => {
      const roleWithTags: DiscordRole = {
        ...mockRole,
        tags: {
          premium_subscriber: null
        }
      };

      mockDiscordClient.getGuildRoles.mockResolvedValue([roleWithTags]);

      const input = {
        guildId: '555666777',
        includeDetails: true
      };

      const result = await getGuildRoles(mockDiscordClient, input);

      expect(result.roles).toHaveLength(1);
      expect(result.roles[0].tags).toBeDefined();
      expect(result.roles[0].tags?.isPremiumSubscriber).toBe(true);
    });

    it('空のロールリストを取得できる', async () => {
      mockDiscordClient.getGuildRoles.mockResolvedValue([]);

      const input = {
        guildId: '555666777'
      };

      const result = await getGuildRoles(mockDiscordClient, input);

      expect(result.roles).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('色付きロールを正しく処理できる', async () => {
      const coloredRole: DiscordRole = {
        ...mockRole,
        color: 0x00ff00
      };

      mockDiscordClient.getGuildRoles.mockResolvedValue([coloredRole]);

      const input = {
        guildId: '555666777'
      };

      const result = await getGuildRoles(mockDiscordClient, input);

      expect(result.roles[0].color).toBe('#00ff00');
      expect(result.roles[0].colorValue).toBe(65280);
    });

    it('ホイストされたロールを正しく処理できる', async () => {
      const hoistedRole: DiscordRole = {
        ...mockRole,
        hoist: true
      };

      mockDiscordClient.getGuildRoles.mockResolvedValue([hoistedRole]);

      const input = {
        guildId: '555666777'
      };

      const result = await getGuildRoles(mockDiscordClient, input);

      expect(result.roles[0].hoist).toBe(true);
    });
  });

  describe('異常系', () => {
    it('Discord APIエラーが発生した場合、適切なエラーメッセージを返す', async () => {
      const apiError = new Error('Discord API Error: 403 Forbidden');
      mockDiscordClient.getGuildRoles.mockRejectedValue(apiError);

      const input = {
        guildId: '555666777'
      };

      await expect(getGuildRoles(mockDiscordClient, input)).rejects.toThrow(
        'サーバーロールの取得に失敗しました: Discord API Error: 403 Forbidden'
      );
    });

    it('不明なエラーが発生した場合、汎用エラーメッセージを返す', async () => {
      mockDiscordClient.getGuildRoles.mockRejectedValue(null);

      const input = {
        guildId: '555666777'
      };

      await expect(getGuildRoles(mockDiscordClient, input)).rejects.toThrow(
        'サーバーロールの取得に失敗しました: サーバーロールの取得中に不明なエラーが発生しました'
      );
    });
  });

  describe('入力バリデーション', () => {
    it('有効な入力値を正常に検証する', () => {
      const validInput = {
        guildId: '123456789',
        adminOnly: false,
        excludeManaged: true,
        includeDetails: false
      };

      const result = GetGuildRolesInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.guildId).toBe('123456789');
      }
    });

    it('guildIdが空文字の場合、バリデーションエラーになる', () => {
      const invalidInput = {
        guildId: ''
      };

      const result = GetGuildRolesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('必須パラメータが不足している場合、バリデーションエラーになる', () => {
      const invalidInput = {};

      const result = GetGuildRolesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });
  });
});