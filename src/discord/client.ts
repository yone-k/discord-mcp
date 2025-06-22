import axios, { AxiosInstance, AxiosError } from 'axios';
import { DiscordGuild, DiscordApiError, DiscordBotUser, DiscordGuildDetailed, DiscordChannel, DiscordGuildMember, DiscordMessage, DiscordRole, DiscordVoiceRegion, DiscordInvite, DiscordWebhook } from '../types/discord.js';

/**
 * Discord REST API クライアント
 */
export class DiscordClient {
  private readonly http: AxiosInstance;
  private readonly baseURL = 'https://discord.com/api/v10';

  constructor(private readonly token: string) {
    this.http = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bot ${this.token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'discord-mcp/1.0.0'
      },
      timeout: 10000
    });
  }

  /**
   * ボットが参加しているサーバー一覧を取得
   */
  async getGuilds(): Promise<DiscordGuild[]> {
    try {
      const response = await this.http.get('/users/@me/guilds');
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * ボットの情報を取得
   */
  async getBotUser(): Promise<DiscordBotUser> {
    try {
      const response = await this.http.get('/users/@me');
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * 特定のサーバーの詳細情報を取得
   */
  async getGuildDetails(guildId: string): Promise<DiscordGuildDetailed> {
    try {
      const [guildResponse, channelsResponse, rolesResponse] = await Promise.all([
        this.http.get(`/guilds/${guildId}?with_counts=true`),
        this.http.get(`/guilds/${guildId}/channels`),
        this.http.get(`/guilds/${guildId}/roles`)
      ]);

      const guild = guildResponse.data;
      const channels = channelsResponse.data;
      const roles = rolesResponse.data;

      return {
        ...guild,
        created_at: new Date(parseInt(guildId) / 4194304 + 1420070400000).toISOString(),
        channels_count: channels.length,
        roles_count: roles.length,
        emojis_count: guild.emojis ? guild.emojis.length : 0,
        stickers_count: guild.stickers ? guild.stickers.length : 0
      };
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * 特定のサーバーのチャンネル一覧を取得
   */
  async getGuildChannels(guildId: string): Promise<DiscordChannel[]> {
    try {
      const response = await this.http.get(`/guilds/${guildId}/channels`);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * 特定のサーバーのメンバー一覧を取得
   */
  async getGuildMembers(guildId: string, options?: {
    limit?: number;
    after?: string;
  }): Promise<DiscordGuildMember[]> {
    try {
      const params = new URLSearchParams();
      if (options?.limit) {
        params.append('limit', Math.min(options.limit, 1000).toString());
      }
      if (options?.after) {
        params.append('after', options.after);
      }

      const response = await this.http.get(`/guilds/${guildId}/members?${params.toString()}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * 特定のチャンネルのメッセージ一覧を取得
   */
  async getChannelMessages(channelId: string, options?: {
    limit?: number;
    before?: string;
    after?: string;
    around?: string;
  }): Promise<DiscordMessage[]> {
    try {
      const params = new URLSearchParams();
      if (options?.limit) {
        params.append('limit', Math.min(options.limit, 100).toString());
      }
      if (options?.before) {
        params.append('before', options.before);
      }
      if (options?.after) {
        params.append('after', options.after);
      }
      if (options?.around) {
        params.append('around', options.around);
      }

      const response = await this.http.get(`/channels/${channelId}/messages?${params.toString()}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * 特定のメッセージの詳細を取得
   */
  async getMessage(channelId: string, messageId: string): Promise<DiscordMessage> {
    try {
      const response = await this.http.get(`/channels/${channelId}/messages/${messageId}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * 特定のサーバーのロール一覧を取得
   */
  async getGuildRoles(guildId: string): Promise<DiscordRole[]> {
    try {
      const response = await this.http.get(`/guilds/${guildId}/roles`);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * 特定のチャンネルのピン留めメッセージ一覧を取得
   */
  async getPinnedMessages(channelId: string): Promise<DiscordMessage[]> {
    try {
      const response = await this.http.get(`/channels/${channelId}/pins`);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * 特定のサーバーの特定メンバーの詳細を取得
   */
  async getGuildMember(guildId: string, userId: string): Promise<DiscordGuildMember> {
    try {
      const response = await this.http.get(`/guilds/${guildId}/members/${userId}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * 利用可能なボイスリージョン一覧を取得
   */
  async getVoiceRegions(): Promise<DiscordVoiceRegion[]> {
    try {
      const response = await this.http.get('/voice/regions');
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }


  /**
   * 特定のサーバーの招待リンク一覧を取得
   */
  async getGuildInvites(guildId: string): Promise<DiscordInvite[]> {
    try {
      const response = await this.http.get(`/guilds/${guildId}/invites`);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * 特定のチャンネルの招待リンク一覧を取得
   */
  async getChannelInvites(channelId: string): Promise<DiscordInvite[]> {
    try {
      const response = await this.http.get(`/channels/${channelId}/invites`);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * 特定のサーバーのWebhook一覧を取得
   */
  async getGuildWebhooks(guildId: string): Promise<DiscordWebhook[]> {
    try {
      const response = await this.http.get(`/guilds/${guildId}/webhooks`);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * 特定のチャンネルのWebhook一覧を取得
   */
  async getChannelWebhooks(channelId: string): Promise<DiscordWebhook[]> {
    try {
      const response = await this.http.get(`/channels/${channelId}/webhooks`);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * API エラーハンドリング
   */
  private handleApiError(error: AxiosError): never {
    if (error.response) {
      const apiError = error.response.data as DiscordApiError;
      const status = error.response.status;
      
      switch (status) {
        case 401:
          throw new Error(`Discord API認証エラー: ${apiError.message || 'トークンが無効です'}`);
        case 403:
          throw new Error(`Discord API権限エラー: ${apiError.message || '権限が不足しています'}`);
        case 429:
          throw new Error(`Discord APIレート制限: ${apiError.message || 'リクエストが多すぎます'}`);
        case 500:
        case 502:
        case 503:
        case 504:
          throw new Error(`Discord APIサーバーエラー: ${apiError.message || 'サーバーで問題が発生しました'}`);
        default:
          throw new Error(`Discord APIエラー (${status}): ${apiError.message || '不明なエラー'}`);
      }
    } else if (error.request) {
      throw new Error('Discord APIへの接続に失敗しました。ネットワーク接続を確認してください。');
    } else {
      throw new Error(`リクエスト設定エラー: ${error.message || ''}`);
    }
  }
}