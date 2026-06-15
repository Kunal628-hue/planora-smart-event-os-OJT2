import express from "express";
import { createVendor, getVendors, updateVendor, deleteVendor } from "../controllers/vendorController.js";
import { validate, schemas } from "../middleware/validateInput.js";

const router = express.Router();

router.route("/").post(validate(schemas.vendor.create), createVendor).get(getVendors);
router.route("/:id").patch(validate(schemas.vendor.update), updateVendor).delete(deleteVendor);

export default router;
