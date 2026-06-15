import express from "express";
import { createTask, getTasks, updateTask, deleteTask } from "../controllers/taskController.js";
import { validate, schemas } from "../middleware/validateInput.js";

const router = express.Router();

router.route("/").post(validate(schemas.task.create), createTask).get(getTasks);
router.route("/:id").patch(validate(schemas.task.update), updateTask).delete(deleteTask);

export default router;
