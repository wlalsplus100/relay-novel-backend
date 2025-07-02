import { prisma } from "../config/prisma";

const TURN_TIMEOUT_HOURS = 3;

export const updateExpiredTurns = async (storyId: string) => {
    const now = new Date();

    const expiredTurns = await prisma.participation.findMany({
        where: {
            storyId,
            isDone: false,
            isSkipped: false,
            turnGivenAt: {
                not: null,
                lt: new Date(
                    now.getTime() - TURN_TIMEOUT_HOURS * 60 * 60 * 1000
                )
            }
        }
    });

    for (const p of expiredTurns) {
        await prisma.participation.update({
            where: { id: p.id },
            data: { isSkipped: true }
        });
    }

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
            data: { turnGivenAt: now }
        });
    }
};
