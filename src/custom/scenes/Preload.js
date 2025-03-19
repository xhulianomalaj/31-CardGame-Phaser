class AssetLoader {
  constructor(scene) {
    this.scene = scene;
  }

  loadImage(key, path) {
    this.scene.load.image(key, path);
  }
}

export default class Preload extends Phaser.Scene {
  constructor() {
    super("Preload");
    this.assetLoader = new AssetLoader(this);
  }

  preload() {
    this.preloadAssets();
  }

  preloadAssets() {
    // Preload the table.png asset
    this.assetLoader.loadImage("table", "assets/table.png");
    // Preload the red-background.png asset
    this.assetLoader.loadImage("red-background", "assets/red-background.png");
    // Preload the back_red.png asset
    this.assetLoader.loadImage(
      "back_red",
      "assets/PixelartPokerCards/backs/back_red.png"
    );
    // Preload the start-game.png asset
    this.assetLoader.loadImage("start-game", "assets/start-game.png");
    // Preload the Thirty-one.png asset
    this.assetLoader.loadImage("thirty-one", "assets/Thirty-one.png");
    // Preload the Card-game.png asset
    this.assetLoader.loadImage("card-game", "assets/Card-game.png");

    // Preload all 52 card images
    const suits = ["Clubs", "Diamonds", "Hearts", "Spades"];
    const ranks = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
      "A",
    ];
    for (const suit of suits) {
      for (const rank of ranks) {
        const key = `${rank}${suit.toLowerCase()}`;
        const path = `assets/PixelartPokerCards/${suit}/${key}.png`;
        this.assetLoader.loadImage(key, path);
      }
    }
  }

  create() {
    this.scene.start("StartScreen");
  }
}
