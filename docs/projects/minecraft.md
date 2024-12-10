---
id: minecraft
title: Minecraft Server
sidebar_label: Minecraft Server
sidebar_position: 1
---

# Minecraft Server with Docker Compose

Welcome to your personal Minecraft Server! This repository provides an easy-to-use setup for running a customizable Minecraft server using Docker Compose. Deploy it locally or to a virtual machine (VM) with minimal effort.

## Table of Contents

1. [Description](#description)
2. [Quickstart](#quickstart)
3. [Usage](#usage)
   - [Configuration](#configuration)
4. [Contact](#contact)

## Description

This repository offers a Docker Compose configuration for hosting a Minecraft server. The setup simplifies launching, managing, and customizing a Minecraft server.

Key features:

- **Containerized Deployment**: Run your server reliably using Docker.
- **Customizable Settings**: Adjust memory allocation, player limits, game modes, and more.
- **Easy Maintenance**: Start, stop, and update your server with minimal effort.

## Quickstart

### Prerequisites

Ensure you have the following tools installed:

- [Docker](https://www.docker.com/products/docker-desktop)
  - Docker Compose is included with Docker 20.10 and later. If you have an older version, follow the [official instructions](https://docs.docker.com/compose/install/) to install Docker Compose as a plugin.

1. Clone this repository:

   ```bash
   git clone https://github.com/PascalNehlsen/minecraft-server
   cd minecraft-server
   ```

2. Create a `.env` file from the example configuration:

   ```bash
   cp example.env .env
   ```

3. Build and start the server container:

   ```bash
   docker compose up --build
   ```

4. Open Minecraft and connect to the server:

   - Local server: `localhost:8888` (or use your server's IP if hosted remotely).

5. To stop the server, use:

   ```bash
   docker compose down
   ```

## Usage

### Configuration

The server settings can be customized in the [example.env](https://github.com/PascalNehlsen/minecraft-server/blob/main/example.env) file. Below are the key environment variables you can modify:

| Variable      | Description                                             | Default value | Possible Values                          |
| ------------- | ------------------------------------------------------- | ------------- | ---------------------------------------- |
| `MAX_PLAYERS` | Maximum number of players allowed on the server.        | 15            | Any integer value                        |
| `MOTD`        | Message of the Day displayed to players upon joining.   | -             | Any text                                 |
| `DIFFICULTY`  | Difficulty level of the server.                         | easy          | easy, normal, hard                       |
| `GAMEMODE`    | Default game mode for players.                          | creative      | survival, creative, adventure, spectator |
| `ONLINE_MODE` | Authenticate players using Minecraft's online services. | true          | true, false                              |

## Contact

- Pascal Nehlsen - [LinkedIn](https://www.linkedin.com/in/pascal-nehlsen) - [mail@pascal-nehlsen.de](mailto:mail@pascal-nehlsen.de)
- Project Link: [https://github.com/PascalNehlsen/minecraft-server](https://github.com/PascalNehlsen/minecraft-server)
