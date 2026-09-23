import express from "express";
import { getAllUsers } from "../../controllers/users";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);


export { userRouter };
