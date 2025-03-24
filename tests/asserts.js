import path from "node:path";
import fs from "node:fs";
import { detectOrga, detectAmount, recognizeWithSettings } from "../src/service/detector.js";
import Log from "../src/util/log";
import { config } from "../config/config";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

const IMAGES = path.resolve(config.testing.test_img_path);
const FOLDER = [
    "dkfz",
    "dkms",
    "kinderkrebsstiftung",
    "krebshilfe",
];

const total = 10767;
let successfully = 0;
const successfullyFiles = [];
let failed = 0;
const failedFiles = [];
let skipped = 0;

const asserts = async function(){
    for (const folder of FOLDER){
        const files = await fs.promises.readdir(path.join(IMAGES, folder));

        for (const file of files){
            const filePath = path.join(IMAGES, folder, file);

            const defaultText = await recognizeWithSettings(filePath);
            if (!defaultText){
                Log.error(`Error while processing ${file}`);
                skipped++;

                await fs.promises
                    .unlink(filePath)
                    .then(() => Log.done(`Deleted faulty file ${file}`))
                    .catch(e1 => Log.error("Error deleting faulty file: " + e1));
                continue;
            }

            let detectedOrga = detectOrga(defaultText);
            let detectedAmount = detectAmount(defaultText);

            // Second pass if necessary
            if (detectedOrga === null || detectedAmount === null){
                const retryText = await recognizeWithSettings(filePath, { thresholding_method: 2 });
                if (retryText){
                    if (detectedOrga === null) detectedOrga = detectOrga(retryText);
                    if (detectedAmount === null) detectedAmount = detectAmount(retryText);
                }
            }

            let shouldBeOrga = null;
            if (folder === "dkfz") shouldBeOrga = 3;
            else if (folder === "dkms") shouldBeOrga = 1;
            else if (folder === "kinderkrebsstiftung") shouldBeOrga = 4;
            else if (folder === "krebshilfe") shouldBeOrga = 2;

            const shouldBeAmount = Number(file.split("__")[0]);

            Log.info("-------------------------------------------------");
            Log.info(`File: ${file}`);

            if (detectedOrga !== shouldBeOrga){
                Log.error(`Organization for ${file} is ${detectedOrga}, should be ${shouldBeOrga}`);
            }
            else {
                Log.done(`Organization for ${file} is ${detectedOrga}`);
            }

            if (detectedAmount !== shouldBeAmount){
                Log.error(`Amount for ${file} is ${detectedAmount}, should be ${shouldBeAmount}`);
            }
            else {
                Log.done(`Amount for ${file} is ${detectedAmount}`);
            }

            if (detectedOrga === shouldBeOrga && detectedAmount === shouldBeAmount){
                successfully++;
                successfullyFiles.push(folder + "/" + file);
            }
            else {
                failed++;
                failedFiles.push(folder + "/" + file);
            }
        }
    }

    Log.info("-------------------------------------------------");
    Log.info("-------------------------------------------------");

    Log.done("Finished processing all files:");
    Log.info(`Successfully: ${successfully} of ${total} (${Math.round((successfully / total) * 100)}%)`);
    Log.info(`Failed: ${failed} of ${total} (${Math.round((failed / total) * 100)}%)`);
    Log.info(`Skipped: ${skipped} of ${total} (${Math.round((skipped / total) * 100)}%)`);

    if (failed > 0){
        await fs
            .promises
            .writeFile(path.join("tests", "failed.txt"), failedFiles.join("\n"))
            .then(() => Log.done("Failed files written to failed.txt"))
            .catch(e => Log.error("Error writing failed files: ", e));
    }

    if (successfully > 0){
        await fs
            .promises
            .writeFile(path.join("tests", "successfully.txt"), successfullyFiles.join("\n"))
            .then(() => Log.done("Successfully files written to successfully.txt"))
            .catch(e => Log.error("Error writing successfully files: ", e));
    }
};

(async() => await asserts())();
