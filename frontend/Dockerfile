# Étape de build
FROM node:18-alpine as build

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code source
COPY . .

# Build de l'application
RUN npm run build

# Étape de production
FROM nginx:alpine

# Copie des fichiers buildés vers nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copie de la configuration nginx personnalisée si nécessaire
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 