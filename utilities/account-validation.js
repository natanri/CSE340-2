/***********************************
 * Sanitization and validation
 ***********************************/
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}

/************************************
 * Registration Data Validation Rules
 ************************************/
validate.registrationRules = () => {
    return[
        //firstname is required and must be string
        body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min:1})
        .withMessage("Please provide a first name."),// on error this message is sent.

        //lastname is required and must be string
        body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min:2})
        .withMessage("Please provide a last name."),// on error this message is sent.

        //valid email is required and cannot already exist in the DB
        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail()//refer to validator.js doc
        .withMessage("Please provide a valid email address"),

        //password is require and must bestrong password
        body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Password does not meet the requirements.")
    ]
}


/***********************************
 * Check data and return errors or continue to registration
 ************************************/
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email} = req.body
    let errors = []
    errors = validationResult(req)
    if(!errors.isEmpty()){
        let nav = await utilities.getNav()
        res.render("account/register",{
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return next(errors)
    }
    next()
}
//Login Rules
validate.loginRules = () =>{
    return[
        //valid email is required and cannot already exist in the DB
        body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail()//refer to validator.js doc
        .withMessage("A valid email is require.")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if(!emailExists){
                throw new Error("Email does not exist. Please register.")
            }
        }),

        body("account_password")
        .trim()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,            
        })
        .withMessage("Password does not meet the requirements.")

    ]
}
//check login data
validate.checkLoginData = async (req,res,next) =>{
    const { account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log("There is something wrong", errors.array())
        let nav = await utilities.getNav()
        res.render('account/login', {
            errors,
            title: "Login",
            nav,
            account_email            
        })
        return
    }
    next()
}

module.exports = validate