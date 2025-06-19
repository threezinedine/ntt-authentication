# NTT Authentication Service

A robust authentication service built with Node.js, Express, and MySQL, providing secure user authentication and role-based access control.

## Features

-   User registration and login
-   JWT-based authentication with access and refresh tokens
-   Role-based access control (User, Admin, Super Admin)
-   Token verification and refresh endpoints
-   Secure password hashing
-   MySQL database integration
-   Docker support for easy deployment

## Prerequisites

-   Node.js (v14 or higher)
-   MySQL (v8.0 or higher)
-   Docker and Docker Compose (for containerized deployment)

## Project Structure

```
service/
├── src/
│   ├── app.ts              # Express application setup
│   ├── config.ts           # Configuration management
│   ├── main.ts            # Application entry point
│   ├── data/              # Constants and enums
│   ├── middlewares/       # Authentication and request validation
│   ├── models/            # Data models
│   ├── routes/            # API route handlers
│   ├── schemas/           # Request validation schemas
│   ├── services/          # Core services implementation
│   └── utils/             # Utility functions
```

## API Endpoints

### Authentication

-   `POST /api/auth/register` - Register a new user
-   `POST /api/auth/login` - User login
-   `POST /api/auth/verify` - Verify authentication token
-   `POST /api/auth/refresh` - Refresh access token
-   `PUT /api/auth/move-to-admin` - Promote user to admin (Super Admin only)

## Environment Variables

Create a `.env` file in the service directory with the following variables:

```env
# Server Configuration
HOST=localhost
PORT=8080
MODE=development

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=database

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRES_IN=15
REFRESH_TOKEN_EXPIRES_IN=43200

# Super Admin Configuration
SUPER_ADMIN_USERNAME=super_admin
SUPER_ADMIN_PASSWORD=super_admin_password
```

## Installation and Setup

### Local Development

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/ntt-authentication.git
    cd ntt-authentication/service
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create and configure the `.env` file as shown above

4. Start the development server:

    ```bash
    npm run dev # run server in development mode
    npm run start # run server in production mode
    ```

5. Run tests:
    ```bash
    npm run test # run test once
    npm run test:watch # run test in watch mode
    ```

### Docker Deployment

1. Make sure Docker and Docker Compose are installed

2. Create a `.deploy.env` file in the service directory with your production configuration

3. Build and start the containers:
    ```bash
    docker-compose up --build
    ```

## Security Features

-   JWT-based authentication with separate access and refresh tokens
-   Secure password hashing using modern cryptographic algorithms
-   Role-based access control with three levels: User, Admin, and Super Admin
-   Request validation and sanitization
-   Environment-based configuration management

## Development

-   Run tests: `npm run test`
-   Run tests in watch mode: `npm run test:watch`
-   Run server in production mode: `npm run start`
-   Run server: `npm run dev`

## License

This project is licensed under the terms specified in the LICENSE file.

## Author

Contact me at the email [threezinedine@gmail.com](mailto:threezinedine@gmail.com)
