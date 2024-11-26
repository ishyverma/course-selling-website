import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1]
    try {
        const verifyToken = jwt.verify(token as string, process.env.JWT_SECRET as string)
        // @ts-ignore
        req.userData = verifyToken._id
        next()
    } catch (err) {
        res.json({
            message: "You are not signed in"
        })
    }
}