FROM node:20-bullseye-slim

WORKDIR /app

# Instalar dependencias necesarias
COPY package*.json ./
RUN npm install

# Copiar el codigo fuente
COPY . .

# Construir la app de vite
RUN npm run build

# Exponer el puerto
EXPOSE 3000

# Arrancar el servidor adaptador de Express con TSX
CMD ["npx", "tsx", "server.ts"]
