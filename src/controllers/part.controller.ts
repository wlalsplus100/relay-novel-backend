import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const createPart = async (req: Request, res: Response) => {
    const { id: storyId } = req.params;
    const { content } = req.body;
    const user = (req as any).user;

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) return res.status(404).json({ message: "소설이 없어요" });

    const existingParts = await prisma.storyPart.count({ where: { storyId } });

    const part = await prisma.storyPart.create({
        data: {
            storyId,
            authorId: user.id,
            content,
            order: existingParts + 1
        }
    });

    res.status(201).json({ message: "이어쓰기 성공", part });
};

export const getParts = async (req: Request, res: Response) => {
    const { id: storyId } = req.params;

    const parts = await prisma.storyPart.findMany({
        where: { storyId },
        orderBy: { order: "asc" },
        include: {
            author: { select: { username: true } }
        }
    });

    res.json({ parts });
};

export const getPartByOrder = async (req: Request, res: Response) => {
    const { id: storyId, order } = req.params;

    const part = await prisma.storyPart.findFirst({
        where: { storyId, order: parseInt(order) },
        include: { author: { select: { username: true } } }
    });

    if (!part) return res.status(404).json({ message: "해당 파트가 없어요" });

    res.json({ part });
};
