import { EntitySchema } from "typeorm"

export const TransactionEntity = new EntitySchema({
    name: "transaction",
    columns: {
        transaction_id: {
            type: Number,
            primary: true,
            generated: true,
        },
       
        transaction_date: {
            type: Date,
        },
        amount: {
            type: Number,
        },
        note: {
            type: String,
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
            nullable: true
        }
    }
})