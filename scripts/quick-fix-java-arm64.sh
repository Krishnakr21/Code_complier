#!/bin/bash

echo "🔧 Quick fix for Java on Apple Silicon..."

# Try different Java images for ARM64
JAVA_IMAGES=(
    "eclipse-temurin:17-jre-alpine"
    "amazoncorretto:17-alpine"
    "openjdk:11-jre-alpine"
    "eclipse-temurin:11-jre-alpine"
)

for image in "${JAVA_IMAGES[@]}"; do
    echo "Trying $image..."
    if docker pull "$image" 2>/dev/null; then
        echo "✅ Successfully pulled $image"
        
        # Test the image
        echo 'public class Test { public static void main(String[] args) { System.out.println("Java works!"); } }' > temp/Test.java
        if docker run --rm -v "$(pwd)/temp:/workspace" -w /workspace "$image" sh -c "javac Test.java && java Test" 2>/dev/null; then
            echo "✅ $image works perfectly!"
            echo ""
            echo "Update your .env.local with:"
            echo "DOCKER_JAVA_IMAGE=$image"
            rm -f temp/Test.java temp/Test.class
            exit 0
        fi
    fi
done

echo "❌ No working Java image found. Using Piston API instead."
