services:
  app:
    build: .
    image: {{projectName}}:latest
    ports:
      - "3000:3000"
