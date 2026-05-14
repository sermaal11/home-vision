# Home Vision

Home Vision es un laboratorio local de vision por computador construido con
FastAPI, Angular, OpenCV y MediaPipe. El objetivo del proyecto es mostrar, de
forma visual y pedagogica, como una aplicacion web puede capturar frames desde
la camara del navegador, enviarlos a un backend de procesamiento y devolver
imagenes transformadas que ayudan a entender conceptos clasicos de vision por
computador.

El repositorio combina una API REST, una interfaz Angular, procesamiento de
imagen en Python y una capa de Nginx con HTTPS local para poder usar APIs de
camara del navegador desde un origen seguro.

## Objetivos

- Servir como proyecto academico para aprender vision por computador desde una
  interfaz web.
- Separar claramente captura, transporte, procesamiento y visualizacion.
- Mostrar el pipeline completo de deteccion de movimiento con OpenCV.
- Mostrar deteccion facial, malla facial, pose de cabeza, landmarks de manos y
  conteo de dedos con MediaPipe.
- Documentar los endpoints y los conceptos tecnicos para que el proyecto pueda
  leerse como material de estudio.

## Stack

| Area | Tecnologia | Uso |
| --- | --- | --- |
| Backend | Python 3.12, FastAPI, Uvicorn | API REST y orquestacion de rutas |
| Vision | OpenCV headless, NumPy | Procesamiento de frames, diferencias, umbrales, contornos y dibujos |
| Modelos | MediaPipe | Face Detection, Face Mesh y Hands |
| Frontend | Angular 21, TypeScript, Tailwind CSS | Captura de camara, UI didactica y visualizacion de blobs |
| Testing | Vitest, Angular test runner | Pruebas del shell principal de frontend |
| Infraestructura | Docker Compose, Nginx | Servicios locales y proxy HTTPS |

## Arquitectura

```text
Navegador
  |
  | getUserMedia + canvas hidden
  v
Angular frontend
  |
  | multipart/form-data con campo frame
  v
FastAPI backend
  |
  | OpenCV / MediaPipe
  v
Respuesta image/jpeg (+ headers cuando aplica)
  |
  v
Angular muestra la imagen procesada como Blob URL
```

El frontend usa rutas relativas `/api/...`. En Docker, Nginx sirve el frontend
y reenvia `/api/` al backend, por lo que la aplicacion funciona desde el mismo
origen publico y no necesita CORS para el flujo normal.

## Estructura Del Repositorio

```text
.
├── backend/
│   ├── Dockerfile
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── face.py
│   │   │   ├── hand.py
│   │   │   ├── health.py
│   │   │   └── motiondetection.py
│   │   └── services/
│   │       ├── face_service.py
│   │       ├── hand_service.py
│   │       ├── motiondetection_service.py
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
│       ├── app.routes.ts
│       ├── config/api.config.ts
│       ├── pages/
│       │   ├── face-detection/
│       │   ├── hand-detection/
│       │   ├── home/
│       │   └── motion-detection/
│       ├── services/api.service.ts
│       └── app.*
├── docker-compose.yml
├── AGENTS.md
└── README.md
```

## Paginas Del Frontend

### Home

La Home presenta el proyecto como laboratorio de aprendizaje, muestra el stack
principal y valida la salud del backend mediante:

- `/api/health`
- `/api/health/frame`
- `/api/health/mediapipe`

Tambien incluye un mapa academico de los conceptos que aparecen en las paginas:
OpenCV y NumPy, MediaPipe y geometria de camara.

### Motion Detection

La pagina `/motion-detection` conserva las 8 vistas del pipeline completo. Su
valor didactico esta precisamente en ver cada etapa intermedia antes del
resultado final:

1. `Original`: frame capturado desde la camara.
2. `Greyscale`: conversion a escala de grises.
3. `Blur`: desenfoque gaussiano para reducir ruido.
4. `Difference`: diferencia frente al frame anterior.
5. `Thresholding`: mascara binaria de cambios relevantes.
6. `Contours`: regiones conectadas sobre la mascara.
7. `Motion Boxes`: cajas sobre regiones de movimiento.
8. `Motion Overlay`: cajas de movimiento sobre el frame real.

Conceptualmente, esta pagina enseña un pipeline clasico de vision por
computador sin modelos de aprendizaje automatico: conversion de color,
suavizado, diferencia temporal, segmentacion y extraccion de contornos.

### Face Detection

La pagina `/face-detection` muestra tres vistas en una grid de tres columnas en
escritorio:

- `Box`: deteccion facial con caja y confianza.
- `Mesh`: landmarks y conexiones de Face Mesh.
- `Pose`: estimacion de pose de cabeza con ejes 3D sutiles y direccion textual.

Las tarjetas superiores explican conceptos generales, mientras que los hovers
de cada imagen explican la vista concreta y el endpoint usado. La pose de
cabeza usa landmarks estables de Face Mesh, un modelo 3D aproximado y
`cv2.solvePnP`. La direccion estimada llega al frontend mediante la cabecera
`X-Head-Pose-Direction`.

### Hand Detection

La pagina `/hand-detection` muestra dos vistas:

- `Landmarks`: landmarks y conexiones de MediaPipe Hands.
- `Finger Count`: imagen limpia con una etiqueta de dedos levantados, sin
  landmarks repetidos, y un badge de total al lado del titulo.

El conteo de dedos usa posiciones relativas de landmarks. Para indice, medio,
anular y menique compara la punta del dedo con su articulacion PIP. Para el
pulgar usa la lateralidad de MediaPipe Hands. El total llega al frontend con la
cabecera `X-Finger-Count`.

La vista de Finger Count funciona mejor con la palma abierta mirando hacia la
camara, porque la heuristica depende de la posicion relativa de los dedos en la
imagen.

## Conceptos De Vision Por Computador

### Frames Como Matrices

Cada frame de video se transforma en una matriz de pixeles. OpenCV opera sobre
esas matrices, normalmente apoyandose en NumPy. Una imagen no es tratada como
un elemento visual abstracto, sino como datos numericos que pueden transformarse
con operaciones matematicas.

### Preprocesado

La escala de grises reduce la imagen a intensidad luminica. El desenfoque
gaussiano suaviza ruido, compresion y pequenas variaciones de luz. Estas etapas
preparan el frame para que las siguientes operaciones sean mas estables.

### Diferencia Temporal

La deteccion de movimiento compara el frame actual con el anterior. Las zonas
que cambian aparecen como regiones claras en la diferencia. Esta tecnica detecta
cambio visual, no identidad de objetos.

### Umbral Y Contornos

El umbral convierte una imagen de diferencias en una mascara binaria. Los
contornos agrupan pixeles conectados y permiten pasar de puntos sueltos a
regiones interpretables, como cajas de movimiento.

### Landmarks

Un landmark es un punto clave predicho por un modelo. En Face Mesh representa
rasgos faciales; en Hands representa partes de la mano. Los landmarks permiten
medir distancias, relaciones geometricas y posturas.

### Pose De Cabeza Con solvePnP

`solvePnP` estima la posicion y orientacion de un objeto 3D a partir de puntos
2D observados en una imagen. Home Vision lo usa con landmarks faciales y un
modelo 3D aproximado de cabeza para proyectar ejes sobre el rostro y estimar
si la cabeza mira al centro, a los lados, arriba o abajo.

## Endpoints

Todas las rutas de imagen aceptan `multipart/form-data`. Salvo que se indique
otra cosa, el campo de archivo se llama `frame` y la respuesta es `image/jpeg`.

### Salud

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/api/health` | Estado basico del backend |
| GET | `/api/health/frame` | Carga de OpenCV y NumPy |
| GET | `/api/health/mediapipe` | Carga de MediaPipe |

Respuesta de `/api/health`:

```json
{"status":"ok","message":"Home Vision Backend is running!"}
```

Ejemplo de `/api/health/frame`:

```json
{"opencv_loaded":true,"numpy_loaded":true,"opencv_version":"4.11.0","numpy_version":"1.26.4"}
```

Ejemplo de `/api/health/mediapipe`:

```json
{"mediapipe_loaded":true}
```

### Movimiento

| Metodo | Ruta | Resultado |
| --- | --- | --- |
| POST | `/api/motion` | Frame decodificado y reemitido como JPEG |
| POST | `/api/motion/grayscale` | Frame en escala de grises |
| POST | `/api/motion/blur` | Escala de grises con desenfoque gaussiano |
| POST | `/api/motion/difference` | Diferencia frente al frame anterior |
| POST | `/api/motion/threshold` | Mascara binaria de diferencia |
| POST | `/api/motion/contours` | Contornos externos dibujados |
| POST | `/api/motion/motion-boxes` | Cajas sobre areas de movimiento |
| POST | `/api/motion/motion-overlay` | Cajas de movimiento sobre el frame real |

`/api/motion/motion-overlay` recibe dos campos: `frame` con la imagen real y
`difference` con la diferencia ya calculada.

### MediaPipe

| Metodo | Ruta | Resultado |
| --- | --- | --- |
| POST | `/api/mediapipe/face-box` | Caja facial y confianza |
| POST | `/api/mediapipe/face-mesh` | Malla facial de landmarks |
| POST | `/api/mediapipe/head-pose` | Ejes 3D sutiles y header `X-Head-Pose-Direction` |
| POST | `/api/mediapipe/hands` | Landmarks y conexiones de manos |
| POST | `/api/mediapipe/hands/finger-counter` | Etiqueta de dedos levantados y header `X-Finger-Count` |

## Ejecucion Local

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

- Frontend Angular: `http://localhost:4200/`
- Backend: `http://localhost:8000/api/health`
- Motion Detection: `http://localhost:4200/motion-detection`
- Face Detection: `http://localhost:4200/face-detection`
- Hand Detection: `http://localhost:4200/hand-detection`
- Redireccion compatible: `http://localhost:4200/motion-lab`

Si se ejecuta Angular directamente en `4200`, las rutas `/api/...` deben estar
proxificadas o servidas desde un mismo host que el backend. Para usar la camara
en navegadores modernos, se recomienda probar desde el endpoint HTTPS de Nginx.

## Ejecucion Con Docker

Levantar todos los servicios:

```sh
docker compose up
```

Reconstruir imagenes:

```sh
docker compose up -d --build
```

Servicios:

- `backend`: FastAPI en `http://localhost:8000`.
- `frontend`: servidor Angular dentro del contenedor.
- `nginx`: proxy HTTPS en `https://localhost:8443/`.

Nginx reenvia `/api/` al backend y el resto de rutas al frontend. En red local
tambien puede accederse con el nombre de la maquina, por ejemplo
`https://homelab:8443/`.

Si se modifica `docker/nginx/default.conf` con los contenedores levantados:

```sh
docker compose restart nginx
```

## Ejemplos Con curl

Salud:

```sh
curl http://localhost:8000/api/health
curl http://localhost:8000/api/health/frame
curl http://localhost:8000/api/health/mediapipe
curl -k https://localhost:8443/api/health
```

MediaPipe:

```sh
curl -o face-box.jpg -F "frame=@/ruta/a/frame.jpg" http://localhost:8000/api/mediapipe/face-box
curl -o face-mesh.jpg -F "frame=@/ruta/a/frame.jpg" http://localhost:8000/api/mediapipe/face-mesh
curl -D head-pose.headers -o head-pose.jpg -F "frame=@/ruta/a/frame.jpg" http://localhost:8000/api/mediapipe/head-pose
curl -o hands.jpg -F "frame=@/ruta/a/frame.jpg" http://localhost:8000/api/mediapipe/hands
curl -D finger-count.headers -o finger-count.jpg -F "frame=@/ruta/a/frame.jpg" http://localhost:8000/api/mediapipe/hands/finger-counter
```

Motion:

```sh
curl -o motion.jpg -F "frame=@/ruta/a/frame.jpg" http://localhost:8000/api/motion
curl -o grayscale.jpg -F "frame=@/ruta/a/frame.jpg" http://localhost:8000/api/motion/grayscale
curl -o blur.jpg -F "frame=@/ruta/a/frame.jpg" http://localhost:8000/api/motion/blur
curl -o difference.jpg -F "frame=@/ruta/a/frame.jpg" http://localhost:8000/api/motion/difference
curl -o threshold.jpg -F "frame=@/ruta/a/frame.jpg" http://localhost:8000/api/motion/threshold
curl -o contours.jpg -F "frame=@/ruta/a/frame.jpg" http://localhost:8000/api/motion/contours
curl -o boxes.jpg -F "frame=@/ruta/a/frame.jpg" http://localhost:8000/api/motion/motion-boxes
curl -o overlay.jpg -F "frame=@/ruta/a/frame.jpg" -F "difference=@/ruta/a/difference.jpg" http://localhost:8000/api/motion/motion-overlay
```

## Uso De IA En El Proyecto

La inteligencia artificial se ha usado como apoyo de desarrollo y aprendizaje,
no como sustituto de la comprension tecnica del proyecto. En particular, se ha
utilizado para:

- Diseñar y revisar la arquitectura entre Angular, FastAPI, OpenCV, MediaPipe,
  Docker Compose y Nginx.
- Iterar sobre la implementacion de endpoints y vistas, manteniendo alineados
  los contratos entre frontend y backend.
- Explicar conceptos de vision por computador dentro de la interfaz y en este
  README con un enfoque academico.
- Auditar duplicaciones de contenido, coherencia visual, nombres de endpoints y
  documentacion obsoleta.
- Ayudar a interpretar tecnicas como diferencia temporal, landmarks, conteo de
  dedos y estimacion de pose con `solvePnP`.

Las decisiones finales de alcance, diseño funcional y validacion se han
realizado revisando el codigo, ejecutando builds y tests, y contrastando que las
vistas respondan al comportamiento esperado del proyecto.

## Validacion

Frontend:

```sh
cd frontend
npm run build
npm test -- --watch=false
```

Backend:

```sh
python3 -m compileall backend/app
```

Auditoria final del proyecto:

- Angular build correcto.
- Suite frontend correcta: 1 archivo de pruebas, 3 tests.
- Backend Python compilable con `compileall`.
- Rutas publicas disponibles: `/`, `/motion-detection`, `/face-detection`,
  `/hand-detection` y redireccion `/motion-lab`.
- Las paginas de vision mantienen estructura academica consistente: introduccion,
  tarjetas conceptuales, hovers explicativos y vistas procesadas.
- Motion Detection conserva las 8 etapas del pipeline.
- Face Detection muestra Box, Mesh y Pose en una grid de 3 vistas.
- Hand Detection muestra Landmarks y Finger Count sin duplicar landmarks en la
  vista de conteo.
