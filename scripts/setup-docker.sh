#!/bin/bash

echo "🐳 Setting up Docker environment for Online Compiler..."

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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed."
    echo ""
    print_info "Please install Docker first:"
    echo "• macOS: brew install --cask docker"
    echo "• Windows: Download from https://docs.docker.com/desktop/windows/install/"
    echo "• Linux: Follow instructions at https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running."
    echo ""
    print_info "Please start Docker:"
    echo "• macOS/Windows: Open Docker Desktop"
    echo "• Linux: sudo systemctl start docker"
    exit 1
fi

print_status "Docker is running"

# Pull required Docker images
echo ""
print_info "Pulling Docker images (this may take 5-10 minutes)..."

images=("node:18-alpine" "python:3.11-alpine" "openjdk:17-alpine" "gcc:alpine")
for image in "${images[@]}"; do
    print_info "Pulling $image..."
    if docker pull "$image"; then
        print_status "$image pulled successfully"
    else
        print_warning "Failed to pull $image"
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
if docker run --rm --network=none --memory=128m --cpus=0.5 -v "$(pwd)/temp:/workspace" -w /workspace node:18-alpine node test.js >/dev/null 2>&1; then
    print_status "Node.js Docker test passed"
else
    print_warning "Node.js Docker test failed"
fi

# Test Python
echo 'print("✅ Python Docker working!")' > temp/test.py
if docker run --rm --network=none --memory=128m --cpus=0.5 -v "$(pwd)/temp:/workspace" -w /workspace python:3.11-alpine python test.py >/dev/null 2>&1; then
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
if docker run --rm --network=none --memory=256m --cpus=0.5 -v "$(pwd)/temp:/workspace" -w /workspace openjdk:17-alpine sh -c "javac Test.java && java Test" >/dev/null 2>&1; then
    print_status "Java Docker test passed"
else
    print_warning "Java Docker test failed"
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
if docker run --rm --network=none --memory=128m --cpus=0.5 -v "$(pwd)/temp:/workspace" -w /workspace gcc:alpine sh -c "g++ -o test test.cpp && ./test" >/dev/null 2>&1; then
    print_status "C++ Docker test passed"
else
    print_warning "C++ Docker test failed"
fi

# Clean up test files
rm -f temp/test.js temp/test.py temp/Test.java temp/Test.class temp/test.cpp temp/test

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
else
    print_warning ".env.local not found. Please create it first."
fi

echo ""
print_status "🎉 Docker setup complete!"
echo ""
echo "📋 Next steps:"
echo "=============="
print_info "1. Enable Docker execution in your code:"
echo "   Edit app/api/execute/route.ts:"
echo "   • Uncomment: import { executeInDocker } from '@/lib/docker-executor'"
echo "   • Uncomment: const result = await executeInDocker(language, code, input)"
echo "   • Comment out: const result = await executeWithPiston(language, code, input)"
echo ""
print_info "2. Restart your development server:"
echo "   npm run dev"
echo ""
print_info "3. Test the compiler with some code!"
echo ""
echo "🔒 Security features enabled:"
echo "• No network access for containers"
echo "• Memory limits (128-256MB)"
echo "• CPU limits (0.5 cores)"
echo "• Execution timeouts"
echo "• Isolated file system"
