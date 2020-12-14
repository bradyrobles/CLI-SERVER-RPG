class GameManager {
    constructor(scene, mapData){
        this.scene = scene; //'GameScene'
        this.mapData = mapData;

        this.spawners = {};
        this.chests = {};
        this.monsters = {}; // monsterId: MonsterModel

        this.players = {};

        this.playerLocations = [];
        this.chestLocations = {}; // chests need a key associated with [x,y]
        this.monsterLocations = {};

    }

    setup(){
        this.parseMapData();
        this.setupEventListeners();
        this.setupSpawners();
        this.spawnPlayer();
    }

    parseMapData(){
        console.log(this.mapData)
        // var layer 
        this.mapData.forEach((layer) => {
            if (layer.name == 'player_locations'){
                // capture x and y coords from each object in player_locations
                layer.objects.forEach((obj) => {
                    this.playerLocations.push([obj.x + (obj.width / 2), obj.y - (obj.height / 2)])
                });
            }else if (layer.name == 'chest_locations'){
                layer.objects.forEach((obj) => {
                    // dictionary logic, if exists - add to entry; if dne - add to dic
                    // using custom properties.spawner field for key
                    if (this.chestLocations[obj.properties.spawner]){
                        this.chestLocations[obj.properties.spawner].push([obj.x + (obj.width / 2), obj.y - (obj.height / 2)]);
                    } else {
                        this.chestLocations[obj.properties.spawner] = [[obj.x + (obj.width / 2), obj.y - (obj.height / 2)]];
                    }
                });
            }else if (layer.name == 'monster_locations'){
                layer.objects.forEach((obj) => {
                    // dictionary logic, if exists - add to entry; if dne - add to dic
                    // using custom properties.spawner field for key
                    if (this.monsterLocations[obj.properties.spawner]){
                        this.monsterLocations[obj.properties.spawner].push([obj.x + (obj.width / 2), obj.y - (obj.height / 2)]);
                    } else {
                        this.monsterLocations[obj.properties.spawner] = [[obj.x + (obj.width / 2), obj.y - (obj.height / 2)]];
                    }
                });
            }
        });
        //console.log(this.playerLocations);
        //console.log(this.monsterLocations);
        //console.log(this.chestLocations);
    }

    setupSpawners(){
        const config = {
            spawnInterval: 3000,
            limit: 3,
            id: ``,
        };
        let spawner;
        // create chest spawners
        Object.keys(this.chestLocations).forEach((key) => {
            config.id = `chest-${key}`;
            config.spawnerType = SpawnerType.CHEST;
            spawner = new Spawner(
                config, 
                this.chestLocations[key], 
                this.addChest.bind(this), // allows Spawner to call addObject, redirect to addChest
                this.deleteChest.bind(this), // allows Spawner to call deleteObject, "" 
            );
            this.spawners[spawner.id] = spawner; // adds spawner_id: spawner object to spawner dict
        });

        // create monster spawners
        Object.keys(this.monsterLocations).forEach((key) => {
            config.id = `monster-${key}`;
            config.spawnerType = SpawnerType.MONSTER;
            spawner = new Spawner(
                config, 
                this.monsterLocations[key], 
                this.addMonster.bind(this), // allows Spawner to call addObject, redirect to addMonster
                this.deleteMonster.bind(this), // allows Spawner to call deleteObject, "" 
                this.moveMonsters.bind(this),
            );
            this.spawners[spawner.id] = spawner; // adds spawner_id: spawner object to spawner dict
        });
        
    }
    spawnPlayer(){
        const player = new PlayerModel(this.playerLocations); 
        this.players[player.id] = player;
        this.scene.events.emit('spawnPlayer', player); // emit event for parent scene 
    }

    setupEventListeners(){
        this.scene.events.on('pickupChest', (chestID, playerID) => {
            //update the spawner
            if (this.chests[chestID]){
                const { gold, hearts } = this.chests[chestID]; // shorthand for 'this.chests[chestID].gold'

                //updating the players gold
                this.players[playerID].updateGold(gold);
                this.scene.events.emit('updateScore', this.players[playerID].gold);

                //updating the players health
                this.players[playerID].updateHealth(hearts);
                this.scene.events.emit('updatePlayerHealth', playerID, this.players[playerID].health);

                // remove the chest 
                this.spawners[this.chests[chestID].spawnerID].removeObject(chestID);
                this.scene.events.emit('chestDestroyed', chestID); // emit event for parent scene

            }
        });

        this.scene.events.on('monsterAttacked', (monsterID, playerID) => {
            //update the spawner
            if (this.monsters[monsterID]){
                const { gold, attackV } = this.monsters[monsterID];

                // subtract health from monster model
                this.monsters[monsterID].loseHealth();

                // check if monster is dead, if dead remove object from spawner and emit event
                if (this.monsters[monsterID].health <= 0){
                
                    // updating the players gold
                    this.players[playerID].updateGold(gold);
                    this.scene.events.emit('updateScore', this.players[playerID].gold);

                    // remove the monster
                    this.spawners[this.monsters[monsterID].spawnerID].removeObject(monsterID);
                    this.scene.events.emit('monsterDestroyed', monsterID); // emit event for parent scene
                // if alive, emit event to update healthbar
                } else {
                    //update the players health
                    this.players[playerID].updateHealth(-attackV);
                    this.scene.events.emit('updatePlayerHealth', playerID, this.players[playerID].health); // emit event for parent scene

                    //update the monsters health
                    this.scene.events.emit('updateMonsterHealth', monsterID, this.monsters[monsterID].health); // emit event for parent scene

                    //check the players health, if below 0, respawn 
                    if (this.players[playerID].health <= 0){
                        this.players[playerID].updateGold(parseInt(-this.players[playerID].gold / 2), 10);
                        this.scene.events.emit('updateScore', this.players[playerID].gold);

                        // respawn the player
                        this.players[playerID].respawn();
                        this.scene.events.emit('respawnPlayer', this.players[playerID]);
                    }
                }
            }
        });
    }

    // chest is type ChestModel
    addChest(chestID, chest){
        this.chests[chestID] = chest; // adds chestID: chest object to chest dict
        this.scene.events.emit('chestSpawned', chest); // emit event for parent scene

    }
    deleteChest(chestID){
        delete this.chests[chestID]; // deletes entry in chest dict
    }

    // monster is type MonsterModel
    addMonster(monsterID, monster){
        this.monsters[monsterID] = monster; // adds monsterID: monster object to monster dict
        this.scene.events.emit('monsterSpawned', monster); // emit event for parent scene
    }
    deleteMonster(monsterID){
        delete this.monsters[monsterID];
    }
    
    moveMonsters(){
        this.scene.events.emit('monsterMovement', this.monsters); // emit event for parent scene

    }
}