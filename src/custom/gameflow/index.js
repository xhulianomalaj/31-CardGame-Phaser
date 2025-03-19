/**
 * Game Flow Manager Module
 *
 * This module handles the flow of the game and card movement.
 * It provides methods for dealing cards and moving cards between containers.
 */

export default class GameFlowManager {
  /**
   * Create a new GameFlowManager instance
   * @param {Phaser.Scene} scene - The scene that this game flow manager belongs to
   */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Deal cards to players
   * @param {Object} deckManager - The deck manager
   * @param {Object} gameManager - The game manager
   * @param {Phaser.GameObjects.Container} deckContainer - The deck container
   * @param {Phaser.GameObjects.Container} player1Container - Player 1's container
   * @param {Phaser.GameObjects.Container} player2Container - Player 2's container
   * @param {Phaser.GameObjects.Container} discardPileContainer - The discard pile container
   * @param {Function} setupPlayerCard - Function to set up player 1's cards
   * @param {Function} setupCard - Function to set up player 2's cards
   * @param {Function} moveTopCardToDiscardPile - Function to move a card to the discard pile
   * @param {Function} onComplete - Callback when dealing is complete
   */
  dealCards(
    deckManager,
    gameManager,
    deckContainer,
    player1Container,
    player2Container,
    discardPileContainer,
    setupPlayerCard,
    setupCard,
    moveTopCardToDiscardPile,
    onComplete
  ) {
    // Set the animation flag to prevent interactions
    gameManager.updateGameState("isAnimating", true);
    gameManager.updateGameState("cardsInteractable", false);

    // Use the DeckManager to deal cards
    deckManager.dealCards(
      deckContainer,
      player1Container,
      player2Container,
      discardPileContainer,
      setupPlayerCard,
      setupCard,
      moveTopCardToDiscardPile,
      () => {
        gameManager.updateGameState("animationComplete", true);
        // Reset the animation flag after all cards are dealt
        this.scene.time.delayedCall(1000, () => {
          gameManager.updateGameState("isAnimating", false);
          if (onComplete) onComplete();
        });
      }
    );
  }

  /**
   * Move top card from deck or discard pile to player
   * @param {Object} sourceManager - The source manager (deck or discard pile)
   * @param {Object} gameManager - The game manager
   * @param {Phaser.GameObjects.Container} sourceContainer - The source container
   * @param {Phaser.GameObjects.Container} playerContainer - The player container
   * @param {Function} setupPlayerCard - Function to set up the card
   * @param {Function} updatePoints - Function to update points
   */
  moveCardToPlayer(
    sourceManager,
    gameManager,
    sourceContainer,
    playerContainer,
    setupPlayerCard,
    updatePoints
  ) {
    // For player 1, check if it's their turn and they haven't already drawn
    // For player 2 (AI), we bypass these checks since the AI controls when to draw
    const isPlayer1Container = playerContainer === this.scene.player1Container;

    if (
      isPlayer1Container &&
      (!gameManager.gameState.isPlayerTurn ||
        gameManager.gameState.hasDrawnCard || // Prevent drawing more than once per turn
        gameManager.gameState.knockButtonPressed ||
        gameManager.gameState.isAnimating)
    ) {
      console.log("Cannot draw: not player's turn or already drawn this turn");
      return;
    }

    // For player 2, we only check animation and knock state
    if (
      !isPlayer1Container &&
      (gameManager.gameState.knockButtonPressed ||
        gameManager.gameState.isAnimating)
    ) {
      return;
    }

    console.log("Drawing card for player");

    // Set the animation flag to prevent interactions
    gameManager.updateGameState("isAnimating", true);
    gameManager.updateGameState("cardsInteractable", false);

    // Create a callback for when the card move is complete
    const onComplete = () => {
      gameManager.updateGameState("hasDrawnCard", true);
      gameManager.updateGameState("hasDiscardedCard", false);
      gameManager.updateGameState("mustDiscard", true);

      updatePoints();

      // Reset the animation flag
      gameManager.updateGameState("isAnimating", false);

      // Only make cards interactable if it's player 1's turn
      if (gameManager.gameState.isPlayerTurn) {
        gameManager.updateGameState("cardsInteractable", true);
      }
    };

    // Check if we're using the DeckManager or DiscardPileManager
    if (sourceManager.constructor.name === "DiscardPileManager") {
      // DiscardPileManager's moveTopCardToPlayer expects different parameters
      sourceManager.moveTopCardToPlayer(
        playerContainer,
        setupPlayerCard,
        onComplete
      );
    } else {
      // DeckManager's moveTopCardToPlayer expects these parameters
      sourceManager.moveTopCardToPlayer(
        sourceContainer,
        playerContainer,
        setupPlayerCard,
        onComplete
      );
    }
  }

  /**
   * Move top card from deck to player
   * @param {Object} deckManager - The deck manager
   * @param {Object} gameManager - The game manager
   * @param {Phaser.GameObjects.Container} deckContainer - The deck container
   * @param {Phaser.GameObjects.Container} playerContainer - The player container
   * @param {Function} setupPlayerCard - Function to set up the card
   * @param {Function} updatePoints - Function to update points
   */
  moveTopCardToPlayer(
    deckManager,
    gameManager,
    deckContainer,
    playerContainer,
    setupPlayerCard,
    updatePoints
  ) {
    this.moveCardToPlayer(
      deckManager,
      gameManager,
      deckContainer,
      playerContainer,
      setupPlayerCard,
      updatePoints
    );
  }

  /**
   * Move top card from discard pile to player
   * @param {Object} discardPileManager - The discard pile manager
   * @param {Object} gameManager - The game manager
   * @param {Phaser.GameObjects.Container} playerContainer - The player container
   * @param {Function} setupPlayerCard - Function to set up the card
   * @param {Function} updatePoints - Function to update points
   */
  moveTopCardFromDiscardPileToPlayer(
    discardPileManager,
    gameManager,
    playerContainer,
    setupPlayerCard,
    updatePoints
  ) {
    this.moveCardToPlayer(
      discardPileManager,
      gameManager,
      discardPileManager.discardPileContainer,
      playerContainer,
      setupPlayerCard,
      updatePoints
    );
  }

  /**
   * Discard a card from player's hand
   * @param {Object} discardPileManager - The discard pile manager
   * @param {Object} gameManager - The game manager
   * @param {Phaser.GameObjects.Sprite} card - The card to discard
   * @param {Phaser.GameObjects.Container} playerContainer - The player container
   * @param {Function} setupDiscardPileCard - Function to set up the discard pile card
   * @param {Function} animatePlayerHand - Function to animate the player's hand
   * @param {Function} updatePoints - Function to update points
   */
  discardCard(
    discardPileManager,
    gameManager,
    card,
    playerContainer,
    setupDiscardPileCard,
    animatePlayerHand,
    updatePoints
  ) {
    // For player 1, check if it's their turn and they must discard
    // For player 2 (AI), we bypass these checks since the AI controls when to discard
    const isPlayer1Container = playerContainer === this.scene.player1Container;

    if (
      isPlayer1Container &&
      (!gameManager.gameState.isPlayerTurn ||
        !gameManager.gameState.mustDiscard ||
        gameManager.gameState.hasDiscardedCard || // Prevent discarding more than once per turn
        gameManager.gameState.knockButtonPressed ||
        gameManager.gameState.isAnimating)
    ) {
      console.log(
        "Cannot discard: not player's turn, already discarded, or no need to discard"
      );
      return;
    }

    // For player 2, we only check animation and knock state
    if (
      !isPlayer1Container &&
      (gameManager.gameState.knockButtonPressed ||
        gameManager.gameState.isAnimating)
    ) {
      return;
    }

    console.log("Discarding card for player");

    // Set the animation flag to prevent interactions
    gameManager.updateGameState("isAnimating", true);
    gameManager.updateGameState("cardsInteractable", false);

    // Use the DiscardPileManager to discard a card
    discardPileManager.discardCardFromPlayer(
      card,
      playerContainer,
      setupDiscardPileCard,
      animatePlayerHand,
      () => {
        updatePoints();

        gameManager.updateGameState("hasDiscardedCard", true);
        gameManager.updateGameState("hasDrawnCard", false);
        gameManager.updateGameState("mustDiscard", false);

        // Keep cards non-interactable during the delay
        gameManager.updateGameState("cardsInteractable", false);

        this.scene.time.delayedCall(500, () => {
          // Reset the animation flag after the delay
          gameManager.updateGameState("isAnimating", false);

          // For player 1, after discarding, make only hand cards interactable
          // but not deck or discard pile cards (turn is complete)
          if (isPlayer1Container) {
            // Make player's hand cards interactable but not deck/discard pile
            gameManager.updateGameState("cardsInteractable", true);

            // Make deck and discard pile non-interactable after player has drawn and discarded
            if (this.scene.deckContainer) {
              this.scene.deckContainer.list.forEach((card) => {
                card.disableInteractive();
              });
            }

            if (this.scene.discardPileContainer) {
              this.scene.discardPileContainer.list.forEach((card) => {
                card.disableInteractive();
              });
            }
          } else if (gameManager.gameState.isPlayerTurn) {
            // For player 2, only make cards interactable if it's their turn
            gameManager.updateGameState("cardsInteractable", true);
          }
        });
      }
    );
  }
}
