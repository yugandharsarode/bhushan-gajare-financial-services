# Bhushan Gajare Website

Modern React rebuild of [bhushangajare.com](https://bhushangajare.com).

## Stack

- React 19 + Vite
- JavaScript (no TypeScript)
- React Router DOM
- Tailwind CSS v4

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Project Structure

```
src/
├── components/     # Reusable UI (Navbar, Footer, Card, etc.)
├── pages/          # Route pages
├── layouts/        # MainLayout with Navbar + Footer
├── data/           # Navigation & site config
├── assets/         # Images & static files
├── styles/         # Additional global styles
├── App.jsx         # Routes
└── main.jsx        # Entry point
```

## Pages

| Route | Page |
|-------|------|
| `/` | Home |
| `/demat-services` | Demat Services |
| `/services` | Services |
| `/about` | About |
| `/calculators` | Calculators |
| `/testimonials` | Testimonials |
| `/contact` | Contact |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — preview production build
