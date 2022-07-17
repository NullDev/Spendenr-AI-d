"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

const fs = require("node:fs");
const path = require("node:path");

const log = require("./logger");

const packagefile = require(path.resolve("package.json"));
const configPath = path.resolve("config.json");

/**
 * Check if the config is valid JSON
 *
 * @param {Object} obj
 * @returns {Boolean} whether it is valid JSON
 */
const validJson = function(obj){
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
const getConfig = function(){
    if (!fs.existsSync(configPath)){
        log.error("Config does not exist! Make sure you copy config.template.json and paste it as 'config.json'. Then configure it.");
        process.exit(1);
    }

    let jsondata = "";
    try {
        jsondata = String(fs.readFileSync(configPath));
    }
    catch (e){
        log.error(`Cannot read config file: ${e}`);
        process.exit(1);
    }

    if (validJson(jsondata)) return JSON.parse(jsondata);

    log.error("Config is not valid JSON. Stopping...");
    return process.exit(1);
};

/**
 * Get Package Version
 *
 * @returns {String}
 */
const getVersion = function(){
    return packagefile.version;
};

/**
 * Get Package Name
 *
 * @returns {String}
 */
const getName = function(){
    return packagefile.name;
};

/**
 * Get Package Author
 *
 * @returns {String}
 */
const getAuthor = function(){
    return packagefile.author;
};

module.exports = {
    getConfig,
    getVersion,
    getName,
    getAuthor
};
