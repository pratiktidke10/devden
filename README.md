# DevDen v2 🔴

> A developer discussion community platform where developers can create topic-based rooms, join conversations, and build their developer profile.

**Live Demo:** [devden-three.vercel.app](https://devden-three.vercel.app)  
**Backend API:** [devden10.onrender.com](https://devden10.onrender.com/api/rooms/)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Django 5.2, Django REST Framework |
| Authentication | JWT (djangorestframework-simplejwt) |
| Database | PostgreSQL (Supabase) |
| Media Storage | Cloudinary |
| Backend Hosting | Render |
| Frontend Hosting | Vercel |

---d

## Chapter 1 — The Old Version & Why I Rebuilt It

DevDen started as a Django monolith — a single application where Django handled everything: URL routing, database queries, business logic, and rendering HTML templates with Bootstrap for the UI. The database was SQLite, a file-based database that lived inside the project folder itself.

While this worked perfectly for learning and local development, it had serious limitations. The Bootstrap UI felt generic and outdated. The full page reload on every click made the app feel slow. SQLite would get completely wiped on every Render redeploy since Render uses ephemeral file systems. And there was no API layer, meaning the frontend and backend were tightly coupled — impossible to scale independently.

I decided to rebuild DevDen from scratch as a modern decoupled full-stack application — keeping the same core idea but upgrading every layer of the stack.

---

## Chapter 2 — Designing the Data Models

Before writing any code, I designed the database schema. DevDen has four core models:

**User** extends Django's built-in AbstractUser, adding a name, bio, and avatar field. The login field was changed from username to email by setting `USERNAME_FIELD = 'email'`. This must be configured before running the first migration — changing it after is very difficult.

**Topic** is a simple category model with just a name field. Topics like Python, JavaScript, and React act as labels for rooms.

**Room** is the core entity. It has a ForeignKey to User (the host) and Topic, a name, description, and a ManyToManyField to User for participants. The ManyToMany relationship means a user can be in many rooms and a room can have many users — Django automatically creates a junction table for this. Rooms are ordered by `-updated` so the most recently active rooms always appear first.

**Message** belongs to both a User and a Room via ForeignKeys with CASCADE deletion — when a room is deleted, all its messages are automatically deleted too.

---

## Chapter 3 — Building the REST API with Django REST Framework

With the models designed, I converted Django from a template-rendering monolith to a JSON API using Django REST Framework (DRF).

I created serializers for each model — classes that convert Django model instances to JSON and validate incoming data. The RoomSerializer uses a write-only `topic_name` field so the frontend just sends a topic name string, and the serializer handles `get_or_create` logic — finding an existing topic or creating a new one automatically. Nested serializers embed related objects, so a room response includes the full host user object and topic object rather than just IDs.

Each API view is an `APIView` subclass with explicit methods per HTTP verb — `get()`, `post()`, `put()`, `delete()`. This gives full control over how each method behaves, what permissions it requires, and what it returns.

One significant challenge was handling authentication on public endpoints. Standard JWT authentication raises an error when a token is expired — even on public read endpoints like listing rooms. I solved this by creating a custom `SilentJWTAuthentication` class that catches the `AuthenticationFailed` exception and returns `None` instead of raising an error, treating the request as anonymous. This way expired tokens don't break the home page for logged-out users, while valid tokens still authenticate correctly.

---

## Chapter 4 — Building the React Frontend

With the Django API ready, I built the React frontend using Vite as the build tool — significantly faster than Create React App since it uses native ES modules during development.

I structured the frontend into three layers:

The **API layer** (`src/api/`) contains one file per backend resource — `rooms.js`, `auth.js`, `topics.js`, etc. All HTTP calls go through a shared Axios instance configured with the backend base URL. A request interceptor automatically attaches the JWT access token from localStorage to every outgoing request — authentication is handled once, centrally, rather than in every component.

The **component layer** (`src/components/`) contains reusable presentational components — `Avatar`, `RoomCard`, `TopicSidebar`, `ActivityFeed`, `Navbar`. These components receive data via props and render UI. They make no API calls directly.

The **page layer** (`src/pages/`) contains smart container components — `Home`, `Room`, `Profile`, `Login`, `Register`, `Topics`, `Activity`, `CreateRoom`, `UpdateRoom`. These pages fetch data from the API, manage state with React hooks, and pass data down to components.

I used several React patterns throughout: lifting state up for the topic filter (Home owns `activeTopic`, passes it to TopicSidebar), useRef for auto-scrolling to the latest message in a room (same pattern as WhatsApp or Discord), debounced search in the Topics page (300ms setTimeout delay so the API isn't called on every keystroke), and optimistic UI for message deletion (removing from state instantly without waiting for the API).

---

## Chapter 5 — Authentication with JWT

Authentication uses JSON Web Tokens via `djangorestframework-simplejwt`. After login or registration, Django returns two tokens — a short-lived access token (7 days in development, 60 minutes in production) and a long-lived refresh token (30 days).

The access token is stored in localStorage and attached to every API request via the Axios interceptor. The refresh token is used to get a new access token when it expires. On logout, the refresh token is blacklisted server-side so it can't be used to generate new tokens.

The frontend has a response interceptor that detects 401 responses on protected endpoints and automatically clears localStorage and redirects to login — preventing the user from being stuck in a broken authenticated state.

---

## Chapter 6 — PostgreSQL & Cloudinary for Production

The original SQLite database couldn't be used in production because Render uses an ephemeral file system — every redeploy wipes the disk, which would delete the entire database. I migrated to PostgreSQL hosted on Supabase, a free cloud database provider. The only change required in Django was updating the `DATABASES` setting — all models, migrations, and ORM queries stay exactly the same since Django abstracts the database differences.

For media storage (user avatar images), I integrated Cloudinary. Instead of relying on Django's `DEFAULT_FILE_STORAGE` setting, I set the storage backend directly on the avatar `ImageField` using `storage=MediaCloudinaryStorage()` — this guarantees that field always uses Cloudinary regardless of global settings. Avatar URLs are built as absolute URLs in the serializer using `request.build_absolute_uri()` so the React frontend can display them correctly across different origins.

---

## Chapter 7 — Deployment

The backend is deployed on **Render** as a Python web service. The build command installs dependencies from `requirements.txt`, collects static files with Whitenoise, and runs database migrations. Gunicorn serves the Django application in production. All secrets (database credentials, Cloudinary keys, Django secret key) are stored as environment variables in the Render dashboard — never in the codebase.

The frontend is deployed on **Vercel** with a single environment variable pointing to the Render backend URL (`VITE_API_URL`). Vercel automatically builds the Vite project and serves it from a global CDN. The CORS configuration on the Django backend is set to allow requests only from the Vercel domain in production.

---

## Features

- 🏠 **Home page** — Browse rooms with real-time search and topic filtering
- 💬 **Discussion rooms** — Create rooms, post messages, see participants
- 👤 **Developer profiles** — Bio, avatar, rooms created, messages posted
- 🏷️ **Topics** — Browse and filter rooms by technology topic
- 📡 **Activity feed** — See recent messages across all rooms
- 🔐 **Auth** — Email-based registration and login with JWT
- 🖼️ **Avatar upload** — Profile pictures stored on Cloudinary CDN
- ✏️ **Room management** — Hosts can edit and delete their rooms
- 🌙 **Dark theme** — GitHub-inspired dark UI throughout

---

## Local Setup

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
cp .env.example .env        # fill in your values
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env        # set VITE_API_URL=http://127.0.0.1:8000
npm run dev
```

---

## Environment Variables

**Backend `.env`:**
```
SECRET_KEY=
DEBUG=True
ALLOWED_HOSTS=*
CORS_ALLOWED_ORIGINS=http://localhost:5173
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=5432
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Frontend `.env`:**
```
VITE_API_URL=http://127.0.0.1:8000
```

---

## API Endpoints

```
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/logout/
GET    /api/auth/user/

GET    /api/rooms/
POST   /api/rooms/
GET    /api/rooms/<id>/
PUT    /api/rooms/<id>/
DELETE /api/rooms/<id>/

POST   /api/rooms/<id>/messages/
DELETE /api/messages/<id>/

GET    /api/users/<id>/
PUT    /api/users/<id>/update/

GET    /api/topics/
GET    /api/activity/
```

---

*Built with Django REST Framework + React. DevDen v1 was a Django monolith — this is the full rebuild.*