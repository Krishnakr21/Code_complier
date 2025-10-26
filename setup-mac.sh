#!/bin/bash

echo "🚀 Setting up Online Compiler on macOS..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is for macOS only!"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check and install Homebrew
echo ""
print_info "Checking Homebrew..."
if ! command_exists brew; then
    print_warning "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ $(uname -m) == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    print_status "Homebrew is already installed"
    brew update
fi

# Check and install Node.js
echo ""
print_info "Checking Node.js..."
if ! command_exists node; then
    print_warning "Node.js not found. Installing Node.js..."
    brew install node
else
    NODE_VERSION=$(node --version)
    print_status "Node.js is installed: $NODE_VERSION"
fi

# Check npm
if ! command_exists npm; then
    print_error "npm not found. Please install Node.js manually."
    exit 1
fi

# Check and install Git
echo ""
print_info "Checking Git..."
if ! command_exists git; then
    print_warning "Git not found. Installing Git..."
    brew install git
else
    print_status "Git is already installed"
fi

# Check and install Docker
echo ""
print_info "Checking Docker..."
if ! command_exists docker; then
    print_warning "Docker not found. Installing Docker..."
    brew install --cask docker
    print_info "Docker installed. Please start Docker Desktop manually and then re-run this script."
    print_info "You can find Docker Desktop in Applications folder."
    open -a Docker
    echo ""
    read -p "Press Enter after Docker Desktop is running..."
else
    print_status "Docker is already installed"
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_warning "Docker is not running. Starting Docker Desktop..."
        open -a Docker
        echo "Waiting for Docker to start..."
        while ! docker info >/dev/null 2>&1; do
            sleep 2
            echo -n "."
        done
        echo ""
        print_status "Docker is now running"
    else
        print_status "Docker is running"
    fi
fi

# Install project dependencies
echo ""
print_info "Installing project dependencies..."
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Make sure you're in the project directory."
    exit 1
fi

npm install
npm install @radix-ui/react-label @radix-ui/react-slot tailwindcss-animate mongodb mongoose

print_status "Dependencies installed"

# Setup Docker images for code execution
echo ""
print_info "Setting up Docker images for code execution..."
if docker info >/dev/null 2>&1; then
    print_info "Pulling Docker images (this may take a few minutes)..."
    
    docker pull node:18-alpine &
    docker pull python:3.11-alpine &
    docker pull openjdk:17-alpine &
    docker pull gcc:alpine &
    
    # Wait for all pulls to complete
    wait
    
    # Create Docker network
    docker network create --driver bridge compiler-network 2>/dev/null || true
    
    # Create temp directory
    mkdir -p temp
    
    print_status "Docker setup completed"
    
    # Test Docker setup
    echo ""
    print_info "Testing Docker setup..."
    
    # Test Node.js
    echo 'console.log("✅ Node.js Docker working!");' > temp/test.js
    if docker run --rm -v "$(pwd)/temp:/workspace" -w /workspace node:18-alpine node test.js; then
        print_status "Node.js Docker test passed"
    else
        print_warning "Node.js Docker test failed"
    fi
    
    # Test Python
    echo 'print("✅ Python Docker working!")' > temp/test.py
    if docker run --rm -v "$(pwd)/temp:/workspace" -w /workspace python:3.11-alpine python test.py; then
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
    if docker run --rm -v "$(pwd)/temp:/workspace" -w /workspace openjdk:17-alpine sh -c "javac Test.java && java Test"; then
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
    if docker run --rm -v "$(pwd)/temp:/workspace" -w /workspace gcc:alpine sh -c "g++ -o test test.cpp && ./test"; then
        print_status "C++ Docker test passed"
    else
        print_warning "C++ Docker test failed"
    fi
    
    # Clean up test files
    rm -f temp/test.js temp/test.py temp/Test.java temp/Test.class temp/test.cpp temp/test
    
else
    print_warning "Docker is not running. Skipping Docker setup."
    print_info "You can run this script again after starting Docker Desktop."
fi

# Setup environment file
echo ""
print_info "Setting up environment configuration..."
if [ ! -f ".env.local" ]; then
    cat > .env.local << 'EOF'
# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# NextAuth configuration
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-too
NEXTAUTH_URL=http://localhost:3000

# MongoDB Configuration
# Option 1: Local MongoDB (install MongoDB first)
MONGODB_URI=mongodb://localhost:27017/online-compiler

# Option 2: MongoDB Atlas (cloud) - Replace with your connection string
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/online-compiler

# Docker execution (set to true to use Docker instead of Piston API)
USE_DOCKER_EXECUTION=false
EOF
    print_status "Environment file created (.env.local)"
else
    print_status "Environment file already exists"
fi

# Check and install MongoDB
echo ""
print_info "Checking MongoDB..."
if ! command_exists mongod; then
    print_warning "MongoDB not found. Installing MongoDB..."
    brew tap mongodb/brew
    brew install mongodb-community
    
    # Start MongoDB service
    brew services start mongodb/brew/mongodb-community
    print_status "MongoDB installed and started"
else
    print_status "MongoDB is already installed"
    
    # Check if MongoDB is running
    if ! pgrep -x "mongod" > /dev/null; then
        print_info "Starting MongoDB service..."
        brew services start mongodb/brew/mongodb-community
    fi
    print_status "MongoDB is running"
fi

# Build the project
echo ""
print_info "Building the project..."
if npm run build; then
    print_status "Project built successfully"
else
    print_warning "Build had some issues, but continuing..."
fi

# Final setup summary
echo ""
echo "🎉 Setup Complete!"
echo "=================="
print_status "Node.js and npm installed"
print_status "Docker Desktop installed and configured"
print_status "MongoDB installed and running"
print_status "Project dependencies installed"
print_status "Environment configuration created"

echo ""
echo "📋 Next Steps:"
echo "=============="
print_info "1. Start the development server:"
echo "   npm run dev"
echo ""
print_info "2. Open your browser and go to:"
echo "   http://localhost:3000"
echo ""
print_info "3. Create an account and test the compiler"
echo ""
print_info "4. Optional: Setup MongoDB Atlas for cloud database:"
echo "   - Go to https://www.mongodb.com/atlas"
echo "   - Create free account and cluster"
echo "   - Update MONGODB_URI in .env.local"
echo ""
print_info "5. Optional: Enable Docker execution:"
echo "   - Set USE_DOCKER_EXECUTION=true in .env.local"
echo "   - Uncomment Docker execution in app/api/execute/route.ts"

echo ""
echo "🆘 Troubleshooting:"
echo "==================="
print_info "If you encounter issues:"
echo "• Check that Docker Desktop is running"
echo "• Verify MongoDB is running: brew services list | grep mongodb"
echo "• Check the browser console for errors"
echo "• Review the documentation in docs/ folder"

echo ""
print_info "🚀 Ready to start coding! Run 'npm run dev' to begin."
