import fs from "node:fs/promises";
import fss from "node:fs";
import path from "node:path";

// ========================= //
// = Copyright (c) NullDev = //
// ========================= //

const appNameFromPackageJson = await fs.readFile(path.resolve("./package.json"), "utf-8").then(d => JSON.parse(d).name);

/**
 * Logging utility class
 *
 * @class Log
 */
class Log {
    static #logDir = path.resolve("./logs");
    static #eLogDir = path.resolve("./logs/errors");

    /**
     * Get neatly formatted date
     *
     * @return {string}
     * @static
     * @memberof Log
     */
    static #getDate(){
        const options = {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false, // eslint-disable-next-line new-cap
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        const date = new Intl.DateTimeFormat(
            "en-US",
            /** @type {Intl.DateTimeFormatOptions} */ (options),
        ).format(new Date());

        return "[" + date + "]";
    }

    /**
     * Log to file
     *
     * @param {string} input
     * @param {boolean} [error=false]
     * @memberof Log
     */
    static async #logTofile(input, error = false){
        const date = new Date();
        const m = (date.getMonth() + 1).toString().padStart(2, "0");
        const d = date.getDate().toString().padStart(2, "0");

        const logFile = `${appNameFromPackageJson}-${d}-${m}-${date.getFullYear()}-output.log`;
        const fd = await fs.open(path.resolve(this.#logDir, logFile), "a");
        await fd.write(input + "\n");
        await fd.close();

        if (error){
            const errFile = `${appNameFromPackageJson}-${d}-${m}-${date.getFullYear()}-errors.log`;
            const fe = await fs.open(path.resolve(this.#eLogDir, errFile), "a");
            await fe.write(input + "\n");
            await fe.close();
        }
    }

    /**
     * Make sure log directories exist
     *
     * @memberof Log
     */
    static #ensureDirs(){
        if (!fss.existsSync(this.#logDir)){
            fss.mkdirSync(this.#logDir);
            fss.closeSync(fss.openSync(path.resolve(this.#logDir, ".gitkeep"), "w"));
        }
        if (!fss.existsSync(this.#eLogDir)){
            fss.mkdirSync(this.#eLogDir);
            fss.closeSync(fss.openSync(path.resolve(this.#eLogDir, ".gitkeep"), "w"));
        }
    }

    /**
     * Perform log action
     *
     * @param {string} str
     * @param {string} log
     * @param {boolean} [error=false]
     * @memberof Log
     */
    static #logger(str, log, error = false){
        console.log(str);
        this.#ensureDirs();
        this.#logTofile(log, error);
    }

    /**
     * Log an error
     *
     * @static
     * @param {string} input
     * @param {Error} [trace]
     * @memberof Log
     */
    static error(input, trace){
        const log = "[ERROR] " + this.#getDate() + " - " + input;
        this.#logger(" \x1b[41m\x1b[315m x \x1b[0m\x1b[31m " + log + "\x1b[0m", log, true);
        if (trace && trace.stack){
            const eLog = "[TRACE] " + this.#getDate() + " - " + trace.stack;
            this.#logger(" \x1b[41m\x1b[315m x \x1b[0m\x1b[31m " + eLog + "\x1b[0m", eLog, true);
        }
    }

    /**
     * Log a warning
     *
     * @static
     * @param {string} input
     * @memberof Log
     */
    static warn(input){
        const log = "[WARN]  " + this.#getDate() + " - " + input;
        this.#logger(" \x1b[43m\x1b[30m ! \x1b[0m\x1b[33m " + log + "\x1b[0m", log);
    }

    /**
     * Log a debug message
     * (only if NODE_ENV is set to development)
     *
     * @static
     * @param {string} input
     * @param {boolean} [force=false]
     * @memberof Log
     */
    static debug(input, force = false){
        if (process.env.NODE_ENV !== "development" && !force) return;
        const log = "[DEBUG] " + this.#getDate() + " - " + input;
        this.#logger(" \x1b[45m\x1b[30m d \x1b[0m\x1b[35m " + log + "\x1b[0m", log);
    }

    /**
     * Log a wait message
     *
     * @static
     * @param {string} input
     * @memberof Log
     */
    static wait(input){
        const log = "[WAIT]  " + this.#getDate() + " - " + input;
        this.#logger(" \x1b[46m\x1b[30m ⧖ \x1b[0m\x1b[36m " + log + "\x1b[0m", log);
    }

    /**
     * Log an info
     *
     * @static
     * @param {string} input
     * @memberof Log
     */
    static info(input){
        const log = "[INFO]  " + this.#getDate() + " - " + input;
        this.#logger(" \x1b[44m\x1b[30m i \x1b[0m\x1b[36m " + log + "\x1b[0m", log);
    }

    /**
     * Log a success
     *
     * @static
     * @param {string} input
     * @memberof Log
     */
    static done(input){
        const log = "[DONE]  " + this.#getDate() + " - " + input;
        this.#logger(" \x1b[42m\x1b[30m ✓ \x1b[0m\x1b[32m " + log + "\x1b[0m", log);
    }

    /**
     * Log a message without any formatting
     *
     * @static
     * @param {string} input
     * @memberof Log
     */
    static raw(input){
        this.#logger(input, input);
    }
}

export default Log;
