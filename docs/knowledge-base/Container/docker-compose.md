---
id: docker-compose
title: Docker Compose
sidebar_label: Docker Compose Basics
sidebar_position: 3
---

# Simplifying Multi-Container Applications with Docker Compose

As applications grow more complex, you often need multiple services running in separate containers—such as a database, backend, and frontend. Managing these services manually with `docker` run can quickly become overwhelming. Enter Docker Compose, a tool designed to simplify the management of multi-container Docker applications.

## What is Docker Compose?

Docker Compose allows you to define and manage multi-container applications using a single YAML file. With Compose, you can:

- Define all your services, networks, and volumes in a single file (`docker-compose.yml`).
- Start all containers with a single command.
- Easily scale services up or down.

## A Simple Example: Web App with Database

Let’s set up a Python web application with a PostgreSQL database using Docker Compose.

1. Project Structure

```bash
my-docker-compose-app/
├── app/
│   ├── app.py
│   ├── requirements.txt
├── docker-compose.yml
```

`app.py`

```bash
from flask import Flask
import psycopg2

app = Flask(__name__)

@app.route('/')
def home():
    return "Hello from Flask with PostgreSQL!"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
```

`requirements.txt`

```bash
flask
psycopg2
```

2. Writing the `docker-compose.yml`

```bash
services:
  web:
    build:
      context: ./app
    ports:
      - "5000:5000"
    volumes:
      - ./app:/app
    depends_on:
      - db

  db:
    image: postgres:13
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydatabase
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

3. Build and Run the Application

Run the following commands in the project directory:

    1. Build and start the application:

    ```bash
    docker-compose up --build
    ```

    2. Access the web app:

    Open `http://localhost:5000` in your browser.

4. Key Commands

- Start services: docker-compose up
- Stop services: docker-compose down
- View logs: docker-compose logs
- Scale services: docker-compose up --scale web=3
