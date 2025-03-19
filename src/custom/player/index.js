/**
 * Player Manager Module
 *
 * This module handles the creation and management of player containers and cards.
 * It provides methods for creating player containers, setting up cards, and handling player interactions.
 */

export default class PlayerManager {
  /**
   * Create a new PlayerManager instance
   * @param {Phaser.Scene} scene - The scene that this player manager belongs to
   */
  constructor(scene) {
    this.scene = scene;
    this.player1Container = null;
    this.player2Container = null;
  }

  /**
   * Create player containers
   * @param {number} centerX - The center X position for the containers
   * @param {number} centerY - The center Y position for the screen
   * @param {number} offsetY - The Y offset from center for each player
   * @returns {Object} - Object containing both player containers
   */
  createPlayerContainers(centerX, centerY, offsetY) {
    this.player1Container = this.scene.add.container(
      centerX,
      centerY + offsetY
    );

    this.player2Container = this.scene.add.container(
      centerX,
      centerY - offsetY
    );

    return {
      player1Container: this.player1Container,
      player2Container: this.player2Container,
    };
  }

  /**
   * Set up basic card properties
   * @param {Phaser.GameObjects.Sprite} card - The card to set up
   * @param {number} xOffset - The x offset for the card
   * @param {Phaser.GameObjects.Container} container - The container the card belongs to
   */
  setupCard(card, xOffset, container) {
    card.setInteractive({ useHandCursor: true });
    card.x = xOffset;
    card.y = 0;
    card.setData("originalPosition", { x: card.x, y: card.y });
    card.setData("originalDepth", card.depth);
    card.setData("targetPosition", { x: card.x, y: card.y });
    card.setData("index", container.list.length - 1);
  }

  /**
   * Set up a player card with interactions
   * @param {Phaser.GameObjects.Sprite} card - The card to set up
   * @param {number} xOffset - The x offset for the card
   * @param {Phaser.GameObjects.Container} container - The container the card belongs to
   * @param {Function} onCardClick - Callback when the card is clicked
   * @param {Function} canDiscard - Function to check if the card can be discarded
   */
  setupPlayerCard(card, xOffset, container, onCardClick, canDiscard) {
    this.setupCard(card, xOffset, container);

    card.on("pointerdown", (pointer) => {
      if (pointer.button === 0 && canDiscard(card)) {
        onCardClick(card);
      }
    });

    if (!card.cardData.fromDiscardPile) {
      this.scene.tweens.add({
        targets: card,
        scaleX: 0,
        duration: 200,
        yoyo: true,
        onYoyo: () => {
          card.setTexture(
            `${card.cardData.rank}${card.cardData.suit.toLowerCase()}`
          );
        },
      });
    }

    const cardPosition = container.list.length - 1;
    card.setDepth(cardPosition);
  }

  /**
   * Animate cards in a player's hand
   * @param {Phaser.GameObjects.Container} container - The container with the cards
   * @param {number} cardSpacing - The spacing between cards
   */
  animatePlayerHand(container, cardSpacing = 50) {
    container.list.forEach((card, index) => {
      const targetX = index * cardSpacing;
      this.scene.tweens.add({
        targets: card,
        x: targetX,
        duration: 300,
        onComplete: () => {
          card.setData("originalPosition", { x: card.x, y: card.y });
        },
      });
    });
  }

  /**
   * Flip cards in a player's hand
   * @param {Phaser.GameObjects.Container} container - The container with the cards
   * @param {Function} onComplete - Callback when all cards are flipped
   */
  flipPlayerCards(container, onComplete) {
    let flippedCount = 0;
    const totalCards = container.list.length;

    container.each((card) => {
      this.scene.tweens.add({
        targets: card,
        scaleX: 0,
        duration: 300,
        yoyo: true,
        onYoyo: () => {
          card.setTexture(
            `${card.cardData.rank}${card.cardData.suit.toLowerCase()}`
          );
        },
        onComplete: () => {
          flippedCount++;
          if (flippedCount === totalCards && onComplete) {
            onComplete();
          }
        },
      });
    });
  }
}
