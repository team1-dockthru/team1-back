import { Router } from "express";
import { checkDb } from "./health.controller.js";

const router = Router();

router.get("/db", checkDb);

export default router;
