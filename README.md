# Home Vision

Home Vision es un proyecto personal nacido de la motivación propia por
aprender, experimentar y explorar conocimientos en arquitectura web y visión
doméstica. La implementación actual integra una API REST mínima con FastAPI,
una interfaz Angular y una capa de orquestación con Docker Compose y Nginx.

## Objetivos del proyecto

- Diseñar una base modular para una aplicación de visión por computador.
- Separar responsabilidades entre backend, frontend y proxy HTTP.
- Validar la comunicación entre Angular y FastAPI en entorno local.
- Preparar el repositorio para incorporar procesamiento con OpenCV en fases posteriores.

## Tecnologías utilizadas

| Área | Tecnología |
| --- | --- |
| Backend | Python 3.12, FastAPI, Uvicorn, Pydantic, OpenCV, NumPy |
| Frontend | Angular 21, TypeScript, Tailwind CSS, Vitest |
| Infraestructura | Docker, Docker Compose, Nginx |

## Estructura del repositorio

```text
.
├── backend/
│   ├── Dockerfile
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   └── health.py
│   │   └── services/
│   │       └── system_service.py
│   └── requirements.txt
├── docker/
│   └── nginx/default.conf
├── frontend/
│   ├── Dockerfile
│   ├── angular.json
│   ├── package.json
│   └── src/app/
│       ├── config/api.config.ts
│       ├── services/api.service.ts
│       └── app.*
├── docker-compose.yml
├── AGENTS.md
└── README.md
```

## Funcionamiento actual

El backend define una aplicación FastAPI en `backend/app/main.py` y expone el
endpoint `GET /api/health`. La ruta delega en
`backend/app/services/system_service.py`, que devuelve el estado básico del
sistema:

```json
{"status":"ok","message":"Home Vision Backend is running!"}
```

El frontend muestra el título `Home Vision` y consulta ese endpoint desde
`ApiService`, usando la ruta compartida definida en
`frontend/src/app/config/api.config.ts`.

Cuando se accede por Nginx, el navegador llama a `/api/health` sobre el mismo
origen (`http://localhost:8080` o `http://homelab:8080`) y Nginx reenvía esa
petición al servicio backend.

## Ejecución local

Backend:

```sh
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```sh
cd frontend
npm install
npm start
```

URLs principales:

- Backend: `http://localhost:8000/api/health`
- Frontend Angular: `http://localhost:4200/`

Nota: el frontend usa `/api/health` como ruta relativa. En Docker funciona por
Nginx. Si ejecutas Angular directamente en `4200`, asegúrate de servir o
proxificar `/api/` hacia el backend.

## Ejecución con Docker

Levantar todos los servicios:

```sh
docker compose up
```

Docker Compose construye y ejecuta tres servicios:

- `backend`: API FastAPI expuesta en `http://localhost:8000/api/health`.
- `frontend`: servidor de desarrollo Angular dentro del contenedor.
- `nginx`: proxy disponible en `http://localhost:8080/`; reenvía `/api/` al backend.

En una máquina de red local también puede accederse usando el nombre del host,
por ejemplo `http://homelab:8080/` y `http://homelab:8080/api/health`.

Si se modifica `docker/nginx/default.conf` con los contenedores ya levantados,
recarga o reinicia Nginx para aplicar la nueva configuración:

```sh
docker compose restart nginx
```

## Pruebas y validación

Frontend:

```sh
cd frontend
npm test -- --watch=false
npm run build
```

Estado auditado:

- Build Angular correcta.
- Suite frontend correcta: 1 archivo de pruebas, 4 tests.
- Endpoint de salud del backend disponible en `/api/health`.
- No existe todavía una suite de pruebas backend.

## Estado y trabajo futuro

El proyecto se encuentra en una fase inicial. La integración base entre
frontend y backend ya está validada, pero todavía falta implementar el dominio
principal de visión doméstica. Próximos pasos recomendados:

- Añadir módulos backend para captura o procesamiento de imagen.
- Extraer la URL del backend a configuración de entorno cuando haya despliegues diferenciados.
- Añadir pruebas backend con `pytest`.
- Definir componentes Angular específicos para visualizar resultados.
- Preparar configuración diferenciada para desarrollo y producción.

## Consideraciones

No deben versionarse secretos, archivos `.env`, entornos virtuales,
`node_modules/`, builds, caches ni resultados de cobertura. Las dependencias se
reconstruyen desde `backend/requirements.txt` y `frontend/package-lock.json`.
