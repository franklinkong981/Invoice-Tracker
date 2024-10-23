//This file contains integration tests for the routes involving companies.

//connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompanyMicrosoft;
let testCompanyApple;
let testInvoiceMicrosoft;
let testInvoiceApple;
let companyList;
let invoiceList;
beforeEach(async () => {
  const addMicrosoftResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ('micro', 'Microsoft', 'computer company founded by Bill Gates') RETURNING code, name, description`);
  testCompanyMicrosoft = addMicrosoftResult.rows[0];
  const addAppleResult = await db.query(`Insert INTO companies (code, name, description) VALUES ('apple', 'Apple', 'computer comopany founded by Steve Jobs') RETURNING code, name, description`);
  testCompanyApple = addAppleResult.rows[0];

  const addInvoiceMicrosoftResult = await db.query(`INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('micro', 100, false, null) RETURNING *`);
  testInvoiceMicrosoft = addInvoiceMicrosoftResult.rows[0];
  const addInvoiceAppleResult = await db.query(`INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('apple', 200, false, null) RETURNING *`);
  testInvoiceApple = addInvoiceMicrosoftResult.rows[0];

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

describe("GET /companies", () => {
  test("Get the list of all companies", async () => {
    const res = await request(app).get('/companies');
    expect(res.statusCode).toBe(200);
    expect(res.body.companies.length).toEqual(2);
    expect(companyList).toContainEqual(res.body.companies[0]);
  });
});

describe("GET /companies/:code", () => {
  test("Gets a single company", async () => {
    const res = await request(app).get(`/companies/${testCompanyMicrosoft.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.company.code).toEqual('micro');
    expect(res.body.company.invoices[0].amt).toEqual(100);
  });
  test("Responds with 404 for invalid company code", async () => {
    const res = await request(app).get(`/users/0`);
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /companies", () => {
  test("Creates a single company", async () => {
    const res = await request(app).post('/companies').send({code: 'kfc', name:'KFC', description: 'Famous fried chicken restaurant'});
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: {code: 'kfc', name: 'KFC', description: 'Famous fried chicken restaurant'}
    });
  });
});

describe("PATCH /companies/:code", () => {
  test("Responds with 400 error if company code isn't specified in route", async () => {
    const res = await request(app).put(`/companies/`).send({code: 'microsoft', name: 'Microsoft', description: 'Better than apple'});
    expect(res.statusCode).toBe(400);
  });
  test("Updates a single company", async () => {
    const res = await request(app).put(`/companies/${testCompanyMicrosoft.code}`).send({name: 'Microsoft', description: 'Better than apple'});
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {code: 'micro', name: 'Microsoft', description: 'Better than apple'}
    });
  });
  test("Responds with 404 for invalid company code", async () => {
    const res = await request(app).put(`/companies/0`).send({code: 'microsoft', name: 'Microsoft', description: 'Better than apple'});
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /companies/:code", () => {
  test("Responds with 400 error if company code isn't specified in route", async () => {
    const res = await request(app).delete(`/companies/`);
    expect(res.statusCode).toBe(400);
  });
  test("Deletes a single user", async () => {
    const res = await request(app).delete(`/companies/${testCompanyMicrosoft.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({status: "deleted"});
  });
  test("Responds with 404 for invalid company code", async () => {
    const res = await request(app).delete(`/companies/0`);
    expect(res.statusCode).toBe(404);
  });
});