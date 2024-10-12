const accountModel = require('../models/account-model')

/**************************************
 * Account controller
 * Unit 4, deliver login view activity 
 **************************************/
const utilities = require('../utilities')

/**************************************
 * Deliver login view
 * Unit 4, deliver login view activity
 **************************************/
async function buildLogin(req, res, next){
    let nav = await utilities.getNav()
    res.render("./account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

/**************************************
 * Deliver login view
 * Unit 4, deliver register view activity
 **************************************/
async function buildRegister(req, res, next){
    let nav = await utilities.getNav()
    res.render("./account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}

/*****************************************
 * Process to Registration
 *****************************************/
async function registerAccount(req, res){
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )

    if (regResult) {
        req.flash(
            "notice", `Congratulations, you\'re registered ${account_firstname}. Please Log In.`            
        )
        res.status(201).render("account/login",{
            title: "Login",
            nav,  
            errors: null          
        })        
    } else {
        req.flash("notice", "Sorry, The registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null
        })
    }
}

module.exports = {buildLogin, buildRegister, registerAccount}