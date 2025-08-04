import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import {authenticateUser} from "../middlewares/authentication.middlewares.js"
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
router.route("/login-user").post(loginUser)
router.route("/logout-user").post(authenticateUser,logoutUser)
export default router;
