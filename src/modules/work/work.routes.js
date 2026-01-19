import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { create, getById, list, update, remove } from "./work.controller.js";

const router = Router();

router.get("/", list);
router.get("/:id", getById);

router.post("/", authenticateToken, create);
router.patch("/:id", authenticateToken, update);
router.delete("/:id", authenticateToken, remove);

export default router;
