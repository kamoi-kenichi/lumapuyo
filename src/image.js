class GameImage {
    static puyoImageList = null;
    static batankyuImage = null;
    static gameOverFrame = 0;

    static initialize() {

        GameImage.puyoImageList = [];
        for (let i = 0; i < Config.puyoColorMax; i++) {
            const image = document.getElementById("puyo_" + (i + 1));
            image.removeAttribute('id');
            image.width = Config.puyoImageWidth;
            image.height = Config.puyoImageHeight;
            image.style.position = 'absolute';
            GameImage.puyoImageList[i] = image;
        }
        GameImage.batankyuImage = document.getElementById("batankyu");
        GameImage.batankyuImage.width = Config.puyoImageWidth * Config.stageCols;
        GameImage.batankyuImage.style.position = 'absolute';
    }

    static getPuyoImage(color) {
        const image = GameImage.puyoImageList[color - 1].cloneNode(true);
        return image;
    }

    static prepareBatankyuAnimation() {
        GameImage.gameOverFrame = frame;
        Stage.stageElement.appendChild(GameImage.batankyuImage);
        GameImage.updateBatankyu();
    }

    static updateBatankyu() {
        const ratio = (frame - GameImage.gameOverFrame) / Config.batankyuAnimationFrames;
        const height = Config.puyoImageHeight * Config.stageRows;
        const stageW = Config.puyoImageWidth * Config.stageCols;
        const imgW = stageW; 
        const centerX = (stageW - imgW) / 2; 
        const x = centerX + Math.sin(ratio * Math.PI * 2 * 5) * Config.puyoImageWidth;
        const y = -Math.cos(ratio * Math.PI * 2) * height / 4 + height / 2;
        GameImage.batankyuImage.style.left = x + 'px';
        GameImage.batankyuImage.style.top = y + 'px';
    }
}