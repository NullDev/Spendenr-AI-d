"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

// Utils
let log = require("../utils/logger");
let getRoutes = require("../utils/getRoutes");
let config = require("../utils/configHandler").getConfig();

// Routes
let notFoundHandler = require("./endpoints/404");
let test = require("./endpoints/test");
let index = require("./endpoints/index");
let queue = require("../classifier/queue");

let logRoutes = r => r.forEach(e => log.info(`Route ${e.path} registered with methods ${(e.methods).join(", ")}`));

/**
 * Main Router
 *
 * @param {import("express").Application} app
 */
module.exports = function(app){
    app.get(config.server.base_url + "/", (req, res) => index(req, res));

    app.post(config.server.base_url + "/classify", (req, res) => queue(req, res));

    app.post(config.server.base_url + "/test", (req, res) => test(req, res));

    app.get("*", (req, res) => notFoundHandler(req, res));

    logRoutes(getRoutes(app));
};
