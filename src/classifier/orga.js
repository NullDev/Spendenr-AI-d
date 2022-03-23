"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

let cp = require("child_process");
let path = require("path");

let config = require("../utils/configHandler").getConfig();

/**
 * Classify object
 *
 * @param {String} file
 */
module.exports = async function(file){
    let result = cp.execSync(`bash ${path.resolve("./model/classify.sh")} ${path.resolve("./image_cache")}/${file}`).toString();
    let data = result.trim().split("\n")[0].trim().split(" ");
    return Number(data[data.length - 1].replace(")", "")) >= config.server.orga_confidence_threshold
        ? data[0]
        : null;
};
