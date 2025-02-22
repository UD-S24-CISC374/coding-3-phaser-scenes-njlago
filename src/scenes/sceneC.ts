import Phaser from "phaser";

export default class SceneC extends Phaser.Scene {
    private platforms?: Phaser.Physics.Arcade.StaticGroup;

    private player?: Phaser.Physics.Arcade.Sprite;

    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

    private stars: Phaser.Physics.Arcade.Group;

    private score = 0;

    private scoreText: Phaser.GameObjects.Text;

    private bombs: Phaser.Physics.Arcade.Group;

    private gameOver = false;

    private round = 1;

    private roundText: Phaser.GameObjects.Text;

    constructor() {
        super({ key: "sceneC" });
    }

    init() {}

    preload() {}

    create() {
        this.add.image(400, 300, "forest");

        this.platforms = this.physics.add.staticGroup();
        const ground = this.platforms.create(
            400,
            568,
            "platform"
        ) as Phaser.Physics.Arcade.Sprite;

        ground.setScale(2).refreshBody();

        this.platforms.create(600, 400, "platform");
        this.platforms.create(50, 250, "platform");
        this.platforms.create(750, 220, "platform");

        const playerLocation = this.registry.get("playerLocation");

        this.player = this.physics.add.sprite(
            playerLocation.x,
            playerLocation.y,
            "dude"
        );
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("dude", {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "turn",
            frames: [{ key: "dude", frame: 4 }],
            frameRate: 20,
        });

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("dude", {
                start: 5,
                end: 8,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.physics.add.collider(this.player, this.platforms);

        this.cursors = this.input.keyboard?.createCursorKeys();

        this.stars = this.physics.add.group({
            key: "star",
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 },
        });

        this.stars.children.iterate((c) => {
            const child = c as Phaser.Physics.Arcade.Image;
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

            return true;
        });

        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.overlap(
            this.player,
            this.stars,
            this.handleCollectStar,
            undefined,
            this
        );

        this.scoreText = this.add.text(16, 16, "Score: 0", {
            fontSize: "32px",
            color: "#999",
        });

        this.roundText = this.add.text(630, 16, "Round: 1", {
            fontSize: "32px",
            color: "#999",
        });

        this.bombs = this.physics.add.group();

        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(
            this.player,
            this.bombs,
            this.handleHitBomb,
            undefined,
            this
        );
    }

    private handleHitBomb() {
        this.physics.pause();
        this.player?.setTint(0xff0000);
        this.player?.anims.play("turn");

        this.gameOver = true;
    }

    private handleCollectStar(
        player:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Tilemaps.Tile,
        s: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
    ) {
        const star = s as Phaser.Physics.Arcade.Image;
        star.disableBody(true, true);

        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);

        if (this.stars.countActive(true) === 0) {
            this.registry.set("playerLocation", {
                x: this.player?.x,
                y: this.player?.y,
            });
            this.scene.start("sceneD");

            this.stars.children.iterate((c) => {
                const child = c as Phaser.Physics.Arcade.Image;
                child.enableBody(true, child.x, 0, true, true);
                return true;
            });

            if (!this.player) {
                return;
            }
            const x =
                this.player.x < 400
                    ? Phaser.Math.Between(400, 800)
                    : Phaser.Math.Between(0, 400);

            const bomb: Phaser.Physics.Arcade.Image = this.bombs.create(
                x,
                16,
                "bomb"
            );
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

            this.round += 1;
            this.roundText.setText(`Round: ${this.round}`);
        }
    }

    update() {
        if (!this.cursors) {
            return;
        }

        if (this.cursors.left.isDown) {
            this.player?.setVelocityX(-160);
            this.player?.anims.play("left", true);
        } else if (this.cursors.right.isDown) {
            this.player?.setVelocityX(160);
            this.player?.anims.play("right", true);
        } else {
            this.player?.setVelocityX(0);
            this.player?.anims.play("turn");
        }

        if (this.cursors.up.isDown && this.player?.body?.touching.down) {
            const x =
                this.player.x < 400
                    ? Phaser.Math.Between(400, 800)
                    : Phaser.Math.Between(0, 400);

            const bomb: Phaser.Physics.Arcade.Image = this.bombs.create(
                x,
                16,
                "bomb"
            );
            bomb.setBounce(1.3);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            this.player.setVelocityY(-330);
        }
    }
}
