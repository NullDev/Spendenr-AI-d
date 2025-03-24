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

    if (!matchGroups || matchGroups.length < 1) return null;

    const groups = matchGroups.filter(e => /(eur|chf|\$|€|euro|franken|dollar)/gi.test(e));

    return (groups.length < 1)
        ? null // @ts-ignore
        : Number(groups[0].trim().replace(/[^0-9.,]/g, "").replaceAll(",", "."));
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
            }
            else {
                failed++;
                failedFiles.push(file);
            }

            Log.info(`Successfully: ${successfully} of ${total}`);
            Log.info(`Failed: ${failed} of ${total}`);
            Log.info(`Skipped: ${skipped} of ${total}`);
            Log.info(`Failed Files: ${failedFiles.length}`);

            Log.info("-------------------------------------------------");
        }
    }
};

(async() => await asserts())();
