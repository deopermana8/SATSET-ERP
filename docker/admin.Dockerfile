FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json ./
COPY apps/admin ./apps/admin
COPY packages/shared ./packages/shared
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@satset/blueprint-admin"]
