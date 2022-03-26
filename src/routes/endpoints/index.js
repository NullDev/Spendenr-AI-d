"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

/**
 * Index / Root
 *
 * @param {import("express").Request} _
 * @param {import("express").Response} res
 * @returns {Promise<any>} JSON
 */
module.exports = async function(_, res){
    return res.set({
        "Content-Type": "application/json; charset=utf-8"
    }).status(405).send({ status: 405, message: "Method not allowed" });
};
