import { Request, Response, RequestHandler } from "express";
import { UserService } from "../../container";
import { createUserSchema, updateUserSchema } from "./user.schema";

const getAllUsers: RequestHandler = async (req: Request, res: Response) => {
  const results = await UserService.getAllUsers();

  return res.json({ results });
};

const createUser: RequestHandler = async (req: Request, res: Response) => {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const user = await UserService.createUser(result.data);

  return res.status(201).json({ user });
};

const getUserById: RequestHandler = async (req: Request, res: Response) => {
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
};

const deleteUserById: RequestHandler = async (req: Request, res: Response) => {
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
};

const updateUserById: RequestHandler = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  if (!user_id) {
    return res.status(400).json({
      error: "user id is not provided",
    });
  }
  const result = updateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  //for empty patch object
  if (Object.keys(result.data).length === 0) {
    return res.status(200).json({
      message: "User updated",
    });
  }

  const user = await UserService.updateUserById(user_id as string, result.data);

  if (!user) {
    return res.status(404).json({
      error: "User with this is not present",
    });
  }

  return res.status(200).json({
    message: "user updated",
    user,
  });
};

export { getAllUsers, createUser, getUserById, deleteUserById, updateUserById };
