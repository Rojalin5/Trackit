import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { Task } from "../models/task.models.js";

const createTask = asyncHandler(async (req, res) => {
  const { taskTitle, description, dueDate, taskStatus, priority, remainder } =
    req.body;
  if (!taskTitle) {
    throw new ApiError(400, {}, "Task title is required.");
  }
  let parsedVarient = [];
  try {
    parsedVarient = JSON.parse(req.body.varient);
  } catch (error) {
    throw new ApiError(400, "Invalid variant format. Must be JSON.");
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
        attachment.push(TaskAttachment.url);
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
    user: user._id,
    taskTitle,
    description,
    dueDate,
    taskStatus,
    priority,
    tags,
    attachment,
    remainder,
  });

  res.status(201).json(new ApiResponse(201, "task created successfully", task));
});
const getAllTasks = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "DueDate",
    sortType = "desc",
  } = req.query;
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const filter = {};
  if (query) {
    filter.name = { $regex: query, $options: "i" };
  }
  filter.owner = req.user._id;
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
