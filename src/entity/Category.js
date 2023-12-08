import { EntitySchema } from "typeorm"

export const CategoryEntity = new EntitySchema({
    name: "category",
    columns: {
        category_id: {
            type: Number,
            primary: true,
            generated: true,
        },
        category_name: {
            type: String,
        },
        category_icon: {
            type: String,
        },
        category_type: {
            type: 'enum',
            enum: ['income', 'expense', 'loan'],
            default: 'expense', // Giá trị mặc định nếu không được xác định là:  Chi phí
        },
    },
    relations: {
        transaction: {
            type: "one-to-many",
            target: "transaction", // CategoryEntity
        },
        user: {
            type: "many-to-one",
            target: "user", // CategoryEntity
        },
    },
})