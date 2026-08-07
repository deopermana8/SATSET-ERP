services:
  admin:
    build:
      context: ..
      dockerfile: docker/admin.Dockerfile
    env_file:
      - ../env.example
    ports:
      - "3000:3000"
    depends_on:
      - api

  api:
    build:
      context: ..
      dockerfile: docker/api.Dockerfile
    env_file:
      - ../env.example
    ports:
      - "3001:3001"

  worker:
    build:
      context: ..
      dockerfile: docker/worker.Dockerfile
    env_file:
      - ../env.example
    depends_on:
      - api