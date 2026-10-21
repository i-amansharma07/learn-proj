import express, { Request, Response } from "express";
import { userRouter } from "./modules/users/users.routes";
import { errorHandler } from "./middlewares/error.middlware";

const app = express();
app.use(express.json());

app.get("/check", (_req: Request, res: Response) => {
  return res.send("Im Alive");
});

app.get("/todos", (_req: Request, res: Response) => {
  return res.send(`
    1. postgres erros uniformity.
    2. can service use another try catch for specific db error.
    3. complete profile journey.
    `);
});

//user routes
app.use("/api/v1/users", userRouter);

app.use(errorHandler);

export { app };
