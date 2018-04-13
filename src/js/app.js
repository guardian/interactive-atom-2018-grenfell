// javascript goes here

import axios from 'axios'
import Handlebars from 'handlebars/dist/handlebars'

import listTemplate from "../templates/list.html"

const floors = 24;

const screenWidth = window.innerWidth;
const isMobile = screenWidth < 740;

var previousShortList, previousLongList, previousListName, initAni;

function init() {
    axios.get(`${process.env.PATH}/assets/data/grenfell-test-data.json`).then((resp) => {
        var data = setData(resp.data);
        buildView(data);
    });
}

function setData(data){
    data.forEach((d) => {

        d.shortBio = d.bio.split(" ");

        d.shortBio = d.shortBio.slice( 0, 20).join(" ")+"…";
        
    })

    return data;

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
    // document.querySelectorAll(".gren-list-name").forEach((el) => {
    //     el.addEventListener('click', function() { showLinkedInfo(this.getAttribute("key-ref")) });
    // })

    document.querySelectorAll(".gren-list-item").forEach((el) =>{
        el.addEventListener('click', function() { showFullBio(this.getAttribute("key-ref")) });
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
    var finalEl = document.querySelector(".floor-6");
    document.querySelectorAll(".gren-floor").forEach((el) => {
        var delay = ((floors - el.getAttribute("floor-ref")) / 30) + "s";
        el.classList.add("floor-ani");
        el.style.animationDelay = delay;
  
    })

    finalEl.addEventListener('animationend', function(event) {
       listAni();
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
    var finalEl;

    document.querySelectorAll(".list-item-short").forEach((el) => {
        var delay = ((el.getAttribute("key-ref")) / 20 )+ "s";
        
        el.classList.add("animated");
        el.style.animationDelay = delay;
        finalEl = el;
    })

    finalEl.addEventListener('animationend', function(event) {
       document.querySelectorAll(".list-item-short").forEach((el) => { 
        el.style = "";
        el.classList.remove("animated");
        el.classList.add("animation-done");
        console.log(el)
    })
    }, false);
}



function showFullBio(n){
    if (previousShortList) {
        previousShortList.classList.remove("hide");
        
    }

    if (previousLongList) {
        previousLongList.classList.add("hide");
    }

   


    document.querySelectorAll(".list-item-short").forEach((el) => {
        let nn = el.getAttribute("key-ref");
        
        if (n == nn) {
            el.classList.add("hide");
            previousShortList = el;
        }

    })

    document.querySelectorAll(".list-item-long").forEach((el) => {
        let nn = el.getAttribute("key-ref");
       
        if (n == nn) {
            el.classList.remove("hide");
            el.classList.add("animated");
            previousLongList = el;
        }

    })


    document.querySelectorAll(".list-item-short-name").forEach((el) => {    
            el.classList.add("neutral-86");
            previousListName = el;
    })

    

   
}


init();