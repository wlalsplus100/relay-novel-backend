import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const createPart = async (req: Request, res: Response) => {
    const { id: storyId } = req.params;
    const { content } = req.body;
    const user = (req as any).user;

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) return res.status(404).json({ message: "소설이 없어요" });

    const participation = await prisma.participation.findFirst({
        where: { storyId, userId: user.id }
    });

    if (!participation) {
        return res.status(403).json({ message: "참여하지 않았어요" });
    }

    if (participation.isDone) {
        return res.status(403).json({ message: "이미 썼어요" });
    }

    const currentTurn = await prisma.participation.findFirst({
        where: { storyId, isDone: false },
        orderBy: { turnOrder: "asc" }
    });

    if (currentTurn?.userId !== user.id) {
        return res.status(403).json({ message: "지금은 차례가 아니에요" });
    }

    const existingParts = await prisma.storyPart.count({ where: { storyId } });

    const part = await prisma.storyPart.create({
        data: {
            storyId,
            authorId: user.id,
            content,
            order: existingParts + 1
        }
    });

    await prisma.participation.update({
        where: { id: participation.id },
        data: { isDone: true, turnGivenAt: null }
    });

    const next = await prisma.participation.findFirst({
        where: {
            storyId,
            isDone: false,
            isSkipped: false,
            turnGivenAt: null
        },
        orderBy: { turnOrder: "asc" }
    });

    if (next) {
        await prisma.participation.update({
            where: { id: next.id },
            data: {
                turnGivenAt: new Date()
            }
        });
    }

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
