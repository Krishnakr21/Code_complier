# MongoDB Setup Guide

Complete guide for setting up MongoDB for the Online Compiler application.

## Overview

The Online Compiler uses MongoDB to store:
- User accounts and authentication
- User profiles and preferences
- Saved code files and projects
- Session data

## Option 1: MongoDB Atlas (Cloud) - Recommended

### Why Atlas?
- ✅ Free tier available (512MB storage)
- ✅ No local installation required
- ✅ Automatic backups and scaling
- ✅ Built-in security features
- ✅ Global availability

### Setup Steps

1. **Create Account**
   - Go to https://www.mongodb.com/atlas
   - Click "Try Free"
   - Sign up with email or Google/GitHub

2. **Create Cluster**
   - Choose "Build a Database"
   - Select "FREE" tier (M0 Sandbox)
   - Choose your preferred region (closest to you)
   - Keep default settings
   - Click "Create Cluster"

3. **Setup Database User**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication method
   - Enter username and strong password
   - Set role to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - For development: Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IP addresses
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" and version "4.1 or later"
   - Copy the connection string

6. **Update .env.local**
   \`\`\`env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/online-compiler?retryWrites=true&w=majority
   \`\`\`
   
   Replace:
   - `username` with your database username
   - `password` with your database password
   - `cluster0.xxxxx.mongodb.net` with your actual cluster URL

### Atlas Security Best Practices

1. **Strong Passwords**
   - Use complex passwords for database users
   - Consider using password managers

2. **IP Whitelisting**
   - In production, only allow specific IP addresses
   - Regularly review and update IP whitelist

3. **Connection String Security**
   - Never commit connection strings to version control
   - Use environment variables only
   - Rotate passwords regularly

## Option 2: Local MongoDB Installation

### Windows Installation

1. **Download MongoDB**
   - Go to https://www.mongodb.com/try/download/community
   - Select "Windows" and "msi" package
   - Download the installer

2. **Install MongoDB**
   - Run the .msi installer
   - Choose "Complete" installation
   - Install as a Windows Service
   - Install MongoDB Compass (GUI tool)

3. **Verify Installation**
   \`\`\`cmd
   # Open Command Prompt as Administrator
   mongod --version
   mongo --version
   \`\`\`

4. **Start MongoDB Service**
   \`\`\`cmd
   # Start service
   net start MongoDB
   
   # Check if running
   tasklist /fi "imagename eq mongod.exe"
   \`\`\`

5. **Update .env.local**
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/online-compiler
   \`\`\`

### macOS Installation

1. **Using Homebrew (Recommended)**
   \`\`\`bash
   # Install Homebrew if not already installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Add MongoDB tap
   brew tap mongodb/brew
   
   # Install MongoDB Community Edition
   brew install mongodb-community
   
   # Start MongoDB service
   brew services start mongodb/brew/mongodb-community
   \`\`\`

2. **Manual Installation**
   - Download from https://www.mongodb.com/try/download/community
   - Select "macOS" and download .tgz file
   - Extract and follow installation instructions

3. **Verify Installation**
   \`\`\`bash
   mongod --version
   mongo --version
   \`\`\`

4. **Update .env.local**
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/online-compiler
   \`\`\`

### Linux Installation (Ubuntu/Debian)

1. **Import MongoDB GPG Key**
   \`\`\`bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   \`\`\`

2. **Add MongoDB Repository**
   \`\`\`bash
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   \`\`\`

3. **Update Package Database**
   \`\`\`bash
   sudo apt-get update
   \`\`\`

4. **Install MongoDB**
   \`\`\`bash
   sudo apt-get install -y mongodb-org
   \`\`\`

5. **Start MongoDB Service**
   \`\`\`bash
   # Start service
   sudo systemctl start mongod
   
   # Enable auto-start on boot
   sudo systemctl enable mongod
   
   # Check status
   sudo systemctl status mongod
   \`\`\`

6. **Verify Installation**
   \`\`\`bash
   mongod --version
   mongo --version
   \`\`\`

7. **Update .env.local**
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/online-compiler
   \`\`\`

## Database Structure

The application automatically creates these collections:

### Users Collection
\`\`\`javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date,
  profile: {
    bio: String,
    location: String,
    website: String,
    githubUsername: String
  },
  preferences: {
    defaultLanguage: String,
    theme: String,
    fontSize: Number,
    autoSave: Boolean
  }
}
\`\`\`

### CodeFiles Collection
\`\`\`javascript
{
  _id: ObjectId,
  userId: String,
  name: String,
  language: String,
  code: String,
  input: String,
  description: String,
  tags: [String],
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date,
  lastExecutedAt: Date,
  executionCount: Number
}
\`\`\`

## Testing Connection

### Using the Application
1. Start your Next.js app: `npm run dev`
2. Check browser console for "✅ Connected to MongoDB"
3. Try creating a user account
4. Save a code file to test database operations

### Using MongoDB Compass (GUI)
1. Install MongoDB Compass
2. Connect using your connection string
3. Browse databases and collections
4. View and edit documents

### Using Command Line
\`\`\`bash
# Connect to local MongoDB
mongo

# Connect to Atlas
mongo "mongodb+srv://cluster0.xxxxx.mongodb.net/online-compiler" --username your-username

# Show databases
show dbs

# Use your database
use online-compiler

# Show collections
show collections

# Find users
db.users.find()

# Find code files
db.codefiles.find()
\`\`\`

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   \`\`\`
   Error: connect ETIMEDOUT
   \`\`\`
   **Solutions:**
   - Check internet connection
   - Verify IP whitelist in Atlas
   - Check firewall settings

2. **Authentication Failed**
   \`\`\`
   Error: Authentication failed
   \`\`\`
   **Solutions:**
   - Verify username/password in connection string
   - Check database user permissions
   - Ensure user has correct database access

3. **Database Not Found**
   \`\`\`
   Error: Database does not exist
   \`\`\`
   **Solutions:**
   - MongoDB creates databases automatically
   - Ensure connection string includes database name
   - Check for typos in database name

4. **Local MongoDB Not Starting**
   \`\`\`bash
   # Check if MongoDB is running
   ps aux | grep mongod
   
   # Check MongoDB logs
   tail -f /var/log/mongodb/mongod.log
   
   # Restart MongoDB
   sudo systemctl restart mongod
   \`\`\`

5. **Port Already in Use**
   \`\`\`bash
   # Find process using port 27017
   lsof -i :27017
   
   # Kill process if needed
   sudo kill -9 <PID>
   \`\`\`

### Performance Optimization

1. **Indexes**
   - The application automatically creates necessary indexes
   - Monitor slow queries in production

2. **Connection Pooling**
   - Mongoose handles connection pooling automatically
   - Adjust pool size if needed for high traffic

3. **Memory Usage**
   - Monitor MongoDB memory usage
   - Consider upgrading Atlas tier for production

## Security Best Practices

### For Atlas (Cloud)
1. **Network Security**
   - Use IP whitelisting
   - Enable VPC peering for production

2. **Authentication**
   - Use strong passwords
   - Enable two-factor authentication
   - Rotate credentials regularly

3. **Encryption**
   - Atlas encrypts data at rest by default
   - Use TLS for connections (enabled by default)

### For Local Installation
1. **Enable Authentication**
   \`\`\`bash
   # Create admin user
   mongo
   use admin
   db.createUser({
     user: "admin",
     pwd: "strongpassword",
     roles: ["userAdminAnyDatabase"]
   })
   \`\`\`

2. **Enable Authorization**
   Edit `/etc/mongod.conf`:
   \`\`\`yaml
   security:
     authorization: enabled
   \`\`\`

3. **Firewall Configuration**
   \`\`\`bash
   # Only allow local connections
   sudo ufw allow from 127.0.0.1 to any port 27017
   \`\`\`

## Backup and Recovery

### Atlas Backups
- Automatic backups included in paid tiers
- Point-in-time recovery available
- Download backups for local storage

### Local Backups
\`\`\`bash
# Create backup
mongodump --db online-compiler --out /path/to/backup

# Restore backup
mongorestore --db online-compiler /path/to/backup/online-compiler
\`\`\`

## Monitoring

### Atlas Monitoring
- Built-in performance monitoring
- Real-time metrics and alerts
- Query performance insights

### Local Monitoring
\`\`\`bash
# MongoDB stats
mongo --eval "db.stats()"

# Connection stats
mongo --eval "db.serverStatus().connections"

# Current operations
mongo --eval "db.currentOp()"
\`\`\`

## Migration

### From Local to Atlas
1. Export local data: `mongodump --db online-compiler`
2. Import to Atlas: `mongorestore --uri "mongodb+srv://..." dump/online-compiler`

### From Atlas to Local
1. Export Atlas data using MongoDB Compass or mongodump
2. Import to local: `mongorestore --db online-compiler /path/to/dump`

This completes the MongoDB setup guide!
