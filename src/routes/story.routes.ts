import express from "express";
import {
    createStory,
    getStories,
    getStoryById
} from "../controllers/story.controller";
import { authenticate } from "../middlewares/auth";
import { asyncHandler } from "../utils/asyncHandler";

const storyRouter = express.Router();

storyRouter.post("/", authenticate, asyncHandler(createStory));
storyRouter.get("/", asyncHandler(getStories));
storyRouter.get("/:id", asyncHandler(getStoryById));

export default storyRouter;
