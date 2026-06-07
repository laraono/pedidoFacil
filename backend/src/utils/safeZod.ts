import { z } from 'zod';


export const safeString = (min: number, max: number) => 
  z.string()
    .min(min, `Mínimo de ${min} caracteres`)
    .max(max, `Máximo de ${max} caracteres`)
    .trim()
    .refine((val) => {
      const htmlTagRegex = /<[^>]*>/g;
      return !htmlTagRegex.test(val);
    }, {
      message: "Caracteres especiais de HTML não são permitidos (como < ou >)."
    })
    .transform((val) => val.replace(/[\r\n]/g, ''));


export const safeBase64Image = (maxMb: number) => 
  z.string()
    .refine((val) => {
      if (!val) return true;
      const base64Length = val.split(',')[1]?.length || val.length;
      const sizeInBytes = (base64Length * 3) / 4; 
      const sizeInMb = sizeInBytes / (1024 * 1024);
      return sizeInMb <= maxMb;
    }, `A imagem deve ter no máximo ${maxMb}MB`);