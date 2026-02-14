class Score {
    static value = 0;
    static digitTpl = [];
    static container = null;

    static initialize() {
        
        for (let i = 0; i <= 9; i++) {
            const img = document.getElementById(`num_${i}`);
            img.removeAttribute("id");
            img.style.position = "relative";
            Score.digitTpl[i] = img;
        }

        Score.container = document.createElement("div");
        Score.container.className = "score";
        Stage.stageElement.appendChild(Score.container);

        Score.set(0);
    }

    static set(v) {
        Score.value = Math.max(0, Math.floor(v));
        Score.render();
    }

    static add(delta) {
        Score.set(Score.value + delta);
    }

    static render() {
        Score.container.innerHTML = "";

        const str = String(Score.value).padStart(8, "0"); 
        for (const ch of str) {
            const d = ch.charCodeAt(0) - 48;
            const img = Score.digitTpl[d].cloneNode(true);
            img.style.width = "24px";   
            img.style.height = "32px";
            Score.container.appendChild(img);
        }
    }
}
