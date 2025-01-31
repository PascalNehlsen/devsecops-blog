---
id: conduit-pipeline
title: Conduit Pipeline with Github Actions
sidebar_label: Conduit Pipeline
sidebar_position: 1
---

import GithubLinkAdmonition from '@site/src/components/GithubLinkAdmonition';

<GithubLinkAdmonition link="https://github.com/PascalNehlsen/conduit" text="Github Repository" type="info">
**Reach me out via** [LinkedIn](https://www.linkedin.com/in/pascal-nehlsen)**,** [Portfolio Contact Form](https://pascal-nehlsen.de/#contact) **or** [mail@pascal-nehlsen.de](mailto:mail@pascal-nehlsen.de)
</GithubLinkAdmonition>

# Conduit Pipeline with Github Actions

This repository builds upon [this Conduit project](./conduit.md) and integrates a CI/CD pipeline.

This GitHub Actions pipeline automates the process of cloning a repository, building Docker images, and deploying an application to a remote server using Docker Compose.

## Table of Contents

1. [Workflow Trigger](#workflow-trigger)
2. [Workflow Overview](#workflow-overview)
3. [Steps in the Build Job](#steps-in-the-build-job)
4. [Steps in the Deploy Job](#steps-in-the-deploy-job)
5. [Secrets Required for Deployment](#secrets-required-for-deployment)

## Workflow Trigger

The workflow is triggered under the following conditions:

1. `Manual Trigger (workflow_dispatch)`: The workflow can be manually triggered from the GitHub Actions dashboard.

2. `Push to the main Branch`: When a commit is pushed to the main branch, the workflow is automatically triggered.

3. `Workflow Call`: The workflow can also be called from other workflows, requiring specific secrets:

   - `SSH_PRIVATE_KEY`: The private SSH key for accessing the remote server.
   - `REMOTE_HOST`: The IP address or hostname of the remote server.
   - `REMOTE_USER`: The username for the remote server.
   - `TARGET`: The target directory on the remote server where files will be uploaded.

## Workflow Overview

The workflow consists of two main jobs (using existing github actions):

1. **Build Job**: This job builds and pushes Docker images for the frontend and backend of the application. The images are pushed to a Docker registry (GitHub Container Registry in this case).

2. **Deploy Job**: This job handles the deployment of the application to the remote server. The necessary artifacts (.env, docker-compose.yaml) are transferred, and the application is started on the remote server using Docker Compose.

## Steps in the Build Job:

- Clone repository using [actions/checkout](https://github.com/actions/checkout/tree/v4/) to get the latest code
- Set up Docker Buildx with [docker/setup-buildx-action](https://github.com/docker/setup-buildx-action/tree/v3.8.0/) for advanced build features
- Authenticate with GHCR using [docker/login-action](https://github.com/docker/login-action/tree/v3.3.0/)
- Extract metadata with [docker/metadata-action](https://github.com/docker/metadata-action/tree/v5.6.1/) to extract metadata
- Create .env file from [example.env](../../example.env)
- Build and push frontend & backend images with [docker/build-push-action](https://github.com/docker/build-push-action/tree/v6.12.0/)
- Upload deployment artifacts with [actions/download-artifact](https://github.com/actions/upload-artifact/tree/v4.6.0/) (`.env` and `docker-compose.yaml`)

## Steps in the Deploy Job:

- Clone repository using [actions/checkout](https://github.com/actions/checkout/tree/v4/) to get the latest code
- Download deployment artifacts with [actions/download-artifact](https://github.com/actions/download-artifact/tree/v4.1.8/)
- Transfer files via SCP using [appleboy/scp-action](https://github.com/appleboy/scp-action/tree/v0.1.7/) to copy `.env` and `docker-compose.yaml` to the remote server
- Deploy with SSH using [appleboy/ssh-action](https://github.com/appleboy/ssh-action/tree/v1.2.0/):
  - Stop old containers: `docker compose down --remove-orphans`
  - Clean up unused resources: `docker system prune -af`
  - Start containers: `docker compose up -d`

## Secrets Required for Deployment:

- `SSH_PRIVATE_KEY`: Private SSH key used for authenticating with the remote server.
- `REMOTE_HOST`: The IP address or domain of the remote server.
- `REMOTE_USER`: The username used to access the remote server.
- `TARGET`: The target directory on the remote server where the application will be deployed.
- `GHCR_PAT`: A GitHub Personal Access Token for authenticating with the GitHub Container Registry.
