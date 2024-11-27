import mongoose from "mongoose";
import { Admin } from "./admin";
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const courseSchema = new Schema({
    title: String,
    description: String, 
    price: Number,
    imageUrl: String,
    courseId: String,
    createdBy: { type: Schema.Types.ObjectId, ref: Admin },
    updatedBy: [{ type: Schema.Types.ObjectId, ref: Admin }]
})

export const Course = mongoose.model('Course', courseSchema)