import { DataSource } from "typeorm"

//! Datasource giữ thiết lập kết nối đến cơ sở dữ liệu và thiết lập kết nối
//! có thể có nhiều DataSource trong một ứng dụng



export const myDataSource = new DataSource({
    type: "mysql",
    host: "moneylover-mysql.c2xapt06lwox.ap-southeast-2.rds.amazonaws.com",
    port: 3306,
    username: "admin",
    password: "Db.co0l3595",
    database: "moneylover",
    entities: ["src/entity/*.js"],
    logging: false,
    synchronize: true,
})