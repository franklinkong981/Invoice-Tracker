//This file contains integration tests for the routes involving invoices.

//connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompanyMicrosoft;
let testCompanyApple;
let testInvoiceMicrosoft;
let testInvoiceApple;
beforeEach(async () => {
  const addMicrosoftResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ('micro', 'Microsoft', 'computer company founded by Bill Gates') RETURNING code, name, description`);
  testCompanyMicrosoft = addMicrosoftResult.rows[0];
  const addAppleResult = await db.query(`Insert INTO companies (code, name, description) VALUES ('apple', 'Apple', 'computer comopany founded by Steve Jobs') RETURNING code, name, description`);
  testCompanyApple = addAppleResult.rows[0];

  const addInvoiceMicrosoftResult = await db.query(`INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('micro', 100, false, null) RETURNING id, comp_code, amt, paid`);
  testInvoiceMicrosoft = addInvoiceMicrosoftResult.rows[0];
  const addInvoiceAppleResult = await db.query(`INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('apple', 200, false, null) RETURNING id, comp_code, amt, paid`);
  testInvoiceApple = addInvoiceAppleResult.rows[0];

  companyList = [testCompanyMicrosoft, testCompanyApple];
  invoiceList = [testInvoiceMicrosoft, testInvoiceApple];
});

afterEach(async () => {
  await db.query(`DELETE FROM invoices`);
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end()
});

describe("HOPE THIS WORKS", () => {
  test("BLAH", () => {
    expect(1).toBe(1);
  });
});

describe("GET /invoices", () => {
  test("Get the list of all invoices", async () => {
    const res = await request(app).get('/invoices');
    expect(res.statusCode).toBe(200);
    expect(res.body.invoices.length).toEqual(2);
    expect(invoiceList).toContainEqual(res.body.invoices[0]);
  });
});

describe("GET /invoices/:id", () => {
  test("Gets a single invoice", async () => {
    const res = await request(app).get(`/invoices/${testInvoiceApple.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.invoice.id).toEqual(testInvoiceApple.id);
    expect(res.body.invoice.amt).toEqual(200);
    expect(res.body.invoice.paid).toEqual(false);
    expect(res.body.invoice.company).toEqual(testCompanyApple);
  });
  test("Responds with 404 for invalid invoice id", async () => {
    const res = await request(app).get(`/invoices/0`);
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /invoices", () => {
  test("Invalid company code leads to 400 error", async () => {
    const res = await request(app).post('/invoices').send({comp_code: "abc", amt: 300});
    expect(res.statusCode).toBe(400);
  });
  test("Creates a single invoice", async () => {
    const res = await request(app).post('/invoices').send({comp_code: "micro", amt: 300});
    console.log(res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.invoice.comp_code).toEqual("micro");
    expect(res.body.invoice.amt).toEqual(300);
    expect(res.body.invoice.paid).toEqual(false);
  });
});

describe("PUT /invoices/:id", () => {
  test("Responds with 400 error if invoice id isn't specified in route", async () => {
    const res = await request(app).put(`/invoices/`).send({amt: 500});
    expect(res.statusCode).toBe(400);
  });
  test("Updates a single invoice", async () => {
    const res = await request(app).put(`/invoices/${testInvoiceMicrosoft.id}`).send({amt: 500});
    expect(res.statusCode).toBe(200);
    expect(res.body.invoice.comp_code).toEqual("micro");
    expect(res.body.invoice.paid).toEqual(false);
    expect(res.body.invoice.amt).toEqual(500);
  });
  test("Responds with 404 for invalid invoice id", async () => {
    const res = await request(app).put(`/invoices/0`).send({amt: 500});
    expect(res.statusCode).toBe(404);
  });
});



