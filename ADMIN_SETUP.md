# SYS Solutions admin access

The admin area is available at `/admin`. Authentication is intentionally controlled by server-side environment variables; there is no shared or hard-coded default password.

Set these values in the deployment environment before signing in:

- `ADMIN_USER_ID` — the User ID required at admin sign-in.
- `ADMIN_PASSWORD` — a unique password with at least 12 characters.
- `ADMIN_SESSION_SECRET` — a separate, randomly generated secret used to sign eight-hour admin sessions.

The dashboard lets an administrator add, edit, feature, hide, and remove laptop listings; update the homepage and store contact details; and review or update customer inquiries. Never expose these values with a `NEXT_PUBLIC_` prefix.
