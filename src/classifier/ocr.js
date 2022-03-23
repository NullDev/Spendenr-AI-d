"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

// dependencies
let ocr = require("node-tesseract-ocr");

// utils
let log = require("../utils/logger");

const lReg = /(eur|chf|$|€|euro|franken|dollar)(\s)*(\d+(?:(\.|\,)\d+)?)+/gi;
const rReg = /(\d+(?:(\.|\,)\d+)?)+(\s)*(eur|chf|$|€|euro|franken|dollar)/gi;

/**
 * Find amount
 *
 * @param {String} url
 */ // eslint-disable-next-line no-unused-vars
module.exports = async function(url){
    try {
        let text = await ocr.recognize(url, { lang: "deu", psm: 3 });

        let l = text.match(lReg);
        let r = text.match(rReg);

        if (!l || !l.length) return (!r || !r.length) ? null : Number(r[0].replace(/[^0-9.,]/g, "").replace(",", "."));
        return Number(l[0].replace(/[^0-9.,]/g, "").replace(",", "."));
    }
    catch (e){
        log.error(e?.message);
        return null;
    }
};
