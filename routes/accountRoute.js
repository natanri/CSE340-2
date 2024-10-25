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
 * Deliver Login and registartion view
 * Unit 4, deliver login view activity
 ************************************/
router.get('/login', utilities.handleErrors(accountController.buildLogin))
router.get('/register', utilities.handleErrors(accountController.buildRegister))

//activity 5, add the new default route for accounts to the accountRoute file
router.get('/', utilities.checkLogin, utilities.handleErrors(accountController.accountManagement))

//Logout route
router.get('/logout', (req, res) => {
    res.clearCookie('jwt')
    req.flash('success', 'You have been logged out.')
    res.redirect('./login')
})
/************************************
 * Unit 5, Login process route
 ************************************/
router.post(
    '/login', 
    regValidate.loginRules(), 
    regValidate.checkLoginData, 
    utilities.handleErrors(accountController.accountLogin))

/*********************************************
 * Deliver Login view
 * Unit 4, process registration activity
 *********************************************/
router.post(
    "/register", 
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)
//update account view route(display the form)
router.get('/updateAccount/:accountId', utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount))
//update account process route (handle the submission)
router.post('/updateAccount/:accountId',utilities.checkLogin, utilities.handleErrors(accountController.updateAccount))
//Change password process route (handle the submission)
router.post('/changePassword/:accountId', utilities.checkLogin, utilities.handleErrors(accountController.changePassword))

module.exports = router