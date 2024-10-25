//Needed Resources
const express = require('express')
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require('../utilities')
const validate = require('../utilities/inv-validation')


//Route to build management view
router.get('/management', utilities.checkAdminEmployee, invController.buildManagement)

//Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)
router.get("/detail/:inv_id", invController.buildByInventoryDetail)

//Edit the inventory routes activity 5
router.get('/getInventory/:classification_id', utilities.handleErrors(invController.getInventoryJSON))

//Route to add classification
router.get('/add-classification', utilities.checkAdminEmployee, utilities.handleErrors(invController.buildAddClassification))

//Define rooute
router.get('/inv', invController.addInventory)

//Route shows to add inventory item
router.get('/add-inventory',utilities.checkAdminEmployee, utilities.checkAdminEmployee, utilities.handleErrors(invController.buildAddInventory))

//route to process the edit view
router.get('/edit/:inv_id', utilities.checkAdminEmployee, utilities.handleErrors(invController.buildEditInventoryView))

//Route to shows confirmation view to delete
router.get("/delete/:inv_id", utilities.checkAdminEmployee, async (req, res, next) => {
    try {
        await invController.buildDeleteConfirmation(req, res)
    }catch(error){
        next(error)
    }
})

//Router to process the new clasification
router.post('/add-classification', utilities.checkAdminEmployee,
    validate.Classification(), 
    validate.checkClassificationData,
    invController.addClassification)

//Route to process the addition to new car
router.post('/add-inventory', utilities.checkAdminEmployee, validate.checkInventoryData, invController.addInventory)

//Route to handle the incoming request activity 5
router.post('/update/',utilities.checkAdminEmployee, utilities.handleErrors(invController.updateInventory))

//Route to update inventory
router.post('/inv/update',
    utilities.checkAdminEmployee,
    validate.checkUpdateData,
    invController.updateInventory)

//Rout to delete vehicle
router.post("/delete/", utilities.checkAdminEmployee, async (req, res, next) =>{
    try{
        await invController.deleteInventoryItem(req, res)
    }catch(error){
        next(error)
    }
})


//Route to intencionally cause a 500 error
router.get('/error', utilities.handleErrors(invController.triggerError))

module.exports = router;