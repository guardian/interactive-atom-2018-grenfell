import fs from "fs"
import rp from "request-promise"

async function start() {
    const masterSheet = (await rp({
        uri: "https://interactive.guim.co.uk/docsdata-test/1LrF2lzNImp1XdlwbSAlLkf0nbpEhzvzSU-3PXrUH7ws.json",
        json: true
    })).sheets["Duplicate name list for interactive"];

    const links = masterSheet.map(d => d["Link to copy"]).filter(d => d !== "");

    const keys = links.map(c => c.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)[1]);

    const allRequests = keys.map(d => rp("https://interactive.guim.co.uk/docsdata-test/" + d + ".json"))

    Promise.all(allRequests)
        .then(d => {
            console.log(d);
        });
}

start();