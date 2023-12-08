import { EntitySchema } from "typeorm"

export const TransactionEntity = new EntitySchema({
    name: "transaction",
    columns: {
        transaction_id: {
            type: Number,
            primary: true,
            generated: true,
        },
        transaction_name: {
            type: String,
        },
        total: {
            type: Number,
        },
        transaction_date: {
            type: 'timestamp',
        },
        amount: {
            type: Number,
        },
        note: {
            type: String,
        },
        transaction_type: {
            type: 'enum',
            enum: ['income', 'expense'],
            default: 'expense', // Giá trị mặc định nếu không được xác định là:  Chi phí
        }

    },
    relations: {
        wallet: {
            type: "many-to-one",
            target: "wallet", // CategoryEntity
        },
        user: {
            type: "many-to-one",
            target: "user", // CategoryEntity
        },
        category: {
            type: "many-to-one",
            target: "category", // CategoryEntity
        },
        categoryChild: {
            type: "many-to-one",
            target: "categoryChild", // CategoryEntity
        }
    }
})