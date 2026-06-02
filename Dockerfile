# --- étape de build ---
FROM node:20.11-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- étape d'exécution (minimale, non-root) ---
FROM node:20.11-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER app
EXPOSE 3000
CMD ["node", "dist/server.js"]
