import { updateCharacterPosition } from "../character/character.js";
import { squareGameGridChecker } from "../random/utility.js";
import { collisionsToCheck } from "./collisions.js";
import { updateBullets, updateEnemies } from "./update-objects.js";
import { startWave } from "../enemy/enemy-spawning.js";

let gameOver = false;
function getGameOver() {
    return gameOver;
}

// pausing game was too much work, not worth it for now

// // handles the pause game button, flips the state whenever pressed
// document.getElementById("pause-game-button").addEventListener("click", function () {
//     toggleGamePaused();
// });

// function toggleGamePaused() {
//     const gamePaused = document.getElementById("pause-game-button");
//     if (gamePaused.innerHTML === "Pause Game") {
//         gamePaused.innerHTML = "Resume Game";
//     } else {
//         gamePaused.innerHTML = "Pause Game";
//     }
//     gameOver = !gameOver;
//     if (!gameOver) {
//         requestAnimationFrame(gameLoop);
//     }
// }

const gameTickInterval = 1000 / 60; // 60 game ticks per second

let previousTimestamp = 0; // time of last frame
let accumulatedTime = 0; // sum of time since last frame

// updates the game logic every game tick
function updateGame() {
    squareGameGridChecker();

    updateCharacterPosition();
    updateEnemies();
    updateBullets();

    startWave();

    collisionsToCheck();
}

// renders the game every game tick
function renderGame() {
    // squareGameGridChecker();
}

// toggles the game over state
function toggleGameOver() {
    gameOver = !gameOver;
}

// The game loop code was taken fron ChatGPT

function gameLoop(timestamp) {
    if (gameOver) {
        return;
    }

    // Calculate the time elapsed since the last frame
    const deltaTime = timestamp - previousTimestamp;
    previousTimestamp = timestamp;

    // Add the elapsed time to the accumulator
    accumulatedTime += deltaTime;

    // Update the game logic in fixed time steps
    while (accumulatedTime >= gameTickInterval) {
        updateGame(accumulatedTime, timestamp, gameTickInterval); // Your game logic goes here
        accumulatedTime -= gameTickInterval;
    }

    // Render the game
    renderGame(); // Your rendering code goes here

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);

export { getGameOver, toggleGameOver };
