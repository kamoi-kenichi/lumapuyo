window.addEventListener("load", () => {
  initialize();
  startLoop();
});

window.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });

let gameState;
let frame;
let lastTimeMs = 0;
let comboCount = 0;
let zenkeshiStartFrame = 0;
let zenkeshiHidden = false;
let score = 0;
let stageKeyHandlerAttached = false;
let pendingFloat = null;

function initialize() {
  GameImage.initialize();
  Stage.initialize();
  Player.initialize();

  if (!stageKeyHandlerAttached) {
    Stage.stageElement.addEventListener("keydown", (e) => {
      const block = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];
      if (block.includes(e.key)) e.preventDefault();
    }, { passive: false });

    stageKeyHandlerAttached = true;
  }

  Stage.stageElement.focus();

  score = 0;
  GameImage.setScore(score);

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

function chainBonus(chain) {
  if (chain <= 1) return 0;
  const table = [0, 0, 8, 16, 32, 64, 96, 128, 160, 192];
  if (chain <= 10) return table[chain - 1];
  return 192 + (chain - 10) * 32;
}

function colorBonus(colors) {
  const table = { 1: 0, 2: 3, 3: 6, 4: 12, 5: 24 };
  return table[colors] ?? 0;
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

        const chain = comboCount;
        let bonus = chainBonus(chain) + eraseInfo.connectBonus + colorBonus(eraseInfo.color);
        if (bonus === 0) bonus = 1;

        const add = 10 * eraseInfo.piece * bonus;
        score += add;
        GameImage.setScore(score);

        if (eraseInfo.centerX != null && eraseInfo.centerY != null) {
          pendingFloat = { text: `+${add}`, x: eraseInfo.centerX, y: eraseInfo.centerY };
        }

      } else {
        if (Stage.puyoCount === 0 && comboCount > 0) {

          GameImage.spawnScoreFloat("+3600",
            (Config.stageCols * Config.puyoImageWidth) / 2,
            Config.puyoImageHeight * 2
          );

          score += 3600;
          GameImage.setScore(score);

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
        if (pendingFloat) {
          GameImage.spawnScoreFloat(pendingFloat.text, pendingFloat.x, pendingFloat.y);
          pendingFloat = null;
        }
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

    case 'moving':
      if (Player.movePlayerPuyo(dtSec)) {
        gameState = 'playing';
      }
      break;

    case 'rotating':
      if (Player.rotatePlayerPuyo(dtSec)) {
        gameState = 'playing';
      }
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

    case "gameOver":
      Stage.undimBackground();
      GameImage.prepareGameOverEffects();
      gameState = "gameOverFade";
      break;

    case "gameOverFade":
      if (GameImage.updateGameOverFade()) {
        GameImage.prepareBatankyu();
        gameState = "batankyuIntro";
      }
      break;

    case "batankyuIntro":
      if (GameImage.updateBatankyuIntro()) {
        GameImage.phaseStartFrame = frame;
        gameState = "batankyuShake";
      }
      break;

    case "batankyuShake":
      if (GameImage.updateBatankyuShake()) {
        GameImage.showRetryPrompt();
        gameState = "retryPrompt";
      }
      break;

    case "retryPrompt":
      GameImage.updateRetryPromptBlink();
      if (Player.isRetryPressed()) {
        initialize();
      }
      break;
  }
}

