FROM node:20-alpine

WORKDIR /app

# Zależności do kompilacji natywnych modułów
RUN apk add --no-cache python3 make g++

# Kopiuj package.json i package-lock.json
COPY package*.json ./

# Instaluj zależności WEWNĄTRZ kontenera
RUN npm ci

# Kopiuj kod aplikacji (bez node_modules)
COPY . .

# Expose port
EXPOSE 3001

# Uruchom aplikację
CMD ["node", "server.js"]