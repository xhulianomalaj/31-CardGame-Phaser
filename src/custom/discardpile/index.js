/**
 * Discard Pile Module
 *
 * This module handles the creation and management of the discard pile in the game.
 * It provides methods for creating the discard pile container and handling card interactions.
 */

export default class DiscardPileManager {
  /**
   * Create a new DiscardPileManager instance
   * @param {Phaser.Scene} scene - The scene that this discard pile manager belongs to
   */
  constructor(scene) {
    this.scene = scene;
    this.discardPileContainer = null;
  }

  /**
   * Create the discard pile container
   * @param {number} x - The x position of the discard pile
   * @param {number} y - The y position of the discard pile
   * @returns {Phaser.GameObjects.Container} - The discard pile container
   */
  createDiscardPileContainer(x, y) {
    this.discardPileContainer = this.scene.add.container(x, y);
    this.discardPileContainer.setSize(160, 320);
    this.discardPileContainer.setDepth(0);
    return this.discardPileContainer;
  }

  /**
   * Set up a card in the discard pile
   * @param {Phaser.GameObjects.Sprite} card - The card to set up
   * @param {Function} onCardClick - Callback when the card is clicked
   * @param {Function} isTopCard - Function to check if the card is the top card
   * @param {Function} canInteract - Function to check if the card can be interacted with
   */
  setupDiscardPileCard(card, onCardClick, isTopCard, canInteract) {
    if (!card.cardData.wasDiscarded) {
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

    card.setInteractive();
    card.on("pointerdown", () => {
      // Find the card with the highest depth (top of the discard pile)
      const topCard = this.discardPileContainer.list.reduce(
        (highest, current) =>
          current.depth > highest.depth ? current : highest,
        this.discardPileContainer.list[0]
      );

      // Only allow interaction with the top card if conditions are met
      if (isTopCard(card, topCard) && canInteract()) {
        onCardClick();
      }
    });
  }

  /**
   * Get the highest depth in a container
   * @param {Phaser.GameObjects.Container} container - The container to check
   * @returns {number} - The highest depth
   */
  getHighestDepth(container) {
    const list = container.list;
    return list.length > 0 ? Math.max(...list.map((c) => c.depth || 0)) : 0;
  }

  /**
   * Move a card to the discard pile
   * @param {Phaser.GameObjects.Sprite} card - The card to move
   * @param {Phaser.GameObjects.Container} sourceContainer - The container the card is coming from
   * @param {Function} setupDiscardPileCard - Function to set up the card in the discard pile
   */
  moveCardToDiscardPile(card, sourceContainer, setupDiscardPileCard) {
    const deckContainer = card.parentContainer || sourceContainer;
    const targetX = this.discardPileContainer.x - deckContainer.x;
    const targetY = this.discardPileContainer.y - deckContainer.y;

    // Set a high depth to ensure the card appears on top during animation
    const currentHighestDepth = this.discardPileContainer.list.reduce(
      (highest, current) => Math.max(highest, current.depth),
      0
    );
    card.setDepth(currentHighestDepth + 1);

    this.scene.tweens.add({
      targets: card,
      x: targetX,
      y: targetY,
      duration: 500,
      onComplete: () => {
        this.discardPileContainer.add(card);
        card.x = 0;
        card.y = 0;
        card.setInteractive();
        card.setDepth(this.getHighestDepth(this.discardPileContainer) + 10);
        setupDiscardPileCard(card);
      },
    });
  }

  /**
   * Move the top card from the discard pile to a player
   * @param {Phaser.GameObjects.Container} playerContainer - The container for the player's cards
   * @param {Function} setupPlayerCard - Function to set up the card
   * @param {Function} onComplete - Callback when the move is complete
   */
  moveTopCardToPlayer(playerContainer, setupPlayerCard, onComplete) {
    const discardPile = this.discardPileContainer.list;
    if (discardPile.length === 0) return;

    // Find the card with the highest depth (top of the discard pile)
    const topCard = discardPile.reduce(
      (highest, current) => (current.depth > highest.depth ? current : highest),
      discardPile[0]
    );

    topCard.cardData.fromDiscardPile = true;

    const xOffset = playerContainer.list.length * 50;

    this.scene.tweens.add({
      targets: topCard,
      x: playerContainer.x - this.discardPileContainer.x + xOffset,
      y: playerContainer.y - this.discardPileContainer.y,
      duration: 500,
      onComplete: () => {
        playerContainer.add(topCard);
        setupPlayerCard(topCard, xOffset);
        if (onComplete) onComplete();
      },
    });
  }

  /**
   * Discard a card from a player's hand
   * @param {Phaser.GameObjects.Sprite} card - The card to discard
   * @param {Phaser.GameObjects.Container} playerContainer - The container for the player's cards
   * @param {Function} setupDiscardPileCard - Function to set up the discard pile card
   * @param {Function} animatePlayerHand - Function to animate the player's hand after discarding
   * @param {Function} onComplete - Callback when the discard is complete
   */
  discardCardFromPlayer(
    card,
    playerContainer,
    setupDiscardPileCard,
    animatePlayerHand,
    onComplete
  ) {
    const worldPos = playerContainer.getWorldTransformMatrix();
    const cardX = worldPos.transformPoint(card.x, card.y).x;
    const cardY = worldPos.transformPoint(card.x, card.y).y;

    card.cardData.wasDiscarded = true;

    playerContainer.remove(card, false);
    card.x = cardX;
    card.y = cardY;
    this.scene.add.existing(card);

    // Set a high depth to ensure the card appears on top during animation
    const currentHighestDepth = this.discardPileContainer.list.reduce(
      (highest, current) => Math.max(highest, current.depth),
      0
    );
    card.setDepth(currentHighestDepth + 100);

    this.scene.tweens.add({
      targets: card,
      x: this.discardPileContainer.x,
      y: this.discardPileContainer.y,
      duration: 400,
      onComplete: () => {
        this.discardPileContainer.add(card);
        card.x = 0;
        card.y = 0;

        card.setDepth(this.getHighestDepth(this.discardPileContainer) + 10);
        card.setData("originalPosition", { x: card.x, y: card.y });
        card.setData("originalDepth", card.depth);
        card.setData("targetPosition", { x: card.x, y: card.y });

        card.removeAllListeners();
        setupDiscardPileCard(card);

        animatePlayerHand();

        if (onComplete) onComplete();
      },
    });
  }
}
