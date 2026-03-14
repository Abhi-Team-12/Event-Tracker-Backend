# 🚀 Mini Event Tracker — Backend (NestJS)

Welcome to the backend engine of the **Mini Event Tracker**. This is a robust, scalable API built with **NestJS**, designed to handle everything from user authentication to complex event management and administrative controls.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [NestJS](https://nestjs.com/) (Node.js framework for scalable server-side apps)
- **Database**: **MySQL** with **TypeORM** (Object-Relational Mapping)
- **Auth**: **JWT** (JSON Web Tokens) + **Passport.js**
- **Validation**: `class-validator` & `class-transformer`
- **Documentation**: **Swagger UI** (OpenAPI)
- **Mailing**: `@nestjs-modules/mailer` with SMTP integration

The project follows a modular architecture, where each feature (Auth, Users, Events, Admin) is encapsulated in its own module for better maintainability.

---

## 📦 Key Modules

- **`AuthModule`**: Handles registration, login (email/password), OTP verification, and password resets.
- **`UsersModule`**: Manages user profiles and basic account data.
- **`EventsModule`**: The core of the app. Handles CRUD for events, filtering (upcoming/past), and public access via unique links.
- **`AdminModule`**: High-level controls for managing all users, viewing system logs, and handling user inquiries.
- **`Entities`**: Centralized TypeORM entities for `User`, `Event`, `OTPLog`, `LoginLog`, and `Inquiry`.

---

## 🚀 Getting Started

### 1. Requirements
Ensure you have **Node.js** (v18+) and **MySQL** installed.

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and configure the following:
```env
PORT=5400
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=yourpassword
DB_NAME=mini_event_tracker
JWT_SECRET=your_super_secret_key
# SSL Config (Optional)
SSL_ACTIVE=false 
```

### 4. Running the App
```bash
# Development (watch mode)
npm run start:dev

# Production
npm run start:prod
```

### 5. API Documentation
Once the server is running, you can access the Swagger docs at:
👉 `http://localhost:5400/api_documents`
*(Note: Access might be restricted by Basic Auth as configured in `main.ts`)*

---

## 🏗️ Folder Structure (src/)

- `main.ts`: Entry point where the app is bootstrapped and global middlewares / Swagger are configured.
- `app.module.ts`: Root module importing all feature-specific modules and global configs (DB, JWT, Mailer).
- `common/`: Reusable decorators, guards, and interceptors.
- `entities/`: Database schema definitions using TypeORM.

---

## 🔒 Security Features
- **CORS** enabled for frontend integration.
- **JWT Guards** for protected routes.
- **Role-based Access Control (RBAC)**: Distinguishes between standard `user` and `admin` roles.
- **Input Sanitization**: Global `ValidationPipe` ensures all incoming data is cleaned and validated.

---

## 📜 License
This project is licensed under the MIT License.
