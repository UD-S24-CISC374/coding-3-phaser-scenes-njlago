import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: "PreloadScene" });
    }

    preload() {
        this.load.image("sky", "assets/sky.png");
        this.load.image("platform", "assets/platform.png");
        this.load.image("star", "assets/star.png");
        this.load.image("bomb", "assets/bomb.png");
        this.load.spritesheet("dude", "assets/dude.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        // this.load.image("space", "assets/space.png");
        this.load.image("forest", "assets/forest.png");
        this.load.image("matrix", "assets/matrix.png");
        this.load.image("space", "assets/space.jpg");
    }

    create() {
        this.scene.start("MainScene");
    }
}
