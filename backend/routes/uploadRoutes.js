import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { validateFileBufferContent, generateSanitizedFilename } from '../utils/fileSecurity.js';

const router = express.Router();

const uploadDir = 'uploads/receipts';
const ensureUploadDir = () => {
    try {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
    } catch (err) {
        console.warn("[Storage Warning] Local file system is read-only.");
    }
};

// Memory storage allows byte content magic number inspection before disk writing
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

// Upload Endpoint with Magic Number Byte Inspection
router.post('/receipt', upload.single('receipt'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    // 1. Content Magic Byte & Header Inspection
    const validation = validateFileBufferContent(req.file.buffer, req.file.mimetype, req.file.originalname);
    if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
    }

    // 2. Ensure isolated upload directory exists
    ensureUploadDir();

    // 3. Generate randomized, non-executable filename
    const safeFilename = generateSanitizedFilename(req.file.originalname);
    const destinationPath = path.join(uploadDir, safeFilename);

    try {
        fs.writeFileSync(destinationPath, req.file.buffer);
    } catch (err) {
        console.error("Failed to save uploaded file:", err);
        return res.status(500).json({ message: "Failed to store uploaded file safely." });
    }

    const fileUrl = `/uploads/receipts/${safeFilename}`;
    res.json({ 
        success: true, 
        message: "Financial proof uploaded successfully",
        url: fileUrl 
    });
});

export default router;
