import fs from "fs"
import rp from "request-promise"

const totalFloors = 23;

async function start() {

    const masterSheet = (await rp({
        uri: "https://interactive.guim.co.uk/docsdata-test/1LrF2lzNImp1XdlwbSAlLkf0nbpEhzvzSU-3PXrUH7ws.json",
        json: true
    })).sheets["Duplicate name list for interactive"];

    const published = masterSheet.filter(d => d["appearing_in_S3_tool"] === "Y");
 
    const links = published.map(d => d["s3 url"]).filter(d => d !== "");

    const allRequests = links.map(d => rp(d));

    const firstTen = allRequests.slice(0, 9);

    const appData = allRequests
      
    const floorsArr = published.reduce(function (r, a) {
        a.floorNum = getFloorNum(a);
        r[a.floorNum] = r[a.floorNum] || [];
        r[a.floorNum].push(a);
        //console.log(a["FLOOR NUMBER (* indicates didn\'t die on that floor)"], r[a["FLOOR NUMBER (* indicates didn\'t die on that floor)"]].length)
        return r;
    }, Object.create(null));

    var floorsObjArr = [];
    var num = 0;
    while(num <= totalFloors) { 
       var tmpOb = {};
       tmpOb.floorNum = num.toString();
       tmpOb.count = getFloorCount(num.toString());
       floorsObjArr.push(tmpOb)
       num++; 
    } 


    function getFloorCount(s){
        console.log(s)
        var newCount = 0;
        Object.values(floorsArr).map((d,i) => { 
            if(d[0].floorNum === s){
                newCount = d.length;
            }
        });

        
        return newCount;
    }
   
    


    Promise.all(appData)
        .then(d => {      
            fs.writeFileSync("./src/assets/appData.json", '[' + d + ']'); 
        })
        .catch(err => {
            console.log("ERROR",err);
        });

    Promise.all(firstTen)
        .then(d => {
            // var tempArr = []; tempArr doesnt work
            // tempArr.push(d);
            // need to wrap resulting file in [ ] for it to work
            fs.writeFileSync("./src/assets/firstTen.json", d); //JSON.stringify(tempArr)
        })
        .catch(err => {
            console.log("ERROR",err);
        });

    fs.writeFileSync("./src/assets/floorsArr.json", JSON.stringify(floorsObjArr)) ;   


}


function getFloorNum(a){
    var n = a["FLOOR NUMBER (* indicates didn\'t die on that floor)"];

    if(n.length > 2 && n!="Non resident"){
       
        n = n.slice(0, -1);
        a.didNotLiveOnFloor = true;
        //console.log(n)
    }

    return n

}

start();

