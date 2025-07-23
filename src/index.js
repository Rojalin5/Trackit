import dotenv from "dotenv"
import connectDB from "../src/db/index.js"
import { app } from "../src/app.js"
dotenv.config(
    {
        path:"./.env"
    }
)

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 5000,()=>{
        console.log(`Server is Running at ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("Failed to connect to MongoDB. Server not started.",error)
})