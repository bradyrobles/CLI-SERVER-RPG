import * as Phaser from 'phaser'; // import all of phaser-module and reference as Phaser
import scenes from './scenes/scenes';

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	scene: scenes,
	physics: {
		default: 'arcade',
		arcade: {
			debug: false,
			gravity: {
				y: 0,
			},
		},
	},
	pixelArt: true, // flag to phaser that we are using pixel art
	roundPixels: true, // round pixels to an integer, eliminating floating point positions
};

class Game extends Phaser.Game {
	constructor() {
		super(config);
		this.scene.start('Boot');
	}
}

window.onload = () => {
	window.game = new Game();
};
