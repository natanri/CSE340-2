const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/****************************
 * Constructs the nav HTML unorder list
 **************************** */
Util.getNav = async function(_req, res, next){
    let data = await invModel.getClassifications()
    //console.log(data)
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' + row.classification_id + '" title="See our inventory of' + 
            row.classification_name +
            ' vehicles">' + 
            row.classification_name + 
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/******************************************
 * Construc the dropdown or classification list
 ******************************************/
Util.buildClassificationList = async function(classification_id = null){
    let data = await invModel.getClassifications()
    let list = `<select name="classification_id" id="classification_id" required`
    list += `<option value="">Select a classification</option>`
    data.rows.forEach((row) => {
        list += `<option value=${row.classification_id}`

        if(classification_id != null && row.classification_id == classification_id){
            list += ` selected`
        }
        list += `>${row.classification_name}</option>`
    })
    list += "</select>"
    return list    
}

/**************************************
 * Build the classification view HTML
 ***************************************/
Util.buildClassificationGrid = async function(data){
    let grid = ""
    if(data.length > 0){
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
            + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
            + 'details"><img src="' + vehicle.inv_thumbnail
            +'" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
            +' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else{
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/*******************************************
 * Unit 3, create a detail view
 ********************************************/
Util.buildInventoryDetailGrid = async function(data){
    let grid = ""
    if(data.length > 0){
        grid = '<div class="inv-detail-grid">'
        data.forEach(vehicle => {
            grid += '<h1>' + ' ' + vehicle.inv_year + ' ' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h1>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '">' + ' ' + '<img src="' + vehicle.inv_image
            + '" class="image"/>' + '</a>'
            grid += '<div class="info">'
            grid += '<h2>' + vehicle.inv_make + ' ' + vehicle.inv_model + ' ' + 'Detail' + '</h2>'
            grid += '<h4><b><span> Price:$' + ' '
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span></b></h4>'
            grid += '<p id="description"><b> Description:</b>' + ' '
            + vehicle.inv_description + ' <br></p>'
            grid += '<h4><b><span>Color: </b>' + ' ' 
            + vehicle.inv_color + '</span><br></h4>'
            grid += '<h4><b><span>Miles:</b> ' + ' '
            + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + '</span><br></h4></div>'
        })
        grid += '</div>'
    }else  {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}


/***********************************
 * Middleware function to check token validity
 ***********************************/
Util.checkJWTToken = (req, res, next) => {
    if(req.cookies.jwt){
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,(err, accountData) => {
                if(err){
                    req.flash("Please log in")
                    res.clearCookie("jwt")
                    return res.redirect("/account/login")
                }
                console.log("verified accountData", accountData)
                res.locals.accountData = accountData
                res.locals.loggedin = true
                next()
            }
        )
    } else{
        console.log("No jwt token found")
        res.locals.loggedin = false
        next()
    }
}

/***********************************
 * Check login, middleware
 ***********************************/
Util.checkLogin = (req, res, next) => {
    const token = req.cookies.jwt

    if(!token){
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userData) => {
        if(err){
            req.flash("notice", "Invalid or expired session. Please log in again.")
            return res.redirect("/account/login")
        }

        res.locals.loggedin = true
        res.locals.userData = userData
        next()
    })
    
}

/********************************
 * Middleware for handling errors
 * wrap other function in this for
 * general error handling
 * Unit 3, activities
 ********************************/
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util