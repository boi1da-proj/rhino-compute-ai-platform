#!/bin/bash
# deploy_soft_geometry.sh - One-command FE deployment

set -e

echo "🚀 Deploying Soft.Geometry Frontend..."

# Create frontend directory
mkdir -p /Users/petersancho/soft/Soft.Geometry
cd /Users/petersancho/soft/Soft.Geometry

# Initialize git if not already done
if [ ! -d ".git" ]; then
    git init
    echo "node_modules/" > .gitignore
    echo "build/" >> .gitignore
    echo ".DS_Store" >> .gitignore
    echo "*.log" >> .gitignore
fi

# Copy frontend files
cp -r /Users/petersancho/soft/publish/frontend/* .

# Create frontend package.json
cat > package.json << 'EOF'
{
  "name": "soft-geometry-frontend",
  "version": "1.0.0",
  "description": "Soft.Geometry Frontend - AI-Enhanced 3D Geometry Viewer",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "@types/three": "^0.179.0",
    "three": "^0.179.1",
    "three-stdlib": "^2.36.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
EOF

# Commit and push
git add .
git commit -m "FE: update Soft.Geometry frontend" || true
git branch -M main

# Add remote if not exists
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "Please provide your GitHub repo URL:"
    read repo_url
    git remote add origin "$repo_url"
fi

git push -u origin main

echo "✅ Soft.Geometry frontend deployed successfully!"
echo "🔍 Run: python3 audit_architecture.py to verify deployment"
