import fs from "fs"
import rp from "request-promise"

async function start() {
    const masterSheet = (await rp({
        uri: "https://interactive.guim.co.uk/docsdata-test/1LrF2lzNImp1XdlwbSAlLkf0nbpEhzvzSU-3PXrUH7ws.json",
        json: true
    })).sheets["Duplicate name list for interactive"];

    const links = masterSheet.filter(d => d["appearing_in_S3_tool"] === "Y").map(d => d["s3 url"]).filter(d => d !== "");

    const allRequests = links.map(d => rp(d));

    Promise.all(allRequests)
        .then(d => {
            fs.writeFileSync("./src/assets/all.json", d);
        })
        .catch(err => {
            console.log(err);
        });
}

start();