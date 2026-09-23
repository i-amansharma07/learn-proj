import express from "express";
const app = express();
import { userRouter } from "./routes/users";

app.get("/", (req, res) => {
  return res.send("hello");
});

//user routes
app.use("/api/v1/user", userRouter);

export { app };
