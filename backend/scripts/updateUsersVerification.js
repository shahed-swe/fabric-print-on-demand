const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const updateUsersVerification = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/fabric-print-on-demand');
    console.log('Connected to MongoDB');

    // Update all users where isVerified is undefined/null to false
    const result = await User.updateMany(
      { isVerified: { $exists: false } },
      { $set: { isVerified: false } }
    );

    console.log(`Updated ${result.modifiedCount} users with isVerified: false`);

    // Also verify how many unverified users we have
    const unverifiedCount = await User.countDocuments({ isVerified: false });
    const verifiedCount = await User.countDocuments({ isVerified: true });

    console.log(`\nDatabase Summary:`);
    console.log(`Unverified users: ${unverifiedCount}`);
    console.log(`Verified users: ${verifiedCount}`);

    await mongoose.connection.close();
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
};

updateUsersVerification();
