import { z } from 'zod';
import { DiscordClient } from '../../discord/client.js';
import { ToolDefinition } from '../../types/mcp.js';

/**
 * ボイスリージョン取得ツールの入力スキーマ
 */
export const GetVoiceRegionsInputSchema = z.object({}).strict();

export type GetVoiceRegionsInput = z.infer<typeof GetVoiceRegionsInputSchema>;

/**
 * MCP ツール定義
 */
export const toolDefinition: ToolDefinition = {
  name: 'get_voice_regions',
  description: '利用可能なDiscordボイスリージョン一覧を取得します',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
    additionalProperties: false
  }
};

/**
 * ボイスリージョン取得ツールの出力スキーマ
 */
export const GetVoiceRegionsOutputSchema = z.object({
  /** ボイスリージョン一覧 */
  regions: z.array(z.object({
    /** リージョンID */
    id: z.string(),
    /** リージョン名 */
    name: z.string(),
    /** 最適化されているか */
    optimal: z.boolean(),
    /** 非推奨か */
    deprecated: z.boolean(),
    /** カスタムか */
    custom: z.boolean()
  })),
  /** 総リージョン数 */
  totalCount: z.number()
});

export type GetVoiceRegionsOutput = z.infer<typeof GetVoiceRegionsOutputSchema>;

/**
 * 利用可能なDiscordボイスリージョン一覧を取得
 */
export async function getVoiceRegions(
  discordClient: DiscordClient,
  _input: GetVoiceRegionsInput
): Promise<GetVoiceRegionsOutput> {
  try {
    const regions = await discordClient.getVoiceRegions();

    const processedRegions = regions.map(region => ({
      id: region.id,
      name: region.name,
      optimal: region.optimal,
      deprecated: region.deprecated,
      custom: region.custom
    }));

    return {
      regions: processedRegions,
      totalCount: processedRegions.length
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'ボイスリージョンの取得中に不明なエラーが発生しました';
    throw new Error(`ボイスリージョンの取得に失敗しました: ${errorMessage}`);
  }
}