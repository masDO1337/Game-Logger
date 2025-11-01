# Discord Bot

A simple, configurable Discord bot project. This README covers setup, configuration, usage, development and deployment notes.

## Features
- Modular command handler
- Slash command support
- Permission checks and basic logging
- Environment-driven configuration

## Requirements
- Node.js 18+ (or update to desired runtime)
- npm or yarn
- A Discord application and bot token

## Quick Start

1. Clone the repository and install dependencies:
```bash
git clone <repo-url>
cd <project-root>
npm install
```

2. Create a `.env` file in the project root:
```env
DISCORD_TOKEN=your-bot-token
CLIENT_ID=your-application-client-id
GUILD_ID=optional-test-guild-id
NODE_ENV=development
PREFIX=!
```

3. Run the bot:
```bash
npm start
# or in development
npm run dev
```

## Configuration
- DISCORD_TOKEN: Bot token from the Discord Developer Portal.
- CLIENT_ID: Application client ID (used for registering slash commands).
- GUILD_ID: (Optional) Test guild ID for rapid command registration.
- PREFIX: Command prefix for legacy/message commands.

## Commands
- /help or !help — list commands
- /ping or !ping — latency check
- /info or !info — bot info

(Add additional commands in the commands/ or src/commands directory following the project structure.)

## Development
- Linting:
```bash
npm run lint
```
- Tests (if present):
```bash
npm test
```

## Deployment
- Use a process manager (pm2) or containerize (Docker) for production.
- Make sure to keep DISCORD_TOKEN secret and rotate if leaked.

## Contributing
- Follow existing code style.
- Open issues and submit PRs with clear descriptions and tests when applicable.

## License
Specify a license in LICENSE file (e.g., MIT).