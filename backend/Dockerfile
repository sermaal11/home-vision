# Imagen base oficial de Python
FROM python:3.12-slim

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos requirements primero para aprovechar cache
COPY requirements.txt .

# Instalamos dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del proyecto
COPY . .

# Comando de arranque del backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--reload"]