import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable. For local dev use .env.local; for production set it in your hosting provider's env settings.")
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongooseConnection

if (!cached) {
  cached = global.mongooseConnection = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts: Parameters<typeof mongoose.connect>[1] = {
      bufferCommands: false,
      // Helps fail fast in constrained environments
      serverSelectionTimeoutMS: 10000,
      // Use provided DB name if set (works for both mongodb+srv and mongodb protocols)
      dbName: MONGODB_DB_NAME || undefined,
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("✅ Connected to MongoDB")
        return mongoose
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e: any) {
    cached.promise = null
    // Provide clearer diagnostics for common deployment issues
    if (e?.code === "ECONNREFUSED" && /_mongodb\._tcp\./.test(String(e?.hostname))) {
      console.error(
        "MongoDB SRV lookup refused. If you're using mongodb+srv, your DNS may block SRV records. Options: (1) switch to Atlas Standard (non-SRV) connection string starting with mongodb://, or (2) change your DNS to 8.8.8.8/1.1.1.1 and allow SRV queries."
      )
    }
    if (e?.name === "MongooseServerSelectionError") {
      console.error(
        "MongoDB server selection failed. Verify that your MONGODB_URI host is correct, your IP is allowed in Atlas Network Access, and credentials are valid."
      )
    }
    throw e
  }

  return cached.conn
}

export default connectDB
