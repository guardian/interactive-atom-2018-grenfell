// javascript goes here

import axios from 'axios'
import Handlebars from 'handlebars/dist/handlebars'

import listTemplate from "../templates/list.html"


var previousSelection;

function init() {
    axios.get(`${process.env.PATH}/assets/data/grenfell-test-data.json`).then((resp) => {
        buildView(resp.data);
    });


}


function buildView(data) {
    const listHTML = compileListHTML(data);
    document.querySelector('.gren-list-wrapper').innerHTML = listHTML;
    addListeners();
}


function compileListHTML(dataIn) {

    console.log(dataIn)

    Handlebars.registerHelper('html_decoder', function(text) {
        var str = unescape(text).replace(/&amp;/g, '&');
        return str;
    });



    var content = Handlebars.compile(
        listTemplate, {
            compat: true
        }
    );

    var newHTML = content(dataIn);

    return newHTML

}

function addListeners() {
    document.querySelectorAll(".gren-list-name").forEach((el) => {
        el.addEventListener('mouseover', function() { showLinkedInfo(this.getAttribute("key-ref")) });
    })
}

function showLinkedInfo(n) {

	if (previousSelection){
		previousSelection.classList.add("hide");
	}

	document.querySelectorAll(".gren-list-biog").forEach((el) => {
		let nn = el.getAttribute("key-ref");
		console.log(el)
		if(n == nn){
			el.classList.remove("hide");
			previousSelection = el;

		}

	})
}


init();