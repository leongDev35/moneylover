import express from "express";
import { changeTotalWallet, checkWalletName, createWallet, getWallet, getWWalletDetail } from "../controller/wallet.controller.js";

const walletRouter = express.Router();

//! CRUD
walletRouter.post('', createWallet)
walletRouter.post('/check', checkWalletName)
walletRouter.get('', getWallet)
walletRouter.get('/:walletId', getWWalletDetail)
walletRouter.put('/:walletId', changeTotalWallet)

export default walletRouter;
