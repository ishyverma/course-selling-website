import express from "express";
import bcrypt from "bcrypt"
import userRouter  from "./routes/user";
import adminRouter from "./routes/admin"
import mongoose from "mongoose";
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);

;(async () => {
    await mongoose.connect(`${process.env.MONGO_URL}/100xDevs`)
    console.log("🌞 Server connected")
})()

app.listen(3000)