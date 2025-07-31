"use strict";

const header = /**@type {HTMLElement}*/(document.getElementById("header"));
const headerBackground = /**@type {HTMLElement}*/(document.getElementById("headerBackground"));
const heroCards = /**@type {HTMLElement}*/(document.getElementById("heroCards"));
const heroFooter = /**@type {HTMLElement}*/(document.getElementById("heroFooter"));
const heroDescription = /**@type {HTMLElement}*/(document.getElementById("heroDescription"));
const heroBottom = /**@type {HTMLElement}*/(document.getElementById("heroBottom"));
const heroTitle = /**@type {HTMLElement}*/(document.getElementById("heroTitle"));

let isScrolling = false;
let cachedScrollY = 0;
let cachedInnerHeight = window.innerHeight;
let scrollTimeout;

const cache = {
    maxScroll: 256 - 64,
    triggerPoint: cachedInnerHeight - 256,
    scrollThreshold: cachedInnerHeight - 64,
    maxIncreaseScroll: cachedInnerHeight * 0.5,
    requiredScrollToHide: cachedInnerHeight * 0.6,
    footerHideValue: cachedInnerHeight * 0.1
};
function updateCache() {
    if (cachedInnerHeight !== window.innerHeight) {
        cachedInnerHeight = window.innerHeight;
        cache.triggerPoint = cachedInnerHeight - 256;
        cache.scrollThreshold = cachedInnerHeight - 64;
        cache.maxIncreaseScroll = cachedInnerHeight * 0.5;
        cache.requiredScrollToHide = cachedInnerHeight * 0.6;
        cache.footerHideValue = cachedInnerHeight * 0.1;
    }
}
function enableWillChange() {
    document.body.classList.add("animating");
}
function disableWillChange() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        document.body.classList.remove("animating");
    }, 150);
}
function updateHeader() {
    const distance = cachedScrollY - cache.triggerPoint;
    const ratio = clamp(distance / cache.maxScroll, 0, 1);
    const eased = ratio ** 1.2;

    header.classList.toggle("scrolled", cachedScrollY >= cache.scrollThreshold);
    
    headerBackground.style.cssText = `opacity: ${eased}; transform: translateY(${1 - eased * 64}px)`;
    header.style.backdropFilter = `blur(${eased * 8}px)`;
}
function updateHeroTitle() {
    if (cachedScrollY <= 4) {
        heroTitle.style.letterSpacing = "";
        return;
    }

    const spaceRatio = cachedScrollY / cache.maxIncreaseScroll;
    heroTitle.style.letterSpacing = `${12 + Math.min(spaceRatio, 1) * 8}px`;
}
function updateHeroCards() {
    if (cachedScrollY <= 4) {
        heroCards.style.cssText = "";
        return;
    }

    const hideRatio = cachedScrollY / cache.requiredScrollToHide;
    const opacity = clamp(1 - hideRatio, 0, 1);
    const scale = 1 + hideRatio * 0.2;
    
    heroCards.style.cssText = `opacity: ${opacity}; scale: ${scale}`;
}
function updateHeroBottom() {
    if (cachedScrollY <= 1) {
        heroFooter.style.opacity = "";
        heroDescription.style.opacity = "";
        heroBottom.style.transform = "";
        return;
    }

    const footerHideRatio = cachedScrollY / cache.footerHideValue;
    heroFooter.style.opacity = clamp(1 - footerHideRatio, 0, 1);
    heroDescription.style.opacity = clamp(1 - footerHideRatio, 0.6, 1);

    const bottomScroll = Math.min(cachedScrollY, heroFooter.offsetHeight - 8);
    heroBottom.style.transform = `translateY(${bottomScroll}px)`;
}
function updateScrollables() {
    cachedScrollY = window.scrollY;
    updateCache();
    
    updateHeader();
    updateHeroTitle();
    updateHeroCards();
    updateHeroBottom();
    
    isScrolling = false;
    disableWillChange();
}
function handleScroll() {
    if (!isScrolling) {
        enableWillChange();
        isScrolling = true;
        requestAnimationFrame(updateScrollables);
    }
}
function init() {
    updateScrollables();

    document.querySelectorAll("a[href^=\"#\"]").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute("href")).scrollIntoView({
                behavior: "smooth"
            });
        });
    });
}

if (document.readyState !== "loading") {
    init();
}
else {
    window.addEventListener("DOMContentLoaded", init);
}
window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("resize", updateCache);

/**
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 */
function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}