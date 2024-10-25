const accountModel = require('../models/account-model')
const { validationResult } = require('express-validator')

/**************************************
 * Account controller
 * Unit 4, deliver login view activity 
 **************************************/
const utilities = require('../utilities')

//Activity 5
const jwt = require("jsonwebtoken")
require("dotenv").config()
const bcrypt = require("bcrypt")

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
        account_firstname:'',
        account_lastname:'',
        account_email: ''
    })
}

/*****************************************
 * Process to Registration
 *****************************************/
async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password, account_type } = req.body;

    // Asegúrate de que los campos no estén vacíos
    const errors = validationResult(req)    

    if (!errors.isEmpty()) {
        req.flash("notice", "All fields are required.");
        return res.status(400).render("account/register", {
            title: "Registration",
            nav,
            errors: errors.array(),
            account_firstname,
            account_lastname,
            account_email
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(account_password, 10)
        const accountData = await accountModel.createAccount({
            account_firstname,
            account_lastname,
            account_email,
            account_password: hashedPassword,
            account_type
        });

        if (!accountData) {
            throw new Error('Account creation failed');
        }

        console.log("Account created with ID:", accountData.account_id); 

        req.flash("notice", `Congratulations, you\'re registered ${account_firstname}. Please Log In.`);
        res.status(201).render("account/login", {
            title: "Login",
            nav,            
        });
    } catch (error) {
        console.error("Error during account registration:", error)
        req.flash("notice", "Sorry, The registration failed.");
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email
        });
    }
}

/*******************************************
 * Process login request, activity 5
 *******************************************/
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body

    console.log("email:", account_email)    
    
    // Get account details by email
    const accountData = await accountModel.getAccountByEmail(account_email)
    console.log("Account data retrieved:", accountData)
  
    // If account doesn't exist, show error message
    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Account does not exist." }],
        account_email,
      })
    }
  
    try {
      // Check if the password matches
      const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
      console.log("password match result:", passwordMatch)
      if (passwordMatch) {
        // Password is correct, create JWT token and store in cookie
        delete accountData.account_password // Remove password from accountData for security
  
        // Generate JWT
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
  
        // Set cookie for JWT token
        if (process.env.NODE_ENV === 'development') {
          res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
        } else {
          res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
        }
  
        // Redirect to the account management page
        return res.redirect("/account/")
      } else {
        // Password doesn't match, show error
        req.flash("notice", "Please check your credentials and try again.")
        return res.status(400).render("account/login", {
          title: "Login",
          nav,
          errors: null,
          account_email,
        })
      }
    } catch (error) {
        console.error('Error during login:', error);
      // If an error occurs, throw access forbidden error
        throw new Error('Access Forbidden')
    }
  }
  

/************************************
 * Account management modify to handle view if the user has permission to modify 
 *  the account. If the user does not have permission, redirect to the account management page.
 **************************************/
async function accountManagement(req, res){
    let nav = await utilities.getNav()     
    const accountData = res.locals.accountData
      
    res.render("account/accountManagement", {
        title: "Account Management",
        nav,
        errors: null,
        account_firstname: accountData.account_firstname,
        account_type: accountData.account_type,
        account_id: accountData.account_id,        
    })
}

/********************************
 * Build updateAccount function
 **********************************/

async function buildUpdateAccount(req, res,){
  let nav = await utilities.getNav()
  const accountId = req.params.accountId

  console.log('Account ID in buildUpdateAccount:', accountId)

  try{
    const accountData = await accountModel.getAccountById(accountId)

    if(!accountData){
      req.flash("notice", "Account not found.")
      return res.status(404).redirect('/account')
    }
    res.render('account/updateAccount', {
      title: 'Update Account Information',
      nav,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      errors: null
    })
  }catch(error){
    req.flash('notice', 'Error retrieving account data.')
    res.status(500).redirect('/account')
  } 
}

/*****************************************
 * Update account 
 ******************************************/
async function updateAccount(req, res){
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email } = req.body
  const accountId = req.body.accountId

  console.log("Updating Account ID:", accountId);
  if(!accountId){
    return res.status(400).send("Account ID is missing.")
  }

  try{
    await accountModel.updateAccount({
      account_id: accountId,
      account_firstname, 
      account_lastname, 
      account_email
    })

  req.flash("notice", "Account information updated successfully.")
  return res.redirect('/account/')
  } catch(error){
    req.flash('notice', 'failed to update account information.')
    return res.status(500).render('account/updateAccount', {
      title: 'Update Account Information',
      nav,
      account_firstname,
      account_lastname,
      account_email,
      errors: null
    })
  }
}

async function changePassword(req, res){
  let nav = await utilities.getNav()
  const {account_id, account_password } = req.body

  try{
    const accountData = await accountModel.getAccountById(account_id)
    if(!accountData) {
      req.flash('notice', 'Account not found.')
      return res.status(404).redirect('/account')
    }

    const hashedPassword = await bcrypt.hash(account_password, 10)
    const result = await accountModel.updatePassword(account_id, hashedPassword)

    if(result) {
      req.flash('notice', 'Password updated successfully.')
      res.redirect('/account/')
    }
  }catch(error) {
    req.flash('notice', 'Error updating password.')
    res.status(500).render('/account/updateAccount', {
      title: 'Update Account Information',
      nav,
      errors: null
    })
  }
}


module.exports = {buildLogin, 
    buildRegister, 
    registerAccount, 
    accountLogin, 
    accountManagement,
    buildUpdateAccount,
    updateAccount,
    changePassword
}