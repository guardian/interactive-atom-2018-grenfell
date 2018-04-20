import fs from "fs"
import rp from "request-promise"

async function start() {
    const masterSheet = (await rp({
        uri: "https://interactive.guim.co.uk/docsdata-test/1LrF2lzNImp1XdlwbSAlLkf0nbpEhzvzSU-3PXrUH7ws.json",
        json: true
    })).sheets["Duplicate name list for interactive"];

    const links = masterSheet.filter(d => d["appearing_in_S3_tool"] === "Y").map(d => d["s3 url"]).filter(d => d !== "");

    const allRequests = links.map(d => rp(d));

    const firstTen = allRequests.slice(0, 9);

    const appData = allRequests.slice(10, allRequests.length);

    Promise.all(appData)
        .then(d => {
            fs.writeFileSync("./src/assets/appData.json", d); //JSON.stringify(d)
        })
        .catch(err => {
            console.log(err);
        });

    Promise.all(firstTen)
        .then(d => {
            fs.writeFileSync("./src/assets/firstTen.json", d); //JSON.stringify(d)
        })
        .catch(err => {
            console.log(err);
        });
}

start();

