# FeedForward - Full-Stack Management Platform

A modern monorepo web application featuring a React frontend and Express backend with MySQL.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Shadcn UI, React Router, Axios
- **Backend:** Node.js, Express.js, TypeScript, Prisma ORM (MySQL), JWT Auth, Multer

## Project Structure

```
├── backend/
│   ├── prisma/           # Database schema & migrations
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/    # Auth, admin, upload middleware
│   │   ├── routes/       # API route definitions
│   │   ├── utils/        # JWT helpers
│   │   ├── index.ts      # Server entry point
│   │   └── seed.ts       # Database seeder
│   └── uploads/          # Uploaded images
├── frontend/
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── context/      # Auth context
│   │   ├── lib/          # Utilities & API client
│   │   ├── pages/        # Page components
│   │   └── types/        # TypeScript definitions
│   └── index.html
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+

### 1. Setup Database
Create a MySQL database:
```sql
CREATE DATABASE feedforward_db;
```

### 2. Configure Backend
```bash
cd backend
cp .env .env.local  # Edit with your MySQL credentials
npm install
npx prisma migrate dev --name init
npm run seed  # Creates admin user & sample departments
npm run dev   # Starts on http://localhost:5000
```

### 3. Configure Frontend
```bash
cd frontend
npm install
npm run dev   # Starts on http://localhost:5173
```

### Default Admin Credentials
- **Email:** admin@sana3alforsa.gov.eg
- **Password:** Admin@2026!

## API Endpoints


| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/signup` | Register new user (PENDING) | Public |
| POST | `/api/auth/login` | Login (returns JWT) | Public |
| GET | `/api/departments` | List all departments | Public |
| GET | `/api/admin/users/pending` | Get pending users | Admin |
| PUT | `/api/admin/users/:id/approve` | Approve user | Admin |
| PUT | `/api/admin/users/:id/reject` | Reject user | Admin |
| POST | `/api/admin/images/upload` | Upload image | Admin |
| GET | `/api/admin/images` | List images | Admin |
| DELETE | `/api/admin/images/:id` | Delete image | Admin |
| POST | `/api/admin/departments` | Create department | Admin |
| PUT | `/api/admin/departments/:id` | Update department | Admin |
| DELETE | `/api/admin/departments/:id` | Delete department | Admin |
