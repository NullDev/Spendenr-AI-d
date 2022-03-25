"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

// core modules
let fs = require("fs");
let path = require("path");

// dependencies
let ocr = require("node-tesseract-ocr");

// utils
let log = require("../utils/logger");

/**
 * Find amount
 *
 * @param {String} file
 */ // eslint-disable-next-line no-unused-vars
module.exports = async function(file){
    try {
        let text = await ocr.recognize(fs.readFileSync(`${path.resolve("./image_cache")}/${file}`), { lang: "deu", psm: 3 });

        let m = text.match(
            /((eur|chf|\$|€|euro|franken|dollar)(\s)*)*(?<amount>(\d+(?:(\.|\,)\d+)?)+)((\s)*(eur|chf|\$|€|euro|franken|dollar))*/gi
        ).filter(e => /(eur|chf|\$|€|euro|franken|dollar)/gi.test(e));

        return Number(m[0].trim().replace(/[^0-9.,]/g, "").replace(",", "."));
    }
    catch (e){
        log.error(e?.message);
        return null;
    }
};
