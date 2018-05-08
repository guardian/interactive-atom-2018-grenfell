import fs from 'fs'
import groupBy from 'lodash.groupby'
import Handlebars from 'handlebars/dist/handlebars'
import rp from "request-promise"

import templateHTML from "./src/templates/main.html!text"
import listTemplate from "./src/templates/list.html!text"

import floorCountsArr from "../src/assets/floorsArr.json" //generated by fetch helper in scripts

export async function render() {

	// this function just has to return a string of HTML
	// you can generate this using js, e.g. using Mustache.js

	const shortData = JSON.parse(fs.readFileSync("./src/assets/initial_data.json"));

	const data = setData();

	shortData.forEach((d,i) => {
		d.bio = " ";
		d.name= d["Name"];
        d.shortBio = d["Short-biog"];
        d.grid_photo = d["Pic-url"];

        if(d["Long-biog"]){ d.bio = JSON.stringify(d["Long-biog"]) }
        // if(d["Long-biog"]){ d.bio = JSON.stringify(d["Long-biog"]).split('\r\') };
        // console.log(d.bio )
        // d.shortBio = d.shortBio.slice( 0, 20).join(" ")+"…";     
    })

	data.shortData = shortData;

	data.floorsArr = data;

	const renderedHTML = renderHTML(data);

    return renderedHTML;
}


function formatShortData(data){
	data.forEach((d) => {
        // d.shortBio = d["Short-biog"].split(" ");
        // d.shortBio = d.shortBio.slice( 0, 20).join(" ")+"…";        

       // console.log(d.Name)
    })


}

function renderHTML(dataIn){

	console.log(dataIn)


	Handlebars.registerHelper('nl2br', function (text, isXhtml) {
	  var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br />' : '<br>';
	  return (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
	});
	
    Handlebars.registerHelper('html_decoder', function(text) {
        var str = unescape(text).replace(/&amp;/g, '&');
        return str;
    });


    var content = Handlebars.compile(
        templateHTML, {
            compat: true
        }
    );

    var newHTML = content(dataIn);

    return newHTML

}

function setData(){
	const floors = 23;
	const reqNames = 71;
	const names = [];
	const tempArr = [];

		// repeat :: forall a. Int -> (a -> a) -> a -> a
	const repeat = n => f => x => {
	  if (n > 0)
	    return repeat (n - 1) (f) (f (x))
	  else
	    return x
	}

	// times :: Int -> (Int -> Int) -> Int 
	const times = n=> f=>
	  repeat (n) (i => (f(i), i + 1)) (0)

	// use it
	times (reqNames) (i => { let entry={}; 
		entry.refNum = i; 
		entry.firstName = makeRandomName(6); 
		entry.secondName = makeRandomName(9);
		entry.floor = Math.floor(Math.random() * Math.floor(23));
		names.push(entry); 
	} );

	const floorsArr = groupBy(names, function(el) {
	  	return el.floor;
	});


	Object.entries(floorsArr).forEach(([key, value]) => { 
		var tempObj = {}; 
		tempObj.floorNum = getFloorNum(key); 
		tempObj.objArr = value; 
		tempObj.count = getFloorCount(key);
		tempArr.push(tempObj); 
	}); 


	const max = tempArr.reduce(function(prev, current) {
	    return (prev.count > current.count) ? prev : current
	})


	tempArr.forEach((el, i ) => {
		el.pcOfMax = 100 - (Math.round((el.count/max.count)*100));
		el.widthShim = el.count * 5;
	})

	tempArr.reverse(); 

	return tempArr;

}

function getFloorNum(n){	
	return n;
}

function getFloorCount(n){
	var count = 0;
	floorCountsArr.forEach((floor) => {
		if (floor.floorNum == n){
			count = floor.count;
		}
	})
	return count;

}

function makeRandomName(strLength) {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz";

  for (var i = 0; i < strLength; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}