import express from "express";
import { authenticate } from "../middlewares/auth";
import { asyncHandler } from "../utils/asyncHandler";
import {
    createPart,
    getParts,
    getPartByOrder
} from "../controllers/part.controller";

const partRouter = express.Router();

partRouter.post("/:id/parts", authenticate, asyncHandler(createPart));
partRouter.get("/:id/parts", asyncHandler(getParts));
partRouter.get("/:id/parts/:order", asyncHandler(getPartByOrder));

export default partRouter;
