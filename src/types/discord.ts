/**
 * Discord API 関連の型定義
 */

export interface DiscordGuild {
  /** サーバーのID */
  id: string;
  /** サーバー名 */
  name: string;
  /** サーバーのアイコンハッシュ */
  icon: string | null;
  /** サーバーの説明 */
  description: string | null;
  /** メンバー数の概算 */
  approximate_member_count?: number;
  /** オンラインメンバー数の概算 */
  approximate_presence_count?: number;
  /** サーバーの権限 */
  permissions?: string;
  /** サーバーの機能 */
  features: string[];
}

export interface DiscordApiError {
  /** エラーメッセージ */
  message: string;
  /** エラーコード */
  code: number;
}

export interface DiscordBotUser {
  /** ボットのユーザーID */
  id: string;
  /** ボットのユーザー名 */
  username: string;
  /** ボットの識別子 */
  discriminator: string;
  /** ボットのアバターハッシュ */
  avatar: string | null;
  /** ボットかどうか */
  bot: boolean;
}

export interface DiscordGuildDetailed extends DiscordGuild {
  /** サーバーの作成日時 */
  created_at: string;
  /** サーバーのオーナーID */
  owner_id: string;
  /** サーバーの地域 */
  region?: string;
  /** AFKチャンネルID */
  afk_channel_id: string | null;
  /** AFKタイムアウト（秒） */
  afk_timeout: number;
  /** サーバーのブースト数 */
  premium_subscription_count?: number;
  /** サーバーのブーストレベル */
  premium_tier: number;
  /** チャンネル数 */
  channels_count?: number;
  /** 役職数 */
  roles_count?: number;
  /** 絵文字数 */
  emojis_count?: number;
  /** スタンプ数 */
  stickers_count?: number;
}

export interface DiscordChannel {
  /** チャンネルID */
  id: string;
  /** チャンネル名 */
  name: string;
  /** チャンネルタイプ（0: テキスト, 2: ボイス, 4: カテゴリ など） */
  type: number;
  /** チャンネルの位置 */
  position: number;
  /** サーバーID */
  guild_id: string;
  /** チャンネルの説明（トピック） */
  topic?: string | null;
  /** NSFWかどうか */
  nsfw?: boolean;
  /** 親カテゴリのID */
  parent_id?: string | null;
  /** 権限上書き設定 */
  permission_overwrites?: DiscordPermissionOverwrite[];
}

export interface DiscordPermissionOverwrite {
  /** 対象のID（ユーザーまたはロール） */
  id: string;
  /** 対象のタイプ（0: ロール, 1: ユーザー） */
  type: number;
  /** 許可する権限 */
  allow: string;
  /** 拒否する権限 */
  deny: string;
}

export interface DiscordGuildMember {
  /** ユーザー情報 */
  user?: DiscordUser;
  /** ニックネーム */
  nick?: string | null;
  /** アバターハッシュ */
  avatar?: string | null;
  /** ロールID一覧 */
  roles: string[];
  /** サーバー参加日時 */
  joined_at: string;
  /** ブースト開始日時 */
  premium_since?: string | null;
  /** 聴覚障害があるかどうか */
  deaf: boolean;
  /** ミュートされているかどうか */
  mute: boolean;
  /** フラグ */
  flags: number;
  /** タイムアウトされるまでの時間 */
  communication_disabled_until?: string | null;
}

export interface DiscordUser {
  /** ユーザーID */
  id: string;
  /** ユーザー名 */
  username: string;
  /** ディスクリミネーター */
  discriminator: string;
  /** グローバル名 */
  global_name?: string | null;
  /** アバターハッシュ */
  avatar: string | null;
  /** ボットかどうか */
  bot?: boolean;
  /** システムユーザーかどうか */
  system?: boolean;
  /** 二要素認証が有効かどうか */
  mfa_enabled?: boolean;
  /** バナーハッシュ */
  banner?: string | null;
  /** アクセントカラー */
  accent_color?: number | null;
  /** ローカル */
  locale?: string;
  /** 確認済みかどうか */
  verified?: boolean;
  /** メールアドレス */
  email?: string | null;
  /** フラグ */
  flags?: number;
  /** プレミアムタイプ */
  premium_type?: number;
  /** 公開フラグ */
  public_flags?: number;
}