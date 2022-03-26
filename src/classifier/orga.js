"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

// core modules
const path = require("path");

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
