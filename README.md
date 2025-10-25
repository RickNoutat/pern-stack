# PERN Stack – Monorepo (API + Frontend)

Full-stack PERN application (PostgreSQL • Express • React • Node) in a monorepo setup.

**Backend:** Express 5 with security features (Helmet, CORS, Morgan), Arcjet for rate-limiting and bot protection.

**Database:** PostgreSQL using `@neondatabase/serverless` driver (optimized for Neon DB).

**Frontend:** React + Vite, Zustand for state management, DaisyUI/Tailwind for styling.

In production, the API serves the frontend SPA from `frontend/dist`.

---

## Table of Contents

- [Stack & Features](#stack--features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Local Development](#local-development)
- [PNPM Scripts](#pnpm-scripts)
- [API Documentation](#api-documentation)
- [Database Notes](#database-notes)
- [Arcjet Security](#arcjet-security)
- [Deployment on Render](#deployment-on-render)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Stack & Features

- **Node:** 20.x recommended
- **Backend:** Express 5, Helmet, CORS, Morgan, Dotenv
- **Database:** PostgreSQL (table: `products`)
- **DB Driver:** `@neondatabase/serverless` (HTTP/WebSocket support for Neon)
- **Frontend:** React + Vite, Zustand, DaisyUI/Tailwind
- **Security:** Arcjet for rate-limiting and bot detection (optional based on env vars)

---

## Project Structure

```
pern-stack/
├─ backend/
│  ├─ config/
│  │  └─ db.js                    # Database connection
│  ├─ controllers/
│  │  └─ product.controllers.js   # Product logic
│  ├─ routes/
│  │  └─ product.routes.js        # API routes
│  ├─ seeds/
│  │  └─ products.js              # Seed data
│  └─ server.js                   # Express server entry
├─ frontend/
│  ├─ src/
│  │  └─ ...                      # React components
│  ├─ vite.config.js
│  └─ package.json
├─ .env                           # Environment variables
├─ package.json                   # Root monorepo scripts
└─ pnpm-lock.yaml
```

---

## Prerequisites

- **Node.js:** 20.x (use `nvm use 20` or set `"engines": { "node": "20.x" }`)
- **pnpm:** Enable Corepack with `corepack enable`
- **PostgreSQL:** Accessible instance (e.g., Neon) with a `DATABASE_URL`

---

## Configuration

Create a `.env` file at the project root:

```bash
# Backend
PORT=10000
NODE_ENV=development

# Database (example: Neon PostgreSQL)
# Format: postgresql://user:password@host/dbname?sslmode=require
DATABASE_URL=postgresql://<user>:<password>@<host>/<dbname>?sslmode=require

# Arcjet (optional - for rate limiting and bot protection)
ARCJET_KEY=aj_live_xxx
ARCJET_ENV=development  # Options: development | production
```

**Note:** In production (Render), `PORT` is automatically injected by the platform.

---

## Local Development

### Step-by-Step Setup

```bash
# 1. Install root dependencies
corepack enable
pnpm i

# 2. Install and build frontend
pnpm -C frontend i
pnpm -C frontend build   # Optional for dev mode

# 3. Start backend in development mode
pnpm dev                 # Uses nodemon to watch backend/server.js
```

### Access Points

- **API:** <http://localhost:10000>
- **Frontend (dev mode):** Run `pnpm -C frontend dev` → <http://localhost:5173>

### Production Test Locally

```bash
NODE_ENV=production node backend/server.js
```

The backend will serve the frontend from `frontend/dist` if the build exists.

---

## PNPM Scripts

Root `package.json` scripts:

```json
{
  "scripts": {
    "dev": "nodemon backend/server.js",
    "build": "pnpm -C frontend i && pnpm -C frontend build",
    "start": "node backend/server.js"
  }
}
```

**Script Descriptions:**

- `dev` – Starts the API with nodemon (auto-restart on changes)
- `build` – Installs frontend dependencies and builds for production
- `start` – Runs the API in production mode

> **Tip:** Explicitly installing in `frontend/` ensures Vite and devDependencies are available during build.

---

## API Documentation

**Base Path:** `/api/products`

The `products` table is automatically created on startup if it doesn't exist.

### Available Endpoints

| Method   | Endpoint            | Description        | Request Body                |
| -------- | ------------------- | ------------------ | --------------------------- |
| `GET`    | `/api/products`     | List all products  | None                        |
| `GET`    | `/api/products/:id` | Get product by ID  | None                        |
| `POST`   | `/api/products`     | Create new product | `{ name, image, price }`    |
| `PUT`    | `/api/products/:id` | Update product     | `{ name?, image?, price? }` |
| `DELETE` | `/api/products/:id` | Delete product     | None                        |

### Example Request

**POST** `/api/products`

```json
{
  "name": "Keyboard 60%",
  "image": "https://example.com/kb.jpg",
  "price": 49.9
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "name": "Keyboard 60%",
  "image": "https://example.com/kb.jpg",
  "price": 49.9,
  "created_at": "2025-10-25T12:00:00.000Z"
}
```

---

## Database Notes

The project uses `@neondatabase/serverless` in `backend/config/db.js`.

- **For Neon DB:** Use your Neon `DATABASE_URL` directly
- **For Render PostgreSQL:** You can switch to the standard `pg` driver (TCP) or keep Neon as a separate service

### Schema

The `products` table is created automatically with the following structure:

```sql
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image TEXT,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Arcjet Security

Arcjet provides rate-limiting and bot protection. Activation depends on the presence of `ARCJET_KEY`.

### Reverse Proxy Configuration

When behind a reverse proxy (like Render), configure Express to trust proxy headers:

```javascript
// backend/server.js (before middleware)
app.set("trust proxy", 1);
```

### Environment Settings

- **Development:** Set `ARCJET_ENV=development` to avoid warnings
- **Production:** Set `ARCJET_ENV=production`

### Troubleshooting

If you encounter "Client IP address is missing":

1. Verify `app.set('trust proxy', 1)` is set
2. Check that `X-Forwarded-For` header is present
3. Ensure `ARCJET_ENV` matches your environment

---

## Deployment on Render

### Option A – Single Service (API + SPA)

**Recommended for simplicity**

1. **Create New Web Service**

   - Root directory: project root
   - Runtime: Node

2. **Build Command:**

   ```bash
   corepack enable && pnpm i --frozen-lockfile --prod && pnpm run build
   ```

   This installs root dependencies, then delegates to the `build` script to install and build the frontend.

3. **Start Command:**

   ```bash
   pnpm start
   ```

4. **Environment Variables:**

   - `NODE_ENV=production` (Render sets this by default)
   - `DATABASE_URL=...` (from Neon or Render PostgreSQL)
   - `ARCJET_KEY=...` (optional)

5. **Port Configuration:**
   Render provides `PORT` automatically. In `server.js`:

   ```javascript
   const PORT = process.env.PORT || 10000;
   ```

### Option B – Separate Services (Static Site + API)

**For independent scaling**

#### Frontend Static Site

- **Root Directory:** `frontend/`
- **Build Command:**

  ```bash
  corepack enable && pnpm -C frontend i && pnpm -C frontend build
  ```

- **Publish Directory:** `frontend/dist`

#### Backend Web Service

- **Root Directory:** `/` or `/backend`
- **Start Command:**

  ```bash
  node backend/server.js
  ```

- **Environment Variables:** Same as Option A

---

## Troubleshooting

### `vite: not found`

**Cause:** Frontend dependencies weren't installed before build.

**Solutions:**

- Ensure the `build` script runs `pnpm -C frontend i` before `pnpm -C frontend build`
- In Render, explicitly install frontend dependencies in the build command

### Arcjet – IP Address Missing

**Solutions:**

- Add `app.set('trust proxy', 1)` in `server.js`
- Verify `X-Forwarded-For` header is being passed
- Set `ARCJET_ENV=development` for local development

### Node Version Mismatch

**Solution:** Fix the Node version in your project:

**Option 1:** Add to `package.json`

```json
{
  "engines": {
    "node": "20.x"
  }
}
```

**Option 2:** Create `.nvmrc`

```
20
```

### Build Failures on Render

**Common causes:**

- Missing environment variables
- Incorrect build command syntax
- Node version mismatch

**Debug steps:**

1. Check Render build logs for specific errors
2. Test build command locally first
3. Verify all required env vars are set

---

## Advanced: PNPM Workspaces

For better monorepo management, you can convert to PNPM workspaces:

1. **Create `pnpm-workspace.yaml`:**

   ```yaml
   packages:
     - "frontend"
     - "backend"
   ```

2. **Update Build Command:**

   ```bash
   corepack enable && pnpm -w i --frozen-lockfile && pnpm -F frontend build
   ```

Benefits: Faster installs, better dependency management, cleaner architecture.

---

## License

This project is licensed under the **ISC License**.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Support

If you encounter issues:

- Check the [Troubleshooting](#troubleshooting) section
- Review Render deployment logs
- Open an issue in the repository

---

**Happy coding! 🚀**
