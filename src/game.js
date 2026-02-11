window.addEventListener("load", () => {
  initialize();
  gameLoop();
});

let gameState;
let frame;

let comboCount = 0;
let zenkeshiStartFrame = 0;
let zenkeshiHidden = false;

function initialize() {

  GameImage.initialize();

  Stage.initialize();

  Player.initialize();

  gameState = "start";

  frame = 0;
}

function gameLoop() {
  switch (gameState) {
    case "start":
      gameState = "checkFallingPuyo";
      break;

    case "checkFallingPuyo":
      if (Stage.checkFallingPuyo()) {
        gameState = "fallingPuyo";
      } else {
        gameState = "checkPuyoErase";
      }
      break;

    case "fallingPuyo":
      if (!Stage.fallPuyo()) {
        gameState = "checkPuyoErase";
      }
      break;

    case 'checkPuyoErase':
      const eraseInfo = Stage.checkPuyoErase(frame);
      if (eraseInfo) {
        gameState = 'erasingPuyo';
        comboCount++;
      } else {
        if (Stage.puyoCount === 0 && comboCount > 0) {
          Stage.dimBackground();
          Stage.showZenkeshi();

          zenkeshiStartFrame = frame;
          zenkeshiHidden = false;
          gameState = 'zenkeshi';
          break;
        }
        comboCount = 0;
        gameState = 'createPlayerPuyo';
      }
      break;

    case 'erasingPuyo':
      if (!Stage.erasePuyo(frame)) {
        gameState = 'checkFallingPuyo';
      }
      break;

    case 'createPlayerPuyo':
      if (!Player.createPlayerPuyo()) {
        gameState = 'gameOver';
      } else {
        gameState = 'playing';
      }
      break;

    case 'playing':
      const nextAction = Player.update();
      gameState = nextAction;
      break;

    case 'fix':
      Player.fixPlayerPuyo();
      gameState = 'checkFallingPuyo';
      break;

    case 'zenkeshi': {
      const elapsed = frame - zenkeshiStartFrame;
      const fadeFrames = Math.ceil(Config.zenkeshiFadeDuration / (1000 / 60));

      if (!zenkeshiHidden && elapsed >= Config.zenkeshiHoldFrames) {
        Stage.hideZenkeshi();
        zenkeshiHidden = true;
      }

      if (elapsed >= Config.zenkeshiHoldFrames + fadeFrames) {
        comboCount = 0;
        zenkeshiHidden = false;
        Stage.undimBackground();
        gameState = 'checkFallingPuyo';
      }
      break;
    }
  }
  frame++;
  setTimeout(gameLoop, 1000 / 60);
}
