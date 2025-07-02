import request from "supertest";
import app from "../app";
import { prisma } from "../config/prisma";

describe("StoryPart API", () => {
    let token: string;
    let userId: string;
    let storyId: string;
    let partId: string;

    const testUser = {
        username: "partUser",
        email: "part@test.com",
        password: "test1234"
    };

    beforeAll(async () => {
        await prisma.storyPart.deleteMany();
        await prisma.story.deleteMany();
        await prisma.user.deleteMany({ where: { email: testUser.email } });

        // 회원가입 & 로그인
        await request(app).post("/api/auth/signup").send(testUser);
        const res = await request(app).post("/api/auth/login").send({
            email: testUser.email,
            password: testUser.password
        });

        token = res.body.token;
        userId = res.body.user.id;

        // 소설 생성
        const storyRes = await request(app)
            .post("/api/stories")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "테스트 릴레이",
                description: "테스트용 소설입니다",
                isPublic: true
            });

        storyId = storyRes.body.story.id;
    });

    afterAll(async () => {
        await prisma.storyPart.deleteMany({ where: { storyId } });
        await prisma.story.delete({ where: { id: storyId } });
        await prisma.user.delete({ where: { id: userId } });
        await prisma.$disconnect();
    });

    it("should create a new story part", async () => {
        const res = await request(app)
            .post(`/api/stories/${storyId}/parts`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                content: "첫 번째 파트입니다. 무언가 시작되려 한다..."
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.part).toHaveProperty("id");
        expect(res.body.part.order).toBe(1);

        partId = res.body.part.id;
    });

    it("should return all parts in order", async () => {
        const res = await request(app).get(`/api/stories/${storyId}/parts`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.parts)).toBe(true);
        expect(res.body.parts[0].order).toBe(1);
    });

    it("should return specific part by order", async () => {
        const res = await request(app).get(`/api/stories/${storyId}/parts/1`);

        expect(res.statusCode).toBe(200);
        expect(res.body.part.order).toBe(1);
        expect(res.body.part).toHaveProperty("content");
    });
});
