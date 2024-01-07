import express from "express";
import { createCategory, getCategoryOfUser } from "../controller/category.controller.js";

const categoryRouter = express.Router();

//! CRUD
categoryRouter.post('', createCategory)
categoryRouter.get('/:userId', getCategoryOfUser)

export default categoryRouter;
