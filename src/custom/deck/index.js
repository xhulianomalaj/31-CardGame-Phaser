/**
 * Deck Module
 *
 * This module handles the creation and management of the card deck in the game.
 * It provides methods for creating, shuffling, and dealing cards.
 */

export default class DeckManager {
  /**
   * Create a new DeckManager instance
   * @param {Phaser.Scene} scene - The scene that this deck manager belongs to
   */
  constructor(scene) {
    this.scene = scene;
    this.deck = [];
    this.suits = ["Clubs", "Diamonds", "Hearts", "Spades"];
    this.ranks = [
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
  }

  /**
   * Create and shuffle a new deck of cards
   * @param {Phaser.GameObjects.Container} deckContainer - The container to add the cards to
   * @returns {Array} - The array of card objects
   */
  createDeck(deckContainer) {
    const deck = [];

    // Create all cards
    for (const suit of this.suits) {
      for (const rank of this.ranks) {
        deck.push({ suit, rank });
      }
    }

    // Shuffle the deck
    Phaser.Utils.Array.Shuffle(deck);

    // Create card sprites and add them to the container
    let yOffset = 0;
    for (let i = 0; i < deck.length; i++) {
      const card = deck[i];
      const cardImage = this.scene.add.image(0, yOffset - 15, "back_red");
      cardImage.setScale(2);
      cardImage.cardData = card;
      cardImage.setInteractive();
      // Set depth so that cards at the end of the array (top of the deck) have higher depth
      cardImage.setDepth(i);
      deckContainer.add(cardImage);
      yOffset += 0.4;
    }

    this.deck = deck;
    return deckContainer.list;
  }

  /**
   * Deal cards to players
   * @param {Phaser.GameObjects.Container} deckContainer - The container with the deck
   * @param {Phaser.GameObjects.Container} player1Container - The container for player 1's cards
   * @param {Phaser.GameObjects.Container} player2Container - The container for player 2's cards
   * @param {Phaser.GameObjects.Container} discardPileContainer - The container for the discard pile
   * @param {Function} setupPlayerCard - Function to set up player 1's cards
   * @param {Function} setupCard - Function to set up player 2's cards
   * @param {Function} moveTopCardToDiscardPile - Function to move a card to the discard pile
   * @param {Function} onComplete - Callback when dealing is complete
   */
  dealCards(
    deckContainer,
    player1Container,
    player2Container,
    discardPileContainer,
    setupPlayerCard,
    setupCard,
    moveTopCardToDiscardPile,
    onComplete
  ) {
    const deck = deckContainer.list;
    let cardIndex = 0;

    // Sort the deck by depth to ensure we're dealing from the top (highest depth)
    const sortedDeck = [...deck].sort((a, b) => b.depth - a.depth);

    const dealCard = () => {
      if (cardIndex >= 6) {
        // Get the 7th card (index 6) from the sorted deck (top of the visual deck)
        const discardCard = sortedDeck[cardIndex];
        moveTopCardToDiscardPile(discardCard);
        if (onComplete) onComplete();
        return;
      }

      const card = sortedDeck[cardIndex];
      const targetContainer =
        cardIndex % 2 === 0 ? player1Container : player2Container;
      const xOffset = targetContainer.list.length * 50;

      this.scene.tweens.add({
        targets: card,
        x: targetContainer.x - deckContainer.x + xOffset,
        y: targetContainer.y - deckContainer.y,
        duration: 500,
        onComplete: () => {
          targetContainer.add(card);
          if (targetContainer === player1Container) {
            setupPlayerCard(card, xOffset);
          } else {
            setupCard(card, xOffset);
          }
          cardIndex++;
          dealCard();
        },
      });
    };

    dealCard();
  }

  /**
   * Move the top card from the deck to the discard pile
   * @param {Phaser.GameObjects.Container} deckContainer - The container with the deck
   * @param {Phaser.GameObjects.Container} discardPileContainer - The container for the discard pile
   * @param {Function} setDepth - Function to set the depth of the card
   * @param {Function} setupDiscardCard - Function to set up the card in the discard pile
   */
  moveTopCardToDiscardPile(
    deckContainer,
    discardPileContainer,
    setDepth,
    setupDiscardCard
  ) {
    const deck = deckContainer.list;
    if (deck.length === 0) return;

    // Find the card with the highest depth (top of the deck)
    const topCard = deck.reduce(
      (highest, current) => (current.depth > highest.depth ? current : highest),
      deck[0]
    );

    const sourceContainer = topCard.parentContainer || deckContainer;
    const targetX = discardPileContainer.x - sourceContainer.x;
    const targetY = discardPileContainer.y - sourceContainer.y;

    this.scene.tweens.add({
      targets: topCard,
      x: targetX,
      y: targetY,
      duration: 500,
      onComplete: () => {
        discardPileContainer.add(topCard);
        topCard.x = 0;
        topCard.y = 0;
        topCard.setInteractive();
        setDepth(topCard);
        setupDiscardCard(topCard);
      },
    });
  }

  /**
   * Move the top card from the discard pile to a player
   * @param {Phaser.GameObjects.Container} discardPileContainer - The container with the discard pile
   * @param {Phaser.GameObjects.Container} playerContainer - The container for the player's cards
   * @param {Function} setupPlayerCard - Function to set up the card
   * @param {Function} onComplete - Callback when the move is complete
   */
  moveTopCardFromDiscardPileToPlayer(
    discardPileContainer,
    playerContainer,
    setupPlayerCard,
    onComplete
  ) {
    const discardPile = discardPileContainer.list;
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
      x: playerContainer.x - discardPileContainer.x + xOffset,
      y: playerContainer.y - discardPileContainer.y,
      duration: 500,
      onComplete: () => {
        playerContainer.add(topCard);
        setupPlayerCard(topCard, xOffset);
        if (onComplete) onComplete();
      },
    });
  }

  /**
   * Move a card to the discard pile
   * @param {Phaser.GameObjects.Sprite} card - The card to move
   * @param {Phaser.GameObjects.Container} discardPileContainer - The container for the discard pile
   * @param {Function} setDepth - Function to set the depth of the card
   * @param {Function} setupDiscardCard - Function to set up the card in the discard pile
   */
  moveCardToDiscardPile(
    card,
    discardPileContainer,
    setDepth,
    setupDiscardCard
  ) {
    const deckContainer = card.parentContainer || this.scene.deckContainer;
    const targetX = discardPileContainer.x - deckContainer.x;
    const targetY = discardPileContainer.y - deckContainer.y;

    // Set a high depth to ensure the card appears on top during animation
    const currentHighestDepth = discardPileContainer.list.reduce(
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
        discardPileContainer.add(card);
        card.x = 0;
        card.y = 0;
        card.setInteractive();
        setDepth(card);
        setupDiscardCard(card);
      },
    });
  }

  /**
   * Discard a card from a player's hand
   * @param {Phaser.GameObjects.Sprite} card - The card to discard
   * @param {Phaser.GameObjects.Container} playerContainer - The container for the player's cards
   * @param {Phaser.GameObjects.Container} discardPileContainer - The container for the discard pile
   * @param {Function} setDepth - Function to set the depth of the card
   * @param {Function} setupDiscardPileCard - Function to set up the discard pile card
   * @param {Function} animatePlayerHand - Function to animate the player's hand after discarding
   * @param {Function} onComplete - Callback when the discard is complete
   */
  discardCard(
    card,
    playerContainer,
    discardPileContainer,
    setDepth,
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
    const currentHighestDepth = discardPileContainer.list.reduce(
      (highest, current) => Math.max(highest, current.depth),
      0
    );
    card.setDepth(currentHighestDepth + 100);

    this.scene.tweens.add({
      targets: card,
      x: discardPileContainer.x,
      y: discardPileContainer.y,
      duration: 400,
      onComplete: () => {
        discardPileContainer.add(card);
        card.x = 0;
        card.y = 0;

        setDepth(card);
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

  /**
   * Get the suit symbol for a suit
   * @param {string} suit - The suit name
   * @returns {Object} - Object containing the symbol
   */
  getSuitSymbol(suit) {
    const symbols = {
      Hearts: "♥",
      Diamonds: "♦",
      Clubs: "♣",
      Spades: "♠",
    };
    return { symbol: symbols[suit] || "" };
  }

  /**
   * Calculate points for a set of cards
   * @param {Array} cards - Array of card sprites
   * @returns {Object} - Object with total points and points by suit
   */
  calculatePoints(cards) {
    if (!cards || cards.length === 0) {
      return { maxPoints: 0, pointsBySuit: {}, totalPointsText: "" };
    }

    const pointsBySuit = cards.reduce((acc, cardSprite) => {
      const card = cardSprite.cardData;
      const suitSymbol = this.getSuitSymbol(card.suit).symbol;
      if (!acc[suitSymbol]) acc[suitSymbol] = 0;
      acc[suitSymbol] += this.rankOrder[card.rank];
      return acc;
    }, {});

    const points = Object.values(pointsBySuit);
    const maxPoints = Math.max(...points);

    const totalPointsText = Object.entries(pointsBySuit)
      .map(([symbol, points]) => `${points}${symbol}`)
      .join(" ");

    return { maxPoints, pointsBySuit, totalPointsText };
  }

  /**
   * Move the top card from the deck to a player
   * @param {Phaser.GameObjects.Container} deckContainer - The container with the deck
   * @param {Phaser.GameObjects.Container} playerContainer - The container for the player's cards
   * @param {Function} setupPlayerCard - Function to set up the card
   * @param {Function} onComplete - Callback when the move is complete
   */
  moveTopCardToPlayer(
    deckContainer,
    playerContainer,
    setupPlayerCard,
    onComplete
  ) {
    const deck = deckContainer.list;
    if (deck.length === 0) return;

    // Find the card with the highest depth (top of the deck)
    const topCard = deck.reduce(
      (highest, current) => (current.depth > highest.depth ? current : highest),
      deck[0]
    );

    const xOffset = playerContainer.list.length * 50;

    this.scene.tweens.add({
      targets: topCard,
      x: playerContainer.x - deckContainer.x + xOffset,
      y: playerContainer.y - deckContainer.y,
      duration: 500,
      onComplete: () => {
        playerContainer.add(topCard);
        setupPlayerCard(topCard, xOffset);
        if (onComplete) onComplete();
      },
    });
  }

  /**
   * Get the value of a card
   * @param {Phaser.GameObjects.Sprite} card - The card to get the value of
   * @returns {number} - The value of the card
   */
  getCardValue(card) {
    if (!card || !card.cardData) return 0;
    return this.rankOrder[card.cardData.rank] || 0;
  }

  /**
   * Find the worst card in a hand
   * @param {Array} cards - Array of card sprites
   * @returns {Phaser.GameObjects.Sprite} - The worst card
   */
  findWorstCard(cards) {
    if (!cards || cards.length === 0) return null;

    // If there are only 3 cards, we need to draw first
    if (cards.length <= 3) return null;

    let worstCard = cards[0];
    let lowestValue = this.getCardValue(worstCard);

    // Find the card with the lowest value
    for (const card of cards) {
      const value = this.getCardValue(card);
      if (value < lowestValue) {
        lowestValue = value;
        worstCard = card;
      }
    }

    return worstCard;
  }
}
