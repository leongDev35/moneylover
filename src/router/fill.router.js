import express from "express";
import { fillDay, get20RecentMonth, getCategoryExpenseInMonth, getCategoryIncomeInMonth, getNetIncomeInMonth, getTransactionFillpage, getTransactionInMonth, getTransactionInRange } from "../controller/fill.controller.js";

const fillRouter = express.Router();

//! CRUD
fillRouter.get('', fillDay)
fillRouter.get('/month/:userId-:month', getTransactionInMonth)
fillRouter.get('/20month/:userId', get20RecentMonth)
fillRouter.get('/month/:userId-:month/range/:range/total/:expense-:income', getTransactionInRange)
fillRouter.get('/netIncome/month/:userId-:month/', getNetIncomeInMonth )
fillRouter.get('/category/income/:userId-:month/', getCategoryIncomeInMonth )
fillRouter.get('/category/expense/:userId-:month/', getCategoryExpenseInMonth )

fillRouter.get('/fillPage/:userId', getTransactionFillpage)



export default fillRouter;
