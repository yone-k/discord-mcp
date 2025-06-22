import { 
  CallToolRequestSchema, 
  ErrorCode, 
  McpError 
} from '@modelcontextprotocol/sdk/types.js';
import { DiscordClient } from '../discord/client.js';

// 各ツールのハンドラー関数をインポート
import { 
  getServerList, 
  GetServerListInputSchema, 
  GetServerListInput 
} from '../tools/get-server-list.js';
import {
  getServerDetails,
  GetServerDetailsInputSchema,
  GetServerDetailsInput
} from '../tools/get-server-details.js';
import {
  getChannelList,
  GetChannelListInputSchema,
  GetChannelListInput
} from '../tools/get-channel-list.js';
import {
  getUserList,
  GetUserListInputSchema,
  GetUserListInput
} from '../tools/get-user-list.js';
import {
  getChannelMessages,
  GetChannelMessagesInputSchema,
  GetChannelMessagesInput
} from '../tools/get-channel-messages.js';
import {
  getMessage,
  GetMessageInputSchema,
  GetMessageInput
} from '../tools/get-message.js';
import {
  getPinnedMessages,
  GetPinnedMessagesInputSchema,
  GetPinnedMessagesInput
} from '../tools/get-pinned-messages.js';
import {
  getGuildRoles,
  GetGuildRolesInputSchema,
  GetGuildRolesInput
} from '../tools/get-guild-roles.js';
import {
  getMemberRoles,
  GetMemberRolesInputSchema,
  GetMemberRolesInput
} from '../tools/get-member-roles.js';

/**
 * ツールハンドラーの共通クラス
 */
export class ToolHandler {
  private discordClient: DiscordClient | null = null;

  /**
   * Discord クライアントを初期化（遅延初期化）
   */
  private async ensureDiscordClient(): Promise<DiscordClient> {
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
    return this.discordClient;
  }

  /**
   * 入力パラメータの検証とパース
   */
  private validateAndParseInput<T>(
    args: unknown,
    schema: any,
    toolName: string
  ): T {
    try {
      return schema.parse(args || {});
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `${toolName}の無効なパラメータ: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * ツール実行結果を標準形式に変換
   */
  private formatResponse(result: any) {
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
   * ツールを実行
   */
  async executeTool(name: string, args: unknown) {
    const client = await this.ensureDiscordClient();

    switch (name) {
      case 'get_server_list': {
        const input = this.validateAndParseInput<GetServerListInput>(
          args, GetServerListInputSchema, 'get_server_list'
        );
        const result = await getServerList(client, input);
        return this.formatResponse(result);
      }

      case 'get_server_details': {
        const input = this.validateAndParseInput<GetServerDetailsInput>(
          args, GetServerDetailsInputSchema, 'get_server_details'
        );
        const result = await getServerDetails(client, input);
        return this.formatResponse(result);
      }

      case 'get_channel_list': {
        const input = this.validateAndParseInput<GetChannelListInput>(
          args, GetChannelListInputSchema, 'get_channel_list'
        );
        const result = await getChannelList(client, input);
        return this.formatResponse(result);
      }

      case 'get_user_list': {
        const input = this.validateAndParseInput<GetUserListInput>(
          args, GetUserListInputSchema, 'get_user_list'
        );
        const result = await getUserList(client, input);
        return this.formatResponse(result);
      }

      case 'get_channel_messages': {
        const input = this.validateAndParseInput<GetChannelMessagesInput>(
          args, GetChannelMessagesInputSchema, 'get_channel_messages'
        );
        const result = await getChannelMessages(client, input);
        return this.formatResponse(result);
      }

      case 'get_message': {
        const input = this.validateAndParseInput<GetMessageInput>(
          args, GetMessageInputSchema, 'get_message'
        );
        const result = await getMessage(client, input);
        return this.formatResponse(result);
      }

      case 'get_pinned_messages': {
        const input = this.validateAndParseInput<GetPinnedMessagesInput>(
          args, GetPinnedMessagesInputSchema, 'get_pinned_messages'
        );
        const result = await getPinnedMessages(client, input);
        return this.formatResponse(result);
      }

      case 'get_guild_roles': {
        const input = this.validateAndParseInput<GetGuildRolesInput>(
          args, GetGuildRolesInputSchema, 'get_guild_roles'
        );
        const result = await getGuildRoles(client, input);
        return this.formatResponse(result);
      }

      case 'get_member_roles': {
        const input = this.validateAndParseInput<GetMemberRolesInput>(
          args, GetMemberRolesInputSchema, 'get_member_roles'
        );
        const result = await getMemberRoles(client, input);
        return this.formatResponse(result);
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `不明なツール: ${name}`
        );
    }
  }
}