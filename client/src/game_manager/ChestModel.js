import { v4 } from 'uuid';

export default class ChestModel {
	constructor(x, y, gold, spawnerID) {
		this.id = `${spawnerID}-${v4()}`;
		this.spawnerID = spawnerID;
		this.x = x;
		this.y = y;
		this.gold = gold;
		this.hearts = 3;
	}
}
