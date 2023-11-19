// import { resetKeyStates } from "../character/character.js";

let gameContainer = document.getElementById("game-container");

// // this doesnt work as intended (updating gameContainer for all other files), will fix later
// setInterval(() => {
//     gameContainer = document.getElementById("game-container");
//     squareGameGridChecker();
// }, 100);

window.addEventListener("resize", () => {
    const newGameContainer = document.getElementById("game-container");
    setGameContainer(newGameContainer);
});

const gameContainerListeners = [];

const listenForGameContainerChange = (callback) => {
    gameContainerListeners.push(callback);
};

const setGameContainer = (newGameContainer) => {
    gameContainerListeners.forEach((callback) => callback(newGameContainer));
};

// tells you when your game grid is not square! (by changing border color from brown to red)
function squareGameGridChecker() {
    if (gameContainer.offsetWidth !== gameContainer.offsetHeight) {
        gameContainer.style.outline = "10px solid #732600";
    } else {
        gameContainer.style.outline = "10px solid #3C2B00";
    }
}

// toggles the music on and off when button is clicked
document.getElementById("music-toggle-button").addEventListener("click", function () {
    toggleMusic();
});

// handles music toggling
function toggleMusic() {
    const audio = document.getElementById("background-music");
    audio.volume = 0.2;
    audio.currentTime = 2; // start 2 seconds in to the track
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
    console.log("toggled music");
}

const focusListeners = [];

const listenForFocusEvent = (callback) => {
    focusListeners.push(callback);
};

window.onfocus = function () {
    console.log("gained focus");
    focusListeners.forEach((callback) => callback(true));
};

window.onblur = function () {
    console.log("lost focus");
    focusListeners.forEach((callback) => callback(false));
};

export { listenForGameContainerChange, listenForFocusEvent, squareGameGridChecker, toggleMusic };
