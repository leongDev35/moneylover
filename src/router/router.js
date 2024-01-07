import categoryRouter from "./category.router.js";
import fillRouter from "./fill.router.js";
import transactionRouter from "./transaction.router.js";
import userRouter from "./user.router.js";
import walletRouter from "./wallet.router.js";

const router = (app) => {
    app.use('/users', userRouter);
    app.use('/wallet', walletRouter);
    app.use('/transaction', transactionRouter);
    app.use('/category', categoryRouter);
    app.use('/fill', fillRouter);
}
export default router;