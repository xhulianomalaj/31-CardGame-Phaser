/**
 * UI Manager Module
 *
 * This module handles the creation and management of UI elements in the game.
 * It provides methods for creating text, background, and table elements.
 */

export default class UIManager {
  /**
   * Create a new UIManager instance
   * @param {Phaser.Scene} scene - The scene that this UI manager belongs to
   */
  constructor(scene) {
    this.scene = scene;
    this.totalPointsText = null;
    this.totalPointsTextPlayer2 = null;
    this.table = null;
  }

  /**
   * Add background image
   * @param {string} key - The key of the background image
   * @returns {Phaser.GameObjects.Image} - The background image
   */
  addBackgroundImage(key = "red-background") {
    return this.scene.add
      .image(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2,
        key
      )
      .setOrigin(0.5, 0.5)
      .setDisplaySize(
        this.scene.cameras.main.width,
        this.scene.cameras.main.height
      );
  }

  /**
   * Add table image
   * @param {number} x - The x position of the table
   * @param {number} y - The y position of the table
   * @param {number} scaleX - The x scale of the table
   * @param {number} scaleY - The y scale of the table
   * @param {string} key - The key of the table image
   * @returns {Phaser.GameObjects.Image} - The table image
   */
  addTableImage(x, y, scaleX = 1.3, scaleY = 1.3, key = "table") {
    this.table = this.scene.add.image(x, y, key);
    this.setTableScale(scaleX, scaleY);
    return this.table;
  }

  /**
   * Set the scale of the table
   * @param {number} scaleX - The x scale
   * @param {number} scaleY - The y scale
   */
  setTableScale(scaleX, scaleY) {
    if (this.table) {
      this.table.setScale(scaleX, scaleY);
    }
  }

  /**
   * Create points text for both players
   * @param {number} x1 - The x position for player 1's text
   * @param {number} y1 - The y position for player 1's text
   * @param {number} x2 - The x position for player 2's text
   * @param {number} y2 - The y position for player 2's text
   * @param {Object} style - The style for the text
   * @returns {Object} - Object containing both text objects
   */
  createPointsText(x1, y1, x2, y2, style = { fontSize: "18px", fill: "#fff" }) {
    this.totalPointsText = this.scene.add.text(x1, y1, "Total Points: ", style);
    this.totalPointsTextPlayer2 = this.scene.add.text(
      x2,
      y2,
      "Total Points: ",
      style
    );
    this.totalPointsTextPlayer2.setVisible(false);

    return {
      player1Text: this.totalPointsText,
      player2Text: this.totalPointsTextPlayer2,
    };
  }

  /**
   * Update total points text
   * @param {Array} cards - Array of cards to calculate points for
   * @param {Function} calculatePoints - Function to calculate points
   * @param {Phaser.GameObjects.Text} textObject - The text object to update
   * @returns {number} - The maximum points
   */
  updateTotalPoints(cards, calculatePoints, textObject) {
    const { maxPoints, totalPointsText } = calculatePoints(cards);
    textObject.setText(`Total Points: ${totalPointsText}`);
    return maxPoints;
  }
}
