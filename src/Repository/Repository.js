import { myDataSource } from "../data-source.js"
import { CategoryChildEntity } from "../entity/Category-child.js"
import { CategoryEntity } from "../entity/Category.js"
import { TransactionEntity } from "../entity/Transactions.js"
import { UserEntity } from "../entity/User.js"
import { WalletEntity } from "../entity/Wallet.js"


export const UserRepository = myDataSource.getRepository(UserEntity)
export const WalletRepository = myDataSource.getRepository(WalletEntity)
export const TransactionRepository = myDataSource.getRepository(TransactionEntity)
export const CategoryRepository = myDataSource.getRepository(CategoryEntity)
export const CategoryChildRepository = myDataSource.getRepository(CategoryChildEntity)