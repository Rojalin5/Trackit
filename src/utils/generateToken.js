import { User } from "../models/user.models.js";
import { ApiError } from "./apiError.js";

const generateToken = async(userID)  =>{
    try {
        const user = await User.findById(userID)
        if(!user){
            throw new ApiError(404,"User not found!")
        }
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}

    } catch (error) {
        console.log("Something went wrong",error)
        throw new ApiError(500,"Something went wrong while generating token")
    }
}