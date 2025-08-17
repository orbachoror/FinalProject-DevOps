Docker & Deployment Setup:
This project uses Docker to containerize and deploy a React + Vite application.
The setup includes full CI/CD with automated testing using GitHub Actions and Selenium.

Dockerfile Overview:
The Dockerfile defines a lightweight Node 20 environment and runs the Vite development server inside the container on port 5173.

Docker Compose:
The docker-compose.yml file is used to run the app in a container and expose it on port 80:
Maps external port 80 to internal 5173 (where Vite runs).
This makes the app accessible at http://localhost.

Docker Ignore:
The .dockerignore file ensures unnecessary files are excluded from the image:

node_modules
dist
.dockerignore
Dockerfile
.env
.git
.gitignore
.vscode

Integration with CI/CD and Selenium:
On Pull Requests, GitHub Actions builds the Docker image and runs headless Selenium tests to ensure the app works before allowing merge.
On push to main, a production-ready Docker image is built and pushed to Docker Hub, and a remote server deploys it automatically via SSH.
Selenium tests point to http://localhost:80 and expect the app to be running via Docker Compose.

Deployment:
Deployment is handled via GitHub Actions + Ansible:
Docker image is built and pushed to Docker Hub.
A remote EC2 server pulls the latest image and runs it using docker compose up.
No manual intervention is needed — the process is fully automated.

Security Notes:
Secrets (DockerHub credentials, SSH keys) are stored securely in GitHub Secrets.