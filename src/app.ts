import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./routes/auth.routes";
import storyRouter from "./routes/story.routes";
import partRouter from "./routes/part.routes";
import { participationRouter } from "./routes/participation.routes";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRouter);
app.use("/api/stories", storyRouter);
app.use("/api/stories", partRouter);
app.use("/api/stories", participationRouter);

app.get("/", (req: Request, res: Response) => {
    res.send("📚 Relay Novel API is running!");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: "서버 내부 오류입니다." });
});

export default app;
