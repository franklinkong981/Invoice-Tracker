/** BizTime express application. */

const express = require("express");
const morgan = require("morgan");

const ExpressError = require("./expressError");
const companiesRoutes = require("./routes/companies");
const invoicesRoutes = require("./routes/invoices");

const app = express();

//allow express to read form and JSON data sent in POST requests.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use middleware logging function and prevent printing favicon.ico error to terminal
app.use(morgan('dev'));
app.get('/favicon.ico', (req, res) => res.sendStatus(204));

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Page Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  //the default status is the 500 Internal Server Error
  let status = err.status || 500;

  //set the status and alert the user
  return res.status(status).json({
    error: {
      message: err.message,
      status: status
    }
  });
});

module.exports = app;
