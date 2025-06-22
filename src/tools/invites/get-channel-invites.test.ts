import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';
import { getChannelInvites, GetChannelInvitesInputSchema } from './get-channel-invites.js';
import { DiscordInvite } from '../../types/discord.js';

// DiscordClientのモック
vi.mock('../../discord/client.js');

describe('getChannelInvites', () => {
  let mockDiscordClient: vi.Mocked<DiscordClient>;

  beforeEach(() => {
    mockDiscordClient = {
      getChannelInvites: vi.fn(),
    } as any;
  });

  const mockInvites: DiscordInvite[] = [
    {
      code: 'channel123',
      channel: {
        id: '987654321',
        name: 'general',
        type: 0
      },
      inviter: {
        id: '111222333',
        username: 'channel_inviter',
        discriminator: '5678',
        avatar: 'avatar_hash'
      },
      type: 0,
      uses: 2,
      max_uses: 5,
      created_at: '2023-01-01T00:00:00.000Z'
    }
  ];

  describe('正常系', () => {
    it('チャンネルの招待リンク一覧を取得できる', async () => {
      mockDiscordClient.getChannelInvites.mockResolvedValue(mockInvites);

      const input = {
        channelId: '987654321'
      };

      const result = await getChannelInvites(mockDiscordClient, input);

      expect(mockDiscordClient.getChannelInvites).toHaveBeenCalledWith('987654321');
      expect(result.invites).toHaveLength(1);
      expect(result.invites[0].code).toBe('channel123');
      expect(result.invites[0].channel.name).toBe('general');
      expect(result.invites[0].inviter?.username).toBe('channel_inviter');
      expect(result.totalCount).toBe(1);
    });

    it('空の招待リンクリストを取得できる', async () => {
      mockDiscordClient.getChannelInvites.mockResolvedValue([]);

      const input = {
        channelId: '987654321'
      };

      const result = await getChannelInvites(mockDiscordClient, input);

      expect(result.invites).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('異常系', () => {
    it('Discord APIエラーが発生した場合、適切なエラーメッセージを返す', async () => {
      const apiError = new Error('Discord API Error: 403 Forbidden');
      mockDiscordClient.getChannelInvites.mockRejectedValue(apiError);

      const input = {
        channelId: '987654321'
      };

      await expect(getChannelInvites(mockDiscordClient, input)).rejects.toThrow(
        'チャンネルの招待リンクの取得に失敗しました: Discord API Error: 403 Forbidden'
      );
    });
  });

  describe('入力バリデーション', () => {
    it('有効な入力値を正常に検証する', () => {
      const validInput = {
        channelId: '987654321'
      };

      const result = GetChannelInvitesInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.channelId).toBe('987654321');
      }
    });

    it('channelIdが空文字の場合、バリデーションエラーになる', () => {
      const invalidInput = {
        channelId: ''
      };

      const result = GetChannelInvitesInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});