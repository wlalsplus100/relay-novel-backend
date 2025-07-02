import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const participate = async (req: Request, res: Response) => {
    const { id: storyId } = req.params;
    const user = (req as any).user;

    const existing = await prisma.participation.findFirst({
        where: { storyId, userId: user.id }
    });

    if (existing) {
        return res.status(400).json({ message: "이미 참여했어요" });
    }

    const count = await prisma.participation.count({ where: { storyId } });

    const participation = await prisma.participation.create({
        data: {
            storyId,
            userId: user.id,
            turnOrder: count + 1,
            isDone: false
        }
    });

    res.status(201).json({ message: "참여 완료", participation });
    return;
};

export const getParticipants = async (req: Request, res: Response) => {
    const { id: storyId } = req.params;

    const participants = await prisma.participation.findMany({
        where: { storyId },
        orderBy: { turnOrder: "asc" },
        include: {
            user: { select: { username: true } }
        }
    });

    res.json(participants);
    return;
};

export const getCurrentTurnUser = async (req: Request, res: Response) => {
    const { id: storyId } = req.params;

    const nextUser = await prisma.participation.findFirst({
        where: {
            storyId,
            isDone: false
        },
        orderBy: { turnOrder: "asc" },
        include: {
            user: { select: { username: true } }
        }
    });

    if (!nextUser) {
        res.status(200).json({ message: "모든 차례 완료", user: null });
    }

    res.json({ user: nextUser?.user, turnOrder: nextUser?.turnOrder });
    return;
};
