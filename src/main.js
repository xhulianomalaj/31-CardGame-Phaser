import Preload from "./custom/scenes/Preload.js";
import GameOrchestrator from "./custom/scenes/GameOrchestrator.js";
import StartScreen from "./custom/scenes/StartScreen.js";
import ButtonManager from "./custom/buttons/index.js";
import DeckManager from "./custom/deck/index.js";
import DiscardPileManager from "./custom/discardpile/index.js";
import PlayerManager from "./custom/player/index.js";
import UIManager from "./custom/ui/index.js";
import GameManager from "./custom/game/index.js";
import CardSortingManager from "./custom/sorting/index.js";
import GameFlowManager from "./custom/gameflow/index.js";

// Make all managers available globally
window.ButtonManager = ButtonManager;
window.DeckManager = DeckManager;
window.DiscardPileManager = DiscardPileManager;
window.PlayerManager = PlayerManager;
window.UIManager = UIManager;
window.GameManager = GameManager;
window.CardSortingManager = CardSortingManager;
window.GameFlowManager = GameFlowManager;

window.addEventListener("load", function () {
  const game = new Phaser.Game({
    width: window.innerWidth,
    height: window.innerHeight,
    type: Phaser.AUTO,
    backgroundColor: "#242424",
    scale: {
      mode: Phaser.Scale.FIT,
    },
    scene: [Preload, GameOrchestrator, StartScreen],
  });
});
