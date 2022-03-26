"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

// core modules
const fs = require("fs");
const path = require("path");

// dependencies
const ocr = require("node-tesseract-ocr");

// utils
const log = require("../utils/logger");

/**
 * Find amount
 *
 * @param {String} file
 */ // eslint-disable-next-line no-unused-vars
module.exports = async function(file){
    try {
        let matchGroups = (await ocr.recognize(fs.readFileSync(`${path.resolve("./image_cache")}/${file}`), {
            lang: "deu",
            psm: 3
        })).match(
            /((eur|chf|\$|€|euro|franken|dollar)(\s)*)*(?<amount>(\d+(?:(\.|\,)\d+)?)+)((\s)*(eur|chf|\$|€|euro|franken|dollar))*/gi
        );

        if (!matchGroups || matchGroups.length < 1) return null;

        matchGroups = matchGroups.filter(e => /(eur|chf|\$|€|euro|franken|dollar)/gi.test(e));

        return (matchGroups.length < 1)
            ? null // @ts-ignore
            : Number(matchGroups[0].trim().replace(/[^0-9.,]/g, "").replaceAll(",", "."));
    }
    catch (e){
        log.error(e?.message);
        return null;
    }
};
