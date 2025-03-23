import fs from "node:fs/promises";
import Log from "../src/util/log.js";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

/**
 * @param {any} item
 * @returns {boolean}
 */
const isObject = item => item && typeof item === "object" && !Array.isArray(item);

/**
 * Deep Merge of two objects
 *
 * @template {object} T
 * @template {object} T2
 * @param {T} target
 * @param {T2 & Partial<T>} source
 * @returns {T & T2}
 */
const deepMerge = function(target, source){
    if (isObject(target) && isObject(source)){
        for (const key in source){
            if (isObject(source[key])){
                if (!target[key]) target[key] = {};
                deepMerge(target[key], source[key]);
            }
            else target[key] = source[key];
        }
    }
    return /** @type {T & T2} */ (target);
};

try {
    await fs.access("./config/config.custom.js");
}
// eslint-disable-next-line no-unused-vars
catch (error){
    Log.error("Config file not found. To create one, either copy 'config.template.js' and rename it to 'config.custom.js' or run 'npm run generate-config'.");
    process.exit(1);
}

try {
    await fs.access("./config/config.template.js");
}
// eslint-disable-next-line no-unused-vars
catch (error){
    Log.error("Config template file not found. This is needed to read default values. Please re-clone the repository.");
    process.exit(1);
}

// @ts-ignore
const configCustom = (await import("./config.custom.js")).default;
const configBase = (await import("./config.template.js")).default;
const packageJSON = JSON.parse(await fs.readFile("./package.json", "utf-8"));

export const meta = {
    getVersion: () => packageJSON.version,
    getName: () => packageJSON.name,
    getAuthor: () => packageJSON.author,

};

export const config = {
    ...deepMerge(
        configBase,
        /** @type {Partial<typeof configBase>} */ (configCustom),
    ),
};
