"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

// Utils
let log = require("../utils/logger");
let getRoutes = require("../utils/getRoutes");

// Routes
let notFoundHandler = require("./endpoints/404");
let queue = require("../classifier/queue");

let logRoutes = r => r.forEach(e => log.info(`Route ${e.path} registered with methods ${(e.methods).join(", ")}`));

/**
 * Main Router
 *
 * @param {import("express").Application} app
 */
module.exports = function(app){
    app.post("/classify", (req, res) => queue(req, res));

    app.get("*", (req, res) => notFoundHandler(req, res));

    logRoutes(getRoutes(app));
};
