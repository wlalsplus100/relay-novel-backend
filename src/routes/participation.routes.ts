import express from "express";
import { authenticate } from "../middlewares/auth";
import { asyncHandler } from "../utils/asyncHandler";
import {
    participate,
    getParticipants,
    getCurrentTurnUser
} from "../controllers/participation.controller";

const participationRouter = express.Router();

participationRouter.post(
    "/:id/participate",
    authenticate,
    asyncHandler(participate)
);
participationRouter.get("/:id/participants", getParticipants);
participationRouter.get("/:id/turn", authenticate, getCurrentTurnUser);
