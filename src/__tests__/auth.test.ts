import request from "supertest";
import app from "../app";
import { prisma } from "../config/prisma";

describe("Auth API", () => {
    const testEmail = "testuser@example.com";

    afterAll(async () => {
        // 테스트 유저 삭제
        await prisma.user.deleteMany({ where: { email: testEmail } });
        await prisma.$disconnect();
    });

    it("should signup successfully", async () => {
        const res = await request(app).post("/api/auth/signup").send({
            username: "testuser",
            email: testEmail,
            password: "12345678"
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.user).toHaveProperty("id");
        expect(res.body.user.username).toBe("testuser");
    });

    it("should login successfully and return token", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: "12345678"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user.username).toBe("testuser");
    });
});
