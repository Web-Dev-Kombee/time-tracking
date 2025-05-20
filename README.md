# TimeTrack - Time Tracking & Billing App

A full-featured time tracking and billing application built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

## Features

- **Authentication**

  - Next-Auth integration with Credentials and Google OAuth support
  - User registration and login
  - Protected routes

- **Client Management**

  - Create, view, update, and delete clients
  - Client details page with related projects

- **Project Management**

  - Create and manage projects for clients
  - Project details with statistics
  - Project status tracking

- **Time Tracking**

  - Create time entries for projects
  - Start/stop timer functionality
  - View and manage time entries
  - Calculate total hours worked

- **Coming Soon**
  - Expense tracking
  - Invoice generation
  - Task management
  - Reports and analytics

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI (built on Radix UI)
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM with SQLite (development) / PostgreSQL (production)
- **Authentication**: NextAuth.js
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: React Query, Zustand
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository

```
git clone https://github.com/yourusername/time-tracking-app.git
cd time-tracking-app
```

2. Install dependencies

```
npm install
# or
pnpm install
```

3. Set up environment variables

```
# Create a .env.local file in the root directory
cp .env.example .env.local
# Then edit .env.local with your values
```

4. Set up the database

```
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

5. Start the development server

```
npm run dev
# or
pnpm dev
```

### Default Login Credentials

- **Admin User**:

  - Email: admin@example.com
  - Password: password123

- **Regular User**:
  - Email: user@example.com
  - Password: password123

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Auth routes (login, register)
│   ├── (dashboard)/      # Protected dashboard routes
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── forms/            # Form components
│   └── ui/               # UI components (Shadcn UI)
├── lib/                  # Utility functions, libs
│   ├── auth.ts           # Auth configuration
│   ├── prisma.ts         # Prisma client instance
│   └── utils.ts          # Utility functions
└── types/                # TypeScript types
    ├── index.ts          # Type exports
    └── schemas.ts        # Zod schemas
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
