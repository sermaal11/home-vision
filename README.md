# Home Vision

Home Vision es un proyecto personal nacido de la motivación propia por
aprender, experimentar y explorar conocimientos en arquitectura web y visión
doméstica. La implementación actual integra una API REST mínima con FastAPI,
una interfaz Angular con acceso a cámara del navegador y una capa de
orquestación con Docker Compose y Nginx sobre HTTPS local.

## Objetivos del proyecto

- Diseñar una base modular para una aplicación de visión por computador.
- Separar responsabilidades entre backend, frontend y proxy HTTP.
- Validar la comunicación entre Angular y FastAPI en entorno local.
- Probar captura de vídeo desde el navegador como base para futuras funciones de visión.
- Preparar el repositorio para incorporar procesamiento con OpenCV en fases posteriores.

## Tecnologías utilizadas

| Área | Tecnología |
| --- | --- |
| Backend | Python 3.12, FastAPI, Uvicorn, Pydantic, python-multipart, OpenCV, NumPy |
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
│   │   │   ├── frame.py
│   │   │   └── health.py
│   │   └── services/
│   │       └── system_service.py
│   └── requirements.txt
├── docker/
│   └── nginx/
│       ├── certs/
│       │   ├── nginx.crt
│       │   └── nginx.key
│       └── default.conf
├── frontend/
│   ├── Dockerfile
│   ├── angular.json
│   ├── package.json
│   └── src/app/
│       ├── components/
│       │   └── camera/
│       │       ├── camera.html
│       │       └── camera.ts
│       ├── config/api.config.ts
│       ├── services/api.service.ts
│       └── app.*
├── docker-compose.yml
├── AGENTS.md
└── README.md
```

## Funcionamiento actual

El backend define una aplicación FastAPI en `backend/app/main.py` y expone dos
rutas bajo el prefijo `/api`:

- `GET /api/health`: delega en `backend/app/services/system_service.py` y
  devuelve el estado básico del sistema.
- `POST /api/frame`: recibe un archivo multipart en el campo `frame`; se usa
  para enviar capturas JPEG desde la cámara del navegador.

Respuesta actual de `GET /api/health`:

```json
{"status":"ok","message":"Home Vision Backend is running!"}
```

El frontend muestra el título `Home Vision`, consulta ese endpoint desde
`ApiService` usando la ruta compartida definida en
`frontend/src/app/config/api.config.ts`, y renderiza un componente de cámara en
`frontend/src/app/components/camera/`.

El componente `CameraComponent` usa `navigator.mediaDevices.getUserMedia` para
pedir acceso a la cámara, mostrar el vídeo en un elemento `<video>`, capturar
frames en un `<canvas>` oculto y enviarlos al backend como `multipart/form-data`
al endpoint `/api/frame`. Esta API requiere un contexto seguro en navegadores
modernos, por eso Nginx se sirve por HTTPS local.

Cuando se accede por Nginx, el navegador llama a `/api/health` y `/api/frame`
sobre el mismo origen (`https://localhost:8443` o `https://homelab:8443`) y
Nginx reenvía esas peticiones al servicio backend. Como frontend y API se
sirven desde el mismo origen público, el backend no necesita configurar CORS en
este flujo.

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
- Recepción de frames: `http://localhost:8000/api/frame`
- Frontend Angular: `http://localhost:4200/`

Nota: el frontend usa `/api/health` como ruta relativa. En Docker funciona por
Nginx. Si ejecutas Angular directamente en `4200`, asegúrate de servir o
proxificar `/api/` hacia el backend. Para probar la cámara, usa un origen
seguro; la ruta recomendada es Nginx con HTTPS.

## Ejecución con Docker

Levantar todos los servicios:

```sh
docker compose up
```

Docker Compose construye y ejecuta tres servicios:

- `backend`: API FastAPI expuesta en `http://localhost:8000/api/health`.
- `frontend`: servidor de desarrollo Angular dentro del contenedor.
- `nginx`: proxy HTTPS disponible en `https://localhost:8443/`; reenvía `/api/` al backend.

En una máquina de red local también puede accederse usando el nombre del host,
por ejemplo `https://homelab:8443/` y `https://homelab:8443/api/health`.

Los certificados locales usados por Nginx están en `docker/nginx/certs/`. Al
usar certificados autofirmados, el navegador puede pedir confirmar la excepción
de seguridad antes de cargar la aplicación.

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
- Endpoint `/api/frame` disponible para recibir frames multipart en el campo `frame`.
- Cámara disponible desde el componente Angular cuando el navegador concede permiso.
- No existe todavía una suite de pruebas backend.

## Estado y trabajo futuro

El proyecto se encuentra en una fase inicial. La integración base entre
frontend y backend ya está validada, pero todavía falta implementar el dominio
principal de visión doméstica. Próximos pasos recomendados:

- Añadir módulos backend para recepción, captura o procesamiento de imagen.
- Extraer la URL del backend a configuración de entorno cuando haya despliegues diferenciados.
- Añadir pruebas backend con `pytest`.
- Ampliar componentes Angular para visualizar resultados de visión.
- Preparar configuración diferenciada para desarrollo y producción.

## Consideraciones

No deben versionarse secretos, archivos `.env`, entornos virtuales,
`node_modules/`, builds, caches ni resultados de cobertura. Las dependencias se
reconstruyen desde `backend/requirements.txt` y `frontend/package-lock.json`.
Los certificados locales de desarrollo no deben reutilizarse como credenciales
de producción.
