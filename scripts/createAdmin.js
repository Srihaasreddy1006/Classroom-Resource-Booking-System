require('dotenv').config();
const { connectDB, disconnectDB } = require('../server/config/db');
const User = require('../server/models/User');

const parseArgs = () => {
  const args = process.argv.slice(2);
  const params = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        params[key] = nextArg;
        i++;
      } else {
        params[key] = true;
      }
    }
  }
  return params;
};

const createAdmin = async () => {
  try {
    const params = parseArgs();

    const name = params.name || process.env.ADMIN_NAME || 'System Administrator';
    const email = params.email || process.env.ADMIN_EMAIL || 'admin@college.edu';
    const password = params.password || process.env.ADMIN_PASSWORD;
    const department = params.department || process.env.ADMIN_DEPT || 'Dean of Infrastructure & Facilities';
    const idNumber = params.idNumber || process.env.ADMIN_ID || 'ADM-2026-001';

    if (!password) {
      console.error('\n❌ Error: Please provide an admin password using either:');
      console.error('   1. Environment variable ADMIN_PASSWORD in .env');
      console.error('   2. Command line flag: npm run create-admin -- --email admin@college.edu --password <YourStrongPassword>\n');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('\n❌ Error: Admin password must be at least 6 characters long.\n');
      process.exit(1);
    }

    console.log('Connecting to database...');
    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      existingUser.role = 'admin';
      existingUser.name = name;
      existingUser.department = department;
      existingUser.password = password; // pre-save hook will hash it
      await existingUser.save();
      console.log(`\n✅ Existing user '${email}' was elevated to Administrator successfully.`);
    } else {
      await User.create({
        name,
        email: email.toLowerCase().trim(),
        password,
        role: 'admin',
        department,
        idNumber,
        phoneNumber: params.phone || '+91 98765 43210'
      });
      console.log(`\n✅ New Administrator account created successfully:`);
      console.log(`   Name:       ${name}`);
      console.log(`   Email:      ${email}`);
      console.log(`   Role:       admin`);
      console.log(`   Department: ${department}`);
    }

    console.log('\nYou can now log in at http://localhost:5000/login.html with these credentials.\n');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Fatal: Failed to create admin account:', err.message);
    process.exit(1);
  }
};

createAdmin();
