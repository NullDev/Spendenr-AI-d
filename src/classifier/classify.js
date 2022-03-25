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

workerData.data.forEach(e => {
    let name = `${e.id}__${uuid.v4()}.jpg`;
    let file = fs.createWriteStream(path.resolve(`./image_cache/${name}`));
    https.get(config.result_server.image_getter + "?apiAuth=" + config.result_server.secret + "&postId=" + e.id, httpStream => {
        let stat = httpStream.pipe(file);
        stat.on("finish", async() => {
            let orgaData = await orga(name);
            let ocrData = await ocr(name);

            fs.unlink(path.resolve(`./image_cache/${name}`), () => {});

            log.done(`Finished classifying: { id: ${e.id}, orga: ${orgaData}, amount: ${ocrData} }`);

            return parentPort.postMessage({
                id: e.id,
                orga: orgaData || null,
                amount: ocrData || null
            });
        });
    });
});
