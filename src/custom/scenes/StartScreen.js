export default class StartScreen extends Phaser.Scene {
  constructor() {
    super("StartScreen");
  }

  create() {
    this.addBackgroundImage();
    this.addTableImage();
    this.addTitleImage();
    this.addSubtitleImage();
    this.addStartButton();

    // Add event listener for pointerdown event on the entire scene
    this.input.on("pointerdown", () => {
      this.startGame();
    });
  }

  addBackgroundImage() {
    this.add
      .image(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        "red-background"
      )
      .setOrigin(0.5, 0.5)
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
  }

  addTableImage() {
    this.table = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "table"
    );
    this.setTableScale(1.3, 1.3); // Set the scale of the table image
  }

  setTableScale(scaleX, scaleY) {
    this.table.setScale(scaleX, scaleY);
  }

  addTitleImage() {
    const title = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 120,
      "thirty-one"
    );
    title.setOrigin(0.5, 0.5);

    // Set the scale of the title image
    this.setTitleImageScale(title, 0.7);
  }

  addSubtitleImage() {
    const subtitle = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 40,
      "card-game"
    );
    subtitle.setOrigin(0.5, 0.5);

    // Set the scale of the subtitle image
    this.setSubtitleImageScale(subtitle, 0.5);
  }

  setTitleImageScale(title, scale) {
    title.setScale(scale);
  }

  setSubtitleImageScale(subtitle, scale) {
    subtitle.setScale(scale);
  }

  addStartButton() {
    const button = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 150,
      "start-game"
    );
    button.setOrigin(0.5, 0.5);
    button.setInteractive();
    button.on("pointerdown", () => {
      this.startGame();
    });

    this.setStartButtonScale(button, 0.4);
    this.fadeInOut(button, 1000); // Default fade duration is 1000ms
  }

  setStartButtonScale(button, scale) {
    button.setScale(scale);
  }

  fadeInOut(button, duration) {
    this.tweens.add({
      targets: button,
      alpha: { from: 0, to: 1 },
      duration: duration,
      yoyo: true,
      repeat: -1,
    });
  }

  startGame() {
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.cameras.main.on("camerafadeoutcomplete", () => {
      this.scene.start("GameOrchestrator");
    });
  }
}
