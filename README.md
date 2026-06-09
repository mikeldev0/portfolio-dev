<p align="center">
  <img src="./public/favicon.svg" width="96" height="96" alt="MikelDev logo" />
</p>

# Mikel Echeverria Portfolio

[![Astro](https://img.shields.io/badge/Astro-5.18-ff5d01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react&logoColor=111)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![pnpm](https://img.shields.io/badge/pnpm-required-f69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io)

Personal portfolio for **Mikel Echeverria**, a Backend & Full Stack Engineer focused on API architecture, scalable systems, intelligent automation, and practical product delivery.

[Live site](https://www.mikeldev.com) • [GitHub](https://github.com/mikeldev0) • [LinkedIn](https://www.linkedin.com/in/mikel-echeverria) • [Email](mailto:mikel@mikeldev.com)

![Portfolio preview](./public/photo.webp)

## Overview

This repository contains a fast, static Astro portfolio designed to communicate professional experience, selected projects, availability, and contact paths without unnecessary marketing noise.

The site is built as a personal credibility asset: recruiters, technical leads, teams, and freelance clients should be able to scan what Mikel does, what he has built, and how to contact him quickly.

## Features

- **Astro static site** with React islands only where interactivity is needed.
- **Responsive portfolio sections** for hero, experience, projects, about, and footer content.
- **Internationalization** through local JSON dictionaries for English, Spanish, French, German, and Italian.
- **Theme controls** with light/dark mode support.
- **Scroll-linked profile avatar** with reduced-motion fallback.
- **Optional GitHub pinned projects** fetched from the GitHub GraphQL API when credentials are provided.
- **Seasonal holiday effects** that respect reduced-motion preferences.
- **Prettier, Astro check, Husky, lint-staged, and Commitlint** for consistent local workflow.

> [!NOTE]
> The site works without GitHub API credentials. If no token is configured, it falls back to the curated static project list in `src/components/Projects.astro`.

## Tech Stack

| Area            | Tools                                                 |
| --------------- | ----------------------------------------------------- |
| Framework       | Astro 5                                               |
| UI              | Astro components, React islands, Tailwind CSS         |
| Motion          | Framer Motion, CSS transitions                        |
| Language        | TypeScript                                            |
| Package manager | pnpm                                                  |
| Quality         | Astro check, Prettier, Husky, lint-staged, Commitlint |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 20 or later
- [pnpm](https://pnpm.io/installation)
- Git

### Local Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/mikeldev0/portfolio-dev.git
cd portfolio-dev
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open `http://localhost:4321` in your browser.

> [!TIP]
> If Vite reports an outdated optimized dependency during development, restart the server with `pnpm dev --force` to rebuild the local dependency cache.

## Environment Variables

Create a `.env` file in the project root when you need optional runtime configuration:

```bash
VITE_ENABLE_HOLIDAY_EFFECTS=true
GITHUB_TOKEN=github_pat_or_token
GITHUB_URL=https://api.github.com/graphql
```

| Variable                      | Required | Description                                                                          |
| ----------------------------- | -------- | ------------------------------------------------------------------------------------ |
| `VITE_ENABLE_HOLIDAY_EFFECTS` | No       | Set to `false` to disable seasonal snow and holiday avatar effects.                  |
| `GITHUB_TOKEN`                | No       | Enables fetching pinned GitHub repositories for the projects section.                |
| `GITHUB_URL`                  | No       | GraphQL endpoint used with `GITHUB_TOKEN`. Usually `https://api.github.com/graphql`. |

Holiday effects are only displayed from December 1 to January 7 and are disabled automatically when the visitor prefers reduced motion.

## Project Structure

```text
.
├── public/                 Static assets, locale files, favicon, profile image
├── src/
│   ├── components/         Astro and React UI components
│   ├── icons/              Local Astro icon components
│   ├── layouts/            Shared document layout and SEO metadata
│   ├── lib/                Environment and holiday helpers
│   └── pages/              Astro routes
├── PRODUCT.md              Product and design context for the portfolio
├── astro.config.mjs        Astro, React, Tailwind, and Vite configuration
└── package.json            Scripts, dependencies, and local hooks
```

## Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Start the Astro development server.          |
| `pnpm build`        | Run `astro check` and build the static site. |
| `pnpm preview`      | Preview the production build locally.        |
| `pnpm format`       | Format the codebase with Prettier.           |
| `pnpm format:check` | Check formatting without writing changes.    |
| `pnpm check`        | Run Astro diagnostics.                       |

## Quality Workflow

Local hooks are configured through Husky:

- `pre-commit` runs `pnpm lint-staged` and formats staged files.
- `commit-msg` enforces Conventional Commits.
- `pre-push` runs `pnpm build`.

Before pushing manually, this is the expected verification path:

```bash
pnpm format:check
pnpm build
```

> [!IMPORTANT]
> Use `pnpm` for package management and scripts in this repository. Mixing package managers can create lockfile and dependency resolution drift.
