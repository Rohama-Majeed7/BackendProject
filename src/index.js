import { app } from "./app.js";
import ConnectDB from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({
    path:'./env'
})
ConnectDB().then(()=>{
    app.listen(process.env.PORT || 8000 ,() =>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
    console.log("DB Connected");
}).catch((err)=>{
    console.log("DB Connection Failed:",err);
})



















// we can use ifi and function then call it 
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGOO_URL}/${DB_NAME}`);
//     app.on("error",(error)=>{
//   console.log(error);
//     })
//     app.listen(process.env.PORT,() =>{
//         console.log(`Server is running on port ${process.env.PORT}`);
//     })
//   } catch (error) {
//     console.log("error:", error);
//   }
// })();
