var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [
    BootScene,
    TitleScene,
    GameScene,
    UiScene,
  ],
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

var game = new Phaser.Game(config);
