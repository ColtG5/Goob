// class for a bullet
class Bullet {
    constructor() {
        this.damage = 10;
        this.speed = 10;
        this.dx = 0;
        this.dy = 0;
        this.health = 10;
        this.enemiesHit = [];
        this.element = document.createElement("div");
        let hurtbox = document.createElement("div");
        hurtbox.classList.add("bullet-hurtbox");
        this.element.appendChild(hurtbox);
        this.element.classList.add("bullet");
    }
}

// make bullet
function createBullet() {
    let bullet = new Bullet();
    return bullet;
}

export { createBullet };
