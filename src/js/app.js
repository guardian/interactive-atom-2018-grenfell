// javascript goes here

import axios from 'axios'
import Handlebars from 'handlebars/dist/handlebars'

import listTemplate from "../templates/list.html"

const floors = 24;

const screenWidth = window.innerWidth;
const isMobile = screenWidth < 740;

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
    floorsAni()
}


function compileListHTML(dataIn) {

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

function headlineAni() {
    
    let elOne = document.querySelector("#Headline");
    let elTwo = document.querySelector("#of_Grenfell");
    
    if (!isMobile) {
        elOne = document.querySelector("#Headline_L");
        elTwo = document.querySelector("#of_Grenfell_L");
    }

    let elThree = document.querySelector(".gren-standy");
    elOne.classList.add("animated");
    elTwo.classList.add("animated");


    elOne.addEventListener('animationend', function(event) {
        elThree.classList.add("animated");
    }, false);

    elThree.addEventListener('animationend', function(event) {
        listAni();
    }, false);
}

function floorsAni() {
    var finalEl;
    document.querySelectorAll(".gren-floor").forEach((el) => {
        var delay = ((floors - el.getAttribute("floor-ref")) / 15) + "s";
        el.classList.add("floor-ani");
        el.style.animationDelay = delay;
        finalEl = el;
    })

    finalEl.addEventListener('animationend', function(event) {
        headlineAni() 
    }, false);
}

function listAni() {
    document.querySelectorAll(".gren-list-name").forEach((el) => {
        var delay = ((el.getAttribute("key-ref")) / 10 )+ "s";
        //console.log(delay)
        el.classList.add("animated");
        el.style.animationDelay = delay;
    })
}

function showLinkedInfo(n) {

    if (previousSelection) {
        previousSelection.classList.add("hide");
    }

    document.querySelectorAll(".gren-list-biog").forEach((el) => {
        let nn = el.getAttribute("key-ref");
        console.log(el)
        if (n == nn) {
            el.classList.remove("hide");
            previousSelection = el;
        }

    })
}


init();