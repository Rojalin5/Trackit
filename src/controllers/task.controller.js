import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { Task } from "../models/task.models.js";

const createTask = asyncHandler(async (req, res) => {
  const { taskTitle, description, dueDate, taskStatus, priority, reminder } =
    req.body;
  if (!req.user) {
  throw new ApiError(401, "Unauthorized");
}

  if (!taskTitle) {
    throw new ApiError(400, {}, "Task title is required.");
  }
  let attachment = [];
  if (
    req.files &&
    Array.isArray(req.files.attachment) &&
    req.files.attachment.length > 0
  ) {
    for (const file of req.files.attachment) {
      const TaskAttachmentFilePath = file.path;
      const TaskAttachment = await uploadOnCloudinary(TaskAttachmentFilePath);
      if (TaskAttachment) {
        attachment.push({fileName:file.originalname,file:TaskAttachment.url});
      }
    }
  }
  let taskTags = [];
  if (req.body.tags) {
    if (Array.isArray(req.body.tags)) {
      taskTags = req.body.tags.map((tags) => tags.trim());
    } else {
      taskTags = req.body.tags.split(",").map((tags) => tags.trim());
    }
  }
  const task = await Task.create({
    user: req.user._id,
    taskTitle,
    description,
    dueDate,
    taskStatus,
    priority,
    tags: taskTags,
    attachment,
    reminder,
  });

  res.status(201).json(new ApiResponse(201, "task created successfully", task));
});
const getAllTasks = asyncHandler(async (req, res) => {
if (!req.user) {
  throw new ApiError(401, "Unauthorized");
}
  const {
    page = 1,
    limit = 10,
    sortBy = "dueDate",
    sortType = "desc",
  } = req.query;
  const pageNumber = Math.max(1,parseInt(page) || 1);
  const limitNumber = Math.min(50,Math.max(1,parseInt(limit)|| 10));
  const skip = (pageNumber - 1) * limitNumber;

  const filter = {};
  const {query} = req.query;
  if (query) {
    filter.taskTitle = { $regex: query, $options: "i" };
  }
  filter.user = req.user._id;


  const sortOrder = sortType === "asc" ? 1 : -1;
  const sortOption = { [sortBy]: sortOrder };

  const allTasks = await Task.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limitNumber);

  const totalTasks = await Task.countDocuments(filter);
  const totalPages = Math.ceil(totalTasks / limitNumber);

  res.status(200).json(
    new ApiResponse(200, allTasks, "All tasks fetched successfully", {
      Page: pageNumber,
      totalTasks: totalTasks,
      totalPages: totalPages,
    })
  );
});
export { createTask ,getAllTasks};
