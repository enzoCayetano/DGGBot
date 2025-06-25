require('dotenv').config();
const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI from environment variables.
 * Logs success or failure to the console.
 */
async function connectDB()
{
  try
  {
    await mongoose.connect(process.env.MONGO_URI, 
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('🟢 Connected to MongoDB');
  }
  catch (err)
  {
    console.error('❌ MongoDB connection error:', err);
  }
}

module.exports = connectDB;
