import * as Phaser from 'phaser';
import { scaleFactor } from '../game_manager/utils';

export default class Chest extends Phaser.Physics.Arcade.Image {
	constructor(scene, x, y, key, frame, coins, id) {
		super(scene, x, y, key, frame);
		this.scene = scene; // the scene this game object will be added to
		this.coins = coins; // the amount of coins this chest contains
		this.id = id;
		this.test = 1;

		// enable physics
		this.scene.physics.world.enable(this);
		// add the player to our existing scene
		this.scene.add.existing(this);
		this.setScale(scaleFactor);
	}

	makeActive() {
		this.setActive(true);
		this.setVisible(true);
		this.body.checkCollision.none = false;
	}

	makeInactive() {
		this.setActive(false);
		this.setVisible(false);
		this.body.checkCollision.none = true;
	}
}
