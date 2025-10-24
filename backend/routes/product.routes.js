import express from "express";
import { getProducts } from "../controllers/product.controllers.js";
import { createProduct } from "../controllers/product.controllers.js";
import { getProduct } from "../controllers/product.controllers.js";
import { updateProduct } from "../controllers/product.controllers.js";
import { deleteProduct } from "../controllers/product.controllers.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
