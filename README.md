# Dual Track Twin

Dual-Track Digital Twin is a Vite/React dashboard with an Express/tRPC server. It presents a calibrated digital-twin workflow for comparing design assumptions against measured operational data.

## Tech Stack

- React 19 + TypeScript
- Vite
- Express + tRPC
- Drizzle ORM
- Tailwind CSS
- pnpm

## Getting Started

```bash
pnpm install
pnpm dev
```

The development server starts on port `3000` by default and will pick the next available port if `3000` is busy.

## Scripts

```bash
pnpm dev      # Start the development server
pnpm build    # Build the frontend and server bundle
pnpm start    # Run the production server
pnpm check    # Type-check the project
pnpm test     # Run tests
```

## Notes

The demo data is stored in `client/public/demo_data.json` and `client/public/demo_data_extra.json`.
