import express from "express";
import { createCategory } from "../controller/category.controller.js";

const categoryRouter = express.Router();

//! CRUD
categoryRouter.post('', createCategory)

export default categoryRouter;
