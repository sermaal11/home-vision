# importar la clase FastAPI del módulo fastapi
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Crear la aplicacion principal del backend utilizando la clase FastAPI
# "app" sera el objeto que maneje todas las rutas/endpoints de la API
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Decorador: (un decorador es una función que modifica el comportamiento de otra función)
# Indica que esta función se ejecutará cuando se haga una solicitud GET a la ruta "/"
#
# Ejemplo: http://localhost:8000/ -> esta ruta se corresponde con la función "root"
@app.get("/")
def root():
    return {"message": "Backend is running!"}
