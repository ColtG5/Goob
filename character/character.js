import { listenForGameContainerChange, listenForFocusEvent } from "../random/utility.js";

let gameContainer = document.getElementById("game-container");

listenForGameContainerChange((newGameContainer) => {
    gameContainer = newGameContainer;
});

listenForFocusEvent((isFocused) => {
    if (!isFocused) {
        resetKeyStates();
    }
});

// class for the main character
class Character {
    constructor(type, hp, defense, speed, image, hitImage) {
        this.type = type;
        this.hp = hp;
        this.defense = defense;
        this.speed = speed;
        this.image = image;
        this.hitImage = hitImage;
        this.element = document.createElement("div");
        this.element.id = "character";
        let hurtbox = document.createElement("div");
        hurtbox.classList.add("character-hurtbox");
        this.element.appendChild(hurtbox);
        let healthbar = document.createElement("progress");
        healthbar.classList.add("healthbar");
        healthbar.value = this.hp;
        healthbar.max = this.hp;
        healthbar.maxwidth = "100%";
        this.element.appendChild(healthbar);
        this.tx = 0;
        this.ty = 0;
        this.canAttack = true;
    }
}
// not everything used, might implement later
let character = new Character("character", 100, 0, 3, "assets/goob_big_eyes.png", "animations/goob_big_eyes_red.png");
gameContainer.appendChild(character.element);

const maxX = gameContainer.offsetWidth;
const maxY = gameContainer.offsetHeight;

let x = character.element.offsetLeft;
let y = character.element.offsetTop;
let dx = 0;
let dy = 0;

// deal with moving the player
function updateCharacterPosition() {
    const movementSpeed = character.speed;
    if (isKeyDown("w")) {
        dy = -movementSpeed;
    } else if (isKeyDown("s")) {
        dy = movementSpeed;
    } else {
        dy = 0;
    }

    if (isKeyDown("a")) {
        dx = -movementSpeed;
    } else if (isKeyDown("d")) {
        dx = movementSpeed;
    } else {
        dx = 0;
    }

    // flip the image to represent the direction we are moving
    updateCharacterOrientation(dx, dy);

    // dont let the character move out of bounds
    if (x + dx < 0 || x + dx > maxX - character.element.offsetWidth) {
        dx = 0;
    }
    if (y + dy < 0 || y + dy > maxY - character.element.offsetHeight) {
        dy = 0;
    }

    x += dx;
    y += dy;
    character.element.style.left = x + "px";
    character.element.style.top = y + "px";
}

let orient = "down-right"; // set initial orientation of the player
let lastOrientation = "down-right";

function updateCharacterOrientation(dx, dy) {
    if (dx === 0 && dy === 0) {
        return;
    }

    if (dx > 0) {
        if (dy > 0) {
            orient = "down-right";
        } else if (dy < 0) {
            orient = "up-right";
        } else {
            orient = "right";
        }
    } else if (dx < 0) {
        if (dy > 0) {
            orient = "down-left";
        } else if (dy < 0) {
            orient = "up-left";
        } else {
            orient = "left";
        }
    } else {
        if (dy > 0) {
            orient = "down";
        } else if (dy < 0) {
            orient = "up";
        }
    }

    // dont change the orientation if it is the same as last time
    if (orient !== lastOrientation) {
        character.element.classList.remove("character-" + lastOrientation);
        character.element.classList.add("character-" + orient);
        lastOrientation = orient;
    }
}

// holds what keys are currently pressed
const keyStates = {};

// check if a key is currently pressed
function isKeyDown(key) {
    return keyStates[key] === true;
}

// listen for a key press
window.addEventListener("keydown", (e) => {
    keyStates[e.key.toLocaleLowerCase()] = true;
});

// listen for a key release
document.addEventListener("keyup", (e) => {
    keyStates[e.key.toLocaleLowerCase()] = false;
});

// reset all key states
function resetKeyStates() {
    for (const key in keyStates) {
        keyStates[key] = false;
    }
}

// counts how many gun images are currently overlapping the character (bit of a lazy hack)
let gunImageCounter = 0;

// make a gun image appear over the character (after shooting)
function gunImage() {
    let alternateImage = document.createElement("img");
    alternateImage.src = "assets/GOOB_GUN.png";
    alternateImage.width = character.element.offsetWidth;
    alternateImage.height = character.element.offsetHeight;
    alternateImage.style.position = "absolute";
    alternateImage.style.left = 0;
    alternateImage.style.top = 0;
    alternateImage.style.display = "block";

    // if we shot and there is currently no gun image replacing the goob image, hide the goob image (and add gun image below)
    if (gunImageCounter === 0) {
        character.element.style.backgroundImage = "none";
        character.element.classList.add("character-no-transform");
    }
    gunImageCounter++;

    character.element.appendChild(alternateImage);

    // remove gun image after 0.3 seconds
    setTimeout(() => {
        character.element.removeChild(alternateImage);
        gunImageCounter--;

        if (gunImageCounter === 0) {
            character.element.style.backgroundImage = "url(assets/goob_big_eyes.png)";
            character.element.classList.remove("character-no-transform");
        }
    }, 300);
}

export { updateCharacterPosition, gunImage, resetKeyStates, character };
