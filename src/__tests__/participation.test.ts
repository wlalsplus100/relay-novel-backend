import request from "supertest";
import app from "../app";
import { prisma } from "../config/prisma";

describe("Participation API", () => {
    let tokenA: string;
    let tokenB: string;
    let storyId: string;

    const userA = {
        username: "userA",
        email: "a@test.com",
        password: "pass1234"
    };
    const userB = {
        username: "userB",
        email: "b@test.com",
        password: "pass1234"
    };

    beforeAll(async () => {
        await prisma.storyPart.deleteMany();
        await prisma.participation.deleteMany();
        await prisma.story.deleteMany();
        await prisma.user.deleteMany({
            where: { email: { in: [userA.email, userB.email] } }
        });

        // 회원가입 및 로그인
        await request(app).post("/api/auth/signup").send(userA);
        await request(app).post("/api/auth/signup").send(userB);

        const resA = await request(app).post("/api/auth/login").send(userA);
        tokenA = resA.body.token;

        const resB = await request(app).post("/api/auth/login").send(userB);
        tokenB = resB.body.token;

        // 소설 생성
        const storyRes = await request(app)
            .post("/api/stories")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ title: "참여 테스트 소설", isPublic: true });

        storyId = storyRes.body.story.id;
    });

    afterAll(async () => {
        await prisma.storyPart.deleteMany({ where: { storyId } });
        await prisma.participation.deleteMany({ where: { storyId } });
        await prisma.story.delete({ where: { id: storyId } });
        await prisma.user.deleteMany({
            where: { email: { in: [userA.email, userB.email] } }
        });
        await prisma.$disconnect();
    });

    it("should allow user A to participate", async () => {
        const res = await request(app)
            .post(`/api/stories/${storyId}/participate`)
            .set("Authorization", `Bearer ${tokenA}`);

        expect(res.statusCode).toBe(201);
        expect(res.body.participation.turnOrder).toBe(1);
    });

    it("should allow user B to participate with turnOrder 2", async () => {
        const res = await request(app)
            .post(`/api/stories/${storyId}/participate`)
            .set("Authorization", `Bearer ${tokenB}`);

        expect(res.statusCode).toBe(201);
        expect(res.body.participation.turnOrder).toBe(2);
    });

    it("should fail if user tries to participate again", async () => {
        const res = await request(app)
            .post(`/api/stories/${storyId}/participate`)
            .set("Authorization", `Bearer ${tokenA}`);

        expect(res.statusCode).toBe(400);
    });

    it("should return participants list", async () => {
        const res = await request(app).get(
            `/api/stories/${storyId}/participants`
        );

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    });

    it("should show user A as current turn", async () => {
        const res = await request(app)
            .get(`/api/stories/${storyId}/turn`)
            .set("Authorization", `Bearer ${tokenA}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.user.username).toBe("userA");
    });
});
