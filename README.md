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
- Procesar frames en el backend con OpenCV y devolver vistas en escala de grises,
  desenfoque, diferencia, umbralización, contornos, cajas de movimiento y
  superposición sobre la imagen real.

## Tecnologías utilizadas

| Área | Tecnología |
| --- | --- |
| Backend | Python 3.12, FastAPI, Uvicorn, Pydantic, python-multipart, OpenCV headless, NumPy |
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
│   │       ├── frame_service.py
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

El backend define una aplicación FastAPI en `backend/app/main.py` y expone
varias rutas bajo el prefijo `/api`:

- `GET /api/health`: delega en `backend/app/services/system_service.py` y
  devuelve el estado básico del sistema.
- `POST /api/frame`: recibe un archivo multipart en el campo `frame`, decodifica
  el JPEG con OpenCV y devuelve otro JPEG con `Content-Type: image/jpeg`.
- `POST /api/frame/grayscale`: recibe el mismo formato de frame, lo transforma
  a escala de grises y devuelve un JPEG procesado.
- `POST /api/frame/blur`: recibe el mismo formato de frame, lo transforma a
  escala de grises, aplica un desenfoque gaussiano y devuelve un JPEG procesado.
- `POST /api/frame/difference`: recibe el mismo formato de frame, lo transforma
  a escala de grises, aplica desenfoque y devuelve un JPEG con la diferencia
  respecto al frame anterior procesado.
- `POST /api/frame/threshold`: recibe un frame, lo transforma a escala de
  grises, aplica un umbral binario y devuelve un JPEG procesado.
- `POST /api/frame/contours`: recibe un frame, lo transforma a escala de
  grises, aplica un umbral binario, detecta contornos externos y devuelve un
  JPEG con los contornos dibujados en verde.
- `POST /api/frame/motion-boxes`: recibe un frame, lo transforma a escala de
  grises, aplica un umbral binario, detecta contornos externos y devuelve un
  JPEG con rectángulos verdes alrededor de las áreas de movimiento relevantes.
- `POST /api/frame/motion-overlay`: recibe dos archivos multipart, `frame` con
  la imagen real y `difference` con la diferencia entre frames; usa la
  diferencia para detectar contornos y devuelve el frame real con rectángulos
  rojos sobre las áreas de movimiento relevantes.

Respuesta actual de `GET /api/health`:

```json
{"status":"ok","message":"Home Vision Backend is running!"}
```

El frontend muestra el título `Home Vision`, consulta ese endpoint desde
`ApiService` usando la ruta compartida definida en
`frontend/src/app/config/api.config.ts`, y renderiza un componente de cámara en
`frontend/src/app/components/camera/`.

El componente `CameraComponent` usa `navigator.mediaDevices.getUserMedia` para
pedir acceso a la cámara, mostrar el vídeo original en un elemento `<video>`,
capturar frames en un `<canvas>` oculto y enviarlos al backend como
`multipart/form-data` a los endpoints `/api/frame/grayscale`,
`/api/frame/blur` y `/api/frame/difference`. La respuesta de diferencia se
envía después a `/api/frame/threshold`, `/api/frame/contours` y
`/api/frame/motion-boxes` para calcular la vista umbralizada, la vista con
contornos y la vista con cajas de movimiento sobre esa misma diferencia. Para
`/api/frame/motion-overlay`, envía el frame original en el campo `frame` y la
diferencia en el campo `difference`, de modo que el backend dibuje las cajas
sobre la imagen real. Las respuestas se consumen como `Blob`, se convierten en
URLs temporales y se muestran junto al vídeo original como vistas procesadas en
escala de grises, con desenfoque, con diferencia entre frames, con
umbralización, con contornos, con cajas de movimiento y con overlay de
movimiento. Esta API requiere un contexto seguro en navegadores modernos, por
eso Nginx se sirve por HTTPS local.

Cuando se accede por Nginx, el navegador llama a `/api/health` y a las rutas
`/api/frame...` sobre el mismo origen (`https://localhost:8443` o
`https://homelab:8443`) y Nginx reenvía esas peticiones al servicio backend.
Como frontend y API se sirven desde el mismo origen público, el backend no
necesita configurar CORS en este flujo.

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
- Procesado en escala de grises: `http://localhost:8000/api/frame/grayscale`
- Procesado con desenfoque: `http://localhost:8000/api/frame/blur`
- Procesado de diferencia entre frames: `http://localhost:8000/api/frame/difference`
- Procesado con umbral binario: `http://localhost:8000/api/frame/threshold`
- Procesado con detección de contornos: `http://localhost:8000/api/frame/contours`
- Procesado con cajas de movimiento: `http://localhost:8000/api/frame/motion-boxes`
- Procesado con overlay de movimiento: `http://localhost:8000/api/frame/motion-overlay`
- Frontend Angular: `http://localhost:4200/`

Nota: el frontend usa rutas `/api/...` relativas. En Docker funcionan por
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
- Endpoint `/api/frame` disponible para recibir frames multipart en el campo
  `frame` y devolver un JPEG.
- Endpoint `/api/frame/grayscale` disponible para devolver un JPEG procesado en
  escala de grises.
- Endpoint `/api/frame/blur` disponible para devolver un JPEG procesado con
  escala de grises y desenfoque gaussiano.
- Endpoint `/api/frame/difference` disponible para devolver un JPEG procesado
  con la diferencia respecto al frame anterior.
- Endpoint `/api/frame/threshold` disponible para devolver un JPEG procesado
  con umbral binario.
- Endpoint `/api/frame/contours` disponible para devolver un JPEG procesado
  con contornos dibujados sobre la imagen umbralizada.
- Endpoint `/api/frame/motion-boxes` disponible para devolver un JPEG procesado
  con rectángulos verdes sobre las áreas de movimiento relevantes.
- Endpoint `/api/frame/motion-overlay` disponible para devolver el frame real
  con rectángulos rojos sobre las áreas de movimiento relevantes.
- Cámara disponible desde el componente Angular cuando el navegador concede permiso.
- Visualización del vídeo original junto a las imágenes procesadas.
- No existe todavía una suite de pruebas backend.

## Estado y trabajo futuro

El proyecto se encuentra en una fase inicial. La integración base entre
frontend y backend ya está validada, pero todavía falta implementar el dominio
principal de visión doméstica. Próximos pasos recomendados:

- Extraer el procesamiento de imagen a un servicio backend dedicado cuando crezca.
- Extraer la URL del backend a configuración de entorno cuando haya despliegues diferenciados.
- Añadir pruebas backend con `pytest`.
- Ampliar componentes Angular para visualizar más resultados de visión.
- Preparar configuración diferenciada para desarrollo y producción.

## Consideraciones

No deben versionarse secretos, archivos `.env`, entornos virtuales,
`node_modules/`, builds, caches ni resultados de cobertura. Las dependencias se
reconstruyen desde `backend/requirements.txt` y `frontend/package-lock.json`.
Los certificados locales de desarrollo no deben reutilizarse como credenciales
de producción.
