import express from "express";
import { createVendor, getVendors, updateVendor, deleteVendor } from "../controllers/vendorController.js";

const router = express.Router();

router.route("/").post(createVendor).get(getVendors);
router.route("/:id").patch(updateVendor).delete(deleteVendor);

export default router;
