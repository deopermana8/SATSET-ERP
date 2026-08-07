FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json ./
COPY apps/worker ./apps/worker
COPY packages/shared ./packages/shared
RUN npm install
RUN npm run build
CMD ["npm", "run", "start", "--workspace", "@satset/blueprint-worker"]
