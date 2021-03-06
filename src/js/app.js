// javascript goes here

import axios from 'axios'
import Handlebars from 'handlebars/dist/handlebars'
import throttle from 'lodash.throttle';

import listTemplate from "../templates/list.html"

import * as d3 from 'd3'

const $$ = sel => [].slice.apply(document.querySelectorAll(sel))
const $ = sel => document.querySelector(sel)

const floors = 24;

let kickedOff = false
let startLoop = () => true

const screenWidth = window.innerWidth;
const isMobile = screenWidth < 740;
const columns = isMobile ? [2, 4, 4] : [2, 5, 4]

var previousShortList, previousLongList, previousListName, initAni, prevScroll, expandedBiogs = false;

const twitterBaseUrl = 'https://twitter.com/intent/tweet?text=';
const facebookBaseUrl = 'https://www.facebook.com/dialog/feed?display=popup&app_id=741666719251986&redirect_uri=http://www.theguardian.com&link=';
const googleBaseUrl = 'https://plus.google.com/share?url=';

function share(title, shareURL, fbImg, twImg, hashTag) {
    var twImgText = twImg ? ` ${twImg.trim()} ` : '';
    var fbImgQry = fbImg ? `&picture=${encodeURIComponent(fbImg)}` : '';
    return function(network, extra = '') {
        var twitterMessage = `${extra}${title}${twImgText}`;
        var shareWindow;

        if (network === 'twitter') {
            shareWindow = twitterBaseUrl + encodeURIComponent(twitterMessage + ' ') + shareURL + '?CMP=share_btn_tw';
        } else if (network === 'facebook') {
            shareWindow = facebookBaseUrl + shareURL + fbImgQry + '%3FCMP%3Dshare_btn_fb';
        } else if (network === 'email') {
            shareWindow = 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + shareURL;
        } else if (network === 'google') {
            shareWindow = googleBaseUrl + shareURL;
        }

        window.open(shareWindow, network + 'share', 'width=640,height=320');
    }
}

var shareFn = share('The lives of Grenfell tower', 'https://gu.com/p/8t3ty');

[].slice.apply(document.querySelectorAll('.interactive-share')).forEach(shareEl => {
    var network = shareEl.getAttribute('data-network');
    shareEl.addEventListener('click', () => shareFn(network));
});


const drawChart = (data) => {

    const svgEl = $('.gren-chart')

    const width = svgEl.clientWidth || svgEl.getBoundingClientRect().width
    const height = svgEl.clientHeight || svgEl.getBoundingClientRect().height

    const isMobile = window.matchMedia('(max-width: 739px)').matches

    const radius = isMobile ? 3.5 : 5

    const svg = d3.select(svgEl)
        .attr('width', width)
        .attr('height', height)

    const ages = [18, 35, 50, 99]

    const normaliseAge = str => {

        if (!str || str === '') { return 'Unknown' }

        if (/months/ig.test(str)) {
            return '0'
        }
        if(/two/ig.test(str)) { return '2' }
        if (/three/ig.test(str)) { return '3' }
        if (/five/ig.test(str)) { return '5' }
        if (/six/ig.test(str)) { return '6' }
        if (/eight/ig.test(str)) { return '8' }

        return str
    }

    const normaliseNat = str => {

        if (/british/ig.test(str)) { return 'British' }
        if (/moroc/ig.test(str)) { return 'Moroccan' }
        if (/gambia/ig.test(str)) { return 'Gambian' }
        if (!str || str === '') { return 'Unknown' }

        return str

    }

    const normaliseFloor = str => {

        if (!str || str === '') { return 'Unknown' }
        return str

    }

    const ageBrackets = (agg, cur) => {
        const age = Number(normaliseAge(cur.Age))

        const maxAge = ages.find(a => a > age)
        const entry = agg[maxAge]
        return entry ? Object.assign({}, agg, {
                [maxAge]: entry.concat(cur)
            }) :
            Object.assign({}, agg, {
                [maxAge]: [cur]
            })

    }

    const natBrackets = (agg, cur) => {

        const nat = normaliseNat(cur['Nationality'])

        const entry = agg[nat]

        return entry ? Object.assign({}, agg, {
                [nat]: entry.concat(cur)
            }) :
            Object.assign({}, agg, {
                [nat]: [cur]
            })
    }

    const floorBrackets = (agg, cur) => {
        const floor = normaliseFloor(cur['Floor'])
        const entry = agg[floor]
        return entry ? Object.assign({}, agg, {
                [floor]: entry.concat(cur)
            }) :
            Object.assign({}, agg, {
                [floor]: [cur]
            })
    }

    const offset = (circle, i, cols, vertSpacing = 160, arr, topSpacing = 160) => {

        const n = arr.length



        const lastFull = n - (n % cols)

        let spacing = width / cols

        if (n === 5 && cols === 5) {

            if (i <= 2) {
                return {
                    x: circle.x + (i + 1) * spacing + spacing / 2,
                    y: circle.y + topSpacing / 2
                }
            }

            return {
                x: circle.x + ((i - 3) + 1.5) * spacing + spacing / 2,
                y: circle.y + vertSpacing + topSpacing / 2
            }

        }

        if (i >= lastFull) {

            const magicNum = (cols - (n - lastFull)) / 2

            return {
                x: circle.x + (i % cols + magicNum) * spacing + spacing / 2,
                y: circle.y + Math.floor(i / cols) * vertSpacing + topSpacing / 2
            }
        }

        return {
            x: circle.x + (i % cols) * spacing + spacing / 2,
            y: circle.y + Math.floor(i / cols) * vertSpacing + topSpacing / 2
        }

    }

    const grouped = data.reduce(ageBrackets, {})
    const arr = Object.keys(grouped).map(k => [k, grouped[k]]) //.slice().sort((a, b) => a[1].length - b[1].length)

    const grouped2 = data.reduce(natBrackets, {})
    const arr2 = Object.keys(grouped2)
        .filter(k => k).map(k => [k, grouped2[k]]).slice()
        .sort((a, b) => b[1].length - a[1].length)
        .filter(o => o[0] !== 'Unknown')
        .concat([
            ['Unknown', grouped2['Unknown']]
        ])

    const grouped3 = data.reduce(floorBrackets, {})
    const arr3 = ['10', '11', '14', '16', '17', '18', '19', '20', '21', '22', '23', 'Non-resident'].map(k => [k, grouped3[k]])

    const ageLabels = ['0–18 years', '19–35', '35–50', '51–84']


    const natLabels = arr2.map(o => o[0])

    const floorLabels = arr3.map(o => o[0])

    const flatten = (agg, cur, i) => i === 0 ? cur : agg.concat(cur)


    const verts = isMobile ? [180, 87, 130] : [200, 112, 151]
    const tops = isMobile ? [260, 130, 180] : [260, 160, 170]

    const allCircles = arr.map((d, i, arr) => {

        const x = d[1].map(() => ({}))

        const simulation = d[1].length > 22 ?

            d3.forceSimulation(x)
            .force('charge', d3.forceManyBody().strength(isMobile ? 30.8 : 30.6))
            .force('center', d3.forceCenter(0, 0))
            .force('collision', d3.forceCollide().radius(radius + 1.5))
            .force('y', d3.forceY().y(0).strength(3))
            .force('x', d3.forceX().x(0).strength(0.1))
            .stop()

        : d3.forceSimulation(x)
            .force('charge', d3.forceManyBody().strength(30))
            .force('center', d3.forceCenter(0, 0))
            .force('collision', d3.forceCollide().radius(radius + 1.5))
            .force('y', d3.forceY().y(0).strength(Math.random() * 0.08))
            .stop();

        for (let t = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); t < n; ++t) {
            simulation.tick();
        }

        const x2 = x.map(y => Object.assign({}, y, offset(y, i, columns[0], verts[0], arr, tops[0])))
        return x2

    }).reduce(flatten, [])

    const allCircles2 = arr2.map((d, i, arr) => {


        const x = d[1].map(() => ({}))

        const simulation = d[1].length > 22 ?

            d3.forceSimulation(x)
            .force('charge', d3.forceManyBody().strength(30))
            .force('center', d3.forceCenter(0, 0))
            .force('collision', d3.forceCollide().radius(radius + 1.5))
            .force('y', d3.forceY().y(0).strength(1.8))
            .force('x', d3.forceX().x(0).strength(0.1))
            .stop()

        : d3.forceSimulation(x)
            .force('charge', d3.forceManyBody().strength(30))
            .force('center', d3.forceCenter(0, 0))
            .force('collision', d3.forceCollide().radius(radius + 1.5))
            .force('y', d3.forceY().y(0).strength(Math.random() * 0.08))
            .stop();

        for (let t = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); t < n; ++t) {
            simulation.tick();
        }

        const x2 = x.map(y => Object.assign({}, y, offset(y, i, columns[1], verts[1], arr, tops[1])))
        return x2

    }).reduce(flatten, [])


    const allCircles3 = arr3.map((d, i, arr) => {


        const x = d[1].map(() => ({}))

        const simulation = d[1].length > 22 ?

            d3.forceSimulation(x)
            .force('charge', d3.forceManyBody().strength(30))
            .force('center', d3.forceCenter(0, 0))
            .force('collision', d3.forceCollide().radius(radius + 1.5))
            .force('y', d3.forceY().y(0).strength(1.5))
            .force('x', d3.forceX().x(0).strength(0.1))
            .stop()

        : d3.forceSimulation(x)
            .force('charge', d3.forceManyBody().strength(30))
            .force('center', d3.forceCenter(0, 0))
            .force('collision', d3.forceCollide().radius(radius + 1.5))
            .force('y', d3.forceY().y(0).strength(Math.random() * 0.08))
            .stop();

        for (let t = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); t < n; ++t) {
            simulation.tick();
        }

        const x2 = x.map(y => Object.assign({}, y, offset(y, i, columns[2], verts[2], arr, tops[2])))
        return x2

    }).reduce(flatten, [])

    const positions = [allCircles, allCircles2, allCircles3]

    const labelArr = [ageLabels, natLabels, floorLabels]

    const smallCircles = svg
        .selectAll('.gren-circle')
        .data(allCircles3)
        .enter()
        .append('circle')

    smallCircles
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', radius)
        .attr('class', 'gren-circle')

    const labelGroups = svg.selectAll('.gren-label-layer')
        .data(labelArr)
        .enter()
        .append('g')
        .attr('class', (d, i) => i === 2 ?
            'gren-label-layer gren-label-layer--shown' : 'gren-label-layer')
        .attr('data-id', (d, i) => i)

    const labels = labelGroups
        .selectAll('.gren-label')
        .data((d, i, arr) => d.map(x => [x, i, arr]))
        .enter()
        .append('text')
        .attr('x', (d, i, arr) => offset({ x: 0, y: isMobile ? -40 : -45 }, i, columns[d[1]], verts[d[1]], arr, tops[d[1]]).x)
        .attr('y', (d, i, arr) => offset({ x: 0, y: isMobile ? -40 : -45 }, i, columns[d[1]], verts[d[1]], arr, tops[d[1]]).y)
        .text(d => d[0])
        .attr('class', 'gren-label')

    const buttons = $$('.gren-button')

    const gs = $$('.gren-label-layer')

    const toggleChart = i => {

        gs.forEach(el2 => {
            if (i === Number(el2.getAttribute('data-id'))) {
                el2.classList.add('gren-label-layer--shown')
            } else {
                el2.classList.remove('gren-label-layer--shown')
            }
        })

        buttons.forEach(el2 => {

            if (i === Number(el2.getAttribute('data-id'))) {
                el2.classList.add('gren-button--selected')
            } else {
                el2.classList.remove('gren-button--selected')
            }
        });

        const randoms = [0, 1, 2].map(() => Math.floor((Math.random() * positions[i].length)))

        let total = 0

        const dists = isMobile ? [50, 90] : [60, 130]

        smallCircles
            .data(positions[i])

        .each(function(d, i) {

            const el = d3.select(this)
            const cx = Number(el.attr('cx'))
            const cy = Number(el.attr('cy'))
            const euclidean = Math.sqrt((cx - d.x) ** 2 + (cy - d.y) ** 2)

            const rand = Boolean(Math.random() > 0.9 && (total < 2))

            if (euclidean > dists[0] && euclidean < dists[1] && rand) { total++ }

            const delay = euclidean > dists[0] && euclidean < dists[1] && rand ? Math.random() * 1800 : Math.random() * 200

            // if(euclidean > 60 && euclidean < 150) {

            //     return Math.random() > 0.9 ? Math.random()*1600 : Math.random()*200

            // }
            // return Math.random()*200

            el.transition()
                .delay(delay)
                .duration(euclidean > dists[0] && euclidean < dists[1] && rand ? (800 + Math.random() * 400) : 1200)
                .ease(t => euclidean > dists[0] && euclidean < dists[1] && rand ? d3.easePolyInOut(t, 3) : d3.easePolyInOut(t, 4))
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)


        })

    }

    let globalI = 0

    let toggleLoop = null

    startLoop = () => {

        toggleChart(globalI)

        console.log('starting loop ...')

        toggleLoop = setInterval(() => {

            globalI = (globalI + 1) % 3
            toggleChart(globalI)

        }, 5000)

    }

    buttons.forEach((el, i) => {

        el.addEventListener('click', () => {

            clearInterval(toggleLoop)

            const i = Number(el.getAttribute('data-id'))
            toggleChart(i)
        })

    })

}

function init() {
    axios.get(`${process.env.PATH}/assets/appData.json`).then((resp) => {

        var data = setData(resp.data);

        buildView(data);

        window.requestAnimationFrame(() => drawChart(data))

    });
}

function setData(data) {
    data.forEach((d) => {
        // d.shortBio = d.bio.split(" ");
        // d.shortBio = d.shortBio.slice( 0, 20).join(" ")+"…";

        d.name = d["Name"];
        d.shortBio = d["Short-biog"];
        d.grid_photo = d["Pic-url"];
        d.bio = (d["Long-biog"] || '').split('\n').map(par => `<p>${par}</p>`).join('')
    })
    return data;
}


function buildView(data) {

    // fill in long biogs

    $$('.gren-list-item').forEach(item => {

        const longBiogEl = item.querySelector('.gren-longbio')
        const entry = data.filter(row => row.name === item.getAttribute('data-name'))

        if (entry.length > 0) {
            longBiogEl.innerHTML = entry[0].bio
        }

    })

    // set up list items for highlight on scroll

    const listItems = $$('.gren-list-item.list-item-short')

    // function to check whether element is in top area of the screen

    const isInView = element => {
        return element.getBoundingClientRect().top < window.innerHeight * 0.6
    }


    // code we want to run periodically to check all items

    const checkItems = () => {

        const listItemsInView = [listItems[0]].concat(listItems.filter(element => isInView(element)))
        const lastElementInView = listItemsInView.slice(-1)[0]

        const chartEl = $('.gren-chart')

        if (chartEl) {
            const chartInView = chartEl.getBoundingClientRect().top < window.innerHeight * 0.8
            if (chartInView && !kickedOff) {
                kickedOff = true
                startLoop()
            }
        }

        listItems.forEach(element => {
            if (element !== lastElementInView) {
                element.classList.remove('gren-list-item--hl')
            }
        })
        if (lastElementInView) {
            lastElementInView.classList.add('gren-list-item--hl')
        }
        // code runs itself again on next frame (ie a few milliseconds after)
        window.requestAnimationFrame(checkItems)

    }

    // kicks off our code initially

    window.requestAnimationFrame(checkItems)

    addListeners();
    floorsAni()



}


function compileListHTML(dataIn) {

    Handlebars.registerHelper('html_decoder', function(text) {
        var str = unescape(text).replace(/&amp;/g, '&');
        return str;
    });

    Handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);

        return {
            "+": lvalue + rvalue,
            "-": lvalue - rvalue,
            "*": lvalue * rvalue,
            "/": lvalue / rvalue,
            "%": lvalue % rvalue
        }[operator];
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

    document.querySelectorAll(".gren-list-item").forEach((el) => {
        el.addEventListener('click', function() { showFullBio(this) });
    })

    $$('.gren-collapse-button').forEach((el) => {
        el.addEventListener('click', collapseBio)
    })

    document.getElementById("expandAll").addEventListener('click', function() { expandAllBiogs() });

    document.getElementById("hideAll").addEventListener('click', function() { hideAllBiogs() });

}

function addScrollListeners() {

    // Example
    scrollStop(updateListView);
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




}

function resetListAni() {
    document.querySelectorAll(".animate-active").forEach((el) => {
        el.classList.remove("animate-active");
    })

    document.querySelectorAll(".short-bio-expand").forEach((el) => {
        el.classList.remove("animate-active");
    })
}

function highlightElsInView(a) {

    resetListAni();

    if (a[0]) {
        a.filter(el => el).forEach((el, i) => {
            var aniDelay = ((i * 0.15) + 0.2) + "s";
            el.querySelector('.gren-list-name').style.animationDelay = aniDelay;
            el.querySelector('.gren-list-name').classList.remove('neutral-86');
            el.querySelector('.gren-list-name').classList.add('animate-active');

            el.querySelector('.short-bio-expand').style.animationDelay = aniDelay;
            el.querySelector('.short-bio-expand').classList.add('animate-active');
        })
    }




}


var isInViewport = function(elem) {
    var bounding = elem.getBoundingClientRect();
    // bounding.top >= (window.innerHeight * 0.1 || document.documentElement.clientHeight * 0.1)
    return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
    );

}

function floorsAni() {
  //  var finalEl = document.querySelector(".floor-6");
    document.querySelectorAll(".gren-floor").forEach((el) => {
        //var delay = ((floors - el.getAttribute("floor-ref")) / ) + "s";
        el.classList.add("floor-ani");
        //el.style.animationDelay = delay;

    })

listAni();
    // finalEl.addEventListener('animationend', function(event) {
    //     listAni();
    // }, false);
}

function standyAni() {
    let elThree = document.querySelector(".gren-standy");
    elThree.classList.add("animated");

    elThree.addEventListener('animationend', function(event) {
        floorsAni();

    }, false);
}

function listAni() {
    var finalEl;

    // document.querySelectorAll(".list-item-short").forEach((el, i) => {
    //     var delay = ((el.getAttribute("key-ref")) / 20) + "s";
    //
    //     //el.classList.add("animated");
    //     el.style.animationDelay = delay;
    //     if(i < 10) { finalEl = el; }
    // })
    //
    // finalEl.addEventListener('animationend', function(event) {
    //
    //     document.querySelectorAll(".list-item-short").forEach((el) => {
    //         // el.style = "";
    //         // el.classList.remove("animated");
    //         el.classList.add("animation-done");
    //     })
    //
    //
    // }, false);

    document.querySelectorAll(".list-item-short").forEach((el) => {
        // el.style = "";
        // el.classList.remove("animated");
        el.classList.add("animation-done");
    })
}

function expandAllBiogs() {
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


function hideAllBiogs() {

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

function findAncestor(el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el;
}

function showFullBio(el) {
    el.classList.add('gren-list-item--expanded')
}

function collapseBio(evt) {

    const parent = findAncestor(this, 'gren-list-item')
    parent.classList.remove('gren-list-item--expanded')
    evt.stopPropagation()

}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}





/*! scrollStop.js | (c) 2017 Chris Ferdinandi | MIT License | http://github.com/cferdinandi/scrollStop */
/**
 * Run functions after scrolling has stopped
 * @param  {Function} callback The function to run after scrolling
 */

var scrollStop = function(callback) {

    // Make sure a valid callback was provided
    if (!callback || Object.prototype.toString.call(callback) !== '[object Function]') return;

    // Setup scrolling variable
    var isScrolling;

    // Listen for scroll events
    window.addEventListener('scroll', function(event) {

        // Clear our timeout throughout the scroll
        window.clearTimeout(isScrolling);

        // Set a timeout to run after scrolling ends
        isScrolling = setTimeout(function() {

            // Run the callback
            callback();

        }, 66);

    }, false);

};




function updateListView() {
    var els = document.querySelectorAll(".list-item-short");
    var headEl = document.getElementById("grenStandy");
    var expandBtn;
    var currScroll;
    expandedBiogs ? expandBtn = document.getElementById("hideAll") : expandBtn = document.getElementById("expandAll");

    !isInViewport(headEl) ? expandBtn.classList.remove("hide") : expandBtn.classList.add("hide");

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

    if (prevScroll && currScroll < prevScroll) { elsInView.reverse(); }

    highlightElsInView([elsInView[Math.round((elsInView.length - 1) / 3)], elsInView[Math.round((elsInView.length - 1) / 3) + 1], elsInView[Math.round((elsInView.length - 1) / 3) + 2]])

    prevScroll = currScroll;
}


init();
