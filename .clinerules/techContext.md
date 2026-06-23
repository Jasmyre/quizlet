# Tech Context

## Technologies Used
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **Linting/Formatting**: Biome (Ultracite preset)
- **State Management**: React Context API (initial), potential adoption of Zustand
- **Testing**: Jest with React Testing Library
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Package Manager**: npm

## Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` (see `.env.example`)
4. Start development server: `npm run dev`
5. Run linting and formatting checks: `npm exec -- ultracite check` and `npm exec -- ultracite fix`

## Technical Constraints
- Windows 11 environment
- Node.js version specified in `package.json`
- Database runs locally via Docker (see `start-database.sh`)
- TypeScript strict mode enabled

## Tool Usage Patterns
- Code quality: `npm exec -- ultracite check`
- Auto-fix: `npm exec -- ultracite fix`
- Documentation updates: modify files in `.clinerules/` directory
- State management: use React hooks and Context API initially
- API routes: located in `src/app/api/` directory

## Dependencies
- Core: react, next, react-dom
- UI: tailwindcss, @tailwindcss/typography
- Utility: class-variance-authority, clsx
- Forms: react-hook-form
- Validation: yup
- Testing: jest, @testing-library/react, @testing-library/jest-dom
- Database: @prisma/client, prisma
- Auth: next-auth
- HTTP: axios
- Date formatting: date-fns