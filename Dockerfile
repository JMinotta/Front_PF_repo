# Etapa 1: Construcción
FROM node:20-alpine as build-stage

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:stable-alpine as production-stage

# Copiar los archivos construidos desde la etapa anterior
# Vite por defecto construye en la carpeta 'dist'
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
