export default class GameOrchestrator extends Phaser.Scene {
  constructor() {
    super("GameOrchestrator");
    // Game state will be managed by GameManager
  }

  create() {
    // Initialize managers
    this.buttonManager = new window.ButtonManager(this);
    this.deckManager = new window.DeckManager(this);
    this.discardPileManager = new window.DiscardPileManager(this);
    this.playerManager = new window.PlayerManager(this);
    this.uiManager = new window.UIManager(this);
    this.gameManager = new window.GameManager(this);
    this.sortingManager = new window.CardSortingManager(this);
    this.gameFlowManager = new window.GameFlowManager(this);

    this.setupGameBoard();
    this.createUI();
    this.initializeGame();
  }

  setupGameBoard() {
    this.uiManager.addBackgroundImage();
    this.table = this.uiManager.addTableImage(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    );

    const { player1Container, player2Container } =
      this.playerManager.createPlayerContainers(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        250
      );
    this.player1Container = player1Container;
    this.player2Container = player2Container;

    this.createDeckContainer();
    this.createDiscardPileContainer();
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    this.createDeck();
  }

  createUI() {
    const { player1Text, player2Text } = this.uiManager.createPointsText(
      this.cameras.main.width / 2 + 200,
      this.cameras.main.height / 2 + 200,
      this.cameras.main.width / 2 + 200,
      this.cameras.main.height / 2 - 210
    );
    this.totalPointsText = player1Text;
    this.totalPointsTextPlayer2 = player2Text;

    this.createKnockButton();
    this.createEndTurnButton();
    this.createSortButtons();
    this.createRulesButton();
    this.updateEndTurnButton();
  }

  initializeGame() {
    this.gameManager.updateGameState("isAnimating", true);

    this.time.delayedCall(1500, () => {
      this.dealCards();
      this.time.delayedCall(3000, () => {
        this.gameManager.updateGameState("cardsInteractable", true);
        this.gameManager.updateGameState("mustDiscard", false);
        this.updateTotalPoints();
        this.updateEndTurnButton();
      });
    });

    this.events.on("resume", this.handleResume.bind(this));
  }

  handleResume() {
    [this.player1Container, this.player2Container].forEach((container) => {
      container.each((card) => {
        card.setPosition(
          card.getData("originalPosition").x,
          card.getData("originalPosition").y
        );
        card.setDepth(card.getData("originalDepth"));
      });
    });
  }

  createSortButtons() {
    this.buttonManager.createSortButtons(
      this.totalPointsText.y - 40,
      this.player1Container.x,
      () => this.sortCardsByRank(),
      () => this.sortCardsBySuit(),
      this.gameManager.gameState.cardsInteractable,
      this.gameManager.gameState.knockButtonPressed
    );
  }

  sortCardsByRank() {
    const cards = this.player1Container.list;
    this.sortingManager.rearrangeCards(
      this.player1Container,
      this.sortingManager.sortCardsByRank(cards)
    );
  }

  sortCardsBySuit() {
    const cards = this.player1Container.list;
    this.sortingManager.rearrangeCards(
      this.player1Container,
      this.sortingManager.sortCardsBySuit(cards)
    );
  }

  createDeckContainer() {
    this.deckContainer = this.add.container(this.table.x - 80, this.table.y);
    this.deckContainer.setSize(160, 320);
  }

  createDiscardPileContainer() {
    this.discardPileContainer =
      this.discardPileManager.createDiscardPileContainer(
        this.table.x + 100,
        this.table.y
      );
  }

  createDeck() {
    const deckList = this.deckManager.createDeck(this.deckContainer);
    deckList.forEach((cardImage) => {
      cardImage.on("pointerdown", () => {
        const topCard = this.deckContainer.list.reduce(
          (highest, current) =>
            current.depth > highest.depth ? current : highest,
          this.deckContainer.list[0]
        );

        if (
          cardImage === topCard &&
          this.gameManager.gameState.cardsInteractable &&
          !this.gameManager.gameState.mustDiscard &&
          !this.gameManager.gameState.isAnimating
        ) {
          this.moveTopCardToPlayer1();
        }
      });
    });
  }

  dealCards() {
    this.gameFlowManager.dealCards(
      this.deckManager,
      this.gameManager,
      this.deckContainer,
      this.player1Container,
      this.player2Container,
      this.discardPileContainer,
      (card, xOffset) => this.setupPlayerCard(card, xOffset),
      (card, xOffset) => this.setupCard(card, xOffset),
      (card) => this.moveTopCardToDiscardPile(card),
      () => {
        this.gameManager.updateGameState("cardsInteractable", true);
        this.gameManager.updateGameState("mustDiscard", false);
        this.updateTotalPoints();
      }
    );
  }

  setupCard(card, xOffset) {
    card.setTexture("back_red");
    this.playerManager.setupCard(card, xOffset, this.player2Container);
  }

  setupPlayerCard(card, xOffset) {
    this.playerManager.setupPlayerCard(
      card,
      xOffset,
      this.player1Container,
      (card) => this.discardCard(card),
      (card) =>
        this.gameManager.gameState.cardsInteractable &&
        !this.gameManager.gameState.isAnimating &&
        this.player1Container.list.includes(card) &&
        this.gameManager.gameState.mustDiscard
    );
  }

  moveTopCardToDiscardPile(card) {
    this.discardPileManager.moveCardToDiscardPile(
      card,
      this.deckContainer,
      (card) => this.setupDiscardPileCard(card)
    );
  }

  setupDiscardPileCard(card) {
    this.discardPileManager.setupDiscardPileCard(
      card,
      () => this.moveTopCardFromDiscardPileToPlayer1(),
      (card, topCard) => card === topCard,
      () =>
        this.gameManager.gameState.cardsInteractable &&
        !this.gameManager.gameState.isAnimating &&
        !this.gameManager.gameState.mustDiscard
    );
  }

  moveTopCardToPlayer1() {
    this.gameFlowManager.moveTopCardToPlayer(
      this.deckManager,
      this.gameManager,
      this.deckContainer,
      this.player1Container,
      (card, xOffset) => this.setupPlayerCard(card, xOffset),
      () => {
        this.updateTotalPoints();
        this.updateEndTurnButton();
      }
    );
  }

  moveTopCardFromDiscardPileToPlayer1() {
    this.gameFlowManager.moveTopCardFromDiscardPileToPlayer(
      this.discardPileManager,
      this.gameManager,
      this.player1Container,
      (card, xOffset) => this.setupPlayerCard(card, xOffset),
      () => {
        this.updateTotalPoints();
        this.updateEndTurnButton();
      }
    );
  }

  discardCard(card) {
    this.gameFlowManager.discardCard(
      this.discardPileManager,
      this.gameManager,
      card,
      this.player1Container,
      (card) => this.setupDiscardPileCard(card),
      () => this.animatePlayer1Hand(),
      () => {
        this.updateTotalPoints();
        this.updateEndTurnButton();
      }
    );
  }

  animatePlayer1Hand() {
    this.playerManager.animatePlayerHand(this.player1Container);
  }

  updateTotalPoints() {
    const points = this.uiManager.updateTotalPoints(
      this.player1Container.list,
      (cards) => this.deckManager.calculatePoints(cards),
      this.totalPointsText
    );
    this.gameManager.setPlayerPoints(1, points);
  }

  updateTotalPointsPlayer2(showPoints = true) {
    const points = this.uiManager.updateTotalPoints(
      this.player2Container.list,
      (cards) => this.deckManager.calculatePoints(cards),
      this.totalPointsTextPlayer2
    );
    this.gameManager.setPlayerPoints(2, points);
    if (showPoints) this.totalPointsTextPlayer2.setVisible(true);
  }

  createKnockButton() {
    const { button } = this.buttonManager.createKnockButton(
      this.totalPointsText.x + 50,
      this.totalPointsText.y - 40,
      () => {
        this.gameManager.updateGameState("knockButtonPressed", true);
        this.gameManager.updateGameState("cardsInteractable", false);

        [
          this.player1Container,
          this.deckContainer,
          this.discardPileContainer,
        ].forEach((container) => {
          container.each((card) => {
            card.disableInteractive();
            card.removeAllListeners();
          });
        });

        if (this.endTurnButton) {
          this.endTurnButton.disableInteractive();
          this.endTurnButton.setVisible(false);
          this.endTurnButtonText.setVisible(false);
        }

        this.flipPlayer2Cards();
        this.createRestartButton();
      },
      this.gameManager.gameState.animationComplete,
      this.player1Container,
      this.gameManager.gameState.knockButtonPressed,
      this.gameManager.gameState.isPlayerTurn
    );

    this.knockButton = button;
  }

  createEndTurnButton() {
    const { button, buttonText } = this.buttonManager.createEndTurnButton(
      this.totalPointsText.x + 180,
      this.totalPointsText.y - 40,
      () => {
        this.gameManager.updateGameState("isPlayerTurn", false);
        this.gameManager.updateGameState("hasDrawnCard", false);
        this.gameManager.updateGameState("hasDiscardedCard", false);
        this.gameManager.updateGameState("mustDiscard", false);
        this.gameManager.updateGameState("cardsInteractable", false);

        this.endTurnButton.disableInteractive();
        this.endTurnButton.setAlpha(0.3);

        const turnText = this.add.text(
          this.player2Container.x + 50,
          this.player2Container.y - 100,
          "Player 2's Turn",
          { fontSize: "28px", fill: "#fff", fontStyle: "bold" }
        );
        turnText.setOrigin(0.5);
        turnText.setDepth(1000);

        this.time.delayedCall(1500, () => {
          this.tweens.add({
            targets: turnText,
            alpha: 0,
            duration: 500,
            onComplete: () => {
              turnText.destroy();
              this.executePlayer2Turn();
            },
          });
        });
      },
      this.gameManager.gameState.isPlayerTurn,
      this.gameManager.gameState.hasDrawnCard,
      this.player1Container
    );

    this.endTurnButton = button;
    this.endTurnButtonText = buttonText;
  }

  updateEndTurnButton() {
    if (this.gameManager.gameState.knockButtonPressed) {
      this.endTurnButton.disableInteractive();
      this.endTurnButton.setVisible(false);
      this.endTurnButtonText.setVisible(false);
      return;
    }

    if (
      this.gameManager.gameState.isPlayerTurn &&
      this.player1Container.list.length === 3
    ) {
      this.endTurnButton.setInteractive({ useHandCursor: true });
      this.endTurnButton.setAlpha(1);
      this.endTurnButton.setVisible(true);
      this.endTurnButtonText.setVisible(true);
    } else {
      this.endTurnButton.disableInteractive();
      this.endTurnButton.setAlpha(0.3);
      this.endTurnButton.setVisible(true);
      this.endTurnButtonText.setVisible(true);
    }
  }

  createRestartButton() {
    this.buttonManager.createRestartButton(
      this.totalPointsText.x + 200,
      this.totalPointsText.y - 40,
      () => this.restartGame()
    );
  }

  createRulesButton() {
    this.buttonManager.createRulesButton(this.cameras.main.width - 80, 50);
  }

  restartGame() {
    this.gameManager.restartGame(() => {
      this.scene.restart();
    });
  }

  flipPlayer2Cards() {
    this.playerManager.flipPlayerCards(this.player2Container, () => {
      this.updateTotalPointsPlayer2();
      this.checkWinner();
    });
  }

  checkWinner() {
    this.gameManager.checkWinner(
      this.deckContainer.x - 350,
      this.deckContainer.y
    );
  }

  executePlayer2Turn() {
    const { maxPoints, pointsBySuit, totalPointsText } =
      this.deckManager.calculatePoints(this.player2Container.list);

    this.time.delayedCall(1000, () => {
      const topDiscardCard =
        this.discardPileContainer.list.length > 0
          ? this.discardPileContainer.list[0]
          : null;

      let drawFromDiscard = false;

      if (topDiscardCard) {
        const discardCardValue = this.deckManager.getCardValue(topDiscardCard);
        const discardCardSuit = topDiscardCard.cardData.suit;
        const player2Cards = this.player2Container.list;
        const suitCounts = {};
        const suitTotals = {};

        player2Cards.forEach((card) => {
          const suit = card.cardData.suit;
          const value = this.deckManager.getCardValue(card);
          suitCounts[suit] = (suitCounts[suit] || 0) + 1;
          suitTotals[suit] = (suitTotals[suit] || 0) + value;
        });

        const strongestSuit = Object.keys(pointsBySuit).reduce(
          (a, b) => (pointsBySuit[a] > pointsBySuit[b] ? a : b),
          Object.keys(pointsBySuit)[0]
        );

        const strongestSuitName = this.getSuitNameFromSymbol(strongestSuit);

        if (
          (strongestSuitName && discardCardSuit === strongestSuitName) ||
          (discardCardValue >= 10 && suitCounts[discardCardSuit]) ||
          (discardCardValue === 11 && Math.random() > 0.2)
        ) {
          drawFromDiscard = true;
        }
      }

      if (drawFromDiscard && topDiscardCard) {
        this.moveTopCardFromDiscardPileToPlayer2();
      } else {
        this.moveTopCardToPlayer2();
      }

      this.time.delayedCall(1500, () => {
        const worstCard = this.findWorstCardConsideringSuits(
          this.player2Container.list
        );

        if (worstCard) {
          this.discardCardFromPlayer2(worstCard);

          const { maxPoints: newPoints } = this.deckManager.calculatePoints(
            this.player2Container.list
          );

          const estimatedPlayer1Points = this.deckManager.calculatePoints(
            this.player1Container.list
          ).maxPoints;

          const knockThreshold = 20 + Math.floor(Math.random() * 5);
          const pointDifference = newPoints - estimatedPlayer1Points;
          const hasGoodChanceToWin = pointDifference > 0;

          const shouldKnock =
            newPoints >= 31 ||
            newPoints >= 27 ||
            (newPoints >= knockThreshold && hasGoodChanceToWin) ||
            (newPoints >= 25 && Math.random() > 0.7);

          if (shouldKnock) {
            this.time.delayedCall(1000, () => {
              this.player2Knock();
            });
          } else {
            this.time.delayedCall(1000, () => {
              this.startPlayer1Turn();
            });
          }
        }
      });
    });
  }

  startPlayer1Turn() {
    const turnText = this.add.text(
      this.player1Container.x + 50,
      this.player1Container.y - 100,
      "Your Turn",
      { fontSize: "28px", fill: "#fff", fontStyle: "bold" }
    );
    turnText.setOrigin(0.5);
    turnText.setDepth(1000);

    this.gameManager.updateGameState("isPlayerTurn", true);
    this.gameManager.updateGameState("cardsInteractable", true);

    if (this.deckContainer) {
      this.deckContainer.list.forEach((card) => {
        const topCard = this.deckContainer.list.reduce(
          (highest, current) =>
            current.depth > highest.depth ? current : highest,
          this.deckContainer.list[0]
        );

        if (card === topCard) {
          card.setInteractive({ useHandCursor: true });
        }
      });
    }

    this.time.delayedCall(1500, () => {
      this.tweens.add({
        targets: turnText,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          turnText.destroy();
          this.updateEndTurnButton();
        },
      });
    });
  }

  getSuitNameFromSymbol(symbol) {
    const symbolMap = {
      "♥": "Hearts",
      "♦": "Diamonds",
      "♣": "Clubs",
      "♠": "Spades",
    };
    return symbolMap[symbol];
  }

  findWorstCardConsideringSuits(cards) {
    if (!cards || cards.length <= 3) return null;

    const suitCards = {};
    const suitPoints = {};

    cards.forEach((card) => {
      const suit = card.cardData.suit;
      const value = this.deckManager.getCardValue(card);

      if (!suitCards[suit]) suitCards[suit] = [];
      suitCards[suit].push({ card, value });
      suitPoints[suit] = (suitPoints[suit] || 0) + value;
    });

    let strongestSuit = null;
    let highestPoints = 0;
    for (const suit in suitPoints) {
      if (suitPoints[suit] > highestPoints) {
        highestPoints = suitPoints[suit];
        strongestSuit = suit;
      }
    }

    let worstCard = null;
    let lowestValue = Infinity;

    for (const suit in suitCards) {
      if (suit !== strongestSuit) {
        suitCards[suit].forEach(({ card, value }) => {
          if (value < lowestValue) {
            lowestValue = value;
            worstCard = card;
          }
        });
      }
    }

    if (!worstCard && strongestSuit) {
      suitCards[strongestSuit].sort((a, b) => a.value - b.value);
      if (suitCards[strongestSuit].length > 0) {
        worstCard = suitCards[strongestSuit][0].card;
      }
    }

    if (!worstCard) {
      cards.forEach((card) => {
        const value = this.deckManager.getCardValue(card);
        if (value < lowestValue) {
          lowestValue = value;
          worstCard = card;
        }
      });
    }

    return worstCard;
  }

  moveTopCardToPlayer2() {
    const drawingText = this.add.text(
      this.cameras.main.width / 2 + 50,
      this.cameras.main.height / 2 - 110,
      "Player 2 is drawing a card...",
      { fontSize: "24px", fill: "#fff" }
    );
    drawingText.setOrigin(0.5);
    drawingText.setDepth(1000);

    this.gameFlowManager.moveTopCardToPlayer(
      this.deckManager,
      this.gameManager,
      this.deckContainer,
      this.player2Container,
      (card, xOffset) => {
        card.setTexture("back_red");
        this.setupCard(card, xOffset);
      },
      () => {
        this.updateTotalPointsPlayer2(false);
        this.tweens.add({
          targets: drawingText,
          alpha: 0,
          duration: 300,
          onComplete: () => drawingText.destroy(),
        });
      }
    );
  }

  moveTopCardFromDiscardPileToPlayer2() {
    const drawingText = this.add.text(
      this.cameras.main.width / 2 + 50,
      this.cameras.main.height / 2 - 110,
      "Player 2 is taking the discard card...",
      { fontSize: "24px", fill: "#fff" }
    );
    drawingText.setOrigin(0.5);
    drawingText.setDepth(1000);

    this.gameFlowManager.moveTopCardFromDiscardPileToPlayer(
      this.discardPileManager,
      this.gameManager,
      this.player2Container,
      (card, xOffset) => {
        this.playerManager.setupCard(card, xOffset, this.player2Container);
        this.time.delayedCall(50, () => {
          this.tweens.add({
            targets: card,
            scaleX: 0,
            duration: 300,
            yoyo: true,
            onYoyo: () => {
              card.setTexture("back_red");
            },
          });
        });
      },
      () => {
        this.updateTotalPointsPlayer2(false);
        this.tweens.add({
          targets: drawingText,
          alpha: 0,
          duration: 300,
          onComplete: () => drawingText.destroy(),
        });
      }
    );
  }

  discardCardFromPlayer2(card) {
    const discardingText = this.add.text(
      this.cameras.main.width / 2 + 50,
      this.cameras.main.height / 2 - 110,
      "Player 2 is discarding a card...",
      { fontSize: "24px", fill: "#fff" }
    );
    discardingText.setOrigin(0.5);
    discardingText.setDepth(1000);

    this.tweens.add({
      targets: card,
      scaleX: 0,
      duration: 200,
      yoyo: true,
      onYoyo: () => {
        card.setTexture(
          `${card.cardData.rank}${card.cardData.suit.toLowerCase()}`
        );
      },
      onComplete: () => {
        this.gameFlowManager.discardCard(
          this.discardPileManager,
          this.gameManager,
          card,
          this.player2Container,
          (card) => this.setupDiscardPileCard(card),
          () => this.playerManager.animatePlayerHand(this.player2Container),
          () => {
            this.updateTotalPointsPlayer2(false);
            this.tweens.add({
              targets: discardingText,
              alpha: 0,
              duration: 300,
              onComplete: () => discardingText.destroy(),
            });
          }
        );
      },
    });
  }

  player2Knock() {
    this.gameManager.updateGameState("knockButtonPressed", true);
    this.gameManager.updateGameState("cardsInteractable", false);

    [
      this.player1Container,
      this.player2Container,
      this.deckContainer,
      this.discardPileContainer,
    ].forEach((container) => {
      container.each((card) => {
        card.disableInteractive();
        card.removeAllListeners();
      });
    });

    if (this.knockButton) {
      this.knockButton.disableInteractive();
    }

    if (this.endTurnButton) {
      this.endTurnButton.disableInteractive();
      this.endTurnButton.setVisible(false);
      this.endTurnButtonText.setVisible(false);
    }

    const knockText = this.add.text(
      this.cameras.main.width / 2 + 50,
      this.cameras.main.height / 2 - 110,
      "Player 2 Knocked!",
      { fontSize: "32px", fill: "#fff", fontStyle: "bold" }
    );
    knockText.setOrigin(0.5);
    knockText.setDepth(1000);

    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: knockText,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          knockText.destroy();
          this.flipPlayer2Cards();
          this.createRestartButton();
        },
      });
    });
  }
}
