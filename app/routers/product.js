import express from "express";
import { createProduct, getProducts, getProductDetail, getRelatedProduct, getCategory, postEditProduct, deleteProduct } from '../controllers/productController.js'

const router = express.Router();

router.get('/product/list', getProducts)
router.get('/product/:id', getProductDetail)
router.get('/related-product', getRelatedProduct)
router.get('/category', getCategory)

//Admin routes
router.post("/product/create", createProduct)
router.post('/edit-product', postEditProduct)
router.post('/delete-product', deleteProduct)

const productRoute = router;

export default productRoute;