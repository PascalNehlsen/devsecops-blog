---
id: first-image
title: First Docker Image
sidebar_label: First Docker Image
sidebar_position: 2
---

# How to Create Your First Docker Image

Building your first Docker image might seem intimidating at first, but it’s an essential skill for leveraging the full potential of containerized environments. This guide will walk you through the basics of creating a Docker image using a `Dockerfile`.

## Prerequisites

Before you start, make sure you have the following installed:

- Docker: [Install Docker](https://docs.docker.com/engine/install/) if it’s not already on your system.
- A basic understanding of containers and images ([this post will help you](./container.md)).

## Step-by-Step: Creating Your First Docker Image

Create a simple Python application and containerize it.

1. Set Up Your Project Directory

   Create a project directory for your application:

   ```bash
   mkdir my-docker-app
   cd my-docker-app
   ```

   Inside this directory, create the following files:

   `app.py`

   ```bash
   # A simple Python application
   print("Hello, Docker!")
   ```

   `requirements.txt`

   ```bash
   # No dependencies for this simple example
   ```

2. Create a Dockerfile

   A `Dockerfile` is a text document that contains the instructions to assemble a Docker image. Here's a basic example:

   `Dockerfile`

   ```bash
   # Use an official Python runtime as the base image
   FROM python:3.9-slim

   # Set the working directory inside the container
   WORKDIR /app

   # Copy the requirements file and install dependencies
   COPY requirements.txt ./
   RUN pip install --no-cache-dir -r requirements.txt

   # Copy the application code into the container
   COPY app.py ./

   # Define the command to run the application
   CMD ["python", "app.py"]
   ```

3. Build the Docker Image

   Run the following command in your project directory to build the image:

   ```bash
   docker build -t my-docker-app .
   ```

   Here’s what happens:

   - `-t my-docker-app`: Tags the image with the name my-docker-app.
   - `.`: Specifies the current directory as the build context.

4. Run the Docker Container

   Once the image is built, you can create and start a container using the following command:

   ```bash
   docker run my-docker-app
   ```

   You should see the output:

   ```bash
   Hello, Docker!
   ```

5. Verify Your Image

   To list your Docker images, use:

   ```bash
   docker images
   ```

   You’ll see something like:

   ```bash
   REPOSITORY        TAG       IMAGE ID       CREATED         SIZE
   my-docker-app     latest    abc12345defg   1 minute ago    29MB
   ```
