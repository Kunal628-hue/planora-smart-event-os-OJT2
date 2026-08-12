import express from "express";
import { createVendor, getVendors, updateVendor, deleteVendor } from "../controllers/vendorController.js";
import { validate, schemas } from "../middleware/validateInput.js";
import { cacheRoute, clearCachePattern } from "../middleware/cacheMiddleware.js";

const router = express.Router();

const invalidateVendorCache = async (req, res, next) => {
    await clearCachePattern("vendors");
    next();
};

router.route("/")
    .post(validate(schemas.vendor.create), invalidateVendorCache, createVendor)
    .get(cacheRoute(300, "vendors"), getVendors);

router.route("/:id")
    .patch(validate(schemas.vendor.update), invalidateVendorCache, updateVendor)
    .delete(invalidateVendorCache, deleteVendor);

export default router;
