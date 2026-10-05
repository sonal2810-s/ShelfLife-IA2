# ShelfLife — Library Management System

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.0-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://mongoosejs.com/)
[![React](https://img.shields.io/badge/React-v19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5+-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-v6-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)

ShelfLife is a modern, full-stack college library management platform designed for librarians and administrative staff to manage **books**, **members**, and **borrowing records**. It was built strictly according to the **IA2 Full-Stack Web Development Exam Specification (50 Marks)**:

- **GitHub Repository:** [https://github.com/sonal2810-s/ShelfLife-IA2](https://github.com/sonal2810-s/ShelfLife-IA2)
- **Q1 — Backend (20 Marks):** Node.js + Express + MongoDB Atlas + Mongoose + JWT + Morgan
- **Q2 — Frontend (20 Marks):** React + TypeScript + Vite + Tailwind CSS + Generic Components
- **Q3 — System Design (10 Marks):** Scalable Multi-Campus Architecture (500 campuses, 2M members, 10× traffic spikes)

---

## 🌐 Public Hosting & Deployment Information

| Layer | Platform | Deployment URL | Configuration Details |
| :--- | :--- | :--- | :--- |
| **GitHub Repo** | GitHub | [sonal2810-s/ShelfLife-IA2](https://github.com/sonal2810-s/ShelfLife-IA2) | `main` branch, full source code (no `.env`/secrets) |
| **Frontend Web App** | Vercel | *Deploy via Vercel* | React 19 + TypeScript build (`VITE_API_URL`) |
| **Backend REST API** | Render | *Deploy via Render* | Node.js + Express (`MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`) |
| **Database** | MongoDB Atlas | Cluster `myapp.moyhdqc.mongodb.net` | MongoDB Cloud Atlas database (`shelflife`) |

---

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Assumptions](#assumptions)
5. [Backend Setup & Execution](#backend-setup--execution)
6. [Frontend Setup & Execution](#frontend-setup--execution)
7. [Environment Variables](#environment-variables)
8. [API Endpoints Documentation](#api-endpoints-documentation)
9. [Sample Requests (cURL)](#sample-requests-curl)
10. [Race Condition Prevention Explanation](#race-condition-prevention-explanation)
11. [System Design & Scalability Summary (Q3)](#system-design--scalability-summary-q3)

---

## Features

### Q1 — Backend Core
- **Mongoose Schemas & Invariant Validation:**
  - `Book`: Required title, author, ISBN (unique), genre, `totalCopies >= 1`, and `0 <= availableCopies <= totalCopies`.
  - `Member`: Required name, valid email (unique), membership ID (unique), and auto-assigned joined date.
  - `BorrowRecord`: References to Book and Member, issue date, 14-day due date, return date, and enum status (`issued`, `returned`, `overdue`).
- **RESTful Endpoints:**
  - `POST /api/books`: Add books with ISBN duplicate protection (Librarian protected).
  - `GET /api/books`: List books with pagination (`page`, `limit`) and genre filtering (`genre`).
  - `POST /api/members`: Register members with email and membership ID duplicate protection (Librarian protected).
  - `POST /api/borrow`: Concurrency-safe atomic book loan issuance.
  - `POST /api/return/:borrowId`: Return book, prevent double returns, increment inventory.
  - `GET /api/members/:id/history`: Chronological member borrowing history with dynamic overdue reconciliation.
- **Security & Middleware:**
  - JWT Authentication for librarian protected write operations (`Bearer <token>`).
  - Morgan HTTP request logging with timestamps and response latency.
  - Centralized error handling returning uniform `{ success: false, message: "..." }`.
  - Automatic dev fallback to `mongodb-memory-server` if local MongoDB is not running.

### Q2 — Frontend Core
- **Strictly Typed React + TypeScript (Vite):**
  - Explicit TypeScript interfaces for all data models and API responses (no unnecessary `any`).
  - Dedicated typed API client with Axios and JWT request interceptors.
- **Admin Dashboard Pages:**
  - `/login`: Clean librarian authentication with credential validation.
  - `/books`: Catalog table with client/server search by title, dropdown filter by genre, pagination, availability badge, and "Add Book" modal.
  - `/issue`: Loan creation form with member and book dropdown selectors showing real-time copy counts and loading states (no browser `alert()`).
  - `/members/:id/history`: Member borrowing history ledger with **visually distinct OVERDUE badges** and instant one-click book returns.
  - `/members`: Member directory with search and member registration.
- **Generic TypeScript Component:**
  - `DataTable<T>`: Reusable across both `Book` and `Member` data models with custom column renderers.
- **State Management Rationale:**
  - Local React state (`useState`) handles page-specific data and forms.
  - React Context (`AuthContext`) manages token persistence and authentication across protected routes, avoiding unnecessary global state complexity (like Redux).

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Node.js (v20+), Express.js (v5), MongoDB, Mongoose (v9), JSON Web Tokens (JWT), Morgan, CORS, Dotenv, Mongodb-Memory-Server |
| **Frontend** | React (v19), TypeScript (v5.8), Vite (v6), React Router (v7), Axios, Tailwind CSS (v4), Lucide React Icons |
| **Design Docs** | Mermaid.js, Markdown Specifications |

---

## Folder Structure

```text
ShelfLife/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection & dev in-memory fallback
│   │   ├── controllers/
│   │   │   ├── authController.js     # Librarian login & JWT generation
│   │   │   ├── bookController.js     # Book creation & paginated list
│   │   │   ├── memberController.js   # Member creation, list & borrow history
│   │   │   └── borrowController.js   # Issue & return endpoints
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT Bearer token & librarian role check
│   │   │   ├── validationMiddleware.js # Input validation (400 Bad Request)
│   │   │   └── errorMiddleware.js    # Global error & 404 handler
│   │   ├── models/
│   │   │   ├── Book.js               # Book Mongoose schema & invariants
│   │   │   ├── Member.js             # Member Mongoose schema & validation
│   │   │   └── BorrowRecord.js       # BorrowRecord schema & status enum
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── bookRoutes.js
│   │   │   ├── memberRoutes.js
│   │   │   └── borrowRoutes.js
│   │   ├── services/
│   │   │   └── borrowService.js      # Atomic conditional updates & rollbacks
│   │   ├── utils/
│   │   │   └── seed.js               # Realistic sample database seeder
│   │   ├── app.js                    # Express app configuration & middleware
│   │   └── server.js                 # Server entrypoint & graceful shutdown
│   ├── test-backend.js               # Automated 10-point backend verification
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts             # Axios instance & JWT interceptor
│   │   │   ├── auth.ts               # Auth login API call
│   │   │   ├── books.ts              # Books CRUD & pagination queries
│   │   │   ├── members.ts            # Members CRUD & history queries
│   │   │   └── borrow.ts             # Issue & return API calls
│   │   ├── components/
│   │   │   ├── DataTable.tsx         # Generic typed table component <DataTable<T>>
│   │   │   ├── ProtectedRoute.tsx    # Auth guard redirecting to /login
│   │   │   ├── Navbar.tsx            # Top header navigation & librarian info
│   │   │   └── Layout.tsx            # Dashboard shell layout
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # Auth provider & state persistence
│   │   ├── pages/
│   │   │   ├── Login.tsx             # Librarian login page
│   │   │   ├── Books.tsx             # Catalog with search & genre filter
│   │   │   ├── IssueBook.tsx         # Issue form with real-time stock
│   │   │   ├── Members.tsx           # Members directory & registration
│   │   │   └── MemberHistory.tsx     # Borrow history with OVERDUE badges
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces (Book, Member, etc.)
│   │   ├── utils/
│   │   │   └── formatters.ts         # Date formatters & overdue helper
│   │   ├── App.tsx                   # Routing configuration
│   │   ├── main.tsx                  # React DOM root entry
│   │   └── index.css                 # Tailwind CSS directives
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
├── docs/
│   ├── system-design.md              # Complete Q3 architecture document
│   └── architecture-diagram.md       # Mermaid architecture & sequence diagrams
│
└── README.md                         # Project documentation
```

---

## Assumptions

1. **User Role Boundaries:** Write operations (`POST /api/books`, `POST /api/members`, `POST /api/borrow`, `POST /api/return/:borrowId`) require authenticated librarian credentials. Catalog browsing and member history can be accessed publicly or within the librarian portal.
2. **Standard Loan Duration:** All books are issued for a fixed duration of **14 calendar days**.
3. **Overdue Condition:** An active borrowing record is overdue if and only if `returnDate === null` and `dueDate < currentTimestamp`.
4. **Return Idempotency:** A record marked as `returned` cannot be returned again, preventing double-increment of available inventory.
5. **Single Item per Loan Record:** One `BorrowRecord` maps exactly one book copy to one member.

---

## Backend Setup & Execution

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
A `.env` file is generated automatically from `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shelflife
JWT_SECRET=shelflife_super_secret_jwt_key_2026_exam
LIBRARIAN_EMAIL=librarian@example.com
LIBRARIAN_PASSWORD=change_me
NODE_ENV=development
```
*(Note: If local MongoDB is not running on port 27017, the backend automatically boots an in-memory MongoDB instance so the app runs out-of-the-box!)*

### 3. Seed Sample Data (Optional)
```bash
npm run seed
```

### 4. Run Backend Server
```bash
npm run dev
# or
npm start
```
Server starts on `http://localhost:5000`.

### 5. Run Automated Backend Verification
```bash
node test-backend.js
```
Runs a 10-point test suite covering login, token protection, book creation, pagination, genre filtering, member registration, atomic loan issuance, history fetching, and duplicate return rejection.

---

## Frontend Setup & Execution

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Ensure `frontend/.env` points to the backend API:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Production Build Test
```bash
npm run build
```

---

## Environment Variables

### Backend (`backend/.env`)
- `PORT`: HTTP server port (Default: `5000`)
- `MONGODB_URI`: MongoDB connection string (Default: `mongodb://localhost:27017/shelflife`)
- `JWT_SECRET`: Secret key used for signing and verifying JWTs
- `LIBRARIAN_EMAIL`: Login email for librarian (Default: `librarian@example.com`)
- `LIBRARIAN_PASSWORD`: Login password for librarian (Default: `change_me`)
- `NODE_ENV`: Runtime environment (`development` / `production`)

### Frontend (`frontend/.env`)
- `VITE_API_URL`: Base URL for Express backend API (Default: `http://localhost:5000/api`)

---

## API Endpoints Documentation

### Core IA2 Required Endpoints (6 Endpoints)
These six endpoints constitute the core API specification required by the IA2 examination:

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/books` | Librarian (Protected) | Adds a new book to the catalog (validates unique ISBN) |
| `GET` | `/api/books` | Public | Lists books with pagination (`page`, `limit`) and genre filtering (`genre`) |
| `POST` | `/api/members` | Librarian (Protected) | Registers a new library member (validates email & membership ID) |
| `POST` | `/api/borrow` | Librarian (Protected) | Issues a book atomically with race-condition prevention |
| `POST` | `/api/return/:borrowId` | Librarian (Protected) | Returns an issued book, marks status 'returned', and restores copy |
| `GET` | `/api/members/:id/history` | Public | Retrieves complete borrowing history for a member with dynamic overdue checks |

### Authentication Endpoint
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates librarian with credentials and issues 24-hour JWT |

### Additional Supporting Endpoints
These endpoints support frontend UI usability without altering the required core API contracts:

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/members` | Public | Returns registered members list for the Issue Book selector and `<DataTable<Member> />` |
| `GET` | `/api/health` | Public | Health check / uptime verification |

---

## Sample Requests (cURL)

### 1. Librarian Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "librarian@example.com",
    "password": "change_me"
  }'
```

### 2. Add Book (Protected)
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "title": "Clean Architecture",
    "author": "Robert C. Martin",
    "ISBN": "978-0134494166",
    "genre": "Computer Science",
    "totalCopies": 5,
    "availableCopies": 5
  }'
```

### 3. Get Books (Pagination & Genre Filtering)
```bash
curl -X GET "http://localhost:5000/api/books?genre=Computer%20Science&page=1&limit=5"
```

### 4. Register Member (Protected)
```bash
curl -X POST http://localhost:5000/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "name": "Pooja Hegde",
    "email": "pooja.hegde@college.edu",
    "membershipId": "MEM-2026-101"
  }'
```

### 5. Issue Book (Protected — Concurrency Safe)
```bash
curl -X POST http://localhost:5000/api/borrow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "bookId": "<BOOK_OBJECT_ID>",
    "memberId": "<MEMBER_OBJECT_ID>"
  }'
```

### 6. Return Book (Protected)
```bash
curl -X POST http://localhost:5000/api/return/<BORROW_OBJECT_ID> \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 7. Get Member Borrow History
```bash
curl -X GET http://localhost:5000/api/members/<MEMBER_OBJECT_ID>/history
```

---

## Race Condition Prevention Explanation

### 4–6 Line Explanation (Direct IA2 Exam Requirement)
> In concurrent environments, traditional check-then-act logic (reading `availableCopies`, verifying `> 0`, then decrementing) permits two simultaneous requests to read `availableCopies = 1`, causing negative inventory. ShelfLife prevents this using an atomic MongoDB operation: `findOneAndUpdate` with condition `{ availableCopies: { $gt: 0 } }` and update `{ $inc: { availableCopies: -1 } }`. MongoDB's document-level write lock ensures only one request succeeds; the second finds 0 copies, returns `null`, and is safely rejected.

---

## System Design & Scalability Summary (Q3)

For the complete technical specification and diagrams, see:
- [`docs/system-design.md`](docs/system-design.md)
- [`docs/architecture-diagram.md`](docs/architecture-diagram.md)

### Key Architectural Highlights
1. **Scale Requirements:** 500 campus libraries, 2,000,000 members, and 10× traffic spikes during semester-start weeks.
2. **Tiered Topology:** Client (React SPA) &rarr; Cloud CDN &rarr; Load Balancer &rarr; Stateless Express API Cluster &rarr; Redis Cache & Sharded MongoDB Cluster &rarr; Asynchronous Message Queue & Workers.
3. **MongoDB Shard Keys:**
   - `Book`: `{ libraryId: 1, ISBN: 1 }` (Campus tenant isolation prevents cross-shard queries; ISBN ensures even chunk cardinality).
   - `BorrowRecord`: `{ libraryId: 1, member: 1, issueDate: -1 }` (Ensures member loan histories remain co-located on a single shard).
4. **Redis Caching Strategy:**
   - Target: `GET /api/books` catalog queries.
   - Key: `books:{libraryId}:{genre}:{page}:{limit}` with 2-minute TTL.
   - Invalidation: Real-time eviction upon book issue, return, or catalog addition.
5. **Handling 10× Traffic Spikes:**
   - Stateless Express API auto-scales horizontally based on CPU/RAM thresholds.
   - Redis caching offloads up to 90% of book catalog read requests.
   - Database connection pooling and compound indexes prevent database socket exhaustion.
