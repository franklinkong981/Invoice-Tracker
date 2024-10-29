\c biztime

DROP TABLE IF EXISTS companies_industries;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
  code text PRIMARY KEY,
  industry text NOT NULL UNIQUE
);

CREATE TABLE companies_industries
(
  company_code text NOT NULL REFERENCES companies,
  industry_code TEXT NOT NULL REFERENCES industries,
  PRIMARY KEY(company_code, industry_code)
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Computer company made by Steve Jobs.'),
         ('micro', 'Microsoft', 'Technology company founded by Bill Gates'),
         ('kfc', 'KFC', 'Fried chicken restaurant founded by Colonel Sanders');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('micro', 400, false, null),
         ('kfc', 20, false, null);

INSERT INTO industries (code, industry)
  VALUES ('tech', 'Technology'),
         ('fast_food', 'Fast Food');

INSERT INTO companies_industries (company_code, industry_code)
  VALUES ('apple', 'tech'),
         ('micro', 'tech'),
         ('kfc', 'fast_food');
