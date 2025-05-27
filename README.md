# Recipe App Frontend

This is the frontend for a recipe sharing website built with [Nuxt 3](https://nuxt.com/).  
It connects to a FastAPI backend (with MongoDB for recipes and comments) and uses Supabase for authentication, user management, and billing.

---

## Features

- **User Authentication:** Login, logout, and registration via Supabase.
- **Recipe Search & Explore:** Browse, search, and filter recipes.
- **Recipe Management:** View, save, and like recipes.
- **Comments & Replies:** Add comments and replies to recipes, like comments.
- **User Profiles:** Manage saved recipes and personal info.
- **Responsive UI:** Built with Tailwind CSS.

---

## Backend Stack

- **FastAPI:** API server for recipes, comments, and interactions.
- **MongoDB:** Stores recipes, comments, and replies.
- **Supabase:** Handles authentication, user profiles, and billing.

---

## Setup

Install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

---

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Preview the production build locally:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

---

## Configuration

Set your API and Supabase credentials in `.env` or `nuxt.config.ts`:

```env
NUXT_PUBLIC_SUPABASE_URL=your-supabase-url
NUXT_PUBLIC_SUPABASE_KEY=your-supabase-key
NUXT_PUBLIC_API_BASE=http://localhost:8000/api
```

---

## Learn More

- [Nuxt Documentation](https://nuxt.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)

---
