import mongoose from "mongoose";
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const userSchema = new Schema({
    firstName: String,
    lastName: String, 
    email: {type: String, unique: true}, 
    password: String
})

export const User = mongoose.model('User', userSchema)