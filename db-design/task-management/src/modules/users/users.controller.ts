import { Request, Response, RequestHandler } from "express";
import { UserService } from "../../container";
import { asynHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { CreateUserDTO, UpdateUserDTO } from "./user.schema";
import { paginationParams } from "../../utils/schema";
import { userParams } from "./user.schema";

const getAllUsers: RequestHandler = asynHandler(
  async (_req: Request, res: Response) => {
    const params = res.locals.validated["query"] as paginationParams &
      userParams;
    const users = await UserService.getAllUsers(params);

    return res
      .status(200)
      .json(
        new ApiResponse(users.data, "Users fetched", 200, users.pagination),
      );
  },
);

const createUser: RequestHandler = asynHandler(
  async (_req: Request, res: Response) => {
    const data = res.locals.validated["body"] as CreateUserDTO;

    const user = await UserService.createUser(data);

    return res.status(201).json(new ApiResponse(user, "User Created"));
  },
);

const getUserById: RequestHandler = asynHandler(
  async (_req: Request, res: Response) => {
    const { user_id } = res.locals.validated["params"];

    const user = await UserService.getUserById(user_id as string);

    return res.status(200).json(new ApiResponse(user, "User fetched"));
  },
);

const deleteUserById: RequestHandler = asynHandler(
  async (_req: Request, res: Response) => {
    const { user_id } = res.locals.validated["params"];

    await UserService.deleteUserById(user_id as string);

    return res.status(204).send();
  },
);

const updateUserById: RequestHandler = asynHandler(
  async (_req: Request, res: Response) => {
    const { user_id } = res.locals.validated["params"];
    const userData = res.locals.validated["body"] as UpdateUserDTO;

    //for empty patch object
    if (Object.keys(userData).length === 0) {
      return res
        .status(200)
        .json(new ApiResponse({}, "No fields provided for update"));
    }

    const user = await UserService.updateUserById(user_id as string, userData);

    return res.status(200).json(new ApiResponse(user, "User updated"));
  },
);

const getUserStatsById: RequestHandler = asynHandler(
  async (_req: Request, res: Response) => {
    const { user_id } = res.locals.validated["params"];

    const data = await UserService.getUserStatsById(user_id as string);

    return res.status(200).json(new ApiResponse(data, "stats fetched"));
  },
);

export {
  getAllUsers,
  createUser,
  getUserById,
  deleteUserById,
  updateUserById,
  getUserStatsById,
};
