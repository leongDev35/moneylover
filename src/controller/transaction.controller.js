import { CategoryRepository, TransactionRepository, UserRepository, WalletRepository } from "../Repository/Repository.js";
import { CategoryChildEntity } from "../entity/Category-child.js";
import { CategoryEntity } from "../entity/Category.js";
import { WalletEntity } from "../entity/Wallet.js";
import { convertDay } from "./fill.controller.js";

export async function createTransaction(req, res) {
    try {
        

        let transaction = {
            amount: req.body.amount,
            transaction_date: `${req.body.date}T01:00:00.000Z`,
            note: req.body.note,
            user: {
                user_id: req.body.userId,
            },
            wallet: {
                wallet_id: req.body.walletId,
            },
            category: {
                category_id: req.body.categoryId,
            },
            categoryChild: {
                category_child_id: req.body.categoryChildId,
            },
        }
        const categoryCheck = await CategoryRepository.find({
            where: {
                // user: req.body.userId,
                category_id: req.body.categoryId,

            },
        });
        const walletCheck = await WalletRepository.find({
            where: {
                wallet_id: req.body.walletId
            },
        });
        const user = await await UserRepository.find({
            where: {
                user_id: req.body.userId,
            },
        });
        console.log(transaction);
        //! nếu là giao dịch Chi
        if (categoryCheck[0].category_type == 'expense') {
            transaction = {...transaction, amount: -parseInt(req.body.amount)}
        await TransactionRepository.save(transaction);

            //! trừ tổng của ví trước
            walletCheck[0].total = walletCheck[0].total - parseInt(req.body.amount);

            WalletRepository
                .save(walletCheck[0])
                .then((savedWallet) => {
                    // console.log('wallet saved with new total:', savedWallet);
                })
                .catch((error) => {
                    console.error('Error saving wallet with new total:', error);
                });
            //! trừ tổng của user
            user[0].balance = user[0].balance - parseInt(req.body.amount);

            UserRepository
                .save(user[0])
                .then((savedUser) => {
                    // console.log('User saved with new total:', savedUser);
                })
                .catch((error) => {
                    console.error('Error saving user with new total:', error);
                });
        } else if (categoryCheck[0].category_type == 'income') {
             //! cộng tổng của ví trước
             walletCheck[0].total = walletCheck[0].total + parseInt(req.body.amount);

             WalletRepository
                 .save(walletCheck[0])
                 .then((savedWallet) => {
                    //  console.log('wallet saved with new total:', savedWallet);
                 })
                 .catch((error) => {
                     console.error('Error saving wallet with new total:', error);
                 });
             //! cộng tổng của user
             user[0].balance = user[0].balance + parseInt(req.body.amount);
 
             UserRepository
                 .save(user[0])
                 .then((savedUser) => {
                    //  console.log('User saved with new total:', savedUser);
                 })
                 .catch((error) => {
                     console.error('Error saving user with new total:', error);
                 });
        } else {
            console.log("Đây là giao dịch nợ");

        }
       

        return res.json({ message: 'Tạo thành công giao dịch' });

    } catch (error) {
        console.log(error);
        return res.json({ message: 'Có lỗi xảy ra, vui lòng thử lại!' });
    }
}
export async function getDetailtTransaction(req, res) {
    try {
        console.log(req.params.idTrans);

        const trans = await TransactionRepository
        .createQueryBuilder()
        .select([
            'category_child.category_child_name',
            'category_child.category_child_icon',
            'category.category_name',
            'category.category_type',
            'category.category_icon',
            'transaction.categoryCategoryId',
            'transaction.transaction_id',
            'transaction.transaction_date',
            'transaction.amount',
            'wallet.wallet_name',
            'wallet.wallet_icon',
        ])
        .innerJoin(CategoryEntity, 'category', 'transaction.categoryCategoryId = category.category_id')
        .leftJoin(CategoryChildEntity, 'category_child', 'transaction.categoryChildCategoryChildId = category_child.category_child_id')
        .leftJoin(WalletEntity, 'wallet', 'transaction.walletWalletId = wallet.wallet_id')
        .andWhere("transaction.transaction_id = :transaction_id", { transaction_id: req.params.idTrans })
        .getRawOne();

        trans.transaction_transaction_date = convertDay(trans.transaction_transaction_date)

        return res.json(trans);

    } catch (error) {
        console.log(error);
        return res.json({ message: 'Có lỗi xảy ra, vui lòng thử lại!' });
    }
}