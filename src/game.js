window.addEventListener("load", () => {
  initialize();
  startLoop();
});

let gameState;
let frame;
let lastTimeMs = 0;

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

function startLoop() {
  lastTimeMs = performance.now();
  requestAnimationFrame(loop);
}

function loop(nowMs) {
  let deltaMs = nowMs - lastTimeMs;
  lastTimeMs = nowMs;

  if (deltaMs > 50) deltaMs = 50;

  const dtSec = deltaMs / 1000;

  frame += dtSec * 60;

  const frameInt = Math.floor(frame);

  gameStep(frameInt, dtSec);

  requestAnimationFrame(loop);
}

function gameStep(frameInt, dtSec) {
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
      if (!Stage.fallPuyo(dtSec)) {
        gameState = "checkPuyoErase";
      }
      break;

    case "checkPuyoErase": {
      const eraseInfo = Stage.checkPuyoErase(frameInt);
      if (eraseInfo) {
        gameState = "erasingPuyo";
        comboCount++;
      } else {
        if (Stage.puyoCount === 0 && comboCount > 0) {
          Stage.dimBackground();
          Stage.showZenkeshi();
          zenkeshiStartFrame = frameInt;
          zenkeshiHidden = false;
          gameState = "zenkeshi";
          break;
        }
        comboCount = 0;
        gameState = "createPlayerPuyo";
      }
      break;
    }

    case "erasingPuyo":
      if (!Stage.erasePuyo(frameInt)) {
        gameState = "checkFallingPuyo";
      }
      break;

    case "createPlayerPuyo":
      if (!Player.createPlayerPuyo()) {
        gameState = "gameOver";
      } else {
        gameState = "playing";
      }
      break;

    case "playing": {
      const nextAction = Player.update(dtSec);
      gameState = nextAction;
      break;
    }

    case "fix":
      Player.fixPlayerPuyo();
      gameState = "checkFallingPuyo";
      break;

    case "zenkeshi": {
      const elapsed = frameInt - zenkeshiStartFrame;
      const fadeFrames = Math.ceil(Config.zenkeshiFadeDuration / (1000 / 60));

      if (!zenkeshiHidden && elapsed >= Config.zenkeshiHoldFrames) {
        Stage.hideZenkeshi();
        zenkeshiHidden = true;
      }

      if (elapsed >= Config.zenkeshiHoldFrames + fadeFrames) {
        comboCount = 0;
        zenkeshiHidden = false;
        Stage.undimBackground();
        gameState = "checkFallingPuyo";
      }
      break;
    }
  }
}