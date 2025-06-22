import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';
import { getVoiceRegions, GetVoiceRegionsInputSchema } from './get-voice-regions.js';
import { DiscordVoiceRegion } from '../../types/discord.js';

// DiscordClientのモック
vi.mock('../../discord/client.js');

describe('getVoiceRegions', () => {
  let mockDiscordClient: vi.Mocked<DiscordClient>;

  beforeEach(() => {
    mockDiscordClient = {
      getVoiceRegions: vi.fn(),
    } as any;
  });

  const mockVoiceRegions: DiscordVoiceRegion[] = [
    {
      id: 'us-east',
      name: 'US East',
      optimal: true,
      deprecated: false,
      custom: false
    },
    {
      id: 'us-west',
      name: 'US West',
      optimal: false,
      deprecated: false,
      custom: false
    },
    {
      id: 'europe',
      name: 'Europe',
      optimal: false,
      deprecated: false,
      custom: false
    }
  ];

  describe('正常系', () => {
    it('利用可能なボイスリージョン一覧を取得できる', async () => {
      mockDiscordClient.getVoiceRegions.mockResolvedValue(mockVoiceRegions);

      const input = {};

      const result = await getVoiceRegions(mockDiscordClient, input);

      expect(mockDiscordClient.getVoiceRegions).toHaveBeenCalledWith();
      expect(result.regions).toHaveLength(3);
      expect(result.regions[0].id).toBe('us-east');
      expect(result.regions[0].name).toBe('US East');
      expect(result.regions[0].optimal).toBe(true);
      expect(result.totalCount).toBe(3);
    });

    it('空のボイスリージョンリストを取得できる', async () => {
      mockDiscordClient.getVoiceRegions.mockResolvedValue([]);

      const input = {};

      const result = await getVoiceRegions(mockDiscordClient, input);

      expect(result.regions).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('最適化されたリージョンのみを正しく識別できる', async () => {
      mockDiscordClient.getVoiceRegions.mockResolvedValue(mockVoiceRegions);

      const input = {};

      const result = await getVoiceRegions(mockDiscordClient, input);

      const optimalRegions = result.regions.filter(region => region.optimal);
      expect(optimalRegions).toHaveLength(1);
      expect(optimalRegions[0].id).toBe('us-east');
    });
  });

  describe('異常系', () => {
    it('Discord APIエラーが発生した場合、適切なエラーメッセージを返す', async () => {
      const apiError = new Error('Discord API Error: 401 Unauthorized');
      mockDiscordClient.getVoiceRegions.mockRejectedValue(apiError);

      const input = {};

      await expect(getVoiceRegions(mockDiscordClient, input)).rejects.toThrow(
        'ボイスリージョンの取得に失敗しました: Discord API Error: 401 Unauthorized'
      );
    });

    it('不明なエラーが発生した場合、汎用エラーメッセージを返す', async () => {
      mockDiscordClient.getVoiceRegions.mockRejectedValue(null);

      const input = {};

      await expect(getVoiceRegions(mockDiscordClient, input)).rejects.toThrow(
        'ボイスリージョンの取得に失敗しました: ボイスリージョンの取得中に不明なエラーが発生しました'
      );
    });
  });

  describe('入力バリデーション', () => {
    it('空の入力オブジェクトを正常に検証する', () => {
      const validInput = {};

      const result = GetVoiceRegionsInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('追加のプロパティがある場合、バリデーションエラーになる', () => {
      const invalidInput = {
        invalidProperty: 'test'
      };

      const result = GetVoiceRegionsInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });
  });
});