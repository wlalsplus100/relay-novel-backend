import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "로그인이 필요해요" });
        return;
    }

    try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        (req as any).user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ message: "토큰이 이상해요" });
        return;
    }
};
