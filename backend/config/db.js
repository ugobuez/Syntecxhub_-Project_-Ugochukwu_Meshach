const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

mongoose.set("strictQuery", true);

let mongoServer;

const connectDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();

    const mongoUri = mongoServer.getUri();

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`In-memory MongoDB connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();

    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }

    console.log("In-memory MongoDB stopped");
  } catch (error) {
    console.error(`MongoDB shutdown error: ${error.message}`);
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;