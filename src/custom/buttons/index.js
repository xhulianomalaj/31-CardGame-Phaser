/**
 * Buttons Module
 *
 * This module handles the creation and management of all buttons in the game.
 * It provides a centralized way to create consistent buttons with various styles and behaviors.
 */

export default class ButtonManager {
  /**
   * Create a new ButtonManager instance
   * @param {Phaser.Scene} scene - The scene that this button manager belongs to
   */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Create a standard button with text
   * @param {number} x - X position of the button
   * @param {number} y - Y position of the button
   * @param {string} text - Text to display on the button
   * @param {number} color - Color of the button (hexadecimal)
   * @param {string} textColor - Color of the text (CSS color string)
   * @param {number} width - Width of the button (default: 100)
   * @param {number} height - Height of the button (default: 40)
   * @param {number} fontSize - Font size for the button text (default: 18)
   * @returns {Object} - Object containing button and buttonText objects
   */
  createButton(
    x,
    y,
    text,
    color,
    textColor,
    width = 100,
    height = 40,
    fontSize = "18px"
  ) {
    const buttonRadius = 10;
    const textureKey = `button_${text.toLowerCase()}_${Date.now()}_${Math.floor(
      Math.random() * 1000
    )}`;

    const graphics = this.scene.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(0, 0, width, height, buttonRadius);
    graphics.generateTexture(textureKey, width, height);
    graphics.destroy();

    const button = this.scene.add
      .image(x, y, textureKey)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });

    const buttonText = this.scene.add
      .text(x, y, text, {
        fontSize: fontSize,
        fill: textColor,
      })
      .setOrigin(0.5, 0.5);

    return { button, buttonText };
  }

  /**
   * Create a sort button with specific styling
   * @param {number} x - X position of the button
   * @param {number} y - Y position of the button
   * @param {string} text - Text to display on the button
   * @param {number} color - Color of the button (hexadecimal)
   * @param {string} textColor - Color of the text (CSS color string)
   * @param {number} width - Width of the button
   * @returns {Object} - Object containing button and buttonText objects
   */
  createSortButton(x, y, text, color, textColor, width) {
    const { button, buttonText } = this.createButton(
      x,
      y,
      text,
      color,
      textColor,
      width
    );
    buttonText.setFontSize("16px");
    return { button, buttonText };
  }

  /**
   * Create the rank and suit sort buttons
   * @param {number} buttonY - Y position for the buttons
   * @param {number} containerX - X position of the player container (for positioning)
   * @param {Function} onRankSort - Callback function for rank sorting
   * @param {Function} onSuitSort - Callback function for suit sorting
   * @param {boolean} cardsInteractable - Whether cards are currently interactable
   * @param {boolean} knockButtonPressed - Whether the knock button has been pressed
   * @returns {Object} - Object containing both buttons and their text elements
   */
  createSortButtons(
    buttonY,
    containerX,
    onRankSort,
    onSuitSort,
    cardsInteractable,
    knockButtonPressed
  ) {
    const { button: rankButton, buttonText: rankText } = this.createSortButton(
      containerX - 320,
      buttonY,
      "Sort by Rank",
      0xff9800,
      "#000",
      120
    );

    const { button: suitButton, buttonText: suitText } = this.createSortButton(
      containerX - 180,
      buttonY,
      "Sort by Suit",
      0x2196f3,
      "#000",
      120
    );

    const scene = this.scene;

    rankButton.on("pointerdown", () => {
      if (
        scene.gameManager.gameState.cardsInteractable &&
        !scene.gameManager.gameState.knockButtonPressed
      ) {
        onRankSort();
      }
    });

    suitButton.on("pointerdown", () => {
      if (
        scene.gameManager.gameState.cardsInteractable &&
        !scene.gameManager.gameState.knockButtonPressed
      ) {
        onSuitSort();
      }
    });

    return { rankButton, rankText, suitButton, suitText };
  }

  /**
   * Create the knock button
   * @param {number} x - X position of the button
   * @param {number} y - Y position of the button
   * @param {Function} onKnock - Callback function when knock button is pressed
   * @param {boolean} animationComplete - Whether the initial animation is complete
   * @param {Object} player1Container - The player 1 container
   * @param {boolean} knockButtonPressed - Whether the knock button has been pressed
   * @param {boolean} isPlayerTurn - Whether it's the player's turn
   * @returns {Object} - Object containing button and buttonText objects
   */
  createKnockButton(
    x,
    y,
    onKnock,
    animationComplete,
    player1Container,
    knockButtonPressed,
    isPlayerTurn
  ) {
    const { button, buttonText } = this.createButton(
      x,
      y,
      "Knock",
      0xff0000,
      "#fff"
    );

    button.on("pointerdown", () => {
      if (
        !this.scene.gameManager.gameState.animationComplete ||
        player1Container.list.length > 3 ||
        this.scene.gameManager.gameState.knockButtonPressed ||
        !isPlayerTurn
      )
        return;

      onKnock();
    });

    return { button, buttonText };
  }

  /**
   * Create the restart button
   * @param {number} x - X position of the button
   * @param {number} y - Y position of the button
   * @param {Function} onRestart - Callback function when restart button is pressed
   * @returns {Object} - Object containing button and buttonText objects
   */
  createRestartButton(x, y, onRestart) {
    const { button, buttonText } = this.createButton(
      x,
      y,
      "Restart",
      0xffffff,
      "#000"
    );

    button.on("pointerdown", onRestart);
    return { button, buttonText };
  }

  /**
   * Create the end turn button
   * @param {number} x - X position of the button
   * @param {number} y - Y position of the button
   * @param {Function} onEndTurn - Callback function when end turn button is pressed
   * @param {boolean} isPlayerTurn - Whether it's the player's turn
   * @param {boolean} hasDrawnCard - Whether the player has drawn a card
   * @param {Phaser.GameObjects.Container} playerContainer - The player's card container
   * @returns {Object} - Object containing button and buttonText objects
   */
  createEndTurnButton(
    x,
    y,
    onEndTurn,
    isPlayerTurn,
    hasDrawnCard,
    playerContainer
  ) {
    const button = this.scene.add
      .rectangle(x, y, 120, 40, 0x4a752c)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5);

    const buttonText = this.scene.add
      .text(x, y, "End Turn", {
        fontSize: "18px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    button.on("pointerdown", () => {
      if (isPlayerTurn && playerContainer.list.length === 3) {
        onEndTurn();
      }
    });

    return { button, buttonText };
  }

  /**
   * Create the rules button
   * @param {number} x - X position of the button
   * @param {number} y - Y position of the button
   * @returns {Object} - Object containing the rules button
   */
  createRulesButton(x, y) {
    const { button: rulesButton } = this.createButton(
      x,
      y,
      "Rules",
      0x808080,
      "#fff",
      140,
      50
    );

    rulesButton.on("pointerdown", () => this.createRulesPopup());
    return { rulesButton };
  }

  /**
   * Create a close button for popups
   * @param {number} x - X position of the button
   * @param {number} y - Y position of the button
   * @param {Function} onClose - Callback function when close button is pressed
   * @returns {Object} - Object containing closeButtonBg and closeButton objects
   */
  createCloseButton(x, y, onClose) {
    const closeButtonBg = this.scene.add.circle(x, y, 15, 0xff0000);
    const closeButton = this.scene.add
      .text(x, y, "X", {
        fontSize: "18px",
        fill: "#fff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    closeButtonBg.setInteractive({ useHandCursor: true });
    closeButtonBg.on("pointerdown", onClose);

    return { closeButtonBg, closeButton };
  }

  /**
   * Create and display a rules popup with scrollable content
   * This method handles the entire rules popup creation, display, and cleanup
   */
  createRulesPopup() {
    const scene = this.scene;
    const overlay = scene.add
      .rectangle(
        0,
        0,
        scene.cameras.main.width,
        scene.cameras.main.height,
        0x000000,
        0.7
      )
      .setOrigin(0)
      .setDepth(1000);

    // Create main popup container
    const popupX = scene.cameras.main.width / 2;
    const popupY = scene.cameras.main.height / 2;

    // Create popup background
    const background = scene.add
      .rectangle(popupX, popupY, 550, 450, 0xffffff)
      .setOrigin(0.5)
      .setStrokeStyle(4, 0x000000)
      .setDepth(1001);

    // Create title
    const title = scene.add
      .text(popupX, popupY - 210, "Thirty-One Rules", {
        fontSize: "28px",
        fill: "#000",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(1002);

    const underline = scene.add
      .rectangle(popupX, popupY - 190, title.width, 2, 0x000000)
      .setOrigin(0.5)
      .setDepth(1002);

    // Create mask for content
    const maskX = popupX - 250;
    const maskY = popupY - 190;
    const maskWidth = 500;
    const maskHeight = 380;

    const contentMask = scene.add.graphics().setDepth(1002);
    contentMask.fillStyle(0xffffff);
    contentMask.fillRect(maskX, maskY, maskWidth, maskHeight);

    // Create content container
    const contentContainer = scene.add.container(maskX, maskY).setDepth(1002);

    // Create scrollable content
    this.createRulesContent(contentContainer);

    // Apply mask to content container
    const geometryMask = new Phaser.Display.Masks.GeometryMask(
      scene,
      contentMask
    );
    contentContainer.setMask(geometryMask);

    // Add scroll instruction text
    const scrollInstructions = scene.add
      .text(popupX, popupY + 200, "Use mouse wheel to scroll", {
        fontSize: "14px",
        fill: "#000",
        fontStyle: "italic",
      })
      .setOrigin(0.5)
      .setDepth(1002);

    // Create close button
    const { closeButtonBg, closeButton } = this.createCloseButton(
      popupX + 255,
      popupY - 210,
      () => {
        // Clean up all elements
        contentContainer.destroy();
        contentMask.destroy();
        background.destroy();
        title.destroy();
        underline.destroy();
        scrollInstructions.destroy();
        closeButtonBg.destroy();
        closeButton.destroy();
        overlay.destroy();
        scene.input.off("wheel");
      }
    );

    // Set up mouse wheel scrolling
    let contentHeight = 0;
    contentContainer.each((child) => {
      const bottom = child.y + (child.height || 0);
      contentHeight = Math.max(contentHeight, bottom);
    });

    scene.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
      // Only handle scrolling when pointer is over the popup
      const bounds = background.getBounds();
      if (
        pointer.x >= bounds.left &&
        pointer.x <= bounds.right &&
        pointer.y >= bounds.top &&
        pointer.y <= bounds.bottom
      ) {
        // Calculate boundaries
        const scrollRange = contentHeight - maskHeight;
        if (scrollRange <= 0) return; // No need to scroll if content fits

        // Get current position
        const currentY = contentContainer.y;

        // Calculate new position based on wheel delta
        const newY = Phaser.Math.Clamp(
          currentY - deltaY,
          maskY - scrollRange, // Bottom limit
          maskY // Top limit
        );

        // Update container position
        contentContainer.y = newY;
      }
    });

    // Handle clicking outside to close
    overlay.setInteractive();
    overlay.on("pointerdown", (pointer) => {
      const bounds = background.getBounds();
      if (
        pointer.x < bounds.left ||
        pointer.x > bounds.right ||
        pointer.y < bounds.top ||
        pointer.y > bounds.bottom
      ) {
        closeButtonBg.emit("pointerdown");
      }
    });
  }

  createRulesContent(container) {
    const sections = [
      {
        title: "Objective:",
        text: "Get 31 total points in one suit or get more total points (in one suit) than your\nopponent when someone knocks.",
      },
      {
        title: "How to Play:",
        text: "1. Each player gets 3 cards\n2. On your turn:\n   • Draw a card from deck or discard pile\n   • Discard one card\n3. You can't knock if you have 4 cards in hand\n   (you must discard first)",
      },
      {
        title: "Card Values:",
        isTable: true,
        rows: [
          { type: "Ace (A)", points: "11 points" },
          { type: "Face Cards (J, Q, K)", points: "10 points" },
          { type: "Number Cards (2-10)", points: "Face value" },
        ],
      },
      {
        title: "Controls:",
        text: "• Left-click to draw/discard cards\n• Use Sort buttons to organize your hand\n• Click Knock when ready to end the round (only with 3 cards)",
      },
    ];

    let yPosition = 20;
    const leftMargin = 20;

    sections.forEach((section) => {
      // Add section title
      const title = this.scene.add.text(leftMargin, yPosition, section.title, {
        fontSize: "20px",
        fill: "#000",
        fontStyle: "bold",
      });
      container.add(title);

      yPosition += 30;

      // Add section content
      if (section.isTable) {
        yPosition = this.createRulesTable(
          container,
          leftMargin,
          yPosition,
          section.rows
        );
      } else {
        const text = this.scene.add.text(leftMargin, yPosition, section.text, {
          fontSize: "16px",
          fill: "#000",
          lineSpacing: section.title === "How to Play:" ? 8 : 5,
          wordWrap: { width: 460 },
        });
        container.add(text);
        yPosition += text.height + 20;
      }
    });
  }

  createRulesTable(container, leftMargin, yPosition, rows) {
    // Create table background
    const tableBackground = this.scene.add
      .rectangle(240, yPosition + 55, 480, 120, 0xf0f0f0)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x000000);
    container.add(tableBackground);

    // Create header background
    const headerBackground = this.scene.add
      .rectangle(240, yPosition + 10, 480, 25, 0xdddddd)
      .setOrigin(0.5);
    container.add(headerBackground);

    // Add headers
    const headers = [
      { text: "Card Type", x: leftMargin + 20 },
      { text: "Points", x: leftMargin + 300 },
    ];

    headers.forEach(({ text, x }) => {
      const header = this.scene.add
        .text(x, yPosition + 10, text, {
          fontSize: "16px",
          fill: "#000",
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5);
      container.add(header);
    });

    // Add rows
    rows.forEach((row, index) => {
      const y = yPosition + 40 + index * 30;

      const typeText = this.scene.add
        .text(leftMargin + 20, y, row.type, {
          fontSize: "16px",
          fill: "#000",
        })
        .setOrigin(0, 0.5);

      const pointsText = this.scene.add
        .text(leftMargin + 300, y, row.points, {
          fontSize: "16px",
          fill: "#000",
        })
        .setOrigin(0, 0.5);

      container.add([typeText, pointsText]);
    });

    return yPosition + 140; // Return new Y position
  }
}
