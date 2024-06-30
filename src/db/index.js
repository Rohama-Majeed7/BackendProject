import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";
dotenv.config({
    path:'./env'
})
const ConnectDB =  async() =>{
    try {
      const ConnectionInstance = await mongoose.connect(`${process.env.MONGOO_URL}/${DB_NAME}`)
      console.log(`MongoDB Connected: ${ConnectionInstance.connection.host}`)
    } catch (error) {
        console.log(`Mongoose connection Failed ${error}`);
        process.exit(1)
    }
}

export default ConnectDB;