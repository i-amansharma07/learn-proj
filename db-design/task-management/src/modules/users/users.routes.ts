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
import {
  createUserSchema,
  userParamSchema,
  updateUserSchema,
} from "./user.schema";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.post("/", validate(createUserSchema, "body"), createUser);
userRouter.get("/:user_id", validate(userParamSchema, "params"), getUserById);
userRouter.delete(
  "/:user_id",
  validate(userParamSchema, "params"),
  deleteUserById,
);
userRouter.patch(
  "/:user_id",
  validate(userParamSchema, "params"),
  validate(updateUserSchema, "body"),
  updateUserById,
);

userRouter.get(
  "/stats/:user_id",
  validate(userParamSchema, "params"),
  getUserStatsById,
);

export { userRouter };
