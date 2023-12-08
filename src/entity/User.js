import { EntitySchema } from "typeorm"

export const UserEntity = new EntitySchema({
    name: "user",
    columns: {
        user_id: {
            type: Number,
            primary: true,
            generated: true,
            nullable: false,
        },
        username: {
            type: String,
            length: 255,
            nullable: false,
            isUnique: true
        },
        fullName: {
            type: String,
            length: 255,
            nullable: false,
        },
        tokenAuthEmail: {
            type: String,
            length: 255,
        },
        authEmail: {
            type: Boolean,
            default: false
        },
        email: {
            type: String,
            
        },
        password: {
            type: String,
            nullable: false,
        },
        unit: {
            type: String,
            nullable: false,
        },
        balance: { //! tổng số dư toàn bộ các ví của user
            type: Number,
            nullable: false,
        },
        created_at: {
            type: 'timestamp',
            createDate: true,
        },
    },
    relations: {
        wallet: {
            type: "one-to-many",
            target: "wallet", // CategoryEntity
        },
    },
})