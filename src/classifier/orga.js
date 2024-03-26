"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

// core modules
const path = require("path");

const fs = require("fs");

// dependencies
const ocr = require("node-tesseract-ocr");

// dependencies
const { process: pr } = require("core-worker");

// utils
const config = require("../utils/configHandler").getConfig();
const log = require("../utils/logger");

const ORGA_MAP = {
    krebshilfe: 2,
    kinderkrebsstiftung: 4,
    dkms: 1,
    dkfz: 3
};

/**
 * Classify object
 *
 * @param {String} file
 */
module.exports = async function(file){
    const tryWithOcr = (await ocr.recognize(fs.readFileSync(`${path.resolve("./image_cache")}/${file}`), {
        lang: "deu",
        psm: 3
    })).match(
        /(krebshilfe|kinderkrebsstiftung|dkms|dkfz)/gi
    );

    if (tryWithOcr && tryWithOcr.length > 0){
        log.done(`Classified ${file}:\n                          ${tryWithOcr}`);
        return ORGA_MAP[tryWithOcr[0].toLowerCase().trim()];
    }

    const result = (await pr(
        `${config.server.python_binary} ${path.resolve("./model/tag.py")} ${path.resolve("./image_cache")}/${file}`
    ).death()).data.toString().trim();

    const data = JSON.parse(result);
    log.done(`Classified ${file}:\n                          ${result}`);
    const key = Object.keys(data)[0];

    return Number(data[Object.keys(data)[0]]) >= config.server.orga_confidence_threshold
        ? ORGA_MAP[key]
        : null;
};
