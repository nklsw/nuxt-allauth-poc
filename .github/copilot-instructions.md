# Project Overview

This is a POC for demonstrating the Authentication between a Django-Rest-Framework backend and a Nuxt.js frontend using the Allauth library on the backend and custom Nuxt Auth composables/plugins/middleware on the frontend. The goal is to keep everything as simple as possible while staying close to the defaults of the libraries used.

## Folder Structure

- `/backend`: Contains the source code for the DRF backend.
- `/frontend`: Contains the source code for the Nuxt v4 Nuxt frontend.
- `justfile`: A Justfile for managing tasks and commands for both frontend and backend.

## Libraries and Frameworks

- **Backend**: Django, Django Rest Framework, Allauth
- **Frontend**: Nuxt v4
- **CSS Framework**: Pico CSS
- **Dependency Management**: uv (Python), pnpm (JavaScript)

## Coding Standards

- Use TypeScript for all frontend code.
- Follow the Nuxt v4 conventions for file structure and component naming.

## UI guidelines

- Application should have a modern and clean design while keeping the UI simple
- Only minimal CSS should be used, preferably Pico CSS