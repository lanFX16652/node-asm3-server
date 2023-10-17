import express from "express";
import { addProductIntoCart, getCartUser, cartOrder, getOrder, getOrderDetail, getAllOrders } from "../controllers/cartController.js";

// Khởi tạo router
const router = express.Router();

// Thêm các api cho routes handler
// for client page
router.post("/client/add-to-cart", addProductIntoCart);
router.get("/client/cart", getCartUser);
router.post("/client/order/create", cartOrder);

//get orders
router.get("/client/order", getOrder)
router.get("/client/order/:id", getOrderDetail)
router.get('/get-all-orders', getAllOrders)

const cartRoute = router;

export default cartRoute;