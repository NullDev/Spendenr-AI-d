import path from "node:path";
import { Worker } from "node:worker_threads";
import { performance } from "node:perf_hooks";
import Log from "../util/log.js";
import { config, meta } from "../../config/config.js";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

/**
 * Send result to the result server
 *
 * @param {{ id: Number, orga: String, amount: Number }} res
 */
const sendResult = async function(res){
    Log.info("Sending result to server: " + JSON.stringify(res));

    await fetch(`${
        process.env.NODE_ENV !== "production"
            ? `http://localhost:${config.server.port}${config.server.base_url}/test`
            : config.result_server.uri
    }`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": `${meta.getName()} v${meta.getVersion()} - ${meta.getAuthor()}`,
            apiAuth: config.result_server.secret,
        },
        body: JSON.stringify(res),
    }).then(response => response.json()).then(d => {
        let r = "";

        try { r = JSON.stringify(d); } // eslint-disable-next-line no-unused-vars
        catch (e){ r = d; }

        Log.done("Received submit answer: " + r);
    }).catch(err => Log.error(err));
};

/**
 * Queue an OCR job
 *
 * @param {{ id: Number, url: String }} p
 */
const queue = async function({ id, url }){
    if (!url || !id){
        Log.error("Queue: Missing url or id in Job");
        return;
    }

    const start = performance.now();

    const worker = new Worker(path.join(process.cwd(), "src", "service", "detector.js"), {
        workerData: { id, url },
    });

    worker.on("message", (message) => {
        const stop = performance.now();
        const time = Math.round(stop - start);
        Log.done(`OCR finished in ${time}ms`);

        sendResult(message);
    });

    worker.on("error", (error) => Log.error("Worker error: ", error));

    worker.on("exit", (code) => {
        if (code !== 0) Log.error(`Worker stopped with exit code ${code}`);
        else Log.info("Worker finished batch successfully");
    });
};

export default queue;
