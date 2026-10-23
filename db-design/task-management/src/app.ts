import express, { Request, Response } from "express";
import { userRouter } from "./modules/users/users.routes";
import { projectRouter } from "./modules/projects/project.routes";
import { errorHandler } from "./middlewares/error.middlware";

const app = express();
app.use(express.json());

app.get("/check", (_req: Request, res: Response) => {
  return res.send("Im Alive");
});

app.get("/todos", (_req: Request, res: Response) => {
  return res.send(`
    1. pagination inside getAllProjects
    `);
});

//user routes
app.use("/api/v1/users", userRouter);

//project routes
app.use("/api/v1/projects", projectRouter);

app.use(errorHandler);

export { app };
