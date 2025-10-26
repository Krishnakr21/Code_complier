# PowerShell script for Windows Docker setup

Write-Host "🐳 Setting up Docker environment for Online Compiler..." -ForegroundColor Blue

# Check if Docker is installed
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed." -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://docs.docker.com/desktop/windows/install/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Pull required Docker images
Write-Host "📥 Pulling Docker images..." -ForegroundColor Blue

$images = @("node:18-alpine", "python:3.11-alpine", "openjdk:17-alpine", "gcc:alpine")
foreach ($image in $images) {
    Write-Host "Pulling $image..." -ForegroundColor Cyan
    docker pull $image
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $image pulled successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Failed to pull $image" -ForegroundColor Yellow
    }
}

# Create Docker network
Write-Host "🌐 Creating Docker network..." -ForegroundColor Blue
docker network create --driver bridge compiler-network 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker network created" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Docker network already exists" -ForegroundColor Cyan
}

# Create temp directory
Write-Host "📁 Creating temp directory..." -ForegroundColor Blue
New-Item -ItemType Directory -Force -Path "temp" | Out-Null
Write-Host "✅ Temp directory created" -ForegroundColor Green

# Test Docker setup
Write-Host "🧪 Testing Docker setup..." -ForegroundColor Blue

# Test Node.js
"console.log('✅ Node.js Docker working!');" | Out-File -FilePath "temp/test.js" -Encoding UTF8
docker run --rm --network=none --memory=128m --cpus=0.5 -v "${PWD}/temp:/workspace" -w /workspace node:18-alpine node test.js
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js Docker test passed" -ForegroundColor Green
}

# Test Python
"print('✅ Python Docker working!')" | Out-File -FilePath "temp/test.py" -Encoding UTF8
docker run --rm --network=none --memory=128m --cpus=0.5 -v "${PWD}/temp:/workspace" -w /workspace python:3.11-alpine python test.py
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Python Docker test passed" -ForegroundColor Green
}

# Clean up
Remove-Item "temp/test.js", "temp/test.py" -ErrorAction SilentlyContinue

Write-Host "🎉 Docker setup complete!" -ForegroundColor Green
Write-Host "Run 'npm run dev' to start the application with Docker execution enabled." -ForegroundColor Cyan
