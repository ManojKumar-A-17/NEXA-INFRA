import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Import User model
import User from '../src/models/User';

async function debugAuth() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexa-infra';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find a contractor user
    const testEmail = 'palani.pmp.ele@gmail.com';
    const testPassword = 'password3';

    console.log(`🔍 Debugging login for: ${testEmail}`);
    console.log(`📝 Input password: ${testPassword}\n`);

    // Find user with password field
    const user = await User.findOne({ email: testEmail.toLowerCase() }).select('+password');

    if (!user) {
      console.log('❌ User not found in database!');
      process.exit(1);
    }

    console.log('✅ User found!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🎭 Role: ${user.role}`);
    console.log(`✔️  Active: ${user.isActive}`);
    console.log(`🔐 Stored password hash (first 50 chars): ${user.password.substring(0, 50)}...\n`);

    // Test password comparison
    console.log('🧪 Testing password comparison...');
    const isMatch = await user.comparePassword(testPassword);

    if (isMatch) {
      console.log('✅ Password matches! Login should work.');
    } else {
      console.log('❌ Password does NOT match!');
      console.log('\nTrying manual bcrypt comparison...');
      
      const manualMatch = await bcryptjs.compare(testPassword, user.password);
      console.log(`Manual bcrypt check: ${manualMatch ? '✅ Match' : '❌ No match'}`);

      // Try hashing the input password and comparing
      console.log('\nDebug info:');
      console.log(`Password length: ${testPassword.length}`);
      console.log(`Hash length: ${user.password.length}`);
      console.log(`Hash format valid: ${user.password.startsWith('$2') ? '✅ Yes' : '❌ No'}`);
    }

    // List all contractor users and their emails
    console.log('\n📋 All contractors in database:');
    const allContractors = await User.find({ role: 'contractor' });
    allContractors.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email} (Name: ${u.name})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugAuth();
