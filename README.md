# home-vision

Aplicación inicial de visión doméstica con backend FastAPI y frontend Angular.
El backend expone un endpoint de comprobación en `/`; el frontend es una app
Angular limpia, sin plantilla visual ni assets por defecto.

## Estado actual

- `backend/main.py` crea la instancia `FastAPI` y define `GET /`.
- `backend/requirements.txt` fija FastAPI, Uvicorn, OpenCV, NumPy y Pydantic.
- `frontend/` contiene una aplicación Angular 21 con Vitest y Tailwind CSS.
- `frontend/src/app/` contiene el componente raíz que muestra el estado del backend.
- `docker-compose.yml` levanta frontend, backend y Nginx para desarrollo con contenedores.
- `.gitignore` excluye entornos virtuales, caches, `node_modules/`, `dist/` y cobertura.

## Estructura

```text
.
├── README.md
├── docker-compose.yml
├── backend/
│   ├── main.py
│   └── requirements.txt
├── docker/
│   └── nginx/
│       └── default.conf
└── frontend/
    ├── angular.json
    ├── package-lock.json
    ├── package.json
    ├── public/
    └── src/
        ├── app/
        │   ├── app.config.ts
        │   ├── app.css
        │   ├── app.html
        │   ├── app.spec.ts
        │   └── app.ts
        ├── index.html
        ├── main.ts
        └── styles.css
```

## Backend

Preparar dependencias:

```sh
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Ejecutar API:

```sh
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

Comprueba `http://localhost:8000/`. La respuesta esperada es:

```json
{"message":"Backend is running!"}
```

## Frontend

La aplicación Angular fue generada con Angular CLI 21.2.10. Usa TypeScript,
Vitest para pruebas unitarias y Tailwind CSS importado desde
`frontend/src/styles.css`. La plantilla de bienvenida, el favicon y las
dependencias no usadas del scaffold inicial fueron eliminadas.

Instalar dependencias y arrancar el servidor de desarrollo:

```sh
cd frontend
npm install
npm start
```

La app se sirve en `http://localhost:4200/` y consume el backend en
`http://localhost:8000/`.

Comandos útiles:

```sh
npm run build
npm test
```

`npm run build` genera la build de producción. `npm test` ejecuta las pruebas
unitarias configuradas por Angular/Vitest.

## Docker

Levantar todos los servicios:

```sh
docker compose up
```

Con Docker Compose, Nginx sirve el frontend en `http://localhost:8080/` y el
backend queda expuesto directamente en `http://localhost:8000/`. El frontend
usa esa URL del backend tanto desde `localhost:4200` como desde
`localhost:8080`.

Generar nuevos elementos con Angular CLI:

```sh
cd frontend
npm run ng -- generate component nombre-componente
```

Mantén componentes, plantillas, estilos y pruebas agrupados por funcionalidad
dentro de `frontend/src/app/`. Coloca assets públicos en `frontend/public/`.

## Pruebas

El frontend ya incluye una prueba base en `frontend/src/app/app.spec.ts`. El
backend aún no tiene suite de pruebas; cuando se añada, usa `pytest` en
`backend/tests/`.

## Contribución

No subas secretos, archivos `.env`, entornos virtuales, dependencias instaladas
ni artefactos generados. Documenta cualquier nuevo comando o requisito de
configuración en este README.
