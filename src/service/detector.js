import { parentPort, workerData } from "node:worker_threads";
import tesseract from "node-tesseract-ocr";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

const orgaMap = {
    1: "DKMS",
    2: "DtKrebshilfe",
    3: "DKFZ",
    4: "Deutsche Kinderkrebsstiftung",
    5: "Österreichische Spendenorganisationen",
    6: "Schweizer Spendenorganisationen",
    7: "diverse andere",
    8: "nicht ersichtlich",
    10: "Sonstige Depressionshilfe",
    11: "Sonstige Tier-/Naturschutzorganisationen",
    12: "Ukraine Nothilfe",
    13: "DRK ohne Ukraine",
};

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
 * @returns {String}
 */
const detectOrga = function(data){

};

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
