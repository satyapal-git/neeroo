const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('ℹ️ Admin already exists:', existingAdmin.username);
      process.exit(0);
    }

    // Create default admin
    const defaultAdmin = new Admin({
      username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
      mobile: process.env.DEFAULT_ADMIN_MOBILE || '9876543210',
      email: 'admin@spiceparadise.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
      role: 'super-admin',
      permissions: {
        canManageOrders: true,
        canManageMenu: true,
        canViewReports: true,
        canManageUsers: true,
        canManageStaff: true
      },
      profile: {
        fullName: 'System Administrator',
        department: 'management'
      },
      isActive: true
    });

    await defaultAdmin.save();

    console.log('✅ Default admin created successfully!');
    console.log('📋 Admin Credentials:');
    console.log(`   Username: ${defaultAdmin.username}`);
    console.log(`   Mobile: ${defaultAdmin.mobile}`);
    console.log(`   Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'}`);
    console.log(`   Role: ${defaultAdmin.role}`);
    
    console.log('\n🔐 For OTP login, use:');
    console.log(`   Username: ${defaultAdmin.username}`);
    console.log(`   Mobile: ${defaultAdmin.mobile}`);
    console.log('   OTP: Will be shown in console during login');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

// Run the seeder
seedAdmin();