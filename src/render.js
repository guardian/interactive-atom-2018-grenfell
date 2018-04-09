import groupBy from 'lodash/groupby'
import Handlebars from 'handlebars/dist/handlebars'

import templateHTML from "./src/templates/main.html!text"

export async function render() {
	// this function just has to return a string of HTML
	// you can generate this using js, e.g. using Mustache.js

	const data = setData();

	const renderedHTML = renderHTML(data);

    return renderedHTML;
}


function renderHTML(dataIn){

    Handlebars.registerHelper('html_decoder', function(text) {
        var str = unescape(text).replace(/&amp;/g, '&');
        return str;
    });

    // Handlebars.registerPartial({
    //     'headerItem': paraItem,

    // });

    var content = Handlebars.compile(
        templateHTML, {
            compat: true
        }
    );

    var newHTML = content(dataIn);

    return newHTML

}

function setData(){
	const floors = 24;
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
		entry.floor = Math.floor(Math.random() * Math.floor(24));
		names.push(entry); 
	} );

	const floorsArr = groupBy(names, function(el) {
	  	return el.floor;
	});


	Object.entries(floorsArr).forEach(([key, value]) => { 
		var tempObj = {}; 
		tempObj.floorNum = key; 
		tempObj.objArr = value; 
		tempObj.count = tempObj.objArr.length
		tempArr.push(tempObj); 
	}); 


	const max = tempArr.reduce(function(prev, current) {
	    return (prev.count > current.count) ? prev : current
	})


	tempArr.forEach((el, i ) => {
		el.pcOfMax = Math.round((el.count/max.count)*100);
	})

	tempArr.reverse(); 

	return tempArr;

}



function makeRandomName(strLength) {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz";

  for (var i = 0; i < strLength; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}