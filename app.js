//! Dự án Money Lover
//! Người tạo: Leo Ng
//! Ngày tạo: 1/12/2023

//! Thư viện 
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createServer } from "http";
import 'dotenv/config'
//! source Database
import { myDataSource } from './src/data-source.js';
import router from './src/router/router.js';



myDataSource.initialize()
.then(() => {
    console.log("Data Source has been initialized!")
})
.catch((err) => {
    console.error("Error during Data Source initialization:", err)
})


const app = express();
const httpServer = createServer(app);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());
router(app);




const port = process.env.PORT || 3050;
httpServer.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});