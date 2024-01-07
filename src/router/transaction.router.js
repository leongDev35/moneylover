import express from "express";
import { createTransaction, getDetailtTransaction } from "../controller/transaction.controller.js";

const transactionRouter = express.Router();

//! CRUD
transactionRouter.post('', createTransaction)
transactionRouter.get('/:idTrans', getDetailtTransaction)

export default transactionRouter;
