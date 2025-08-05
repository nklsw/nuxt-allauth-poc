# Nuxt-Allauth POC

A minimal proof-of-concept demonstrating cookie-based session authentication between a Django REST Framework backend (using Allauth) and a Nuxt v4 frontend with custom composables, plugins, and middleware.

## Features

- **Backend**: Django, Django REST Framework, django-allauth
- **Frontend**: Nuxt v4, TypeScript, Pico CSS
- **Auth**: Custom `useAuth` composable for login, signup, logout, and session refresh
- **Middleware**: Route protection for authenticated/guest access

## Setup & Run

Prerequisites: `pnpm`, `uv`, and [just](https://github.com/casey/just)

1. Install dependencies and apply migrations:
   ```bash
   just bootstrap
   ```
2. Start backend (localhost:8000) and frontend (localhost:3000):
   ```bash
   just run
   ```

> The frontend uses `NUXT_PUBLIC_API_BASE` (default: `http://localhost:8000`) to locate the API.

## Usage

- Visit `/auth/signup` to register a new account
- Visit `/auth/login` to sign in
- Access protected routes once authenticated
