import 'phaser';

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	scene: { preload, create },
};

const game = new Phaser.Game(config);

function preload() {
	console.log('this is the preload method');
}

function create() {
	this.add.text(0, 0, 'hello world2');
}
