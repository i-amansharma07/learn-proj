import { Request, Response, RequestHandler } from "express";
import { UserService } from "../../container";
import { asynHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";

const getAllUsers: RequestHandler = asynHandler(
  async (req: Request, res: Response) => {
    const users = await UserService.getAllUsers();

    return res.status(201).json(new ApiResponse(users, "User fetched"));
  },
);

const createUser: RequestHandler = asynHandler(
  async (req: Request, res: Response) => {
    const data = req.body;

    const user = await UserService.createUser(data);

    return res.status(201).json(new ApiResponse(user, "User Created"));
  },
);

const getUserById: RequestHandler = asynHandler(
  async (req: Request, res: Response) => {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ errors: "user id is not provided" });
    }

    const user = await UserService.getUserById(user_id as string);

    if (!user)
      return res.status(404).json({
        message: "user not found with this id",
      });

    return res.status(200).json({ user });
  },
);

const deleteUserById: RequestHandler = asynHandler(
  async (req: Request, res: Response) => {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        error: "User id not provided",
      });
    }

    const user = await UserService.deleteUserById(user_id as string);

    if (!user) {
      return res.status(404).json({
        message: "User with this id is not present",
      });
    }

    return res.status(200).json({
      message: "user deleted successfully",
    });
  },
);

const updateUserById: RequestHandler = asynHandler(
  async (req: Request, res: Response) => {
    const { user_id } = req.params;
    if (!user_id) {
      return res.status(400).json({
        error: "user id is not provided",
      });
    }

    const userData = req.body;
    //for empty patch object
    if (Object.keys(userData).length === 0) {
      return res.status(200).json({
        message: "User updated",
      });
    }

    const user = await UserService.updateUserById(user_id as string, userData);

    if (!user) {
      return res.status(404).json({
        error: "User with this is not present",
      });
    }

    return res.status(200).json({
      message: "user updated",
      user,
    });
  },
);

const getUserStatsById: RequestHandler = asynHandler(
  async (req: Request, res: Response) => {
    const { user_id } = req.params;

    const data = await UserService.getUserStatsById(user_id as string);

    return res.status(200).json({
      data,
    });
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
