import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { loginUser, registerUser } from "../controllers/user.controller.js";
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
export default router;
