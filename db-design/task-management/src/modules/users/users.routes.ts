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
  UpsertProfileSchema,
} from "./user.schema";

import { userQuerySchema } from "./user.schema";

const userRouter = express.Router();

userRouter.get("/", validate(userQuerySchema, "query"), getAllUsers);
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

//profile
userRouter.post(
  "/:user_id",
  validate(userParamSchema, "params"),
  validate(UpsertProfileSchema, "body"),
);
userRouter.get("/:user_id", validate(userParamSchema, "params"));

export { userRouter };
