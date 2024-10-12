//Needed Resources
const express = require('express')
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require('../utilities')
const validate = require('../utilities/inv-validation')

//Route to build management view
router.get('/management', invController.buildManagement)

//Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)
router.get("/detail/:inv_id", invController.buildByInventoryDetail)

//Route to add classification
router.get('/add-classification', utilities.handleErrors(invController.buildAddClassification))

//Define rooute
router.get('/inv', invController.addInventory)

//Route shows to add inventory item
router.get('/add-inventory', utilities.handleErrors(invController.buildAddInventory))

//Router to process the new clasification
router.post('/add-classification', 
    validate.Classification(), 
    validate.checkClassificationData,
    invController.addClassification)

//Route to process the addition to new car
router.post('/add-inventory', validate.checkInventoryData, invController.addInventory)

//Route to intencionally cause a 500 error
router.get('/error', invController.triggerError)

module.exports = router;