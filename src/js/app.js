// javascript goes here

import axios from 'axios'
import Handlebars from 'handlebars/dist/handlebars'

import listTemplate from "../templates/list.html"

const floors = 24;

const screenWidth = window.innerWidth;
const isMobile = screenWidth < 740;

var previousShortBio, previousBio;

function init() {
    axios.get(`${process.env.PATH}/assets/data/grenfell-test-data.json`).then((resp) => {
        var data = setData(resp.data);
        buildView(data);
    });
}

function setData(data){
    data.forEach((d) => {
        console.log(d);
        d.shortBio = "a Grenfell veteran – a resident for almost 40 years who would bring food downstairs and share it with his neighbours, picnicking outside.";
    })

    return data;

}


function buildView(data) {
    const listHTML = compileListHTML(data);
    document.querySelector('.gren-list-wrapper').innerHTML = listHTML;
    addListeners();
    headlineAni()
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
        el.addEventListener('click', function() { showLinkedInfo(this.getAttribute("key-ref")) });
    })

    document.querySelectorAll(".short-bio-expand").forEach((el) =>{
        el.addEventListener('click', function() { showLinkedBio(this.getAttribute("key-ref")) });
    })
}

function headlineAni() {
    
    let elOne = document.querySelector("#Headline");
    let elTwo = document.querySelector("#of_Grenfell");
    
    if (!isMobile) {
        elOne = document.querySelector("#Headline_L");
        elTwo = document.querySelector("#of_Grenfell_L");
    }

    
    elOne.classList.add("animated");
    elTwo.classList.add("animated");


    elOne.addEventListener('animationend', function(event) {
        standyAni()
    }, false);

    
}

function floorsAni() {
    var finalEl = document.querySelector(".floor-13");
    document.querySelectorAll(".gren-floor").forEach((el) => {
        var delay = ((floors - el.getAttribute("floor-ref")) / 15) + "s";
        el.classList.add("floor-ani");
        el.style.animationDelay = delay;
  
    })

    finalEl.addEventListener('animationend', function(event) {
       listAni()
   
    }, false);
}

function standyAni(){
    let elThree = document.querySelector(".gren-standy");
    elThree.classList.add("animated");

    elThree.addEventListener('animationend', function(event) {
        floorsAni();
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

    if (previousShortBio) {
        previousShortBio.classList.add("hide");
    }

    if (previousBio) {
        previousBio.classList.add("hide");
    }

    document.querySelectorAll(".short-biog").forEach((el) => {
        let nn = el.getAttribute("key-ref");
        console.log(el)
        if (n == nn) {
            el.classList.remove("hide");
            previousShortBio = el;
        }

    })
}

function showLinkedBio(n){
    if (previousBio) {
        previousBio.classList.add("hide");
    }

    if (previousShortBio) {
        previousShortBio.classList.add("hide");
    }

    document.querySelectorAll(".long-biog").forEach((el) => {
        let nn = el.getAttribute("key-ref");
        console.log(el)
        if (n == nn) {
            el.classList.remove("hide");
            previousBio = el;
        }

    })
}


init();