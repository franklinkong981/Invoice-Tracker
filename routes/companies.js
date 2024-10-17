const express = require("express");
const router = new express.Router();

const ExpressError = require("../errors/expressError");
const db = require("../db");

//all shoppingList routes go here

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies`);
    return res.status(200).json({companies: results.rows});
  } catch(e) {
    return next(e);
  }
});

router.get('/:code', async (req, res, next) => {
  try {
    const {code} = req.params;
    const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [code]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Company with company code of ${req.params.code} can't be found in the database`, 404);
    }

    const invoice_results = await db.query(
      `SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date 
      FROM companies AS c
      INNER JOIN invoices AS i  ON (c.code = i.comp_code)
      WHERE code = $1`,
    [code]);
    
    const company_data = results.rows[0];
    const company = {
      code: company_data.code,
      name: company_data.name,
      description: company_data.description,
      invoices: invoice_results.rows
    };
    return res.status(200).json({"company": company});
  } catch(e) {
    return next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!req.body.code) throw new ExpressError("You must provide a code attribute in the body specifying the code of the company to add", 400);
    if (!req.body.name) throw new ExpressError("You must provide a name attribute in the body specifying the name of the company to add", 400);
    if (!req.body.description) throw new ExpressError("You must provide a description attribute in the body containing a brief description of the company to add", 400);
    
    const {code, name, description} = req.body;
    const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`, [code, name, description]);
    return res.status(201).json({company: results.rows[0]});
  } catch(e) {
    return next(e);
  }
});

router.put('/', async (req, res, next) => {
  return next(new ExpressError("You must provide a company code in the request URL specifying the code of the company you want to update", 400));
});

router.put('/:code', async (req, res, next) => {
  try {
    const {code} = req.params;

    if (!req.body.name) throw new ExpressError("You must provide a name attribute in the body specifying the name of the company you want to update", 400);
    if (!req.body.description) throw new ExpressError("You must provide a description attribute in the body containing a brief description of the company you want to update", 400);
    const {name, description} = req.body;

    const results = await db.query(`UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING *`, [name, description, code]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Company with company code of ${code} wasn't found in the database`, 404);
    }
    return res.status(200).json({company: results.rows[0]});
  } catch(e) {
    return next(e);
  }
});

router.delete('/', async (req, res, next) => {
  return next(new ExpressError("You must provide a company code in the request URL specifying the code of the comopany you want to delete", 400));
});

router.delete('/:code', async (req, res, next) => {
  try {
    let code = req.params.code;
    const deleteResult = await db.query(`DELETE FROM companies WHERE code = $1 RETURNING *`, [code]);
    if (deleteResult.rows.length === 0) {
      throw new ExpressError(`Company with company code of ${code} wasn't found in the database`, 404);
    }
    return res.status(200).json({status: "deleted"});
  } catch(e) {
    return next(e);
  }
});

module.exports = router;