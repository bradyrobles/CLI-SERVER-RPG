class ChestModel {
    constructor(x, y, gold, spawnerID){
        this.id = `${spawnerID}-${uuid.v4()}`;
        this.spawnerID = spawnerID;
        this.x = x;
        this.y = y;
        this.gold = gold;
        this.hearts = 3;
    }
}