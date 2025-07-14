const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const validateIdParam = require('../middleware/validateIdParam');
const { validateBody, productSchema, patchProductSchema, getProductSchema } = require('../middleware/validate'); 
const { publish } = require('../rabbitmq');
const auth  = require('../middleware/auth');

const upload = require('../middleware/upload');



router.post('/', validateBody(productSchema), productController.ajouterProduit);

router.get('/', productController.getProduits);
router.get('/:id', productController.getProduitParId);
router.get('/', validateBody(getProductSchema, 'query'), productController.getProduits);

router.put('/:id', validateIdParam, validateBody(productSchema), productController.updateProduit);

router.delete('/:id', validateIdParam, productController.deleteProduit);

router.patch('/:id', validateIdParam, validateBody(patchProductSchema), productController.patchProduit);

router.post('/:id/image', validateIdParam, upload.single('image'), productController.uploadImage);
router.put('/:id/image', validateIdParam, upload.single('image'), productController.replaceImage);
router.delete('/:id/image', validateIdParam, productController.deleteImage);

module.exports = router;
