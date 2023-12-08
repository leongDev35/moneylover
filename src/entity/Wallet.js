import { EntitySchema } from "typeorm"

export const WalletEntity = new EntitySchema({
    name: "wallet",
    columns: {
        wallet_id: {
            type: Number,
            primary: true,
            generated: true,
            nullable: false,
        },
        wallet_name: {
            type: String,
            length: 255,
            nullable: false,
        },
        total: {
            type: Number,
        },
        wallet_icon: {
            type: String,
            length: 255,
        },
        created_at: {
            type: 'timestamp',
            createDate: true,
        },
    },
    
    relations: {
        user: {
            type: "many-to-one",
            target: "user", // CategoryEntity
        },
        transaction: {
            type: "one-to-many",
            target: "transaction", // CategoryEntity
        },
    },
})