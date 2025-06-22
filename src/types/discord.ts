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

export interface DiscordMessage {
  /** メッセージID */
  id: string;
  /** チャンネルID */
  channel_id: string;
  /** サーバーID */
  guild_id?: string;
  /** 送信者情報 */
  author: DiscordUser;
  /** メンバー情報 */
  member?: DiscordGuildMember;
  /** メッセージ内容 */
  content: string;
  /** 送信日時 */
  timestamp: string;
  /** 編集日時 */
  edited_timestamp?: string | null;
  /** TTS（読み上げ）かどうか */
  tts: boolean;
  /** @everyone または @here が含まれるか */
  mention_everyone: boolean;
  /** メンション対象ユーザー一覧 */
  mentions: DiscordUser[];
  /** メンション対象ロール一覧 */
  mention_roles: string[];
  /** 添付ファイル一覧 */
  attachments: DiscordAttachment[];
  /** 埋め込みコンテンツ一覧 */
  embeds: DiscordEmbed[];
  /** リアクション一覧 */
  reactions?: DiscordReaction[];
  /** メッセージタイプ */
  type: number;
  /** メッセージフラグ */
  flags?: number;
  /** ピン留めされているか */
  pinned: boolean;
  /** Webhook ID */
  webhook_id?: string;
}

export interface DiscordAttachment {
  /** 添付ファイルID */
  id: string;
  /** ファイル名 */
  filename: string;
  /** ファイルサイズ（バイト） */
  size: number;
  /** ファイルURL */
  url: string;
  /** プロキシURL */
  proxy_url: string;
  /** 画像の高さ */
  height?: number | null;
  /** 画像の幅 */
  width?: number | null;
}

export interface DiscordEmbed {
  /** タイトル */
  title?: string;
  /** タイプ */
  type?: string;
  /** 説明 */
  description?: string;
  /** URL */
  url?: string;
  /** タイムスタンプ */
  timestamp?: string;
  /** カラー */
  color?: number;
  /** フッター */
  footer?: {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  /** 画像 */
  image?: {
    url?: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  };
  /** サムネイル */
  thumbnail?: {
    url?: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  };
  /** 作成者 */
  author?: {
    name?: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  /** フィールド一覧 */
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
}

export interface DiscordReaction {
  /** リアクション数 */
  count: number;
  /** 自分がリアクションしたか */
  me: boolean;
  /** 絵文字情報 */
  emoji: {
    id?: string | null;
    name?: string | null;
    animated?: boolean;
  };
}

export interface DiscordRole {
  /** ロールID */
  id: string;
  /** ロール名 */
  name: string;
  /** ロールの色 */
  color: number;
  /** ホイスト（別表示）されるか */
  hoist: boolean;
  /** アイコンハッシュ */
  icon?: string | null;
  /** Unicode絵文字 */
  unicode_emoji?: string | null;
  /** 表示順序の位置 */
  position: number;
  /** ロールの権限 */
  permissions: string;
  /** 管理者権限を持つか */
  managed: boolean;
  /** メンション可能か */
  mentionable: boolean;
  /** ロールタグ */
  tags?: {
    /** ボットID（ボット専用ロールの場合） */
    bot_id?: string;
    /** 統合ID（統合ロールの場合） */
    integration_id?: string;
    /** プレミアムサブスクライバー専用か */
    premium_subscriber?: null;
    /** ギルドコネクション専用か */
    guild_connections?: null;
    /** 利用可能な購入フラグ */
    available_for_purchase?: null;
  };
}

export interface DiscordVoiceRegion {
  /** ボイスリージョンID */
  id: string;
  /** ボイスリージョン名 */
  name: string;
  /** 最適化されているか */
  optimal: boolean;
  /** 非推奨か */
  deprecated: boolean;
  /** カスタムか */
  custom: boolean;
}

export interface DiscordVoiceState {
  /** サーバーID */
  guild_id?: string;
  /** チャンネルID */
  channel_id: string | null;
  /** ユーザーID */
  user_id: string;
  /** ユーザー情報 */
  member?: DiscordGuildMember;
  /** セッションID */
  session_id: string;
  /** 聴覚障害があるかどうか */
  deaf: boolean;
  /** ミュートされているかどうか */
  mute: boolean;
  /** 自分で聴覚障害にしているか */
  self_deaf: boolean;
  /** 自分でミュートしているか */
  self_mute: boolean;
  /** ストリーミングしているか */
  self_stream?: boolean;
  /** ビデオを有効にしているか */
  self_video: boolean;
  /** マイクを抑制しているか */
  suppress: boolean;
  /** リクエスト発言時刻 */
  request_to_speak_timestamp: string | null;
}

export interface DiscordInvite {
  /** 招待コード */
  code: string;
  /** サーバー情報 */
  guild?: {
    id: string;
    name: string;
    icon?: string | null;
    description?: string | null;
    splash?: string | null;
    discovery_splash?: string | null;
    features: string[];
    verification_level: number;
    vanity_url_code?: string | null;
    nsfw_level: number;
    premium_subscription_count?: number;
  };
  /** チャンネル情報 */
  channel: {
    id: string;
    name: string;
    type: number;
  };
  /** 招待者情報 */
  inviter?: DiscordUser;
  /** 対象ユーザー */
  target_user?: DiscordUser;
  /** 対象アプリケーション */
  target_application?: {
    id: string;
    name: string;
    icon?: string | null;
    description: string;
  };
  /** 近似メンバー数 */
  approximate_member_count?: number;
  /** 近似オンラインメンバー数 */
  approximate_presence_count?: number;
  /** 有効期限日時 */
  expires_at?: string | null;
  /** ステージインスタンス */
  stage_instance?: {
    members: DiscordGuildMember[];
    participant_count: number;
    speaker_count: number;
    topic: string;
  };
  /** 招待タイプ */
  type: number;
  /** 使用回数 */
  uses?: number;
  /** 最大使用回数 */
  max_uses?: number;
  /** 最大有効期間（秒） */
  max_age?: number;
  /** 一時的メンバーシップか */
  temporary?: boolean;
  /** 作成日時 */
  created_at?: string;
}

export interface DiscordWebhook {
  /** WebhookのID */
  id: string;
  /** Webhookのタイプ */
  type: number;
  /** サーバーID */
  guild_id?: string;
  /** チャンネルID */
  channel_id: string | null;
  /** ユーザー情報（作成者） */
  user?: DiscordUser;
  /** Webhookの名前 */
  name: string | null;
  /** Webhookのアバター */
  avatar: string | null;
  /** Webhookのトークン */
  token?: string;
  /** アプリケーションID */
  application_id: string | null;
  /** ソースサーバー */
  source_guild?: {
    id: string;
    name: string;
    icon: string | null;
  };
  /** ソースチャンネル */
  source_channel?: {
    id: string;
    name: string;
  };
  /** WebhookのURL */
  url?: string;
}