export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '';
  return imagePath;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export function validateImageFile(file: File, maxMB = 2): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Formato não suportado. Use JPEG, PNG, WebP ou GIF.';
  }
  if (file.size > maxMB * 1024 * 1024) {
    return `Arquivo muito grande! O limite é ${maxMB}MB.`;
  }
  return null;
}
