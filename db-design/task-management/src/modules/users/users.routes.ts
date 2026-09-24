import express from "express";
import { createUser, getAllUsers, getUserById } from "./users.controller";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.post("/", createUser);
userRouter.get("/:user_id", getUserById);

export { userRouter };
