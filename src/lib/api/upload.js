import { api } from "./client";

// Bytes go from the browser straight to Cloudinary's free tier.
// Our server only signs the request.
export const uploadImage = async (file) => {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image is over 5MB. Pick a smaller one.");
  }

  const { signature, timestamp, folder, apiKey, uploadUrl } =
    await api.get("/upload/signature");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("signature", signature);
  form.append("folder", folder);

  const response = await fetch(uploadUrl, { method: "POST", body: form });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error?.message || "Upload failed. Try again.");
  }

  return result.secure_url;
};
