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

2. Create a `.env` file in the project root:
```env
PORT=8000
TOKEN="Your Discord Bot Token Here"
MONGODB_URI="Your MongoDB Connection String Here"
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