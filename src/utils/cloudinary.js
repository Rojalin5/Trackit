import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null;
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localfilepath);
    return response;
  } catch (error) {
    console.log("Something went wrong while uploading....");
    fs.unlinkSync(localfilepath);
  }
};

const extractpublicIDFromUrl = (url) => {
  try {
    const urlParts = url.split("/");
    const fileNameWithExtension = urlParts.pop();
    const fileName = fileNameWithExtension.split(".")[0];


    const publicID = `${fileName}`;

    console.log("Corrected Public ID:", publicID);
    return publicID;
  } catch (error) {
    console.log("Error Extracting Public ID:", error);
    return null;
  }
};


const deleteFileFromCloudinary = async (publicID) => {
  try {
    if (!publicID) {
      console.log("Invalid Public ID:", publicID);
      return;
    }

    console.log("Deleting Public ID:", publicID);

    // Delete the file with invalidation to ensure it's removed
    const result = await cloudinary.uploader.destroy(publicID, { invalidate: true });

    if (result.result === "not found") {
      console.log("File not found in Cloudinary. Double-check the public ID.");
    } else {
      console.log("File successfully deleted from Cloudinary!", result);
    }
  } catch (error) {
    console.error("Error while deleting file from Cloudinary:", error);
  }
};
export { uploadOnCloudinary ,extractpublicIDFromUrl,deleteFileFromCloudinary};