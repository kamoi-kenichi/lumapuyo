document.getElementById("startBtn").addEventListener("click", () => {
    document.querySelector(".logo")?.classList.add("pause");

    const t = document.getElementById("titleScreen");
    t.style.transition = "opacity 260ms ease";
    t.style.opacity = "0";

    setTimeout(() => {
        window.location.href = "game.html";
    }, 260);
});
