// backend/src/tests/auth.test.js
const request = require('supertest');
const app = require('../app');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

describe('Authentication Endpoints', () => {
  let testUser;

  beforeEach(async () => {
    // Clear users before each test
    await User.destroy({ where: {} });
    
    // Create test superadmin user
    const hashedPassword = await bcrypt.hash('superadmin123', 12);
    testUser = await User.create({
      email: 'test.superadmin@tracks.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Superadmin',
      role: 'SUPERADMIN'
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await User.destroy({ where: {} });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.superadmin@tracks.com',
          password: 'superadmin123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('role', 'SUPERADMIN');
    });

    it('should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.superadmin@tracks.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
    });
  });
});