import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export const signup = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing)
            return res
                .status(400)
                .json({ message: "이미 가입된 이메일이에요" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { username, email, password: hashed }
        });

        res.status(201).json({
            message: "회원가입 성공",
            user: { id: user.id, username: user.username }
        });
    } catch (err) {
        res.status(500).json({
            message: "서버가 또 고장났나봐요",
            error: err
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return res
                .status(404)
                .json({ message: "등록되지 않은 유저입니다" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res
                .status(401)
                .json({ message: "비밀번호가 일치하지 않습니다" });

        const token = jwt.sign(
            { id: user.id, email: user.email },
            ENV.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "로그인 성공!",
            token,
            user: { id: user.id, username: user.username }
        });
    } catch (err) {
        res.status(500).json({
            message: "서버가 또 울고 있대요ㅠㅠ",
            error: err
        });
    }
};
