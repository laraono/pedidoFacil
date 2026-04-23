import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads')); 
  },
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname);
    cb(null, `${hash}${extension}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('TIPO_INVALIDO'));
  }
};

export const validateUpload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: fileFilter
});