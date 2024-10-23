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

  const addInvoiceMicrosoftResult = await db.query(`INSERT INTO invoices (comp_Code, amt, paid, paid_date) VALUES ('micro', 100, false, null) RETURNING comp_Code, amt, paid, paid_date`);
  testInvoiceMicrosoft = addInvoiceMicrosoftResult.rows[0];
  const addInvoiceAppleResult = await db.query(`INSERT INTO invoices (comp_Code, amt, paid, paid_date) VALUES ('apple', 200, false, null) RETURNING comp_Code, amt, paid, paid_date`);
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
