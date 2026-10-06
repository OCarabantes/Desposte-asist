FROM node:20-bullseye-slim

WORKDIR /app

# PostgreSQL client for complete database backups (version must match or exceed server).
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates gnupg \
    && install -d /usr/share/postgresql-common/pgdg \
    && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
    && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt bullseye-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update && apt-get install -y --no-install-recommends postgresql-client-18 \
    && rm -rf /var/lib/apt/lists/*

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
