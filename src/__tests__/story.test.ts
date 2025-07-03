import request from "supertest";
import app from "../app";
import { prisma } from "../config/prisma";

describe("Story API", () => {
    let token: string;
    let storyId: string;
    let userId: string;

    const testUser = {
        username: "storyTester",
        email: "story@test.com",
        password: "test1234"
    };

    beforeAll(async () => {
        await prisma.user.deleteMany({ where: { email: testUser.email } });

        await request(app).post("/api/auth/signup").send(testUser);

        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({ email: testUser.email, password: testUser.password });

        token = loginRes.body.token;
        userId = loginRes.body.user.id;
    });

    afterAll(async () => {
        await prisma.story.deleteMany({ where: { createdBy: userId! } });
        await prisma.user.delete({ where: { id: userId! } });
    });

    it("should create a new story", async () => {
        const res = await request(app)
            .post("/api/stories")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "테스트 소설",
                description: "이건 테스트입니다.",
                isPublic: true
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.story).toHaveProperty("id");
        storyId = res.body.story.id;
    });

    it("should return a list of public stories", async () => {
        const res = await request(app).get("/api/stories");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.stories)).toBe(true);
        expect(res.body.stories[0]).toHaveProperty("title");
    });

    it("should return a single story by id", async () => {
        const res = await request(app).get(`/api/stories/${storyId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.story).toHaveProperty("id", storyId);
    });
});
