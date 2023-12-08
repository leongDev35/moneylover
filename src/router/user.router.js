import express from "express";
import { confirmEmail, createUser, findUser, login, logout, sentNewPassword, updatePassword, updateUser } from "../controller/user.controller.js";

const userRouter = express.Router();

userRouter.get('', findUser)
//! CRUD
userRouter.post('', createUser)
// userRouter.post('/check', checkUserExisted)
// userRouter.get('', getUsers)
// userRouter.get('/info/:userId', getUser)
userRouter.put('/info/:userId', updateUser)
// userRouter.delete('/delete/:userId', deleteUser);
//! email

userRouter.get('/confirmEmail/:token', confirmEmail)

//! login logout
userRouter.post('/login', login)
userRouter.get('/logout', logout);


//! password
userRouter.put('/password/:userId', updatePassword);
userRouter.post('/sentNewPassword', sentNewPassword);
export default userRouter;
