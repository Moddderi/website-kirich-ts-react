import { Router } from "express";
import {
  createOrderController,
  getOrderDetails,
  getOrdersController,
} from "../controllers/orderController.js";

const router = Router();

router.post("/", createOrderController);
router.get("/", getOrdersController);

router.get("/:id", getOrderDetails);

export default router;
