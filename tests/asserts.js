import path from "node:path";
import fs from "node:fs";
import { partial_ratio as partialRatio } from "fuzzball";
import tesseract from "node-tesseract-ocr";
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

const threshold = config.server.fuzz_threshold;

const ORGS = [
    { id: 1, keywords: ["dkms"] },
    { id: 2, keywords: ["deutsche krebshilfe", "helfen. forschen. informieren."] },
    { id: 3, keywords: ["dkfz", "deutsches krebsforschungszentrum"] },
    { id: 4, keywords: ["kinderkrebsstiftung", "deutsche kinder krebs stiftung", "kinder krebs stiftung"] },
    { id: 5, keywords: ["österreich", "austria"] },
    { id: 6, keywords: ["schweiz", "swiss"] },
    { id: 7, keywords: ["seenot", "dgzrs", "ärzte ohne grenzen", "humanitas", "parkinson", "kriegsgräber"] },
    { id: 10, keywords: ["depression"] },
    { id: 11, keywords: ["tierschutz", "naturschutz", "tiernot"] },
    { id: 12, keywords: ["ukraine"] },
    { id: 13, keywords: ["drk", "deutsches rotes kreuz"], exclude: ["ukraine"] },
];

/**
 * Detect the donation amount from the OCR data
 *
 * @param {String} data
 * @returns {Number|null}
 */
const detectAmount = function(data){
    const matchGroups = data.match(
        /((eur|chf|\$|€|euro|franken|dollar)(\s)*)*(?<amount>(\d+(?:(\.|\,)\d+)?)+)((\s)*(eur|chf|\$|€|euro|franken|dollar))*/gi,
    );

    if (!matchGroups || matchGroups.length < 1){
        return null;
    }

    const groups = matchGroups.filter(e => /(eur|chf|\$|€|euro|franken|dollar)/gi.test(e));

    if (groups.length < 1){
        if ((/dkms(\d+)/ig.test(data) || data.includes("leben")) && /das\s?geheimnis\s?des/gi.test(data)){
            return 5;
        }
        return null;
    }

    return Number(groups[0].trim().replace(/[^0-9.,]/g, "").replaceAll(",", "."));
};

/**
 * Detect the organization from the OCR data
 *
 * @param {String} data
 * @returns {Number|null}
 */
const detectOrga = function(data){
    const s = data.toLowerCase();

    for (const org of ORGS){
        for (const keyword of org.keywords){
            const score = partialRatio(s, keyword.toLowerCase());
            if (score >= threshold || s.includes(keyword)){
                if (org.exclude && org.exclude.some(ex => s.includes(ex))) continue;
                return org.id;
            }
        }
    }

    return null;
};

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
                .trim();

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
                successfullyFiles.push(file);
            }
            else {
                failed++;
                failedFiles.push(file);
            }
        }
    }

    Log.info("-------------------------------------------------");
    Log.info("-------------------------------------------------");

    Log.done("Finished processing all files:");
    Log.info(`Successfully: ${successfully} of ${total}`);
    Log.info(`Failed: ${failed} of ${total}`);
    Log.info(`Skipped: ${skipped} of ${total}`);

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
