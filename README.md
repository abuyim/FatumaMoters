# FatumaMotors

## Admin login
- Admin panel URL: `/admin/login`
- Default credentials (when not set via environment variables):
  - Username: `admin`
  - Password: `admin123`

You can override admin credentials with:
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

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
- `MYSQL_DATABASE` (optional, default `fatumamotors`)
- `MYSQL_CONNECTION_LIMIT` (optional, default `10`)

### MySQL schema
Schema file: `server/data/mysql-schema.sql`

The app auto-creates required tables on startup and seeds data from `server/data/db.json` when MySQL tables are empty.
If MySQL or `mysql2` is unavailable at runtime, the server automatically falls back to JSON storage.

## Managed content in DB
When MySQL is enabled, these are stored in MySQL and managed by admin:
- Site settings (brand, contact, social links, location link)
- Home content (hero section, stats, FAQs, etc.)
- About/services/contact page sections
- Products/vehicles (CRUD)
- Gallery product source data (from vehicles)
- Inquiries/order requests
- Admin users (for login)
