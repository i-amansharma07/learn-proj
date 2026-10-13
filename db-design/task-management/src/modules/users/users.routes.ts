import express from "express";
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  getUserStatsById,
  updateUserById,
} from "./users.controller";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.post("/", createUser);
userRouter.get("/:user_id", getUserById);
userRouter.delete("/:user_id", deleteUserById);
userRouter.patch("/:user_id", updateUserById);
userRouter.get("/stats/:user_id", getUserStatsById);

export { userRouter };
