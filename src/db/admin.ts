import mongoose from "mongoose";
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const adminSchema = new Schema({
    firstName: String,
    lastName: String, 
    email: {type: String, unique: true}, 
    password: String
})

export const Admin = mongoose.model('Admin', adminSchema)