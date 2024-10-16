const express = require("express");
const router = new express.Router();

const ExpressError = require("../errors/expressError");
const db = require("../db");

//all invoice routes go here

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.status(200).json({invoices: results.rows});
  } catch(e) {
    return next(e);
  }
});

module.exports = router;