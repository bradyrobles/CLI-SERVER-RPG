class PlayerModel {
    constructor(spawnLocations){
        this.id = `player-${uuid.v4()}`;
        this.health = 10;
        this.maxHealth = this.health;
        this.gold = 0;
        this.spawnLocations = spawnLocations;

        // pick initial spawn location and grab x and y for reference
        const location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
        [this.x, this.y] = location;

    }
    respawn() {
        this.health = this.maxHealth;
        const location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
        this.x = location[0] * scaleFactor;
        this.y = location[1] * scaleFactor;
    }

    updateGold(gold){
        this.gold += gold;
    }

    updateHealth(health){
        this.health += health;
        if (this.health > this.maxHealth){
            this.health = this.maxHealth;
        }
    }
}