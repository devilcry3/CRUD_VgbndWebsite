const multer = require('multer');
const path = require('path');

//handles initial upload filter and check, upload validation is performed in validation.js

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    filename: (req, file, cb) => {
        cb(
            null,
            path.parse(file.originalname).name +
            '-' +
            Date.now() +
            path.extname(file.originalname)
        );
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
    const allowedExtensions = [".png", ".jpg", ".jpeg"];

    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(ext)) {
        return cb(new Error("Invalid file type. Only images allowed."));
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter
});

module.exports = upload;