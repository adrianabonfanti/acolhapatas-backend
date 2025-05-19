// upload.js
const multer = require("multer");
const { storage } = require("../utils/cloudinary");


const upload = multer({ storage });

export default upload;
