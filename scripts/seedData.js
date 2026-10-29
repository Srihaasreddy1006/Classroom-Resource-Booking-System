const User = require('../server/models/User');
const Classroom = require('../server/models/Classroom');
const Booking = require('../server/models/Booking');
const Notification = require('../server/models/Notification');
const AuditLog = require('../server/models/AuditLog');

const seedData = async () => {
  try {
    console.log('[Seeder] Cleaning existing collections...');
    await User.deleteMany({});
    await Classroom.deleteMany({});
    await Booking.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('[Seeder] Creating 1 Admin and 1 User...');
    // 1. Admin Account
    const adminUser = await User.create({
      name: 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@college.edu',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      department: 'Administration',
      idNumber: 'ADM-001',
      phoneNumber: '+91 98765 43210'
    });

    // 2. Regular User Account
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'user@college.edu',
      password: 'User@123',
      role: 'user',
      department: 'Computer Science',
      idNumber: 'CS-2026-042',
      phoneNumber: '+91 98765 12345'
    });

    // Secondary student account for test suite compatibility
    const studentUser = await User.create({
      name: 'Arun Student',
      email: 'student@college.edu',
      password: 'StudentPassword@123',
      role: 'student',
      department: 'Computer Science',
      idNumber: 'STU-1001'
    });

    console.log('[Seeder] Creating 3 Categories of Campus Resources...');
    const classrooms = await Classroom.create([
      // CATEGORY 1: Classrooms
      {
        classroomId: 'CR-101',
        name: 'Lecture Hall 101',
        building: 'Main Academic Block',
        floor: '1st Floor',
        capacity: 60,
        type: 'Standard classroom',
        description: 'Standard tiered classroom with high-definition laser projector, sound system, and whiteboard.',
        facilities: ['Projector', 'Whiteboard', 'Sound System', 'Wi-Fi'],
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800'
      },
      {
        classroomId: 'CR-102',
        name: 'Smart Classroom 102',
        building: 'Main Academic Block',
        floor: '2nd Floor',
        capacity: 50,
        type: 'Smart classroom',
        description: 'Interactive smart classroom equipped with digital smart board, lecture capture, and air conditioning.',
        facilities: ['Smart Board', 'Digital Projector', 'Air Conditioning', 'Wi-Fi'],
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800'
      },

      // CATEGORY 2: Computer Labs
      {
        classroomId: 'LAB-201',
        name: 'AI/ML Research Lab',
        building: 'Technology Park',
        floor: 'Ground Floor',
        capacity: 40,
        type: 'Computer laboratory',
        description: 'High-performance computing laboratory with Nvidia GPU workstations for machine learning and data science.',
        facilities: ['40 GPU Workstations', 'High-Speed LAN', 'Dual Projectors', 'Air Conditioning'],
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800'
      },
      {
        classroomId: 'LAB-202',
        name: 'Networks & IoT Lab',
        building: 'Technology Park',
        floor: '1st Floor',
        capacity: 35,
        type: 'Computer laboratory',
        description: 'Advanced networking lab with Cisco routers, switches, IoT development boards, and packet analyzers.',
        facilities: ['Cisco Hardware Racks', 'IoT Sensor Kits', 'Smart Board', 'Gigabit Wi-Fi'],
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'
      },

      // CATEGORY 3: Seminar Halls
      {
        classroomId: 'HALL-301',
        name: 'APJ Abdul Kalam Convention Center',
        building: 'Auditorium Complex',
        floor: 'Ground Floor',
        capacity: 300,
        type: 'Seminar hall',
        description: 'Premier university auditorium for international conferences, symposiums, guest lectures, and convocations.',
        facilities: ['300 Pushback Seats', '4K Laser Projection', 'Surround Sound', 'Stage Lighting', 'Central AC'],
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'
      },
      {
        classroomId: 'HALL-302',
        name: 'Executive Conference Hall',
        building: 'Administrative Block',
        floor: '3rd Floor',
        capacity: 80,
        type: 'Conference room',
        description: 'Executive seminar hall with roundtable seating and hybrid video-conferencing facilities for board meetings.',
        facilities: ['Video Conferencing Bar', '80 Executive Seats', 'Digital Podium', 'Wi-Fi'],
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800'
      }
    ]);

    // Create 2 clear sample bookings
    console.log('[Seeder] Creating sample reservations...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dateTomorrow = tomorrow.toISOString().split('T')[0];

    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);
    const dateDayAfter = dayAfter.toISOString().split('T')[0];

    const bookings = await Booking.create([
      {
        bookingId: `BK-${dateTomorrow.replace(/-/g, '')}-1001`,
        user: regularUser._id,
        classroom: classrooms[0]._id, // Lecture Hall 101
        date: dateTomorrow,
        startTime: '10:00',
        endTime: '12:00',
        purpose: 'Web Technology & Database Systems Lecture',
        attendees: 55,
        status: 'Approved',
        reviewedBy: adminUser._id,
        reviewedAt: new Date()
      },
      {
        bookingId: `BK-${dateDayAfter.replace(/-/g, '')}-1002`,
        user: regularUser._id,
        classroom: classrooms[2]._id, // AI/ML Research Lab
        date: dateDayAfter,
        startTime: '14:00',
        endTime: '16:00',
        purpose: 'Deep Learning Practical Lab & Model Training',
        attendees: 38,
        status: 'Pending'
      }
    ]);

    console.log('[Seeder] Creating in-app notification...');
    await Notification.create({
      user: regularUser._id,
      title: 'Booking Confirmed! 🎉',
      message: `Your booking request for Lecture Hall 101 on ${dateTomorrow} (10:00 - 12:00) has been approved.`,
      type: 'booking_approved',
      booking: bookings[0]._id,
      isRead: false
    });

    console.log('[Seeder] Creating initial system audit log...');
    await AuditLog.create({
      user: adminUser._id,
      userEmail: adminUser.email,
      userRole: 'admin',
      action: 'SYSTEM_SEEDED',
      details: { message: 'Database seeded with 3 resource categories, 1 admin, 1 user, and 2 sample bookings' }
    });

    console.log('✅ [Seeder] Seed complete! 1 Admin, 1 User, 6 Classrooms across 3 Categories, 2 Bookings.');
    return true;
  } catch (err) {
    console.error('❌ [Seeder] Error seeding data:', err);
    throw err;
  }
};

module.exports = seedData;
