import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/APIError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.service.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const generateAccessAndRefereshToken = async(userId)=>{
    try {
        // User is a mongoose one , user is the created one for which we have defined our own methods
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating error")
    }
}




const registerUser=asyncHandler(async(req,res)=>{
  // this is the basic logic we ususally follows:-
  // get user details from frontend
  // validate - not empty
  // check already exsists user {username or email}
  // check images , check for avatar
  // upload to cloudinary,avatar
  //create user object - db entry
  // remove password and refresh token
  // check for user 
  // return res or error :)

    const{fullname,email,username,password}=req.body
    console.log(email,fullname);
    // check for empty inputs can use .some() for this 
if(fullname==="" || email==="" || username==="" || password===""){
    throw new ApiError(400,"All fields are required")
}

// already exsist

const exsistUser=await User.findOne({
   $or: [{email},{username}] // $or: means check for all the entries in array if any one found so $ help us apply operators

})

if(exsistUser){
    throw new ApiError(409,"User with email or username already exsist")
}

// images,avatar

const avatarLocalPath=req.files?.avatar[0]?.path
const coverImageLocalPath=req.files?.coverImage[0]?.path

if(!avatarLocalPath) throw new ApiError(400,"Avatar is required")

const avatar=await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(!avatar) throw new ApiError(400,"Avatar is required")

   const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url||" ",
        email,
        password,
        username:username.toLowerCase()
    })

   const check = await User.findById(user._id).select(
    "-password -refereshToken"
   )

    if(!check) throw new ApiError(500,"some error occured while creating user")  
        
        return res.status(201).json(
            new ApiResponse(200,check,"User Registered Successfully")
        )

})

const loginUser = asyncHandler(async(req,res)=>{
    // req body ->data
    //username or email
    // find the user
    //password check
    // access and refresh token
    // send cookie
    const{email,username,password} = req.body;
    if(!username || !email) {
        throw new ApiError(400,"username or email is missing")
    }

   const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user) throw new ApiError(404,"User dont exsist");

   const validPass = await user.isPasswordCorrect(password)
   if(!validPass) throw new ApiError(401,"Invalid User")

  const {accessToken,refreshToken} = await generateAccessAndRefereshToken(user.__id);
})

export {registerUser}