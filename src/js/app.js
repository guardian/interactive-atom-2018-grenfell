// javascript goes here

import axios from 'axios'
import Handlebars from 'handlebars/dist/handlebars'
import throttle from 'lodash.throttle';

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

function addScrollListeners(){
    var els = document.querySelectorAll(".list-item-short");

        window.addEventListener('scroll', throttle(function (event) {
            
            var elsInView = [];

            els.forEach((el) => {
                if (isInViewport(el)) {
                   
                    elsInView.push(el);
                }

                if (!isInViewport(el)) {
                    el.querySelector('.gren-list-name').classList.remove('animated');
                    el.querySelector('.gren-list-name').classList.add('neutral-86');
                    el.querySelector('.gren-list-name').style = "";
                }
            })  

            elsInView.forEach((el,i) => {
                 el.querySelector('.gren-list-name').style.animationDelay = (i * 0.1)+"s";
                 el.querySelector('.gren-list-name').classList.remove('neutral-86');
                    el.querySelector('.gren-list-name').classList.add('animated');
            })

            // var nn = 0;

            // var tgtEl;
            // elsInView.forEach((el) => {
            //     if(el.getAttribute("key-ref") > nn){
            //         nn = el.getAttribute("key-ref");

            //         tgtEl = el;
            //     }
            // })
            // if(tgtEl){
            //     tgtEl.querySelector('.gren-list-name').classList.remove('neutral-86')
            // }
            
            if (previousLongList) {
                previousLongList.classList.add("hide");
            }


        }, 500), false);

}


var isInViewport = function (elem) {
    var bounding = elem.getBoundingClientRect();
    
    return (
        bounding.top >= ((window.innerHeight * 0.25) || (document.documentElement.clientHeight * 0.25)) 
        && bounding.left >= 0 
        && bounding.bottom <= ((window.innerHeight * 0.5) || (document.documentElement.clientHeight * 0.5)) 
        && bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
    );

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
    })

    addScrollListeners();
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

        if (n != nn) {
            el.querySelector(".list-item-short-name").classList.remove("animated");
            el.querySelector(".list-item-short-name").classList.add("neutral-86");
        }
        
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