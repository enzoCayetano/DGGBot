require('dotenv').config();
const mongoose = require('mongoose');

async function connectDB()
{
  try
  {
    await mongoose.connect(process.env.MONGODB_URL, {
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