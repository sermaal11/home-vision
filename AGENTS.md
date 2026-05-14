# Repository Guidelines

## Project Structure & Module Organization

This repository contains a FastAPI backend, an Angular frontend, and Docker
orchestration. Backend entrypoint code is in `backend/app/main.py`, route
modules live under `backend/app/routes/`, service modules live under
`backend/app/services/`, Python dependencies are in `backend/requirements.txt`,
and container setup is in `backend/Dockerfile`. Frontend code lives in
`frontend/src/`, with the root component in `frontend/src/app/`, shared API
configuration in `frontend/src/app/config/`, frontend services in
`frontend/src/app/services/`, standalone components in
`frontend/src/app/components/`, routed pages in `frontend/src/app/pages/`,
Angular route definitions in `frontend/src/app/app.routes.ts`, Angular configuration in
`frontend/angular.json`, and Node dependencies locked by
`frontend/package-lock.json`. Nginx proxy configuration lives in
`docker/nginx/default.conf`, with local TLS files under `docker/nginx/certs/`
for browser APIs that require a secure context, such as camera access. The
backend includes OpenCV motion processing plus MediaPipe face and hand detection;
keep motion service code under `backend/app/services/motiondetection_service.py`,
face service code under `backend/app/services/face_service.py`, hand service code
under `backend/app/services/hand_service.py`, and their routes under
`backend/app/routes/motiondetection.py`, `backend/app/routes/face.py`, and
`backend/app/routes/hand.py`.

As the project grows, keep backend feature code under `backend/app/` and tests
under `backend/tests/`. Keep Angular component templates, styles, and specs
beside their component. Keep route-level page shells under
`frontend/src/app/pages/<page>/`, and keep reusable UI or feature pieces under
`frontend/src/app/components/<feature>/`.

## Build, Test, and Development Commands

Run the backend locally:

```sh
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Run the frontend locally:

```sh
cd frontend
npm install
npm start
```

Validate frontend changes:

```sh
cd frontend
npm run build
npm test -- --watch=false
```

Run the full container stack with `docker compose up`, or rebuild after
dependency, Dockerfile, or frontend/backend changes with
`docker compose up -d --build`. Backend health is available directly at
`http://localhost:8000/api/health`; module health checks are available at
`http://localhost:8000/api/health/frame` and
`http://localhost:8000/api/health/mediapipe`. Nginx is available at
`https://localhost:8443/` and proxies `/api/` to the backend, so
`https://localhost:8443/api/health` should return JSON. On a LAN host, the same
Nginx routes may be reached with the machine name, for example
`https://homelab:8443/`.

If `docker/nginx/default.conf` changes while containers are running, restart or
reload Nginx before testing the browser again:

```sh
docker compose restart nginx
```

## Coding Style & Naming Conventions

Use Python 3 style with 4-space indentation, `snake_case` functions/modules,
`PascalCase` classes, and `UPPER_SNAKE_CASE` constants. Keep configuration,
API routes, service logic, and OpenCV processing in separate modules as
the backend grows. Use `opencv-python-headless` for containerized image
processing unless GUI functionality is explicitly required. Keep `numpy`,
`opencv-python-headless`, and `mediapipe` version pins aligned in
`backend/requirements.txt`; MediaPipe currently requires NumPy 1.x. The normal
browser entrypoint is Nginx, which serves the frontend and proxies `/api/` from
the same public origin, so do not reintroduce backend CORS unless the project
explicitly needs cross-origin clients.

For Angular, use TypeScript with 2-space indentation, `PascalCase` classes,
`camelCase` members, and `*.spec.ts` tests. Avoid leaving scaffold code,
unused dependencies, or debug logging in committed changes. Keep routed pages
under `frontend/src/app/pages/<page>/` and register public routes in
`frontend/src/app/app.routes.ts`; current public pages include `/`,
`/motion-detection`, `/face-detection`, and `/hand-detection`, with
`/motion-lab` kept as a compatibility redirect. The global header and
navigation live in `frontend/src/app/app.html`; page templates should render
page-specific content below that shell. Use Tailwind CSS utility classes for
styling in Angular templates and avoid component CSS files unless a style cannot
reasonably be expressed with Tailwind.

## Testing Guidelines

Frontend tests use Angular's Vitest integration. Keep tests close to the
component and run `npm test -- --watch=false` before submitting changes. The
current frontend verifies component creation, heading rendering, backend
message rendering, and that `ApiService` reaches `/api/health` through the
shared API route. If the Home health panel changes, keep it aligned with
`/api/health`, `/api/health/frame`, and `/api/health/mediapipe`.

Backend tests are not configured yet. Add `pytest` tests under
`backend/tests/` when new backend behavior is introduced.

## Commit & Pull Request Guidelines

History now follows short conventional-style subjects such as
`feat: agregar configuración de Docker para el backend`. Prefer
`feat:`, `fix:`, `docs:`, `test:`, or `chore:` prefixes with concise Spanish
descriptions.

Pull requests should summarize the change, list validation commands, link
related issues, and mention affected ports, environment variables, Docker
services, or UI behavior.

## Security & Configuration Tips

Do not commit secrets, `.env` files, virtual environments, `node_modules/`,
build outputs, caches, or coverage reports. Keep environment-specific values
out of source. The frontend currently uses same-origin `/api/...` paths,
which works through Nginx and can also be supported in development by running
the backend on port `8000` with an appropriate proxy or direct same-host setup.
Camera access uses `navigator.mediaDevices.getUserMedia`, so test that feature
from a secure origin such as the HTTPS Nginx endpoint. Frame uploads are sent
to `/api/motion` and the processing variants `/api/motion/grayscale`,
`/api/motion/blur`, `/api/motion/difference`, `/api/motion/threshold`,
`/api/motion/contours`, `/api/motion/motion-boxes`, and
`/api/motion/motion-overlay` as `multipart/form-data`. Most processing routes use
the form field name `frame`; `motion-overlay` uses `frame` for the real camera
image and `difference` for the already calculated difference image. The current
backend responds with processed `image/jpeg` blobs, so keep that frontend and
backend contract aligned. The threshold, contours, motion-boxes, and
motion-overlay views are derived from the difference response in the frontend,
so avoid recalculating frame difference inside those routes. The Home page also
validates backend module health through `/api/health/frame` and
`/api/health/mediapipe`; keep those endpoints cheap and side-effect free.
MediaPipe face detection is exposed at `/api/mediapipe/face-box`, Face Mesh is
exposed at `/api/mediapipe/face-mesh`, head pose is exposed at
`/api/mediapipe/head-pose`, and hand landmarks are exposed at
`/api/mediapipe/hands`; hand finger count is exposed at
`/api/mediapipe/hands/finger-counter`. All accept the same `frame` multipart
field and return `image/jpeg` blobs drawn over the submitted frame. Head pose
uses Face Mesh
landmarks with OpenCV `solvePnP`, draws subtle projected 3D axes, and returns
the textual direction in the `X-Head-Pose-Direction` response header. The
`/face-detection` page has live Box, Mesh, and Pose sections laid out as a
three-view grid. The `/hand-detection` page has live Landmarks and Finger Count
sections for MediaPipe Hands. Finger Count returns the total in the
`X-Finger-Count` response header.
`docker/nginx/default.conf` uses Docker's internal resolver (`127.0.0.11`) so
Nginx can resolve `frontend` and `backend` after container IP changes. Restart
Nginx after editing that file.
