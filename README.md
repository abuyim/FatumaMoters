# FatumaMotors

## Admin login
- Admin panel URL: `/admin/login` (alias: `/login`)
- Default credentials (when not set via environment variables):
  - Username: `admin`
  - Password: `admin123`

You can override admin credentials with:
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## Environment file
- Example file is included: `.env.example`
- Create your local env file by copying it to `.env` and editing values.

Example:
- `cp .env.example .env` (Linux/macOS)
- `copy .env.example .env` (Windows CMD)

## Storage backends
The server now supports **two backends**:
1. **JSON file** (default): uses `server/data/db.json`
2. **MySQL** (enabled when `MYSQL_HOST` is provided)

### MySQL environment variables
Set these to enable MySQL:
- `MYSQL_HOST`
- `MYSQL_PORT` (optional, default `3306`)
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE` (optional, default `site_fatumamotors_db`)
- `MYSQL_CONNECTION_LIMIT` (optional, default `10`)

### MySQL schema
Schema file: `server/data/mysql-schema.sql`

The app auto-creates required tables on startup and seeds data from `server/data/db.json` when MySQL tables are empty.
If MySQL or `mysql2` is unavailable at runtime, the server automatically falls back to JSON storage.

### How to connect your DB (`site_fatumamotors_db`) and run migration
1. Set environment variables before running the server:
   - `MYSQL_HOST=127.0.0.1`
   - `MYSQL_PORT=3306`
   - `MYSQL_USER=YOUR_USER`
   - `MYSQL_PASSWORD=YOUR_PASSWORD`
   - `MYSQL_DATABASE=site_fatumamotors_db`
2. Run migration script (creates DB if needed and applies schema):
   - `npm run migrate:mysql`
3. Start the app:
   - `npm run dev` (or `npm run preview`)

Migration script path: `server/scripts/migrate-mysql.js`.

## Managed content in DB
When MySQL is enabled, these are stored in MySQL and managed by admin:
- Site settings (brand, contact, social links, location link)
- Home content (hero section, stats, FAQs, etc.)
- About/services/contact page sections
- Products/vehicles (CRUD)
- Gallery product source data (from vehicles)
- Inquiries/order requests
- Admin users (for login)

## Dynamic section CRUD API (admin only)
- `GET /api/admin/sections` → list top-level section keys
- `GET /api/admin/sections/:path` → get any nested section by dot path
- `PUT /api/admin/sections/:path` with `{ "value": ... }` → update/create section
- `DELETE /api/admin/sections/:path` → remove section

Examples of section paths:
- `home.heroSlides`
- `aboutPage.story`
- `site.socialMedia`
