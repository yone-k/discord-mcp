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

## Configuration

To use these tools, you need:

- **Discord Bot Token**: Set in the `DISCORD_TOKEN` environment variable
- **MCP Configuration**: Setup in Claude Desktop or other clients

For detailed configuration instructions, see [README.md](README.md).