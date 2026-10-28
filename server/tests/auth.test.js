const request = require('supertest');
const app = require('../app');
require('./setup');

describe('User Authentication & Authorization Suite', () => {
  const testStudent = {
    name: 'Test Student',
    email: 'teststudent@college.edu',
    password: 'Password@123',
    role: 'student',
    department: 'Computer Science & Engineering',
    idNumber: 'URK24CS9999'
  };

  it('should successfully register a new student user and return a JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testStudent);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testStudent.email.toLowerCase());
  });

  it('should reject registration with a duplicate email address', async () => {
    await request(app).post('/api/auth/register').send(testStudent);

    const res = await request(app)
      .post('/api/auth/register')
      .send(testStudent);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  it('should reject registration with a password shorter than 6 characters', async () => {
    const invalid = { ...testStudent, email: 'short@college.edu', password: '123' };
    const res = await request(app)
      .post('/api/auth/register')
      .send(invalid);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should authenticate user with valid credentials and return JWT', async () => {
    await request(app).post('/api/auth/register').send(testStudent);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testStudent.email, password: testStudent.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe(testStudent.name);
  });

  it('should reject login with incorrect password', async () => {
    await request(app).post('/api/auth/register').send(testStudent);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testStudent.email, password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Incorrect password');
  });

  it('should protect private profile endpoint from unauthorized requests without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
