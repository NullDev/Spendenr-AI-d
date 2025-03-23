import Log from "../src/util/log";
import { config } from "../config/config";

// =========================== //
// = Copyright (c) TheShad0w = //
// =========================== //

/**
 * Send a sample request to the server
 */
const sendSampleRequest = async function(){
    const sampleData = [
        {
            id: 1,
            url: "https://images.pr0gramm.com/2024/04/02/95ea76e89bc9b3ef.png",
        },
        {
            id: 2,
            url: "https://images.pr0gramm.com/2024/03/31/d2133f78d14d73d7.jpg",
        },
        {
            id: 3,
            url: "https://images.pr0gramm.com/2024/03/31/726f3792bf49b02c.jpg",
        },
        {
            id: 4,
            url: "https://images.pr0gramm.com/2024/03/31/ba47a283e542e14a.jpg",
        },
    ];

    const response = await fetch(`http://localhost:${config.server.port}/spenden/classify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(sampleData),
    });

    const data = await response.json();
    Log.done(`Sample request sent: ${JSON.stringify(data)}`);
};

(async() => await sendSampleRequest())();
