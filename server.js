/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const expressLayouts = require('express-ejs-layouts')
const express = require("express")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const inventoryRoute = require('./routes/inventoryRoute')
const baseController = require("./controllers/baseController")
const utilities = require('./utilities')


/* *************************
 * View Engine and Templates
 ***************************/
 app.set("view engine", "ejs")
 app.use(expressLayouts)
 app.set("layout", "./layouts/layout")// not at views root

/* ***********************
 * Routes
 *************************/
app.use(static)
//Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

//Inventory routes
app.use("/inv", inventoryRoute)

//File Not Found Route - must be last route in list
app.use(async(req, res, next) =>{
  next({status: 404, message: 'Sorry, we appear to have lost that page'})
})

/******************************
 * Express Error handler
 * Place after alll other middleware
 ****************************** */

app.use(async(err, req, res, next) =>{
  let nav = await utilities.getNav()
  //Determinethe status and message
  let status = err.status || 500
  let message

  //Custom message for 404 errors
  if(status === 404){
    message = err.message || "Page not Found."

  //Custom message for 500 errors or others
  } else if (status === 500){
    message = "Oh no! There was a crash. Maybe try a different route?"
  }

  //Log error details(optional but useful for debugging)
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  //Render error with different messages and status codes
  res.status(status).render("errors/error", {
    title: status === 404 ? "404 - not Found" : "500 - Server Error",
    message,
    nav,
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || '0.0.0.0'

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
