const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
require('./setup');

describe('Classroom Management & Role Authorization Suite', () => {
  let studentToken;
  let adminToken;

  beforeEach(async () => {
    // Student
    await User.create({
      name: 'Classroom Tester',
      email: 'student.room@college.edu',
      password: 'Password@123',
      role: 'student',
      department: 'CSE',
      idNumber: 'STU-ROOM-01'
    });
    const sLogin = await request(app).post('/api/auth/login').send({
      email: 'student.room@college.edu',
      password: 'Password@123'
    });
    studentToken = sLogin.body.token;

    // Admin
    await User.create({
      name: 'Admin Room Mgr',
      email: 'admin.room@college.edu',
      password: 'AdminPassword@123',
      role: 'admin',
      department: 'Facilities',
      idNumber: 'ADM-ROOM-01'
    });
    const aLogin = await request(app).post('/api/auth/login').send({
      email: 'admin.room@college.edu',
      password: 'AdminPassword@123'
    });
    adminToken = aLogin.body.token;

    // Create 2 classrooms
    await Classroom.create([
      {
        classroomId: 'CR-101',
        name: 'Classroom A',
        building: 'Academic Block',
        floor: '1st Floor',
        capacity: 60,
        type: 'Standard classroom',
        description: 'Standard lecture room',
        status: 'active'
      },
      {
        classroomId: 'CR-201',
        name: 'Seminar Hall C',
        building: 'Auditorium Complex',
        floor: '2nd Floor',
        capacity: 150,
        type: 'Seminar hall',
        description: 'Large tiered hall',
        status: 'active'
      }
    ]);
  });

  it('should list all classrooms with capacity and building data', async () => {
    const res = await request(app).get('/api/classrooms');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(2);
  });

  it('should filter classrooms by type and minimum capacity', async () => {
    const res = await request(app).get('/api/classrooms?type=Seminar hall&minCapacity=100');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].classroomId).toBe('CR-201');
  });

  it('should prevent student from creating a classroom (RBAC 403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/classrooms')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        classroomId: 'CR-999',
        name: 'Unauthorized Room',
        building: 'Block X',
        floor: '1st',
        capacity: 40,
        type: 'Standard classroom',
        description: 'Hacked room'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Access denied');
  });

  it('should permit administrator to create and update a classroom', async () => {
    const createRes = await request(app)
      .post('/api/classrooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        classroomId: 'CR-301',
        name: 'Classroom K',
        building: 'Innovation Block',
        floor: '3rd Floor',
        capacity: 45,
        type: 'Computer laboratory',
        description: 'New computer laboratory'
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.classroomId).toBe('CR-301');

    const roomId = createRes.body.data._id;

    // Update
    const updateRes = await request(app)
      .put(`/api/classrooms/${roomId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ capacity: 55, status: 'maintenance' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.capacity).toBe(55);
    expect(updateRes.body.data.status).toBe('maintenance');
  });
});
