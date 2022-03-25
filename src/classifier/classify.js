"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

// core modules
let path = require("path");
let fs = require("fs");
let https = require("https");
let { parentPort, workerData } = require("worker_threads");

// dependencies
let uuid = require("uuid");

// utils
let log = require("../utils/logger");
let config = require("../utils/configHandler").getConfig();

// Services
let orga = require("../classifier/orga");
let ocr = require("../classifier/ocr");

/**
 * Recursive batch processing
 *
 * @param {Array} data
 * @param {Number} index
 */
let classifyItem = async function(data, index){
    let e = data[index];
    let name = `${e.id}__${uuid.v4()}.jpg`;
    let file = fs.createWriteStream(path.resolve(`./image_cache/${name}`));
    https.get(config.result_server.image_getter + "?apiAuth=" + config.result_server.secret + "&postId=" + e.id, httpStream => {
        let stat = httpStream.pipe(file);
        stat.on("finish", async() => {
            log.done(`Downloaded ${name}`);

            let orgaData = await orga(name);
            let ocrData = await ocr(name);

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
