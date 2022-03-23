"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

/**
 * No route found
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<any>} JSON
 */
module.exports = async function(req, res){
    return res.set({
        "Content-Type": "application/json; charset=utf-8"
    }).status(404).send({ status: 404, message: "Not Found" });
};
