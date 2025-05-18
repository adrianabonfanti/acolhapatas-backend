// upload.js
import multer from "multer";
import { storage } from "../utils/cloudinary.js"; // importa o storage configurado no Cloudinary

const upload = multer({ storage });

export default upload;
