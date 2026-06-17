import fs from 'fs';
import path from 'path';
import { logger } from './logger';

export const deleteFile = (filename: string | null | undefined) => {
  if (!filename) return;

  const filePath = path.resolve(__dirname, '../../uploads', filename);

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      logger.info(`Arquivo removido: ${filename}`);
    } catch (err) {
      logger.error(`Erro ao remover arquivo ${filename}:`, err);
    }
  }
};