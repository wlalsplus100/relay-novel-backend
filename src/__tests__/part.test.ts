import request from "supertest";
import app from "../app";
import { prisma } from "../config/prisma";

describe("StoryPart + Participation 연동 테스트", () => {
    let token: string;
    let userId: string;
    let storyId: string;

    const testUser = {
        username: "relayUser",
        email: "relay@test.com",
        password: "relay1234"
    };

    beforeAll(async () => {
        await prisma.storyPart.deleteMany();
        await prisma.participation.deleteMany();
        await prisma.story.deleteMany();
        await prisma.user.deleteMany({ where: { email: testUser.email } });

        // 회원가입 + 로그인
        await request(app).post("/api/auth/signup").send(testUser);
        const res = await request(app).post("/api/auth/login").send(testUser);
        token = res.body.token;
        userId = res.body.user.id;

        // 소설 생성
        const storyRes = await request(app)
            .post("/api/stories")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "릴레이 테스트",
                description: "참가 후 이어쓰기 테스트",
                isPublic: true
            });

        storyId = storyRes.body.story.id;

        // 참가 신청
        await request(app)
            .post(`/api/stories/${storyId}/participate`)
            .set("Authorization", `Bearer ${token}`);
    });

    afterAll(async () => {
        await prisma.storyPart.deleteMany({ where: { storyId } });
        await prisma.participation.deleteMany({ where: { storyId } });
        await prisma.story.delete({ where: { id: storyId } });
        await prisma.user.delete({ where: { id: userId } });
        await prisma.$disconnect();
    });

    it("should create a new story part after participation", async () => {
        const res = await request(app)
            .post(`/api/stories/${storyId}/parts`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                content: "첫 줄이지만 아무도 이 내용을 이어쓰지 못할 것이다."
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.part).toHaveProperty("id");
        expect(res.body.part.order).toBe(1);
    });

    it("should fetch all parts", async () => {
        const res = await request(app).get(`/api/stories/${storyId}/parts`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.parts)).toBe(true);
        expect(res.body.parts[0].order).toBe(1);
    });

    it("should fetch part by order", async () => {
        const res = await request(app).get(`/api/stories/${storyId}/parts/1`);
        expect(res.statusCode).toBe(200);
        expect(res.body.part.content).toBeDefined();
    });
});
