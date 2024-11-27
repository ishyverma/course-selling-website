import { Request, Response, Router } from "express";
import bcrpyt from "bcrypt"
import jwt from "jsonwebtoken"
import { z } from "zod";
import { Admin } from "../db/admin";
import { adminMiddleware } from "../middleware/admin";
import { Course } from "../db/course";

const router = Router()

const signUpBody = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    password: z.string().min(5, "Password must contain at least 5 character").max(12, "Password must contain at most 12 character")
})

const signInBody = z.object({
    email: z.string().email(),
    password: z.string()
})

router.post('/signup', async (req: Request, res: Response) => {
    const correctSignUp = signUpBody.safeParse(req.body)
    if (!correctSignUp.success) {
        res.status(404).json({
            message: correctSignUp.error.issues[0].message
        })
    }
    const { firstName, lastName, email, password } = req.body
    const isExistedUser = await Admin.findOne({ email })
    if (isExistedUser) {
        res.status(404).json({
            message: "Admin already exists"
        })
    } else {
        const hashedPassword = await bcrpyt.hash(password, 5)
        try {
            const user = await Admin.create({ firstName, lastName, email, password: hashedPassword })
            res.json({
                message: "Admin created successfully"
            })
        } catch (err) {
            res.status(404).json({
                err
            })
        }
    }
})

router.post("/signin", async (req: Request, res: Response) => {
    const correctSignIn = signInBody.safeParse(req.body)
    if (!correctSignIn.success) {
        res.status(404).json({
            message: correctSignIn.error.issues[0].message
        })
    }
    const { email, password } = req.body
    const user = await Admin.findOne({ email })
    if (!user) {
        res.status(404).json({
            message: "No user exists"
        })
    } else {
        const checkPassword = await bcrpyt.compare(password, user?.password as string)
        if (checkPassword) {
            const token = jwt.sign({ _id: user?._id }, process.env.JWT_SECRET as string)
            res.json({ token })
        } else {
            res.status(404).json({
                message: "Password is incorrect"
            })
        }
    }
})

router.use(adminMiddleware)

const makeCourse = z.object({
    title: z.string(),
    description: z.string(),
    price: z.number(),
    imageUrl: z.string()
})

router.post("/course", async (req, res) => {
    const makeCourseBody = makeCourse.safeParse(req.body)
    if (!makeCourseBody.success) {
        res.status(404).json({
            message: makeCourseBody.error.issues[0].message
        })
    } else {
        // @ts-ignore
        const adminData = req.adminData
        const { title, description, price, imageUrl } = req.body
        try {
            const isCourseExists = await Course.findOne({ title, description })
            if (isCourseExists) {
                res.status(404).json({
                    message: "Course already exists"
                })
            } else {
                const course = (await Course.create({ title, userId: adminData, description, price, imageUrl, createdBy: adminData }))
                res.json({
                    message: "Course created successfully"
                })
            }
        } catch (err) {
            res.status(404).json({
                err
            })
        }
    }

})

const updateCourseInfo = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    imageUrl: z.string().optional(),
    courseId: z.string().optional(),
    updatedBy: z.string().optional()
})

router.put("/course", async (req, res) => {
    const updateCourse = updateCourseInfo.safeParse(req.body)
    if (!updateCourse.success) {
        res.status(404).json({
            message: updateCourse.error.issues[0].message
        })
    } else {
        const { title, description, price, imageUrl, courseId } = req.body
        const isCourse = await Course.findOne({ courseId })
        if (!isCourse) {
            res.status(404).json({
                message: "Course not exists"
            })
        } else {
            try {
                // @ts-ignore
                const adminData = req.adminData
                const updatedCourse = await Course.updateOne({ courseId }, { title, description, price, imageUrl, updatedBy: adminData })
                res.json({
                    message: "Course is updated"
                })
            } catch (err) {
                res.json({
                    err
                })
            }
        }
    }
})

router.get("/course/bulk", async (req, res) => {
    // @ts-ignore
    const adminData = req.adminData
    try {
        const course = await Course.find({ createdBy: adminData }).select("-updatedBy")
        res.json({
            course
        })
    } catch (err) {
        res.status(404).json({
            err
        })
    }
})

export default router