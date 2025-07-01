# Chatterly

[Live Demo](https://chatterly-delta.vercel.app)

Chatterly is a web application project built with Next.js, JavaScript, TypeScript, and Tailwind CSS. It is designed to offer a robust, modern user experience, leveraging strong authentication and a rich component library.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Configuration](#configuration)
- [License](#license)

## Features

- **Authentication Middleware**: Custom JWT and NextAuth integration for secure access (`middleware.js`).
- **Component Library**: Uses shadcn/ui and Radix UI for accessible, customizable components.
- **Modern Styling**: Tailwind CSS with a custom configuration.
- **TypeScript Support**: Strong typing and modern JavaScript/TypeScript standards.
- **API Integration**: Ready for backend/API connections using Express, MongoDB, Mongoose, and Axios.
- **Easy Theming**: Next-themes and Tailwind for dark mode and theme customization.

## Project Structure

> Note: Only a partial file list is shown. For the full structure, see your repository on GitHub.

- `middleware.js` — Authentication logic for protected routes.
- `tailwind.config.ts` — Tailwind CSS configuration and theme extension.
- `next.config.mjs` — Next.js build and image config.
- `postcss.config.mjs` — PostCSS plugins for CSS processing.
- `package.json`, `package-lock.json`, `pnpm-lock.yaml` — Dependency and package management.
- `tsconfig.json` — TypeScript configuration for strict typing and path aliases.
- `components.json` — UI component library and alias setup.

Explore more files and folders in your [GitHub repository](https://github.com/rishugoyal805/Chatterly).

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, JavaScript, Tailwind CSS, PostCSS
- **UI Libraries**: shadcn/ui, Radix UI, Lucide Icons
- **Backend/Server**: Express.js, MongoDB, Mongoose
- **Auth & Security**: NextAuth, JWT, bcryptjs
- **Other**: Axios, dotenv, framer-motion, and more

## Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/rishugoyal805/Chatterly.git
cd Chatterly
npm install    # or pnpm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Scripts

Common scripts from `package.json`:

- `dev` — Start development server
- `build` — Build the application
- `start` — Start the production server
- `lint` — Run linter

## Configuration

- Environment variables are required for JWT secret, database, and other integrations. Set them in a `.env` file.
- Adjust Tailwind styles in `tailwind.config.ts`.
- Modify Next.js settings in `next.config.mjs`.
- Extend or customize component aliases in `components.json`.

## License

This project is private and does not have a public license by default.

---

> **Note:** Only a subset of files is listed here. For more details, browse the repository directly on GitHub. 
