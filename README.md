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

## Additional Notes:
- This implementation simulates the clinical consultation system. It does not include actual recording or LLM integration.

Here are some additional considerations:
- I would also need to account for the when the user's microphone is muted or completely stops working: We would need to notify the user and either ask them to troubleshoot or use a different device. Either way, the current set up relies on a working microphone.
- LLM considerations: This solution does not include any LLM use. In production, an LLM framework would need to be set up which would take into account the following:
  - Data privacy laws and regulations: For example, ensuring we use region locked APIs.
  - Rate limits: Potentially, a smart system which would monitor the rate of requests and balance the load across multiple LLM providers.
  - Cost: Could we batch requests to reduce costs?
  - Hallucinations: The choice to store the chunks of recordings in the database, allows us to validate the transcriptions after the fact. We would need to implement a system to detect and handle hallucinations. This would include a mix of human in the loop and an evaluation pipeline. As well as ensuring we get feedback from customers and use it to improve the model. Having versioned prompts with proper evaluation would be crucial.
  - Building out the template gallery. Allowing users to customise the summary outputs to their needs.