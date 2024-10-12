/*************************
 * Account routes
 * Unit 4, deliver login view activity
 **************************/
//Needed resources
const express = require('express')
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

/************************************
 * Deliver Login view
 * Unit 4, deliver login view activity
 ************************************/
router.get('/login', utilities.handleErrors(accountController.buildLogin))

/*********************************************
 * Deliver Login view
 * Unit 4, deliver registration view activity
 *********************************************/
router.get('/register', utilities.handleErrors(accountController.buildRegister))

/*********************************************
 * Deliver Login view
 * Unit 4, process registration activity
 *********************************************/
//Process the registration data
router.post(
    "/register", 
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

module.exports = router