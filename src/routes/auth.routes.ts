import express from "express";
import { signup, login } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";

const authRouter = express.Router();

authRouter.post("/signup", asyncHandler(signup));
authRouter.post("/login", asyncHandler(login));

export default authRouter;
