# Weather Trip Planner Requirements

This project is a Next.js 14 application backed by Prisma + SQLite. Install the packages below before running any of the scripts in `package.json`.

## Runtime dependencies
| Package | Version | Purpose |
| --- | --- | --- |
| `next` | 14.2.7 | React framework (App Router + API routes). |
| `react` | 18.3.1 | UI rendering. |
| `react-dom` | 18.3.1 | DOM-specific React bindings. |
| `@prisma/client` | 5.15.0 | Prisma ORM client used by API routes. |
| `prisma` | 5.15.0 | Prisma CLI/schema tooling (needed for `prisma migrate/generate`). |
| `algoliasearch` | ^5.44.0 | Algolia client placeholder (future search integration). |
| `fuse.js` | ^7.1.0 | Local fuzzy search for suggestion ranking. |
| `leaflet` | ^1.9.4 | Map rendering library. |
| `react-leaflet` | ^4.2.1 | React bindings for Leaflet maps. |
| `pdfkit` | ^0.17.2 | Generates itinerary PDFs/exports. |

Install them with:
```bash
npm install
```
(Runs through the full dependency tree defined in `package.json`.)

## Development dependencies
| Package | Version | Purpose |
| --- | --- | --- |
| `eslint` | 8.57.0 | Linting + static analysis. |
| `eslint-config-next` | 14.2.7 | Next.js ESLint rules/presets. |

> `npm install` installs both runtime and dev dependencies automatically; no extra manual steps are required.
