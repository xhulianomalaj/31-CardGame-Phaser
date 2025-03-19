/**
 * Card Sorting Manager Module
 *
 * This module handles the sorting of cards in the game.
 * It provides methods for sorting cards by rank or suit and rearranging them in the container.
 */

export default class CardSortingManager {
  /**
   * Create a new CardSortingManager instance
   * @param {Phaser.Scene} scene - The scene that this sorting manager belongs to
   */
  constructor(scene) {
    this.scene = scene;
    this.rankOrder = {
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      10: 10,
      J: 10,
      Q: 10,
      K: 10,
      A: 11,
    };
    this.suitOrder = {
      Hearts: 0,
      Diamonds: 1,
      Clubs: 2,
      Spades: 3,
    };
  }

  /**
   * Sort cards by rank
   * @param {Array} cards - Array of card sprites
   * @returns {Array} - Sorted array of cards
   */
  sortCardsByRank(cards) {
    return [...cards].sort((a, b) => {
      return this.rankOrder[a.cardData.rank] - this.rankOrder[b.cardData.rank];
    });
  }

  /**
   * Sort cards by suit
   * @param {Array} cards - Array of card sprites
   * @returns {Array} - Sorted array of cards
   */
  sortCardsBySuit(cards) {
    return [...cards].sort((a, b) => {
      const suitDiff =
        this.suitOrder[a.cardData.suit] - this.suitOrder[b.cardData.suit];
      if (suitDiff !== 0) return suitDiff;

      return this.rankOrder[a.cardData.rank] - this.rankOrder[b.cardData.rank];
    });
  }

  /**
   * Rearrange cards in a container
   * @param {Phaser.GameObjects.Container} container - The container with the cards
   * @param {Array} sortedCards - Array of sorted card sprites
   * @param {number} cardSpacing - The spacing between cards
   */
  rearrangeCards(container, sortedCards, cardSpacing = 50) {
    container.removeAll(false);

    sortedCards.forEach((card, index) => {
      container.add(card);
      this.scene.tweens.add({
        targets: card,
        x: index * cardSpacing,
        duration: 300,
        onComplete: () => {
          card.setData("originalPosition", { x: card.x, y: card.y });
          card.setDepth(index);
        },
      });
    });
  }
}
