# AI Clinical Consultation System

A Next.js application for managing and recording clinical consultations with AI assistance.

## Prerequisites

- Docker and Docker Compose
- Node.js 20+

## Development Setup

1. Install dependencies
```bash
npm install
```

2. Start the development environment with Docker Compose:
```bash
docker compose up -d
```

3. Run the database migrations:
```bash
a) docker compose exec dev bash
b) npx prisma migrate dev
```

4. The application will be available at http://localhost:3000

## Project Features

- Simulated consultant recordings and summary
- Add notes during consultation
- View consultation history

## Database Schema

The system uses PostgreSQL with the following main entities:
- Consultations
- Notes
- Summaries

## Development with VS Code

This project includes a devcontainer configuration for VS Code, providing:
- Consistent development environment
- Pre-configured extensions
- Automatic formatting and linting
- TypeScript support
- Tailwind CSS integration

To use:
1. Install the "Remote - Containers" extension in VS Code
2. Open the project in a container (Command Palette -> "Reopen in Container")