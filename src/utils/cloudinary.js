import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET, // Click 'View Credentials' below to copy your API secret
});
const uploadOnCloudinary = async function (localPath) {
  try {
    if (!localPath) return null;
    const result = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto",
    });
    console.log("flie is uploaded:", result.url);
    return result;
  } catch (error) {
    fs.unlinkSync(localPath);
    return null;
  }
};

export { uploadOnCloudinary };
