/**
 * Game Manager Module
 *
 * This module handles the game state and logic.
 * It provides methods for managing game flags, restarting the game, and checking winners.
 */

export default class GameManager {
  /**
   * Create a new GameManager instance
   * @param {Phaser.Scene} scene - The scene that this game manager belongs to
   */
  constructor(scene) {
    this.scene = scene;
    this.gameState = {
      animationComplete: false,
      cardsInteractable: false,
      hasDrawnCard: false,
      hasDiscardedCard: false,
      mustDiscard: false,
      knockButtonPressed: false,
      isAnimating: false,
      isPlayerTurn: true // Player 1 goes first
    };
    this.player1Points = 0;
    this.player2Points = 0;
  }

  /**
   * Get the current game state
   * @returns {Object} - The current game state
   */
  getGameState() {
    return this.gameState;
  }

  /**
   * Update a specific game state flag
   * @param {string} flag - The flag to update
   * @param {boolean} value - The new value
   */
  updateGameState(flag, value) {
    if (flag in this.gameState) {
      this.gameState[flag] = value;
    }
  }

  /**
   * Reset all game flags
   */
  resetFlags() {
    this.gameState = {
      animationComplete: false,
      cardsInteractable: false,
      hasDrawnCard: false,
      hasDiscardedCard: false,
      mustDiscard: false,
      knockButtonPressed: false,
      isAnimating: false,
      isPlayerTurn: true // Player 1 goes first
    };
    this.player1Points = 0;
    this.player2Points = 0;
  }

  /**
   * Restart the game
   * @param {Function} onRestart - Callback when the game is restarted
   */
  restartGame(onRestart) {
    this.scene.cameras.main.fadeOut(500, 0, 0, 0);
    this.scene.time.delayedCall(500, () => {
      this.resetFlags();
      if (onRestart) {
        onRestart();
      }
      this.scene.cameras.main.fadeIn(500, 0, 0, 0);
    });
  }

  /**
   * Set player points
   * @param {number} player - The player number (1 or 2)
   * @param {number} points - The points to set
   */
  setPlayerPoints(player, points) {
    if (player === 1) {
      this.player1Points = points;
    } else if (player === 2) {
      this.player2Points = points;
    }
  }

  /**
   * Check winner and display result
   * @param {number} x - The x position for the result text
   * @param {number} y - The y position for the result text
   * @param {Object} style - The style for the text
   * @returns {Phaser.GameObjects.Text} - The result text
   */
  checkWinner(x, y, style = { fontSize: "24px", fill: "#fff" }) {
    const resultText =
      this.player1Points > this.player2Points
        ? "Player 1 Wins!"
        : this.player2Points > this.player1Points
        ? "Player 2 Wins!"
        : "The Game is a Draw!";

    return this.scene.add.text(x, y, resultText, style);
  }
}
