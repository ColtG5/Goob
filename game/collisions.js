import { character } from "../character/character.js";
import { enemies } from "../enemy/enemy-spawning.js";
import { bullets } from "../weapons/weapon-spawning.js";
import { endScreen } from "./endgame.js";
import { listenForGameContainerChange } from "../random/utility.js";

let gameContainer = document.getElementById("game-container");

listenForGameContainerChange((newGameContainer) => {
    gameContainer = newGameContainer;
});

// what collisions between objects in the game need to be checked every game tick
function collisionsToCheck() {
    bulletWallCollision(); // did a bullet collide with a wall
    checkCollisions(bullets, enemies, bulletEnemyCollision); // did a bullet hit an enemy
    checkCollisions(enemies, [character], enemyCharacterCollision); // did an enemy hit the player
}

// check if any collisions happened between e.g. all enemies and all bullets
function checkCollisions(array1, array2, funcIfCollided) {
    for (const elm1 of array1) {
        for (const elm2 of array2) {
            if (isColliding(elm1, elm2)) {
                funcIfCollided(elm1, elm2);
            }
        }
    }
}

// delete a bullet if it hit a wall (not done "great" but too lazy to change)
function bulletWallCollision() {
    const maxX = gameContainer.offsetWidth;
    const maxY = gameContainer.offsetHeight;
    bullets.forEach((bullet) => {
        const bulletLeft = bullet.element.offsetLeft;
        const bulletRight = bulletLeft + bullet.element.offsetWidth;
        const bulletTop = bullet.element.offsetTop;
        const bulletBottom = bulletTop + bullet.element.offsetHeight;

        // if bullet went out of bounds, remove it
        if (bulletLeft < 0 || bulletRight > maxX || bulletTop < 0 || bulletBottom > maxY) {
            bullet.element.remove();
            bullets.splice(bullets.indexOf(bullet), 1);
            // console.log("bullet removed");
            return;
        }
    });
}
// Custom Interaction Mechanism:
// this method is the collision system for the game. It compares where two entities are on the screen,
// and reports if they have "collided" (pixel coordinates overlapped)
function isColliding(elm1, elm2) {
    // use the hit/hurt box of an entity, not its actual position
    const elm1Hurtbox = elm1.element.children[0];
    const elm2Hurtbox = elm2.element.children[0];

    const elm1Left = elm1.element.offsetLeft + elm1Hurtbox.offsetLeft;
    const elm1Right = elm1Left + elm1.element.offsetWidth - elm1Hurtbox.offsetLeft * 2;
    const elm1Top = elm1.element.offsetTop + elm1Hurtbox.offsetTop;
    const elm1Bottom = elm1Top + elm1.element.offsetHeight - elm1Hurtbox.offsetTop * 2;

    const elm2Left = elm2.element.offsetLeft + elm2Hurtbox.offsetLeft;
    const elm2Right = elm2Left + elm2.element.offsetWidth - elm2Hurtbox.offsetLeft * 2;
    const elm2Top = elm2.element.offsetTop + elm2Hurtbox.offsetTop;
    const elm2Bottom = elm2Top + elm2.element.offsetHeight - elm2Hurtbox.offsetTop * 2;

    // if these entities overlap each other on the screen, they have "collided"!
    if (elm1Left < elm2Right && elm1Right > elm2Left && elm1Top < elm2Bottom && elm1Bottom > elm2Top) {
        return true;
    }
    return false;
}

// handles logic of a bullet that hit an enemy
function bulletEnemyCollision(bullet, enemy) {
    // dont let a bullet hit the same enemy twice
    if (bullet.enemiesHit.includes(enemy.id)) {
        return;
    }

    enemy.hp -= bullet.damage;
    // if enemy died, remove it
    if (enemy.hp <= 0) {
        enemy.element.classList.add("death-animation");
        setTimeout(() => {
            enemy.element.remove();
        }, 400);
        // enemy.element.remove();
        enemies.splice(enemies.indexOf(enemy), 1);
    }

    // otherwise, give a hit indicator,
    enemy.element.classList.add("got-hit");
    enemy.element.style.backgroundImage = `url(${enemy.hitImage})`;
    setTimeout(() => {
        enemy.element.classList.remove("got-hit");
        enemy.element.style.backgroundImage = `url(${enemy.image})`;
    }, 200);

    // and update its health
    let healthbar = enemy.element.querySelector("progress");
    healthbar.value = enemy.hp;
    bullet.health -= enemy.damage;

    // if bullet lived (pierced), slow it down by an amount
    bullet.speed = Math.floor(bullet.speed * 0.7);
    // but if it died just remove it
    if (bullet.health <= 0) {
        bullet.element.remove();
        bullets.splice(bullets.indexOf(bullet), 1);
    }

    // track what enemies a bullet has hit, so it cant hit them again!
    bullet.enemiesHit.push(enemy.id);
}

// handles the logic of an enemy that hit the player
function enemyCharacterCollision(enemy, character) {
    // only let an enemy attack once per second
    if (!enemy.canAttack) {
        return;
    }
    // console.log("attacked");

    // give a hit indicator that you got hit!
    character.element.style.backgroundImage = `url(${character.hitImage})`;
    setTimeout(() => {
        character.element.style.backgroundImage = `url(${character.image})`;
    }, 200);

    // update health and healthbar
    character.hp -= enemy.damage;
    let healthbar = character.element.querySelector("progress");
    healthbar.value = character.hp;

    // attack! (and set it on cooldown)
    enemy.canAttack = false;
    setTimeout(() => {
        enemy.canAttack = true;
    }, 1000);

    // if player died, end the game
    if (character.hp <= 0) {
        // console.log("you died");
        character.element.classList.add("goob-death-animation");
        setTimeout(() => {
            character.element.remove();
        }, 5000);
        // show the eng game screen where they cant do anything
        endScreen();
    }
}

export { collisionsToCheck, isColliding };
