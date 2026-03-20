FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY index.html ./
COPY src ./src
COPY public ./public

RUN npm run build

RUN npm install -g serve

EXPOSE 4173

CMD ["serve", "-s", "dist", "-l", "4173"]