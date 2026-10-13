import express from "express";
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  getUserStatsById,
  updateUserById,
} from "./users.controller";
import { validate } from "../../middlewares/validate.middleware";
import { createUserSchema, updateUserSchema } from "./user.schema";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.post("/", validate(createUserSchema), createUser);
userRouter.get("/:user_id", getUserById);
userRouter.delete("/:user_id", deleteUserById);
userRouter.patch("/:user_id", validate(updateUserSchema), updateUserById);
userRouter.get("/stats/:user_id", getUserStatsById);

export { userRouter };
