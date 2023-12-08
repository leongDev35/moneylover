import { EntitySchema } from "typeorm"

export const BudgetEntity = new EntitySchema({
    name: "budget",
    columns: {
        budget_id: {
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
        },
        created_at: {
            type: 'timestamp',
            createDate: true,
        },

    },
    relations: {
        category: {
            type: "many-to-one",
            target: "category", 
        },
        wallet: {
            type: "many-to-one",
            target: "wallet", 
        },
        user: {
            type: "many-to-one",
            target: "user", 
        },
    },
})