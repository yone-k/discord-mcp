import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';
import { getGuildInvites, GetGuildInvitesInputSchema } from './get-guild-invites.js';
import { DiscordInvite } from '../../types/discord.js';

// DiscordClientのモック
vi.mock('../../discord/client.js');

describe('getGuildInvites', () => {
  let mockDiscordClient: vi.Mocked<DiscordClient>;

  beforeEach(() => {
    mockDiscordClient = {
      getGuildInvites: vi.fn(),
    } as any;
  });

  const mockInvites: DiscordInvite[] = [
    {
      code: 'abc123',
      guild: {
        id: '123456789',
        name: 'Test Server',
        icon: 'icon_hash',
        description: 'A test server',
        splash: null,
        discovery_splash: null,
        features: ['COMMUNITY'],
        verification_level: 1,
        vanity_url_code: null,
        nsfw_level: 0,
        premium_subscription_count: 5
      },
      channel: {
        id: '987654321',
        name: 'general',
        type: 0
      },
      inviter: {
        id: '111222333',
        username: 'inviter_user',
        discriminator: '1234',
        avatar: 'avatar_hash'
      },
      approximate_member_count: 100,
      approximate_presence_count: 50,
      expires_at: '2024-01-01T00:00:00.000Z',
      type: 0,
      uses: 5,
      max_uses: 10,
      max_age: 86400,
      temporary: false,
      created_at: '2023-01-01T00:00:00.000Z'
    },
    {
      code: 'def456',
      guild: {
        id: '123456789',
        name: 'Test Server',
        icon: 'icon_hash',
        description: 'A test server',
        splash: null,
        discovery_splash: null,
        features: [],
        verification_level: 2,
        vanity_url_code: null,
        nsfw_level: 0
      },
      channel: {
        id: '987654322',
        name: 'invite-channel',
        type: 0
      },
      approximate_member_count: 100,
      type: 0,
      uses: 0,
      max_uses: 0,
      max_age: 0,
      temporary: true,
      created_at: '2023-01-02T00:00:00.000Z'
    }
  ];

  describe('正常系', () => {
    it('サーバーの招待リンク一覧を取得できる', async () => {
      mockDiscordClient.getGuildInvites.mockResolvedValue(mockInvites);

      const input = {
        guildId: '123456789'
      };

      const result = await getGuildInvites(mockDiscordClient, input);

      expect(mockDiscordClient.getGuildInvites).toHaveBeenCalledWith('123456789');
      expect(result.invites).toHaveLength(2);
      expect(result.invites[0].code).toBe('abc123');
      expect(result.invites[0].guild?.name).toBe('Test Server');
      expect(result.invites[0].channel.name).toBe('general');
      expect(result.invites[0].inviter?.username).toBe('inviter_user');
      expect(result.totalCount).toBe(2);
    });

    it('空の招待リンクリストを取得できる', async () => {
      mockDiscordClient.getGuildInvites.mockResolvedValue([]);

      const input = {
        guildId: '123456789'
      };

      const result = await getGuildInvites(mockDiscordClient, input);

      expect(result.invites).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('一時的な招待リンクを正しく識別できる', async () => {
      mockDiscordClient.getGuildInvites.mockResolvedValue(mockInvites);

      const input = {
        guildId: '123456789'
      };

      const result = await getGuildInvites(mockDiscordClient, input);

      const temporaryInvites = result.invites.filter(invite => invite.temporary);
      expect(temporaryInvites).toHaveLength(1);
      expect(temporaryInvites[0].code).toBe('def456');
    });

    it('無制限の招待リンクを正しく識別できる', async () => {
      mockDiscordClient.getGuildInvites.mockResolvedValue(mockInvites);

      const input = {
        guildId: '123456789'
      };

      const result = await getGuildInvites(mockDiscordClient, input);

      const unlimitedInvites = result.invites.filter(invite => invite.maxUses === 0);
      expect(unlimitedInvites).toHaveLength(1);
      expect(unlimitedInvites[0].code).toBe('def456');
    });
  });

  describe('異常系', () => {
    it('Discord APIエラーが発生した場合、適切なエラーメッセージを返す', async () => {
      const apiError = new Error('Discord API Error: 403 Forbidden');
      mockDiscordClient.getGuildInvites.mockRejectedValue(apiError);

      const input = {
        guildId: '123456789'
      };

      await expect(getGuildInvites(mockDiscordClient, input)).rejects.toThrow(
        'サーバーの招待リンクの取得に失敗しました: Discord API Error: 403 Forbidden'
      );
    });

    it('不明なエラーが発生した場合、汎用エラーメッセージを返す', async () => {
      mockDiscordClient.getGuildInvites.mockRejectedValue(null);

      const input = {
        guildId: '123456789'
      };

      await expect(getGuildInvites(mockDiscordClient, input)).rejects.toThrow(
        'サーバーの招待リンクの取得に失敗しました: サーバーの招待リンクの取得中に不明なエラーが発生しました'
      );
    });
  });

  describe('入力バリデーション', () => {
    it('有効な入力値を正常に検証する', () => {
      const validInput = {
        guildId: '123456789'
      };

      const result = GetGuildInvitesInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.guildId).toBe('123456789');
      }
    });

    it('guildIdが空文字の場合、バリデーションエラーになる', () => {
      const invalidInput = {
        guildId: ''
      };

      const result = GetGuildInvitesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('guildIdが欠けている場合、バリデーションエラーになる', () => {
      const invalidInput = {};

      const result = GetGuildInvitesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('追加のプロパティがある場合、バリデーションエラーになる', () => {
      const invalidInput = {
        guildId: '123456789',
        invalidProperty: 'test'
      };

      const result = GetGuildInvitesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });
  });
});