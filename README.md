# 🕒 TimeTrack - Time Tracking & Billing App

A full-featured time tracking and billing application built with **Next.js 14**, embracing **role-based access control** and professional UI/UX for freelancers and small teams.

---

## 🎯 **Key Features**

- ⏱️ **Time Tracking**: Track time with one-click timer functionality.
- 💼 **Client Management**: Create and manage clients with detailed profiles.
- 📊 **Project Management**: Organize work with comprehensive project tracking.
- 💰 **Invoice Generation**: Create professional invoices from tracked time.
- 📱 **Responsive Design**: Seamless experience across all devices.
- 🔒 **Role-Based Access Control**: Secure permission system with multiple user roles.

---

## 📂 **Project Structure**

```plaintext
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
├── constants/            # Application constants
├── providers/            # React context providers
└── types/                # TypeScript types
```

---

## 🛠️ **Tech Stack**

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI (built on Radix UI)
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM with SQLite (development) / PostgreSQL (production)
- **Authentication**: NextAuth.js
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: React Query, Zustand
- **Notifications**: Sonner
- **Code Quality**: ESLint, Prettier, Husky, lint-staged, Commitlint

---

## 📏 **Code Quality & Contribution Guidelines**

This project uses several tools to ensure code quality and consistency:

- **ESLint**: Enforces code quality and style rules
- **Prettier**: Ensures consistent code formatting
- **Husky**: Runs checks before commits are made
- **lint-staged**: Runs linters on staged files only
- **Commitlint**: Ensures commit messages follow conventions

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types include: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Example: `feat(clients): add client creation form`

---

## ⚙️ **Getting Started**

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Mikesh-kombee/time-tracking-app.git
   cd time-tracking-app
   ```

2. **Install Dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up Environment Variables**

   ```bash
   # Create a .env.local file in the root directory
   cp .env.example .env.local
   # Then edit .env.local with your values
   ```

4. **Set up the Database**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   npx prisma db seed
   ```

5. **Start the Development Server**
   ```bash
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

---

## 🧪 **Testing**

- Run tests:

  ```bash
  npm run test
  ```

- Run e2e tests:
  ```bash
  npm run cypress
  ```

---

## 📸 **Screenshots**

### ⏱️ Time Tracking Dashboard

View your time tracking statistics and recent activity.

<p align="center">
  <img src="screenshots/dashboard.png" alt="Dashboard" width="600"/>
</p>

### 🧾 Invoice Generation

Create professional invoices from tracked time.

<p align="center">
  <img src="screenshots/invoice.png" alt="Invoice Generation" width="600"/>
</p>

### 📊 Reporting

Generate detailed reports on time and revenue.

<p align="center">
  <img src="screenshots/reports.png" alt="Reporting" width="600"/>
</p>

---

## 🔐 **User Roles**

TimeTrack implements role-based access control with the following roles:

- **SUPER_ADMIN**: Complete system access
- **ADMIN**: Administrative access with some restrictions
- **ACCOUNTS**: Access to financial and invoice features
- **SALES**: Client and project management access
- **EMPLOYEE**: Basic time tracking access

---

## 🤝 **Contributing**

We welcome contributions! Follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature/fix.
3. Commit changes and open a **Pull Request**.

---

## 📜 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 **Company**

**Kombee Technologies**

- 🌐 [Portfolio](https://github.com/kombee-technologies)
- 💼 [LinkedIn](https://in.linkedin.com/company/kombee-global)
- 🌍 [Website](https://www.kombee.com/)

---

<p align="center">
  Built with ❤️ using Next.js
</p>

---
