class GameImage {
    static puyoImageList = null;
    static batankyuImage = null;
    static gameOverFrame = 0;
    static overlayEl = null;
    static promptEl = null;
    static gameOverStartFrame = 0;
    static phaseStartFrame = 0;
    static scoreEl = null;
    static scoreDigits = [];
    static scoreValue = 0;

    static initialize() {

        if (GameImage.puyoImageList && GameImage.puyoImageList.length) return;

        GameImage.puyoImageList = [];
        for (let i = 0; i < Config.puyoColorMax; i++) {
            const image = document.getElementById("puyo_" + (i + 1));
            image.removeAttribute("id");
            image.width = Config.puyoImageWidth;
            image.height = Config.puyoImageHeight;
            image.style.position = "absolute";
            GameImage.puyoImageList[i] = image;
        }

        GameImage.batankyuImage = document.getElementById("batankyu");
        GameImage.batankyuImage.width = Config.puyoImageWidth * Config.stageCols;
        GameImage.batankyuImage.style.position = "absolute";
        GameImage.batankyuImage.style.zIndex = "105";
    }

    static getPuyoImage(color) {
        const image = GameImage.puyoImageList[color - 1].cloneNode(true);
        image.classList.add("puyo");
        return image;
    }

    static prepareBatankyu() {
        GameImage.phaseStartFrame = frame;

        if (GameImage.batankyuImage.parentNode !== Stage.stageElement) {
            Stage.stageElement.appendChild(GameImage.batankyuImage);
        }

        GameImage.batankyuImage.style.zIndex = "105";
    }

    static updateBatankyuIntro() {
        const t = (frame - GameImage.phaseStartFrame) / Config.batankyuIntroFrames;
        const ratio = Math.min(1, Math.max(0, t));

        const height = Config.puyoImageHeight * Config.stageRows;
        const stageW = Config.puyoImageWidth * Config.stageCols;
        const imgW = Config.puyoImageWidth * Config.stageCols;
        const centerX = (stageW - imgW) / 2;

        const x = centerX;

        const startY = -Config.puyoImageHeight * 3;
        const endY = height / 2;

        const ease = 1 - Math.pow(1 - ratio, 3);
        const y = startY + (endY - startY) * ease;

        GameImage.batankyuImage.style.left = x + "px";
        GameImage.batankyuImage.style.top = y + "px";

        return ratio === 1;
    }

    static updateBatankyuShake() {
        const t = (frame - GameImage.phaseStartFrame) / Config.batankyuShakeFrames;
        const ratio = Math.min(1, Math.max(0, t));

        const height = Config.puyoImageHeight * Config.stageRows;
        const stageW = Config.puyoImageWidth * Config.stageCols;
        const imgW = Config.puyoImageWidth * Config.stageCols;
        const centerX = (stageW - imgW) / 2;

        const amp = (1 - ratio) * Config.puyoImageWidth;
        const x = centerX + Math.sin(ratio * Math.PI * 2 * 6) * amp;

        const yBase = height / 2;
        const y = yBase + Math.sin(ratio * Math.PI * 2 * 2) * (amp * 0.25);

        GameImage.batankyuImage.style.left = x + "px";
        GameImage.batankyuImage.style.top = y + "px";

        return ratio === 1;
    }

    static prepareGameOverEffects() {
        GameImage.gameOverStartFrame = frame;
        GameImage.phaseStartFrame = frame;

        if (!GameImage.overlayEl) {
            const el = document.createElement("div");
            el.className = "overlay";
            Stage.stageElement.appendChild(el);
            GameImage.overlayEl = el;
        }
        GameImage.overlayEl.style.opacity = "0";

        if (!GameImage.promptEl) {
            const el = document.createElement("div");
            el.className = "prompt";
            el.textContent = "Press R to Retry";
            Stage.stageElement.appendChild(el);
            GameImage.promptEl = el;
        }
        GameImage.promptEl.style.opacity = "0";
    }


    static updateGameOverFade() {
        const t = (frame - GameImage.phaseStartFrame) / Config.gameOverFadeFrames;
        const ratio = Math.min(1, Math.max(0, t));
        GameImage.overlayEl.style.opacity = String(ratio);
        return ratio === 1;
    }

    static showRetryPrompt() {
        GameImage.phaseStartFrame = frame;
        GameImage.promptEl.style.opacity = "1";
    }

    static updateRetryPromptBlink() {
        const a = 0.85 + 0.15 * Math.sin((frame - GameImage.phaseStartFrame) * 0.2);
        GameImage.promptEl.style.opacity = String(a);
    }

    static prepareScoreUI() {
        if (GameImage.scoreEl) return;

        const host = document.getElementById("score");
        host.innerHTML = "";

        const el = document.createElement("div");
        el.className = "score";
        host.appendChild(el);

        GameImage.scoreEl = el;
        GameImage.scoreDigits = [];

        for (let i = 0; i < 8; i++) {
            const img = document.createElement("img");
            img.className = "scoreDigit";
            img.src = "img/0.png";
            el.appendChild(img);
            GameImage.scoreDigits.push(img);
        }
    }

    static popScore() {
        if (!GameImage.scoreEl) return;

        GameImage.scoreEl.classList.remove("pop");
        void GameImage.scoreEl.offsetWidth;
        GameImage.scoreEl.classList.add("pop");
    }

    static setScore(v) {
        const next = Math.max(0, Math.floor(v));
        const changed = next !== GameImage.scoreValue;

        GameImage.scoreValue = next;
        GameImage.prepareScoreUI();

        const s = String(GameImage.scoreValue).padStart(8, "0").slice(-8);
        for (let i = 0; i < 8; i++) {
            GameImage.scoreDigits[i].src = `img/${s[i]}.png`;
        }

        if (changed) GameImage.popScore();
    }

    static spawnScoreFloat(text, x, y) {
        const el = document.createElement("div");
        el.className = "scoreFloat";
        el.textContent = text;

        const jitterX = (Math.random() * 20 - 10);
        const stageW = Config.stageCols * Config.puyoImageWidth;

        const clampedX = Math.min(stageW - 16, Math.max(16, x + jitterX));

        el.style.left = `${clampedX}px`;
        el.style.top = `${y}px`;

        Stage.stageElement.appendChild(el);
        el.addEventListener("animationend", () => el.remove(), { once: true });
    }
}