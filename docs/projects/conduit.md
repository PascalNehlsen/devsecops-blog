---
id: conduit
title: Conduit Deploy with Docker Compose
sidebar_label: Conduit Deploy
sidebar_position: 1
---

import GithubLinkAdmonition from '@site/src/components/GithubLinkAdmonition';

<GithubLinkAdmonition link="https://github.com/PascalNehlsen/conduit" text="Github Repository" type="info">
**Reach me out via** [LinkedIn](https://www.linkedin.com/in/pascal-nehlsen)**,** [Portfolio Contact Form](https://pascal-nehlsen.de/#contact) **or** [mail@pascal-nehlsen.de](mailto:mail@pascal-nehlsen.de)
</GithubLinkAdmonition>

# Conduit Deploy with Docker Compose

## Table of Contents

1. [Description](#description)
2. [Quickstart](#quickstart)
3. [Usage](#usage)
   - [Configuration](#configuration)

## Description

This repository sets up a multi-container environment using Docker Compose to run both the Conduit Frontend and Conduit Backend applications.
The Conduit Frontend is forked from <br /> [Developer-Akademie-GmbH/conduit-frontend](https://github.com/Developer-Akademie-GmbH/conduit-frontend), <br /> and the Conduit Backend is forked from <br /> [https://github.com/Developer-Akademie-GmbH/conduit-backend](https://github.com/Developer-Akademie-GmbH/conduit-backend) and integrated as submodules.

Both the frontend and backend are containerized, and Docker Compose is used to orchestrate their operation, ensuring they work seamlessly together. This setup provides a consistent and scalable development environment, simplifying the process of running both applications in parallel.

## Quickstart

### Prerequisites

Ensure you have the following tools installed:

- [Docker](https://www.docker.com/products/docker-desktop)

  - Docker Compose was included with Docker versions 20.10 and later, but recently it is no longer included by default. For the latest Docker versions, you will need to install Docker Compose manually as a plugin. Follow the official instructions for detailed steps.

- For a **Frontend** Quickstart, refer to the [Conduit Frontend README](https://github.com/Developer-Akademie-GmbH/conduit-frontend/blob/master/README.md)
- For a **Backend** Quickstart, refer to the [Conduit Backend README](https://github.com/Developer-Akademie-GmbH/conduit-backend/blob/master/README.md)

1. Clone the repository:

   ```bash
   git clone https://github.com/PascalNehlsen/conduit.git
   cd conduit
   ```

2. Copy the `example.env` file to `.env`:

   ```bash
   cp example.env .env
   ```

3. Init submodules

   ```bash
   git submodule update --init --recursive
   ```

4. Build and start the application using Docker Compose:

   ```bash
   docker-compose up --build -d
   ```

5. Access the application:

- The **Frontend** should be accessible at `http://localhost:8282` in your web browser.
- The **Backend** should be accessible at `http://localhost:8000/admin` in your web browser.

5. To stop the application, use:
   ```bash
   docker-compose down
   ```

## Usage

Once the application is running, you can interact with the Conduit API via the **Backend** at `http://localhost:8000`. The **Frontend** will communicate with the API to fetch and display data.

### Configuration

You need to configure several environment variables for the Django project to work properly. Below is an example of the necessary variables to set in your example.env file:

| Variable                    | Description                                                                                  | Default value          |
| --------------------------- | -------------------------------------------------------------------------------------------- | ---------------------- |
| `DJANGO_SUPERUSER_USERNAME` | The username for the Django admin superuser.                                                 | admin                  |
| `DJANGO_SUPERUSER_EMAIL`    | The email address associated with the Django admin superuser.                                | admin@example.com      |
| `DJANGO_SUPERUSER_PASSWORD` | The password for the Django admin superuser                                                  | adminpassword          |
| `SECRET_KEY`                | A crucial security key used by Django for cryptographic signing                              | example.env#SECRET_KEY |
| `DEBUG`                     | Set to True for local development to enable debugging features.                              | False                  |
| `ALLOWED_HOSTS`             | A comma-separated list of allowed hostnames or IP addresses that your Django site can serve. | 127.0.0.1, localhost   |
| `CORS_ALLOWED_ORIGINS`      | A list of allowed origins for cross-origin requests.                                         | http://localhost:8282  |
