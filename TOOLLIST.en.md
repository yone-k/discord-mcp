# Discord MCP Server - Tool List

[日本語版](TOOLLIST.md)

List and detailed descriptions of tools available in Discord MCP Server.

## Available Tools

### get_server_list

Get a list of Discord servers that the bot has joined.

**Parameters:**
- `includeDetails` (boolean, optional): Whether to include detailed information (member count, online count, feature list)
  - Default: `false`

**Return Value:**
```json
{
  "servers": [
    {
      "id": "string",
      "name": "string", 
      "iconUrl": "string | null",
      "memberCount": "number (when includeDetails=true)",
      "onlineCount": "number (when includeDetails=true)",
      "features": "string[] (when includeDetails=true)"
    }
  ],
  "totalCount": "number"
}
```

**Usage Examples:**
```javascript
// Basic list retrieval
await getServerList({ includeDetails: false });

// Retrieve with detailed information
await getServerList({ includeDetails: true });
```

### get_server_details

Get detailed information about a specific Discord server.

**Parameters:**
- `serverId` (string, required): ID of the server to retrieve detailed information for

**Return Value:**
```json
{
  "server": {
    "id": "string",
    "name": "string",
    "description": "string | null",
    "iconUrl": "string | null",
    "createdAt": "string (ISO 8601)",
    "ownerId": "string",
    "region": "string",
    "afkChannelId": "string | null",
    "afkTimeout": "number",
    "memberCount": "number",
    "onlineCount": "number", 
    "boostCount": "number",
    "boostLevel": "number",
    "channelsCount": "number",
    "rolesCount": "number",
    "emojisCount": "number",
    "stickersCount": "number",
    "features": "string[]"
  }
}
```

**Usage Examples:**
```javascript
// Get detailed information for a specific server
await getServerDetails({ serverId: "123456789012345678" });
```

## Error Handling

All tools return errors in the following format:

```json
{
  "error": "Error message"
}
```

### Common Errors

- **Authentication Error**: Discord Bot token is invalid or not configured
- **Permission Error**: Bot doesn't have the required permissions
- **Server Access Error**: Specified server ID not found or bot is not a member
- **API Limit Error**: Discord API rate limit reached

## Required Permissions

To use these tools, the Discord Bot needs the following permissions:

- **View Server Info**: Required for retrieving server list and basic information
- **Bot Scope**: Required for joining Discord servers

## Configuration

Before using the tools, the following configuration is required:

1. **Discord Bot Token**: Set in the `DISCORD_TOKEN` environment variable
2. **MCP Configuration**: Configuration in Claude Desktop or other MCP clients

For detailed configuration instructions, see [README.md](README.md).