const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const validateIdParam = require('../middleware/validateIdParam');
const { validateBody, productSchema } = require('../middleware/validate'); 

const upload = require('../middleware/upload');



router.post('/', validateBody(productSchema), productController.ajouterProduit);
router.get('/', productController.getProduits);
router.get('/:id', productController.getProduitParId);
router.put('/:id', validateIdParam, validateBody(productSchema), productController.updateProduit);
router.delete('/:id', validateIdParam, productController.deleteProduit);
router.post('/:id/image', validateIdParam, upload.single('image'), productController.uploadImage);

module.exports = router;
