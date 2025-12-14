FROM node:20-alpine

WORKDIR /app

# Kopiuj package.json i package-lock.json
COPY package*.json ./

# Instaluj zależności
RUN npm ci --only=production

# Kopiuj kod aplikacji
COPY . .

# Expose port
EXPOSE 3001

# Uruchom aplikację
CMD ["node", "server.js"]