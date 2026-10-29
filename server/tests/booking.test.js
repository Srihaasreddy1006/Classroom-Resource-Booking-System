const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const Resource = require('../models/Resource');
require('./setup');

describe('Booking & Double-Booking Prevention Suite', () => {
  let studentToken;
  let adminToken;
  let testClassroom;
  let portableProjector;

  beforeEach(async () => {
    // 1. Create Student
    const student = await User.create({
      name: 'Booking Student',
      email: 'student.book@college.edu',
      password: 'Password@123',
      role: 'student',
      department: 'CSE',
      idNumber: 'STU-001'
    });
    const sLogin = await request(app).post('/api/auth/login').send({
      email: 'student.book@college.edu',
      password: 'Password@123'
    });
    studentToken = sLogin.body.token;

    // 2. Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin.book@college.edu',
      password: 'AdminPassword@123',
      role: 'admin',
      department: 'Facilities',
      idNumber: 'ADM-001'
    });
    const aLogin = await request(app).post('/api/auth/login').send({
      email: 'admin.book@college.edu',
      password: 'AdminPassword@123'
    });
    adminToken = aLogin.body.token;

    // 3. Create Classroom A
    testClassroom = await Classroom.create({
      classroomId: 'CR-101',
      name: 'Classroom A',
      building: 'Academic Block',
      floor: '1st Floor',
      capacity: 50,
      type: 'Standard classroom',
      description: 'Standard lecture room',
      status: 'active'
    });

    // 4. Create Portable Projector
    portableProjector = await Resource.create({
      resourceId: 'RES-PRJ-01',
      name: 'Portable Projector',
      category: 'Projectors',
      type: 'portable',
      totalQuantity: 5,
      availableQuantity: 5,
      status: 'available'
    });
  });

  const getFutureDate = (offsetDays = 2) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  it('should reject booking requests with a date in the past', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        classroomId: testClassroom._id,
        date: '2020-01-01',
        startTime: '09:00',
        endTime: '11:00',
        purpose: 'Past booking test',
        attendees: 30
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('past');
  });

  it('should reject booking requests where start time is not before end time', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        classroomId: testClassroom._id,
        date: getFutureDate(3),
        startTime: '14:00',
        endTime: '11:00',
        purpose: 'Invalid time order test',
        attendees: 30
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Start time must be strictly before end time');
  });

  it('should reject booking when expected attendees exceed classroom capacity', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        classroomId: testClassroom._id,
        date: getFutureDate(3),
        startTime: '09:00',
        endTime: '11:00',
        purpose: 'Capacity overflow test',
        attendees: 75 // Capacity is 50
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('exceed the seating capacity');
  });

  it('should successfully create a valid booking and decrement requested equipment quantity', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        classroomId: testClassroom._id,
        date: getFutureDate(3),
        startTime: '09:00',
        endTime: '11:00',
        purpose: 'Web Technology Project Presentation',
        attendees: 35,
        additionalEquipment: [
          { resource: portableProjector._id, quantity: 1 }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Pending');
    expect(res.body.data.bookingId).toMatch(/^BK-\d+-\d+$/);

    // Verify equipment quantity decreased
    const updatedEq = await Resource.findById(portableProjector._id);
    expect(updatedEq.availableQuantity).toBe(4);
  });

  it('MANDATORY: should detect double-booking conflict and reject overlapping requests with HTTP 409', async () => {
    const bookingDate = getFutureDate(4);

    // 1. First user books 09:00 - 11:00
    const res1 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        classroomId: testClassroom._id,
        date: bookingDate,
        startTime: '09:00',
        endTime: '11:00',
        purpose: 'Morning Lab Session',
        attendees: 30
      });
    expect(res1.status).toBe(201);

    // 2. Second user attempts overlapping booking 10:00 - 12:00 for SAME classroom
    const res2 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        classroomId: testClassroom._id,
        date: bookingDate,
        startTime: '10:00',
        endTime: '12:00',
        purpose: 'Conflicting Seminar Request',
        attendees: 25
      });

    expect(res2.status).toBe(409);
    expect(res2.body.success).toBe(false);
    expect(res2.body.message).toContain('conflict detected');
    expect(res2.body.conflictDetails).toBeDefined();
  });

  it('should allow administrator to approve pending booking and reject with reason', async () => {
    const bookingDate = getFutureDate(5);

    // Create booking
    const createRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        classroomId: testClassroom._id,
        date: bookingDate,
        startTime: '13:00',
        endTime: '15:00',
        purpose: 'Approval Workflow Test',
        attendees: 30
      });

    const bookingId = createRes.body.data._id;

    // Admin approves
    const approveRes = await request(app)
      .put(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Approved' });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe('Approved');
  });

  it('should restore portable equipment when a booking is cancelled by user', async () => {
    const bookingDate = getFutureDate(6);

    const createRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        classroomId: testClassroom._id,
        date: bookingDate,
        startTime: '10:00',
        endTime: '12:00',
        purpose: 'Cancellation Test',
        attendees: 20,
        additionalEquipment: [
          { resource: portableProjector._id, quantity: 2 }
        ]
      });

    const bookingId = createRes.body.data._id;

    // Check equipment was decremented
    let eq = await Resource.findById(portableProjector._id);
    expect(eq.availableQuantity).toBe(3);

    // Cancel booking
    const cancelRes = await request(app)
      .put(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ cancellationReason: 'Rescheduled' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('Cancelled');

    // Check equipment was restored
    eq = await Resource.findById(portableProjector._id);
    expect(eq.availableQuantity).toBe(5);
  });

  it('POLICY: should reserve slot while booking is Pending, and release slot when Rejected so another user can book', async () => {
    const bookingDate = getFutureDate(7);

    // 1. User 1 submits a pending booking
    const res1 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        classroomId: testClassroom._id,
        date: bookingDate,
        startTime: '14:00',
        endTime: '16:00',
        purpose: 'Original Pending Slot',
        attendees: 20
      });
    expect(res1.status).toBe(201);
    expect(res1.body.data.status).toBe('Pending');
    const bookingId = res1.body.data._id;

    // 2. User 2 tries to book overlapping slot (15:00 - 17:00) while User 1 is Pending -> 409 Conflict
    const res2 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        classroomId: testClassroom._id,
        date: bookingDate,
        startTime: '15:00',
        endTime: '17:00',
        purpose: 'Overlapping Slot Attempt',
        attendees: 20
      });
    expect(res2.status).toBe(409);
    expect(res2.body.message).toContain('conflict detected');

    // 3. Admin rejects User 1 request
    const rejectRes = await request(app)
      .put(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Rejected', rejectionReason: 'Slot not suitable' });
    expect(rejectRes.status).toBe(200);

    // 4. User 2 retries booking the slot -> Now succeeds with 201 Created!
    const retryRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        classroomId: testClassroom._id,
        date: bookingDate,
        startTime: '15:00',
        endTime: '17:00',
        purpose: 'Retry after slot released',
        attendees: 20
      });
    expect(retryRes.status).toBe(201);
    expect(retryRes.body.success).toBe(true);
  });
});
