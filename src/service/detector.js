import { parentPort, workerData } from "node:worker_threads";
import { partial_ratio as partialRatio } from "fuzzball";
import tesseract from "node-tesseract-ocr";
import { config } from "../../config/config.js";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

const ORGS = [
    { id: 1, keywords: ["dkms"] },
    { id: 2, keywords: ["deutsche krebshilfe", "helfen. forschen. informieren."] },
    { id: 3, keywords: ["dkfz", "deutsches krebsforschungszentrum"] },
    { id: 4, keywords: ["kinderkrebsstiftung", "deutsche kinder krebs stiftung", "kinder krebs stiftung"] },
    { id: 5, keywords: ["österreich", "austria"] },
    { id: 6, keywords: ["schweiz", "swiss"] },
    { id: 7, keywords: ["seenot", "dgzrs", "ärzte ohne grenzen", "humanitas", "parkinson", "kriegsgräber"] },
    { id: 10, keywords: ["depression"] },
    { id: 11, keywords: ["tierschutz", "naturschutz"] },
    { id: 12, keywords: ["ukraine"] },
    { id: 13, keywords: ["drk", "deutsches rotes kreuz"] },
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

    const threshold = config.server.fuzz_threshold;

    for (const org of ORGS){
        for (const keyword of org.keywords){
            const score = partialRatio(s, keyword.toLowerCase());
            if (score >= threshold){
                return org.id;
            }
        }
    }

    return null;
};

/**
 * Detect the donation amount and organization from the OCR data
 */
const detector = async function(){
    const { id, url } = workerData;

    const text = await tesseract.recognize(url, {
        lang: "deu",
        oem: 1,
        psm: 3,
    });

    const ocrData = detectAmount(text);
    const orgaData = detectOrga(text);

    parentPort?.postMessage({
        id,
        orga: orgaData || null,
        amount: ocrData || null,
    });
};

(async() => await detector())();
