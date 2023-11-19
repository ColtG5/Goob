import { createZombie, createBigMinion } from "./enemy.js";
import { listenForGameContainerChange } from "../random/utility.js";

let gameContainer = document.getElementById("game-container");

listenForGameContainerChange((newGameContainer) => {
    gameContainer = newGameContainer;
    makeSpawnZones();
});

let enemies = []; // holds currently spawned enemies
const numOfSpawnZonesASide = 10; // controls how many spawn zones on each side there are
let enemySpawnZones = []; // holds the different spawn zones

// create a zombie and spawn him in a spawn zone
function spawnZombie(numToSpawn = 1) {
    const zone = Math.floor(Math.random() * enemySpawnZones.length);
    for (let i = 0; i < numToSpawn; i++) {
        let enemy = createZombie();
        positionEnemy(enemy, zone);
    }
}

// create a big minion and spawn him in a spawn zone
function spawnBigMinion(numToSpawn = 1) {
    const zone = Math.floor(Math.random() * enemySpawnZones.length);
    for (let i = 0; i < numToSpawn; i++) {
        let enemy = createBigMinion();
        positionEnemy(enemy, zone);
    }
}

// makes certian number of discrete "spawn zones" for enemies to spawn in, so we
// can enforce them spawning in predictable spots, as well as near the border
function makeSpawnZones() {
    const width = gameContainer.offsetWidth;
    const height = gameContainer.offsetHeight;
    const zoneWidth = width / numOfSpawnZonesASide;
    const zoneHeight = height / numOfSpawnZonesASide;

    // create the top and bottom zones
    for (let i = 0; i < numOfSpawnZonesASide; i++) {
        enemySpawnZones.push({
            x: i * zoneWidth,
            y: 0,
            width: zoneWidth,
            height: zoneHeight,
        });
        enemySpawnZones.push({
            x: i * zoneWidth,
            y: height - zoneHeight - 50,
            width: zoneWidth,
            height: zoneHeight,
        });
    }

    // create the left and right zones
    for (let i = 0; i < numOfSpawnZonesASide - 1; i++) {
        enemySpawnZones.push({
            x: 0,
            y: i * zoneHeight,
            width: zoneWidth,
            height: zoneHeight,
        });
        enemySpawnZones.push({
            x: width - zoneWidth - 0,
            y: i * zoneHeight,
            width: zoneWidth,
            height: zoneHeight,
        });
    }
}

makeSpawnZones();

// put the enemy onto the screen, in a random spawn zone
function positionEnemy(enemy, zone) {
    // put enemy onto screen
    gameContainer.appendChild(enemy.element);

    // move enemy to spot
    const spawnZone = enemySpawnZones[zone];
    enemy.element.style.top = Math.floor(Math.random() * (spawnZone.height - enemy.element.offsetHeight)) + spawnZone.y + "px";
    enemy.element.style.left = Math.floor(Math.random() * (spawnZone.width - enemy.element.offsetWidth)) + spawnZone.x + "px";

    enemies.push(enemy);
}

let canStartRound = true; // waits for all enemies of current rount to have spawned before the next round is allowed to start
let countingRounds = 0; // counts round we are currently on

// starts a new wave of enemies
function startWave() {
    // start the next round only once all enemies have spawned and died
    if (enemies.length == 0 && canStartRound) {
        // console.log("starting a round");

        canStartRound = false; // set back to true once all spawning is done
        let waveText = document.getElementById("wave-text");

        // do the "starting round" text animation
        setTimeout(() => {
            countingRounds++;
            waveText.innerHTML = `ROUND ${countingRounds}`;
            waveText.style.animation = "fadeInOut 6s alternate";
        }, 3000);

        // let the animation play for 6 second then start spawning enemies
        setTimeout(() => {
            waveText.style.animation = "none";
            spawnDuringRound();
        }, 9000);
    }
}

// change all these variables to tune gameplay
let startingZombieCount = 4; // how many zombies start on round 0
let startingBigMinionCount = 1; // how many big minions start on round 0

const roundsBetweenZombieHordeSizeIncrease = 5; // amount of rounds before more zombies start spawning together
const roundsBetweenBigMinionHordeSizeIncrease = 8; // amount of rounds before more big minions start spawning together

let extraZombiesEachRound = 1; // how many more zombies spawn each round
let extraBigMinionsEachRound = 0.2; // how many more big minions spawn each round

// Custom Algorithm:
// the round number correlates exactly to how many of each enemy will spawn each round,
// to make the rounds progressively harder. This function uses the values defined above
// to spawn enemies based on the current round number
function spawnDuringRound() {
    // how many of each enemy to spawn this round (correlated to the current round number)
    let zombieCountForRound = startingZombieCount + Math.floor(extraZombiesEachRound * countingRounds);
    let bigMinionCountForRound = startingBigMinionCount + Math.floor(extraBigMinionsEachRound * countingRounds);
    // how big the horde sizes are for each enemy
    const zombieHordeSize = countingRounds / roundsBetweenZombieHordeSizeIncrease;
    const bigMinionHordeSize = countingRounds / roundsBetweenBigMinionHordeSizeIncrease;

    // stores spawn info for each enemy: how many left to spawn, how many in a horde, which function spawns that enemy
    let enemySpawnStuff = {
        zombies: {
            maxCount: zombieCountForRound,
            hordeSize: zombieHordeSize,
            spawnFunc: spawnZombie,
        },
        bigMinions: {
            maxCount: bigMinionCountForRound,
            hordeSize: bigMinionHordeSize,
            spawnFunc: spawnBigMinion,
        },
    };

    // spawn an enemy every second until we cant
    const spawningDuringRoundInterval = setInterval(() => {
        let result = randomEnemyFromRaffle(enemySpawnStuff); // get the enemy to spawn for this interval
        let enemyObj = result.enemyObj; // the enemy object
        let enemyObjKey = result.enemyObjKey; // the key for the enemy object in enemySpawnStuff

        // console.log(`spawning ${enemyObj}`);

        // use the enemy spawn function to spawn the enemy
        enemyObj.spawnFunc(enemyObj.hordeSize);
        // take away one from how many of that enemy to spawn this round
        enemyObj.maxCount--;
        // if we spawned all of that enemy this round, remove it from the enemySpawnStuff (keep spawning until this is empty)
        if (enemyObj.maxCount <= 0) {
            // console.log(`\t\t\tdeleting ${enemyObj}`);
            delete enemySpawnStuff[enemyObjKey]; // removes entry from enemySpawnStuff
        }

        // console.log(`enemySpawnStuff: ${enemySpawnStuff} ${Object.keys(enemySpawnStuff).length}}`);

        // if no more enemies to spawn for this round, stop the spawning interval
        if (Object.keys(enemySpawnStuff).length == 0) {
            console.log("round over");
            canStartRound = true;
            clearInterval(spawningDuringRoundInterval);
        }
    }, 1000);
}

// Custom Algorithm:
// takes as input all enemies left to spawn that round (and their spawning associated spawning information)
// and determines which will spawn next. It decides which will be spawned by weighting the remaining count
// of each enemy to spawn, and then favouring enemies with more left to spawn.
function randomEnemyFromRaffle(enemySpawnStuff) {
    const keys = Object.keys(enemySpawnStuff); // get all types of enemies

    // perform a "raffle" with each enemy, # of tickets = how many need to be spawned that round
    // (more enemies to spawn that round = more tickets = more likely to spawn next)

    let raffleBowl = [];
    for (const key of keys) {
        let enemyObj = enemySpawnStuff[key];
        for (let i = 0; i < enemyObj.maxCount; i++) {
            raffleBowl.push(key);
        }
    }
    // get enemy that won the raffle!
    const raffleResult = Math.floor(Math.random() * raffleBowl.length);
    const raffleWinnerKey = raffleBowl[raffleResult];

    return { enemyObj: enemySpawnStuff[raffleWinnerKey], enemyObjKey: raffleWinnerKey };
}

export { enemies, startWave, countingRounds };
