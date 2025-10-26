#!/bin/bash

echo "🐳 Setting up Docker environment for Online Compiler (ARM64/Apple Silicon)..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Detect architecture
ARCH=$(uname -m)
echo "Detected architecture: $ARCH"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed."
    echo ""
    print_info "Please install Docker Desktop from: https://docs.docker.com/desktop/mac/install/"
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running."
    echo ""
    print_info "Please start Docker Desktop"
    exit 1
fi

print_status "Docker is running"

# Define ARM64-compatible images
if [[ "$ARCH" == "arm64" ]]; then
    print_info "Using ARM64-compatible images for Apple Silicon..."
    NODE_IMAGE="node:18-alpine"
    PYTHON_IMAGE="python:3.11-alpine"
    JAVA_IMAGE="eclipse-temurin:17-jre-alpine"  # ARM64 compatible Java
    CPP_IMAGE="gcc:alpine"
else
    print_info "Using standard x86_64 images..."
    NODE_IMAGE="node:18-alpine"
    PYTHON_IMAGE="python:3.11-alpine"
    JAVA_IMAGE="openjdk:17-alpine"
    CPP_IMAGE="gcc:alpine"
fi

# Pull required Docker images
echo ""
print_info "Pulling Docker images (this may take 5-10 minutes)..."

images=("$NODE_IMAGE" "$PYTHON_IMAGE" "$JAVA_IMAGE" "$CPP_IMAGE")
for image in "${images[@]}"; do
    print_info "Pulling $image..."
    if docker pull "$image"; then
        print_status "$image pulled successfully"
    else
        print_warning "Failed to pull $image"
        
        # Try alternative for Java if eclipse-temurin fails
        if [[ "$image" == "eclipse-temurin:17-jre-alpine" ]]; then
            print_info "Trying alternative Java image..."
            JAVA_IMAGE="amazoncorretto:17-alpine"
            if docker pull "$JAVA_IMAGE"; then
                print_status "$JAVA_IMAGE pulled successfully"
            else
                print_error "Failed to pull Java image. Trying OpenJDK 11..."
                JAVA_IMAGE="openjdk:11-jre-alpine"
                docker pull "$JAVA_IMAGE"
            fi
        fi
    fi
done

# Create Docker network
echo ""
print_info "Creating Docker network..."
if docker network create --driver bridge compiler-network 2>/dev/null; then
    print_status "Docker network 'compiler-network' created"
else
    print_info "Docker network 'compiler-network' already exists"
fi

# Create temp directory
echo ""
print_info "Creating temp directory..."
mkdir -p temp
print_status "Temp directory created"

# Test Docker setup
echo ""
print_info "Testing Docker setup..."

# Test Node.js
echo 'console.log("✅ Node.js Docker working!");' > temp/test.js
if docker run --rm --network=none --memory=128m --cpus=0.5 -v "$(pwd)/temp:/workspace" -w /workspace "$NODE_IMAGE" node test.js; then
    print_status "Node.js Docker test passed"
else
    print_warning "Node.js Docker test failed"
fi

# Test Python
echo 'print("✅ Python Docker working!")' > temp/test.py
if docker run --rm --network=none --memory=128m --cpus=0.5 -v "$(pwd)/temp:/workspace" -w /workspace "$PYTHON_IMAGE" python test.py; then
    print_status "Python Docker test passed"
else
    print_warning "Python Docker test failed"
fi

# Test Java
cat > temp/Test.java << 'EOF'
public class Test {
    public static void main(String[] args) {
        System.out.println("✅ Java Docker working!");
    }
}
EOF
if docker run --rm --network=none --memory=256m --cpus=0.5 -v "$(pwd)/temp:/workspace" -w /workspace "$JAVA_IMAGE" sh -c "javac Test.java && java Test"; then
    print_status "Java Docker test passed"
else
    print_warning "Java Docker test failed"
    print_info "Java image used: $JAVA_IMAGE"
fi

# Test C++
cat > temp/test.cpp << 'EOF'
#include <iostream>
using namespace std;
int main() {
    cout << "✅ C++ Docker working!" << endl;
    return 0;
}
EOF
if docker run --rm --network=none --memory=128m --cpus=0.5 -v "$(pwd)/temp:/workspace" -w /workspace "$CPP_IMAGE" sh -c "g++ -o test test.cpp && ./test"; then
    print_status "C++ Docker test passed"
else
    print_warning "C++ Docker test failed"
fi

# Clean up test files
rm -f temp/test.js temp/test.py temp/Test.java temp/Test.class temp/test.cpp temp/test

# Create Docker configuration file with the correct images
echo ""
print_info "Creating Docker configuration..."
cat > docker-images.json << EOF
{
  "node": "$NODE_IMAGE",
  "python": "$PYTHON_IMAGE", 
  "java": "$JAVA_IMAGE",
  "cpp": "$CPP_IMAGE"
}
EOF

print_status "Docker configuration saved to docker-images.json"

# Update environment file
echo ""
print_info "Updating environment configuration..."
if [ -f ".env.local" ]; then
    if grep -q "USE_DOCKER_EXECUTION" .env.local; then
        sed -i.bak 's/USE_DOCKER_EXECUTION=false/USE_DOCKER_EXECUTION=true/' .env.local
        print_status "Updated USE_DOCKER_EXECUTION=true in .env.local"
    else
        echo "USE_DOCKER_EXECUTION=true" >> .env.local
        print_status "Added USE_DOCKER_EXECUTION=true to .env.local"
    fi
    
    # Add Docker images configuration
    if ! grep -q "DOCKER_NODE_IMAGE" .env.local; then
        echo "" >> .env.local
        echo "# Docker Images Configuration" >> .env.local
        echo "DOCKER_NODE_IMAGE=$NODE_IMAGE" >> .env.local
        echo "DOCKER_PYTHON_IMAGE=$PYTHON_IMAGE" >> .env.local
        echo "DOCKER_JAVA_IMAGE=$JAVA_IMAGE" >> .env.local
        echo "DOCKER_CPP_IMAGE=$CPP_IMAGE" >> .env.local
        print_status "Added Docker image configuration to .env.local"
    fi
else
    print_warning ".env.local not found. Please create it first."
fi

echo ""
print_status "🎉 Docker setup complete!"
echo ""
echo "📋 Images used:"
echo "• Node.js: $NODE_IMAGE"
echo "• Python: $PYTHON_IMAGE"
echo "• Java: $JAVA_IMAGE"
echo "• C++: $CPP_IMAGE"
echo ""
echo "📋 Next steps:"
echo "=============="
print_info "1. Update your Docker executor to use the correct images"
print_info "2. Restart your development server: npm run dev"
print_info "3. Test the compiler with some code!"
