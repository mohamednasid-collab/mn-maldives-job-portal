# MN Maldives Job Portal

A responsive production application for managing customer jobs from initial enquiry through design, production, delivery, payment, and completion.

## What is included

- Secure Supabase email/password authentication
- Role-based access for Super Admin, Administrator, Finance, and Staff
- Database-generated `MN-YYYY-####` job numbers
- Dashboard, workflow board, assignments, finance overview, filters, and CSV export
- Customer/job editing with designer and factory assignment
- Database-enforced invoice gate: delivered jobs with an invoice become `Completed`; jobs without one become `Incomplete`
- User invitation flow restricted to the Super Admin
- Row Level Security on every application table
- Private Supabase Storage policies for future artwork, quotation, invoice, and delivery files
- Responsive desktop and mobile navigation
- Vercel-ready Next.js configuration

## 1. Create the Supabase project

1. Create a new project at [Supabase](https://supabase.com/dashboard).
2. Open **Project Settings → API** and copy the project URL, publishable key, and secret key.
3. In **Authentication → URL Configuration**, set the production site URL and add:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR-VERCEL-DOMAIN/auth/callback`
4. Disable public user sign-up unless MN Maldives intends to accept self-registration. New profiles are inactive by default, but disabling it further reduces risk.

## 2. Apply the database migration

Install dependencies, log in to the Supabase CLI, link the project, and push the migration:

```bash
pnpm install
pnpm exec supabase login
pnpm exec supabase link --project-ref YOUR_PROJECT_REFERENCE
pnpm exec supabase db push
```

The migration creates the secured schema, factories, access policies, workflow guards, activity history, and private file bucket.

## 3. Create Nasid as the first Super Admin

1. In Supabase **Authentication → Users**, create Nasid's email account.
2. Open **SQL Editor** and run the following once, replacing the email:

```sql
update public.profiles
set full_name = 'Nasid', role = 'super_admin', active = true
where email = 'NASID_EMAIL_HERE';
```

Nasid can then sign in and use **Users → Invite user** to create Meksie as `Administrator` and Finance as `Finance`. Never create shared passwords or shared accounts.

## 4. Configure local environment

Copy `.env.example` to `.env.local`, fill in the values, and set:

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never expose `SUPABASE_SECRET_KEY` using a variable beginning with `NEXT_PUBLIC_`. Never commit `.env.local`.

Run locally:

```bash
pnpm dev
```

## 5. Push to GitHub

Create a private GitHub repository, then connect this folder:

```bash
git init
git add .
git commit -m "Build MN Maldives production portal"
git branch -M main
git remote add origin YOUR_PRIVATE_GITHUB_REPOSITORY
git push -u origin main
```

Protect the `main` branch and require pull-request review before production changes.

## 6. Deploy on Vercel

1. Import the private GitHub repository into [Vercel](https://vercel.com/new).
2. Add all five values from `.env.example` under **Project Settings → Environment Variables**.
3. Set `NEXT_PUBLIC_DEMO_MODE` to `false` and `NEXT_PUBLIC_SITE_URL` to the final HTTPS URL.
4. Deploy, then add the final URL to Supabase Authentication redirect URLs.
5. Test each role in a private browser window before inviting the wider team.

## Role permissions

| Role | Access |
|---|---|
| Super Admin | All jobs, finance, deletion, factories, and user invitations |
| Administrator | Create and manage operational job fields; cannot change finance fields |
| Finance | Update payment, invoice, notes, and workflow fields; cannot alter customer or production assignment fields |
| Staff | Read-only portal access, with task-update support available in the database |

Permissions are enforced by Supabase policies and database triggers, not only by the interface.

## Production checklist

- Use one personal account per employee.
- Enable MFA for Nasid and Finance in Supabase.
- Keep the Supabase secret key only in Vercel's encrypted environment variables.
- Test database backups and recovery.
- Review Supabase security and performance advisors after applying migrations.
- Add a custom domain such as `portal.mnmaldives.com` only after role testing succeeds.
