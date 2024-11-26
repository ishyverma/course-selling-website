import { Request, Response, Router } from "express";
import bcrpyt from "bcrypt"
import jwt from "jsonwebtoken"
import { z } from "zod";
import { Admin } from "../db/admin";

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


export default router