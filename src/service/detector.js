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
    { id: 1, keywords: ["dkms"] },
    { id: 2, keywords: ["deutsche krebshilfe", "helfen. forschen. informieren."], exclude: ["dkfz", "krebsforschungszentrum"] },
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
        if (/dkms(\d+)/ig.test(data) && /das\s?geheimnis\s?des/gi.test(data)){
            return 5;
        }
        return null;
    }

    const groups = matchGroups.filter(e => /(eur|chf|\$|€|euro|franken|dollar)/gi.test(e));

    if (groups.length < 1) return null;

    const v = Math.abs(Number(groups[0].trim().replace(/[^0-9.,]/g, "").replaceAll(",", ".")));
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
 * @return {Promise<{ orga: Number|null, amount: Number|null }>}
 */
const passes = async function(url){
    Log.info("Fist pass: " + url);
    const defaultText = await recognizeWithSettings(url);
    if (!defaultText) return { orga: null, amount: null };

    let detectedOrga = detectOrga(defaultText);
    let detectedAmount = detectAmount(defaultText);

    Log.info("Second pass: " + url);
    if (detectedOrga === null || detectedAmount === null){
        const retryText = await recognizeWithSettings(url, { thresholding_method: 2 });
        if (retryText){
            if (detectedOrga === null) detectedOrga = detectOrga(retryText);
            if (detectedAmount === null) detectedAmount = detectAmount(retryText);
        }
    }

    Log.info("Third pass: " + url);
    if (detectedOrga === null || detectedAmount === null){
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
