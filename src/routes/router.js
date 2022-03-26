"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

// Utils
const log = require("../utils/logger");
const getRoutes = require("../utils/getRoutes");
const config = require("../utils/configHandler").getConfig();

// Routes
const notFoundHandler = require("./endpoints/404");
const test = require("./endpoints/test");
const index = require("./endpoints/index");
const queue = require("../classifier/queue");

const logRoutes = r => r.forEach(e => log.info(`Route ${e.path} registered with methods ${(e.methods).join(", ")}`));

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
