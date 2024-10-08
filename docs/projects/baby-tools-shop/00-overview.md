---
title: Overview
---

# Baby Tools Shop

Welcome to the **Baby Tools Shop** project! This repository contains a **Django** application designed for managing a baby tools e-commerce store. The project uses **Docker** to containerize the application and deploy it to a virtual machine (VM).

## Table of Contents

1. [Project Overview](#project-overview)
2. [Quickstart](#quickstart)
3. [Configuration](#configuration)
4. [Deploying with Docker](#deploying-with-docker)
5. [Hints](#hints)
6. [Contact](#contact)

## Project Overview

The **Baby Tools Shop** project is a Django-based web application that allows users to browse and purchase baby tools. The application is built with **Python** and **Django** and is designed to be easily containerized and deployed using **Docker**.

### Technologies

- Python 3.9
- Django 4.0.2
- Venv

## Quickstart

To get started with the Baby Tools Shop, follow these steps:

1. **Set up your Python environment:**

   ```
   python -m venv your_environment_name
   ```

2. **Activate the virtual environment:**

   ```
   your_environment_name\Scripts\activate
   ```

3. **Navigate to the project directory:**

   ```
   cd babyshop_app
   ```

4. **Install Django:**

   ```
   python -m pip install Django==4.0.2
   ```

5. **Go to the root directory and create a requirements.txt file:**

   ```
    cd ..
   ```

   ```
    nano requirements.txt
   ```

   - Django==4.0.2
   - pillow==10.4.0

6. **Apply migrations:**

   ```
   python manage.py makemigrations
   ```

   ```
    python manage.py migrate
   ```

7. **Create a superuser:**

   ```
    python manage.py createsuperuser
   ```

   - **Important**: Use a DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL and a DJANGO_SUPERUSER_PASSWORD

8. **Run the development server:**

   ```
    python manage.py runserver
   ```

   - You can access the admin panel at `http://<your_ip>:8000/admin`
   - Create products in the admin panel

## Configuration

1.  **Configure your environment:**
    Modify the **ALLOWED_HOSTS** setting in **settings.py** to include the domain names or IP addresses that will be used to access the application.

    ```
    ALLOWED_HOSTS = ['your_domain_or_ip']
    ```

    - Configures allowed hosts: This setting specifies which domain names or IP addresses are permitted to access your Django application.
    - Enhances security: It prevents HTTP Host header attacks by only allowing requests from specified hosts.
    - Set for production: Replace 'your_domain_or_ip' with your actual domain or server IP to make your site accessible.

2.  **Create Dockerfile:**

    ```
    # Use an official Python image as the base
    FROM python:3.9-slim

    # Set the working directory inside the container

    WORKDIR /app

    # Copy only the requirements file and install dependencies

    COPY requirements.txt ${WORKDIR}
    RUN python -m pip install --no-cache-dir -r requirements.txt

    # Copy the code into the working direction

    COPY . ${WORKDIR}

    # Change to the app directory and run database migrations

    WORKDIR /app/babyshop_app
    RUN python manage.py makemigrations && python manage.py migrate

    EXPOSE 8025

    # This is the command that will be executed on container launch

    ENTRYPOINT ["sh", "-c", "python manage.py runserver 0.0.0.0:8025"]
    ```

## Deploying with Docker

1.  **Copy the Project Folder to your VM**
2.  **Build the Docker image:**

    ```
    docker build -t app_name .
    ```

    - Builds a Docker image: This command creates a Docker image from the Dockerfile in the current directory.
    - Tags the image: -t app_name assigns the tag app_name to the image, which can be used for easy reference.
    - Prepares for deployment: The image contains the application and its dependencies, ready for running in a container.

3.  **Create Docker volumes:**

    ```
    docker volume create babyshop_db
    docker volume create babyshop_media
    docker volume create babyshop_static
    ```

    - Create Docker volumes: These commands create named volumes that can be used to persist data across Docker container restarts and re-creations.
    - babyshop_db: Volume for storing database data.
    - babyshop_media: Volume for storing user-uploaded media files.
    - babyshop_static: Volume for storing static files like CSS and JS.
    - Ensures data persistence: Keeps your application data safe and accessible even if containers are removed or recreated.

4.  **Run the Docker container:**

    ```
    docker run -d --name app_name_container \
      -p 8025:8025 \
      -v babyshop_db:/app/babyshop_app/db \
      -v babyshop_media:/app/babyshop_app/media \
      -v babyshop_static:/app/babyshop_app/static \
      --restart on-failure \
      app_name
    ```

    - Run a Docker container: This command starts a new container from the Docker image named app_name.
    - Detach mode (-d): Runs the container in the background.
    - Name the container (--name babyshop_app_container): Assigns the name babyshop_app_container to the running container for easier management.
    - Port mapping (-p 8025:8025): Maps port 8025 on the host to port 8025 in the container, making the app accessible via port 8025.
    - Mount volumes (-v):

      - babyshop_db:/app/babyshop_app/db: Maps the babyshop_db volume to the container’s database directory.
      - babyshop_media:/app/babyshop_app/media: Maps the babyshop_media volume to the container’s media directory.
      - babyshop_static:/app/babyshop_app/static: Maps the babyshop_static volume to the container’s static files directory.

    - Restart policy (--restart on-failure): Automatically restarts the container if it fails, but not if stopped manually.

    - You can access your app at `http://<vm_ip>:8025/`

5.  **Create a superuser**

    ```
    docker ps
    ```

    - Shows active containers: Lists all running containers with their IDs and names.
    - Identify your container: Find the container ID or name for your Django app.

    ```
    docker exec -it <container_name_or_id> /bin/bash
    ```

    - Execute a command inside a container: Opens an interactive terminal (-it) within the specified container.
    - Replace `<container_name_or_id>`: Use the actual container name or ID from the previous command.

    ```
    python manage.py createsuperuser
    ```

    - Run Django’s superuser creation command: This will prompt you to enter
    - a DJANGO_SUPERUSER_USERNAME,
    - a DJANGO_SUPERUSER_EMAIL email
    - a DJANGO_SUPERUSER_PASSWORD password for the new superuser account.

    ```
    exit
    ```

    - Close the interactive session: Logs out of the container’s shell and returns to your host machine's terminal.
    - You can access your app at `http://<vm_ip>:8025/admin`
    - Login with your superuser details
    - You can place products/ categories, get user rules and manage user rules

## Hints

This section will cover some hot tips when trying to interacting with this repository:

- Settings & Configuration for Django can be found in `babyshop_app/babyshop/settings.py`
- Routing: Routing information, such as available routes can be found from any `urls.py` file in `babyshop_app` and corresponding subdirectories

## Example Photos

##### Home Page with login

![Home Page with login](./project_images/all-products.png 'Home Page with login')

##### Home Page with filter

![Home Page with filter](./project_images/filter.png 'Home Page with filter')

##### Product Detail Page

![Product Detail Page](./project_images/details.png 'Product Detail Page')

##### Register Page

![Register Page](./project_images/register.png 'Register Page')

##### Login Page

![Login Page](./project_images/login.png 'Login Page')

## Contact

- Pascal Nehlsen - [LinkedIn](https://www.linkedin.com/in/pascal-nehlsen) - [mail@pascal-nehlsen.de](mailto:mail@pascal-nehlsen.de)
- Project Link: [https://github.com/PascalNehlsen/baby-tools-shop](https://github.com/PascalNehlsen/baby-tools-shop)
