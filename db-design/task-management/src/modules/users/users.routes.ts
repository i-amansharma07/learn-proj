import { Router } from "express";
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  getUserStatsById,
  updateUserById,
  getUserProfileById,
  updateUserWithProfile,
} from "./users.controller";
import { validate } from "../../middlewares/validate.middleware";
import {
  createUserSchema,
  userParamSchema,
  updateUserSchema,
  UpsertProfileSchema,
  userQuerySchema,
} from "./users.schema";
import { getUsersProjectsByUserId } from "../projects/projects.controller";
import { getUserWithIdTasks } from "../tasks/tasks.controller";

const userRouter = Router();

userRouter.get("/", validate(userQuerySchema, "query"), getAllUsers);
userRouter.post("/", validate(createUserSchema, "body"), createUser);
userRouter.get("/:userId", validate(userParamSchema, "params"), getUserById);
userRouter.delete(
  "/:userId",
  validate(userParamSchema, "params"),
  deleteUserById,
);
userRouter.patch(
  "/:userId",
  validate(userParamSchema, "params"),
  validate(updateUserSchema, "body"),
  updateUserById,
);
userRouter.get(
  "/stats/:userId",
  validate(userParamSchema, "params"),
  getUserStatsById,
);

//profile
userRouter.get(
  "/:userId/profile",
  validate(userParamSchema, "params"),
  getUserProfileById,
);
userRouter.patch(
  "/:userId/profile",
  validate(userParamSchema, "params"),
  validate(UpsertProfileSchema, "body"),
  updateUserWithProfile,
);

//get user's project
userRouter.get(
  "/:userId/projects",
  validate(userParamSchema, "params"),
  getUsersProjectsByUserId,
);

//get user's tasks
userRouter.get(
  "/:userId/tasks",
  validate(userParamSchema, "params"),
  getUserWithIdTasks,
);

export { userRouter };
