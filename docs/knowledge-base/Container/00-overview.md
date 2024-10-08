---
title: Overview
---

# What is Docker?

Docker is a platform for building and deploying containerized application. Theses containers include everything
needed to run an application, libraries and configurations.

## Key Concepts

- **Containers**: Lightweight, standalone, executable packages that include everything needed to run an application (code, runtime, libraries, and system tools).
- **Images**: Read-only templates used to create containers. An image can be thought of as a snapshot of a filesystem.

- **Dockerfile**: A text file that contains instructions to build a Docker image. It defines the base image, application code, dependencies, and configurations.

- **Docker Hub**: A cloud-based registry for sharing and managing Docker images. Users can pull existing images or push their own images to the Hub.

## Benefits of Using Docker

- **Consistency**: Docker containers ensure that applications run the same way across different environments (development, testing, production).

- **Isolation**: Each container runs in its own environment, isolating applications from one another and from the host system.

- **Efficiency**: Containers share the host OS kernel, making them lightweight and fast to start compared to traditional virtual machines.

- **Scalability**: Docker makes it easy to scale applications up or down by adding or removing containers based on demand.

## Basic Commands

- **Build an Image**:

  ```bash
  docker build -t [image-name] .
  ```

- **List Containers**:

  ```bash
  docker ps
  ```

- **Stop a Container**:

  ```bash
  docker stop [container-id]
  ```

- **Remove a Container**:

  ```bash
  docker rm [container-id]
  ```

- **Push an Image to Docker Hub**:
  ```bash
  docker push [image-name]
  ```

## Example Dockerfile

```Dockerfile title="Dockerfile"
# Use an official Python image as the base
FROM python:3.9-slim

# Set the working directory inside the container

WORKDIR /app

# Copy only the requirements file and install dependencies

RUN python -m pip install --no-cache-dir -r requirements.txt

# Copy the Code into the working direction

COPY . ${WORKDIR}

# Change to the app directory and run database migrations

WORKDIR /app/babyshop_app
RUN python manage.py makemigrations
RUN python manage.py migrate

# This is the command that will be executed on container launch

ENTRYPOINT ["sh", "-c", "python manage.py runserver 0.0.0.0:8025"]
```
