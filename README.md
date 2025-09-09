# Info Music

A React app that helps you discover information about your favourite musical groups: quick search, key facts, album covers, and a short biography — with links to dig deeper.

## Tech Stack

- React (CRA), HTML5, CSS3
- Node.js + Express (API proxy)
- Nodemon (dev only), Concurrently (run client + server in dev)
- react-spinners (loading UI)

## Features

- 🔎 Type a band/artist name and see up to **3** results (debounced search).
- 🖼️ Carousel/cover images, country, albums released, and a short bio (when available).
- ⏳ Smooth UX with spinner + placeholder while images load / on error.
- 🔗 Link out to Last.fm for more details.

## Data Sources (via backend)

- **MusicBrainz** — search, details, members, release groups (albums).
- **Cover Art Archive** — album cover images.
- **Last.fm** — short biography (first sentences).
- **Deezer** — artist photos for carousels.
- **Wikipedia** — extra images.

> The server consolidates and normalizes these calls under `/api/*` endpoints to keep the frontend simple and avoid CORS issues.

## Running Locally

```bash
npm install
npm run dev
```
