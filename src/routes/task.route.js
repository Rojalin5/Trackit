import { Router } from "express";
import {
  createTask,
  getAllTasks,
  getSingleTask,
  updateTask,
  updateTaskAttachments,
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
router.put(
  "/:id/attachments",
  authenticateUser,
  upload.fields([
    {
      name: "attachment",
      maxCount: 5,
    },
  ]),
  updateTaskAttachments
);
router.route("/update-attachments/:id").delete(authenticateUser,updateTaskAttachments)
router.route("/delete-task/:id").delete(authenticateUser, deleteTask);
export default router;
