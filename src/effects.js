class Effects {
    static showChain(chainCount, x = null, y = null) {
        const layer = document.getElementById("uiLayer");
        if (!layer) return;

        const el = document.createElement("div");
        el.className = "chainPop";
        el.innerHTML = `${chainCount} CHAIN<small>連鎖！</small>`;

        if (x != null && y != null) {
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            el.style.transform = "translate(-50%, -50%)";
        }

        layer.appendChild(el);
        el.addEventListener("animationend", () => el.remove(), { once: true });
    }
}
class Sound {
    static unlocked = false;
    static pool = new Map();

    static unlock() {

        this.unlocked = true;
    }

    static preload(name, url, voices = 4) {
        const arr = [];
        for (let i = 0; i < voices; i++) {
            const a = new Audio(url);
            a.preload = "auto";
            arr.push(a);
        }
        this.pool.set(name, { arr, idx: 0 });
    }

    static play(name, volume = 0.8) {
        if (!this.unlocked) return;
        const p = this.pool.get(name);
        if (!p) return;

        const a = p.arr[p.idx];
        p.idx = (p.idx + 1) % p.arr.length;

        a.currentTime = 0;
        a.volume = volume;
        a.play().catch(() => { });
    }

    static playChain(chainCount) {
        const n = Math.min(chainCount, 5);
        this.play(`chain${n}`, 0.85);
    }
}