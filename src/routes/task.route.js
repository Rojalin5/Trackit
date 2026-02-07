import { Router } from "express";
import {
  createTask,
  getAllTasks,
  getSingleTask,
  updateTask,
  deleteTask,
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
router.route("/update-task/:id").put(authenticateUser, updateTask);
router.route("/delete-task/:id").delete(authenticateUser, deleteTask);
export default router;
