import Phaser from 'phaser';
import { TextureKeys } from '../utils/TextureKeys';
import { SceneKeys } from '../utils/SceneKeys';
import RocketMouse from '../game/RocketMouse';
import LaserObstacle from '../game/LaserObstacler';
import { GameObjectWithPhysics } from '../types/GameObjectWithPhysics';

export default class Game extends Phaser.Scene {
  private background!: Phaser.GameObjects.TileSprite;
  private mouseHole!: Phaser.GameObjects.Image;
  private window1!: Phaser.GameObjects.Image;
  private window2!: Phaser.GameObjects.Image;
  private bookcase1!: Phaser.GameObjects.Image;
  private bookcase2!: Phaser.GameObjects.Image;
  private windows: Phaser.GameObjects.Image[] = [];
  private bookcases: Phaser.GameObjects.Image[] = [];
  private laserObstacle!: LaserObstacle;

  constructor() {
    super(SceneKeys.Game);
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.background = this.add
      .tileSprite(0, 0, width, height, TextureKeys.Background)
      .setOrigin(0)
      .setScrollFactor(0, 0);

    this.mouseHole = this.add.image(
      Phaser.Math.Between(900, 1500),
      501,
      TextureKeys.MouseHole,
    );

    this.window1 = this.add.image(
      Phaser.Math.Between(900, 1300),
      200,
      TextureKeys.Window1,
    );

    this.window2 = this.add.image(
      Phaser.Math.Between(2000, 2400),
      200,
      TextureKeys.Window2,
    );

    this.windows = [this.window1, this.window2];

    this.bookcase1 = this.add
      .image(Phaser.Math.Between(2500, 3200), 580, TextureKeys.Bookcase1)
      .setOrigin(0.5, 1);

    this.bookcase2 = this.add
      .image(Phaser.Math.Between(3700, 4300), 580, TextureKeys.Bookcase2)
      .setOrigin(0.5, 1);

    this.bookcases = [this.bookcase1, this.bookcase2];

    this.laserObstacle = new LaserObstacle(this, 900, 100);
    this.add.existing(this.laserObstacle);

    const mouse = new RocketMouse(this, width * 0.5, height - 30);
    this.add.existing(mouse);

    const body = mouse.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setVelocityX(200);

    this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, height - 30);

    this.cameras.main.startFollow(mouse);
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, height);

    this.physics.add.overlap(
      this.laserObstacle,
      mouse,
      this.handleOverlapLaser,
      undefined,
      this,
    );
  }

  update() {
    this.wrapMouseHole();
    this.wrapWindow();
    this.wrapBookcase();
    this.wrapLaserObstacle();
    this.background.setTilePosition(this.cameras.main.scrollX);
  }

  private wrapMouseHole() {
    const scrollX = this.cameras.main.scrollX;
    const rightEdge = scrollX + this.scale.width;

    if (this.mouseHole.x + this.mouseHole.width < scrollX) {
      this.mouseHole.x = Phaser.Math.Between(rightEdge + 100, rightEdge + 1000);
    }
  }

  private wrapWindow() {
    const scrollX = this.cameras.main.scrollX;
    const rightEdge = scrollX + this.scale.width;

    let width = this.window1.width * 2;
    if (this.window1.x + width < scrollX) {
      this.window1.x = Phaser.Math.Between(rightEdge + width, rightEdge + width + 800);
      const overlap = this.bookcases.find((bc) => {
        return Math.abs(this.window1.x - bc.x) <= this.window1.width;
      });

      this.window1.visible = !overlap;
    }

    width = this.window2.width * 2;
    if (this.window2.x + width < scrollX) {
      this.window2.x = Phaser.Math.Between(
        this.window1.x + width,
        this.window1.x + width + 1200,
      );

      const overlap = this.bookcases.find((bc) => {
        return Math.abs(this.window2.x - bc.x) <= this.window2.width;
      });

      this.window2.visible = !overlap;
    }
  }

  private wrapBookcase() {
    const scrollX = this.cameras.main.scrollX;
    const rightEdge = scrollX + this.scale.width;

    let width = this.bookcase1.width * 2;
    if (this.bookcase1.x + width < scrollX) {
      this.bookcase1.x = Phaser.Math.Between(rightEdge + width, rightEdge + width + 800);
      const overlap = this.windows.find((win) => {
        return Math.abs(this.bookcase1.x - win.x) <= win.width;
      });

      this.bookcase1.visible = !overlap;
    }

    width = this.bookcase2.width * 2;
    if (this.bookcase2.x + width < scrollX) {
      this.bookcase2.x = Phaser.Math.Between(
        this.bookcase1.x + width,
        this.bookcase1.x + width + 1200,
      );
      const overlap = this.windows.find((win) => {
        return Math.abs(this.bookcase2.x - win.x) <= win.width;
      });

      this.bookcase2.visible = !overlap;
    }
  }

  private wrapLaserObstacle() {
    const scrollX = this.cameras.main.scrollX;
    const rightEdge = scrollX + this.scale.width;

    const body = this.laserObstacle.body as Phaser.Physics.Arcade.Body;

    const width = this.laserObstacle.width;

    if (this.laserObstacle.x + width < scrollX) {
      this.laserObstacle.x = Phaser.Math.Between(
        rightEdge + width,
        rightEdge - width + 1000,
      );

      this.laserObstacle.y = Phaser.Math.Between(0, 300);

      body.position.x = this.laserObstacle.x + body.offset.x;
      body.position.y = this.laserObstacle.y;
    }
  }

  private handleOverlapLaser(obj1: GameObjectWithPhysics, obj2: GameObjectWithPhysics) {
    // const laser = obj1 as LaserObstacle;
    const mouse = obj2 as RocketMouse;

    mouse.kill();
  }
}
