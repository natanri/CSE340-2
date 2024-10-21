const utilities = require('.')
const {body, validationResult} = require('express-validator')
const inv_validate = {}

/************************************************* 
 * Validate data and return errors or continue to inventory
***************************************************/
inv_validate.checkInventoryData = async (req, res, next) => {
    // Ejecutar las validaciones para cada campo que necesitas
    await Promise.all([
        body("inv_make")
            .trim()
            .notEmpty()
            .withMessage("Make is required")
            .run(req),

        body("inv_model")
            .trim()
            .notEmpty()
            .withMessage("Model is required")
            .run(req),

        body("inv_year")
            .isNumeric()
            .withMessage("Year must be a number")
            .run(req),

        body("inv_price")
            .isFloat({ gt: 0 })
            .withMessage("Price must be a positive number")
            .run(req),

        
    ]);

    // Gather validation errors
    let errors = validationResult(req);

    // If errors, render form with errors messages
    if (!errors.isEmpty()) {
        let list = await utilities.buildClassificationList();
        let nav = await utilities.getNav();

        res.render('inventory/add-inventory', {
            errors: errors.array(), 
            title: 'Add Inventory',
            nav,
            list,
            // Other information to pass if needed
            inv_make: req.body.inv_make,
            inv_model: req.body.inv_model,
            inv_year: req.body.inv_year,
            inv_description: req.body.inv_description,
            inv_image: req.body.inv_image,
            inv_thumbnail: req.body.inv_thumbnail,
            inv_price: req.body.inv_price,
            inv_miles: req.body.inv_miles,
            inv_color: req.body.inv_color,
            classification_id: req.body.classification_id
        });
        return;
    }
    next(); // No hay errores, continuar con el siguiente middleware
};

/************************************************* 
 * Validate data and errors will be directed back to the edit view
***************************************************/
inv_validate.checkUpdateData = async (req, res, next) => {
    // Ejecutar las validaciones para cada campo que necesitas
    await Promise.all([
        //add inv_id validation
        body("inv_id")
            .trim()
            .isInt()
            .notEmpty()
            .withMessage("Inventory ID is required")
            .run(req),

        body("inv_make")
            .trim()
            .notEmpty()
            .withMessage("Make is required")
            .run(req),

        body("inv_model")
            .trim()
            .notEmpty()
            .withMessage("Model is required")
            .run(req),

        body("inv_year")
            .isNumeric()
            .withMessage("Year must be a number")
            .run(req),

        body("inv_price")
            .isInt({ gt: 0 })
            .withMessage("Price must be a positive number")
            .run(req),

        
    ]);

    // Gather validation errors
    let errors = validationResult(req);

    // If errors, render form with errors messages
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        let classificationSelect = await utilities.buildClassificationList(req.body.classification_id);        

        res.render('inventory/edit-inventory', {
            title: `Edit ${req.body.inv_make} ${req.body.inv_model}`,
            errors: errors.array(),             
            nav,
            classificationSelect,
            errors,
            // Other information to pass if needed
            inv_id: req.body.inv_id,//Pass the inv_id to the view
            inv_make: req.body.inv_make,
            inv_model: req.body.inv_model,
            inv_year: req.body.inv_year,
            inv_description: req.body.inv_description,
            inv_image: req.body.inv_image,
            inv_thumbnail: req.body.inv_thumbnail,
            inv_price: req.body.inv_price,
            inv_miles: req.body.inv_miles,
            inv_color: req.body.inv_color,
            classification_id: req.body.classification_id
        });
        return;
    }
    next(); // No hay errores, continuar con el siguiente middleware
};

/*******************************************
 * Check data and return errors or continue to edit inventory
 *********************************************
inv_validate.checkUpDateData = async (req, res, next) =>{
    let list = await utilities.buildClassificationList()
    const {
        inv_id,          
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
        } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()){
        let nav = await utilities.getNav()
        //Handle validation errors, render a form  with error messages
        res.render('inventory/add-inventory',{
            errors,
            title:'Edit' + inv_make + inv_model,
            nav,
            list,  
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        })
        return
    }
    next()
}


/**************************************
 * Check validation data from add classification view
 **************************************/
inv_validate.Classification = () => {
    return [
        body("classification_name")
        .trim()
        .notEmpty()
        .withMessage("Classification name is required") 
        .matches(/^\S+$/)  
        .withMessage("Classification name can only contain letters, numbers and cannot contain spaces"),
    ]
}

/**************************************
 * Check validation data before add classification
 **************************************/
inv_validate.checkClassificationData = async (req, res, next) => {
    await Promise.all(inv_validate.Classification().map(validation => validation.run(req)));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        let list = await utilities.buildClassificationList();

        res.render("inventory/add-classification", {
            errors: errors.array(),
            title: "Add Classification",
            nav,
            list,
            classification_name: req.body.classification_name
        });
        return;
    }
    next();
};



module.exports = inv_validate