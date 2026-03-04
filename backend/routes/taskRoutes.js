import express from "express";
import { createTask, getTasks, updateTask, deleteTask } from "../controllers/taskController.js";

const router = express.Router();

router.route("/").post(createTask).get(getTasks);
router.route("/:id").patch(updateTask).delete(deleteTask);

export default router;
