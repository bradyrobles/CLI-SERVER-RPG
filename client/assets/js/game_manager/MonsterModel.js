class MonsterModel {
    constructor(x, y, gold, spawnerID, frame, health, attackV){
        this.id = `${spawnerID}-${uuid.v4()}`;
        this.spawnerID = spawnerID;
        this.x = x * scaleFactor;
        this.y = y * scaleFactor;
        this.gold = gold;
        this.frame = frame;
        this.health = health;
        this.maxHealth = health;
        this.attackV = attackV;
    }
    
    loseHealth(){
        this.health -= 1;
    }

    move(){
        const randomPosition = randomNumber(1, 8);
        const distance = 64;

        switch (randomPosition) {
            case 1:
                this.x += distance;
                break;
            case 2:
                this.x -= distance;
                break;
            case 3:
                this.y += distance;
                break;
            case 4:
                this.y -= distance;
                break;
            case 5:
                this.x += distance;
                this.y += distance;
                break;
            case 6:
                this.x += distance;
                this.y -= distance;
                break;
            case 7:
                this.x -= distance;
                this.y += distance;
                break;
            case 8:
                this.x -= distance;
                this.y -= distance;
                break;
            default:
                break;
        }

    }
}