# Fremst Online Shop

**Fremst Online Shop** is a comprehensive e-commerce platform designed to streamline the process of online shopping. It offers features for managing orders, users, products, and various notifications while integrating advanced backend functionalities with tools like sockets and email templates.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup and Installation](#setup-and-installation)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Order Management**: Support for creating, updating, and managing orders with validation and custom order IDs.
- **Inventory and Product Handling**: Real-time stock and price validation via integrations with product models.
- **Employee & User Management**: Role-based capabilities (e.g., employee budget checks).
- **Notifications**: Socket-based notifications and email alerts using customizable templates.
- **Pagination Support**: Handle large datasets efficiently via reusable pagination helpers.
- **Authentication**: Secured user authentication using JWT.
- **Scalable System Architecture**: Built to handle growing workloads using a modular design.

---

## Tech Stack

- **Backend**:
    - Node.js, Express.js, TypeScript
    - MongoDB with Mongoose
- **Authentication & Security**:
    - JSON Web Token (jsonwebtoken)
    - Bcrypt for password hashing
- **Utilities**:
    - `socket.io` for real-time communication
    - `nodemailer` for email notifications
    - `zod` for data validation
- **Logging & Monitoring**:
    - Winston with daily rotate log support
    - Morgan for HTTP request logging
- **Development Tools**:
    - TypeScript for a strongly-typed coding experience
    - ESLint and Prettier for code quality and formatting

---

## Setup and Installation

1. Clone the repository:
```shell script
git clone https://github.com/yourusername/fremst-online-shop.git
   cd fremst-online-shop
```

2. Install dependencies using Yarn:
```shell script
yarn install
```

3. Create a `.env` file in the root directory and configure the required environment variables. Example:
```
PORT=3000
   MONGO_URI=mongodb://localhost:27017/fremst-online-shop
   JWT_SECRET=your_jwt_secret
   EMAIL_HOST=smtp.your-email-provider.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@example.com
   EMAIL_PASSWORD=your-email-password
```

4. Start the development server:
```shell script
yarn start:dev
```

5. To build the project for production, run:
```shell script
yarn build
```

6. For production:
```shell script
yarn start
```

---

## Available Scripts

- `yarn start`: Starts the project in production mode.
- `yarn start:dev`: Starts the project in development mode using `ts-node-dev`.
- `yarn build`: Builds the TypeScript code for production.
- `yarn lint`: Runs ESLint to check for code issues.
- `yarn format`: Formats the code base using Prettier.
- `yarn test`: Run tests (if applicable).

---

## Project Structure

```
src/
├── config/               # Configuration files (e.g., environment setup)
├── controllers/          # Controller logic for routes
├── models/               # Mongoose schema models
├── routes/               # API route definitions
├── middlewares/          # Middleware functions (e.g., authentication)
├── helpers/              # Reusable utility functions
├── interfaces/           # TypeScript interfaces and types
├── enums/                # Enum definitions
├── shared/               # Shared resources (e.g., email templates)
├── errors/               # Custom error handling classes
├── services/             # Business logic
├── tests/                # Unit and integration tests (if present)
└── app.ts                # Entry point of the application
```

---


## License

This project is licensed under the [MIT License](LICENSE).

---

Feel free to share feedback or raise any bugs/issues in the repository's issue tracker. Enjoy building with **Fremst Online Shop**! 🎉