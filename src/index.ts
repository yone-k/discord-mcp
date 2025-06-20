#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { DiscordClient } from './discord/client.js';
import { 
  getServerList, 
  GetServerListInputSchema,
  GetServerListInput 
} from './tools/get-server-list.js';

/**
 * Discord MCP Server
 */
class DiscordMCPServer {
  private server: Server;
  private discordClient: DiscordClient | null = null;

  constructor() {
    this.server = new Server({
      name: 'discord-mcp',
      version: '1.0.0',
    });

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  /**
   * ツールハンドラーを設定
   */
  private setupToolHandlers(): void {
    // ツール一覧の取得
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_server_list',
            description: 'Botが参加しているDiscordサーバーの一覧を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                includeDetails: {
                  type: 'boolean',
                  description: '詳細情報（メンバー数、機能など）を含めるかどうか',
                  default: false
                }
              },
              additionalProperties: false
            }
          }
        ],
      };
    });

    // ツール実行
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_server_list':
            return await this.handleGetServerList(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `不明なツール: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          `ツールの実行に失敗しました: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  /**
   * サーバー一覧取得ツールのハンドラー
   */
  private async handleGetServerList(args: unknown) {
    // Discord クライアントの初期化（遅延初期化）
    if (!this.discordClient) {
      const token = process.env.DISCORD_TOKEN;
      if (!token) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'DISCORD_TOKEN環境変数が設定されていません'
        );
      }
      this.discordClient = new DiscordClient(token);
    }

    // 入力バリデーション
    let input: GetServerListInput;
    try {
      input = GetServerListInputSchema.parse(args || {});
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `無効なパラメータ: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // サーバー一覧を取得
    const result = await getServerList(this.discordClient, input);

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  /**
   * エラーハンドリングを設定
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * サーバーを起動
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Discord MCP Server が起動しました');
  }
}

/**
 * メイン実行部
 */
async function main(): Promise<void> {
  const server = new DiscordMCPServer();
  await server.run();
}

// スクリプトが直接実行された場合のみ起動
if (process.argv[1] && process.argv[1].endsWith('index.js')) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}