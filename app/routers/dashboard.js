import express from "express";
import { getInfoBar } from "../controllers/dashboardController.js";
import { authMiddleware } from '../middlewares/authMiddleware.js'
const router = express.Router();

router.get("/admin/info-bar", authMiddleware, getInfoBar);

const dashBoard = router;

export default dashBoard;
