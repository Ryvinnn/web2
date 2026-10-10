# Suru Workspace: Database & Authentication Setup Guide

Suru Workspace features an enterprise-grade Guest Mode and Authentication architecture built on top of PostgreSQL, Supabase Row-Level Security (RLS), and modern client-side local caching.

---

## 1. Architecture Overview

- **Guest Mode (Default)**:
  - Visitors automatically enter Guest Mode without requiring an account.
  - Data is isolated in browser storage (`ignos_guest_*`) and defaults to clean empty states.
  - Guests can create, edit, and manage projects, goals, daily tasks, subtasks, notes, milestones, and statistics locally.
  - No fabricated identity or credentials are displayed.

- **Authentication & Cloud Sync**:
  - Email/Password sign up and sign in.
  - Official Google OAuth redirect integration.
  - When an authenticated user logs in, Row-Level Security (RLS) ensures that all queries and writes are scoped strictly to `auth.uid() = user_id`.
  - Automatic migration dialog transfers local guest data seamlessly into the user's permanent cloud account.

---

## 2. Environment Variables

Create or update your `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

> **Note**: If `.env` is omitted, the application runs in local mode. You can still test guest productivity, registration, account switching, and guest data migrations.

---

## 3. Database Schema & RLS Setup

1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Copy the entire contents of [`supabase/schema.sql`](./schema.sql).
3. Click **Run**.
4. The following tables will be created with Row-Level Security:
   - `user_profiles`
   - `projects`
   - `goals`
   - `tasks`
   - `notes`
   - `activity_feed`

---

## 4. Google OAuth Configuration (Optional for Google Login)

To enable official Google OAuth:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
2. Create an **OAuth 2.0 Client ID** (Web Application).
3. In **Authorized redirect URIs**, enter your Supabase OAuth redirect URL:
   ```text
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
4. Copy the **Client ID** and **Client Secret**.
5. In your **Supabase Dashboard**, navigate to **Authentication** -> **Providers** -> **Google**.
6. Paste the Client ID and Secret, and toggle Google **Enabled**.
7. In **Authentication** -> **URL Configuration**, add your application URL (e.g., `http://localhost:5173` or your production domain) to **Redirect URLs**.
