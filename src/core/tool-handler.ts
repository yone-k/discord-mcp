import { 
  ErrorCode, 
  McpError 
} from '@modelcontextprotocol/sdk/types.js';
import { DiscordClient } from '../discord/client.js';

// 各ツールのハンドラー関数をインポート
import { 
  getServerList, 
  GetServerListInputSchema, 
  GetServerListInput 
} from '../tools/servers/get-server-list.js';
import {
  getServerDetails,
  GetServerDetailsInputSchema,
  GetServerDetailsInput
} from '../tools/servers/get-server-details.js';
import {
  getChannelList,
  GetChannelListInputSchema,
  GetChannelListInput
} from '../tools/channels/get-channel-list.js';
import {
  getUserList,
  GetUserListInputSchema,
  GetUserListInput
} from '../tools/users/get-user-list.js';
import {
  getChannelMessages,
  GetChannelMessagesInputSchema,
  GetChannelMessagesInput
} from '../tools/channels/get-channel-messages.js';
import {
  getMessage,
  GetMessageInputSchema,
  GetMessageInput
} from '../tools/messages/get-message.js';
import {
  getPinnedMessages,
  GetPinnedMessagesInputSchema,
  GetPinnedMessagesInput
} from '../tools/channels/get-pinned-messages.js';
import {
  getGuildRoles,
  GetGuildRolesInputSchema,
  GetGuildRolesInput
} from '../tools/roles/get-guild-roles.js';
import {
  getMemberRoles,
  GetMemberRolesInputSchema,
  GetMemberRolesInput
} from '../tools/roles/get-member-roles.js';
import {
  getVoiceRegions,
  GetVoiceRegionsInputSchema,
  GetVoiceRegionsInput
} from '../tools/voice/get-voice-regions.js';
import {
  getGuildInvites,
  GetGuildInvitesInputSchema,
  GetGuildInvitesInput
} from '../tools/invites/get-guild-invites.js';
import {
  getChannelInvites,
  GetChannelInvitesInputSchema,
  GetChannelInvitesInput
} from '../tools/invites/get-channel-invites.js';
import {
  getGuildWebhooks,
  GetGuildWebhooksInputSchema,
  GetGuildWebhooksInput
} from '../tools/webhooks/get-guild-webhooks.js';
import {
  getChannelWebhooks,
  GetChannelWebhooksInputSchema,
  GetChannelWebhooksInput
} from '../tools/webhooks/get-channel-webhooks.js';
import {
  sendMessage,
  SendMessageInputSchema,
  SendMessageInput
} from '../tools/messages/send-message.js';
import {
  sendFile,
  SendFileInputSchema,
  SendFileInput
} from '../tools/messages/send-file.js';
import {
  editMessage,
  EditMessageInputSchema,
  EditMessageInput
} from '../tools/messages/edit-message.js';
import {
  deleteMessage,
  DeleteMessageInputSchema,
  DeleteMessageInput
} from '../tools/messages/delete-message.js';

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

      case 'get_voice_regions': {
        const input = this.validateAndParseInput<GetVoiceRegionsInput>(
          args, GetVoiceRegionsInputSchema, 'get_voice_regions'
        );
        const result = await getVoiceRegions(client, input);
        return this.formatResponse(result);
      }


      case 'get_guild_invites': {
        const input = this.validateAndParseInput<GetGuildInvitesInput>(
          args, GetGuildInvitesInputSchema, 'get_guild_invites'
        );
        const result = await getGuildInvites(client, input);
        return this.formatResponse(result);
      }

      case 'get_channel_invites': {
        const input = this.validateAndParseInput<GetChannelInvitesInput>(
          args, GetChannelInvitesInputSchema, 'get_channel_invites'
        );
        const result = await getChannelInvites(client, input);
        return this.formatResponse(result);
      }

      case 'get_guild_webhooks': {
        const input = this.validateAndParseInput<GetGuildWebhooksInput>(
          args, GetGuildWebhooksInputSchema, 'get_guild_webhooks'
        );
        const result = await getGuildWebhooks(client, input);
        return this.formatResponse(result);
      }

      case 'get_channel_webhooks': {
        const input = this.validateAndParseInput<GetChannelWebhooksInput>(
          args, GetChannelWebhooksInputSchema, 'get_channel_webhooks'
        );
        const result = await getChannelWebhooks(client, input);
        return this.formatResponse(result);
      }

      case 'send_message': {
        const input = this.validateAndParseInput<SendMessageInput>(
          args, SendMessageInputSchema, 'send_message'
        );
        const result = await sendMessage(client, input);
        return this.formatResponse(result);
      }

      case 'send_file': {
        const input = this.validateAndParseInput<SendFileInput>(
          args, SendFileInputSchema, 'send_file'
        );
        const result = await sendFile(client, input);
        return this.formatResponse(result);
      }

      case 'edit_message': {
        const input = this.validateAndParseInput<EditMessageInput>(
          args, EditMessageInputSchema, 'edit_message'
        );
        const result = await editMessage(client, input);
        return this.formatResponse(result);
      }

      case 'delete_message': {
        const input = this.validateAndParseInput<DeleteMessageInput>(
          args, DeleteMessageInputSchema, 'delete_message'
        );
        const result = await deleteMessage(client, input);
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