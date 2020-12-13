class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init() {
    this.scene.launch('Ui');
  }

  create() {
    this.createMap();
    this.createAudio();
    this.createGroups();
    this.createInput();

    this.createGameManager();
    
  }

  update() {
    if (this.player) this.player.update(this.cursors);
  }

  createAudio() {
    this.goldPickupAudio = this.sound.add('goldSound', { loop: false, volume: 0.3 });
    
    this.playerAttackAudio = this.sound.add('playerAttack', { loop: false, volume: 0.05 });
    this.playerDamageAudio = this.sound.add('playerDamage', { loop: false, volume: 0.2 });
    this.playerDeathAudio = this.sound.add('playerDeath', { loop: false, volume: 0.5 });
    this.playerDeathAudio.setRate(.5);
    this.enemyDeathAudio = this.sound.add('enemyDeath', { loop: false, volume: 0.2 });

  }

  createPlayer(playerModel) {
    this.player = new PlayerContainer(
      this, 
      playerModel.x * scaleFactor, 
      playerModel.y * scaleFactor, 
      'characters', 
      7,
      playerModel.health,
      playerModel.maxHealth,
      playerModel.id,
      this.playerAttackAudio,
      );
  }

  createGroups() {
    // create a chest group
    this.chests = this.physics.add.group();

    // create a monster group of Monster Objects
    this.monsters = this.physics.add.group();
    this.monsters.runChildUpdate = true; // lets us run update function in all monsters
    
  }

  spawnChest(chestObject) {
    let chest = this.chests.getFirstDead();

    if (!chest) {
      chest = new Chest(this, 
        chestObject.x * scaleFactor, 
        chestObject.y * scaleFactor, 
        'items', 
        0, 
        chestObject.gold, 
        chestObject.id);
        
      // add chest to chests group
      this.chests.add(chest);
    } else {
      chest.coins = chestObject.gold;
      chest.id = chestObject.id;
      chest.setPosition(chestObject.x * scaleFactor, chestObject.y * scaleFactor);
      chest.makeActive();
    }
  }

  spawnMonster(monsterObject){
    let monster = this.monsters.getFirstDead();

    if (!monster) {
      monster = new Monster(
        this, // scene to be added to
        monsterObject.x, 
        monsterObject.y, 
        'monsters', // key
        monsterObject.frame, 
        monsterObject.id,
        monsterObject.health,
        monsterObject.maxHealth,
        );

      // add monster to monsters group
      this.monsters.add(monster);
    } else {
      monster.id = monsterObject.id;
      monster.health = monsterObject.health;
      monster.maxHealth = monsterObject.maxHealth;
      monster.setTexture('monsters', monsterObject.frame);
      monster.setPosition(monsterObject.x , monsterObject.y);
      monster.makeActive();
    }
  }


  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  addCollisions() {
    // check for collisions between player and Tiled blocked layer
    this.physics.add.collider(this.player, this.map.blockedLayer);
    // check for overlaps between player and chest game objects
    this.physics.add.overlap(this.player, this.chests, this.collectChest, null, this);
    // check for collisions between monster group and Tiled blocked layer
    this.physics.add.collider(this.monsters, this.map.blockedLayer);
    // check for overlaps between player's weapon and monster game objects group
    this.physics.add.overlap(this.player.weapon, this.monsters, this.enemyOverlap, null, this);
  }
  
  enemyOverlap(weapon, enemy){
    // check if player is currently attacking and the sword has not already hit
    if (this.player.playerAttacking && !this.player.swordHit){
      this.player.swordHit = true;
      this.events.emit('monsterAttacked', enemy.id, this.player.id);

      // logic to subtract enemy health, removed from here because scope is 
      // better defined in GameManager, simply communicate that the monster was
      // attacked and let GameManager handle logic
      /*
      if (enemy.takeDamage(1) <= 0 ){
        console.log(`Enemy ${enemy.id} died`);
        // make enemy game object inactive
        enemy.makeInactive();
        // spawn a new enemy
        this.events.emit('destroyEnemy', enemy.id);
        
      } else {
        console.log(`Enemy ${enemy.id} took 1 damage, ${enemy.health} hitpoints remain`);
      }
      */
      
    }
    
  }

  collectChest(player, chest) {
    // play gold pickup sound
    this.goldPickupAudio.play();

    // spawn a new chest
    this.events.emit('pickupChest', chest.id, player.id);
  }

  createMap(){
    // create map
    this.map = new Map(this, 'map', 'background', 'background', 'blocked');
  }

  createGameManager(){
    // Listener Event for spawning player
    this.events.on('spawnPlayer', (playerModel) => {
      this.createPlayer(playerModel);
      this.addCollisions();
    });

    // Listener Event for spawning player
    this.events.on('respawnPlayer', (playerModel) => {
      this.playerDeathAudio.play();
      // delay call to give weapon time to hit
      this.time.delayedCall(500, () => {
        this.player.respawn(playerModel);
      }, [], this);
    });

    // Listener Event for spawning chests
    this.events.on('chestSpawned', (chest) => {
      this.spawnChest(chest);
    });

    // Listener Event for removing chests
    this.events.on('chestDestroyed', (chestID) => {
      this.chests.getChildren().forEach((chest) => {
        if (chest.id === chestID){
          chest.makeInactive();
        }
      });
    });

    // Listener Event for spawning monsters
    this.events.on('monsterSpawned', (monster) => {
      this.spawnMonster(monster);
    });

    // Listener Event for moving array of monsters
    this.events.on('monsterMovement', (monsters) => {
      this.monsters.getChildren().forEach((monster) => {
        Object.keys(monsters).forEach((monsterID) => {
          if (monster.id === monsterID){
            this.physics.moveToObject(monster, monsters[monsterID], 64); // use physics to move object not just snap to position
          }
        });
      });
    });
    
    // Listener Event for removing monsters
    this.events.on('monsterDestroyed', (monsterID) => {
      this.monsters.getChildren().forEach((monster) => {
        if (monster.id === monsterID){
          monster.makeInactive();
          this.enemyDeathAudio.play();
        }
      });
    });

    // Listener Event for updating monsters health 
    this.events.on('updateMonsterHealth', (monsterID, health) => {
      this.monsters.getChildren().forEach((monster) => {
        if (monster.id === monsterID){
          monster.updateHealth(health);
        }
      });
    });

    // Listener Event for updating players health 
    this.events.on('updatePlayerHealth', (playerID, health) => {
      if (health < this.player.health){
        this.playerDamageAudio.play();
      }
      this.player.updateHealth(health);
    });

    // create the game manager
    this.gameManager = new GameManager(this, this.map.map.objects) //.map field of this.map is the .json tilemap
    this.gameManager.setup();
  }
}
