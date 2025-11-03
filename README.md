# Game Logger

A simple Discord bot project. This README covers setup, configuration, usage and development notes.

## Requirements
- Node.js 18+ (or update to desired runtime)
- npm or yarn
- A Discord application and bot token
- MongoDB

### MongoDB

Add MongoDB for storing bot data (logs, user/game state). Provide the database URI via the MONGODB_URI environment variable and keep credentials out of source control.

- Recommended hosts:
    - MongoDB Atlas for production (managed, automated backups, monitoring).
    - Local mongod or a Docker container for development/testing.

- Quick local Docker (example):
```bash
docker run -d --name mongo -p 27017:27017 mongo:6.0
```

## Quick Start

1. Clone the repository and install dependencies:
```bash
git clone <repo-url>
cd <project-root>
npm install
```

### Generating ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET

Use long, cryptographically secure random values (minimum 32 bytes / 256 bits for access tokens; 48–64+ bytes recommended for refresh tokens). Do not hard-code or commit them — store them in env vars or a secrets manager.

Examples:

- Node.js:
```bash
# ACCESS
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# REFRESH
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

- Password manager or secret store (recommended for production):
Use a vault or secret manager (AWS Secrets Manager, Azure Key Vault, Google Secret Manager, 1Password, Bitwarden) to generate and inject secrets into your deployment.

Notes:
- Keep ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET different.
- Rotate secrets periodically and revoke/refresh tokens if secrets change.

2. Create a `.env` file in the project root:
```env
PORT=8000
TOKEN="Your Discord Bot Token Here"
MONGODB_URI="Your MongoDB Connection String Here"
ACCESS_TOKEN_SECRET="Enter your access token secret here"
REFRESH_TOKEN_SECRET="Enter your refresh token secret here"
LOAD_BOT_EVENTS=true
```

3. Run the bot:
```bash
npm start
# or in development
npm run dev
```

## Contributing
- Follow existing code style.
- Open issues and submit PRs with clear descriptions and tests when applicable.

## License
Specify a license in LICENSE file (e.g., MIT).