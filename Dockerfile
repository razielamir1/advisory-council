FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev --no-audit --no-fund

COPY . .
RUN npm run build

RUN npm prune --omit=dev

ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "start"]
