"use strict";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

/**
 * Formats the current time
 *
 * @returns {string} Time
 */
let getDate = function(){
    const date = new Date();
    let hourData = date.getHours();
    let minData = date.getMinutes();
    let secData = date.getSeconds();

    let hour = (hourData < 10 ? "0" : "") + hourData;
    let min = (minData  < 10 ? "0" : "") + minData;
    let sec = (secData  < 10 ? "0" : "") + secData;

    return "[" + hour + ":" + min + ":" + sec + "]";
};

/**
 * Get the StackTrace of the calee function
 *
 * @returns {String} StackTrace
 */
let getTrace = function(){
    let err = new Error();

    // Parse the whole stacktrace
    let callerLine = err.stack.split("\n");

    // Get everything after the third line
    let splitArr = callerLine.filter((_, index) => index > 1);
    let cleanArr = "";

    for (let element of splitArr){
        // We want to end the trace once we reach the stack comming from dependencies
        if (element.match(/(node_modules)/gi)) break;

        // If it isn't the first line, pad the string according to our logger structure
        cleanArr += cleanArr.length ? "                 " : "";

        // remove the "at xyz" string and terminate the line
        cleanArr += element.replace(/(    at )/gi, "") + "\n";
    }

    // Remove last occurrence of a new line character in order to continue logging seamlessly
    return cleanArr.substring(0, cleanArr.lastIndexOf("\n")) + cleanArr.substring(cleanArr.lastIndexOf("\n") + 1);
};

module.exports = {
    error(input){
        console.log(
            " \x1b[41m\x1b[315m x \x1b[0m\x1b[31m [ERROR] " + getDate() + " - " + input + "\n" +
            "     StackTrace: " + getTrace() + "\x1b[0m"
        );
    },

    warn(input){
        console.log(" \x1b[43m\x1b[30m ! \x1b[0m\x1b[33m [WARN]  " + getDate() + " - " + input + "\x1b[0m");
    },

    info(input){
        console.log(" \x1b[44m\x1b[30m i \x1b[0m\x1b[36m [INFO]  " + getDate() + " - " + input + "\x1b[0m");
    },

    done(input){
        console.log(" \x1b[42m\x1b[30m ✓ \x1b[0m\x1b[32m [DONE]  " + getDate() + " - " + input + "\x1b[0m");
    }
};
