import path from "node:path";
import fs from "node:fs";
import tesseract from "node-tesseract-ocr";
import { detectOrga, detectAmount } from "../src/service/detector.js";
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

let total = 0;
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

            let raw = null;

            try {
                raw = await tesseract.recognize(filePath, {
                    lang: "deu",
                    oem: 1,
                    psm: 3,
                    thresholding_method: 2,
                });
            }
            catch (e){
                Log.error(`Error while processing ${file}: ${e}`);
                skipped++;

                await fs.promises
                    .unlink(filePath)
                    .then(() => Log.done(`Deleted faulty file ${file}`))
                    .catch(e1 => Log.error("Error deleting faulty file: " + e1));

                continue;
            }

            const text = raw
                .replace(/(\s+)|(\r\n|\n|\r)/gm, " ")
                .trim()
                .toLowerCase();

            const orgaData = detectOrga(text);
            const amountData = detectAmount(text);

            total++;

            let shouldBeOrga = null;
            if (folder === "dkfz") shouldBeOrga = 3;
            else if (folder === "dkms") shouldBeOrga = 1;
            else if (folder === "kinderkrebsstiftung") shouldBeOrga = 4;
            else if (folder === "krebshilfe") shouldBeOrga = 2;

            const shouldBeAmount = Number(file.split("__")[0]);

            Log.info("-------------------------------------------------");
            Log.info(`File: ${file}`);

            if (orgaData !== shouldBeOrga){
                Log.error(`Organization for ${file} is ${orgaData}, should be ${shouldBeOrga}`);
            }
            else {
                Log.done(`Organization for ${file} is ${orgaData}`);
            }

            if (amountData !== shouldBeAmount){
                Log.error(`Amount for ${file} is ${amountData}, should be ${shouldBeAmount}`);
            }
            else {
                Log.done(`Amount for ${file} is ${amountData}`);
            }

            if (orgaData === shouldBeOrga && amountData === shouldBeAmount){
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
