document.getElementById("startBtn").addEventListener("click", () => {
    document.querySelector(".logo")?.classList.add("pause");

    const screen = document.getElementById("titleScreen");
    const startBtn = document.getElementById("startBtn");
    const howBtn = document.getElementById("howBtn");

    startBtn.disabled = true;
    howBtn.disabled = true;
    startBtn.style.pointerEvents = "none";
    howBtn.style.pointerEvents = "none";

    screen.classList.add("is-zooming");

    screen.style.transition = "opacity 260ms ease";
    setTimeout(() => {
        screen.style.opacity = "0";
    }, 320);

    setTimeout(() => {
        window.location.href = "game.html";
    }, 620);
});

document.addEventListener("DOMContentLoaded", () => {
    const howBtn = document.getElementById("howBtn");
    const modal = document.getElementById("howModal");

    if (!howBtn || !modal) return;

    const open = () => {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("isModalOpen");
        document.body.style.overflow = "hidden";
    };

    const close = () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("isModalOpen");
        document.body.style.overflow = "";
    };

    howBtn.addEventListener("click", open);

    modal.addEventListener("click", (e) => {
        if (e.target.matches("[data-close]")) close();
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
});

document.getElementById("startBtn").addEventListener("click", () => {
    document.querySelector(".logo")?.classList.add("pause");

    const t = document.getElementById("titleScreen");
    t.classList.add("is-leaving");

    setTimeout(() => {
        window.location.href = "game.html";
    }, 420);
});
