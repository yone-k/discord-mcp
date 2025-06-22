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
import {
  getServerDetails,
  GetServerDetailsInputSchema,
  GetServerDetailsInput
} from './tools/get-server-details.js';
import {
  getChannelList,
  GetChannelListInputSchema,
  GetChannelListInput
} from './tools/get-channel-list.js';
import {
  getUserList,
  GetUserListInputSchema,
  GetUserListInput
} from './tools/get-user-list.js';
import {
  getChannelMessages,
  GetChannelMessagesInputSchema,
  GetChannelMessagesInput
} from './tools/get-channel-messages.js';

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
          },
          {
            name: 'get_server_details',
            description: '特定のDiscordサーバーの詳細情報を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                serverId: {
                  type: 'string',
                  description: '詳細情報を取得するサーバーのID'
                }
              },
              required: ['serverId'],
              additionalProperties: false
            }
          },
          {
            name: 'get_channel_list',
            description: '特定のDiscordサーバーのチャンネル一覧を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                serverId: {
                  type: 'string',
                  description: 'チャンネル一覧を取得するサーバーのID'
                },
                includeDetails: {
                  type: 'boolean',
                  description: '詳細情報（トピック、NSFW、権限など）を含めるかどうか',
                  default: false
                },
                channelType: {
                  type: 'number',
                  description: 'フィルタリングするチャンネルタイプ（0: テキスト, 2: ボイス, 4: カテゴリ）',
                  minimum: 0
                }
              },
              required: ['serverId'],
              additionalProperties: false
            }
          },
          {
            name: 'get_user_list',
            description: '特定のDiscordサーバーのユーザー一覧を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                serverId: {
                  type: 'string',
                  description: 'ユーザー一覧を取得するサーバーのID'
                },
                limit: {
                  type: 'number',
                  description: '取得する最大数（デフォルト: 100、最大: 1000）',
                  minimum: 1,
                  maximum: 1000,
                  default: 100
                },
                after: {
                  type: 'string',
                  description: 'ページネーション用のユーザーID'
                },
                includeDetails: {
                  type: 'boolean',
                  description: '詳細情報（ロール、参加日時など）を含めるかどうか',
                  default: false
                },
                roleId: {
                  type: 'string',
                  description: 'フィルタリングするロールID'
                }
              },
              required: ['serverId'],
              additionalProperties: false
            }
          },
          {
            name: 'get_channel_messages',
            description: '特定のDiscordチャンネルのメッセージ履歴を取得します',
            inputSchema: {
              type: 'object',
              properties: {
                channelId: {
                  type: 'string',
                  description: 'メッセージを取得するチャンネルのID'
                },
                limit: {
                  type: 'number',
                  description: '取得するメッセージの最大数（デフォルト: 50、最大: 100）',
                  minimum: 1,
                  maximum: 100,
                  default: 50
                },
                before: {
                  type: 'string',
                  description: '指定したメッセージIDより前のメッセージを取得'
                },
                after: {
                  type: 'string',
                  description: '指定したメッセージIDより後のメッセージを取得'
                },
                around: {
                  type: 'string',
                  description: '指定したメッセージIDの周辺のメッセージを取得'
                }
              },
              required: ['channelId'],
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
          case 'get_server_details':
            return await this.handleGetServerDetails(args);
          case 'get_channel_list':
            return await this.handleGetChannelList(args);
          case 'get_user_list':
            return await this.handleGetUserList(args);
          case 'get_channel_messages':
            return await this.handleGetChannelMessages(args);
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
   * サーバー詳細情報取得ツールのハンドラー
   */
  private async handleGetServerDetails(args: unknown) {
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
    let input: GetServerDetailsInput;
    try {
      input = GetServerDetailsInputSchema.parse(args || {});
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `無効なパラメータ: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // サーバー詳細情報を取得
    const result = await getServerDetails(this.discordClient, input);

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
   * チャンネル一覧取得ツールのハンドラー
   */
  private async handleGetChannelList(args: unknown) {
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
    let input: GetChannelListInput;
    try {
      input = GetChannelListInputSchema.parse(args || {});
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `無効なパラメータ: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // チャンネル一覧を取得
    const result = await getChannelList(this.discordClient, input);

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
   * ユーザー一覧取得ツールのハンドラー
   */
  private async handleGetUserList(args: unknown) {
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
    let input: GetUserListInput;
    try {
      input = GetUserListInputSchema.parse(args || {});
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `無効なパラメータ: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // ユーザー一覧を取得
    const result = await getUserList(this.discordClient, input);

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
   * チャンネルメッセージ取得ツールのハンドラー
   */
  private async handleGetChannelMessages(args: unknown) {
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
    let input: GetChannelMessagesInput;
    try {
      input = GetChannelMessagesInputSchema.parse(args || {});
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `無効なパラメータ: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // チャンネルメッセージを取得
    const result = await getChannelMessages(this.discordClient, input);

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
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}