#!/bin/bash

# Create backup of current structure
echo "Creating backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
cp -r . "../tracks_backup_$timestamp"

# Move public directory to frontend if it exists
if [ -d "public" ]; then
    echo "Moving public directory to frontend..."
    mv public frontend/
fi

# Move types to frontend/src if they exist
if [ -d "src/types" ]; then
    echo "Moving types to frontend/src..."
    mkdir -p frontend/src/types
    mv src/types/* frontend/src/types/
    rm -r src/types
fi

# Clean up empty src directory at root if it exists
if [ -d "src" ] && [ -z "$(ls -A src)" ]; then
    echo "Removing empty src directory..."
    rm -r src
fi

# Create necessary directories if they don't exist
echo "Ensuring all required directories exist..."
mkdir -p frontend/src/{contexts,components,hooks,pages,services,styles}
mkdir -p frontend/src/components/auth
mkdir -p backend/src

# Move any potential misplaced node_modules
if [ -d "node_modules" ]; then
    echo "Note: node_modules found at root level. Please run 'npm install' in frontend and backend directories separately."
fi

echo "Creating package.json files if they don't exist..."

# Create root package.json if it doesn't exist
if [ ! -f "package.json" ]; then
cat > package.json << EOF
{
  "name": "tracks",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "frontend": "cd frontend && npm start",
    "backend": "cd backend && npm start",
    "dev": "concurrently \"npm run frontend\" \"npm run backend\""
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
EOF
fi

# Create frontend package.json if it doesn't exist
if [ ! -f "frontend/package.json" ]; then
cat > frontend/package.json << EOF
{
  "name": "tracks-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.0",
    "axios": "^1.4.0"
  }
}
EOF
fi

# Create backend package.json if it doesn't exist
if [ ! -f "backend/package.json" ]; then
cat > backend/package.json << EOF
{
  "name": "tracks-backend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}
EOF
fi

echo "Project structure reorganization complete!"
echo "Backup created at: ../tracks_backup_$timestamp"
echo ""
echo "Next steps:"
echo "1. Check the backup directory to ensure nothing was lost"
echo "2. Run 'npm install' in both frontend and backend directories"
echo "3. Run 'npm install' in the root directory"
echo "4. Use 'npm run dev' to start both frontend and backend"
