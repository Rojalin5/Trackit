import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import {
  changePassword,
  currentUser,
  deleteProfilePicture,
  deleteUserProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateProfilePicture,
  updateUserDetails,
} from "../controllers/user.controller.js";
import { authenticateUser } from "../middlewares/authentication.middlewares.js";
const router = Router();

router.route("/register-user").post(
  upload.fields([
    {
      name: "profilePicture",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login-user").post(loginUser);
router.route("/logout-user").post(authenticateUser, logoutUser);
router.route("/update-user-details").patch(authenticateUser,updateUserDetails)
router.route("/getuser").get(authenticateUser,currentUser)
router.route("/change-password").patch(authenticateUser,changePassword)
router.route("/refresh-token").post(authenticateUser,refreshAccessToken)
router.route("/profile-picture-update").patch(authenticateUser,upload.single("profilePicture"),updateProfilePicture)
router.route("/delete-profile-picture").delete(authenticateUser,deleteProfilePicture)
router.route("/delete-profile").delete(authenticateUser,deleteUserProfile)
export default router;
