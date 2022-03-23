"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

// Core Modules
let fs = require("fs");
let path = require("path");

// Utils
let log = require("./logger");

const packagefile = require(path.resolve("package.json"));
const configPath = path.resolve("config.json");

/**
 * Check if the config is valid JSON
 *
 * @param {object} obj
 * @returns {boolean} whether it is valid JSON
 */
let validJson = function(obj){
    try {
        JSON.parse(obj);
    }
    catch (e){
        return false;
    }
    return true;
};

/**
 * Reads out config data
 *
 * @returns {object} JSON Content
 */
let getConfig = function(){
    if (!fs.existsSync(configPath)){
        log.error("Konfigurationsdatei existiert nicht! Gehe sicher, dass du 'config.template.json' kopierst und als 'config.json' einfügst.");
        process.exit(1);
    }

    let jsondata = "";
    try {
        jsondata = String(fs.readFileSync(configPath));
    }
    catch (e){
        log.error(`Kann Konfigurationsdatei nicht lesen: ${e}`);
        process.exit(1);
    }

    if (validJson(jsondata)) return JSON.parse(jsondata);

    log.error("Konfigurationsdatei ist in keinem validen JSON Format. Stoppe...");
    return process.exit(1);
};

/**
 * Get Package Version
 *
 * @returns {string}
 */
let getVersion = function(){
    return packagefile.version;
};

/**
 * Get Package Name
 *
 * @returns {string}
 */
let getName = function(){
    return packagefile.name;
};

/**
 * Get Package Author
 *
 * @returns {string}
 */
let getAuthor = function(){
    return packagefile.author;
};

module.exports = {
    getConfig,
    getVersion,
    getName,
    getAuthor
};
