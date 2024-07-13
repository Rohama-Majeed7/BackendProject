import { ApiErrors } from "../utils/ApiErrors.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import uploadOnCloud from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) =>{
  const user = await User.findById(userId)
const accessToken = await user.generateAccessToken()
const refreshToken = await user.generateRefreshToken()

user.refreshToken = refreshToken
await user.save({ValidateBeforeSave:false})

return {accessToken,refreshToken}

}
const registerUser = asyncHandler(async (req, res) => {
  // frontend details
  const { fullName, email, password, username } = req.body;
  console.log(fullName, email, password, username);

  // check empty validation
  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiErrors(400, "All Fields are required");
  }

  // check user already exists
  const userExist = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (userExist) {
    throw new ApiErrors(409, "User already exists");
  }

  // check for images
  let avatarImageLocalPath
  let coverImageLocalPath 
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path
  }
  if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
    avatarImageLocalPath = req.files.avatar[0].path
  }
// console.log(avatarImageLocalPath);
  if (!avatarImageLocalPath) {
    throw new ApiErrors(400, "Avatar image is required");
  }

  // upload on cloudinary
  const avatar = await uploadOnCloud(avatarImageLocalPath);
  const coverImage = await uploadOnCloud(coverImageLocalPath);
  console.log(avatar);

  // user creation
  const user = await User.create({
    fullName,
    avatar: avatar?.url || "",
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // user creation checking
  if (!createdUser) {
    throw new ApiErrors(500, "Something went wrong with the server");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async(req,res) =>{
  // data from req.body
  // username or email
  // find the user
  // check password
  // create access and refresh token
  // 
const {email,username,password} = req.body;
if(!email || !username){
  throw new ApiErrors(404,"username or email is required")
}

const user = await User.findOne(
  {
    $or:[{username},{email}]
  }
)
if(!user){
  throw new ApiErrors(404,"user does not exists")
}
const isPasswordValid = await user.isPasswordCorrect(password)
if(!isPasswordValid){
  throw new ApiErrors(404,"password is incorrect")
}
const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)
const loggedInUser = await user.findById(user._id).select("-password -refreshToken")
const options = {
  httpOnly :true,
  secure: true
}

return res.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
  new ApiResponse(
    200,
    {
      user:loggedInUser,accessToken,refreshToken
    },
    "user logged in successfully"
  )
)

})

const logoutUser = asyncHandler(async(req,res) =>{
User.findByIdAndDelete(
  req.user_id,
  {
    $set:{
      refreshToken :undefined
    }
  },
  {
    new:true
  }
)
const options = {
  httpOnly :true,
  secure: true
}
return res.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(
  new ApiResponse(200,{},"user logged out successfully")
)
})

export {registerUser,loginUser,logoutUser};
