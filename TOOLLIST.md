# Discord MCP Server - ツール一覧

[English Version](TOOLLIST.en.md)

Discord MCP Serverで利用可能なツールの概要です。

## 利用可能なツール

### get_server_list

Botが参加しているDiscordサーバーの一覧を取得します。

- サーバーID、名前、アイコンURLを取得
- オプションでメンバー数やオンライン数も取得可能

### get_server_details

特定のDiscordサーバーの詳細情報を取得します。

- 作成日、オーナー、地域などの基本情報
- メンバー数、チャンネル数、ロール数などの統計情報
- ブーストレベルや機能一覧

### get_channel_list

特定のDiscordサーバーのチャンネル一覧を取得します。

- テキスト、ボイス、カテゴリなど全てのチャンネルを取得
- チャンネルタイプでフィルタリング可能
- オプションでトピック、NSFW、権限情報も取得可能

### get_user_list

特定のDiscordサーバーのユーザー一覧を取得します。

- サーバーメンバー一覧をページネーション付きで取得
- ロールIDでフィルタリング可能
- オプションでロール、参加日時、ブースト情報も取得可能

## 設定について

ツールを使用するには以下が必要です：

- **Discord Bot Token**: 環境変数 `DISCORD_TOKEN` に設定
- **MCP設定**: Claude Desktopなどのクライアントで設定

詳細な設定方法は[README.md](README.md)を参照してください。