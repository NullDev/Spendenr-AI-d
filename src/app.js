"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

// Dependencies
let express = require("express");
let cors = require("cors");
let helmet = require("helmet").default;
let bodyParser = require("body-parser");

// Utils
let conf = require("./utils/configHandler");
let log = require("./utils/logger");
let portHandler = require("./utils/portCheck");

let appname = conf.getName();
let version = conf.getVersion();
let devname = conf.getAuthor();

let splashPadding = 12 + appname.length + version.toString().length;
console.log(
    "\n" +
    ` #${"-".repeat(splashPadding)}#\n` +
    ` # Started ${appname} v${version} #\n` +
    ` #${"-".repeat(splashPadding)}#\n\n` +
    ` Copyright (c) ${(new Date()).getFullYear()} ${devname}\n`
);

let app = express();

log.info(`Starte ${appname}...`);
const config = conf.getConfig();

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
