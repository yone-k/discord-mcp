# Discord MCP Server - Tool List

[日本語版](TOOLLIST.md)

Overview of tools available in Discord MCP Server.

## Available Tools

### get_server_list

Get a list of Discord servers that the bot has joined.

- Retrieves server ID, name, and icon URL
- Optionally includes member count and online count

### get_server_details

Get detailed information about a specific Discord server.

- Basic information like creation date, owner, region
- Statistics including member count, channel count, role count
- Boost level and feature list

### get_channel_list

Get a list of channels from a specific Discord server.

- Retrieves all channels including text, voice, and categories
- Can filter by channel type
- Optionally includes topic, NSFW, and permission information

### get_user_list

Get a list of users from a specific Discord server.

- Retrieves server members with pagination support
- Can filter by role ID
- Optionally includes roles, join date, and boost information

### get_channel_messages

Get message history from a specific Discord channel.

- Pagination support with before/after/around parameters
- Detailed information including author, content, attachments, reactions
- Retrieve 1-100 messages per request (default: 50)

### get_message

Get detailed information about a specific Discord message.

- Requires channelId and messageId
- Comprehensive message details including author, content, attachments, reactions
- Complete details for a single message

### get_pinned_messages

Get a list of pinned messages from a specific Discord channel.

- Retrieves all pinned messages from the channel
- Includes metadata like total count and oldest/newest message IDs
- Complete message details included

### get_guild_roles

Get a list of roles from a specific Discord server.

- Filter options: adminOnly, excludeManaged
- Optional detailed information including role tags, icons, permissions
- Includes role statistics and member counts

### get_member_roles

Get roles assigned to a specific Discord server member.

- Requires guildId and userId
- Filter options: adminOnly, excludeManaged
- Includes member information plus role details and permissions analysis

### get_voice_regions

Get a list of available Discord voice regions.

- Retrieves all available voice regions
- Identifies optimal regions
- Includes information about deprecated and custom regions

### get_guild_invites

Get a list of invite links for a specific Discord server.

- Retrieves all invite links from the server
- Detailed information including inviter, usage count, expiration
- Includes target channel and server information

### get_channel_invites

Get a list of invite links for a specific Discord channel.

- Retrieves invite links for the specified channel only
- Detailed information including inviter, usage count, expiration
- Includes target channel and server information

### get_guild_webhooks

Get a list of webhooks for a specific Discord server.

- Retrieves all webhooks from the server
- Information about webhook creator, type, and URL
- Identifies follower webhooks and application webhooks

### get_channel_webhooks

Get a list of webhooks for a specific Discord channel.

- Retrieves webhooks for the specified channel only
- Information about webhook creator, type, and URL
- Identifies follower webhooks and application webhooks

### send_message

Send a message to a Discord channel.

- Send text messages (up to 2000 characters)
- TTS (text-to-speech) message support
- Embed content support (up to 10 embeds)
- Mentions and channel reference support

### send_file

Send a file to a Discord channel.

- Send Base64 encoded files (up to 8MB)
- File with message content support
- Spoiler file support
- MIME type specification available

### edit_message

Edit an existing Discord message.

- Can only edit messages sent by yourself
- Change message content (up to 2000 characters)
- Update embed content support
- Automatic edit history tracking

### delete_message

Delete a Discord message.

- Delete your own messages or messages with appropriate permissions
- Optional deletion reason (recorded in audit log)
- Records deletion timestamp
- Safe deletion processing based on permissions

## Configuration

To use these tools, you need:

- **Discord Bot Token**: Set in the `DISCORD_TOKEN` environment variable
- **MCP Configuration**: Setup in Claude Desktop or other clients

For detailed configuration instructions, see [README.md](README.md).