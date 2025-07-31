import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generateToken } from "../utils/generateToken.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;
  if (!fullName || !email || !password) {
    throw new ApiError(400, "Please Provide all the required fields");
  }
  const existingUser = await User.findOne({ $or: [{ email }] });
  if (existingUser) {
    throw new ApiError(400, "User with this Email ID already exists");
  }
  let profilePictureLocalPath = null;
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
  });
  const { refreshToken, accessToken } = await generateToken(newUser._id);
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(404, "Something went wrong while registering the user");
  }
  return res.status(201).json(
    new ApiResponse(201, "User registered successfully.", {
      user: createdUser,
      accessToken,
      refreshToken,
    })
  );
});
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(404, "Both fields are required.");
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found with this email.");
  }
  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new ApiError(404, "Invalid Password.Try again");
  }
  const userWithoutPassword = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const { refreshToken, accessToken } = await generateToken(user._id);
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User logged in Suceessfully.", {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      })
    );
});

export { registerUser,loginUser};
