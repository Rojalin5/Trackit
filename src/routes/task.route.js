import { Router } from "express";
import {
  createTask,
  getAllTasks,
  getSingleTask,
} from "../controllers/task.controller.js";
import { authenticateUser } from "../middlewares/authentication.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router.route("/create-task").post(
  authenticateUser,
  upload.fields([
    {
      name: "attachment",
      maxCount: 5,
    },
  ]),
  createTask
);

router.route("/get-all-tasks").get(authenticateUser, getAllTasks);
router.route("/get-single-task/:id").get(authenticateUser, getSingleTask);

export default router;
