# ShelfLife — Backend API Service

This is the Node.js + Express + MongoDB backend service for the ShelfLife Library Management System.

## Architecture & Technology
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js (v5)
- **Database:** MongoDB via Mongoose (v9) with automatic in-memory fallback
- **Security:** JSON Web Tokens (JWT) for librarian authentication
- **Logging:** Morgan request logging middleware
- **Input Validation:** Centralized payload validation with HTTP 400 Bad Request responses
- **Error Handling:** Centralized error-handling middleware preventing stack trace leakage

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Default configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shelflife
JWT_SECRET=shelflife_super_secret_jwt_key_2026_exam
LIBRARIAN_EMAIL=librarian@example.com
LIBRARIAN_PASSWORD=change_me
NODE_ENV=development
```

### 3. Seed Sample Data
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Run Verification Suite
```bash
node test-backend.js
```

## Routes Overview

### Core IA2 Required Endpoints
- `POST /api/books`: Add new book (Protected)
- `GET /api/books`: List books with `?page=1&limit=10&genre=Fiction`
- `POST /api/members`: Register new member (Protected)
- `POST /api/borrow`: Issue book with atomic inventory decrement (Protected)
- `POST /api/return/:borrowId`: Return book and increment inventory (Protected)
- `GET /api/members/:id/history`: Member borrowing history with dynamic overdue reconciliation

### Authentication Endpoint
- `POST /api/auth/login`: Librarian authentication and JWT generation

### Supporting Endpoints
- `GET /api/members`: List all members (for Issue Book selector and DataTable<Member>)
- `GET /api/health`: Health status

