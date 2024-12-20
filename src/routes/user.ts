import { Request, Response, Router } from "express";
import bcrpyt from "bcrypt"
import jwt from "jsonwebtoken"
import { z } from "zod";
import { User } from "../db/user";
import { userMiddleware } from "../middleware/user";
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
    const isExistedUser = await User.findOne({ email })
    if (isExistedUser) {
        res.status(404).json({
            message: "User already exists"
        })
    } else {
        const hashedPassword = await bcrpyt.hash(password, 5)
        try {
            const user = await User.create({ firstName, lastName, email, password: hashedPassword })
            res.json({
                message: "User created successfully"
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
    const user = await User.findOne({ email })
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

router.get("/preview", async (req, res) => {
    const courses = await Course.find({}).select("-updatedBy -createdBy")
    res.json({ courses })
})

router.use(userMiddleware)

const purchaseCourse = z.object({
    courseId: z.string()
})

router.post("/purchase", async (req, res) => {
    // @ts-ignore
    const userId = req.userData
    const purchaseCourseBody = purchaseCourse.safeParse(req.body)
    const { courseId } = req.body
    if (!purchaseCourseBody.success) {
        res.status(404).json({
            message: purchaseCourseBody.error.issues[0].message
        })
    } else {
        try {
            const isCourse = await Course.findOne({ _id: courseId })
            if (!isCourse) {
                res.status(404).json({
                    message: "No course existed"
                })
            } else {
                const user = await User.findByIdAndUpdate(userId, { $push: { courses: courseId  }})
                if (!user) {
                    res.status(404).json({
                        message: "User doesnt exists"
                    })
                } else {
                    res.json({
                        message: "Purchased successfully"
                    })
                }
            }
        } catch (err) {
            res.json({
                err
            })
        }   
    }
})

router.get("/purchases", async (req, res) => {
    // @ts-ignore
    const userId = req.userData
    try {
        const user = await User.findById(userId).populate("courses", "title description price imageUrl")
        if (!user) {
            res.status(404).json({
                message: "User not exists"
            })
        } else {
            res.json({
                courses: user.courses
            })
        }
    } catch (err) {
        res.status(404).json({
            err
        })
    }
})

export default router