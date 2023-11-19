import { createBullet } from "../weapons/weapons.js";
import { gunImage } from "../character/character.js";
import { getGameOver } from "../game/game.js";
import { character } from "../character/character.js";
import { listenForGameContainerChange, listenForFocusEvent } from "../random/utility.js";

let gameContainer = document.getElementById("game-container");

listenForGameContainerChange((newGameContainer) => {
    gameContainer = newGameContainer;
});

let onWindow = true;
listenForFocusEvent((isFocused) => {
    onWindow = isFocused;
});

// hold all the bullets spawned
let bullets = [];
const bulletWidth = 10;
const bulletHeight = 10;
// how many milliseconds before you can fire another bullet when holding down shoot
const rapidFireDelay = 150;

// spawns the bullet a bit away from the middle of the character
const seperationFromCharacter = 30;

let mouseDown = false;
let mouseX, mouseY;
let rapidFiring = false;

// when mouse is clicked, shoot!
gameContainer.addEventListener("mousedown", (event) => {
    // dont shoot if game is over
    if (getGameOver()) {
        return;
    }
    // only shoot if click was over game area
    if (onWindow === true) {
        mouseDown = true;

        mouseX = event.clientX - gameContainer.offsetLeft;
        mouseY = event.clientY - gameContainer.offsetTop;

        // if not rapid firing, start rapid firing
        if (rapidFiring === false) {
            rapidFiring = true;
            const rapidFireDelayInterval = setInterval(() => {
                spawnBullet(event);
                // stop rapid firing if mouse is no longer being clicked
                if (!mouseDown) {
                    rapidFiring = false;
                    clearInterval(rapidFireDelayInterval);
                }
            }, rapidFireDelay);
        }
    }
});

// change mouse x and y when the mouse moves (sadly needed to make rapid firing work)
gameContainer.addEventListener("mousemove", (event) => {
    if (onWindow === true && mouseDown) {
        // update mouse position
        mouseX = event.clientX - gameContainer.offsetLeft;
        mouseY = event.clientY - gameContainer.offsetTop;
    }
});

// when mouse is released, stop shooting
gameContainer.addEventListener("mouseup", (event) => {
    mouseDown = false;
});

// get direction for the bullet to travel for its entire life
function bulletDirection() {
    const characterCenterX = character.element.offsetLeft + character.element.offsetWidth / 2;
    const characterCenterY = character.element.offsetTop + character.element.offsetHeight / 2;

    // see how far away the mouse is from the center of the character
    const deltaX = mouseX - characterCenterX;
    const deltaY = mouseY - characterCenterY;

    // calculate the magnitude of the direction vector
    const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // normalize that distance
    const normalizedDeltaX = deltaX / magnitude;
    const normalizedDeltaY = deltaY / magnitude;

    return {
        nDeltaX: normalizedDeltaX,
        nDeltaY: normalizedDeltaY,
    };
}

function spawnBullet(event) {
    // make a bullet and its lifetime direction
    let bullet = createBullet();
    const dx = bulletDirection(event).nDeltaX;
    const dy = bulletDirection(event).nDeltaY;

    // set gun image!
    gunImage();

    bullet.dx = dx;
    bullet.dy = dy;

    const bulletStartX = character.element.offsetLeft + character.element.offsetWidth / 2 + dx * seperationFromCharacter - bulletWidth / 2;
    const bulletStartY = character.element.offsetTop + character.element.offsetHeight / 2 + dy * seperationFromCharacter - bulletHeight / 2;

    bullet.element.style.offsetWidth = bulletWidth + "px";
    bullet.element.style.offsetHeight = bulletHeight + "px";
    bullet.element.style.left = bulletStartX + "px";
    bullet.element.style.top = bulletStartY + "px";

    gameContainer.appendChild(bullet.element);
    bullets.push(bullet);
    // console.log("shoot fr fr");
}

export { bullets };
