#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { registeredTools } from './tools/registry.js';
import { ToolHandler } from './core/tool-handler.js';

/**
 * Discord MCP Server
 */
class DiscordMCPServer {
  private server: Server;
  private toolHandler: ToolHandler;

  constructor() {
    this.server = new Server({
      name: 'discord-mcp',
      version: '1.0.0',
    });

    this.toolHandler = new ToolHandler();
    this.setupHandlers();
    this.setupErrorHandling();
  }

  /**
   * ハンドラーを設定
   */
  private setupHandlers(): void {
    // ツール一覧の取得
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: registeredTools,
      };
    });

    // ツール実行
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        return await this.toolHandler.executeTool(name, args);
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
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}