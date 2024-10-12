const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult} = require('express-validator')

const invCont = {}

/*****************************************
 * Build inventory by classification view
 ***************************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    try {
        const classification_id = req.params.classificationId
        const data = await invModel.getInventoryByClassificationId(classification_id)
        if (!data || data.length === 0) {
            console.error(`No inventory found for ID classification: ${classification_id}`);
            return res.status(404).send("Classification not found or has no vehicles.");
        }      
        const grid = await utilities.buildClassificationGrid(data)
        let nav = await utilities.getNav()
        const className = data[0].classification_name
        res.render("./inventory/classification",{
            title: className + " vehicles",
            nav,
            grid,
        })
    }catch(error){
        console.error("Error en buildByClassificationId: ", error);
        res.status(500).send("Error interno del servidor."); 
    }
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

/****************************************
 * Unit 4, Create the management view
 **************************************** */
invCont.buildManagement = async function(req, res, next){
    let nav = await utilities.getNav()
    res.render('./inventory/management',{
        title: 'Inventory Management',
        nav,
        errors: null
    })
}

/****************************************
 * Unit 4, build and Add-classification view
 **************************************** */
invCont.buildAddClassification = async function(req, res, next){
    try{
        let nav = await utilities.getNav()
        res.render('./inventory/add-classification',{
            title: 'Add Classification',
            nav,
            errors: null
        })
    }catch{
        console.error('Hi, sorry, I know you are working so hard, but this is not the route.', error)
        next(error)
    }    
}

/**************************************
 * Unit 4, Add new classification
 ***************************************/
invCont.addClassification = async function(req, res){
    try{
        const {classification_name} = req.body
        const result = await invModel.addClassification(classification_name)

        if(result){
            req.flash('notice', `${classification_name} has been added.`)
            let nav = await utilities.getNav()
            //Clear and rebuikd the navbar before rendering the management view
            res.status(201).render('./inventory/management', {
                title: 'Vehicle Management',
                nav,
                errors: null                
            })
        }else{
            req.flash('error', 'Failed to add classification')
            //render the add-classification view with error message
            res.status(501).render('inventory/add-classification', {
                title: 'Add Classification',
                nav,
                errors: null
            })
        }
    }catch(error){
        console.error('Sorry, I know you are working hard, but this is not the route.', error)
        res.status(500).send('Internal error')
    }
}

/****************************************
 * Unit 4, build and Add-Inventory view
 ****************************************/
invCont.buildAddInventory = async function(req, res, next){    
    try {
        let nav = await utilities.getNav()
        let classificationList = await utilities.buildClassificationList()
        res.render('./inventory/add-inventory', {
            title: 'Add New Vehicle',
            nav,
            classificationList,
            errors: null,
            messages: req.flash('notice')
        })  
    } catch (error) {
        console.error('Error en buildAddInventory: ', error);
        next(error)  
    }     
}


/****************************************
 * Unit 4, Process Adding new Inventory item
 ****************************************/

invCont.addInventory = async function(req, res, next) {
    let nav = await utilities.getNav();
    const {
        inv_make, 
        inv_model, 
        inv_year, 
        inv_price, 
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_miles,
        inv_color,
        classification_id
    } = req.body;

    // Obtén los errores de la validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('./inventory/add-inventory', {
            title: 'Add New Inventory',
            nav,
            classificationList: await utilities.buildClassificationList(classification_id),
            errors: errors.array() // Pasar errores a la vista
        });
    }

    // Guardar en la base de datos
    const addResult = await invModel.addInventoryItem(
        inv_make,
        inv_model,
        inv_year,
        inv_price,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_miles,
        inv_color,
        classification_id
    );

    if (addResult) {
        req.flash('notice', `New vehicle ${inv_make} ${inv_model} added successfully.`);
        res.redirect('/inv');
    } else {
        req.flash('notice', `Failed to add new vehicle ${inv_make} ${inv_model}.`);
        res.status(500).render('inventory/add-inventory', {
            title: "Add New Vehicle",
            nav,
            classificationList: await utilities.buildClassificationList(classification_id),
            errors: [{ msg: 'Failed to add vehicle due to a database error.' }] // No hay errores si la inserción falla
        });
    }
};

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