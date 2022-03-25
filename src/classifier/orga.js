"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

// core modules
let path = require("path");

// dependencies
let { process: pr } = require("core-worker");

// utils
let config = require("../utils/configHandler").getConfig();
let log = require("../utils/logger");

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
    let result = (await pr(
        `${config.server.python_binary} ${path.resolve("./model/tag.py")} ${path.resolve("./image_cache")}/${file}`
    ).death()).data.toString().trim();
    let data = JSON.parse(result);
    log.done(`Classified ${file}:\n                          ${result}`);
    let key = Object.keys(data)[0];
    let first = data[Object.keys(data)[0]];
    return Number(first) >= config.server.orga_confidence_threshold
        ? ORGA_MAP[key]
        : null;
};
