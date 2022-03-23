"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

let cp = require("child_process");
let path = require("path");

let config = require("../utils/configHandler").getConfig();

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
    let result = cp.execSync(`bash ${path.resolve("./model/classify.sh")} ${path.resolve("./image_cache")}/${file}`).toString();
    let data = result.trim().split("\n")[0].trim().split(" ");
    return Number(data[data.length - 1].replace(")", "")) >= config.server.orga_confidence_threshold
        ? ORGA_MAP[data[0]]
        : null;
};
