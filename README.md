# Local Industry Connect

This repo is organized for separate deployment:

- Frontend: React + Vite app at the repository root
- Backend: Express + MongoDB API in `server/`

## Structure

```text
.
|-- public/
|-- src/
|-- server/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- services/
|   `-- utils/
|-- package.json
`-- server/package.json
```

## Environment Setup

Frontend:

1. Copy `.env.example` to `.env`
2. Set `VITE_API_URL`

Backend:

1. Copy `server/.env.example` to `server/.env`
2. Set `PORT`, `NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, and `CORS_ORIGIN`

## Local Run

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd server
npm install
npm start
```

## Deployment

### Frontend on Vercel

1. Push the repository to GitHub.
2. Import the repo into Vercel.
3. Set:
   - Root Directory: `.`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add env var:
   - `VITE_API_URL=https://your-backend-domain.com/api`
5. Deploy.

### Backend on Render or Railway

1. Create a new web service from the same repository.
2. Set Root Directory to `server`.
3. Set:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add backend env vars from `server/.env.example`.
5. Deploy.

### Verify

1. Open `https://your-backend-domain.com/health`
2. Open your frontend URL
3. Confirm requests are going to the backend domain set in `VITE_API_URL`

## Production Notes

- The backend is API-only and should not serve the frontend bundle.
- Production CORS is controlled through `CORS_ORIGIN`.
- Do not commit `.env` or `server/.env`.
- Keep `package-lock.json` checked in for reproducible npm installs.
