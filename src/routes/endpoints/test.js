"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

let log = require("../../utils/logger");

/**
 * Mock-Endpoint to post to localhost for testing
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<any>} JSON
 */
module.exports = async function(req, res){
    log.info(`Got Data on Mock-Endpoint: { id: ${req.body.id}, orga: ${req.body.orga}, amount: ${req.body.amount} }`);

    return res.set({
        "Content-Type": "application/json; charset=utf-8"
    }).status(200).send({ status: 200, message: "ok" });
};
