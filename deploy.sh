#!/bin/bash

# Deployment script for DigitalOcean Droplet

set -e

echo "🚀 Starting deployment to DigitalOcean Droplet..."

# Variables
DROPLET_IP=${DROPLET_IP:-"your_droplet_ip"}
DROPLET_USER=${DROPLET_USER:-"root"}
PROJECT_NAME="redis-celery-ai-project"

# Build and push Docker images
echo "📦 Building Docker images..."
docker build -t $PROJECT_NAME:latest .
docker build -f Dockerfile.celery -t $PROJECT_NAME-celery:latest .

# Save images to tar files
echo "💾 Saving Docker images..."
docker save $PROJECT_NAME:latest | gzip > app.tar.gz
docker save $PROJECT_NAME-celery:latest | gzip > celery.tar.gz

# Copy files to droplet
echo "📤 Copying files to droplet..."
scp app.tar.gz celery.tar.gz docker-compose.yml .env $DROPLET_USER@$DROPLET_IP:/opt/$PROJECT_NAME/

# Copy additional files
scp -r celery_app/ scripts/ requirements.txt $DROPLET_USER@$DROPLET_IP:/opt/$PROJECT_NAME/

# Deploy on droplet
echo "🔧 Deploying on droplet..."
ssh $DROPLET_USER@$DROPLET_IP << EOF
cd /opt/$PROJECT_NAME

# Load Docker images
docker load < app.tar.gz
docker load < celery.tar.gz

# Stop existing containers
docker-compose down

# Start new containers
docker-compose up -d

# Clean up
rm app.tar.gz celery.tar.gz

echo "✅ Deployment completed successfully!"
EOF

# Clean up local files
rm app.tar.gz celery.tar.gz

echo "🎉 Deployment to DigitalOcean Droplet completed!"
