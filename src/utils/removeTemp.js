import fs from "fs";
import path from "path";

export function removeTempFilesSync() {
    const tempFolderPath = "./public/temp";

    try {
        if (fs.existsSync(tempFolderPath)) {
            const files = fs.readdirSync(tempFolderPath);

            if (files.length > 0) {
                files.forEach((file) => {
                    // Check if the file is not .gitkeep before removing
                    if (file !== ".gitkeep") {
                        const filePath = path.join(tempFolderPath, file);
                        fs.unlinkSync(filePath);
                        console.log(`File ${filePath} removed successfully.`);
                    }
                });
            } else {
                console.log("Temp folder is empty. Continuing without removal.");
            }
        } else {
            console.log("Temp folder does not exist. Continuing without removal.");
        }
    } catch (error) {
        console.error(`Error removing files from temp folder:`, error);
    }
}
