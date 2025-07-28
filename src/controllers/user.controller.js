import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generateToken } from "../utils/generateToken.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password ,role} = req.body;
  if (!fullName || !email || !password) {
    throw new ApiError(400, "Please Provide all the required fields");
  }
  const existingUser = await User.findOne({ $or: [{ email }] });
  if (existingUser) {
    throw new ApiError(400, "User with this Email ID already exists");
  }
  //Case 1: If multer was used with `upload.single("profilePicture")`.The uploaded file is available directly in `req.file`
if (req.file) {
  profilePictureLocalPath = req.file.path;
} 
//Case 2: If multer was used with `upload.fields([{ name: "profilePicture", maxCount: 1 }])`The uploaded files will be in `req.files.profilePicture`, which is an array
else if (
  req.files &&
  Array.isArray(req.files.profilePicture) &&
  req.files.profilePicture.length > 0
) {
  // Get the path of the first uploaded profile picture
  profilePictureLocalPath = req.files.profilePicture[0].path;
}
  const profilePicture = await uploadOnCloudinary(profilePictureLocalPath);

  const newUser = await User.create({
    fullName,
    email,
    password,
    role,
    profilePicture: profilePicture?.url,
    yourTask: [],
  });
  const { refreshToken, accessToken } = await generateToken(newUser._id);
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
   throw new ApiError(404, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(201, "User registered successfully.", {
        user: createdUser,
        accessToken,
        refreshToken,
      })
    );
});


export {registerUser}