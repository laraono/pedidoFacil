export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '';
  return imagePath;
}

export function validateImageFile(file: File, maxMB = 2): string | null {
  if (file.size > maxMB * 1024 * 1024) {
    return `Arquivo muito grande! O limite é ${maxMB}MB.`;
  }
  return null;
}
