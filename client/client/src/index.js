import * as Phaser from 'phaser'; // import all of phaser-module and reference as Phaser

function create() {
	this.add.text(0, 0, 'hello world11');
}
const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	scene: {
		preload: () => {
			console.log('this is the preload method');
		},
		create,
	},
};

const game = new Phaser.Game(config);
console.log(game);
