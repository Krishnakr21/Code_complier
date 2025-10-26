#!/bin/bash

echo "🚀 Installing Online Compiler Dependencies..."

# Install main dependencies
echo "📦 Installing main dependencies..."
npm install

# Install missing Radix UI components
echo "🎨 Installing Radix UI components..."
npm install @radix-ui/react-label @radix-ui/react-slot

# Install Tailwind CSS animation plugin
echo "✨ Installing Tailwind CSS animations..."
npm install tailwindcss-animate

# Install MongoDB dependencies
echo "🗄️ Installing MongoDB dependencies..."
npm install mongodb mongoose

echo "✅ All dependencies installed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your MongoDB connection in .env.local"
echo "2. Run 'npm run dev' to start the development server"
echo ""
echo "💡 For MongoDB setup instructions, check docs/mongodb-setup.md"
