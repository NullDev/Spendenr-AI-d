import { parentPort, workerData } from "node:worker_threads";
import { partial_ratio as partialRatio } from "fuzzball";
import tesseract from "node-tesseract-ocr";
import Log from "../util/log.js";
import { config } from "../../config/config.js";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

const threshold = config.server.fuzz_threshold;

const ORGS = [
    { id: 1, keywords: ["dkms", "deine geldspende kommt an", "ihre geldspende kommt an"] },
    { id: 2, keywords: ["deutsche krebshilfe", "helfen. forschen. informieren."], exclude: ["dkfz", "krebsforschungszentrum"] },
    { id: 3, keywords: ["dkfz", "deutsches krebsforschungszentrum", "dt. krebsforschungsz."] },
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
 * Parse a locale number from a string
 *
 * @param {String} str
 * @returns {Number}
 */
const parseLocaleNumber = function(str){
    if (!str) return 0;

    const s = str.replace(/[^0-9.,]/g, "").trim();

    if (s.match(/\d+\.\d{3},\d{2}/)) return Math.abs(Number(s.replace(/\./g, "").replace(",", ".")));
    if (s.match(/\d+,\d{3}\.\d{2}/)) return Math.abs(Number(s.replace(/,/g, "")));
    if (s.includes(",") && !s.includes(".")) return Math.abs(Number(s.replace(",", ".")));

    return Math.abs(Number(s));
};

/**
 * Detect the donation amount from the OCR data
 *
 * @param {String} data
 * @returns {Number|null}
 */
const detectAmount = function(data){
    const labelRegex = new RegExp(
        "(betrag)\\s*[:\\-]?\\s*([\\d.,]+)\\s*(€|eur|euro|chf|fr|franken|\\$|dollar|.?,-)",
        "i",
    );

    const labelMatch = data.match(labelRegex);

    if (labelMatch && labelMatch[2]){
        const v = parseLocaleNumber(labelMatch[2]);
        if (v >= 5 && v <= 100000) return v;
    }

    if (data.includes("dkms") && /das\s?geheimnis\s?des/gi.test(data)){
        return 5;
    }

    const matchGroups = data.match(
        /((eur|chf|fr|\$|€|euro|franken|dollar)(\s)*)*(?<amount>(\d+(?:(\.|\,)\d+)?)+)((\s)*(eur|chf|fr|\$|€|euro|franken|dollar))*/gi,
    );

    if (!matchGroups || matchGroups.length < 1){
        return null;
    }

    const groups = matchGroups.filter(e => /(eur|chf|fr|\$|€|euro|franken|dollar)/gi.test(e));

    if (groups.length < 1) return null;

    let v = parseLocaleNumber(groups[0]);

    if (v < 5 || v > 100000){
        for (const group of groups){
            const val = parseLocaleNumber(group);
            if (val >= 5 && val <= 100000){
                v = val;
                break;
            }
        }
    }

    return v < 5 || v > 100000 ? null : v;
};

/**
 * Detect the organization from the OCR data
 *
 * @param {String} data
 * @returns {Number|null}
 */
const detectOrga = function(data){
    for (const org of ORGS){
        for (const keyword of org.keywords){
            const score = partialRatio(data, keyword.toLowerCase());
            if (score >= threshold || data.includes(keyword)){
                if (org.exclude && org.exclude.some(ex => data.includes(ex))) continue;
                return org.id;
            }
        }
    }
    return null;
};

/**
 * Clean the OCR text
 *
 * @param {String} raw
 * @returns {String}
 */
const cleanText = (raw) => raw.replace(/(\s+)|(\r\n|\n|\r)/gm, " ").trim().toLowerCase();

/**
 * Recognize text from an image using Tesseract
 *
 * @param {String} url
 * @param {Object} [customConfig={}]
 * @return {Promise<String|null>}
 */
const recognizeWithSettings = async(url, customConfig = {}) => {
    try {
        const raw = await tesseract.recognize(url, {
            lang: "deu",
            oem: 1,
            psm: 3,
            ...customConfig,
        });
        return cleanText(raw);
    }
    catch (e){
        Log.error("Tesseract error: ", e);
        return null;
    }
};

/**
 * Perform multiple passes of OCR on the image
 *
 * @param {String} url
 * @param {Boolean} [dontLog=false]
 * @return {Promise<{ orga: Number|null, amount: Number|null }>}
 */
const passes = async function(url, dontLog = false){
    if (!dontLog) Log.info("First pass: " + url);
    const defaultText = await recognizeWithSettings(url);
    if (!defaultText) return { orga: null, amount: null };

    let detectedOrga = detectOrga(defaultText);
    let detectedAmount = detectAmount(defaultText);

    if (detectedOrga === null || detectedAmount === null){
        if (!dontLog) Log.info("Second pass: " + url);
        const retryText = await recognizeWithSettings(url, { thresholding_method: 2 });
        if (retryText){
            if (detectedOrga === null) detectedOrga = detectOrga(retryText);
            if (detectedAmount === null) detectedAmount = detectAmount(retryText);
        }
    }

    if (detectedOrga === null || detectedAmount === null){
        if (!dontLog) Log.info("Third pass: " + url);
        const finalText = await recognizeWithSettings(url, { thresholding_method: 3 });
        if (finalText){
            if (detectedOrga === null) detectedOrga = detectOrga(finalText);
            if (detectedAmount === null) detectedAmount = detectAmount(finalText);
        }
    }

    return { orga: detectedOrga, amount: detectedAmount };
};

/**
 * Detect the donation amount and organization from the OCR data
 */
const detector = async function(){
    if (!workerData) return;

    const { id, url } = workerData;

    const { orga, amount } = await passes(url);

    parentPort?.postMessage({
        id,
        orga: orga || null,
        amount: amount || null,
    });
};

(async() => await detector())();

export {
    passes,
};
