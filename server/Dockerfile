FROM node:20-alpine

# Install build tools for native modules like sqlite3
RUN apk add --no-cache python3 make g++ 

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build
VOLUME ["/app/data"]
EXPOSE 4000
CMD ["node", "dist/server.js"]