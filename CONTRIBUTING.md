# Contributing to TimeTrack

Thank you for your interest in contributing to TimeTrack! This document outlines the process for development and contribution.

## Development Setup

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Copy `.env.example` to `.env.local` and fill in the required values
4. Run the development server with `pnpm dev`

## Code Quality Tools

This project uses several tools to ensure code quality:

- **ESLint**: For code quality and style enforcement
- **Prettier**: For consistent code formatting
- **TypeScript**: For type checking
- **Husky**: For Git hooks
- **lint-staged**: For running linters on staged files only
- **commitlint**: For enforcing commit message conventions

### Linting and Formatting

- Format code: `pnpm format`
- Check formatting: `pnpm format:check`
- Run linting: `pnpm lint`
- Fix linting issues: `pnpm lint:fix`

## Git Workflow

1. Create a branch for your feature or bugfix
2. Make your changes
3. Run linting and formatting checks
4. Commit your changes using conventional commit messages
5. Push your branch and create a pull request

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types include: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Example: `feat(clients): add client creation form`

## Known Issues and How to Fix Them

The codebase currently has some warnings that need to be addressed:

### 1. Unused Variables (`@typescript-eslint/no-unused-vars`)

Remove or use the defined variables. For React components, you can prefix unused variables with underscore:

```tsx
// Before
const { data, error } = useSomeHook();

// After (if error is unused)
const { data, _error } = useSomeHook();
// Or simply remove it
const { data } = useSomeHook();
```

### 2. Any Type Usage (`@typescript-eslint/no-explicit-any`)

Replace `any` types with more specific types:

```tsx
// Before
function processData(data: any) { ... }

// After
interface DataType {
  id: string;
  name: string;
  // ...other properties
}

function processData(data: DataType) { ... }
```

### 3. Unescaped Entities (`react/no-unescaped-entities`)

Replace characters like `'` and `"` in JSX with their HTML entities:

```tsx
// Before
<p>Don't forget to check the user's settings</p>

// After
<p>Don&apos;t forget to check the user&apos;s settings</p>
```

## Pull Request Process

1. Ensure your code passes all lint and type checks
2. Update documentation if necessary
3. Verify that your changes do not break existing functionality
4. Request a review from one of the maintainers

Thank you for contributing to TimeTrack!
