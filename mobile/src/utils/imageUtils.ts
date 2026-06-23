import { appConfig } from "../services/apiConfig";

export const getFullImageUrl = (imagePath: string | null | undefined): { uri: string } | null => {
  if (!imagePath) return null;
  if (typeof imagePath !== "string") return null;

  if (imagePath.includes("127.0.0.1:4566") || imagePath.includes("localhost:4566")) {
    const networkIpPort = appConfig.LOCALSTACK_URL.replace(/^https?:\/\//, '');
    const fixedUrl = imagePath
      .replace("127.0.0.1:4566", networkIpPort)
      .replace("localhost:4566", networkIpPort);
    return { uri: fixedUrl };
  }

  if (imagePath.startsWith("/storage/")) {
    return { uri: `${appConfig.LOCALSTACK_URL}${imagePath.replace("/storage", "")}` };
  }

  if (imagePath.startsWith("http") || imagePath.startsWith("data:")) {
    return { uri: imagePath };
  }

  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return { uri: `${appConfig.LOCALSTACK_URL}/pedidofacil-uploads/${cleanPath}` };
};
