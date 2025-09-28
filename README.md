# React + TypeScript + Vite + Tailwind CSS

This repository contains a ready-to-use React development environment powered by Vite, TypeScript, and Tailwind CSS. Everything you need to start building modern interfaces is already configured, including hot module replacement, ESLint, and PostCSS.

## Getting started

Install the project dependencies and start the development server:

```bash
npm install
npm run dev
```

Vite will boot the local dev server and print a URL that you can open in your browser. Edits inside the `src` directory trigger instant hot updates without refreshing the page.

## Available scripts

- `npm run dev` – start the Vite development server.
- `npm run build` – type-check the project and build the production-ready assets.
- `npm run preview` – locally preview the production build created by `npm run build`.
- `npm run lint` – run ESLint using the configuration in `eslint.config.js`.

## Tailwind CSS

Tailwind is integrated through `postcss.config.js` and `tailwind.config.ts`. Global styles live in `src/index.css`, where the Tailwind layers are imported and a dark theme baseline is defined. Feel free to customize the theme or add plugins as your project grows.
