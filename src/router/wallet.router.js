import express from "express";
import { createWallet, getWWallet, getWWalletDetail } from "../controller/wallet.controller.js";

const walletRouter = express.Router();

//! CRUD
walletRouter.post('', createWallet)
walletRouter.get('', getWWallet)
walletRouter.get('/:walletId', getWWalletDetail)

export default walletRouter;
