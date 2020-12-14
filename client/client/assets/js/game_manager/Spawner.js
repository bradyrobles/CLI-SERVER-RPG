class Spawner {
    constructor(config, spawnLocations, addObject, deleteObject, moveObjects){
        this.id = config.id;
        this.spawnInterval = config.spawnInterval; // used to check when to respawn game objects
        this.limit = config.limit; // limit of objects that can be created by spawner
        this.objectType = config.spawnerType; // Want to use a single spawner for chests and monsters
        this.spawnLocations = spawnLocations; // all possible locations for spawner

        this.addObject = addObject;
        this.deleteObject = deleteObject;
        this.moveObjects = moveObjects;
        this.objectsCreated = [];

        this.start();
    }

    start() {
        this.interval = setInterval(() => {
            if (this.objectsCreated.length < this.limit){
                this.spawnObject();
            }
        }, this.spawnInterval);
        if (this.objectType === SpawnerType.MONSTER) this.moveMonsters();
    }

    spawnObject() {
        // check value and type with ===
        if (this.objectType === SpawnerType.CHEST){
            this.spawnChest();
        } else if (this.objectType === SpawnerType.MONSTER){
            this.spawnMonster();
        }
    }
    spawnChest() {
        const location = this.pickSpawnLocation();
        const chest = new ChestModel(
            location[0], // x
            location[1],  // y
            randomNumber(10,20), // gold 
            this.id // spawnerID
            ); 
        this.objectsCreated.push(chest);
        this.addObject(chest.id, chest); // notify gameManager we are adding an object type CHEST
    }
    spawnMonster() {
        const location = this.pickSpawnLocation();
        const monster = new MonsterModel(
            location[0], // x
            location[1], // y
            randomNumber(10,20), // gold 
            this.id, // spawnerID
            randomNumber(10,20), // frame of spritelist
            randomNumber(3,5), // health
            1 // attackV
            );
        this.objectsCreated.push(monster);
        this.addObject(monster.id, monster); // notify gameManager we are adding an object type monster
    }
    pickSpawnLocation() {
        const location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
        const invalidLocation = this.objectsCreated.some((obj) => {
            if (obj.x === location[0] && obj.y === location[1]){
                return true;
            } 
            return false;
            
        });

        if (invalidLocation) return this.pickSpawnLocation();
        return location;
    }
    removeObject(id) {
        this.objectsCreated = this.objectsCreated.filter(obj => obj.id !== id); // return new array of objects whose id !== id to be deleted
        this.deleteObject(id); // notify gameManager we are deleted an object
    }

    moveMonsters(){
        this.moveMonsterInterval = setInterval(() => {
            this.objectsCreated.forEach((monster) => {
                monster.move();
            });

            this.moveObjects();
        }, 1000);
    }
    
}