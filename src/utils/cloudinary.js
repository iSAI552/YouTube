import { v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })
        // now the file has been uploaded successfully
        console.log(`file is successfully uploaded on cloudinary`)
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
    }
}

const deleteFromCloudinary = async (uris, resType="image") => {
    try {

        const publicIds = uris.map(uri => (
            uri?.split("/")?.[7]?.split(".")[0]
        ))

        await cloudinary.api.delete_resources(publicIds, {
            resource_type: resType,
            type: "upload",
            invalidate: true,
        })
        console.log(`file is successfully deleted from cloudinary`)
    } catch (error) {
        console.error(error)
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}
