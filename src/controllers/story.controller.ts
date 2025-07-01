import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const createStory = async (req: Request, res: Response) => {
    const { title, description, isPublic } = req.body;
    const user = (req as any).user;

    const story = await prisma.story.create({
        data: {
            title,
            description,
            isPublic: isPublic ?? true,
            createdBy: user.id
        }
    });

    res.status(201).json({ message: "소설 생성 완료", story });
};

export const getStories = async (req: Request, res: Response) => {
    const stories = await prisma.story.findMany({
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
        include: {
            author: { select: { username: true } },
            parts: true
        }
    });

    res.json({ stories });
};

export const getStoryById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const story = await prisma.story.findUnique({
        where: { id },
        include: {
            author: { select: { username: true } },
            parts: {
                orderBy: { order: "asc" }
            }
        }
    });

    if (!story || !story.isPublic) {
        return res.status(404).json({ message: "그 소설은 없어요" });
    }

    res.json({ story });
};
