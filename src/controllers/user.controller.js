import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import {
  uploadOnCloudinary,
  extractpublicIDFromUrl,
  deleteFileFromCloudinary,
} from "../utils/cloudinary.js";
import { generateToken } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

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
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
    expires: new Date(0),
  };
  return res
    .status(200)
    .cookie("accessToken", "", options)
    .cookie("refreshToken", "", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});
const updateUserDetails = asyncHandler(async (req, res) => {
  const userID = req.user._id;
  const { fullName, email, role } = req.body;
  if (!fullName && !email && !role) {
    throw new ApiError(400, "Please provide at least one field to update");
  }
  const user = await User.findByIdAndUpdate(
    userID,
    {
      $set: {
        fullName,
        email,
        role,
      },
    },
    { new: true }
  ).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Details Updated Successfully"));
});

const currentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User detail Fetched Successfully"));
});
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "Please provide all the required fields");
  }
  const isPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(400, "Incorrect current password.Please try again.");
  }
  if (currentPassword == newPassword) {
    throw new ApiError(
      400,
      "Please Add Differnet Password from Your previous Password!"
    );
  }
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New Password and Confirm Password Must be same!");
  }
  user.password = newPassword;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password CHnaged Successfully."));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request!");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken?._id);
  if (!user) {
    throw new ApiError(401, "Invalid refresh token. User not found.");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or already used.");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  const { accessToken, refreshToken } = await generateToken(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {}, "Access Token Generated Successfully."));
});

const updateProfilePicture = asyncHandler(async (req, res) => {
  const profilePicturePath = req.file?.path;
  if (!profilePicturePath) {
    throw new ApiError(400, "You haven't set any profile picture yet!");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  if (
    user.profilePicture &&
    user.profilePicture !== process.env.DEFAULT_PROFILE_PICTURE
  ) {
    const publicID = extractpublicIDFromUrl(user.profilePicture);
    if (publicID) {
      await deleteFileFromCloudinary(publicID);
    }
    const newProfilePicture = await uploadOnCloudinary(profilePicturePath);
    if (!newProfilePicture.url) {
      throw new ApiError(
        500,
        "Something Went Wrong While Uploading Profilepicture."
      );
    }
    const updateUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          profilePicture: newProfilePicture.url,
        },
      },
      { new: true }
    ).select("-password");
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updateUser,
          "Profile Picture Changed Successfully."
        )
      );
  } else {
    throw new ApiError(400, {}, "No custom profile picture found to update.");
  }
});

const deleteProfilePicture = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  if (
    user.profilePicture &&
    user.profilePicture !== process.env.DEFAULT_PROFILE_PICTURE
  ) {
    const publicID = extractpublicIDFromUrl(user.profilePicture);
    if (publicID) {
      await deleteFileFromCloudinary(publicID);
    }
    const updateUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          profilePicture: process.env.DEFAULT_PROFILE_PICTURE,
        },
      },
      { new: true }
    ).select("-password");
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updateUser,
          "Profile Picture Deleted Successfully."
        )
      );
  } else {
    throw new ApiError(400, {}, "No custom profile picture found to delete.");
  }
});

const deleteUserProfile = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  if (!password) {
    throw new ApiError(
      400,
      "Please confirm your password to delete your profile."
    );
  }

  const isValid = await user.isPasswordCorrect(password);
  if (!isValid) {
    throw new ApiError(401, "Incorrect password. Cannot delete profile.");
  }
  if (
    user.profilePicture &&
    user.profilePicture !== process.env.DEFAULT_PROFILE_PICTURE
  ) {
    const publicID = extractpublicIDFromUrl(user.profilePicture);
    if (publicID) {
      await deleteFileFromCloudinary(publicID);
    }
  }
  await User.findByIdAndDelete(req.user._id);
  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(
      new ApiResponse(200, {}, "Your Profile has been deleted successfully.")
    );
});
export {
  registerUser,
  loginUser,
  logoutUser,
  updateUserDetails,
  currentUser,
  changePassword,
  refreshAccessToken,
  updateProfilePicture,
  deleteProfilePicture,
  deleteUserProfile,
};
