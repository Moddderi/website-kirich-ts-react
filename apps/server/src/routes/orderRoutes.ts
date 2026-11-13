import { Router } from "express";
import {
  createOrderController,
  getOrderDetails,
} from "../controllers/orderController.js";

const router = Router();

router.post("/", createOrderController);
// NOTE: the full orders list used to be public (names, phones, e-mails) — removed.

router.get("/:id", getOrderDetails);

export default router;
