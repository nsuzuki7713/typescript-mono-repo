# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a package-based TypeScript monorepo with 18 packages in `/packages/` managed by pnpm workspaces. Each package has its own `package.json`, dependencies, and configuration files.

### Package Categories
- **Development Tools**: `adhocScripts`, `github-pr-analyzer`, `nodeTemplate`, `playground`
- **Competitive Programming**: `at-coder`
- **Web Applications**: `next-sample`, `nextjs-gihyo-book`, `react-sample`, `trpc-twitter-sample`
- **Backend Services**: `nest-sample`, `line-bot`, `cloudFunctions`, `gcpApi`
- **Infrastructure**: `kafka-tutorial`, `chrome-extensions`, `deno-sample`, `my-hello-lib`

## Common Development Commands

### Workspace-wide Commands (run from root)
```bash
pnpm build           # Build all packages
pnpm dev             # Start development servers for all packages
pnpm test            # Run tests for all packages
pnpm lint            # Lint all packages
pnpm lint:fix        # Auto-fix linting issues in all packages
```

### Package-specific Commands
Navigate to the specific package directory or use pnpm filtering:

```bash
cd packages/<package-name>
pnpm build           # Build current package

# Or from root using filters:
pnpm --filter <package-name> build    # Build specific package
pnpm --filter <package-name> dev      # Start dev server for specific package
pnpm --filter <package-name> test     # Run tests for specific package
```

### Legacy Commands (still work within package directories)
```bash
npm run build    # TypeScript compilation or framework-specific build
npm run dev      # Start development server (most packages)
npm start        # React apps
npm run start:dev # NestJS apps with watch mode
npm test         # Run Jest tests
npm run test:watch  # Run tests in watch mode
npm run test:cov    # Run tests with coverage
npm run test:e2e    # End-to-end tests (where available)
npm run lint        # Run ESLint
npm run lint:fix    # Run ESLint with auto-fix
```

## Common Technology Stack

- **pnpm**: Package manager with workspace support
- **TypeScript**: Primary language across all packages
- **Jest**: Testing framework with SWC for faster compilation
- **ESLint + Prettier**: Code formatting and linting (configured in VSCode settings)
- **Build Tools**: SWC, ts-node for development

## VSCode Configuration

The repository has VSCode settings configured for:
- Format on save with Prettier
- ESLint auto-fix on save
- Auto-detection of ESLint working directories

## Working with Packages

Each package maintains its own:
- Dependencies in `package.json`
- TypeScript configuration in `tsconfig.json`
- Jest configuration in `jest.config.js`

The workspace uses a single `pnpm-lock.yaml` file at the root for dependency management. When working on a specific package, you can either:
1. Navigate to the package directory and use npm/pnpm commands
2. Use pnpm filtering from the root: `pnpm --filter <package-name> <command>`

## Package Documentation

### github-pr-analyzer
A TypeScript CLI tool for engineering self-evaluation and team performance analysis through GitHub Pull Request data collection and analysis.

**Purpose**: Collects, analyzes, and reports GitHub PR activities to help engineers and teams assess contributions, productivity, and collaboration patterns.

**Key Features**:
- Individual PR data collection and analysis (created PRs, review activities, statistical summaries)
- Team analysis capabilities with multi-member batch processing
- Repository-level insights and contribution analysis
- AI-ready analysis prompts generation for performance evaluation
- Comprehensive TypeScript architecture with GraphQL GitHub API integration

**Architecture**: Service-oriented design with clients/, config/, services/, types/, and utils/ directories. Uses Commander.js for CLI, @octokit/graphql for GitHub API, and TypeScript with strict typing.

**Configuration**: Uses environment variables (.env) for GitHub token, user login, date periods, and optional repository filtering. Supports both individual and team analysis configurations.

**Commands**:
- Individual: `analyze`, `pull-requests`, `reviews`, `summary`, `repository-summary`, `generate-prompt`, `config`
- Team: `team-analyze`, `team-config`, `generate-team-prompt`

**Output**: Generates JSON files with PR details, review summaries, repository analysis, and AI-ready evaluation prompts for both individual and team assessments.