import express from "express";
import { userRouter } from "./modules/users/users.routes";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  return res.send("hello");
});

//user routes
app.use("/api/v1/users", userRouter);

export { app };
