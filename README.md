# nuxt-allauth-poc

A minimal proof-of-concept demonstrating cookie-based session authentication between a Django REST Framework backend and a Nuxt v4 frontend with custom composables, plugins, and middleware.

## Features

- Cookie-based session authentication using [django-allauth](https://django-allauth.readthedocs.io/en/latest/) headless endpoints
- Support for `CSR` and `SSR`
- Custom `useAuth` composable for login, signup, logout, and session refresh
- Custom `useApiFetch` composable for authenticated API requests
- Custom `auth` and `guest` middleware for route protection

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
- Authentication state is available at `/` (unprotected) and `/example` (protected)

## WIP
- [ ] Add tests
- [ ] Improve error handling and user feedback
- [ ] Add email verification functionality
- [ ] Add password reset functionality
- [ ] Add login by code functionality
