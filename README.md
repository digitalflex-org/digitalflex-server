# DigitalFlex Backend

This repository contains the backend implementation for the DigitalFlex project. It provides APIs and services to support the application's functionality.

## Features

- Modular, layered architecture (controllers, services, models, middlewares, utils)
- RESTful API endpoints for authentication, applicants, users, onboarding, blog, and more
- JWT-based authentication and role-based authorization
- Error handling and logging with custom error classes
- Environment-based configuration
- Applicant activity monitoring and automated deactivation
- Integration with Redis for caching/session management
- Email notifications and pagination utilities

## Project Structure

``` bash
root-dir/
│
├── dist/                # Compiled JS output
├── node_modules/        # Installed dependencies
├── logs/                # Log files 0:logging to system 1:logging to service
├── .env                 # Environment variables
├── .gitignore           # Git ignore rules
├── package.json         # NPM package manifest
├── tsconfig.json        # TypeScript config
└── src/                 # Source code,
    ├── bin/              # main entry file and others,
    ├── controllers/     # Route controllers (auth, applicants, users, etc.)
    ├── services/        # Business logic (auth, applicants, users,blogs etc.)
    ├── middlewares/     # Auth, permissions, error handling
    ├── models/          # Database schemas
    ├── utils/           # Helpers, logger, error classes, validators, mailer, pagination
    ├── config/          # Environment/config management
    ├── jobs/            # Scheduled jobs
    ├── routes/          # Routes base definitions
    ├── workers/         # Worker scripts and services
    ├── test.ts          
    └── server.ts
```

## Prerequisites

- Node.js (v22 recommended)
- npm
- A running MongoDB instance
- Redis for session/caching

## Configuration

1. Create a `.env` file in the root directory.
2. Add the required environment variables, for example:

    ``` bash
    PORT=5000
    MONGODB_URI=mongodb://dbUrl/dbName
    JWT_SECRET=your_jwt_secret
    REDIS_URL=redis://redis-url
    ```

## Running the Application

- Start the development server:

  ```bash
  npm run dev
  ```

- Build for production:

  ```bash
  npm run build
  ```

- Start the production server:

  ```bash
  npm start
  ```

## Testing

Run the test suite:

```bash
npm test
```

## API Overview

- **Authentication:** `/api/auth/*`
- **Applicants:** `/api/applicants/*`
- **Users:** `/api/users/*`
- **Blog:** `/api/blog/*`
- **Onboarding:** `/api/onboarding/*`
- **CRM:** `/api/crm/*`
- **Others:** `/api/others/*` (public)

See the source code in `src/controllers/` and `src/routes/` for detailed endpoint information.

**DigitalFlex Backend**  
