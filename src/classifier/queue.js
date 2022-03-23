"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

/* eslint-disable curly */

// core modules
let path = require("path");
let fs = require("fs");
let https = require("https");

// dependencies
let uuid = require("uuid");
let fetch = require("node-fetch").default;

// Utils
let config = require("../utils/configHandler").getConfig();
let log = require("../utils/logger");

// Services
let orga = require("../classifier/orga");
let ocr = require("../classifier/ocr");

/**
 * Classification queue
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<any>} JSON
 */
module.exports = async function(req, res){
    if (req.headers.token !== config.auth.secret) return res.set({
        "Content-Type": "application/json; charset=utf-8"
    }).status(403).send({ status: 403, message: "Forbidden - Invalid token" });

    const data = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) return res.set({
        "Content-Type": "application/json; charset=utf-8"
    }).status(400).send({ status: 400, message: "Malformed request" });

    res.set({
        "Content-Type": "application/json; charset=utf-8"
    }).status(200).send({ status: 200, message: "Success - Transmitted" });

    log.info("Received new images!");

    return data.forEach(async e => {
        let name = `${e.id}__${uuid.v4()}.jpg`;
        let file = fs.createWriteStream(path.resolve(`./image_cache/${name}`));
        https.get(config.result_server.image_getter + "?postId=" + e.id + "&apiAuth=" + config.result_server.secret, httpStream => {
            let stat = httpStream.pipe(file);
            stat.on("finish", async() => {
                let orgaData = await orga(name);
                let ocrData = await ocr(name);

                fs.unlink(path.resolve(`./image_cache/${name}`), () => {});

                let responseObject = {
                    id: e.id,
                    orga: orgaData || null,
                    amount: ocrData || null
                };

                log.done(`Finished classifying: { id: ${e.id}, orga: ${orgaData}, amount: ${ocrData} }`);

                fetch(`${
                    config.server.dev_mode
                        ? `http://localhost:${config.server.port}${config.server.base_url}/test`
                        : config.result_server.uri
                }`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                        apiAuth: config.result_server.secret
                    },
                    body: JSON.stringify(responseObject)
                });
            });
        });
    });
};
