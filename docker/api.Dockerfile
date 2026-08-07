FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json ./
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
RUN npm install
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start", "--workspace", "@satset/blueprint-api"]
