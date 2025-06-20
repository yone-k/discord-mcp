# Discord MCP Server

[日本語README](README.md)

Discord API MCP (Model Context Protocol) Server - TypeScript implementation for integrating Discord functionality with MCP-compatible clients.

## Features

- TypeScript implementation with Zod validation
- Docker support for easy deployment
- MCP protocol compliance
- Discord API integration (coming soon)

## Requirements

- Docker
- Docker Compose (optional)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/discord-mcp.git
cd discord-mcp

# Build Docker image
docker build -t discord-mcp .
```

## MCP Configuration

### Claude Desktop

1. Edit Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the following configuration:

#### Using Docker (Recommended)

```json
{
  "mcpServers": {
    "discord-mcp": {
      "command": "docker",
      "args": [
        "run", 
        "--rm", 
        "-e", "DISCORD_TOKEN=your_discord_bot_token",
        "discord-mcp"
      ]
    }
  }
}
```

#### Using Local Build

```json
{
  "mcpServers": {
    "discord-mcp": {
      "command": "node",
      "args": ["/path/to/discord-mcp/dist/index.js"],
      "env": {
        "DISCORD_TOKEN": "your_discord_bot_token"
      }
    }
  }
}
```

#### Development Environment Configuration

```json
{
  "mcpServers": {
    "discord-mcp-dev": {
      "command": "npx",
      "args": ["ts-node", "/path/to/discord-mcp/src/index.ts"],
      "cwd": "/path/to/discord-mcp",
      "env": {
        "DISCORD_TOKEN": "your_discord_bot_token",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

### Other MCP Clients

You can use it from any MCP client that supports stdio connection:

```bash
# Direct execution with Docker
docker run --rm -e DISCORD_TOKEN=your_discord_bot_token discord-mcp
```

## Usage

### Docker (Recommended)

```bash
# Basic execution
docker run --rm -e DISCORD_TOKEN=your_discord_bot_token discord-mcp

# Using Docker Compose
docker-compose up --build
```

### Development Environment (For local development)

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev
```

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start the production server
- `npm run dev` - Start in development mode with ts-node
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
discord-mcp/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript output
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Configuration Guide

### Discord Bot Setup

1. Visit [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new Application
3. Get Bot token from the Bot tab
4. Set permissions in OAuth2 → URL Generator:
   - `bot` scope
   - `Send Messages` permission
   - `Read Message History` permission
5. Invite to Discord server using the generated URL

### Environment Variables

```bash
# Set Discord Bot token
export DISCORD_TOKEN="your_discord_bot_token_here"

# Set log level (optional)
export LOG_LEVEL="info"  # debug, info, warn, error
```

### Configuration Verification Commands

```bash
# Check Claude Desktop configuration file (macOS)
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Validate JSON format
python -m json.tool ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Check Docker image
docker images | grep discord-mcp
```

## Troubleshooting

### Common Issues

**Docker startup error**: 
- Verify Docker daemon is running
- Check if image was built correctly: `docker images | grep discord-mcp`

**Discord API authentication error**:
- Verify DISCORD_TOKEN is set correctly
- Check Bot token permission scope
- Verify token is valid in Discord Developer Portal

**MCP connection error**:
- Check Claude Desktop configuration file format (JSON syntax errors)
- Verify file paths are set correctly
- Confirm stdio protocol connection works properly

**Not recognized by Claude Desktop**:
- Restart Claude Desktop
- Verify configuration file path is correct
- Check if command is executable: `which docker` or `which node`

## Support

For issues and questions, please open an issue on GitHub.