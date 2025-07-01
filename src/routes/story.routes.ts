import express from "express";
import {
    createStory,
    getStories,
    getStoryById
} from "../controllers/story.controller";
import { authenticate } from "../middlewares/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = express.Router();

router.post("/", authenticate, asyncHandler(createStory));
router.get("/", asyncHandler(getStories));
router.get("/:id", asyncHandler(getStoryById));

export default router;
