//Needed Resources
const express = require('express')
const router = new express.Router()
const invController = require("../controllers/invController")

//Route to intencionally cause a 500 error
router.get('/error', invController.triggerError)

//Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)
router.get("/detail/:inv_id", invController.buildByInventoryDetail)

module.exports = router;