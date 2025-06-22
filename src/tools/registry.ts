import { ToolDefinition } from '../types/mcp.js';

// 各ツールから定義をインポート
import { toolDefinition as getServerList } from './servers/get-server-list.js';
import { toolDefinition as getServerDetails } from './servers/get-server-details.js';
import { toolDefinition as getChannelList } from './channels/get-channel-list.js';
import { toolDefinition as getUserList } from './users/get-user-list.js';
import { toolDefinition as getChannelMessages } from './channels/get-channel-messages.js';
import { toolDefinition as getMessage } from './messages/get-message.js';
import { toolDefinition as getPinnedMessages } from './channels/get-pinned-messages.js';
import { toolDefinition as getGuildRoles } from './roles/get-guild-roles.js';
import { toolDefinition as getMemberRoles } from './roles/get-member-roles.js';
import { toolDefinition as getVoiceRegions } from './voice/get-voice-regions.js';
import { toolDefinition as getGuildInvites } from './invites/get-guild-invites.js';
import { toolDefinition as getChannelInvites } from './invites/get-channel-invites.js';
import { toolDefinition as getGuildWebhooks } from './webhooks/get-guild-webhooks.js';
import { toolDefinition as getChannelWebhooks } from './webhooks/get-channel-webhooks.js';
import { toolDefinition as sendMessage } from './messages/send-message.js';
import { toolDefinition as sendFile } from './messages/send-file.js';
import { toolDefinition as editMessage } from './messages/edit-message.js';
import { toolDefinition as deleteMessage } from './messages/delete-message.js';

/**
 * 登録されたツール定義の一覧
 */
export const registeredTools: ToolDefinition[] = [
  getServerList,
  getServerDetails,
  getChannelList,
  getUserList,
  getChannelMessages,
  getMessage,
  getPinnedMessages,
  getGuildRoles,
  getMemberRoles,
  getVoiceRegions,
  getGuildInvites,
  getChannelInvites,
  getGuildWebhooks,
  getChannelWebhooks,
  sendMessage,
  sendFile,
  editMessage,
  deleteMessage
];

/**
 * ツール名からツール定義を取得
 */
export function getToolByName(name: string): ToolDefinition | undefined {
  return registeredTools.find(tool => tool.name === name);
}

/**
 * 全ツール名の一覧を取得
 */
export function getAllToolNames(): string[] {
  return registeredTools.map(tool => tool.name);
}

/**
 * ツールレジストリの統計情報を取得
 */
export function getRegistryStats() {
  return {
    totalTools: registeredTools.length,
    toolNames: getAllToolNames()
  };
}