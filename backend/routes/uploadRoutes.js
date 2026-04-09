import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists - wrapped for Vercel compatibility
const uploadDir = 'uploads/receipts';
const ensureUploadDir = () => {
    try {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
    } catch (err) {
        console.warn("[Storage Warning] Local file system is read-only. Tactical receipt storage may be restricted in this environment.");
    }
};

// We don't call it at the top level to avoid Vercel boot-time crashes

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only images (jpeg, jpg, png) and PDFs are allowed!"));
    }
});

// Upload Endpoint
router.post('/receipt', (req, res, next) => {
    ensureUploadDir();
    next();
}, upload.single('receipt'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    
    const fileUrl = `/uploads/receipts/${req.file.filename}`;
    res.json({ 
        success: true, 
        message: "Financial proof uploaded successfully",
        url: fileUrl 
    });
});

export default router;
