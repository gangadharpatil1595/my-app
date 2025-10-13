# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app

# copy the dependency files if they exist
COPY package*.json ./

# install only production deps
RUN npm install --omit=dev

# copy application source
COPY . .

EXPOSE 3000
CMD ["node", "src/index.js"]

