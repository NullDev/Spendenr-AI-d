import path from "node:path";
import fs from "node:fs";
import { passes } from "../src/service/detector.js";
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
let partialFailed = 0;
const partialFailedFiles = [];

const asserts = async function(){
    for (const folder of FOLDER){
        const files = await fs.promises.readdir(path.join(IMAGES, folder));

        for (const file of files){
            const filePath = path.join(IMAGES, folder, file);

            const { orga, amount } = await passes(filePath, true);

            total++;

            let shouldBeOrga = null;
            if (folder === "dkfz") shouldBeOrga = 3;
            else if (folder === "dkms") shouldBeOrga = 1;
            else if (folder === "kinderkrebsstiftung") shouldBeOrga = 4;
            else if (folder === "krebshilfe") shouldBeOrga = 2;

            const shouldBeAmount = Number(file.split("__")[0]);

            Log.info("-------------------------------------------------");
            Log.info(`File: ${folder}/${file}`);

            if (orga !== shouldBeOrga){
                Log.error(`Organization for ${file} is ${orga}, should be ${shouldBeOrga}`);
            }
            else {
                Log.done(`Organization for ${file} is ${orga}`);
            }

            if (amount !== shouldBeAmount){
                Log.error(`Amount for ${file} is ${amount}, should be ${shouldBeAmount}`);
            }
            else {
                Log.done(`Amount for ${file} is ${amount}`);
            }

            if (orga === shouldBeOrga && amount === shouldBeAmount){
                successfully++;
                successfullyFiles.push(folder + "/" + file);
            }
            else if (
                (orga === shouldBeOrga && amount !== shouldBeAmount)
                || (orga !== shouldBeOrga && amount === shouldBeAmount)
            ){
                partialFailed++;
                partialFailedFiles.push(folder + "/" + file);
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
    Log.info(`Partially failed: ${partialFailed} of ${total} (${Math.round((partialFailed / total) * 100)}%)`);

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

    if (partialFailed > 0){
        await fs
            .promises
            .writeFile(path.join("tests", "partialFailed.txt"), partialFailedFiles.join("\n"))
            .then(() => Log.done("Partially failed files written to partialFailed.txt"))
            .catch(e => Log.error("Error writing partially failed files: ", e));
    }
};

(async() => await asserts())();
