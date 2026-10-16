# To-Do Task Manager (React + Django)

- **Frontend:** React 18 (Vite) in `frontend/`
- **Backend:** Django + Django REST Framework in `backend/`
- **Database:** SQLite (`backend/db.sqlite3`, created by `migrate`; data persists across restarts)

## Run in development (two terminals)
```bash
# Terminal 1 - API on :8000
cd backend
python -m venv venv && source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Terminal 2 - React on :5173 (proxies /api to Django)
cd frontend
npm install
npm run dev          # open http://localhost:5173
```

## Run as a single app (Django serves the built React app)
```bash
cd frontend && npm install && npm run build
cd ../backend && python manage.py migrate && python manage.py runserver   # http://localhost:8000
```
A pre-built `frontend/dist` is included, so you can skip the npm step to try it quickly.

## Tests
```bash
cd backend && python manage.py test -v 2
```

## REST API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/tasks/?status=&priority=&q=&due=YYYY-MM-DD` | List / filter / search |
| GET | `/api/tasks/<id>/` | Get one task |
| POST | `/api/tasks/` | Create (`title` required; `description`, `deadline` YYYY-MM-DD, `priority` Low/Medium/High) |
| PUT | `/api/tasks/<id>/` | Full update |
| PATCH | `/api/tasks/<id>/` | Partial update, e.g. `{"status":"Completed"}` |
| DELETE | `/api/tasks/<id>/` | Delete (204) |
| GET | `/api/tasks/stats/` | total / pending / completed counts |

Validation errors return HTTP 400, e.g. `{"title": ["Title is required and cannot be empty."]}`.

```bash
curl -X POST localhost:8000/api/tasks/ -H "Content-Type: application/json" \
  -d '{"title":"Pay rent","deadline":"2026-11-01","priority":"High"}'
curl -X PATCH localhost:8000/api/tasks/1/ -H "Content-Type: application/json" -d '{"status":"Completed"}'
```

## Deploy (Render, single web service)
1. Push the repo to GitHub, then New > Web Service on render.com.
2. Build command:
   `cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt && python manage.py migrate`
3. Start command: `cd backend && gunicorn config.wsgi`
4. Environment variables: `DJANGO_DEBUG=0`, `DJANGO_SECRET_KEY=<random string>`,
   `DJANGO_ALLOWED_HOSTS=<your-app>.onrender.com`, `DJANGO_CSRF_ORIGINS=https://<your-app>.onrender.com`.
5. Free-tier disks are ephemeral. For permanent data attach a persistent disk and set `TODO_DB=/data/db.sqlite3`.
