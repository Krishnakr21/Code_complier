@echo off
echo 🚀 Installing Online Compiler Dependencies...

REM Install main dependencies
echo 📦 Installing main dependencies...
call npm install

REM Install missing Radix UI components
echo 🎨 Installing Radix UI components...
call npm install @radix-ui/react-label @radix-ui/react-slot

REM Install Tailwind CSS animation plugin
echo ✨ Installing Tailwind CSS animations...
call npm install tailwindcss-animate

REM Install MongoDB dependencies
echo 🗄️ Installing MongoDB dependencies...
call npm install mongodb mongoose

echo ✅ All dependencies installed successfully!
echo.
echo 📋 Next steps:
echo 1. Set up your MongoDB connection in .env.local
echo 2. Run 'npm run dev' to start the development server
echo.
echo 💡 For MongoDB setup instructions, check docs/mongodb-setup.md
pause
