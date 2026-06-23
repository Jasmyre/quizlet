# System Patterns

## System Architecture
The application follows a modular, component-based architecture built on Next.js App Router. The system is structured into the following layers:

1. **Presentation Layer**: React components and UI primitives styled with Tailwind CSS
2. **State Management Layer**: React hooks and context for local state, with plans for Zustand or Redux Toolkit for global state
3. **Business Logic Layer**: Domain-specific logic including flashcard engine, spaced repetition algorithms, and quiz engine
4. **Data Access Layer**: API routes and database interactions for persisting flashcard sets and user progress
5. **Integration Layer**: External services for authentication, cloud sync, and analytics

## Key Technical Decisions
- **Framework**: Next.js 14+ with App Router for file-based routing and server components
- **Language**: TypeScript 5.x for type safety and developer experience
- **Styling**: Tailwind CSS 3.x with utility-first approach and custom theme configuration
- **State**: React hooks and Context API initially, with potential adoption of Zustand for more complex state
- **Testing**: Jest with React Testing Library for unit and integration tests
- **Linting/Formatting**: Biome for code quality, linting, and formatting enforcement
- **Database**: PostgreSQL with Prisma ORM for type-safe data access
- **Authentication**: NextAuth.js for authentication and authorization

## Design Patterns
- **Component Composition**: Small, focused components that compose into larger UI elements
- **Custom Hooks**: Encapsulate reusable logic (e.g., `useFlashcardEngine`, `useLocalStorage`)
- **Higher-Order Components**: Limited use; prefer composition over inheritance
- **Render Props**: Used selectively for shared UI logic
- **Feature Flags**: Implementation planned for gradual feature rollout
- **Error Boundaries**: Implemented for critical UI sections to prevent crashes

## Critical Implementation Paths
1. **Flashcard Creation Flow**: 
   - UI form → State management → API route → Database storage
2. **Spaced Repetition Scheduling**:
   - Algorithm module → Review queue management → UI rendering
3. **Study Session Engine**:
   - Session state management → Question rendering → Answer validation → Progress tracking
4. **Cloud Sync**:
   - Local state → Sync service → Remote database → Conflict resolution

## Integration Points
- **Authentication**: Integration with NextAuth.js for user management
- **External Data Sources**: Import/export functionality for Quizlet sets
- **Analytics**: Event tracking for user interactions and progress
- **Cloud Services**: Potential integration with Vercel for deployment and serverless functions