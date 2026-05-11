# importar la clase FastAPI del módulo fastapi
from fastapi import FastAPI

# Crear la aplicacion principal del backend utilizando la clase FastAPI
# "app" sera el objeto que maneje todas las rutas/endpoints de la API
app = FastAPI()

# Decorador: (un decorador es una función que modifica el comportamiento de otra función)
# Indica que esta función se ejecutará cuando se haga una solicitud GET a la ruta "/"
#
# Ejemplo: http://localhost:8000/ -> esta ruta se corresponde con la función "root"
@app.get("/")
def root():
	return {"message": "Backend is running!"}
