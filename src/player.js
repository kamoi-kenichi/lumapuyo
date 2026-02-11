class Player {
    static centerPuyoColor = 0;
    static rotatingPuyoColor = 0;
    static playerPuyoStatus = null;
    static centerPuyoElement = null;
    static rotatingPuyoElement = null;
    static groundFrame = 0;
    static keyStatus = null;

    static initialize() {
        Player.keyStatus = {
            right: false,
            left: false,
            up: false,
            down: false
        };
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    Player.keyStatus.left = true;
                    event.preventDefault();
                    return;
                case "ArrowUp":
                    Player.keyStatus.up = true;
                    event.preventDefault();
                    return;
                case "ArrowRight":
                    Player.keyStatus.right = true;
                    event.preventDefault();
                    return;
                case "ArrowDown":
                    Player.keyStatus.down = true;
                    event.preventDefault();
                    return;
            }
        });
        document.addEventListener('keyup', (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    Player.keyStatus.left = false;
                    event.preventDefault();
                    return;
                case "ArrowUp":
                    Player.keyStatus.up = false;
                    event.preventDefault();
                    return;
                case "ArrowRight":
                    Player.keyStatus.right = false;
                    event.preventDefault();
                    return;
                case "ArrowDown":
                    Player.keyStatus.down = false;
                    event.preventDefault();
                    return;
            }
        });
    }

    static createPlayerPuyo() {
        if (Stage.getPuyoInfo(2, 0)) {
            return false;
        }

        Player.centerPuyoColor = Math.trunc(Math.random() * Config.puyoColorMax) + 1;
        Player.rotatingPuyoColor = Math.trunc(Math.random() * Config.puyoColorMax) + 1;

        Player.centerPuyoElement = GameImage.getPuyoImage(Player.centerPuyoColor);
        Player.rotatingPuyoElement = GameImage.getPuyoImage(Player.rotatingPuyoColor);
        Stage.stageElement.appendChild(Player.centerPuyoElement);
        Stage.stageElement.appendChild(Player.rotatingPuyoElement);

        Player.playerPuyoStatus = {
            x: 2,
            y: -1,
            left: 2 * Config.puyoImageWidth,
            top: -1 * Config.puyoImageHeight,
            dx: 0,
            dy: -1,
            rotation: 90
        };

        Player.groundFrame = 0;
        Player.setPlayerPuyoPosition();
        return true;
    }
    static setPlayerPuyoPosition() {
        Player.centerPuyoElement.style.left = Player.playerPuyoStatus.left + 'px';
        Player.centerPuyoElement.style.top = Player.playerPuyoStatus.top + 'px';

        const x = Player.playerPuyoStatus.left + Math.cos(Player.playerPuyoStatus.rotation * Math.PI / 180) * Config.puyoImageWidth;
        const y = Player.playerPuyoStatus.top - Math.sin(Player.playerPuyoStatus.rotation * Math.PI / 180) * Config.puyoImageHeight;
        Player.rotatingPuyoElement.style.left = x + 'px';
        Player.rotatingPuyoElement.style.top = y + 'px';
    }

    static dropPlayerPuyo(isPressingDown) {
        let { x, y, dx, dy } = Player.playerPuyoStatus;

        if (!Stage.getPuyoInfo(x, y + 1) && !Stage.getPuyoInfo(x + dx, y + dy + 1)) {
            Player.playerPuyoStatus.top += Config.playerFallingSpeed;

            if (isPressingDown) {
                Player.playerPuyoStatus.top += Config.playerDownSpeed;
            }

            if (Math.floor(Player.playerPuyoStatus.top / Config.puyoImageHeight) != y) {
                y += 1;
                Player.playerPuyoStatus.y = y;
                if (!Stage.getPuyoInfo(x, y + 1) && !Stage.getPuyoInfo(x + dx, y + dy + 1)) {
                    Player.groundFrame = 0;
                    return false;
                }
            } else {
                Player.groundFrame = 0;
                return false;
            }
        } else {
            if (Player.groundFrame === 0) {
                Player.groundFrame = 1;
                return false;
            } else {
                Player.groundFrame++;
                if (Player.groundFrame > Config.playerLockDelayFrames) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }
    static update() {
        if (Player.dropPlayerPuyo(Player.keyStatus.down)) {
            return "fix";
        }
        Player.setPlayerPuyoPosition();
        return "playing";
    }
    static fixPlayerPuyo() {
        const { x, y, dx, dy } = Player.playerPuyoStatus;
        if (y >= 0) {
            Stage.createPuyo(x, y, Player.centerPuyoColor);
        }
        if (y + dy >= 0) {
            Stage.createPuyo(x + dx, y + dy, Player.rotatingPuyoColor);
        }
        Player.centerPuyoElement.remove();
        Player.centerPuyoElement = null;
        Player.rotatingPuyoElement.remove();
        Player.rotatingPuyoElement = null;
    }
}

