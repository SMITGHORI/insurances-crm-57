
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Invoice = require('../models/Invoice');

describe('Invoice API', () => {
  beforeEach(async () => {
    await Invoice.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/invoices', () => {
    beforeEach(async () => {
      await Invoice.create([
        {
          invoiceNumber: 'INV-001',
          clientId: 'client1',
          clientName: 'John Doe',
          clientEmail: 'john@example.com',
          issueDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-15'),
          status: 'draft',
          items: [{
            description: 'Test item',
            quantity: 1,
            unitPrice: 100,
            tax: 18,
            total: 118
          }],
          subtotal: 100,
          tax: 18,
          total: 118
        },
        {
          invoiceNumber: 'INV-002',
          clientId: 'client2',
          clientName: 'Jane Smith',
          clientEmail: 'jane@example.com',
          issueDate: new Date('2024-01-02'),
          dueDate: new Date('2024-01-16'),
          status: 'sent',
          items: [{
            description: 'Another item',
            quantity: 2,
            unitPrice: 50,
            tax: 18,
            total: 118
          }],
          subtotal: 100,
          tax: 18,
          total: 118
        }
      ]);
    });

    it('should get all invoices', async () => {
      const res = await request(app)
        .get('/api/invoices')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.total).toBe(2);
    });

    it('should filter invoices by status', async () => {
      const res = await request(app)
        .get('/api/invoices?status=draft')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe('draft');
    });

    it('should search invoices', async () => {
      const res = await request(app)
        .get('/api/invoices?search=John')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].clientName).toBe('John Doe');
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/invoices?page=1&limit=1')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.page).toBe(1);
      expect(res.body.totalPages).toBe(2);
    });
  });

  describe('GET /api/invoices/:id', () => {
    let invoiceId;

    beforeEach(async () => {
      const invoice = await Invoice.create({
        invoiceNumber: 'INV-001',
        clientId: 'client1',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        issueDate: new Date(),
        dueDate: new Date(),
        status: 'draft',
        items: [{
          description: 'Test item',
          quantity: 1,
          unitPrice: 100,
          tax: 18,
          total: 118
        }],
        subtotal: 100,
        tax: 18,
        total: 118
      });
      invoiceId = invoice._id;
    });

    it('should get invoice by id', async () => {
      const res = await request(app)
        .get(`/api/invoices/${invoiceId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.invoiceNumber).toBe('INV-001');
    });

    it('should return 404 for non-existent invoice', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/invoices/${fakeId}`)
        .expect(404);
    });
  });

  describe('POST /api/invoices', () => {
    it('should create a new invoice', async () => {
      const invoiceData = {
        clientId: 'client1',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        issueDate: '2024-01-01',
        dueDate: '2024-01-15',
        status: 'draft',
        items: [{
          description: 'Test item',
          quantity: 1,
          unitPrice: 100,
          tax: 18,
          total: 118
        }],
        subtotal: 100,
        tax: 18,
        total: 118
      };

      const res = await request(app)
        .post('/api/invoices')
        .send(invoiceData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.clientName).toBe('John Doe');
      expect(res.body.data.invoiceNumber).toBeDefined();
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .send({})
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('PUT /api/invoices/:id', () => {
    let invoiceId;

    beforeEach(async () => {
      const invoice = await Invoice.create({
        invoiceNumber: 'INV-001',
        clientId: 'client1',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        issueDate: new Date(),
        dueDate: new Date(),
        status: 'draft',
        items: [{
          description: 'Test item',
          quantity: 1,
          unitPrice: 100,
          tax: 18,
          total: 118
        }],
        subtotal: 100,
        tax: 18,
        total: 118
      });
      invoiceId = invoice._id;
    });

    it('should update invoice', async () => {
      const updateData = {
        clientName: 'John Updated',
        status: 'sent'
      };

      const res = await request(app)
        .put(`/api/invoices/${invoiceId}`)
        .send(updateData)
        .expect(200);

      expect(res.body.data.clientName).toBe('John Updated');
      expect(res.body.data.status).toBe('sent');
    });
  });

  describe('DELETE /api/invoices/:id', () => {
    let invoiceId;

    beforeEach(async () => {
      const invoice = await Invoice.create({
        invoiceNumber: 'INV-001',
        clientId: 'client1',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        issueDate: new Date(),
        dueDate: new Date(),
        status: 'draft',
        items: [{
          description: 'Test item',
          quantity: 1,
          unitPrice: 100,
          tax: 18,
          total: 118
        }],
        subtotal: 100,
        tax: 18,
        total: 118
      });
      invoiceId = invoice._id;
    });

    it('should delete invoice', async () => {
      await request(app)
        .delete(`/api/invoices/${invoiceId}`)
        .expect(200);

      const invoice = await Invoice.findById(invoiceId);
      expect(invoice).toBeNull();
    });
  });

  describe('GET /api/invoices/stats', () => {
    beforeEach(async () => {
      await Invoice.create([
        {
          invoiceNumber: 'INV-001',
          clientId: 'client1',
          clientName: 'John Doe',
          clientEmail: 'john@example.com',
          issueDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-15'),
          status: 'paid',
          items: [{ description: 'Item 1', quantity: 1, unitPrice: 100, tax: 18, total: 118 }],
          subtotal: 100,
          tax: 18,
          total: 118
        },
        {
          invoiceNumber: 'INV-002',
          clientId: 'client2',
          clientName: 'Jane Smith',
          clientEmail: 'jane@example.com',
          issueDate: new Date('2024-01-02'),
          dueDate: new Date('2024-01-16'),
          status: 'sent',
          items: [{ description: 'Item 2', quantity: 1, unitPrice: 200, tax: 36, total: 236 }],
          subtotal: 200,
          tax: 36,
          total: 236
        }
      ]);
    });

    it('should return invoice statistics', async () => {
      const res = await request(app)
        .get('/api/invoices/stats')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.paid).toBe(1);
      expect(res.body.data.pending).toBe(1);
      expect(res.body.data.totalAmount).toBe(354);
      expect(res.body.data.paidAmount).toBe(118);
    });
  });

  describe('POST /api/invoices/:id/send', () => {
    let invoiceId;

    beforeEach(async () => {
      const invoice = await Invoice.create({
        invoiceNumber: 'INV-001',
        clientId: 'client1',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        issueDate: new Date(),
        dueDate: new Date(),
        status: 'draft',
        items: [{
          description: 'Test item',
          quantity: 1,
          unitPrice: 100,
          tax: 18,
          total: 118
        }],
        subtotal: 100,
        tax: 18,
        total: 118
      });
      invoiceId = invoice._id;
    });

    it('should send invoice', async () => {
      const emailData = {
        to: 'john@example.com',
        subject: 'Your Invoice',
        message: 'Please find your invoice attached.'
      };

      const res = await request(app)
        .post(`/api/invoices/${invoiceId}/send`)
        .send(emailData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Invoice sent successfully');

      // Check that invoice status was updated
      const updatedInvoice = await Invoice.findById(invoiceId);
      expect(updatedInvoice.status).toBe('sent');
      expect(updatedInvoice.sentAt).toBeDefined();
    });
  });
});
