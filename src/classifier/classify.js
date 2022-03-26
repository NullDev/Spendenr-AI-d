"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

// core modules
const path = require("path");
const fs = require("fs");
const https = require("https");
const { parentPort, workerData } = require("worker_threads");

// dependencies
const uuid = require("uuid");

// utils
const log = require("../utils/logger");
const config = require("../utils/configHandler").getConfig();

// Services
const orga = require("../classifier/orga");
const ocr = require("../classifier/ocr");

/**
 * Recursive batch processing
 *
 * @param {Array} data
 * @param {Number} index
 */
const classifyItem = async function(data, index){
    const e = data[index];
    // we can be certain that the format is always jpg, because the API doesn't return other formats
    const name = `${e.id}__${uuid.v4()}.jpg`;
    const file = fs.createWriteStream(path.resolve(`./image_cache/${name}`));

    https.get(config.result_server.image_getter + "?apiAuth=" + config.result_server.secret + "&postId=" + e.id, httpStream => {
        const stat = httpStream.pipe(file);
        stat.on("finish", async() => {
            log.done(`Downloaded ${name}`);

            const orgaData = await orga(name);
            const ocrData = await ocr(name);

            fs.unlink(path.resolve(`./image_cache/${name}`), () => {});

            log.done(`Parsed Data: { id: ${e.id}, orga: ${orgaData}, amount: ${ocrData} }`);

            parentPort.postMessage({
                id: e.id,
                orga: orgaData || null,
                amount: ocrData || null
            });

            return (index + 1 < data.length)
                ? classifyItem(data, index + 1)
                : process.exit(0);
        });
    });
};

classifyItem(workerData.data, 0);
