# Supabase + Vercel deployment

## 1. Create the Supabase database

1. Create a Supabase project and keep its database password private.
2. Open **Connect** in the Supabase dashboard.
3. Copy the **Transaction pooler** URI (port `6543`) to `SUPABASE_DATABASE_URL`. This is the serverless runtime connection used by Vercel.
4. Copy the **Direct connection** URI, or the Session pooler URI on port `5432`, to `DIRECT_DATABASE_URL`. Drizzle Kit uses this stable connection for schema changes.
5. Keep `?sslmode=require` on managed Supabase URLs.

The application uses Drizzle directly against Supabase Postgres. Prepared statements are disabled because Supabase's transaction pooler does not support them.

## 2. Apply the schema

With both URLs in `.env.local`, run:

```bash
npx drizzle-kit push
```

The first storefront request seeds the default settings, initial catalog, and the `WELCOME5` coupon. You can then maintain products, promotions, coupons, orders, and inquiries from `/admin`.

## 3. Deploy to Vercel

1. Import the repository into Vercel as a Next.js project.
2. Add these Environment Variables for Production and Preview:
   - `SUPABASE_DATABASE_URL`
   - `SITE_URL`
   - `ADMIN_USER_ID`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
3. `DIRECT_DATABASE_URL` is only needed where you run Drizzle schema commands. It is not required by the deployed application at runtime.
4. Deploy. The database connection is initialized on first use, so it is not needed just to compile the project. The database-backed storefront, orders, admin, and health check still require `SUPABASE_DATABASE_URL` at runtime.
5. Verify `/api/health`, place a test order, open its receipt, and confirm it appears under **Admin → Orders**.

Never put database passwords or admin secrets in `vercel.json`, source control, or variables prefixed with `NEXT_PUBLIC_`.
