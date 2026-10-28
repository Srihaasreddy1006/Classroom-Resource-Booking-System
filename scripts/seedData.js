const User = require('../server/models/User');
const Classroom = require('../server/models/Classroom');
const Resource = require('../server/models/Resource');
const Booking = require('../server/models/Booking');
const Notification = require('../server/models/Notification');
const AuditLog = require('../server/models/AuditLog');

const seedData = async () => {
  try {
    console.log('[Seeder] Cleaning existing collections...');
    await User.deleteMany({});
    await Classroom.deleteMany({});
    await Resource.deleteMany({});
    await Booking.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('[Seeder] Creating educational resources & equipment...');
    const resources = await Resource.create([
      {
        resourceId: 'RES-PRJ-01',
        name: 'Epson 4K Laser Ceiling Projector',
        category: 'Projectors',
        type: 'installed',
        totalQuantity: 1,
        availableQuantity: 1,
        status: 'available',
        description: 'Ultra high-definition laser ceiling projector permanently installed for auditorium presentations.'
      },
      {
        resourceId: 'RES-PRJ-02',
        name: 'ViewSonic Portable HD Projector',
        category: 'Projectors',
        type: 'portable',
        totalQuantity: 6,
        availableQuantity: 5,
        status: 'available',
        description: 'Compact 3800 ANSI Lumens portable projector with HDMI and wireless casting.'
      },
      {
        resourceId: 'RES-SBRD-01',
        name: 'Promethean 75-inch ActivPanel Smart Display',
        category: 'Smart boards',
        type: 'installed',
        totalQuantity: 1,
        availableQuantity: 1,
        status: 'available',
        description: 'Interactive touch flat panel display with digital whiteboard and dual-pen annotation.'
      },
      {
        resourceId: 'RES-SBRD-02',
        name: 'Samsung Flip 65 Pro Interactive Board',
        category: 'Smart boards',
        type: 'installed',
        totalQuantity: 1,
        availableQuantity: 1,
        status: 'available',
        description: 'Digital interactive display for collaborative brainstorming and visual presentations.'
      },
      {
        resourceId: 'RES-PC-01',
        name: 'Dell Precision Core i7 Workstations (Lab Unit)',
        category: 'Computers',
        type: 'installed',
        totalQuantity: 50,
        availableQuantity: 50,
        status: 'available',
        description: 'Intel Core i7 13th Gen, 32GB RAM, 1TB NVMe, Dual Displays for computer laboratory.'
      },
      {
        resourceId: 'RES-PC-02',
        name: 'Dell Latitude Presenter Laptops',
        category: 'Computers',
        type: 'portable',
        totalQuantity: 8,
        availableQuantity: 7,
        status: 'available',
        description: 'Lightweight presenter laptops preloaded with presentation software and compilers.'
      },
      {
        resourceId: 'RES-WBD-01',
        name: 'Mobile Double-Sided Magnetic Whiteboard',
        category: 'Whiteboards',
        type: 'portable',
        totalQuantity: 10,
        availableQuantity: 9,
        status: 'available',
        description: 'Heavy-duty 6x4 ft rolling magnetic whiteboard with marker and eraser kit.'
      },
      {
        resourceId: 'RES-AUD-01',
        name: 'Sennheiser Wireless Mic Kit',
        category: 'Speakers and microphones',
        type: 'portable',
        totalQuantity: 8,
        availableQuantity: 7,
        status: 'available',
        description: 'Professional wireless lapel collar mic and handheld mic with UHF receiver.'
      },
      {
        resourceId: 'RES-AUD-02',
        name: 'JBL EON Portable PA Speaker System',
        category: 'Speakers and microphones',
        type: 'portable',
        totalQuantity: 4,
        availableQuantity: 3,
        status: 'available',
        description: '1000W portable Bluetooth PA loudspeaker for large classrooms and outdoor events.'
      },
      {
        resourceId: 'RES-WIFI-01',
        name: 'Cisco Catalyst Wi-Fi 6 Dedicated Access Point',
        category: 'Wi-Fi facilities',
        type: 'installed',
        totalQuantity: 15,
        availableQuantity: 15,
        status: 'available',
        description: 'Enterprise gigabit 802.11ax dual-band wireless access point.'
      },
      {
        resourceId: 'RES-PRES-01',
        name: 'Logitech Spotlight Presentation Remote',
        category: 'Portable presentation equipment',
        type: 'portable',
        totalQuantity: 12,
        availableQuantity: 10,
        status: 'available',
        description: 'Digital laser highlighter pointer with timer vibration and Bluetooth/USB receiver.'
      },
      {
        resourceId: 'RES-LAB-01',
        name: 'Digital Storage Oscilloscope & Signal Generator',
        category: 'Laboratory equipment',
        type: 'portable',
        totalQuantity: 6,
        availableQuantity: 5,
        status: 'available',
        description: '100MHz 2-channel digital storage oscilloscope kit for electronics and IoT demonstrations.'
      }
    ]);

    console.log('[Seeder] Creating 10 sample classrooms (A through J)...');
    const classrooms = await Classroom.create([
      {
        classroomId: 'CR-101',
        name: 'Classroom A',
        building: 'Main Academic Block',
        floor: '1st Floor',
        capacity: 60,
        type: 'Standard classroom',
        description: 'Spacious tiered lecture classroom with modern acoustic paneling and ergonomic seating.',
        facilities: ['Air Conditioning', 'Whiteboard', 'High-Speed Wi-Fi', 'Audio System', 'Ergonomic Desks'],
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=60'
      },
      {
        classroomId: 'CR-102',
        name: 'Classroom B',
        building: 'Main Academic Block',
        floor: '1st Floor',
        capacity: 75,
        type: 'Smart classroom',
        description: 'State-of-the-art smart classroom with Promethean interactive flat panel and automated lecture recording.',
        facilities: ['Air Conditioning', 'Smart Interactive Display', 'High-Speed Wi-Fi', 'Lecture Recording System'],
        installedEquipment: [resources[2]._id],
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=60'
      },
      {
        classroomId: 'CR-201',
        name: 'Classroom C',
        building: 'Dr. APJ Abdul Kalam Auditorium Complex',
        floor: '2nd Floor',
        capacity: 180,
        type: 'Seminar hall',
        description: 'Tiered auditorium seminar hall equipped for keynote symposiums, technical seminars, and conferences.',
        facilities: ['Centralized Air Conditioning', 'JBL Surround Audio', 'Dual Ceiling Laser Projectors', 'Stage Lighting', 'Podium Mic'],
        installedEquipment: [resources[0]._id],
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=60'
      },
      {
        classroomId: 'CR-202',
        name: 'Classroom D',
        building: 'Turing Computing Centre',
        floor: 'Ground Floor',
        capacity: 50,
        type: 'Computer laboratory',
        description: 'High-performance computing laboratory configured with 50 Core i7 developer workstations and Gigabit LAN.',
        facilities: ['Gigabit Ethernet LAN', '50 Workstations', 'High-Speed Wi-Fi', 'Central UPS Backup', 'Laser Projector'],
        installedEquipment: [resources[4]._id],
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60'
      },
      {
        classroomId: 'CR-301',
        name: 'Classroom E',
        building: 'Administrative & Faculty Block',
        floor: '3rd Floor',
        capacity: 30,
        type: 'Conference room',
        description: 'Executive conference boardroom designed for academic review meetings, viva presentations, and committee discussions.',
        facilities: ['Video Conferencing Camera', 'Conference Mic Array', 'Motorized Projection Screen', 'Executive Seating'],
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=60'
      },
      {
        classroomId: 'CR-302',
        name: 'Classroom F',
        building: 'Science & Humanities Block',
        floor: '2nd Floor',
        capacity: 65,
        type: 'Standard classroom',
        description: 'Bright classroom with natural daylight, dual magnetic whiteboards, and comfortable seating.',
        facilities: ['Ceiling Fans', 'Dual Magnetic Whiteboard', 'High-Speed Wi-Fi', 'Public Address System'],
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=60'
      },
      {
        classroomId: 'CR-401',
        name: 'Classroom G',
        building: 'Science & Humanities Block',
        floor: '3rd Floor',
        capacity: 80,
        type: 'Smart classroom',
        description: 'Collaborative multimedia classroom with Samsung Flip digital board, wireless screen mirroring, and surround audio.',
        facilities: ['Air Conditioning', '4K Smart Touchboard', 'Wireless Audio System', 'HDMI & Type-C Hub'],
        installedEquipment: [resources[3]._id],
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=60'
      },
      {
        classroomId: 'CR-402',
        name: 'Classroom H',
        building: 'Dr. APJ Abdul Kalam Auditorium Complex',
        floor: '1st Floor',
        capacity: 220,
        type: 'Seminar hall',
        description: 'Grand conference hall with wide stage, line-array speakers, and backstage green room for major college gatherings.',
        facilities: ['Central Air Conditioning', 'Line Array Speakers', 'Wireless Handheld Mics', 'Wide Stage', 'Podium'],
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'
      },
      {
        classroomId: 'CR-501',
        name: 'Classroom I',
        building: 'Turing Computing Centre',
        floor: '1st Floor',
        capacity: 45,
        type: 'Computer laboratory',
        description: 'Specialized systems laboratory with dual-boot Linux/Windows systems for operating systems and network engineering.',
        facilities: ['Linux & Windows Dual Boot', '45 Workstations', 'Full Air Conditioning', 'Overhead Projector'],
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60'
      },
      {
        classroomId: 'CR-502',
        name: 'Classroom J',
        building: 'Innovation & Incubation Centre',
        floor: 'Ground Floor',
        capacity: 25,
        type: 'Conference room',
        description: 'Roundtable design boardroom with integrated video conference bar for startup reviews, hackathons, and research demos.',
        facilities: ['Smart Video Bar', 'Circular Table with Power Pods', 'High-Speed Wi-Fi', 'Smart Whiteboard'],
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&auto=format&fit=crop&q=60'
      }
    ]);

    console.log('[Seeder] Creating demo student, faculty, and administrator users...');
    // Passwords will be hashed via User pre-save hook
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@college.edu',
      password: 'AdminPassword@123',
      role: 'admin',
      department: 'Dean of Infrastructure & Facilities',
      idNumber: 'ADM-2026-001',
      phoneNumber: '+91 98765 43210'
    });

    const facultyUser = await User.create({
      name: 'Dr. K. Rajesh Sharma',
      email: 'rajesh.faculty@college.edu',
      password: 'FacultyPassword@123',
      role: 'faculty',
      department: 'Computer Science & Engineering',
      idNumber: 'FAC-CSE-042',
      phoneNumber: '+91 98765 43211'
    });

    const facultyUser2 = await User.create({
      name: 'Prof. Ananya Sen',
      email: 'ananya.faculty@college.edu',
      password: 'FacultyPassword@123',
      role: 'faculty',
      department: 'Information Technology',
      idNumber: 'FAC-IT-019',
      phoneNumber: '+91 98765 43212'
    });

    const studentUser = await User.create({
      name: 'Arun Kumar Reddy',
      email: 'student@college.edu',
      password: 'StudentPassword@123',
      role: 'student',
      department: 'Computer Science & Engineering',
      idNumber: 'URK24CS1178',
      phoneNumber: '+91 98765 43213'
    });

    const studentUser2 = await User.create({
      name: 'Sneha Patel',
      email: 'sneha.student@college.edu',
      password: 'StudentPassword@123',
      role: 'student',
      department: 'Information Technology',
      idNumber: 'URK24CS1092',
      phoneNumber: '+91 98765 43214'
    });

    console.log('[Seeder] Creating realistic booking records across various statuses...');
    const today = new Date();
    const formatDate = (offsetDays) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
    };

    const dateTomorrow = formatDate(1);
    const dateDayAfter = formatDate(2);
    const dateNextWeek = formatDate(4);
    const datePast = formatDate(-2);

    const bookings = await Booking.create([
      {
        bookingId: `BK-${dateTomorrow.replace(/-/g, '')}-1001`,
        user: facultyUser._id,
        classroom: classrooms[0]._id, // Classroom A
        date: dateTomorrow,
        startTime: '09:00',
        endTime: '11:00',
        purpose: 'Advanced Web Technology Lecture & Interactive Coding Session',
        attendees: 55,
        additionalEquipment: [
          { resource: resources[1]._id, resourceName: resources[1].name, quantity: 1 }
        ],
        status: 'Approved',
        reviewedBy: adminUser._id,
        reviewedAt: new Date()
      },
      {
        bookingId: `BK-${dateTomorrow.replace(/-/g, '')}-1002`,
        user: studentUser2._id,
        classroom: classrooms[3]._id, // Classroom D
        date: dateTomorrow,
        startTime: '14:00',
        endTime: '16:30',
        purpose: 'Full-Stack Web Development Project Lab Practice',
        attendees: 40,
        additionalEquipment: [],
        status: 'Approved',
        reviewedBy: adminUser._id,
        reviewedAt: new Date()
      },
      {
        bookingId: `BK-${dateDayAfter.replace(/-/g, '')}-1003`,
        user: studentUser._id,
        classroom: classrooms[1]._id, // Classroom B
        date: dateDayAfter,
        startTime: '10:00',
        endTime: '12:00',
        purpose: 'Computer Society Student Chapter Technical Workshop',
        attendees: 50,
        additionalEquipment: [
          { resource: resources[7]._id, resourceName: resources[7].name, quantity: 1 }
        ],
        status: 'Pending'
      },
      {
        bookingId: `BK-${dateNextWeek.replace(/-/g, '')}-1004`,
        user: facultyUser2._id,
        classroom: classrooms[2]._id, // Classroom C
        date: dateNextWeek,
        startTime: '11:00',
        endTime: '13:00',
        purpose: 'Department Symposium on Cloud & Microservices',
        attendees: 150,
        additionalEquipment: [
          { resource: resources[8]._id, resourceName: resources[8].name, quantity: 1 }
        ],
        status: 'Approved',
        reviewedBy: adminUser._id,
        reviewedAt: new Date()
      },
      {
        bookingId: `BK-${datePast.replace(/-/g, '')}-1005`,
        user: studentUser._id,
        classroom: classrooms[2]._id, // Classroom C
        date: datePast,
        startTime: '16:00',
        endTime: '18:00',
        purpose: 'Unofficial Music Rehearsal',
        attendees: 12,
        additionalEquipment: [],
        status: 'Rejected',
        rejectionReason: 'Classroom C is reserved strictly for academic seminars and official symposiums.',
        reviewedBy: adminUser._id,
        reviewedAt: new Date()
      },
      {
        bookingId: `BK-${datePast.replace(/-/g, '')}-1006`,
        user: facultyUser._id,
        classroom: classrooms[4]._id, // Classroom E
        date: datePast,
        startTime: '15:00',
        endTime: '16:30',
        purpose: 'Curriculum Revision Committee Meeting',
        attendees: 18,
        additionalEquipment: [],
        status: 'Cancelled',
        cancellationReason: 'Meeting postponed to next month due to faculty inspection.',
        cancelledAt: new Date()
      }
    ]);

    console.log('[Seeder] Creating sample notifications...');
    await Notification.create([
      {
        user: studentUser._id,
        title: 'Booking Request Submitted',
        message: `Your booking request ${bookings[2].bookingId} for Classroom B on ${dateDayAfter} is currently pending administrative review.`,
        type: 'booking_created',
        booking: bookings[2]._id,
        isRead: false
      },
      {
        user: facultyUser._id,
        title: 'Booking Approved! 🎉',
        message: `Your reservation ${bookings[0].bookingId} for Classroom A on ${dateTomorrow} from 09:00 to 11:00 has been approved.`,
        type: 'booking_approved',
        booking: bookings[0]._id,
        isRead: true
      },
      {
        user: studentUser._id,
        title: 'Booking Request Rejected',
        message: `Your reservation request ${bookings[4].bookingId} for Classroom C was rejected. Reason: Classroom C is reserved strictly for academic seminars.`,
        type: 'booking_rejected',
        booking: bookings[4]._id,
        isRead: false
      }
    ]);

    console.log('[Seeder] Creating audit logs...');
    await AuditLog.create([
      {
        user: adminUser._id,
        userEmail: adminUser.email,
        userRole: 'admin',
        action: 'SYSTEM_SEEDED',
        details: { message: 'Database populated with initial demo classrooms, resources, and bookings' }
      },
      {
        user: facultyUser._id,
        userEmail: facultyUser.email,
        userRole: 'faculty',
        action: 'BOOKING_CREATED',
        details: { bookingId: bookings[0].bookingId, classroom: 'Classroom A' }
      },
      {
        user: adminUser._id,
        userEmail: adminUser.email,
        userRole: 'admin',
        action: 'BOOKING_APPROVED',
        details: { bookingId: bookings[0].bookingId, classroom: 'Classroom A' }
      }
    ]);

    console.log('✅ [Seeder] Database seeding completed successfully!');
    return true;
  } catch (err) {
    console.error('❌ [Seeder] Database seeding failed:', err);
    throw err;
  }
};

module.exports = seedData;
