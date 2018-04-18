// javascript goes here

import axios from 'axios'
import Handlebars from 'handlebars/dist/handlebars'
import throttle from 'lodash.throttle';

import listTemplate from "../templates/list.html"

const floors = 24;

const screenWidth = window.innerWidth;
const isMobile = screenWidth < 740;

var previousShortList, previousLongList, previousListName, initAni, prevScroll, expandedBiogs = false;

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

    document.getElementById("expandAll").addEventListener('click',  function() { expandAllBiogs() });

    document.getElementById("hideAll").addEventListener('click',  function() { hideAllBiogs() });

}

//function addScrollListeners(){
    // var els = document.querySelectorAll(".list-item-short");
    // var headEl = document.getElementById("grenStandy");
    // var expandBtn;
    // var currScroll;
  
        // window.addEventListener('scroll', throttle(function (event) {
            
        //     expandedBiogs ? expandBtn = document.getElementById("hideAll") : expandBtn = document.getElementById("expandAll");

            
        //     !isInViewport(headEl) ?  expandBtn.classList.remove("hide") :  expandBtn.classList.add("hide") ;


    
        //     var elsInView = [];

        //     els.forEach((el) => {
        //         if (isInViewport(el)) {
        //             elsInView.push(el);
        //         }

        //         if (!isInViewport(el)) {
        //             el.querySelector('.gren-list-name').classList.remove('animated');
        //             el.querySelector('.gren-list-name').classList.add('neutral-86');
        //             el.querySelector('.gren-list-name').style = "";
        //         }
        //     })  

        //     currScroll = window.pageYOffset || document.documentElement.scrollTop;
            
        //     if(prevScroll && currScroll < prevScroll){ elsInView.reverse(); }

        //     highlightElsInView([ elsInView[ Math.round((elsInView.length-1)/3)], elsInView[ Math.round((elsInView.length-1)/3) + 1], elsInView[ Math.round((elsInView.length-1)/3) + 2] ] )
            
        //     prevScroll = currScroll;
        // }, 500), false);




//}

function resetListAni(){
    document.querySelectorAll(".animate-active").forEach((el) => {
                el.classList.remove("animate-active");
            })

    document.querySelectorAll(".short-bio-expand").forEach((el) => {
                el.classList.remove("animate-active");
            })
}

function highlightElsInView(a){
    
    resetListAni();

    if(a[0]){
        a.forEach((el,i) => {
                var aniDelay = ((i*0.15) + 0.2)+"s";
                console.log(aniDelay)
                el.querySelector('.gren-list-name').style.animationDelay = aniDelay;
                el.querySelector('.gren-list-name').classList.remove('neutral-86');
                el.querySelector('.gren-list-name').classList.add('animate-active');

                el.querySelector('.short-bio-expand').style.animationDelay = aniDelay;
                el.querySelector('.short-bio-expand').classList.add('animate-active');
            })
    }


        

}


var isInViewport = function (elem) {
    var bounding = elem.getBoundingClientRect();
    // bounding.top >= (window.innerHeight * 0.1 || document.documentElement.clientHeight * 0.1) 
    return (
        bounding.top >= 0 
        && bounding.left >= 0 
        && bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) 
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

    //addScrollListeners();
    }, false);
}

function expandAllBiogs(){
  expandedBiogs = true;  

    document.getElementById("expandAll").classList.add("hide");
    document.getElementById("hideAll").classList.remove("hide");

    document.querySelectorAll(".list-item-short").forEach((el) => {
            el.classList.add("hide");
    })

    document.querySelectorAll(".list-item-long").forEach((el) => {
            el.classList.remove("hide");
            el.classList.add("animated"); 
    })

}


function hideAllBiogs(){

    expandedBiogs = false;

    document.getElementById("expandAll").classList.remove("hide");
    document.getElementById("hideAll").classList.add("hide");

    document.querySelectorAll(".list-item-short").forEach((el) => {
            el.classList.remove("hide");
    })

    document.querySelectorAll(".list-item-long").forEach((el) => {
            el.classList.add("hide");
            el.classList.remove("animated"); 
    })

    
}

function showFullBio(n){
    if (previousShortList) {
        previousShortList.classList.remove("hide");  
    }

    if (previousLongList) {
        previousLongList.classList.add("hide");
    }

    resetListAni();

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

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}





/*! scrollStop.js | (c) 2017 Chris Ferdinandi | MIT License | http://github.com/cferdinandi/scrollStop */
/**
 * Run functions after scrolling has stopped
 * @param  {Function} callback The function to run after scrolling
 */

var scrollStop = function ( callback ) {

    // Make sure a valid callback was provided
    if ( !callback || Object.prototype.toString.call( callback ) !== '[object Function]' ) return;

    // Setup scrolling variable
    var isScrolling;

    // Listen for scroll events
    window.addEventListener('scroll', function ( event ) {

        // Clear our timeout throughout the scroll
        window.clearTimeout( isScrolling );

        // Set a timeout to run after scrolling ends
        isScrolling = setTimeout(function() {

            // Run the callback
            callback();

        }, 66);

    }, false);

};


// Example
scrollStop(function () {
    var els = document.querySelectorAll(".list-item-short");
    var headEl = document.getElementById("grenStandy");
    var expandBtn;
    var currScroll;
    expandedBiogs ? expandBtn = document.getElementById("hideAll") : expandBtn = document.getElementById("expandAll");

            !isInViewport(headEl) ?  expandBtn.classList.remove("hide") :  expandBtn.classList.add("hide") ;

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

            currScroll = window.pageYOffset || document.documentElement.scrollTop;
            
            if(prevScroll && currScroll < prevScroll){ elsInView.reverse(); }

            highlightElsInView([ elsInView[ Math.round((elsInView.length-1)/3)], elsInView[ Math.round((elsInView.length-1)/3) + 1], elsInView[ Math.round((elsInView.length-1)/3) + 2] ] )
            
            prevScroll = currScroll;
});


init();