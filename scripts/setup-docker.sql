#!/bin/bash

echo "🐳 Setting up Docker environment for Online Compiler..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"

# Pull required Docker images
echo "📥 Pulling Docker images..."
echo "This may take a few minutes depending on your internet connection..."

docker pull node:18-alpine &
PID1=$!
echo "Pulling Node.js image..."

docker pull python:3.11-alpine &
PID2=$!
echo "Pulling Python image..."

docker pull openjdk:17-alpine &
PID3=$!
echo "Pulling Java image..."

docker pull gcc:alpine &
PID4=$!
echo "Pulling C++ image..."

# Wait for all pulls to complete
wait $PID1 $PID2 $PID3 $PID4

echo "✅ All Docker images pulled successfully"

# Create Docker network for isolation
echo "🌐 Creating Docker network..."
docker network create --driver bridge compiler-network 2>/dev/null || echo "Network already exists"

# Create temp directory for code execution
echo "📁 Creating temp directory..."
mkdir -p temp

# Set up Docker security configurations
echo "🔒 Setting up Docker security..."
cat > docker-daemon.json << 'EOF'
{
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  },
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

echo "📋 Docker daemon configuration created (docker-daemon.json)"
echo "💡 To apply these settings, copy this file to /etc/docker/daemon.json (requires sudo)"

# Test Docker setup
echo "🧪 Testing Docker setup..."

# Test Node.js
echo "Testing Node.js..."
echo 'console.log("✅ Node.js Docker working!");' > temp/test.js
if docker run --rm -v "$(pwd)/temp:/workspace" -w /workspace node:18-alpine node test.js; then
    echo "✅ Node.js test passed"
else
    echo "❌ Node.js test failed"
fi

# Test Python
echo "Testing Python..."
echo 'print("✅ Python Docker working!")' > temp/test.py
if docker run --rm -v "$(pwd)/temp:/workspace" -w /workspace python:3.11-alpine python test.py; then
    echo "✅ Python test passed"
else
    echo "❌ Python test failed"
fi

# Test Java
echo "Testing Java..."
cat > temp/Test.java << 'EOF'
public class Test {
    public static void main(String[] args) {
        System.out.println("✅ Java Docker working!");
    }
}
EOF
if docker run --rm -v "$(pwd)/temp:/workspace" -w /workspace openjdk:17-alpine sh -c "javac Test.java && java Test"; then
    echo "✅ Java test passed"
else
    echo "❌ Java test failed"
fi

# Test C++
echo "Testing C++..."
cat > temp/test.cpp << 'EOF'
#include <iostream>
using namespace std;
int main() {
    cout << "✅ C++ Docker working!" << endl;
    return 0;
}
EOF
if docker run --rm -v "$(pwd)/temp:/workspace" -w /workspace gcc:alpine sh -c "g++ -o test test.cpp && ./test"; then
    echo "✅ C++ test passed"
else
    echo "❌ C++ test failed"
fi

# Clean up test files
rm -f temp/test.js temp/test.py temp/Test.java temp/Test.class temp/test.cpp temp/test

echo ""
echo "🎉 Docker setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env.local file to use Docker execution:"
echo "   USE_DOCKER_EXECUTION=true"
echo ""
echo "2. Update app/api/execute/route.ts to use Docker:"
echo "   - Uncomment: import { executeInDocker } from '@/lib/docker-executor'"
echo "   - Uncomment: const result = await executeInDocker(language, code, input)"
echo "   - Comment out: const result = await executeWithPiston(language, code, input)"
echo ""
echo "3. Restart your Next.js development server"
echo "   npm run dev"
echo ""
echo "💡 Docker containers will now be used for secure code execution!"
