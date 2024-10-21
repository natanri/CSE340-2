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
const session = require("express-session")
const pool = require('./database')
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const flash = require('connect-flash')

/***********************************
 * Middleware
 **********************************/
//Activity 5, cookies parser
app.use(cookieParser())

//Session config
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

app.use(bodyParser.json())
//for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true}))

//Express Messages Middelware

app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})



//Apply middleware, activity 5
app.use(utilities.checkJWTToken)

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

//Index route - unit 3, activity
app.get("/", utilities.handleErrors(baseController.buildHome))

//Redirect to inv
app.get("/inv", (req, res) => {
  res.redirect("/inv/management")
})

//Inventory routes - unit e, activity
app.use("/inv", inventoryRoute)

//Account routes - Unit - 4,activity
app.use("/account", require("./routes/accountRoute"))

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
const port = process.env.PORT || 5500
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
