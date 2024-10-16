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

module.exports = router;