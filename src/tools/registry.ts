import { ToolDefinition } from '../types/mcp.js';

// 各ツールから定義をインポート
import { toolDefinition as getServerList } from './get-server-list.js';
import { toolDefinition as getServerDetails } from './get-server-details.js';
import { toolDefinition as getChannelList } from './get-channel-list.js';
import { toolDefinition as getUserList } from './get-user-list.js';
import { toolDefinition as getChannelMessages } from './get-channel-messages.js';
import { toolDefinition as getMessage } from './get-message.js';
import { toolDefinition as getPinnedMessages } from './get-pinned-messages.js';
import { toolDefinition as getGuildRoles } from './get-guild-roles.js';
import { toolDefinition as getMemberRoles } from './get-member-roles.js';

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
  getMemberRoles
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