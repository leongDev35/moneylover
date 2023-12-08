import express from "express";
import { createTransaction } from "../controller/transaction.controller.js";

const transactionRouter = express.Router();

//! CRUD
transactionRouter.post('', createTransaction)

export default transactionRouter;
