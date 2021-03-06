import { scaleFactor } from '../game_manager/utils';

export default class GameMap {
	constructor(scene, key, tileSetName, bgLayerName, blLayerName) {
		this.scene = scene; // scene the map belongs to
		this.key = key; // Tiled JSON file key name
		this.tileSetName = tileSetName; // Tiled tileset image key name
		this.bgLayerName = bgLayerName; // name of the Tiled layer for background
		this.blLayerName = blLayerName; // name of the Tiled layer for blocked
		this.createMap();
	}

	createMap() {
		// create the tile map, 'map' refers to variable assigned in BootScene.loadTileMap()
		this.tileMap = this.scene.make.tilemap({ key: this.key });

		// add tileset image to map
		this.tiles = this.tileMap.addTilesetImage(
			this.tileSetName,
			this.bgLayerName,
			32,
			32,
			1,
			2,
		);
		// create background layer, use layer ID from .json Tiled file for key
		this.backgroundLayer = this.tileMap.createStaticLayer(
			this.bgLayerName,
			this.tiles,
			0,
			0,
		);
		this.backgroundLayer.setScale(2);

		// create blocked layer
		this.blockedLayer = this.tileMap.createStaticLayer(
			this.blLayerName,
			this.tiles,
			0,
			0,
		);
		this.blockedLayer.setScale(2);
		this.blockedLayer.setCollisionByExclusion([-1]);

		// update world bounds; *2 because we already scaled up map
		this.scene.physics.world.bounds.width =
			this.tileMap.widthInPixels * scaleFactor;
		this.scene.physics.world.bounds.height =
			this.tileMap.heightInPixels * scaleFactor;

		// limit camera to (x,y) of our map
		this.scene.cameras.main.setBounds(
			0,
			0,
			this.tileMap.widthInPixels * scaleFactor,
			this.tileMap.heightInPixels * scaleFactor,
		);
	}
}
