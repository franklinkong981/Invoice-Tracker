const express = require("express");
const router = new express.Router();

const ExpressError = require("../errors/expressError");
const db = require("../db");

//all invoice routes go here

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT id, comp_code, amt, paid FROM invoices`);
    return res.status(200).json({invoices: results.rows});
  } catch(e) {
    return next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const invoice_id = req.params.id;
    const result = await db.query(
      `SELECT i.id, i.comp_code, i.amt, i.paid, i.paid_date, i.add_date, c.name, c.description
      FROM invoices AS i 
      INNER JOIN companies AS c ON (i.comp_code = c.code) 
      WHERE id = $1`, 
      [invoice_id]);
    if (result.rows.length === 0) {
      throw new ExpressError(`The invoice with id of ${invoice_id} cannot be found in the database`, 404);
    }

    const data = result.rows[0];
    const invoice = {
      id: data.id,
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
      company: {
        code: data.comp_code,
        name: data.name,
        description: data.description
      }
    };
    return res.status(200).json({"invoice": invoice});
  } catch(e) {
    return next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!req.body.comp_code) throw new ExpressError("You must provide a comp_code attribute in the body specifying the code of the company of the invoice you want to add", 400);
    if (!req.body.amt) throw new ExpressError("You must provide an amt attribute in the body specifying the amount of money owned in the invoice you want to add", 400);
    
    const {comp_code, amt} = req.body;
    const company_results = await db.query(`SELECT * FROM companies WHERE code = $1`, [comp_code]);
    if (company_results.rows.length === 0) {
      throw new ExpressError("No company with the company code supplied in the body was not found in the database.", 400);
    }

    const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`, [comp_code, amt]);
    return res.status(201).json({invoice: results.rows[0]});
  } catch(e) {
    return next(e);
  }
});

router.put('/', async (req, res, next) => {
  return next(new ExpressError("You must provide the id in the request URL specifying the id of the invoice you want to update.", 400));
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!req.body.amt) throw new ExpressError("You must provide an amt integer attribute in the body specifying the new amount of money owed on the invoice.", 400);
    if (!req.body.hasOwnProperty('paid')) throw new ExpressError("You must provide a paid boolean attribute in the body specifying whether you are paying or unpaying the invoice.", 400);
    const {id} = req.params;
    const {amt, paid} = req.body;
    let results;

    if (paid) {
      results = await db.query(`UPDATE invoices SET amt = $1, paid = 'TRUE', paid_date = CURRENT_DATE
        WHERE id = $2 RETURNING *`,
        [amt, id]);
    } else {
      results = await db.query(`UPDATE invoices SET amt = $1, paid = 'FALSE', paid_date = NULL
        WHERE id = $2 RETURNING *`,
        [amt, id]);
    }

    if (results.rows.length === 0) {
      throw new ExpressError(`Could not find invoice with id of ${id} in the database`, 404);
    }
    return res.status(200).json({invoice: results.rows[0]});
  } catch(e) {
    return next(e);
  }
});

router.delete('/', async (req, res, next) => {
  return next(new ExpressError("You must provide the id in the request URL specifying the id of the invoice you want to delete.", 400));
});

router.delete('/:id', async (req, res, next) => {
  try {
    const {id} = req.params;
    const results = await db.query(`DELETE FROM invoices WHERE id = $1 RETURNING *`, [id]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Could not find invoice with id of ${id} in the database`, 404);
    }
    return res.status(200).json({status: "deleted"});
  } catch(e) {
    return next(e);
  }
});

module.exports = router;