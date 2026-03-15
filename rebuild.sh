#!/bin/bash
set -e

echo "🧹 Removing old container and image..."
docker compose down --rmi all --volumes --remove-orphans || true

echo "🔨 Building new image..."
docker compose build --no-cache

echo "🚀 Starting fresh container..."
docker compose up -d

echo "✅ Done! New image is running on port 105."

