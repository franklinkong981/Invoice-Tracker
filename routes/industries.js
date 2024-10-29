const express = require("express");
const router = new express.Router();
const slugify = require("slugify");

const ExpressError = require("../errors/expressError");
const db = require("../db");

//all industry routes go here

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM industries`);
    return res.status(200).json({industries: results.rows});
  } catch(e) {
    return next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!req.body.industry) throw new ExpressError("You must provide an industry attribute in the body specifying the name of the industry to add", 400);
    
    const {industry} = req.body;
    const code = slugify(industry, {lower: true, strict: true, locale: 'en'});
    const results = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *`, [code, industry]);
    return res.status(201).json({industry: results.rows[0]});
  } catch(e) {
    return next(e);
  }
});

router.post('/associate', async (req, res, next) => {
  try {
    if (!req.body.company_code) throw new ExpressError("You must provide a company code in the body specifying the code of the company you want to associate", 400);
    if (!req.body.industry_code) throw new ExpressError("You must provide an industry code attribute in the body specifying the code of the industry you want to associate", 400);
    
    const {company_code, industry_code} = req.body;
    const results = await db.query(`INSERT INTO companies_industries (company_code, industry_code) VALUES ($1, $2) RETURNING *`, [company_code, industry_code]);
    return res.status(201).json({association: results.rows[0]});
  } catch(e) {
    return next(e);
  }
});

module.exports = router;