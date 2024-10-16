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
    const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [req.params.code]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Company with company code of ${req.params.code} can't be found in the database`, 404);
    }
    return res.status(200).json({company: results.rows[0]});
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

module.exports = router;