const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/*****************************************
 * Build inventory by classification view
 ***************************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification",{
        title: className + " vehicles",
        nav,
        grid,
    })
}

/****************************************
 * Unit 3, get all inventory item for a given vehicle id
 **************************************** */
invCont.buildByInventoryDetail = async function(req, res, next) {
    const  invId = req.params.inv_id
    const data = await invModel.getInventoryById(invId)
    //console.log(data)
    const grid = await utilities.buildInventoryDetailGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].inv_model
    res.render("./inventory/detail", {
        title: className + " vehicle",
        nav,
        grid,
    })
}

/**********************************
 * Intentional error route handler
 **********************************/
invCont.triggerError = function(req, res, next){
    //create an error with a status of 500
    const error = new Error('Something went wrong')
    error.status = 500
    next(error)
}

module.exports = invCont