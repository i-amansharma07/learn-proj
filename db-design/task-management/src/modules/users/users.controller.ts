import { Request, Response, RequestHandler } from "express";
import { UserService } from "../../container";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import type {
  CreateUserDTO,
  UpdateUserDTO,
  UserQuery,
  ProfileDTO,
} from "./user.schema";

const getAllUsers: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const params = res.locals.validated["query"] as UserQuery;
    const users = await UserService.getAllUsers(params);

    return res
      .status(200)
      .json(
        new ApiResponse(users.data, "Users fetched", 200, users.pagination),
      );
  },
);

const createUser: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = res.locals.validated["body"] as CreateUserDTO;

    const user = await UserService.createUser(data);

    return res.status(201).json(new ApiResponse(user, "User Created"));
  },
);

const getUserById: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const { user_id } = res.locals.validated["params"];

    const user = await UserService.getUserById(user_id as string);

    return res.status(200).json(new ApiResponse(user, "User fetched"));
  },
);

const deleteUserById: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const { user_id } = res.locals.validated["params"];

    await UserService.deleteUserById(user_id as string);

    return res.status(204).send();
  },
);

const updateUserById: RequestHandler = asyncHandler(
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

const getUserStatsById: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const { user_id } = res.locals.validated["params"];

    const data = await UserService.getUserStatsById(user_id as string);

    return res.status(200).json(new ApiResponse(data, "stats fetched"));
  },
);

//Profile
const getUserProfileById: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const { user_id } = res.locals.validated["params"];

    const user = await UserService.getUserProfileById(user_id as string);

    return res.status(200).json(new ApiResponse(user, "User's profile fetched"));
  },
);
const updateUserWithProfile: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const { user_id } = res.locals.validated["params"];
    const data = res.locals.validated["body"] as ProfileDTO;

    if (Object.keys(data).length === 0) {
      return res
        .status(200)
        .json(new ApiResponse({}, "No fields provided for update"));
    }

    const userwithProfile = await UserService.updateUserWithProfile(
      user_id,
      data,
    );

    return res
      .status(201)
      .json(new ApiResponse(userwithProfile, "Profile has been updated"));
  },
);

export {
  getAllUsers,
  createUser,
  getUserById,
  deleteUserById,
  updateUserById,
  getUserStatsById,
  getUserProfileById,
  updateUserWithProfile,
};
