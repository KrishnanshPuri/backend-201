import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIError.js";
import jwt from "jsonwebtoken"
export const verifyJWT = asyncHandler((req,res,next)=>{
    const token = req.cokkies?.accessToken||req.header("Authorization")?.replace("Bearer ","")
    
})

