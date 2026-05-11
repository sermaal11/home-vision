# Imagen base oficial de Node.js
FROM node:22

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero package.json y package-lock.json
# para aprovechar la cache de Docker
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del proyecto
COPY . .

# Comando que se ejecuta al arrancar el contenedor
CMD ["npm", "start", "--", "--host", "0.0.0.0"]