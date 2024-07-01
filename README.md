# Node.js API with Express, Sequelize, PostgreSQL, and JWT Authentication

This project is a Node.js API built with Express and Sequelize, using PostgreSQL as the database. It includes user authentication with JWT and middleware to protect routes.

## Features

- User registration and login
- JWT authentication
- Middleware for protecting routes
- Sequelize ORM for database interactions
- PostgreSQL database

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- PostgreSQL

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/yourproject.git
   cd yourproject
2. Install Dependecies
    npm install
   
3. Create a .env file in the root of your project and add your database and JWT configurations

  DB_USER=your_db_user
  DB_PASS=your_db_password
  DB_NAME=your_db_name
  DB_HOST=your_db_host
  JWT_SECRET=your_jwt_secret
  NODE_ENV=development
  PORT=3000

4. Initialize Sequelize:

   npx sequelize-cli init

 
