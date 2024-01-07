import { EntitySchema } from "typeorm"

export const CategoryChildEntity = new EntitySchema({
    name: "categoryChild",
    columns: {
        category_child_id: {
            type: Number,
            primary: true,
            generated: true,
        },
        category_child_name: {
            type: String,
        },
        category_child_icon: {
            type: String,
        },
       
    },
    relations: {
        category: {
            type: "many-to-one",
            target: "category",
        },
        user: {
            type: "many-to-one",
            target: "user", 
        },
        transaction: {
            type: "one-to-many",
            target: "transaction", 
        },
    },
})