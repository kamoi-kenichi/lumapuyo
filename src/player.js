class Player {
    static centerPuyoColor = 0;
    static rotatingPuyoColor = 0;
    static playerPuyoStatus = null;
    static centerPuyoElement = null;
    static rotatingPuyoElement = null;
    static groundFrame = 0;
    static keyStatus = null;
    static actionStartFrame = 0;
    static moveSource = 0;
    static moveDestination = 0;
    static rotateBeforeLeft = 0;
    static rotateAfterLeft = 0;
    static rotateFromRotation = 0;

    static initialize() {
        Player.keyStatus = {
            right: false,
            left: false,
            up: false,
            down: false
        };
        document.addEventListener('keydown', (event) => {
            if (event.repeat) return;
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

    static dropPlayerPuyo(isPressingDown, dtSec) {
        const cellH = Config.puyoImageHeight;

        let { x, y, dx, dy } = Player.playerPuyoStatus;

        const isBlockedBelow = () =>
            Stage.getPuyoInfo(x, y + 1) || Stage.getPuyoInfo(x + dx, y + dy + 1);

        if (isBlockedBelow()) {
            if (Player.groundFrame === 0) {
                Player.groundFrame = 1;
                return false;
            }
            Player.groundFrame++;
            return Player.groundFrame > Config.playerLockDelayFrames;
        }

        let fall = Config.playerFallingSpeed * dtSec;
        if (isPressingDown) fall += Config.playerDownSpeed * dtSec;

        Player.playerPuyoStatus.top += fall;

        const targetY = Math.floor(Player.playerPuyoStatus.top / cellH);

        while (y < targetY) {

            if (Stage.getPuyoInfo(x, y + 1) || Stage.getPuyoInfo(x + dx, y + dy + 1)) {

                Player.playerPuyoStatus.top = y * cellH;
                Player.playerPuyoStatus.y = y;

                if (Player.groundFrame === 0) Player.groundFrame = 1;
                else Player.groundFrame++;

                return Player.groundFrame > Config.playerLockDelayFrames;
            }

            y += 1;
            Player.playerPuyoStatus.y = y;

            Player.groundFrame = 0;
        }

        Player.groundFrame = 0;
        return false;
    }

    static update(dtSec) {
        if (Player.dropPlayerPuyo(Player.keyStatus.down, dtSec)) {
            return "fix";
        }
        Player.setPlayerPuyoPosition();
        if (Player.keyStatus.right || Player.keyStatus.left) {
            const mx = (Player.keyStatus.right) ? 1 : -1;

            const cx = Player.playerPuyoStatus.x;   // ★ここ
            const cy = Player.playerPuyoStatus.y;   // ★ここ
            const rx = cx + Player.playerPuyoStatus.dx;
            const ry = cy + Player.playerPuyoStatus.dy;

            let canMove = true;

            if (Stage.getPuyoInfo(cx + mx, cy)) canMove = false;
            if (Stage.getPuyoInfo(rx + mx, ry)) canMove = false;

            if (Player.groundFrame === 0) {
                if (Stage.getPuyoInfo(cx + mx, cy + 1)) canMove = false;
                if (Stage.getPuyoInfo(rx + mx, ry + 1)) canMove = false;
            }

            if (canMove) {
                Player.actionStartFrame = frame;

                Player.playerPuyoStatus.left = Player.playerPuyoStatus.x * Config.puyoImageWidth;
                Player.playerPuyoStatus.top = Player.playerPuyoStatus.y * Config.puyoImageHeight;

                Player.moveSource = cx * Config.puyoImageWidth;
                Player.moveDestination = (cx + mx) * Config.puyoImageWidth;
                Player.playerPuyoStatus.x += mx;

                Player.groundFrame = 0;

                return 'moving';
            }
        } else if (Player.keyStatus.up) {

            const x = Player.playerPuyoStatus.x;
            const y = Player.playerPuyoStatus.y;

            const currentRotation = Player.playerPuyoStatus.rotation;
            const nextRotation = (currentRotation + 90) % 360;

            const dTable = [[1, 0], [0, -1], [-1, 0], [0, 1]];
            const [ndx, ndy] = dTable[nextRotation / 90];

            const kickTable = [
                [0, 0],
                [1, 0],
                [-1, 0],
                [0, -1],
                [1, -1],
                [-1, -1],
            ];


            let canRotate = false;
            let kickX = 0;
            let kickY = 0;

            for (const [kx, ky] of kickTable) {

                const newX = x + kx;
                const newY = y + ky;

                const centerBlocked = Stage.getPuyoInfo(newX, newY);
                const rotateBlocked = Stage.getPuyoInfo(newX + ndx, newY + ndy);

                if (!centerBlocked && !rotateBlocked) {
                    canRotate = true;
                    kickX = kx;
                    kickY = ky;
                    break;
                }
            }

            if (canRotate) {

                Player.keyStatus.up = false;

                Player.actionStartFrame = frame;

                Player.playerPuyoStatus.left = Player.playerPuyoStatus.x * Config.puyoImageWidth;
                Player.playerPuyoStatus.top = Player.playerPuyoStatus.y * Config.puyoImageHeight;

                Player.rotateBeforeLeft =
                    Player.playerPuyoStatus.x * Config.puyoImageWidth;

                Player.rotateAfterLeft =
                    (Player.playerPuyoStatus.x + kickX) * Config.puyoImageWidth;

                Player.rotateFromRotation = currentRotation;

                Player.playerPuyoStatus.x += kickX;
                Player.playerPuyoStatus.y += kickY;

                Player.playerPuyoStatus.top = Player.playerPuyoStatus.y * Config.puyoImageHeight;

                Player.groundFrame = 0;

                Player.playerPuyoStatus.dx = ndx;
                Player.playerPuyoStatus.dy = ndy;

                return 'rotating';
            }
        }
        return "playing";
    }

    static movePlayerPuyo(dtSec) {
        let ratio = (frame - Player.actionStartFrame) / Config.playerMoveFrames;
        if (ratio > 1) ratio = 1;

        Player.playerPuyoStatus.left =
            (Player.moveDestination - Player.moveSource) * ratio + Player.moveSource;

        Player.setPlayerPuyoPosition();
        return ratio === 1;
    }

    static rotatePlayerPuyo(dtSec) {
        let ratio = (frame - Player.actionStartFrame) / Config.playerRotateFrames;
        if (ratio > 1) ratio = 1;

        Player.playerPuyoStatus.left =
            (Player.rotateAfterLeft - Player.rotateBeforeLeft) * ratio + Player.rotateBeforeLeft;

        Player.playerPuyoStatus.rotation =
            (Player.rotateFromRotation + ratio * 90) % 360;

        Player.setPlayerPuyoPosition();
        if (ratio === 1) {
        Player.playerPuyoStatus.rotation =
            (Player.rotateFromRotation + 90) % 360; 
        return true;
    }
    return false;
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
