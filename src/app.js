import { execSync } from "node:child_process";
import fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import queue from "./service/queue.js";
import Log from "./util/log.js";
import { config, meta } from "../config/config.js";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

const appname = meta.getName();
const version = meta.getVersion();
const author = meta.getAuthor();
const pad = 16 + appname.length + version.toString().length + author.length;
const tesseractVersion = execSync("tesseract --version").toString().split("\n")[0].split(" ")[1].trim();

Log.raw(
    "\n" +
    " #" + "-".repeat(pad) + "#\n" +
    " # Started " + appname + " v" + version + " by " + author + " #\n" +
    " #" + "-".repeat(pad) + "#\n",
);

Log.info("--- START ---");
Log.info(appname + " v" + version + " by " + author);

Log.debug("Node Environment: " + process.env.NODE_ENV, true);
Log.debug("NodeJS version: " + process.version, true);
Log.debug("OS: " + process.platform + " " + process.arch, true);
Log.debug("Tesseract version: " + tesseractVersion, true);
Log.debug("Result Server: " + process.env.NODE_ENV !== "production"
    ? `http://localhost:${config.server.port}${config.server.base_url}/test`
    : config.result_server.uri
, true);

const server = fastify({
    logger: false,
    ignoreTrailingSlash: true,
    trustProxy: true,
});

server.register(cors, { origin: "*" });
server.register(helmet, {});

// Index
server.get(config.server.base_url + "/", (_, reply) => {
    reply.status(200).send({
        status: "ok",
        app: appname,
        author,
        version,
        env: process.env.NODE_ENV,
        uptime: process.uptime(),
        node_version: process.version,
        tesseract_version: tesseractVersion,
    });
});

// Classify
server.post(config.server.base_url + "/classify", (
    /** @type {import("fastify").FastifyRequest<{ Body: Array<{ id: Number, url: String }> }>} */ req,
    reply,
) => {
    if (req.headers.token !== config.auth.secret){
        Log.warn("Unauthorized request to /classify");
        reply.status(401).send({ status: 401, message: "Unauthorized" });
        return;
    }

    const batch = req.body;
    if (!batch || !Array.isArray(batch) || batch.length === 0){
        Log.warn("Invalid request to /classify");
        reply.status(400).send({ status: 400, message: "Malformed Request" });
        return;
    }

    Log.info(`Received ${batch.length} new image${batch.length > 1 ? "s" : ""}!`);

    for (const data of batch) queue(data);

    Log.info("All images queued for processing.");

    reply.status(200).send({
        status: "ok",
        message: "Images queued for processing",
    });
});

// Test Route
server.post(config.server.base_url + "/test", (
    /** @type {import("fastify").FastifyRequest<{ Body: {id: Number, orga: String, amount: Number} }>} */ req,
    reply,
) => {
    Log.info(`Got Data on Mock-Endpoint: { id: ${req.body.id}, orga: ${req.body.orga}, amount: ${req.body.amount} }`);

    reply.status(200).send({
        status: "ok",
        message: "Test successful",
        data: {
            id: req.body.id,
            orga: req.body.orga,
            amount: req.body.amount,
        },
    });
});

// 404
server.setNotFoundHandler((_, reply) => reply.status(404).send({ status: 404, message: "Not Found" }));

server.listen({
    port: config.server.port,
}, (err, address) => {
    if (err) Log.error("Failed to start Fastify Server: ", err);
    Log.done(`Fastify Server listening on ${address}`);
});

process.on("unhandledRejection", (
    /** @type {Error} */ err,
) => Log.error("Unhandled promise rejection: ", err));
