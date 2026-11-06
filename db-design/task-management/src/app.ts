import express, { NextFunction, Request, Response } from "express";
import { userRouter } from "./modules/users/users.routes";
import { projectRouter } from "./modules/projects/projects.routes";
import { tasksRouter } from "./modules/tasks/tasks.routes";
import { errorHandler } from "./middlewares/error.middlware";
import { httpLogger } from "./middlewares/httpLogger";

import { register } from "./observability/metrics";

const app = express();

app.use(httpLogger);

app.use(express.json());

app.get("/check", (_req: Request, res: Response) => {
  return res.send("Im Alive");
});

app.get("/todos", (_req: Request, res: Response) => {
  return res.send(`
    1. pagination inside getAllProjects
    `);
});

app.get("/metrics", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.setHeader("content-type", register.contentType);

    res.end(await register.metrics());
  } catch (err) {
    next(err);
  }
});

//user routes
app.use("/api/v1/users", userRouter);

//project routes
app.use("/api/v1/projects", projectRouter);

//task routes
app.use("/api/v1/tasks", tasksRouter);

app.use(errorHandler);

export { app };
