# home-vision

Aplicación inicial de visión doméstica con un backend Python basado en FastAPI. El backend ya expone un endpoint de comprobación en `/`; el frontend está creado como carpeta, pero todavía no contiene una aplicación.

## Estado actual

- `backend/main.py` crea la instancia `FastAPI` y define `GET /`.
- `backend/requirements.txt` fija dependencias para FastAPI, Uvicorn, OpenCV, NumPy y Pydantic.
- `frontend/` existe, pero no tiene proyecto, scripts ni assets todavía.
- No hay pruebas automatizadas configuradas.
- `.gitignore` excluye `backend/venv/`, caches de Python, `node_modules/`, archivos de editor y `AGENTS.md`.

## Estructura

```text
.
├── .gitignore
├── AGENTS.md
├── README.md
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── venv/
└── frontend/
```

## Preparar el backend

Desde la raíz del repositorio:

```sh
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Si `backend/venv/` ya existe, solo activa el entorno:

```sh
cd backend
source venv/bin/activate
```

## Ejecutar el backend

Con el entorno virtual activo, ejecuta:

```sh
cd backend
uvicorn main:app --reload
```

Comprueba el servicio en:

```text
http://localhost:8000/
```

La respuesta esperada es:

```json
{"message":"Backend is running!"}
```

## Pruebas

Todavía no hay suite de pruebas. Cuando se añadan tests, se recomienda usar `pytest` en `backend/tests/` y documentar aquí el comando exacto.

## Contribución

Consulta `AGENTS.md` para convenciones de estructura, estilo, pruebas y pull requests. No subas secretos, archivos `.env`, artefactos generados ni entornos virtuales.
