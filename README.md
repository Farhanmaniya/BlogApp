# Blogify Backend

Blogify is a Node.js backend for a simple blogging application. It exposes REST APIs for user authentication, blog CRUD, image upload, and category queries. The project also includes a plain HTML/JS frontend inside the `frontend/` folder, but the README focuses on the backend server.

## Features

- User signup and signin with JWT authentication
- `HttpOnly` auth cookie support for protected routes
- Blog creation with file upload using `multer`
- Blog retrieval by ID and slug
- Pagination, category filtering, and text search for blog listing
- Automatic view counter increment on read
- Category listing based on existing blog posts
- MongoDB persistence via Mongoose

## Tech stack

- Node.js
- Express
- MongoDB / Mongoose
- JSON Web Tokens (`jsonwebtoken`)
- Multer for multipart file uploads
- dotenv for configuration
- CORS with credentials support

## Getting started

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally or accessible via a connection URI

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root with at least the following values:

```env
MONGO_URI=mongodb://127.0.0.1:27017/blogapp
JWT_SECRET=your-secret-key
PORT=8000
```

If `MONGO_URI` is not provided, the app falls back to `mongodb://127.0.0.1:27017/blogapp`.

### Start the server

```bash
npm run dev
```

This starts the backend with `nodemon` on the port configured in `.env` or default `8000`.

## 🔗 Live Demo
- Frontend: https://farhan-blogify.netlify.app
- Backend API: https://blogapp-production-6fe8.up.railway.app

## API endpoints

### Authentication

- `POST /user/signup`
  - Body: `{ fullName, email, password }`
  - Registers a new user.

- `POST /user/signin`
  - Body: `{ email, password }`
  - Returns a JWT auth cookie and user info.

- `POST /user/logout`
  - Clears the auth cookie.

### Blog routes

- `GET /api/blog`
  - Returns paginated blog posts.
  - Query params: `page`, `limit`, `category`, `search`

- `GET /api/blog/categories`
  - Lists distinct categories from blog posts.

- `GET /api/blog/slug/:slug`
  - Returns a blog by its slug.

- `GET /api/blog/:id`
  - Returns a blog by its MongoDB ID.

- `POST /api/blog/create`
  - Protected route; requires auth.
  - Fields:
    - `title` (required)
    - `body` (required)
    - `category` (optional)
    - `excerpt` (optional)
    - `coverImage` file field (optional)
  - The upload field name for the image must be `coverImage`.

- `PUT /api/blog/:id`
  - Protected route; requires auth.
  - Updates a blog post.

- `DELETE /api/blog/:id`
  - Protected route; requires auth.
  - Deletes a blog post and removes its uploaded cover image file when present.

### Alias route

- `GET /api/posts`
  - Alias for `GET /api/blog`

## Authentication details

- Users are stored in MongoDB with a salted and hashed password.
- Auth tokens are created in `services/authService.js` and signed with `JWT_SECRET`.
- Tokens are returned as an `HttpOnly` cookie named `token`.
- Protected routes use `middleware/authMiddleware.js` to validate the token.

## Upload handling

- Uploads are stored under `uploads/<userId>/`.
- The `coverImage` field is saved as a URL path like `/uploads/<userId>/<filename>`.
- The server serves uploaded files from the static route:
  - `app.use('/uploads', express.static(path.join(__dirname, 'uploads')))`

## Important configuration

- CORS is configured in `app.js` to allow frontend origins and support cookies.
- If you run the frontend from a different port, add that origin to the allowed origins list in `app.js`.

## Project structure

```text
.
├── app.js
├── server.js
├── config/db.js
├── controllers/
│   ├── blogController.js
│   └── userController.js
├── middleware/authMiddleware.js
├── models/
│   ├── Blog.js
│   └── User.js
├── routes/
│   ├── blogRoutes.js
│   ├── categoryRoutes.js
│   └── userRoute.js
├── services/authService.js
├── frontend/
│   └── ... client HTML/JS files ...
├── uploads/
├── package.json
└── .env
```

## Notes

- The backend does not serve the frontend application by default.
- Use a static file server or browser Live Server for the `frontend/` folder.
- If cookies are not being sent from the browser, verify that CORS origin and `credentials` are configured correctly.

## Testing

There is no test suite configured yet. You can manually test by:

1. Running `npm run dev`
2. Posting to `/user/signup`
3. Signing in at `/user/signin`
4. Creating a blog at `/api/blog/create`
5. Fetching `/api/blog`

---

If you want, I can also add example `curl` commands for the major routes or turn this into a full API reference with sample request/response bodies.