--Task#4
UPDATE inventory
SET inv_description = REPLACE (inv_description, 'small interior', 'a huge interior');


--Task#5
SELECT 
	inventory.inv_model,
	inventory.inv_make,
	classification.classification_name
FROM inventory
INNER JOIN classification
	ON inventory.classification_id = classification.classification_id
WHERE classification.classification_id = 2;

--Task#6
UPDATE inventory
SET inv_image = REPLACE(
	inv_image, '/images/',
	'/images/vehicles/');
	