import path from "node:path";
import fs from "node:fs";
import { config } from "../config/config";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

const IMAGES = path.resolve(config.testing.test_img_path);
const imgList = fs.readFileSync(path.join("tests", "successfully.txt"), "utf-8").split("\n");

/**
 * Remove successfully processed files
 */
const removeSuccessful = function(){
    for (const img of imgList){
        const filePath = path.join(IMAGES, img.trim());
        if (fs.existsSync(filePath)){
            fs.rmSync(filePath);
            console.log("Removed: " + img);
        }
        else {
            console.log("File not found: " + img);
        }
    }
};

(async() => removeSuccessful())();
