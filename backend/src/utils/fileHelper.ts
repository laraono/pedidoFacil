import fs from 'fs';
import path from 'path';

export const deleteFile = (filename: string | null | undefined) => {
  if (!filename) return;

  const filePath = path.resolve(__dirname, '../../uploads', filename);

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Arquivo removido: ${filename}`);
    } catch (err) {
      console.error(`Erro ao remover arquivo ${filename}:`, err);
    }
  }
};