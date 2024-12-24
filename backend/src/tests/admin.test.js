// backend/src/tests/admin.test.js
const request = require('supertest');
const app = require('../app');
const { User, Company } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

describe('Admin Endpoints', () => {
  let superadminToken;
  let testCompanyId;
  let superadminUser;

  beforeEach(async () => {
    // Clear users and companies before each test
    await User.destroy({ where: {} });
    await Company.destroy({ where: {} });

    // Create test superadmin
    const hashedPassword = await bcrypt.hash('superadmin123', 12);
    superadminUser = await User.create({
      email: 'test.superadmin@tracks.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Superadmin',
      role: 'SUPERADMIN'
    });

    console.log('Created superadmin:', superadminUser.toJSON());

    // Login and get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test.superadmin@tracks.com',
        password: 'superadmin123'
      });

    superadminToken = loginRes.body.token;
    console.log('Login response:', loginRes.body); // Debug login response

    //Verify the token works
    const verifiedToken = jwt.verify(superadminToken, process.env.JWT_SECRET);
    console.log('Verified token:', verifiedToken);
  });

  afterEach(async () => {
    // Cleanup
    await User.destroy({ where: {} });
    await Company.destroy({ where: {} });
  });

  describe('POST /api/admin/create-company', () => {
    it('should create a new company when superadmin', async () => {
      // Verify superadmin exists before request
      const user = await User.findByPk(superadminUser.id);
      console.log('Superadmin user before request:', user?.toJSON()); // Debug user

      const res = await request(app)
        .post('/api/admin/create-company')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Test Company'
        });

      console.log('Create company response:', res.body); // Debug response

      expect(res.statusCode).toBe(201);
      expect(res.body.data).toHaveProperty('name', 'Test Company');
      testCompanyId = res.body.data.id;
    });

    it('should fail when not authenticated', async () => {
      const res = await request(app)
        .post('/api/admin/create-company')
        .send({
          name: 'Another Company'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/admin/create-admin', () => {
    it('should create a new admin for a company', async () => {
      // First create a company
      const companyRes = await request(app)
        .post('/api/admin/create-company')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Test Company'
        });

      expect(companyRes.statusCode).toBe(201); // Add assertion
      const companyId = companyRes.body.data.id;

      const res = await request(app)
        .post('/api/admin/create-admin')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          email: 'test.admin@company.com',
          password: 'admin123',
          firstName: 'Test',
          lastName: 'Admin',
          companyId
        });

      console.log('Create admin response:', res.body); // Debug response

      expect(res.statusCode).toBe(201);
      expect(res.body.data).toHaveProperty('role', 'ADMIN');
      expect(res.body.data).toHaveProperty('companyId', companyId);
    });
  });
});