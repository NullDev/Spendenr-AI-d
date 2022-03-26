"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

// Dependencies
const express = require("express");
const cors = require("cors");
const helmet = require("helmet").default;
const bodyParser = require("body-parser");

// Utils
const conf = require("./utils/configHandler");
const log = require("./utils/logger");
const portHandler = require("./utils/portCheck");

const appname = conf.getName();
const version = conf.getVersion();
const devname = conf.getAuthor();

const splashPadding = 12 + appname.length + version.toString().length;
console.log(
    "\n" +
    ` #${"-".repeat(splashPadding)}#\n` +
    ` # Started ${appname} v${version} #\n` +
    ` #${"-".repeat(splashPadding)}#\n\n` +
    ` Copyright (c) ${(new Date()).getFullYear()} ${devname}\n`
);

const app = express();

log.info(`Starting ${appname}...`);
const config = conf.getConfig();
log[config.server.dev_mode ? "warn" : "info"](`Dev-Mode is ${config.server.dev_mode ? "enabled" : "disabled"}`);

app.enable("trust proxy");

app.set("port", portHandler(config.server.port));

app.use(bodyParser.json());
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

require("./routes/router")(app);

process.on("unhandledRejection", (err, promise) => {
    log.error("Unhandled rejection (promise: " + promise + ", reason: " + err + ")");
});

app.listen(app.get("port"), (err) => {
    if (err){
        log.error(`Error on Port ${app.get("port")}: ${err}`);
        process.exit(1);
    }
    log.info(`Listening on Port ${app.get("port")}...`);
});
