"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

/* eslint-disable curly */

// core modules
const { Worker } = require("worker_threads");
const path = require("path");

// Utils
const config = require("../utils/configHandler").getConfig();
const log = require("../utils/logger");

// dependencies
const fetch = require("node-fetch").default;

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

    log.info(`Received ${data.length} new image${data.length > 1 ? "s" : ""}!`);

    const worker = new Worker(path.join(__dirname, "classify.js"), { workerData: { data }});

    worker.on("message", async(responseObject) => {
        await fetch(`${
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
        }).then(response => response.json()).then(d => {
            let r = "";

            try { r = JSON.stringify(d); }
            catch (e){ r = d; }

            log.done("Sent result: " + r);
        }).catch(err => log.error(err));
    });

    worker.on("error", err => log.error(err));

    worker.on("exit", (code) => ((code !== 0)
        ? log.error(`Worker stopped with exit code ${code}`)
        : log.done("Finished batch!"))
    );

    return 1;
};
