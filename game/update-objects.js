import { enemies } from "../enemy/enemy-spawning.js";
import { bullets } from "../weapons/weapon-spawning.js";
import { isColliding } from "./collisions.js";
import { character } from "../character/character.js";

// Custom algorithm:
// given an entity to move, and an entity for it to move towards, calculate the
// direction vectors for that entities movement
function getDirectionToMove(mover, target) {
    // move the enemies to the center of the player
    let characterCenterX = target.element.offsetLeft + target.element.offsetWidth / 2;
    let characterCenterY = target.element.offsetTop + target.element.offsetHeight / 2;
    let enemyX = mover.element.offsetLeft + mover.element.offsetWidth / 2;
    let enemyY = mover.element.offsetTop + mover.element.offsetHeight / 2;

    // get how far enemy is away from character
    const deltaX = characterCenterX - enemyX;
    const deltaY = characterCenterY - enemyY;

    // get the magnitude of that disance
    const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // normalize the x and y distance
    const normalizedDeltaX = deltaX / magnitude;
    const normalizedDeltaY = deltaY / magnitude;

    return {
        nDeltaX: normalizedDeltaX,
        nDeltaY: normalizedDeltaY,
    };
}

// move the bullets in whatever direction they were shot in
function updateBullets() {
    bullets.map((bullet) => {
        bullet.element.style.left = bullet.element.offsetLeft + bullet.dx * bullet.speed + "px";
        bullet.element.style.top = bullet.element.offsetTop + bullet.dy * bullet.speed + "px";
    });
}

// move the enemies towards the player
function updateEnemies() {
    enemies.map((enemy) => {
        // dont move the enemy if they're already in range of the player
        if (isColliding(enemy, character)) {
            return;
        }
        const dx = getDirectionToMove(enemy, character).nDeltaX * enemy.speed;
        const dy = getDirectionToMove(enemy, character).nDeltaY * enemy.speed;
        let newX = enemy.element.offsetLeft + dx;
        let newY = enemy.element.offsetTop + dy;

        enemy.element.style.left = newX + "px";
        enemy.element.style.top = newY + "px";
    });
}

export { getDirectionToMove, updateBullets, updateEnemies };
