import express from "express";
import { authenticate } from "../middlewares/auth";
import { asyncHandler } from "../utils/asyncHandler";
import {
    createPart,
    getParts,
    getPartByOrder
} from "../controllers/part.controller";

const router = express.Router();

router.post("/:id/parts", authenticate, asyncHandler(createPart));
router.get("/:id/parts", asyncHandler(getParts));
router.get("/:id/parts/:order", asyncHandler(getPartByOrder));

export default router;
