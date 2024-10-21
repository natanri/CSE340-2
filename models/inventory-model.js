const { Result } = require("express-validator")
const pool = require("../database/")

/**********************************
 * Get all classification data
 **********************************/
async function getClassifications(){
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/***********************************
 * Get all inventory items and classification_name by classification_id
 *********************************** */
async function getInventoryByClassificationId(classification_id){
    try{
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    }catch(error){
        console.error("getclassificationbyid error" + error)
    }
}

async function getInventoryById(inv_id) {
    try{
        const data = await pool.query(`SELECT * FROM public.inventory AS i JOIN
        public.classification AS c ON i.classification_id = c.classification_id
        WHERE i.inv_id =$1`, [inv_id])
        return data.rows        
    }catch(error) {
        console.error("getinventorybbyid error" + error)
    }
}

/******************************************
 * Add new classification
 ******************************************/
async function addClassification(classification_name) {
    try{
        const sql = 'INSERT INTO classification (classification_name) VALUES ($1) RETURNING classification_id';
        return await pool.query(sql, [classification_name])
    }catch(error){
        console.error("addClassification error:" + error.message)
        return error.message
    }    
}

async function checkExistingClassification (clasification_name){
    try{
        const sql = `SELECT * FROM classification WHERE classification_name = $1`
        const clasification = await pool.query(sql,[clasification_name])
        if(clasification.rowCount === 1){
            return clasification.rows[0]
        }
        return null
    }catch(error){
        return error.message
    }
}

/**************************************
 * Add new inventory item
 ***************************************/
async function addInventoryItem(
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
){
    try{
        const sql = `
            INSERT INTO inventory
            (inv_make, inv_model, inv_year, inv_price, inv_description, inv_image, inv_thumbnail, inv_miles, inv_color, classification_id)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `
        const result=  await pool.query(sql,[
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
        ])
        return result.rows[0]
    }catch (error){
        console.error("addinventoryitem error" + error)
    }
}

/**************************************
 * update inventory item
 ***************************************/
async function updateInventory(
    inv_id,
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
){
    try{
        console.log("Valores enviados para la actualización:", {
            inv_id,
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
        });
        const sql = `
            UPDATE public.inventory SET
            inv_make = $1, inv_model = $2 , inv_year = $3, inv_price = $4, inv_description = $5, inv_image = $6, inv_thumbnail = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11            
            RETURNING *;`
        const result=  await pool.query(sql,[            
            inv_make,
            inv_model,
            inv_year,
            inv_price,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_miles,
            inv_color,
            classification_id,
            inv_id
        ])
        return result.rows[0]
    }catch (error){
        console.error("model error" + error)
    }
}

/**************************************
 * Delete inventory item
 ***************************************/
async function deleteInventoryItem(inv_id){
    try{        
        const sql = 'DELETE FROM inventory WHERE inv_id = $1';
        const data =  await pool.query(sql,[inv_id])
        return data
        }catch (error){
            new Error("Delete inventory error")
    }
}

module.exports = {
    getClassifications, 
    getInventoryByClassificationId, 
    getInventoryById, 
    addInventoryItem, 
    addClassification, 
    checkExistingClassification,
    updateInventory,
    deleteInventoryItem
}
