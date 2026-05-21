# NoMediator Backend

This is the Node.js + PostgreSQL backend for NoMediator.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to your PostgreSQL connection string.
3. Set `JWT_SECRET` to a secure secret.
4. Run `npm install`.
5. Create the database and run the migration in `backend/migrations/init.sql`.

## Run

- `npm start` - start the production server.
- `npm run dev` - start with nodemon.

## API

- POST `/api/auth/register`
  - body: `{ name, email, phone, password }`
- POST `/api/auth/login`
  - body: `{ email, password }`
- GET `/api/auth/me`
  - header: `Authorization: Bearer <token>`
