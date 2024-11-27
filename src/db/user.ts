import mongoose, { modelNames } from "mongoose";
import { Course } from "./course";
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const userSchema = new Schema({
    firstName: String,
    lastName: String, 
    email: {type: String, unique: true}, 
    password: String,
    courses: [{ type: Schema.Types.ObjectId, ref: Course }]
})

export const User = mongoose.model('User', userSchema)