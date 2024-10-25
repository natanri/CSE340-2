const pool = require("../database")

/***************************************
 * Register new account
 * Unit 4, process Registration Activity
 ***************************************/
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try{
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch(error){
        return error.message
    }
}

/****************************************
 * Return account data using email address
 ****************************************/
async function getAccountByEmail(account_email){
    try{
        const result = await pool.query (
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
            [account_email])
        return result.rows[0]        
    }catch(error){
        return new Error("No matching email found")
    }
}

async function checkExistingEmail(account_email) {
    try {
        const sql = 'SELECT * FROM account WHERE account_email = $1';
        const result = await pool.query(sql, [account_email]);

        if (result.rowCount === 1) {
            return result.rows[0];
        }
        return null;  // If no matching email is found, return null.
    } catch (error) {
        throw new Error(`Database query failed: ${error.message}`);
    }
}

/* *****************************
* Create a new account
* ***************************** */
async function createAccount({ account_firstname, account_lastname, account_email, account_password, account_type }) {
    try {
        const result = await pool.query(
            `INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
             VALUES ($1, $2, $3, $4, 'Client') RETURNING account_id`,
            [account_firstname, account_lastname, account_email, account_password]
        );
        return result.rows[0]; // Return the inserted account data (or the ID)
    } catch (error) {
        throw new Error("Error creating account: " + error.message);
    }
}
/**************************************
 * Get the id account
 **************************************/
async function getAccountById(accountId){
    try{
        const sql = `SELECT account_id, account_firstname, account_lastname, account_email, account_type
                    FROM account
                    WHERE account_id = $1` 
        const result = await pool.query(sql, [accountId])
        return result.rows[0]
    }catch(error){
        console.error('Error fetching account by ID', error)
        throw error
    }
}

/***********************************
 * Update form  account information
 *************************************/
async function updateAccount({account_id, account_firstname, account_lastname, account_email}){
    try{
        const sql = `UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3  
                    WHERE
                        account_id = $4
                    RETURNING account_id`;

        const data = await pool.query(sql,[account_firstname, account_lastname, account_email, account_id])

        return data.rows[0]
    }catch(error){
        console.error('Error updating account', error)
    }throw error
}

/***********************************
 * Update password
 *************************************/

async function updatePassword(account_id, hashedPassword){
    try{
        const sql = `UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING account_id`;
        const data = await pool.query(sql, [hashedPassword, account_id]);
        return data.rows[0];
    }catch(error){
        console.error("Error updating password: ", error);
        throw error;
    }
}
  


module.exports = {
    registerAccount, 
    getAccountByEmail, 
    checkExistingEmail, 
    createAccount, 
    getAccountById,
    updateAccount, 
    updatePassword}
